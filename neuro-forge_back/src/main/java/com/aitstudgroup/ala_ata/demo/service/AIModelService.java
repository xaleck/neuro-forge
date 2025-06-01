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
                model.setPopularityScore(0);
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
    
    // Обновить показатель популярности модели
    public Mono<Void> updateModelPopularity(Long modelId, int delta) {
        return aiModelRepository.updatePopularityScore(modelId, delta);
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
                
                return aiModelRepository.save(model);
            });
    }
}