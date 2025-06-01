package com.aitstudgroup.ala_ata.demo.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("ai_model")
public class AIModel {
    @Id
    private Long id;

    @Column("name")
    private String name;

    @Column("player_id")
    private Long playerId;

    @Column("accuracy")
    private double accuracy;

    @Column("speed_score")
    private int speedScore;

    @Column("popularity_score")
    private int popularityScore;

    @Column("parameters")
    private String parameters; // В schema.sql TEXT

    @Column("created_at")
    private Instant createdAt;

    @Column("last_updated_at")
    private Instant lastUpdatedAt;

    // Конструкторы

    public AIModel() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getPlayerId() {
        return playerId;
    }

    public void setPlayerId(Long playerId) {
        this.playerId = playerId;
    }

    public double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(double accuracy) {
        this.accuracy = accuracy;
    }

    public int getSpeedScore() {
        return speedScore;
    }

    public void setSpeedScore(int speedScore) {
        this.speedScore = speedScore;
    }

    public int getPopularityScore() {
        return popularityScore;
    }

    public void setPopularityScore(int popularityScore) {
        this.popularityScore = popularityScore;
    }

    public String getParameters() {
        return parameters;
    }

    public void setParameters(String parameters) {
        this.parameters = parameters;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getLastUpdatedAt() {
        return lastUpdatedAt;
    }

    public void setLastUpdatedAt(Instant lastUpdatedAt) {
        this.lastUpdatedAt = lastUpdatedAt;
    }
}