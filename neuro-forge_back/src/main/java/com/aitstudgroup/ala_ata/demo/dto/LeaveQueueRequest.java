package com.aitstudgroup.ala_ata.demo.dto;

import jakarta.validation.constraints.NotNull;

public class LeaveQueueRequest {

    @NotNull(message = "Player ID cannot be null")
    private Long playerId;

    public LeaveQueueRequest() {
    }

    public LeaveQueueRequest(Long playerId) {
        this.playerId = playerId;
    }

    public Long getPlayerId() {
        return playerId;
    }

    public void setPlayerId(Long playerId) {
        this.playerId = playerId;
    }
} 