package com.aitstudgroup.ala_ata.demo.controller;
import java.util.Date;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aitstudgroup.ala_ata.demo.dto.SpeedUpRequest;
import com.aitstudgroup.ala_ata.demo.dto.UpgradeRequest;
import com.aitstudgroup.ala_ata.demo.model.Upgrade;
import com.aitstudgroup.ala_ata.demo.service.UpgradeService;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/upgrades")
@CrossOrigin
public class UpgradeController {
    
    private static final Logger logger = LoggerFactory.getLogger(UpgradeController.class);
    
    @Autowired
    private UpgradeService upgradeService;

    @PostMapping("/start")
    public Mono<ResponseEntity<Upgrade>> startUpgrade(@RequestBody UpgradeRequest upgradeRequest) {
        logger.info("<<<<< UPGRADE_CONTROLLER: /start endpoint HIT! Processing request... >>>>>");
        
        if (upgradeRequest == null) {
            logger.warn("<<<<< UPGRADE_CONTROLLER: Received NULL upgrade request! >>>>>");
            return Mono.just(ResponseEntity.badRequest().build());
        }
        
        if (upgradeRequest.getPlayerId() == null || upgradeRequest.getUpgradeType() == null) {
            logger.warn("<<<<< UPGRADE_CONTROLLER: Received invalid upgrade request. Player ID: {}, Type: {} >>>>>", 
                upgradeRequest.getPlayerId(), upgradeRequest.getUpgradeType());
            return Mono.just(ResponseEntity.badRequest().build());
        }

        logger.info("<<<<< UPGRADE_CONTROLLER: Processing request for Player ID: {}, Type: {} >>>>>",
                upgradeRequest.getPlayerId(), upgradeRequest.getUpgradeType());

        return upgradeService.startNewUpgrade(upgradeRequest.getPlayerId(), upgradeRequest.getUpgradeType())
            .map(startedUpgrade -> {
                logger.info("<<<<< UPGRADE_CONTROLLER: SUCCESS! Upgrade started with ID: {} for Player: {} >>>>>", 
                    startedUpgrade.getId(), upgradeRequest.getPlayerId());
                return ResponseEntity.status(HttpStatus.CREATED).body(startedUpgrade);
            })
            .doOnError(error -> {
                logger.error("<<<<< UPGRADE_CONTROLLER: ERROR occurred for Player ID: {}, Type: {}. Error: {} >>>>>",
                        upgradeRequest.getPlayerId(), upgradeRequest.getUpgradeType(), error.getMessage(), error);
            })
            .onErrorResume(IllegalArgumentException.class, e -> {
                logger.warn("<<<<< UPGRADE_CONTROLLER: Handling IllegalArgumentException: {} >>>>>", e.getMessage());
                return Mono.just(ResponseEntity.badRequest().body(null));
            })
            .onErrorResume(IllegalStateException.class, e -> {
                logger.warn("<<<<< UPGRADE_CONTROLLER: Handling IllegalStateException: {} >>>>>", e.getMessage());
                return Mono.just(ResponseEntity.status(HttpStatus.CONFLICT).body(null));
            })
            .onErrorResume(Exception.class, e -> {
                logger.error("<<<<< UPGRADE_CONTROLLER: Unhandled Exception: {} >>>>>", e.getMessage(), e);
                return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null));
            });
    }

    @PutMapping("/speedup")
    public Mono<ResponseEntity<Object>> speedUpUpgrade(@RequestBody SpeedUpRequest request) {
        logger.info("<<<<< UPGRADE_CONTROLLER: /speedup endpoint HIT! Processing request... >>>>>");
        logger.info("<<<<< UPGRADE_CONTROLLER: Processing speedup request for Player ID: {}, Type: {}, Minutes: {} >>>>>",
                request.getPlayerId(), request.getUpgradeType(), request.getMinutesToReduce());

        if (upgradeService == null) {
            logger.error("<<<<< UPGRADE_CONTROLLER: UpgradeService is NULL! Dependency Injection failed. >>>>>");
            return Mono.just(ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Сервис не доступен (UpgradeService is null)",
                    "timestamp", new Date(),
                    "status", 500)));
        }

        return upgradeService.speedUpUpgrade(
                request.getPlayerId(),
                request.getUpgradeType(),
                request.getMinutesToReduce()
            )
            .map(upgrade -> {
                logger.info("<<<<< UPGRADE_CONTROLLER: SUCCESS! Upgrade speed up completed for ID: {} Player: {} >>>>>",
                        upgrade.getId(), upgrade.getPlayerId());
                return ResponseEntity.ok((Object) upgrade); 
            })
            .onErrorResume(e -> {
                logger.error("<<<<< UPGRADE_CONTROLLER: Error during speedup for Player ID: {}, Type: {}. Error: {} >>>>>", 
                    request.getPlayerId(), request.getUpgradeType(), e.getMessage());
                
                if (e instanceof IllegalArgumentException) {
                    return Mono.just(ResponseEntity
                        .badRequest()
                        .body(Map.of(
                            "error", e.getMessage(),
                            "timestamp", new Date(),
                            "status", HttpStatus.BAD_REQUEST.value())));
                } else if (e instanceof IllegalStateException) {
                    return Mono.just(ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(Map.of(
                            "error", e.getMessage(),
                            "timestamp", new Date(),
                            "status", HttpStatus.CONFLICT.value())));
                } else {
                    return Mono.just(ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of(
                            "error", "Internal server error while speeding up the improvement.",
                            "message", e.getMessage(),
                            "timestamp", new Date(),
                            "status", HttpStatus.INTERNAL_SERVER_ERROR.value())));
                }
            });
    }

    @GetMapping("/player/{playerId}")
    public Flux<Upgrade> getPlayerUpgrades(@PathVariable Long playerId) {
        logger.info("<<<<< UPGRADE_CONTROLLER: Getting upgrades for player ID: {} >>>>>", playerId);
        return upgradeService.getUpgradesByPlayerId(playerId)
            .doOnNext(upgrade -> logger.debug("<<<<< UPGRADE_CONTROLLER: Found upgrade ID: {} for player: {} >>>>>", 
                upgrade.getId(), playerId))
            .doOnError(error -> logger.error("<<<<< UPGRADE_CONTROLLER: Error getting upgrades for player {}: {} >>>>>", 
                playerId, error.getMessage()))
            .doOnComplete(() -> logger.info("<<<<< UPGRADE_CONTROLLER: Completed getting upgrades for player: {} >>>>>", playerId));
    }

    @GetMapping("/{playerId}/{upgradeType}")
    public Mono<ResponseEntity<Upgrade>> getUpgradeByType(
            @PathVariable Long playerId, 
            @PathVariable String upgradeType) {
        return upgradeService.getUpgradeByType(playerId, upgradeType)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}