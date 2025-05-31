package com.aitstudgroup.ala_ata.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import java.time.Instant;

@Table("matchmaking_queue")
public class MatchmakingQueueEntry {

    @Id
    private Long playerId;
    private Long modelId;
    private String matchType;
    private Integer eloRating;
    private Instant searchStartTime;
    private String status;

    // Constructors
    public MatchmakingQueueEntry() {
    }

    public MatchmakingQueueEntry(Long playerId, Long modelId, String matchType, Integer eloRating, Instant searchStartTime, String status) {
        this.playerId = playerId;
        this.modelId = modelId;
        this.matchType = matchType;
        this.eloRating = eloRating;
        this.searchStartTime = searchStartTime;
        this.status = status;
    }

    // Getters and Setters
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

    public Integer getEloRating() {
        return eloRating;
    }

    public void setEloRating(Integer eloRating) {
        this.eloRating = eloRating;
    }

    public Instant getSearchStartTime() {
        return searchStartTime;
    }

    public void setSearchStartTime(Instant searchStartTime) {
        this.searchStartTime = searchStartTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
} 