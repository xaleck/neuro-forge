package com.aitstudgroup.ala_ata.demo.dto;

public class DeploymentRequest {
    private Long playerId;
    private boolean deploy;
    
    // Геттеры и сеттеры
    public Long getPlayerId() {
        return playerId;
    }
    
    public void setPlayerId(Long playerId) {
        this.playerId = playerId;
    }
    
    public boolean isDeploy() {
        return deploy;
    }
    
    public void setDeploy(boolean deploy) {
        this.deploy = deploy;
    }
}