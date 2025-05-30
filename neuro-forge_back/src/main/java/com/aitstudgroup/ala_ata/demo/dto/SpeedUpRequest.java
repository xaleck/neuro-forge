package com.aitstudgroup.ala_ata.demo.dto;

public class SpeedUpRequest {
    private Long playerId;
    private String upgradeType;
    private Integer minutesToReduce;
    
    // Геттеры и сеттеры
    public Long getPlayerId() {
        return playerId;
    }
    
    public void setPlayerId(Long playerId) {
        this.playerId = playerId;
    }
    
    public String getUpgradeType() {
        return upgradeType;
    }
    
    public void setUpgradeType(String upgradeType) {
        this.upgradeType = upgradeType;
    }
    
    public Integer getMinutesToReduce() {
        return minutesToReduce;
    }
    
    public void setMinutesToReduce(Integer minutesToReduce) {
        this.minutesToReduce = minutesToReduce;
    }
}