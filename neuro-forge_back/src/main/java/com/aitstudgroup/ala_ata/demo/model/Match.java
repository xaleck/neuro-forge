package com.aitstudgroup.ala_ata.demo.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("matches")
public class Match {
    @Id
    private Long id;
    
    @Column("player1_id")
    private Long player1Id; // Первый участник
    
    @Column("player2_id")
    private Long player2Id; // Второй участник
    
    @Column("player1_model_id") 
    private Long player1ModelId; // Модель первого игрока
    
    @Column("player2_model_id")
    private Long player2ModelId; // Модель второго игрока
    
    @Column("winner_id")
    private Long winnerId; // ID победителя (может быть null для ничьей)
    
    @Column("match_type")
    private String matchType; // Тип дуэли: "CLASSIFICATION", "COMPRESSION" и т.д.
    
    @Column("player1_score") 
    private Integer player1Score; // Очки первого игрока
    
    @Column("player2_score")
    private Integer player2Score; // Очки второго игрока
    
    @Column("started_at")
    private Instant startedAt; // Время начала матча
    
    @Column("ended_at")
    private Instant endedAt; // Время окончания матча
    
    @Column("match_data")
    private String matchData; // JSONB с детальной статистикой матча
    
    // Getters
    public Long getId() {
        return id;
    }
    
    public Long getPlayer1Id() {
        return player1Id;
    }
    
    public Long getPlayer2Id() {
        return player2Id;
    }
    
    public Long getPlayer1ModelId() {
        return player1ModelId;
    }
    
    public Long getPlayer2ModelId() {
        return player2ModelId;
    }
    
    public Long getWinnerId() {
        return winnerId;
    }
    
    public String getMatchType() {
        return matchType;
    }
    
    public Integer getPlayer1Score() {
        return player1Score;
    }
    
    public Integer getPlayer2Score() {
        return player2Score;
    }
    
    public Instant getStartedAt() {
        return startedAt;
    }
    
    public Instant getEndedAt() {
        return endedAt;
    }
    
    public String getMatchData() {
        return matchData;
    }
    
    // Setters
    public void setId(Long id) {
        this.id = id;
    }
    
    public void setPlayer1Id(Long player1Id) {
        this.player1Id = player1Id;
    }
    
    public void setPlayer2Id(Long player2Id) {
        this.player2Id = player2Id;
    }
    
    public void setPlayer1ModelId(Long player1ModelId) {
        this.player1ModelId = player1ModelId;
    }
    
    public void setPlayer2ModelId(Long player2ModelId) {
        this.player2ModelId = player2ModelId;
    }
    
    public void setWinnerId(Long winnerId) {
        this.winnerId = winnerId;
    }
    
    public void setMatchType(String matchType) {
        this.matchType = matchType;
    }
    
    public void setPlayer1Score(Integer player1Score) {
        this.player1Score = player1Score;
    }
    
    public void setPlayer2Score(Integer player2Score) {
        this.player2Score = player2Score;
    }
    
    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }
    
    public void setEndedAt(Instant endedAt) {
        this.endedAt = endedAt;
    }
    
    public void setMatchData(String matchData) {
        this.matchData = matchData;
    }
}