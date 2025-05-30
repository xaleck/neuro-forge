package com.aitstudgroup.ala_ata.demo.dto;

public class MatchFinishRequest {
    private Long winnerId;
    private Integer player1Score;
    private Integer player2Score;
    private String matchData;
    
    // Геттеры и сеттеры
    public Long getWinnerId() {
        return winnerId;
    }
    
    public void setWinnerId(Long winnerId) {
        this.winnerId = winnerId;
    }
    
    public Integer getPlayer1Score() {
        return player1Score;
    }
    
    public void setPlayer1Score(Integer player1Score) {
        this.player1Score = player1Score;
    }
    
    public Integer getPlayer2Score() {
        return player2Score;
    }
    
    public void setPlayer2Score(Integer player2Score) {
        this.player2Score = player2Score;
    }
    
    public String getMatchData() {
        return matchData;
    }
    
    public void setMatchData(String matchData) {
        this.matchData = matchData;
    }
}