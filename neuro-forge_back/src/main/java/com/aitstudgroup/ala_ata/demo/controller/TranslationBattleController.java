package com.aitstudgroup.ala_ata.demo.controller;

import com.aitstudgroup.ala_ata.demo.payload.PlayerActionPayload;
import com.aitstudgroup.ala_ata.demo.payload.TranslationSubmissionPayload;
import com.aitstudgroup.ala_ata.demo.payload.GameStatePayload;
import com.aitstudgroup.ala_ata.demo.service.TranslationBattleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import reactor.core.scheduler.Schedulers;

@Controller
public class TranslationBattleController {

    private static final Logger logger = LoggerFactory.getLogger(TranslationBattleController.class);
    private final TranslationBattleService translationBattleService;
    private final SimpMessagingTemplate messagingTemplate;

    public TranslationBattleController(TranslationBattleService translationBattleService, SimpMessagingTemplate messagingTemplate) {
        this.translationBattleService = translationBattleService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/duel/{matchId}/translation/start")
    public void handleGameStart(@DestinationVariable Long matchId, @Payload PlayerActionPayload payload) {
        logger.info("Received start game request for matchId: {} from userId: {}", matchId, payload.getUserId());
        translationBattleService.handlePlayerStartAction(matchId, payload.getUserId())
            .publishOn(Schedulers.boundedElastic()) // Ensure DB operations don't block message handling thread
            .subscribe(gameState -> {
                logger.info("Broadcasting game state after player start for match {}: {}", matchId, gameState.getGameState());
                messagingTemplate.convertAndSend("/topic/duel/" + matchId + "/translation/state", gameState);
            }, error -> {
                logger.error("Error handling game start for match {}: {}", matchId, error.getMessage());
                // Optionally send an error message back to the specific user or topic
            });
    }

    @MessageMapping("/duel/{matchId}/translation/submit")
    public void handleSubmitTranslation(@DestinationVariable Long matchId, @Payload TranslationSubmissionPayload payload) {
        logger.info("Received translation submission for matchId: {} from userId: {}, round: {}, translation: {}", 
                matchId, payload.getUserId(), payload.getRound(), payload.getTranslation());
        translationBattleService.processPlayerTranslation(matchId, payload.getUserId(), payload.getTranslation(), payload.getRound())
            .publishOn(Schedulers.boundedElastic())
            .subscribe(gameState -> {
                logger.info("Broadcasting game state after translation submission for match {}: {}", matchId, gameState.getGameState());
                messagingTemplate.convertAndSend("/topic/duel/" + matchId + "/translation/state", gameState);
            }, error -> {
                logger.error("Error handling translation submission for match {}: {}", matchId, error.getMessage());
            });
    }
} 