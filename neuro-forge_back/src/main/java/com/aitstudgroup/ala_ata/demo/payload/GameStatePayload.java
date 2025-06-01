package com.aitstudgroup.ala_ata.demo.payload;

import java.util.List;
import java.util.Map;

public class GameStatePayload {
    private String gameType;
    private int totalRounds;
    private int currentRound;
    private List<Map<String, String>> phrases; // List of phrase objects
    private List<Map<String, Object>> roundsData; // List of round results
    private int player1GameScore;
    private int player2GameScore;
    private int currentPhraseIndex;
    private String roundStartTime; // Consider Instant or long for timestamp
    private int roundTimeLimit;
    private String gameState; // e.g., WAITING_FOR_PLAYERS, ROUND_IN_PROGRESS, GAME_OVER

    // Constructor, Getters, and Setters

    public GameStatePayload() {}

    public String getGameType() {
        return gameType;
    }

    public void setGameType(String gameType) {
        this.gameType = gameType;
    }

    public int getTotalRounds() {
        return totalRounds;
    }

    public void setTotalRounds(int totalRounds) {
        this.totalRounds = totalRounds;
    }

    public int getCurrentRound() {
        return currentRound;
    }

    public void setCurrentRound(int currentRound) {
        this.currentRound = currentRound;
    }

    public List<Map<String, String>> getPhrases() {
        return phrases;
    }

    public void setPhrases(List<Map<String, String>> phrases) {
        this.phrases = phrases;
    }

    public List<Map<String, Object>> getRoundsData() {
        return roundsData;
    }

    public void setRoundsData(List<Map<String, Object>> roundsData) {
        this.roundsData = roundsData;
    }

    public int getPlayer1GameScore() {
        return player1GameScore;
    }

    public void setPlayer1GameScore(int player1GameScore) {
        this.player1GameScore = player1GameScore;
    }

    public int getPlayer2GameScore() {
        return player2GameScore;
    }

    public void setPlayer2GameScore(int player2GameScore) {
        this.player2GameScore = player2GameScore;
    }

    public int getCurrentPhraseIndex() {
        return currentPhraseIndex;
    }

    public void setCurrentPhraseIndex(int currentPhraseIndex) {
        this.currentPhraseIndex = currentPhraseIndex;
    }

    public String getRoundStartTime() {
        return roundStartTime;
    }

    public void setRoundStartTime(String roundStartTime) {
        this.roundStartTime = roundStartTime;
    }

    public int getRoundTimeLimit() {
        return roundTimeLimit;
    }

    public void setRoundTimeLimit(int roundTimeLimit) {
        this.roundTimeLimit = roundTimeLimit;
    }

    public String getGameState() {
        return gameState;
    }

    public void setGameState(String gameState) {
        this.gameState = gameState;
    }
} 