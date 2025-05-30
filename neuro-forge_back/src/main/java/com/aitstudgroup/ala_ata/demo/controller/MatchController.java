package com.aitstudgroup.ala_ata.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.aitstudgroup.ala_ata.demo.model.Match;
import com.aitstudgroup.ala_ata.demo.service.MatchService;
import com.aitstudgroup.ala_ata.demo.dto.MatchCreateRequest;
import com.aitstudgroup.ala_ata.demo.dto.MatchFinishRequest;
import com.aitstudgroup.ala_ata.demo.dto.PlayerStatsResponse;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/matches")
@CrossOrigin
public class MatchController {
    private final MatchService matchService;
    
    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }
    
    @PostMapping
    public Mono<ResponseEntity<Match>> createMatch(@RequestBody MatchCreateRequest request) {
        return matchService.createMatch(
                request.getPlayer1Id(), 
                request.getPlayer2Id(), 
                request.getPlayer1ModelId(), 
                request.getPlayer2ModelId(), 
                request.getMatchType()
            )
            .map(match -> ResponseEntity.status(HttpStatus.CREATED).body(match))
            .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }
    
    @GetMapping("/{id}")
    public Mono<ResponseEntity<Match>> getMatchById(@PathVariable Long id) {
        return matchService.getMatchById(id)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/player/{playerId}")
    public Flux<Match> getPlayerMatches(
            @PathVariable Long playerId, 
            @RequestParam(defaultValue = "10") int limit) {
        return matchService.getPlayerMatchHistory(playerId, limit);
    }
    
    @GetMapping("/player/{playerId}/active")
    public Flux<Match> getActiveMatches(@PathVariable Long playerId) {
        return matchService.getActiveMatchesByPlayerId(playerId);
    }
    
    @PatchMapping("/{id}/finish")
    public Mono<ResponseEntity<Match>> finishMatch(
            @PathVariable Long id, 
            @RequestBody MatchFinishRequest request) {
        return matchService.finishMatch(
                id, 
                request.getWinnerId(), 
                request.getPlayer1Score(), 
                request.getPlayer2Score(), 
                request.getMatchData()
            )
            .map(ResponseEntity::ok)
            .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }
    
    @GetMapping("/player/{playerId}/stats")
    public Mono<PlayerStatsResponse> getPlayerStats(@PathVariable Long playerId) {
        return matchService.getPlayerWinRate(playerId)
            .map(winRate -> new PlayerStatsResponse(playerId, winRate));
    }
}