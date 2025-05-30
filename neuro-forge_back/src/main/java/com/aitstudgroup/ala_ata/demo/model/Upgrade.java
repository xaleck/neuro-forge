package com.aitstudgroup.ala_ata.demo.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("upgrade")
public class Upgrade {
    
    @Id
    private Long id;
    
    @Column("player_id")
    private Long playerId;
    
    @Column("upgrade_type")
    private String upgradeType;
    
    @Column("level")
    private Integer level;
    
    @Column("start_time")
    private Instant startTime;
    
    @Column("end_time")
    private Instant endTime;
    
    @Column("upgrade_finish_time")
    private Instant upgradeFinishTime;
    
    @Column("is_completed") 
    private Boolean isCompleted;
    
    @Column("is_upgrading")
    private Boolean isUpgrading;

    // Конструкторы
    public Upgrade() {}

    // Геттеры и сеттеры
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPlayerId() {
        return playerId;
    }

    public void setPlayerId(Long playerId) {
        this.playerId = playerId;
    }

    public String getUpgradeType() {
        return upgradeType;
    }

    public void setUpgradeType(String upgradeType) {
        this.upgradeType = upgradeType;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public Instant getUpgradeFinishTime() {
        return upgradeFinishTime;
    }

    public void setUpgradeFinishTime(Instant upgradeFinishTime) {
        this.upgradeFinishTime = upgradeFinishTime;
    }

    public Boolean getCompleted() {
        return isCompleted;
    }

    public void setCompleted(Boolean completed) {
        isCompleted = completed;
    }

    public Boolean getIsUpgrading() { // или используйте @JsonProperty
        return isUpgrading;
    }

    public void setUpgrading(Boolean upgrading) {
        isUpgrading = upgrading;
    }

    // Методы для удобства
    public boolean isCompleted() {
        return isCompleted != null && isCompleted;
    }

    public boolean isUpgrading() {
        return isUpgrading != null && isUpgrading;
    }
}