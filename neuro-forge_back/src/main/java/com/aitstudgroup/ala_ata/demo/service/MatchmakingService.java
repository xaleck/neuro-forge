package com.aitstudgroup.ala_ata.demo.service;

import com.aitstudgroup.ala_ata.demo.model.MatchmakingQueueEntry;
import com.aitstudgroup.ala_ata.demo.model.Player;
import com.aitstudgroup.ala_ata.demo.model.AIModel;
import com.aitstudgroup.ala_ata.demo.model.Match;
import com.aitstudgroup.ala_ata.demo.repository.MatchmakingQueueRepository;
import com.aitstudgroup.ala_ata.demo.repository.PlayerRepository;
import com.aitstudgroup.ala_ata.demo.repository.AIModelRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Random;

@Service
public class MatchmakingService {
    private static final Logger logger = LoggerFactory.getLogger(MatchmakingService.class);
    private static final int ELO_RANGE_INITIAL = 100; // Initial ELO search range (+/-)
    private static final int ELO_RANGE_EXPANSION_RATE = 50; // How much to expand ELO range per interval
    private static final long MAX_WAIT_SECONDS_FOR_EXPANSION = 30; // Seconds to wait before expanding ELO range
    private static final long QUEUE_TIMEOUT_MINUTES = 5; // Remove player from queue after this many minutes

    private final MatchmakingQueueRepository matchmakingQueueRepository;
    private final PlayerRepository playerRepository;
    private final AIModelRepository aiModelRepository;
    private final MatchService matchService; // To create actual matches
    private final Random random = new Random();
    private final R2dbcEntityTemplate r2dbcEntityTemplate;

    @Autowired
    public MatchmakingService(MatchmakingQueueRepository matchmakingQueueRepository,
                              PlayerRepository playerRepository,
                              AIModelRepository aiModelRepository,
                              MatchService matchService,
                              R2dbcEntityTemplate r2dbcEntityTemplate) {
        this.matchmakingQueueRepository = matchmakingQueueRepository;
        this.playerRepository = playerRepository;
        this.aiModelRepository = aiModelRepository;
        this.matchService = matchService;
        this.r2dbcEntityTemplate = r2dbcEntityTemplate;
    }

