package com.aitstudgroup.ala_ata.demo.dto;

public class MatchCreateRequest {
    private Long player1Id;
    private Long player2Id;
    private Long player1ModelId;
    private Long player2ModelId;
    private String matchType;
    
    // Геттеры и сеттеры
    public Long getPlayer1Id() {
        return player1Id;
    }
    
    public void setPlayer1Id(Long player1Id) {
        this.player1Id = player1Id;
    }
    
    public Long getPlayer2Id() {
        return player2Id;
    }
    
    public void setPlayer2Id(Long player2Id) {
        this.player2Id = player2Id;
    }
    
    public Long getPlayer1ModelId() {
        return player1ModelId;
    }
    
    public void setPlayer1ModelId(Long player1ModelId) {
        this.player1ModelId = player1ModelId;
    }
    
    public Long getPlayer2ModelId() {
        return player2ModelId;
    }
    
    public void setPlayer2ModelId(Long player2ModelId) {
        this.player2ModelId = player2ModelId;
    }
    
    public String getMatchType() {
        return matchType;
    }
    
    public void setMatchType(String matchType) {
        this.matchType = matchType;
    }
}