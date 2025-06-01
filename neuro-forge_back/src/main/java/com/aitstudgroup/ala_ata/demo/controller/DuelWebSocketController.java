package com.aitstudgroup.ala_ata.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
// import org.springframework.messaging.handler.annotation.MessageMapping; // If you need to receive messages from clients
// import org.springframework.messaging.handler.annotation.Payload; // If you need to receive messages from clients

@Controller
public class DuelWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public DuelWebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Sends a generic duel update to all subscribers of a specific match's topic.
     * @param matchId The ID of the match.
     * @param update The update object (e.g., current game state, scores, etc.).
     */
    public void sendDuelUpdate(Long matchId, Object update) {
        if (matchId == null) {
            System.err.println("Attempted to send duel update with null matchId.");
            return;
        }
        messagingTemplate.convertAndSend("/topic/duel/" + matchId, update);
    }

    /**
     * Sends a player-specific update to a user's private queue.
     * Useful for private notifications, error messages, or personalized game state.
     * The user must be subscribed to '/user/queue/duel-updates'.
     * @param playerId The ID of the player (used as the user in SimpMessagingTemplate).
     * @param update The update object.
     */
    public void sendPlayerSpecificUpdate(String playerId, Object update) {
        if (playerId == null || playerId.trim().isEmpty()) {
            System.err.println("Attempted to send player specific update with null or empty playerId.");
            return;
        }
        messagingTemplate.convertAndSendToUser(playerId, "/queue/duel-updates", update);
    }

    // Example of how you might handle incoming messages if clients need to send data via WebSocket
    /*
    @MessageMapping("/duel/{matchId}/move") // Clients would send to /app/duel/{matchId}/move
    public void handlePlayerMove(@Payload String movePayload, @DestinationVariable String matchId) {
        // Process the move
        // Potentially send updates back via sendDuelUpdate or sendPlayerSpecificUpdate
        System.out.println("Received move for match " + matchId + ": " + movePayload);
        // Example: sendDuelUpdate(Long.valueOf(matchId), "Move processed: " + movePayload);
    }
    */
} 