    @Transactional
    public Mono<MatchmakingQueueEntry> joinQueue(Long playerId, Long modelId, String matchType) {
        logger.info("[JOIN_QUEUE_START] PlayerId: {}, ModelId: {}, MatchType: {}", playerId, modelId, matchType);

        Mono<Player> playerMono = playerRepository.findById(playerId)
            .doOnSubscribe(s -> logger.info("[JOIN_QUEUE_PLAYER_FETCH] Subscribing to find player by ID: {}", playerId))
            .doOnSuccess(p -> {
                if (p == null) logger.warn("[JOIN_QUEUE_PLAYER_FETCH] Player not found for ID: {}", playerId);
                else logger.info("[JOIN_QUEUE_PLAYER_FETCH] Successfully fetched Player: {}", p.getUsername());
            })
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Player with ID " + playerId + " not found.")));
        
        Mono<AIModel> modelMono = aiModelRepository.findById(modelId)
            .doOnSubscribe(s -> logger.info("[JOIN_QUEUE_MODEL_FETCH] Subscribing to find AIModel by ID: {}", modelId))
            .doOnSuccess(m -> {
                if (m == null) logger.warn("[JOIN_QUEUE_MODEL_FETCH] AIModel not found for ID: {}", modelId);
                else logger.info("[JOIN_QUEUE_MODEL_FETCH] Successfully fetched AIModel: {}", m.getName());
            })
            .switchIfEmpty(Mono.error(new IllegalArgumentException("AIModel with ID " + modelId + " not found.")));

        logger.info("[JOIN_QUEUE_PRE_ZIP] Defined playerMono and modelMono for PlayerId: {}, ModelId: {}", playerId, modelId);

        return Mono.zip(playerMono, modelMono)
            .doOnSubscribe(s -> logger.info("[JOIN_QUEUE_ZIP] Subscribing to zip playerMono and modelMono for PlayerId: {}, ModelId: {}", playerId, modelId))
            .flatMap((Tuple2<Player, AIModel> tuple) -> {
                Player player = tuple.getT1();
                AIModel model = tuple.getT2();
                logger.info("[JOIN_QUEUE_POST_ZIP] Successfully zipped Player: {} (ID: {}), AIModel: {} (ID: {}). Validating model ownership.", 
                            player.getUsername(), player.getId(), model.getName(), model.getId());

                if (!model.getPlayerId().equals(player.getId())) {
                    logger.error("[JOIN_QUEUE_OWNERSHIP_FAIL] Model {} (PlayerId: {}) does not belong to Player {} (ID: {}).", 
                                 model.getName(), model.getPlayerId(), player.getUsername(), player.getId());
                    return Mono.error(new IllegalArgumentException("Model " + modelId + " does not belong to player " + playerId));
                }
                logger.info("[JOIN_QUEUE_OWNERSHIP_SUCCESS] Model {} owned by Player {}. Deployed status: {}", model.getName(), player.getUsername(), model.isDeployed());
                if (!model.isDeployed()) {
                    logger.info("[JOIN_QUEUE_DEPLOY_STATUS] Model {} for player {} is not deployed, but allowing to join queue.", model.getName(), player.getUsername());
                }

                logger.info("[JOIN_QUEUE_QUEUE_CHECK] Checking matchmaking queue for PlayerId: {}", player.getId());
                return matchmakingQueueRepository.findById(player.getId())
                    .doOnSubscribe(s -> logger.info("[JOIN_QUEUE_FIND_EXISTING] Subscribing to find existing queue entry for PlayerId: {}", player.getId()))
                    .flatMap(existingEntry -> {
                        logger.warn("[JOIN_QUEUE_EXISTING_FOUND] PlayerId: {} is ALREADY IN QUEUE (EntryId: {}). Updating entry with ModelId: {}, MatchType: {}.",
                                    player.getId(), existingEntry.getPlayerId(), modelId, matchType);
                        existingEntry.setModelId(modelId);
                        existingEntry.setMatchType(matchType);
                        existingEntry.setEloRating(player.getEloRating());
                        existingEntry.setSearchStartTime(Instant.now());
                        existingEntry.setStatus("SEARCHING");
                        logger.info("[JOIN_QUEUE_UPDATE_SAVE_PRE] Attempting to SAVE updated existing entry for PlayerId: {}", player.getId());
                        return matchmakingQueueRepository.save(existingEntry)
                            .doOnSuccess(savedEntry -> logger.info("[JOIN_QUEUE_UPDATE_SAVE_POST] Successfully SAVED updated entry for PlayerId: {}. New ELO: {}, New ModelId: {}", 
                                                                  savedEntry.getPlayerId(), savedEntry.getEloRating(), savedEntry.getModelId()));
                    })
                    .switchIfEmpty(Mono.<MatchmakingQueueEntry>defer(() -> {
                        logger.info("[JOIN_QUEUE_NEW_ENTRY_PATH] No existing queue entry found for PlayerId: {}. Creating new entry.", player.getId());
                        MatchmakingQueueEntry newEntry = new MatchmakingQueueEntry(
                            player.getId(),
                            model.getId(),
                            matchType,
                            player.getEloRating(),
                            Instant.now(),
                            "SEARCHING"
                        );
                        logger.info("[JOIN_QUEUE_NEW_SAVE_PRE] Attempting to SAVE new entry for PlayerId: {} with ELO: {}, ModelId: {}, MatchType: {}.",
                                    newEntry.getPlayerId(), newEntry.getEloRating(), newEntry.getModelId(), newEntry.getMatchType());
                        return r2dbcEntityTemplate.insert(MatchmakingQueueEntry.class)
                                .into("matchmaking_queue")
                                .using(newEntry);
                    }));
            })
            .doOnError(e -> logger.error("[JOIN_QUEUE_ERROR] Error in joinQueue for PlayerId: {}, ModelId: {}: Message: {}. Cause: {}", 
                                        playerId, modelId, e.getMessage(), e.getCause() != null ? e.getCause().getMessage() : "N/A", e));
    }

