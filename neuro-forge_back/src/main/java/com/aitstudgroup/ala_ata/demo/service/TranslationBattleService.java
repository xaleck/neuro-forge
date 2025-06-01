package com.aitstudgroup.ala_ata.demo.service;

import com.aitstudgroup.ala_ata.demo.model.Match;
import com.aitstudgroup.ala_ata.demo.payload.GameStatePayload;
import com.aitstudgroup.ala_ata.demo.repository.MatchRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TranslationBattleService {

    private static final Logger logger = LoggerFactory.getLogger(TranslationBattleService.class);
    private final MatchRepository matchRepository;
    private final ObjectMapper objectMapper = new ObjectMapper(); // For JSON processing

    // Sample phrases - in a real app, this would come from a database or config file
    private static final List<Map<String, String>> SAMPLE_PHRASES = List.of(
            Map.of("id", "1", "text", "Hello", "sourceLang", "en", "targetLang", "es", "correctAnswer", "Hola"),
            Map.of("id", "2", "text", "Thank you", "sourceLang", "en", "targetLang", "fr", "correctAnswer", "Merci"),
            Map.of("id", "3", "text", "Good morning", "sourceLang", "en", "targetLang", "de", "correctAnswer", "Guten Morgen"),
            Map.of("id", "4", "text", "Goodbye", "sourceLang", "en", "targetLang", "it", "correctAnswer", "Arrivederci"),
            Map.of("id", "5", "text", "Yes", "sourceLang", "en", "targetLang", "ja", "correctAnswer", "はい (Hai)"),
            Map.of("id", "6", "text", "No", "sourceLang", "en", "targetLang", "es", "correctAnswer", "No"),
            Map.of("id", "7", "text", "Please", "sourceLang", "en", "targetLang", "fr", "correctAnswer", "S'il vous plaît"),
            Map.of("id", "8", "text", "Excuse me", "sourceLang", "en", "targetLang", "de", "correctAnswer", "Entschuldigung"),
            Map.of("id", "9", "text", "Water", "sourceLang", "en", "targetLang", "it", "correctAnswer", "Acqua"),
            Map.of("id", "10", "text", "Friend", "sourceLang", "en", "targetLang", "ja", "correctAnswer", "友達 (Tomodachi)")
    );
    private static final int TOTAL_ROUNDS = 10;

    public TranslationBattleService(MatchRepository matchRepository) {
        this.matchRepository = matchRepository;
    }

    public Mono<Match> initializeMatchWithGameState(Match match) {
        if (!"TRANSLATION".equalsIgnoreCase(match.getMatchType())) {
            return Mono.just(match); // Not a translation match, do nothing special initially
        }
        logger.info("Initializing Translation Battle specific data for match ID: {}", match.getId());

        GameStatePayload initialGameState = new GameStatePayload();
        initialGameState.setGameType("TRANSLATION");
        initialGameState.setTotalRounds(TOTAL_ROUNDS);
        initialGameState.setCurrentRound(0); // No round started yet
        // Prepare phrases, ensuring not to exceed available samples
        List<Map<String,String>> gamePhrases = SAMPLE_PHRASES.stream().limit(TOTAL_ROUNDS).collect(Collectors.toList());
        initialGameState.setPhrases(gamePhrases);
        initialGameState.setRoundsData(new ArrayList<>());
        initialGameState.setPlayer1GameScore(0);
        initialGameState.setPlayer2GameScore(0);
        initialGameState.setCurrentPhraseIndex(-1); // No phrase selected yet
        initialGameState.setGameState("NOT_STARTED"); // Initial state before players join/start

        try {
            match.setMatchData(objectMapper.writeValueAsString(initialGameState));
            logger.debug("Match {} initialized with Translation Battle game state: {}", match.getId(), match.getMatchData());
        } catch (JsonProcessingException e) {
            logger.error("Error serializing initial game state for match {}: {}", match.getId(), e.getMessage());
            return Mono.error(e); 
        }
        return Mono.just(match);
    }

    public Mono<GameStatePayload> handlePlayerStartAction(Long matchId, Long userId) {
        logger.info("Player {} attempting to start/join Translation Battle for match ID: {}", userId, matchId);
        return matchRepository.findById(matchId)
            .flatMap(match -> {
                try {
                    GameStatePayload gameState = objectMapper.readValue(match.getMatchData(), GameStatePayload.class);
                    
                    // TODO: Implement logic to track if both players are ready
                    // For now, one player starting moves game to WAITING_FOR_PLAYERS or ROUND_IN_PROGRESS
                    if ("NOT_STARTED".equals(gameState.getGameState())) {
                         gameState.setGameState("WAITING_FOR_PLAYERS"); // First player ready
                    } else if ("WAITING_FOR_PLAYERS".equals(gameState.getGameState())){
                        // Second player ready, start the first round
                        gameState.setGameState("ROUND_IN_PROGRESS");
                        gameState.setCurrentRound(1);
                        gameState.setCurrentPhraseIndex(0);
                        gameState.setRoundStartTime(Instant.now().toString());
                        gameState.setRoundTimeLimit(60); // Example time limit
                    } else {
                        logger.warn("Game for match {} already started or in invalid state: {}", matchId, gameState.getGameState());
                        return Mono.just(gameState); // Or error if unexpected state
                    }

                    match.setMatchData(objectMapper.writeValueAsString(gameState));
                    return matchRepository.save(match).thenReturn(gameState);
                } catch (IOException e) {
                    logger.error("Error processing player start for match {}: {}", matchId, e.getMessage());
                    return Mono.error(e);
                }
            })
            .switchIfEmpty(Mono.error(new RuntimeException("Match not found: " + matchId)));
    }

    public Mono<GameStatePayload> processPlayerTranslation(Long matchId, Long playerId, String translation, int round) {
        logger.info("Player {} submitting translation \"{}\" for round {} in match ID: {}", playerId, translation, round, matchId);
        return matchRepository.findById(matchId)
            .flatMap(match -> {
                try {
                    GameStatePayload gameState = objectMapper.readValue(match.getMatchData(), GameStatePayload.class);

                    if (!"ROUND_IN_PROGRESS".equals(gameState.getGameState()) || round != gameState.getCurrentRound()) {
                        logger.warn("Invalid submission for match {}, round {}, game state {}. Expected round {}.", 
                                    matchId, round, gameState.getGameState(), gameState.getCurrentRound());
                        return Mono.just(gameState); // Or error indicating invalid state/submission
                    }

                    Map<String, String> currentPhrase = gameState.getPhrases().get(gameState.getCurrentPhraseIndex());
                    int score = 0;
                    if (currentPhrase.get("correctAnswer").equalsIgnoreCase(translation.trim())) {
                        score = 100;
                    }

                    // Store or update this player's submission for the current round
                    Map<String, Object> roundEntry = gameState.getRoundsData().stream()
                        .filter(r -> r.get("round").equals(round))
                        .findFirst()
                        .orElseGet(() -> {
                            Map<String, Object> newEntry = new HashMap<>();
                            newEntry.put("round", round);
                            newEntry.put("phraseId", currentPhrase.get("id"));
                            gameState.getRoundsData().add(newEntry);
                            return newEntry;
                        });

                    String playerPrefix = match.getPlayer1Id().equals(playerId) ? "player1" : "player2";
                    roundEntry.put(playerPrefix + "_translation", translation);
                    roundEntry.put(playerPrefix + "_score", score);
                    if (playerPrefix.equals("player1")) {
                         gameState.setPlayer1GameScore(gameState.getPlayer1GameScore() + score);
                    } else {
                         gameState.setPlayer2GameScore(gameState.getPlayer2GameScore() + score);
                    }

                    // Check if both players have submitted for this round
                    boolean player1Submitted = roundEntry.containsKey("player1_score");
                    boolean player2Submitted = roundEntry.containsKey("player2_score");

                    if (player1Submitted && player2Submitted) {
                        // Both players submitted, advance to next round or end game
                        if (gameState.getCurrentRound() < gameState.getTotalRounds()) {
                            gameState.setCurrentRound(gameState.getCurrentRound() + 1);
                            gameState.setCurrentPhraseIndex(gameState.getCurrentPhraseIndex() + 1);
                            gameState.setRoundStartTime(Instant.now().toString());
                            // Reset any round-specific player state if necessary
                        } else {
                            gameState.setGameState("GAME_OVER");
                            // Potentially update overall Match scores and winnerId here
                            updateMatchScoresAndWinner(match, gameState);
                        }
                    }
                    // If only one player submitted, game state remains ROUND_IN_PROGRESS, waiting for the other.

                    match.setMatchData(objectMapper.writeValueAsString(gameState));
                    return matchRepository.save(match).thenReturn(gameState);
                } catch (IOException e) {
                    logger.error("Error processing player translation for match {}: {}", matchId, e.getMessage());
                    return Mono.error(e);
                }
            })
            .switchIfEmpty(Mono.error(new RuntimeException("Match not found: " + matchId)));
    }
    
    private void updateMatchScoresAndWinner(Match match, GameStatePayload gameState) {
        // This is where you'd update the main Match object's scores if they represent the game outcome
        // For now, we assume player1GameScore and player2GameScore are the final scores for this minigame
        match.setPlayer1Score(gameState.getPlayer1GameScore());
        match.setPlayer2Score(gameState.getPlayer2GameScore());
        if (gameState.getPlayer1GameScore() > gameState.getPlayer2GameScore()) {
            match.setWinnerId(match.getPlayer1Id());
        } else if (gameState.getPlayer2GameScore() > gameState.getPlayer1GameScore()) {
            match.setWinnerId(match.getPlayer2Id());
        } else {
            match.setWinnerId(null); // Draw
        }
        match.setEndedAt(Instant.now());
        logger.info("Game over for match {}. P1 Score: {}, P2 Score: {}, Winner ID: {}", 
            match.getId(), match.getPlayer1Score(), match.getPlayer2Score(), match.getWinnerId());
    }
} 