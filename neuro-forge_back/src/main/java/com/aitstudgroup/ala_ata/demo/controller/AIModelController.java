package com.aitstudgroup.ala_ata.demo.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aitstudgroup.ala_ata.demo.dto.DeploymentRequest;
import com.aitstudgroup.ala_ata.demo.dto.ModelCreateRequest;
import com.aitstudgroup.ala_ata.demo.model.AIModel;
import com.aitstudgroup.ala_ata.demo.service.AIModelService;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/models")
@CrossOrigin
public class AIModelController {
    private static final Logger logger = LoggerFactory.getLogger(AIModelController.class);
    private final AIModelService aiModelService;
    
    public AIModelController(AIModelService aiModelService) {
        this.aiModelService = aiModelService;
        logger.info("AIModelController initialized with AIModelService.");
    }
    
    @PostMapping
    public Mono<ResponseEntity<AIModel>> createModel(@RequestBody ModelCreateRequest request) {
        return aiModelService.createModel(
                request.getName(), 
                request.getPlayerId(), 
                request.getAccuracy(), 
                request.getSpeedScore(),
                request.getParameters()
            )
            .map(model -> ResponseEntity.status(HttpStatus.CREATED).body(model))
            .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }
    
    @GetMapping("/{id}")
    public Mono<ResponseEntity<AIModel>> getModelById(@PathVariable Long id) {
        return aiModelService.getModelById(id)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/player/{playerId}")
    public Flux<AIModel> getPlayerModels(@PathVariable Long playerId) {
        return aiModelService.getModelsByPlayerId(playerId);
    }
    
    @PatchMapping("/{id}/deployment")
    public Mono<ResponseEntity<AIModel>> toggleDeployment(
            @PathVariable Long id, 
            @RequestBody DeploymentRequest request) {
        System.out.println("=== DEPLOYMENT REQUEST STARTED ===");
        System.out.println("Request to change deployment status for model ID: " + id);
        System.out.println("Request details - Player ID: " + request.getPlayerId() + ", Deploy status: " + request.isDeploy());
        
        return aiModelService.toggleModelDeployment(id, request.getPlayerId(), request.isDeploy())
            .doOnSuccess(model -> {
                System.out.println("=== DEPLOYMENT SUCCESS ===");
                System.out.println("Response model ID: " + model.getId());
                System.out.println("Final deployment status: " + model.isDeployed());
                System.out.println("Last updated: " + model.getLastUpdatedAt());
            })
            .doOnError(e -> {
                System.out.println("=== DEPLOYMENT ERROR ===");
                System.out.println("Error type: " + e.getClass().getName());
                System.out.println("Error message: " + e.getMessage());
                e.printStackTrace(); // Print full stack trace for detailed debugging
            })
            .map(model -> {
                System.out.println("Creating response entity with status 200 OK");
                return ResponseEntity.ok(model);
            })
            .onErrorResume(e -> {
                System.out.println("Creating response entity with status 400 Bad Request");
                return Mono.just(ResponseEntity.badRequest().build());
            })
            .doOnTerminate(() -> System.out.println("=== DEPLOYMENT REQUEST COMPLETED ==="));
    }
    
    @GetMapping("/top")
    public Flux<AIModel> getTopModels(@RequestParam(defaultValue = "10") int limit) { // параметр limit
        logger.info("<<<<< CONTROLLER: getTopModels - Received request for top models with limit: {} >>>>>", limit);

        int effectiveLimit = limit; // 1. Используем новую переменную
        if (effectiveLimit <= 0) {
            logger.warn("<<<<< CONTROLLER: getTopModels - Invalid limit value: {}. Setting to default 10. >>>>>", effectiveLimit);
            effectiveLimit = 10; // 2. Модифицируем новую переменную
        }

        // 3. Используем 'effectiveLimit' (которая теперь эффективно финальна) в остальной части цепочки
        final int finalLimit = effectiveLimit; // Можно также объявить final для явности

        return aiModelService.getTopModelsByIncome(finalLimit)
            .collectList() // Собираем в список для логирования количества перед отправкой
            .doOnSubscribe(subscription -> logger.info("<<<<< CONTROLLER: getTopModels - Subscribed to service call for limit: {} >>>>>", finalLimit))
            .doOnSuccess(modelsList -> {
                logger.info("<<<<< CONTROLLER: getTopModels - Service returned {} models for limit: {}. >>>>>", modelsList.size(), finalLimit);
                if (logger.isDebugEnabled()) {
                    modelsList.forEach(model -> logger.debug("<<<<< CONTROLLER: getTopModels - Returning Model ID: {}, Name: {}, CreditsPerMinute: {} >>>>>", model.getId(), model.getName(), model.getCreditsPerMinute()));
                }
            })
            .flatMapMany(Flux::fromIterable) // Преобразуем обратно во Flux для отправки клиенту
            .doOnError(error -> logger.error("<<<<< CONTROLLER: getTopModels - Error occurred while fetching top models for limit {}: {} >>>>>", finalLimit, error.getMessage(), error))
            .doOnComplete(() -> logger.info("<<<<< CONTROLLER: getTopModels - Successfully processed request and sent response for top models with limit: {}. >>>>>", finalLimit));
    }
}