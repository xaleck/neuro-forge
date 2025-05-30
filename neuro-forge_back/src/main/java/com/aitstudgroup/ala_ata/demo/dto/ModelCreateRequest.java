package com.aitstudgroup.ala_ata.demo.dto;

public class ModelCreateRequest {
    private String name;
    private Long playerId;
    private Double accuracy;
    private Integer speedScore;
    private String parameters;
    
    // Геттеры и сеттеры
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Long getPlayerId() {
        return playerId;
    }
    
    public void setPlayerId(Long playerId) {
        this.playerId = playerId;
    }
    
    public Double getAccuracy() {
        return accuracy;
    }
    
    public void setAccuracy(Double accuracy) {
        this.accuracy = accuracy;
    }
    
    public Integer getSpeedScore() {
        return speedScore;
    }
    
    public void setSpeedScore(Integer speedScore) {
        this.speedScore = speedScore;
    }
    
    public String getParameters() {
        return parameters;
    }
    
    public void setParameters(String parameters) {
        this.parameters = parameters;
    }
}