package com.aitstudgroup.ala_ata.demo.dto;

public class PlayerStatsResponse {
    private Long playerId;
    private Double winRate;
    private Integer totalMatches;
    private Integer wins;
    
    public PlayerStatsResponse(Long playerId, Double winRate) {
        this.playerId = playerId;
        this.winRate = winRate;
    }
    
    // Расширенный конструктор
    public PlayerStatsResponse(Long playerId, Integer wins, Integer totalMatches) {
        this.playerId = playerId;
        this.wins = wins;
        this.totalMatches = totalMatches;
        this.winRate = totalMatches > 0 ? (double) wins / totalMatches : 0.0;
    }
    
    // Геттеры
    public Long getPlayerId() {
        return playerId;
    }
    
    public Double getWinRate() {
        return winRate;
    }
    
    public Integer getTotalMatches() {
        return totalMatches;
    }
    
    public Integer getWins() {
        return wins;
    }
}