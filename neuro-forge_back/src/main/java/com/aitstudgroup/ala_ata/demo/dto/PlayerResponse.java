package com.aitstudgroup.ala_ata.demo.dto;

import java.time.Instant;

import com.aitstudgroup.ala_ata.demo.model.Player;

public class PlayerResponse {
    private Long id;
    private String username;
    private String email;
    private Integer eloRating;
    private Instant createdAt;
    private Instant lastLoginAt;
    private Long clanId;
    private String errorMessage;
    
    // Конструктор для преобразования из модели
    public PlayerResponse(Player player, String errorMessage) {
        if (player != null) {
            this.id = player.getId();
            this.username = player.getUsername();
            this.email = player.getEmail();
            this.eloRating = player.getEloRating();
            this.createdAt = player.getCreatedAt();
            this.lastLoginAt = player.getLastLoginAt();
        }
        this.errorMessage = errorMessage;
    }
    
    // Геттеры
    public Long getId() {
        return id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public Integer getEloRating() {
        return eloRating;
    }
    
    public Instant getCreatedAt() {
        return createdAt;
    }
    
    public Instant getLastLoginAt() {
        return lastLoginAt;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
}