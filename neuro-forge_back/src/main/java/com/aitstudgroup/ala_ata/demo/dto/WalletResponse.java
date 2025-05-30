package com.aitstudgroup.ala_ata.demo.dto;

import com.aitstudgroup.ala_ata.demo.model.ResourceWallet;

public class WalletResponse {
    private Long id;
    private Long playerId;
    private Integer cloudCredits;
    private Integer researchPoints;
    
    public WalletResponse(ResourceWallet wallet) {
        if (wallet != null) {
            this.id = wallet.getId();
            this.playerId = wallet.getPlayerId();
            this.cloudCredits = wallet.getCloudCredits();
            this.researchPoints = wallet.getResearchPoints();
        }
    }
    
    // Геттеры
    public Long getId() {
        return id;
    }
    
    public Long getPlayerId() {
        return playerId;
    }
    
    public Integer getCloudCredits() {
        return cloudCredits;
    }
    
    public Integer getResearchPoints() {
        return researchPoints;
    }
}