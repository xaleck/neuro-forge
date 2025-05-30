package com.aitstudgroup.ala_ata.demo.dto;

public class UpgradeRequest {
    private Long playerId;
    private String upgradeType;

    public UpgradeRequest() {}

    public UpgradeRequest(Long playerId, String upgradeType) {
        this.playerId = playerId;
        this.upgradeType = upgradeType;
    }

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
}