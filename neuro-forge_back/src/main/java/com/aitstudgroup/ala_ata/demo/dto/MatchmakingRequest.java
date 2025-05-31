package com.aitstudgroup.ala_ata.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class MatchmakingRequest {

    @NotNull(message = "Player ID cannot be null")
    private Long playerId;

    @NotNull(message = "Model ID cannot be null")
    private Long modelId;

    @NotBlank(message = "Match type cannot be blank")
    private String matchType;

    // Player ID will be taken from the authenticated principal, so not needed in request body

    public MatchmakingRequest() {
    }

    public MatchmakingRequest(Long playerId, Long modelId, String matchType) {
        this.playerId = playerId;
        this.modelId = modelId;
        this.matchType = matchType;
    }

    public Long getPlayerId() {
        return playerId;
    }

    public void setPlayerId(Long playerId) {
        this.playerId = playerId;
    }

    public Long getModelId() {
        return modelId;
    }

    public void setModelId(Long modelId) {
        this.modelId = modelId;
    }

    public String getMatchType() {
        return matchType;
    }

    public void setMatchType(String matchType) {
        this.matchType = matchType;
    }
} 