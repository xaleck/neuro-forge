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
    
    // Найти все развернутые модели игрока
    Flux<AIModel> findByPlayerIdAndIsDeployedTrue(Long playerId);
    
    // Найти все развернутые модели (для пассивного дохода)
    Flux<AIModel> findByIsDeployedTrue();
    
    // Обновить показатель популярности модели
    @Query("UPDATE ai_models SET popularity_score = popularity_score + :delta WHERE id = :modelId")
    Mono<Void> updatePopularityScore(Long modelId, Integer delta);
    
    // Обновить показатель кредитов в минуту
    @Query("UPDATE ai_models SET credits_per_minute = :creditsPerMinute WHERE id = :modelId")
    Mono<Void> updateCreditsPerMinute(Long modelId, Integer creditsPerMinute);
    
    // Развернуть/снять модель
    @Query("UPDATE ai_models SET is_deployed = :deployed WHERE id = :modelId AND player_id = :playerId")
    Mono<Integer> setModelDeploymentStatus(Long modelId, Long playerId, boolean deployed);
    
    // Найти топ моделей по доходности
    @Query("SELECT * FROM ai_models WHERE is_deployed = true ORDER BY credits_per_minute DESC LIMIT :limit")
    Flux<AIModel> findTopModelsByCreditsPerMinute(Integer limit);

    // Обновить статус развертывания модели
    @Query("UPDATE ai_model SET deployed = :deployed, last_updated_at = :lastUpdatedAt WHERE id = :id")
    Mono<Void> updateDeploymentStatus(Long id, boolean deployed, Instant lastUpdatedAt);
}