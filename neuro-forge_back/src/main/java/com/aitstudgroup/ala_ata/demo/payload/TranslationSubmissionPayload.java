package com.aitstudgroup.ala_ata.demo.payload;

public class TranslationSubmissionPayload {
    private Long userId;
    private String translation;
    private int round;

    // Getters
    public Long getUserId() {
        return userId;
    }

    public String getTranslation() {
        return translation;
    }

    public int getRound() {
        return round;
    }

    // Setters
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setTranslation(String translation) {
        this.translation = translation;
    }

    public void setRound(int round) {
        this.round = round;
    }

    // toString, equals, hashCode could be added if needed
} 