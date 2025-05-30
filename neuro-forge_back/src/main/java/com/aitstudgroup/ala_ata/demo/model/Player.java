package com.aitstudgroup.ala_ata.demo.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("players")
public class Player {
    @Id
    private Long id;
    
    @Column("username")
    private String username; // Уникальное имя пользователя
    
    @Column("email")
    private String email; // Email для аутентификации
    
    @Column("password_hash")
    private String passwordHash; // Хранится хеш пароля, не сам пароль
    
    @Column("elo_rating")
    private Integer eloRating = 1000; // Начальный рейтинг для подбора соперников
    
    @Column("created_at")
    private Instant createdAt; // Дата регистрации
    
    @Column("last_login_at")
    private Instant lastLoginAt; // Последнее посещение
    
    // Getters
    public Long getId() {
        return id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public String getPasswordHash() {
        return passwordHash;
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
    
    
    // Setters
    public void setId(Long id) {
        this.id = id;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
    
    public void setEloRating(Integer eloRating) {
        this.eloRating = eloRating;
    }
    
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
    
    public void setLastLoginAt(Instant lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }
    
}