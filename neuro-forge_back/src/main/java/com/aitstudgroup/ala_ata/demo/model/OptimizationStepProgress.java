package com.aitstudgroup.ala_ata.demo.model;

import java.util.Map;

public class OptimizationStepProgress {
    private String code;
    private Map<String, Object> metrics; // e.g., {"executionTime": 120, "memoryUsage": 85, "complexity": "n^2", "efficiencyScore": 75.5}

    // Constructors
    public OptimizationStepProgress() {
    }

    public OptimizationStepProgress(String code, Map<String, Object> metrics) {
        this.code = code;
        this.metrics = metrics;
    }

    // Getters and Setters
    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Map<String, Object> getMetrics() {
        return metrics;
    }

    public void setMetrics(Map<String, Object> metrics) {
        this.metrics = metrics;
    }

    @Override
    public String toString() {
        return "OptimizationStepProgress{" +
                "code='<omitted>" +
                ", metrics=" + metrics +
                '}';
    }
} 