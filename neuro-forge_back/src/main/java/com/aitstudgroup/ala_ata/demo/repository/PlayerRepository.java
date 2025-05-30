package com.aitstudgroup.ala_ata.demo.repository;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

import com.aitstudgroup.ala_ata.demo.model.Player;

import reactor.core.publisher.Mono;

public interface PlayerRepository extends ReactiveCrudRepository<Player, Long> {
    Mono<Player> findByUsername(String username);
    
    @Query("UPDATE players SET elo_rating = elo_rating + :eloChange WHERE id = :playerId")
    Mono<Void> updateEloRating(Long playerId, Integer eloChange);
}