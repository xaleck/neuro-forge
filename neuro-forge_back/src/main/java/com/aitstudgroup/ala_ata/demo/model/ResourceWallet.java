package com.aitstudgroup.ala_ata.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("resource_wallets")
public class ResourceWallet {
    @Id
    private Long id;
    
    @Column("player_id")
    private Long playerId; // Владелец кошелька
    
    @Column("cloud_credits")
    private Integer cloudCredits = 0; // Основная валюта
    
    @Column("research_points")
    private Integer researchPoints = 0; // Редкая валюта для продвинутых апгрейдов
    
    @Version
    private Long version; // Для оптимистических блокировок
    
    // Getters
    public Long getId() {
        return id;
    }
    
    public Long getPlayerId() {
        return playerId;
    }
    
    public Integer getCloudCredits() {
        return cloudCredits;
    }
    
    public Integer getResearchPoints() {
        return researchPoints;
    }
    
    public Long getVersion() {
        return version;
    }
    
    // Setters
    public void setId(Long id) {
        this.id = id;
    }
    
    public void setPlayerId(Long playerId) {
        this.playerId = playerId;
    }
    
    public void setCloudCredits(Integer cloudCredits) {
        this.cloudCredits = cloudCredits;
    }
    
    public void setResearchPoints(Integer researchPoints) {
        this.researchPoints = researchPoints;
    }
    
    public void setVersion(Long version) {
        this.version = version;
    }
}