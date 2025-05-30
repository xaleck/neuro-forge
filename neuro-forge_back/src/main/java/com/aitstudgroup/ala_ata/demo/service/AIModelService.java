package com.aitstudgroup.ala_ata.demo.service;

import java.time.Instant;
import java.util.Comparator;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aitstudgroup.ala_ata.demo.model.AIModel;
import com.aitstudgroup.ala_ata.demo.repository.AIModelRepository;
import com.aitstudgroup.ala_ata.demo.repository.PlayerRepository;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class AIModelService {
    private static final Logger logger = LoggerFactory.getLogger(AIModelService.class);
    private final AIModelRepository aiModelRepository;
    private final PlayerRepository playerRepository;
    
    @Autowired
    public AIModelService(AIModelRepository aiModelRepository, PlayerRepository playerRepository) {
        this.aiModelRepository = aiModelRepository;
        this.playerRepository = playerRepository;
        logger.info("AIModelService initialized with AIModelRepository and PlayerRepository.");
    }
    
    // Создать новую модель
    @Transactional
    public Mono<AIModel> createModel(String name, Long playerId, Double accuracy, Integer speedScore, String parameters) {
        // Проверка имени модели
        if (name == null || name.trim().isEmpty()) {
            return Mono.error(new IllegalArgumentException("Имя модели не может быть пустым"));
        }
        
        // Проверка существования игрока
        return playerRepository.findById(playerId)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Игрок с ID " + playerId + " не найден")))
            .flatMap(player -> {
                AIModel model = new AIModel();
                model.setName(name);
                model.setPlayerId(playerId);
                model.setDeployed(false);
                model.setPopularityScore(0);
                model.setCreditsPerMinute(0);
                model.setAccuracy(accuracy);
                model.setSpeedScore(speedScore);
                model.setCreatedAt(Instant.now());
                model.setLastUpdatedAt(Instant.now());
                model.setParameters(parameters != null ? parameters : "{}");
                
                return aiModelRepository.save(model);
            });
    }
    
    // Получить модель по ID
    public Mono<AIModel> getModelById(Long id) {
        return aiModelRepository.findById(id)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Модель с ID " + id + " не найдена")));
    }
    
    // Получить все модели игрока
    public Flux<AIModel> getModelsByPlayerId(Long playerId) {
        return aiModelRepository.findByPlayerId(playerId);
    }
    
    // Получить развернутые модели игрока
    public Flux<AIModel> getDeployedModelsByPlayerId(Long playerId) {
        return aiModelRepository.findByPlayerIdAndIsDeployedTrue(playerId);
    }
    
    // Получить все развернутые модели (для пассивного дохода)
    public Flux<AIModel> findAllDeployedModels() {
        return aiModelRepository.findByIsDeployedTrue();
    }
    
    // Развернуть/снять модель
    @Transactional
    public Mono<AIModel> toggleModelDeployment(Long modelId, Long playerId, boolean deploy) {
        System.out.println("=== SERVICE: TOGGLE DEPLOYMENT STARTED ===");
        System.out.println("Parameters - Model ID: " + modelId + ", Player ID: " + playerId + ", Deploy: " + deploy);
        
        return aiModelRepository.findById(modelId)
            .doOnSuccess(model -> {
                if (model != null) {
                    System.out.println("Model found - Current state: ID=" + model.getId() + 
                                     ", Name=" + model.getName() + 
                                     ", Current deployment=" + model.isDeployed());
                } else {
                    System.out.println("Model not found with ID: " + modelId);
                }
            })
            .doOnError(e -> System.out.println("Error finding model: " + e.getMessage()))
            .flatMap(model -> {
                // Проверка, принадлежит ли модель игроку
                if (!model.getPlayerId().equals(playerId)) {
                    System.out.println("Authorization error: Model belongs to player " + 
                                     model.getPlayerId() + ", not to requesting player " + playerId);
                    return Mono.error(new RuntimeException("Модель не принадлежит указанному игроку"));
                }
                
                // Обновляем статус только если он отличается от текущего
                if (model.isDeployed() != deploy) {
                    System.out.println("Changing deployment status from " + model.isDeployed() + " to " + deploy);
                    model.setDeployed(deploy);
                    model.setLastUpdatedAt(Instant.now());
                    
                    System.out.println("Saving updated model...");
                    return aiModelRepository.save(model)
                        .doOnSuccess(savedModel -> {
                            System.out.println("=== MODEL SAVED SUCCESSFULLY ===");
                            System.out.println("Saved model state: ID=" + savedModel.getId() + 
                                             ", Deployment=" + savedModel.isDeployed() + 
                                             ", Updated at=" + savedModel.getLastUpdatedAt());
                        })
                        .doOnError(e -> {
                            System.out.println("=== ERROR SAVING MODEL ===");
                            System.out.println("Error type: " + e.getClass().getName());
                            System.out.println("Error message: " + e.getMessage());
                        });
                } else {
                    System.out.println("No change needed - model already has deployment status: " + deploy);
                    return Mono.just(model); // Возвращается текущая (неизмененная) модель
                }
            })
            .doOnTerminate(() -> System.out.println("=== SERVICE: TOGGLE DEPLOYMENT COMPLETED ==="));
    }
    
    // Обновить показатель доходности модели
    public Mono<Void> updateModelIncome(Long modelId, int creditsPerMinute) {
        if (creditsPerMinute < 0) {
            return Mono.error(new IllegalArgumentException("Доходность не может быть отрицательной"));
        }
        return aiModelRepository.updateCreditsPerMinute(modelId, creditsPerMinute);
    }
    
    // Обновить показатель популярности модели
    public Mono<Void> updateModelPopularity(Long modelId, int delta) {
        return aiModelRepository.updatePopularityScore(modelId, delta);
    }
    
    // Расчет дохода модели на основе точности и популярности
    public Mono<Integer> recalculateModelIncome(Long modelId) {
        return aiModelRepository.findById(modelId)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Модель с ID " + modelId + " не найдена")))
            .map(model -> {
                // Формула расчета дохода:
                // базовый_доход + (точность * множитель) + (популярность * множитель)
                int baseIncome = 5; // Базовый доход для всех моделей
                double accuracyFactor = model.getAccuracy() * 10; // Влияние точности
                int popularityFactor = model.getPopularityScore() / 10; // Влияние популярности
                int speedBonus = model.getSpeedScore() / 20; // Бонус от скорости
                
                int totalIncome = (int) (baseIncome + accuracyFactor + popularityFactor + speedBonus);
                return Math.max(totalIncome, 0); // Не меньше 0
            })
            .flatMap(income -> aiModelRepository.updateCreditsPerMinute(modelId, income)
                .thenReturn(income));
    }
    
    // Получить топ моделей по доходности
    public Flux<AIModel> getTopModelsByIncome(int limit) {
        logger.info(">>>>> SERVICE: getTopModelsByIncome - Called with limit: {} <<<<<", limit);

        return aiModelRepository.findAll() // Сначала получаем все модели
            .collectList() // Собираем в список для сортировки и логирования
            .flatMapMany(allModels -> {
                logger.info(">>>>> SERVICE: getTopModelsByIncome - Found {} models in total from repository. <<<<<", allModels.size());
                if (allModels.isEmpty()) {
                    logger.info(">>>>> SERVICE: getTopModelsByIncome - No models found. Returning empty Flux. <<<<<");
                    return Flux.empty();
                }

                // Сортировка моделей по creditsPerMinute в убывающем порядке
                // Убедитесь, что у AIModel есть метод getCreditsPerMinute()
                allModels.sort(Comparator.comparingInt(AIModel::getCreditsPerMinute).reversed());
                logger.info(">>>>> SERVICE: getTopModelsByIncome - Sorted {} models by creditsPerMinute. <<<<<", allModels.size());

                // Логирование топ-N моделей после сортировки (для отладки)
                if (logger.isDebugEnabled()) {
                    allModels.stream().limit(Math.min(limit, allModels.size())).forEach(model ->
                        logger.debug(">>>>> SERVICE: Top Model Candidate - ID: {}, Name: {}, CreditsPerMinute: {}, Deployed: {} <<<<<",
                            model.getId(), model.getName(), model.getCreditsPerMinute(), model.isDeployed())
                    );
                }
                
                // Применяем ограничение limit
                return Flux.fromIterable(allModels)
                           .take(limit)
                           .collectList() // Собираем снова для логирования финального количества
                           .doOnSuccess(topNModels -> logger.info(">>>>> SERVICE: getTopModelsByIncome - Returning {} models after applying limit {}. <<<<<", topNModels.size(), limit))
                           .flatMapMany(Flux::fromIterable); // Возвращаем как Flux
            })
            .doOnError(error -> logger.error(">>>>> SERVICE: getTopModelsByIncome - Error occurred: {} <<<<<", error.getMessage(), error));
    }
    
    // Удалить модель
    @Transactional
    public Mono<Void> deleteModel(Long modelId, Long playerId) {
        return aiModelRepository.findById(modelId)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Модель с ID " + modelId + " не найдена")))
            .flatMap(model -> {
                if (!model.getPlayerId().equals(playerId)) {
                    return Mono.error(new IllegalArgumentException("Модель принадлежит другому игроку"));
                }
                
                if (model.isDeployed()) {
                    return Mono.error(new IllegalArgumentException("Нельзя удалить развернутую модель. Сначала снимите модель"));
                }
                
                return aiModelRepository.deleteById(modelId);
            });
    }
    
    // Обновить модель
    @Transactional
    public Mono<AIModel> updateModel(Long modelId, Long playerId, String name, Double accuracy, Integer speedScore, String parameters) {
        return aiModelRepository.findById(modelId)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Модель с ID " + modelId + " не найдена")))
            .flatMap(model -> {
                if (!model.getPlayerId().equals(playerId)) {
                    return Mono.error(new IllegalArgumentException("Модель принадлежит другому игроку"));
                }
                
                if (name != null && !name.trim().isEmpty()) {
                    model.setName(name);
                }
                if (accuracy != null) {
                    model.setAccuracy(accuracy);
                }
                if (speedScore != null) {
                    model.setSpeedScore(speedScore);
                }
                if (parameters != null) {
                    model.setParameters(parameters);
                }
                
                model.setLastUpdatedAt(Instant.now());
                
                return aiModelRepository.save(model)
                    .flatMap(savedModel -> {
                        // Пересчитываем доходность если модель развернута
                        if (savedModel.isDeployed()) {
                            return recalculateModelIncome(modelId)
                                .then(aiModelRepository.findById(modelId));
                        }
                        return Mono.just(savedModel);
                    });
            });
    }
}