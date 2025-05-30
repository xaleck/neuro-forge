package com.aitstudgroup.ala_ata.demo.repository;

import org.springframework.data.r2dbc.repository.Modifying;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

import com.aitstudgroup.ala_ata.demo.model.ResourceWallet;

import reactor.core.publisher.Mono;

public interface ResourceWalletRepository extends ReactiveCrudRepository<ResourceWallet, Long> {
    // Найти кошелек по ID игрока
    Mono<ResourceWallet> findByPlayerId(Long playerId);
    
    // Добавить кредиты (с оптимистичной блокировкой)
    @Modifying
    @Query("UPDATE resource_wallets SET cloud_credits = cloud_credits + :amount, version = version + 1 " +
           "WHERE player_id = :playerId AND version = :currentVersion")
    Mono<Integer> addCredits(Long playerId, Integer amount, Long currentVersion);
    
    // Попытка потратить кредиты (с проверкой достаточности средств)
    @Modifying
    @Query("UPDATE resource_wallets SET cloud_credits = cloud_credits - :amount, version = version + 1 " +
           "WHERE player_id = :playerId AND version = :currentVersion AND cloud_credits >= :amount")
    Mono<Integer> spendCredits(Long playerId, Integer amount, Long currentVersion);
    
    // Аналогичные методы для research_points
    @Modifying
    @Query("UPDATE resource_wallets SET research_points = research_points + :amount, version = version + 1 " +
           "WHERE player_id = :playerId AND version = :currentVersion")
    Mono<Integer> addResearchPoints(Long playerId, Integer amount, Long currentVersion);
    
    @Modifying
    @Query("UPDATE resource_wallets SET research_points = research_points - :amount, version = version + 1 " +
           "WHERE player_id = :playerId AND version = :currentVersion AND research_points >= :amount")
    Mono<Integer> spendResearchPoints(Long playerId, Integer amount, Long currentVersion);
    
    // Создать кошелек для нового игрока 
    @Query("INSERT INTO resource_wallets (player_id, cloud_credits, research_points) VALUES " +
           "(:playerId, :initialCredits, :initialPoints) RETURNING id")
    Mono<Long> createWalletForPlayer(Long playerId, Integer initialCredits, Integer initialPoints);
}