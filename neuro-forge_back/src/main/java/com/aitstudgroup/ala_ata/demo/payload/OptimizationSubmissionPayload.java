package com.aitstudgroup.ala_ata.demo.payload;

public class OptimizationSubmissionPayload {
    private Long userId;
    private String code;
    private int step;

    // Constructors
    public OptimizationSubmissionPayload() {
    }

    public OptimizationSubmissionPayload(Long userId, String code, int step) {
        this.userId = userId;
        this.code = code;
        this.step = step;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public int getStep() {
        return step;
    }

    public void setStep(int step) {
        this.step = step;
    }

    @Override
    public String toString() {
        return "OptimizationSubmissionPayload{" +
                "userId=" + userId +
                ", code=\'" + code.substring(0, Math.min(code.length(), 30)) + "...\'" + // Truncate code for logging
                ", step=" + step +
                '}';
    }
} 