package com.aitstudgroup.ala_ata.demo.model;

import java.util.List;
import java.util.ArrayList;

public class OptimizationRallyState {

    public enum GameStatus {
        NOT_STARTED,
        ROUND_IN_PROGRESS, // General state indicating a round is active
        AWAITING_PLAYER_1_SUBMISSION,
        AWAITING_PLAYER_2_SUBMISSION,
        ROUND_COMPLETED, // Both players submitted for the current round, metrics calculated
        GAME_OVER
    }

    private String problemDescription;
    private String originalCode;
    private int timeSteps; // Total number of optimization rounds/steps
    private int currentStep; // Current active step (1-indexed)
    private List<OptimizationStepProgress> player1Progress;
    private List<OptimizationStepProgress> player2Progress;
    private GameStatus gameStatus;
    private Long lastSubmittingPlayerId; // To track whose submission completed a round
    private Long player1Id; // Store player IDs for context
    private Long player2Id;

    // Constructors
    public OptimizationRallyState() {
        this.player1Progress = new ArrayList<>();
        this.player2Progress = new ArrayList<>();
        this.gameStatus = GameStatus.NOT_STARTED;
        this.currentStep = 0; // Or 1 if rounds are 1-indexed from start
    }

    // Getters and Setters
    public String getProblemDescription() {
        return problemDescription;
    }

    public void setProblemDescription(String problemDescription) {
        this.problemDescription = problemDescription;
    }

    public String getOriginalCode() {
        return originalCode;
    }

    public void setOriginalCode(String originalCode) {
        this.originalCode = originalCode;
    }

    public int getTimeSteps() {
        return timeSteps;
    }

    public void setTimeSteps(int timeSteps) {
        this.timeSteps = timeSteps;
    }

    public int getCurrentStep() {
        return currentStep;
    }

    public void setCurrentStep(int currentStep) {
        this.currentStep = currentStep;
    }

    public List<OptimizationStepProgress> getPlayer1Progress() {
        return player1Progress;
    }

    public void setPlayer1Progress(List<OptimizationStepProgress> player1Progress) {
        this.player1Progress = player1Progress;
    }

    public List<OptimizationStepProgress> getPlayer2Progress() {
        return player2Progress;
    }

    public void setPlayer2Progress(List<OptimizationStepProgress> player2Progress) {
        this.player2Progress = player2Progress;
    }

    public GameStatus getGameStatus() {
        return gameStatus;
    }

    public void setGameStatus(GameStatus gameStatus) {
        this.gameStatus = gameStatus;
    }

    public Long getLastSubmittingPlayerId() {
        return lastSubmittingPlayerId;
    }

    public void setLastSubmittingPlayerId(Long lastSubmittingPlayerId) {
        this.lastSubmittingPlayerId = lastSubmittingPlayerId;
    }

    public Long getPlayer1Id() {
        return player1Id;
    }

    public void setPlayer1Id(Long player1Id) {
        this.player1Id = player1Id;
    }

    public Long getPlayer2Id() {
        return player2Id;
    }

    public void setPlayer2Id(Long player2Id) {
        this.player2Id = player2Id;
    }

    @Override
    public String toString() {
        return "OptimizationRallyState{" +
                "problemDescription='" + problemDescription + "\'" +
                ", originalCode='<omitted>" +
                ", timeSteps=" + timeSteps +
                ", currentStep=" + currentStep +
                ", player1ProgressCount=" + (player1Progress != null ? player1Progress.size() : 0) +
                ", player2ProgressCount=" + (player2Progress != null ? player2Progress.size() : 0) +
                ", gameStatus=" + gameStatus +
                ", lastSubmittingPlayerId=" + lastSubmittingPlayerId +
                ", player1Id=" + player1Id +
                ", player2Id=" + player2Id +
                '}';
    }
} 