    @Transactional
    public Mono<Void> leaveQueue(Long playerId) {
        logger.info("Player {} attempting to leave matchmaking queue.", playerId);
        return matchmakingQueueRepository.deleteById(playerId)
            .doOnSuccess(v -> logger.info("Player {} successfully removed from queue.", playerId))
            .doOnError(e -> logger.error("Error removing player {} from queue: {}", playerId, e.getMessage()));
    }

    @Scheduled(fixedDelay = 5000)
    public void processMatchmakingQueue() {
        logger.debug("Processing matchmaking queue...");
        matchmakingQueueRepository.findByStatus("SEARCHING")
            .filter(entry -> {
                if (entry.getSearchStartTime().plus(QUEUE_TIMEOUT_MINUTES, ChronoUnit.MINUTES).isBefore(Instant.now())) {
                    logger.info("Player {} (ELO {}) timed out from queue for type {}. Removing.", 
                                entry.getPlayerId(), entry.getEloRating(), entry.getMatchType());
                    matchmakingQueueRepository.deleteById(entry.getPlayerId()).subscribe();
                    return false;
                }
                return true;
            })
            .flatMap(this::findAndCreateMatch)
            .subscribe(
                match -> logger.info("Successfully created match {} for players {} and {}.", 
                                   match.getId(), match.getPlayer1Id(), match.getPlayer2Id()),
                error -> logger.error("Error during matchmaking process: {}", error.getMessage(), error),
                () -> logger.debug("Finished processing matchmaking queue cycle.")
            );
    }

    private Mono<Match> findAndCreateMatch(MatchmakingQueueEntry entry1) {
        long secondsWaited = ChronoUnit.SECONDS.between(entry1.getSearchStartTime(), Instant.now());
        int currentEloRange = ELO_RANGE_INITIAL + (int) (secondsWaited / MAX_WAIT_SECONDS_FOR_EXPANSION) * ELO_RANGE_EXPANSION_RATE;
        
        logger.debug("Attempting to find match for player {} (ELO {}), type {}, waited {}s, ELO range {}", 
                     entry1.getPlayerId(), entry1.getEloRating(), entry1.getMatchType(), secondsWaited, currentEloRange);

        return matchmakingQueueRepository
            .findPotentialMatches(entry1.getMatchType(), 
                                  entry1.getEloRating() - currentEloRange, 
                                  entry1.getEloRating() + currentEloRange,
                                  entry1.getPlayerId())
            .next()
            .flatMap(entry2 -> {
                logger.info("Potential match found: Player {} (ELO {}) vs Player {} (ELO {}) for type {}", 
                            entry1.getPlayerId(), entry1.getEloRating(), entry2.getPlayerId(), entry2.getEloRating(), entry1.getMatchType());
                
                return matchmakingQueueRepository.deleteById(entry1.getPlayerId())
                    .then(matchmakingQueueRepository.deleteById(entry2.getPlayerId()))
                    .then(matchService.createMatch(
                        entry1.getPlayerId(), 
                        entry2.getPlayerId(), 
                        entry1.getModelId(), 
                        entry2.getModelId(), 
                        entry1.getMatchType()))
                    .doOnSuccess(match -> logger.info("Match {} created for players {} and {}.", 
                                                    match.getId(), entry1.getPlayerId(), entry2.getPlayerId()))
                    .doOnError(e -> logger.error("Failed to create match for {} and {}: {}", 
                                                 entry1.getPlayerId(), entry2.getPlayerId(), e.getMessage()));
            })
            .switchIfEmpty(Mono.<Match>defer(() -> {
                logger.debug("No suitable opponent found for player {} in this cycle.", entry1.getPlayerId());
                return Mono.empty();
            }));
    }

    @Scheduled(cron = "0 0 * * * ?")
    public void cleanupStaleEntries() {
        Instant timeout = Instant.now().minus(QUEUE_TIMEOUT_MINUTES + 5, ChronoUnit.MINUTES);
        logger.info("Performing hourly cleanup of stale matchmaking entries older than {}.", timeout);
        matchmakingQueueRepository.deleteTimedOutEntries(timeout)
            .subscribe(count -> logger.info("Cleaned up {} stale entries.", count));
    }
} 