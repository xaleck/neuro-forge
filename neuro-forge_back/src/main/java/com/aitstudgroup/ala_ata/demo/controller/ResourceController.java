package com.aitstudgroup.ala_ata.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.aitstudgroup.ala_ata.demo.model.ResourceWallet;
import com.aitstudgroup.ala_ata.demo.service.ResourceService;
import com.aitstudgroup.ala_ata.demo.dto.ResourceRequest;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin
public class ResourceController {
    private final ResourceService resourceService;
    
    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }
    
    @GetMapping("/{playerId}")
    public Mono<ResponseEntity<ResourceWallet>> getWallet(@PathVariable Long playerId) {
        return resourceService.getWalletByPlayerId(playerId)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/{playerId}/credits")
    public Mono<ResponseEntity<ResourceWallet>> addCredits(
            @PathVariable Long playerId, 
            @RequestBody ResourceRequest request) {
        return resourceService.addCredits(playerId, request.getAmount())
            .map(ResponseEntity::ok)
            .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }
    
    @PostMapping("/{playerId}/spend-credits")
    public Mono<ResponseEntity<Boolean>> spendCredits(
            @PathVariable Long playerId, 
            @RequestBody ResourceRequest request) {
        return resourceService.spendCredits(playerId, request.getAmount())
            .map(success -> {
                if (success) {
                    return ResponseEntity.ok(true);
                } else {
                    return ResponseEntity.badRequest().body(false);
                }
            });
    }
    
    @PostMapping("/{playerId}/research-points")
    public Mono<ResponseEntity<ResourceWallet>> addResearchPoints(
            @PathVariable Long playerId, 
            @RequestBody ResourceRequest request) {
        return resourceService.addResearchPoints(playerId, request.getAmount())
            .map(ResponseEntity::ok)
            .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }
    
    @PostMapping("/{playerId}/spend-research")
    public Mono<ResponseEntity<Boolean>> spendResearchPoints(
            @PathVariable Long playerId, 
            @RequestBody ResourceRequest request) {
        return resourceService.spendResearchPoints(playerId, request.getAmount())
            .map(success -> {
                if (success) {
                    return ResponseEntity.ok(true);
                } else {
                    return ResponseEntity.badRequest().body(false);
                }
            });
    }
}