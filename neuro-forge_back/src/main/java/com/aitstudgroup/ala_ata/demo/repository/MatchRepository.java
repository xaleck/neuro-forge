package com.aitstudgroup.ala_ata.demo.repository;

import java.time.Instant;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

import com.aitstudgroup.ala_ata.demo.model.Match;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface MatchRepository extends ReactiveCrudRepository<Match, Long> {
    // Найти матчи игрока (где он был участником)
    @Query("SELECT * FROM matches WHERE player1_id = :playerId OR player2_id = :playerId " +
           "ORDER BY started_at DESC LIMIT :limit")
    Flux<Match> findMatchesByPlayerId(Long playerId, Integer limit);
    
    // Найти победы игрока
    Flux<Match> findByWinnerIdOrderByStartedAtDesc(Long playerId);
    
    // Найти незавершенные матчи игрока
    @Query("SELECT * FROM matches WHERE (player1_id = :playerId OR player2_id = :playerId) " +
           "AND ended_at IS NULL ORDER BY started_at DESC")
    Flux<Match> findActiveMatchesByPlayerId(Long playerId);
    
    // Найти матчи по типу
    Flux<Match> findByMatchTypeOrderByStartedAtDesc(String matchType);
    
    // Завершить матч
    @Query("UPDATE matches SET ended_at = :endTime, winner_id = :winnerId, " +
           "player1_score = :player1Score, player2_score = :player2Score " +
           "WHERE id = :matchId AND ended_at IS NULL")
    Mono<Integer> finishMatch(Long matchId, Long winnerId, Integer player1Score, 
                            Integer player2Score, Instant endTime);
    
    // Добавить данные о матче
    @Query("UPDATE matches SET match_data = :matchData WHERE id = :matchId")
    Mono<Integer> updateMatchData(Long matchId, String matchData);
    
    // Статистика побед игрока
    @Query("SELECT COUNT(*) FROM matches WHERE winner_id = :playerId")
    Mono<Long> countWinsByPlayerId(Long playerId);
    
    // Статистика всех матчей игрока
    @Query("SELECT COUNT(*) FROM matches WHERE player1_id = :playerId OR player2_id = :playerId")
    Mono<Long> countMatchesByPlayerId(Long playerId);
}