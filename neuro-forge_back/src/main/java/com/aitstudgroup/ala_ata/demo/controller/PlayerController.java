package com.aitstudgroup.ala_ata.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aitstudgroup.ala_ata.demo.dto.LoginRequest;
import com.aitstudgroup.ala_ata.demo.dto.PlayerResponse;
import com.aitstudgroup.ala_ata.demo.dto.RegisterRequest;
import com.aitstudgroup.ala_ata.demo.model.Player;
import com.aitstudgroup.ala_ata.demo.service.PlayerService;

import jakarta.validation.Valid;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/players")
@CrossOrigin
public class PlayerController {
    private final PlayerService playerService;
    
    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }
    
    @PostMapping("/register")
    public Mono<ResponseEntity<PlayerResponse>> registerPlayer(@Valid @RequestBody RegisterRequest request) {
        return playerService.registerPlayer(request.getUsername(), request.getEmail(), request.getPassword())
            .map(player -> {
                PlayerResponse response = convertToPlayerResponse(player);
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            })
            .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new PlayerResponse(null, e.getMessage()))));
    }
    
    @PostMapping("/login")
    public Mono<ResponseEntity<PlayerResponse>> login(@RequestBody LoginRequest request) {
        return playerService.authenticatePlayer(request.getUsername(), request.getPassword())
            .map(player -> ResponseEntity.ok(convertToPlayerResponse(player)))
            .defaultIfEmpty(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new PlayerResponse(null, "Неверные учетные данные")));
    }
    
    @GetMapping("/{id}")
    public Mono<ResponseEntity<PlayerResponse>> getPlayerById(@PathVariable Long id) {
        return playerService.getPlayerById(id)
            .map(player -> ResponseEntity.ok(convertToPlayerResponse(player)))
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/leaderboard")
    public Flux<PlayerResponse> getLeaderboard(@RequestParam(defaultValue = "20") int limit) {
        return playerService.getTopPlayersByElo(limit)
            .map(this::convertToPlayerResponse);
    }
    
    private PlayerResponse convertToPlayerResponse(Player player) {
        // Скрываем пароль и другие чувствительные данные
        PlayerResponse response = new PlayerResponse(player, null);
        return response;
    }
}