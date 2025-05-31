package com.aitstudgroup.ala_ata.demo.repository;

import com.aitstudgroup.ala_ata.demo.model.MatchmakingQueueEntry;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.time.Instant;

public interface MatchmakingQueueRepository extends ReactiveCrudRepository<MatchmakingQueueEntry, Long> {

    // Find players in queue for a specific match type, within an ELO range, excluding a specific player
    @Query("SELECT * FROM matchmaking_queue " +
           "WHERE match_type = :matchType " +
           "AND elo_rating BETWEEN :minElo AND :maxElo " +
           "AND status = 'SEARCHING' " +
           "AND player_id != :excludePlayerId " +
           "ORDER BY search_start_time ASC") // Prioritize players waiting longer
    Flux<MatchmakingQueueEntry> findPotentialMatches(String matchType, int minElo, int maxElo, Long excludePlayerId);

    // Find by player ID (as playerId is the @Id)
    Mono<MatchmakingQueueEntry> findByPlayerId(Long playerId);

    // Update status of a queue entry
    @Query("UPDATE matchmaking_queue SET status = :newStatus WHERE player_id = :playerId")
    Mono<Integer> updateStatusByPlayerId(Long playerId, String newStatus);
    
    // Remove players searching for too long (e.g., older than a certain timestamp)
    @Query("DELETE FROM matchmaking_queue WHERE status = 'SEARCHING' AND search_start_time < :timeoutTimestamp")
    Mono<Integer> deleteTimedOutEntries(Instant timeoutTimestamp);

    // Get all entries with a specific status
    Flux<MatchmakingQueueEntry> findByStatus(String status);
} 