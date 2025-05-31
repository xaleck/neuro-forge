package com.aitstudgroup.ala_ata.demo.controller;

import com.aitstudgroup.ala_ata.demo.dto.MatchmakingRequest;
import com.aitstudgroup.ala_ata.demo.dto.LeaveQueueRequest;
import com.aitstudgroup.ala_ata.demo.model.MatchmakingQueueEntry;
import com.aitstudgroup.ala_ata.demo.service.MatchmakingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
// import org.springframework.security.oauth2.jwt.Jwt; // If you need to access Jwt details directly
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.security.Principal; // Standard Principal

@RestController
@RequestMapping("/api/matchmaking")
@CrossOrigin // Consider more specific CORS configuration for production
public class MatchmakingController {
    private static final Logger logger = LoggerFactory.getLogger(MatchmakingController.class);
    private final MatchmakingService matchmakingService;

    @Autowired
    public MatchmakingController(MatchmakingService matchmakingService) {
        this.matchmakingService = matchmakingService;
    }

    // Endpoint for a player to join the matchmaking queue
    @PostMapping("/join")
    public Mono<ResponseEntity<MatchmakingQueueEntry>> joinQueue(
            @RequestBody MatchmakingRequest request) {
        Long playerId = request.getPlayerId();
        if (playerId == null) {
            logger.warn("Player ID missing in join request.");
            return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST).build());
        }
        
        logger.info("Player {} requesting to join queue with model {} for type {}", playerId, request.getModelId(), request.getMatchType());
        
        return matchmakingService.joinQueue(playerId, request.getModelId(), request.getMatchType())
            .map(entry -> ResponseEntity.status(HttpStatus.OK).body(entry))
            .onErrorResume(IllegalArgumentException.class, e -> {
                logger.warn("Failed to join queue for player {}: {}", playerId, e.getMessage());
                return Mono.just(ResponseEntity.badRequest().build());
            })
            .switchIfEmpty(Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()));
    }

    // Endpoint for a player to leave the matchmaking queue
    @PostMapping("/leave")
    public Mono<ResponseEntity<Void>> leaveQueue(@RequestBody LeaveQueueRequest request) {
        Long playerId = request.getPlayerId();
        if (playerId == null) {
            logger.warn("Player ID missing in leave request.");
            return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST).build());
        }

        logger.info("Player {} requesting to leave queue", playerId);
        return matchmakingService.leaveQueue(playerId)
            .thenReturn(ResponseEntity.ok().<Void>build())
            .onErrorResume(e -> {
                logger.error("Error leaving queue for player {}: {}", playerId, e.getMessage());
                return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
            });
    }

    // Note: Real-time status updates (e.g., "match found") are better handled via WebSockets.
    // A simple GET endpoint for queue status might be less useful for a dynamic system.
    // For now, we will rely on the scheduled service to attempt matches.
} 