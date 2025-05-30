package com.aitstudgroup.ala_ata.demo.dto;

import java.time.Instant;

import com.aitstudgroup.ala_ata.demo.model.Upgrade;

public class UpgradeResponse {
    private Long id;
    private Long playerId;
    private String upgradeType;
    private Integer level;
    private Instant upgradeFinishTime;
    private boolean isUpgrading;
    private Integer timeLeftSeconds; // Дополнительное поле с оставшимся временем
    
    public UpgradeResponse(Upgrade upgrade) {
        if (upgrade != null) {
            this.id = upgrade.getId();
            this.playerId = upgrade.getPlayerId();
            this.upgradeType = upgrade.getUpgradeType();
            this.level = upgrade.getLevel();
            this.upgradeFinishTime = upgrade.getUpgradeFinishTime();
            this.isUpgrading = upgrade.isUpgrading();
            
            // Расчет оставшегося времени
            if (isUpgrading && upgradeFinishTime != null) {
                long secondsLeft = Instant.now().until(upgradeFinishTime, java.time.temporal.ChronoUnit.SECONDS);
                this.timeLeftSeconds = secondsLeft > 0 ? (int) secondsLeft : 0;
            }
        }
    }
    
    // Геттеры
    public Long getId() {
        return id;
    }
    
    public Long getPlayerId() {
        return playerId;
    }
    
    public String getUpgradeType() {
        return upgradeType;
    }
    
    public Integer getLevel() {
        return level;
    }
    
    public Instant getUpgradeFinishTime() {
        return upgradeFinishTime;
    }
    
    public boolean isUpgrading() {
        return isUpgrading;
    }
    
    public Integer getTimeLeftSeconds() {
        return timeLeftSeconds;
    }
}