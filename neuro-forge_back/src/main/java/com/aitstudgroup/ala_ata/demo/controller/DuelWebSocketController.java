package com.aitstudgroup.ala_ata.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.DestinationVariable;

import com.aitstudgroup.ala_ata.demo.service.MatchService;
import com.aitstudgroup.ala_ata.demo.service.PlayerService;
import com.aitstudgroup.ala_ata.demo.service.TranslationBattleService;
import com.aitstudgroup.ala_ata.demo.service.OptimizationRallyService;
import com.aitstudgroup.ala_ata.demo.payload.TranslationSubmissionPayload;
import com.aitstudgroup.ala_ata.demo.payload.OptimizationSubmissionPayload;
import com.aitstudgroup.ala_ata.demo.model.Match;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Controller
public class DuelWebSocketController {

    private static final Logger logger = LoggerFactory.getLogger(DuelWebSocketController.class);
    private final SimpMessagingTemplate messagingTemplate;
    private final MatchService matchService;
    private final PlayerService playerService;
    private final TranslationBattleService translationBattleService;
    private final OptimizationRallyService optimizationRallyService;

    @Autowired
    public DuelWebSocketController(SimpMessagingTemplate messagingTemplate,
                                 MatchService matchService,
                                 PlayerService playerService,
                                 TranslationBattleService translationBattleService,
                                 OptimizationRallyService optimizationRallyService) {
        this.messagingTemplate = messagingTemplate;
        this.matchService = matchService;
        this.playerService = playerService;
        this.translationBattleService = translationBattleService;
        this.optimizationRallyService = optimizationRallyService;
    }

    @MessageMapping("/duel/{matchId}/join")
    public void handleJoin(@DestinationVariable Long matchId, @Payload String userId) {
        logger.info("Player {} joining duel {}", userId, matchId);
        messagingTemplate.convertAndSend("/topic/duel/" + matchId, "User " + userId + " joined.");
    }
    
/* // Commenting out TranslationBattle endpoints for now to resolve linter errors and focus on OptimizationRally
    @MessageMapping("/duel/{matchId}/translation/start")
    public void handleTranslationBattleStart(@DestinationVariable Long matchId, @Payload TranslationSubmissionPayload payload) { // Assuming UserIdPayload or similar
        logger.info("Received start request for Translation Battle in match {}: by user {}", matchId, payload.getUserId());
         translationBattleService.startGame(matchId, payload.getUserId())
            .subscribe(
                updatedState -> logger.debug("Translation Battle started for match {}, new state: {}", matchId, updatedState.getGameState()),
                error -> logger.error("Error starting Translation Battle for match " + matchId + ": " + error.getMessage(), error)
            );
    }

    @MessageMapping("/duel/{matchId}/translation/submit")
    public void handleTranslationSubmission(@DestinationVariable Long matchId, @Payload TranslationSubmissionPayload payload) {
        logger.info("Received translation submission for match {}: {}", matchId, payload);
        translationBattleService.submitTranslation(
            matchId, 
            payload.getUserId(), 
            payload.getTranslation(), 
            payload.getRound()
        ).subscribe(
            updatedState -> logger.debug("Translation submission processed for match {}, new state: {}", matchId, updatedState.getGameState()),
            error -> logger.error("Error processing translation submission for match " + matchId + ": " + error.getMessage(), error)
        );
    }
*/

    // Endpoint for Optimization Rally code submission
    @MessageMapping("/duel/{matchId}/optimization/submit")
    public void handleOptimizationSubmission(@DestinationVariable Long matchId, @Payload OptimizationSubmissionPayload payload) {
        logger.info("Received optimization submission for match {}: {}", matchId, payload);
        try {
            optimizationRallyService.handlePlayerCodeSubmission(
                matchId, 
                payload.getUserId(), 
                payload.getCode(), 
                payload.getStep()
            )
            .subscribe(
                updatedState -> logger.debug("Optimization submission processed for match {}, new state: {}", matchId, updatedState.getGameStatus()),
                error -> logger.error("Error processing optimization submission for match " + matchId + ": " + error.getMessage(), error)
            );
        } catch (Exception e) {
            logger.error("Immediate error handling optimization submission for match {} in controller: {}", matchId, e.getMessage(), e);
            // Optionally send an error message back to the specific user if possible and desired
            // messagingTemplate.convertAndSendToUser(userPrincipal.getName(), "/queue/errors", "Error processing your submission.");
        }
    }

    /**
     * Broadcasts general match updates to all subscribers of a specific duel topic.
     * This could be used for player joins, score updates, or match end notifications.
     * The 'update' object should be serializable to JSON.
     * @param matchId The ID of the duel.
     * @param update The update object to send (e.g., updated Match DTO, score info, status message).
     */
    public void sendDuelUpdate(Long matchId, Object update) {
        if (matchId == null || update == null) {
            logger.warn("sendDuelUpdate called with null matchId or update. Skipping.");
            return;
        }
        logger.info("Broadcasting update for duel {}: {}", matchId, update);
        messagingTemplate.convertAndSend("/topic/duel/" + matchId, update);
    }
} 