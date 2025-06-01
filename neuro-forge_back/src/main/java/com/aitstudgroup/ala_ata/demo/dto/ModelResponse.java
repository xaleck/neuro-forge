package com.aitstudgroup.ala_ata.demo.dto;

import java.time.Instant;

import com.aitstudgroup.ala_ata.demo.model.AIModel;

public class ModelResponse {
    private Long id;
    private String name;
    private Long playerId;
    private Double accuracy;
    private Integer speedScore;
    private Integer popularityScore;
    private Instant createdAt;
    private Instant lastUpdatedAt;
    
    // Конструктор для конвертации из модели
    public ModelResponse(AIModel model) {
        if (model != null) {
            this.id = model.getId();
            this.name = model.getName();
            this.playerId = model.getPlayerId();
            this.accuracy = model.getAccuracy();
            this.speedScore = model.getSpeedScore();
            this.popularityScore = model.getPopularityScore();
            this.createdAt = model.getCreatedAt();
            this.lastUpdatedAt = model.getLastUpdatedAt();
        }
    }
    
    // Геттеры 
    public Long getId() {
        return id;
    }
    
    public String getName() {
        return name;
    }
    
    public Long getPlayerId() {
        return playerId;
    }
    
    public Double getAccuracy() {
        return accuracy;
    }
    
    public Integer getSpeedScore() {
        return speedScore;
    }
    
    public Integer getPopularityScore() {
        return popularityScore;
    }
    
    public Instant getCreatedAt() {
        return createdAt;
    }
    
    public Instant getLastUpdatedAt() {
        return lastUpdatedAt;
    }
}