package com.aitstudgroup.ala_ata.demo.service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aitstudgroup.ala_ata.demo.model.Upgrade;
import com.aitstudgroup.ala_ata.demo.repository.PlayerRepository;
import com.aitstudgroup.ala_ata.demo.repository.UpgradeRepository;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class UpgradeService {
    private static final Logger logger = LoggerFactory.getLogger(UpgradeService.class);
    
    private final UpgradeRepository upgradeRepository;
    private final PlayerRepository playerRepository;
    private final ResourceService resourceService;
    
    // Стоимость апгрейда в зависимости от уровня и типа
    private static final Map<String, int[]> UPGRADE_COSTS = new ConcurrentHashMap<>();
    
    // Время апгрейда в минутах в зависимости от уровня и типа
    private static final Map<String, int[]> UPGRADE_TIMES = new ConcurrentHashMap<>();
    
    // Инициализация констант
    static {
        // Стоимость апгрейдов DATA_CENTER: [уровень 1->2, уровень 2->3, ...]
        UPGRADE_COSTS.put("DATA_CENTER", new int[]{500, 1000, 2000, 4000, 8000});
        // Стоимость апгрейдов DATASETS
        UPGRADE_COSTS.put("DATASETS", new int[]{400, 800, 1600, 3200, 6400});
        // Стоимость апгрейдов TALENT
        UPGRADE_COSTS.put("TALENT", new int[]{600, 1200, 2400, 4800, 9600});
        
        // Время апгрейдов DATA_CENTER в минутах: [уровень 1->2, уровень 2->3, ...]
        UPGRADE_TIMES.put("DATA_CENTER", new int[]{5, 15, 60, 180, 360});
        // Время апгрейдов DATASETS в минутах
        UPGRADE_TIMES.put("DATASETS", new int[]{3, 10, 45, 120, 300});
        // Время апгрейдов TALENT в минутах  
        UPGRADE_TIMES.put("TALENT", new int[]{7, 20, 90, 240, 480});
    }

    @Autowired
    public UpgradeService(UpgradeRepository upgradeRepository, PlayerRepository playerRepository, ResourceService resourceService) {
        this.upgradeRepository = upgradeRepository;
        this.playerRepository = playerRepository;
        this.resourceService = resourceService;
        logger.info("UpgradeService initialized with repositories and ResourceService.");
    }

    // Получить все апгрейды игрока
    public Flux<Upgrade> getPlayerUpgrades(Long playerId) {
        return playerRepository.findById(playerId)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Игрок с ID " + playerId + " не найден")))
            .flatMapMany(player -> upgradeRepository.findByPlayerId(playerId)
                .switchIfEmpty(
                    // Если у игрока нет апгрейдов, создаем базовые
                    createInitialUpgrades(playerId).thenMany(upgradeRepository.findByPlayerId(playerId))
                )
            );
    }
    
    // Создать начальные апгрейды для нового игрока
    private Mono<Void> createInitialUpgrades(Long playerId) {
        logger.debug("Создание начальных апгрейдов для игрока {}", playerId);
        
        return Mono.when(
            upgradeRepository.createInitialUpgrade(playerId, "DATA_CENTER"),
            upgradeRepository.createInitialUpgrade(playerId, "DATASETS"),
            upgradeRepository.createInitialUpgrade(playerId, "TALENT")
        );
    }
    
    // Получить апгрейд по типу
    public Mono<Upgrade> getUpgradeByType(Long playerId, String upgradeType) {
        if (!UPGRADE_COSTS.containsKey(upgradeType)) {
            return Mono.error(new IllegalArgumentException("Неизвестный тип апгрейда: " + upgradeType));
        }
        
        return upgradeRepository.findByPlayerIdAndUpgradeType(playerId, upgradeType)
            .collectList()
            .flatMap(upgrades -> {
                if (upgrades.isEmpty()) {
                    // Если апгрейда нет, создаем его
                    return upgradeRepository.createInitialUpgrade(playerId, upgradeType)
                        .then(upgradeRepository.findByPlayerIdAndUpgradeType(playerId, upgradeType).next());
                } else {
                    return Mono.just(upgrades.get(0)); // Возвращаем первый найденный
                }
            });
    }
    
    // Начать апгрейд
    @Transactional
    public Mono<Upgrade> startUpgrade(Long playerId, String upgradeType) {
        logger.debug("Начало апгрейда {} для игрока {}", upgradeType, playerId);
        
        if (!UPGRADE_COSTS.containsKey(upgradeType)) {
            return Mono.error(new IllegalArgumentException("Неизвестный тип апгрейда: " + upgradeType));
        }
        
        return getUpgradeByType(playerId, upgradeType)
            .flatMap(upgrade -> {
                // Проверяем, не находится ли апгрейд уже в процессе
                if (upgrade.isUpgrading()) {
                    return Mono.error(new IllegalStateException("Апгрейд уже в процессе"));
                }
                
                // Проверяем, не достигнут ли максимальный уровень
                int[] costs = UPGRADE_COSTS.get(upgradeType);
                if (upgrade.getLevel() >= costs.length) {
                    return Mono.error(new IllegalStateException("Достигнут максимальный уровень"));
                }
                
                // Получаем стоимость апгрейда для текущего уровня
                int cost = costs[upgrade.getLevel() - 1];
                
                // Проверяем и списываем средства
                return resourceService.spendCredits(playerId, cost)
                    .flatMap(success -> {
                        if (!success) {
                            return Mono.error(new IllegalStateException("Недостаточно кредитов"));
                        }
                        
                        // Рассчитываем время завершения апгрейда
                        int[] times = UPGRADE_TIMES.get(upgradeType);
                        int timeMinutes = times[upgrade.getLevel() - 1];
                        Instant finishTime = Instant.now().plus(Duration.ofMinutes(timeMinutes));
                        
                        logger.debug("Апгрейд {} игрока {} начат, завершится в {}", 
                            upgradeType, playerId, finishTime);
                        
                        // Устанавливаем статус апгрейда
                        upgrade.setUpgrading(true); // Явно устанавливаем флаг активного апгрейда
                        upgrade.setUpgradeFinishTime(finishTime); // Устанавливаем время завершения
                        
                        return upgradeRepository.save(upgrade)
                            .then(upgradeRepository.findById(upgrade.getId()));
                    });
            });
    }
    
    // Ускорить апгрейд за исследовательские очки
    @Transactional
    public Mono<Upgrade> speedUpUpgrade(Long playerId, String upgradeType, int minutesToReduce) {
        logger.debug("Ускорение апгрейда {} для игрока {} на {} минут", upgradeType, playerId, minutesToReduce);
        
        if (minutesToReduce <= 0) {
            return Mono.error(new IllegalArgumentException("Время ускорения должно быть положительным"));
        }
        
        return getUpgradeByType(playerId, upgradeType)
            .flatMap(upgrade -> {
                // Проверяем, находится ли апгрейд в процессе
                if (!upgrade.isUpgrading()) {
                    return Mono.error(new IllegalStateException("Апгрейд не активен"));
                }
                
                // Стоимость ускорения: 1 минута = 10 research points
                int researchPointsCost = minutesToReduce * 10;
                
                // Проверяем и списываем исследовательские очки
                return resourceService.spendResearchPoints(playerId, researchPointsCost)
                    .flatMap(success -> {
                        if (!success) {
                            return Mono.error(new IllegalStateException("Недостаточно исследовательских очков"));
                        }
                        
                        // Уменьшаем время завершения
                        Instant newFinishTime = upgrade.getUpgradeFinishTime()
                            .minus(Duration.ofMinutes(minutesToReduce));
                            
                        // Не раньше текущего времени
                        if (newFinishTime.isBefore(Instant.now())) {
                            newFinishTime = Instant.now();
                        }
                        
                        logger.debug("Апгрейд {} игрока {} ускорен, новое время завершения: {}", 
                            upgradeType, playerId, newFinishTime);
                        
                        // Устанавливаем новое время завершения
                        return upgradeRepository.updateUpgradeStatus(upgrade.getId(), true, newFinishTime)
                            .then(upgradeRepository.findById(upgrade.getId()));
                    });
            });
    }
    
    // Обработка завершенных апгрейдов (выполняется каждую минуту)
    @Scheduled(fixedDelay = 30000) // Проверка каждые 30 секунд
    @Transactional
    public Mono<Void> processCompletedUpgrades() {  // Изменено с void на Mono<Void>
        logger.debug("Checking completed upgrades");
        
        return upgradeRepository.findAllUpgradesInProgress()
            .filter(upgrade -> upgrade.getUpgradeFinishTime() != null && 
                            upgrade.getUpgradeFinishTime().isBefore(Instant.now()))
            .flatMap(upgrade -> {
                logger.info("Completion of the upgrade ID: {}", upgrade.getId());
                
                // Обновляем статус апгрейда
                upgrade.setUpgrading(false);
                upgrade.setCompleted(true);
                
                return upgradeRepository.save(upgrade);
            })
            .then(); // Преобразуем Flux в Mono<Void>
    }
    
    // Отменить апгрейд с частичным возвратом кредитов
    @Transactional
    public Mono<Upgrade> cancelUpgrade(Long playerId, String upgradeType) {
        logger.debug("Отмена апгрейда {} для игрока {}", upgradeType, playerId);
        
        return getUpgradeByType(playerId, upgradeType)
            .flatMap(upgrade -> {
                if (!upgrade.isUpgrading()) {
                    return Mono.error(new IllegalStateException("Апгрейд не активен"));
                }
                
                // Вычисляем оставшееся время в минутах
                Instant now = Instant.now();
                long remainingTimeMinutes = Duration.between(now, upgrade.getUpgradeFinishTime()).toMinutes();
                if (remainingTimeMinutes < 0) remainingTimeMinutes = 0;
                
                // Получаем общее время апгрейда
                int[] times = UPGRADE_TIMES.get(upgradeType);
                int totalTimeMinutes = times[upgrade.getLevel() - 1];
                
                // Получаем стоимость апгрейда
                int[] costs = UPGRADE_COSTS.get(upgradeType);
                int totalCost = costs[upgrade.getLevel() - 1];
                
                // Рассчитываем % возврата и сумму возврата
                double refundRatio = (double) remainingTimeMinutes / totalTimeMinutes;
                int refundAmount = (int)(totalCost * refundRatio * 0.8); // 80% от остаточной стоимости
                
                logger.debug("Возврат {} кредитов за отмену апгрейда {}", refundAmount, upgradeType);
                
                // Сбрасываем статус апгрейда и возвращаем кредиты
                return upgradeRepository.updateUpgradeStatus(upgrade.getId(), false, null)
                    .then(resourceService.addCredits(playerId, refundAmount)
                        .thenReturn(upgrade))
                    .flatMap(u -> upgradeRepository.findById(upgrade.getId()));
            });
    }
    
    // Получить время до завершения апгрейда в секундах
    public Mono<Long> getRemainingTime(Long playerId, String upgradeType) {
        return getUpgradeByType(playerId, upgradeType)
            .map(upgrade -> {
                if (!upgrade.isUpgrading()) {
                    return 0L;
                }
                
                Instant now = Instant.now();
                long secondsRemaining = Duration.between(now, upgrade.getUpgradeFinishTime()).getSeconds();
                return Math.max(0, secondsRemaining);
            });
    }
    
    // Получить информацию о следующем уровне апгрейда
    public Mono<Map<String, Object>> getNextLevelInfo(Long playerId, String upgradeType) {
        return getUpgradeByType(playerId, upgradeType)
            .map(upgrade -> {
                int currentLevel = upgrade.getLevel();
                
                // Проверяем, не достигнут ли максимальный уровень
                int[] costs = UPGRADE_COSTS.get(upgradeType);
                if (currentLevel >= costs.length) {
                    // Максимальный уровень достигнут
                    Map<String, Object> result = new ConcurrentHashMap<>();
                    result.put("currentLevel", currentLevel);
                    result.put("nextLevel", null);
                    result.put("isMaxLevel", true);
                    return result;
                }
                
                int nextLevel = currentLevel + 1;
                int cost = costs[currentLevel - 1];
                int timeMinutes = UPGRADE_TIMES.get(upgradeType)[currentLevel - 1];
                
                Map<String, Object> result = new ConcurrentHashMap<>();
                result.put("currentLevel", currentLevel);
                result.put("nextLevel", nextLevel);
                result.put("cost", cost);
                result.put("timeMinutes", timeMinutes);
                result.put("isMaxLevel", false);
                return result;
            });
    }
    
    // Мгновенное завершение апгрейда (для административных целей или тестирования)
    @Transactional
    public Mono<Upgrade> completeUpgradeImmediately(Long upgradeId) {
        return upgradeRepository.findById(upgradeId)
            .flatMap(upgrade -> {
                if (!upgrade.isUpgrading()) {
                    return Mono.just(upgrade);
                }
                
                return upgradeRepository.completeUpgrade(upgradeId, Instant.now())
                    .then(upgradeRepository.findById(upgradeId));
            });
    }

    public Mono<Upgrade> startNewUpgrade(Long playerId, String upgradeType) {
        logger.info(">>>>> UPGRADE_SERVICE: START - Attempting new upgrade for Player ID: {}, Type: {} <<<<<", playerId, upgradeType);

        // 1. Проверка существования игрока
        return playerRepository.findById(playerId)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Player not found with ID: " + playerId)))
            .doOnNext(player -> logger.info(">>>>> UPGRADE_SERVICE: SUCCESS - Player found: ID={}, Name={} <<<<<", player.getId(), player.getUsername()))
            .flatMap(player -> {
                logger.info(">>>>> UPGRADE_SERVICE: SUCCESS - Player found: ID={}, Name={} <<<<<", player.getId(), player.getUsername());

                // 2. Валидация типа апгрейда
                if (!UPGRADE_COSTS.containsKey(upgradeType)) {
                    logger.warn(">>>>> UPGRADE_SERVICE: ERROR - Invalid upgrade type: {}. Valid types: {} <<<<<", 
                        upgradeType, UPGRADE_COSTS.keySet());
                    return Mono.error(new IllegalArgumentException("Invalid upgrade type: " + upgradeType + 
                        ". Valid types: " + UPGRADE_COSTS.keySet()));
                }
                logger.info(">>>>> UPGRADE_SERVICE: SUCCESS - Upgrade type '{}' is valid <<<<<", upgradeType);

                // 3. Получить текущий уровень игрока для этого типа апгрейда
                return getCurrentUpgradeLevel(playerId, upgradeType)
                    .flatMap(currentLevel -> {
                        logger.info(">>>>> UPGRADE_SERVICE: Current level for Player {} in {}: {} <<<<<", 
                            playerId, upgradeType, currentLevel);

                        // 4. Проверить максимальный уровень
                        int[] costs = UPGRADE_COSTS.get(upgradeType);
                        if (currentLevel >= costs.length) {
                            logger.warn(">>>>> UPGRADE_SERVICE: ERROR - Player {} already at max level {} for {} <<<<<", 
                                playerId, currentLevel, upgradeType);
                            return Mono.error(new IllegalStateException("Already at maximum level for " + upgradeType));
                        }

                        // 5. Проверить, есть ли уже активный апгрейд этого типа
                        return checkActiveUpgrade(playerId, upgradeType)
                            .flatMap(hasActiveUpgrade -> {
                                if (hasActiveUpgrade) {
                                    logger.warn(">>>>> UPGRADE_SERVICE: ERROR - Player {} already has active upgrade of type {} <<<<<", 
                                        playerId, upgradeType);
                                    return Mono.error(new IllegalStateException("Already has active upgrade of type: " + upgradeType));
                                }
                                logger.info(">>>>> UPGRADE_SERVICE: SUCCESS - No active upgrade conflict for Player {} <<<<<", playerId);

                                // 6. Проверить стоимость и ресурсы
                                int upgradeCost = costs[currentLevel];
                                logger.info(">>>>> UPGRADE_SERVICE: Upgrade cost for level {}->{}: {} credits <<<<<", 
                                    currentLevel, currentLevel + 1, upgradeCost);

                                return resourceService.getPlayerCredits(playerId)
                                    .flatMap(playerCredits -> {
                                        logger.info(">>>>> UPGRADE_SERVICE: Player {} has {} credits, needs {} <<<<<", 
                                            playerId, playerCredits, upgradeCost);

                                        if (playerCredits < upgradeCost) {
                                            logger.warn(">>>>> UPGRADE_SERVICE: ERROR - Not enough credits. Has: {}, Needs: {} <<<<<", 
                                                playerCredits, upgradeCost);
                                            return Mono.error(new IllegalArgumentException("Not enough credits. Required: " + upgradeCost));
                                        }

                                        // 7. Списать кредиты
                                        logger.info(">>>>> UPGRADE_SERVICE: Deducting {} credits from Player {} <<<<<", upgradeCost, playerId);
                                        return resourceService.spendCredits(playerId, upgradeCost)
                                            .then(Mono.defer(() -> {
                                                // 8. Создать апгрейд
                                                logger.info(">>>>> UPGRADE_SERVICE: Creating upgrade entity... <<<<<");
                                                Upgrade newUpgrade = new Upgrade();
                                                newUpgrade.setPlayerId(playerId);
                                                newUpgrade.setUpgradeType(upgradeType);
                                                newUpgrade.setLevel(currentLevel + 1);
                                                newUpgrade.setStartTime(Instant.now());
                                                
                                                int[] times = UPGRADE_TIMES.get(upgradeType);
                                                long durationMinutes = times[currentLevel];
                                                newUpgrade.setEndTime(Instant.now().plus(Duration.ofMinutes(durationMinutes)));
                                                newUpgrade.setCompleted(false);

                                                logger.info(">>>>> UPGRADE_SERVICE: Upgrade entity created - Player: {}, Type: {}, Level: {}, Duration: {} min <<<<<", 
                                                    playerId, upgradeType, currentLevel + 1, durationMinutes);

                                                // 9. Сохранить в БД
                                                return upgradeRepository.save(newUpgrade)
                                                    .doOnSuccess(savedUpgrade -> logger.info(">>>>> UPGRADE_SERVICE: SUCCESS - Upgrade saved with ID: {} <<<<<", savedUpgrade.getId()))
                                                    .doOnError(error -> logger.error(">>>>> UPGRADE_SERVICE: ERROR - Failed to save upgrade: {} <<<<<", error.getMessage(), error));
                                            }));
                                    });
                            });
                    });
            });
    }

    public Flux<Upgrade> getUpgradesByPlayerId(Long playerId) {
        logger.info(">>>>> UPGRADE_SERVICE: Getting all upgrades for Player ID: {} <<<<<", playerId);
        return upgradeRepository.findByPlayerId(playerId)
            .collectList()
            .doOnSuccess(upgrades -> logger.info(">>>>> UPGRADE_SERVICE: Found {} upgrades for Player {} <<<<<", upgrades.size(), playerId))
            .flatMapMany(Flux::fromIterable);
    }

    private Mono<Integer> getCurrentUpgradeLevel(Long playerId, String upgradeType) {
        logger.debug(">>>>> UPGRADE_SERVICE: Getting current level for Player {} in {} <<<<<", playerId, upgradeType);
        return upgradeRepository.findByPlayerIdAndUpgradeTypeAndIsCompletedTrue(playerId, upgradeType) // Исправлено имя метода
            .collectList()
            .map(completedUpgrades -> {
                int maxLevel = completedUpgrades.stream()
                    .mapToInt(Upgrade::getLevel)
                    .max()
                    .orElse(0);
                logger.debug(">>>>> UPGRADE_SERVICE: Max completed level: {} <<<<<", maxLevel);
                return maxLevel;
            });
    }

    private Mono<Boolean> checkActiveUpgrade(Long playerId, String upgradeType) {
        logger.debug(">>>>> UPGRADE_SERVICE: Checking for active upgrades for Player {} in {} <<<<<", playerId, upgradeType);
        return upgradeRepository.findByPlayerIdAndUpgradeTypeAndIsCompletedFalse(playerId, upgradeType) // Исправлено имя метода
            .hasElements()
            .doOnSuccess(hasActive -> logger.debug(">>>>> UPGRADE_SERVICE: Has active upgrade: {} <<<<<", hasActive));
    }

    @SuppressWarnings("unused")
    private Flux<Upgrade> isUpgradeActive(Long playerId, String upgradeType) {
        return upgradeRepository.findByPlayerIdAndUpgradeTypeAndIsCompletedFalse(playerId, upgradeType)
            .filter(upgrade -> upgrade.getEndTime().isAfter(Instant.now()))
            .switchIfEmpty(Mono.error(new IllegalStateException("Апгрейд не активен")));
    }
}