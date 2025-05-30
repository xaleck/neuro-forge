package com.aitstudgroup.ala_ata.demo.service;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aitstudgroup.ala_ata.demo.model.ResourceWallet;
import com.aitstudgroup.ala_ata.demo.repository.PlayerRepository;
import com.aitstudgroup.ala_ata.demo.repository.ResourceWalletRepository;

import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

@Service
public class ResourceService {
    private static final Logger logger = LoggerFactory.getLogger(ResourceService.class);
    private final ResourceWalletRepository resourceWalletRepository;
    private final PlayerRepository playerRepository;
    
    @Autowired
    public ResourceService(ResourceWalletRepository resourceWalletRepository, 
                          PlayerRepository playerRepository) {
        this.resourceWalletRepository = resourceWalletRepository;
        this.playerRepository = playerRepository;
    }
    
    // Получить кошелек игрока
    @Transactional
    public Mono<ResourceWallet> getWalletByPlayerId(Long playerId) {
        if (playerId == null) {
            return Mono.error(new IllegalArgumentException("ID игрока не может быть null"));
        }
        
        return resourceWalletRepository.findByPlayerId(playerId)
            .switchIfEmpty(Mono.<ResourceWallet>defer(() -> {
                logger.debug("Кошелек для игрока {} не найден, создаем новый", playerId);
                
                // Проверка существования игрока
                return playerRepository.findById(playerId)
                    .switchIfEmpty(Mono.error(new IllegalArgumentException("Игрок с ID " + playerId + " не найден")))
                    .flatMap(player -> {
                        // Создаем новый кошелек с начальным балансом
                        ResourceWallet wallet = new ResourceWallet();
                        wallet.setPlayerId(playerId);
                        wallet.setCloudCredits(500);
                        wallet.setResearchPoints(0);
                        
                        return resourceWalletRepository.save(wallet)
                            .onErrorResume(e -> {
                                // Если ошибка связана с дублированием (кто-то уже создал кошелек)
                                if (e.getMessage() != null && e.getMessage().contains("duplicate")) {
                                    logger.debug("Кошелек для игрока {} уже был создан другой транзакцией", playerId);
                                    return resourceWalletRepository.findByPlayerId(playerId);
                                }
                                return Mono.error(e);
                            });
                    });
            }))
            .retry(1); // Пробуем еще раз, если возникла ошибка (но не больше одного раза)
    }
    
    // Добавить кредиты
    @Transactional
    public Mono<ResourceWallet> addCredits(Long playerId, int amount) {
        if (amount <= 0) {
            return Mono.error(new IllegalArgumentException("Количество кредитов должно быть положительным"));
        }
        
        logger.debug("Добавление {} кредитов игроку {}", amount, playerId);
        
        return getWalletByPlayerId(playerId)
            .flatMap(wallet -> {
                int newBalance = wallet.getCloudCredits() + amount;
                wallet.setCloudCredits(newBalance);
                
                return resourceWalletRepository.save(wallet)
                    .retryWhen(Retry.backoff(3, Duration.ofMillis(100))
                        .filter(e -> e instanceof org.springframework.dao.OptimisticLockingFailureException)
                        .doBeforeRetry(signal -> logger.warn("Повторная попытка обновления кошелька: {}", signal.failure().getMessage())));
            });
    }
    
    // Попытка потратить кредиты
    @Transactional
    public Mono<Boolean> spendCredits(Long playerId, int amount) {
        if (amount <= 0) {
            return Mono.error(new IllegalArgumentException("Сумма списания должна быть положительной"));
        }
        
        logger.debug("Попытка списать {} кредитов у игрока {}", amount, playerId);
        
        return getWalletByPlayerId(playerId)
            .flatMap(wallet -> {
                if (wallet.getCloudCredits() < amount) {
                    logger.debug("Недостаточно средств: {} < {}", wallet.getCloudCredits(), amount);
                    return Mono.just(false); // Недостаточно средств
                }
                
                int newBalance = wallet.getCloudCredits() - amount;
                wallet.setCloudCredits(newBalance);
                
                return resourceWalletRepository.save(wallet)
                    .retryWhen(Retry.backoff(3, Duration.ofMillis(100))
                        .filter(e -> e instanceof org.springframework.dao.OptimisticLockingFailureException))
                    .thenReturn(true);
            });
    }
    
    // Добавить исследовательские очки
    @Transactional
    public Mono<ResourceWallet> addResearchPoints(Long playerId, int amount) {
        if (amount <= 0) {
            return Mono.error(new IllegalArgumentException("Количество исследовательских очков должно быть положительным"));
        }
        
        logger.debug("Добавление {} исследовательских очков игроку {}", amount, playerId);
        
        return getWalletByPlayerId(playerId)
            .flatMap(wallet -> {
                int newAmount = wallet.getResearchPoints() + amount;
                wallet.setResearchPoints(newAmount);
                
                return resourceWalletRepository.save(wallet)
                    .retryWhen(Retry.backoff(3, Duration.ofMillis(100))
                        .filter(e -> e instanceof org.springframework.dao.OptimisticLockingFailureException));
            });
    }
    
    // Попытка потратить исследовательские очки
    @Transactional
    public Mono<Boolean> spendResearchPoints(Long playerId, int amount) {
        if (amount <= 0) {
            return Mono.error(new IllegalArgumentException("Сумма списания должна быть положительной"));
        }
        
        logger.debug("Попытка списать {} исследовательских очков у игрока {}", amount, playerId);
        
        return getWalletByPlayerId(playerId)
            .flatMap(wallet -> {
                if (wallet.getResearchPoints() < amount) {
                    logger.debug("Недостаточно исследовательских очков: {} < {}", wallet.getResearchPoints(), amount);
                    return Mono.just(false); // Недостаточно очков
                }
                
                int newAmount = wallet.getResearchPoints() - amount;
                wallet.setResearchPoints(newAmount);
                
                return resourceWalletRepository.save(wallet)
                    .retryWhen(Retry.backoff(3, Duration.ofMillis(100))
                        .filter(e -> e instanceof org.springframework.dao.OptimisticLockingFailureException))
                    .thenReturn(true);
            });
    }
    
    // Перевод кредитов между игроками
    @Transactional
    public Mono<Boolean> transferCredits(Long fromPlayerId, Long toPlayerId, int amount) {
        if (fromPlayerId.equals(toPlayerId)) {
            return Mono.error(new IllegalArgumentException("Нельзя переводить кредиты самому себе"));
        }
        
        if (amount <= 0) {
            return Mono.error(new IllegalArgumentException("Сумма перевода должна быть положительной"));
        }
        
        logger.debug("Перевод {} кредитов от игрока {} игроку {}", amount, fromPlayerId, toPlayerId);
        
        // Сначала списываем с отправителя
        return spendCredits(fromPlayerId, amount)
            .flatMap(success -> {
                if (!success) {
                    return Mono.just(false); // Недостаточно средств у отправителя
                }
                
                // Затем начисляем получателю
                return addCredits(toPlayerId, amount)
                    .thenReturn(true)
                    .onErrorResume(e -> {
                        // В случае ошибки начисления, возвращаем средства отправителю
                        logger.error("Ошибка при переводе кредитов: {}", e.getMessage());
                        return addCredits(fromPlayerId, amount)
                            .then(Mono.just(false));
                    });
            });
    }

    public Mono<Integer> getPlayerCredits(Long playerId) {
        logger.debug("Получение кредитов для игрока {}", playerId);
        return resourceWalletRepository.findByPlayerId(playerId)
            .map(ResourceWallet::getCloudCredits)
            .defaultIfEmpty(0);
    }
}