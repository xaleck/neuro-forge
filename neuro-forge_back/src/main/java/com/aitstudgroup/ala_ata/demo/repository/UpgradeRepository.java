package com.aitstudgroup.ala_ata.demo.repository;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;

import com.aitstudgroup.ala_ata.demo.model.Upgrade;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface UpgradeRepository extends R2dbcRepository<Upgrade, Long> {
    
    // Найти все апгрейды игрока
    Flux<Upgrade> findByPlayerId(Long playerId);
    
    // Найти апгрейды по игроку и типу
    Flux<Upgrade> findByPlayerIdAndUpgradeType(Long playerId, String upgradeType);
    
    // Найти завершенные апгрейды по игроку и типу
    Flux<Upgrade> findByPlayerIdAndUpgradeTypeAndIsCompletedTrue(Long playerId, String upgradeType);
    
    // Найти незавершенные апгрейды по игроку и типу
    Flux<Upgrade> findByPlayerIdAndUpgradeTypeAndIsCompletedFalse(Long playerId, String upgradeType);
    
    // Создать начальный апгрейд
    @Query("INSERT INTO upgrade (player_id, upgrade_type, level, is_completed, is_upgrading) " +
           "VALUES (:playerId, :upgradeType, 1, true, false)")
    Mono<Void> createInitialUpgrade(Long playerId, String upgradeType);
    
    // Найти все апгрейды в процессе
    @Query("SELECT * FROM upgrade WHERE is_upgrading = true")
    Flux<Upgrade> findAllUpgradesInProgress();
    
    // Обновить статус апгрейда
    @Query("UPDATE upgrade SET is_upgrading = :isUpgrading, upgrade_finish_time = :finishTime WHERE id = :id")
    Mono<Void> updateUpgradeStatus(Long id, Boolean isUpgrading, java.time.Instant finishTime);
    
    // Завершить апгрейд
    @Query("UPDATE upgrade SET is_completed = true, is_upgrading = false, level = level + 1, upgrade_finish_time = :finishTime WHERE id = :id")
    Mono<Void> completeUpgrade(Long id, java.time.Instant finishTime);
}