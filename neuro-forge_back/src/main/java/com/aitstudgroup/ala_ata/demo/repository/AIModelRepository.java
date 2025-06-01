package com.aitstudgroup.ala_ata.demo.repository;

import java.time.Instant;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

import com.aitstudgroup.ala_ata.demo.model.AIModel;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface AIModelRepository extends ReactiveCrudRepository<AIModel, Long> {
    // Найти все модели игрока
    Flux<AIModel> findByPlayerId(Long playerId);
    
    // Обновить показатель популярности модели
    @Query("UPDATE ai_models SET popularity_score = popularity_score + :delta WHERE id = :modelId")
    Mono<Void> updatePopularityScore(Long modelId, Integer delta);
}