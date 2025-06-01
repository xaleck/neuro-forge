package com.aitstudgroup.ala_ata.demo.service;

import com.aitstudgroup.ala_ata.demo.model.Match;
import com.aitstudgroup.ala_ata.demo.model.OptimizationRallyState;
import com.aitstudgroup.ala_ata.demo.model.OptimizationStepProgress;
import com.aitstudgroup.ala_ata.demo.repository.MatchRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class OptimizationRallyService {
    private static final Logger logger = LoggerFactory.getLogger(OptimizationRallyService.class);
    private final ObjectMapper objectMapper; // For JSON conversion
    private final SimpMessagingTemplate messagingTemplate; // For WebSocket updates
    private final MatchRepository matchRepository;
    private final Random random = new Random();

    // Default game data (can be moved to config or DB later)
    private static final String DEFAULT_PROBLEM_DESCRIPTION = "Задача: Оптимизировать функцию сортировки массива чисел (Bubble Sort)";
    private static final String DEFAULT_ORIGINAL_CODE = "function bubbleSort(arr) {\n" +
            "  let len = arr.length;\n" +
            "  for (let i = 0; i < len; i++) {\n" +
            "    for (let j = 0; j < len - i - 1; j++) {\n" +
            "      if (arr[j] > arr[j + 1]) {\n" +
            "        let temp = arr[j];\n" +
            "        arr[j] = arr[j + 1];\n" +
            "        arr[j + 1] = temp;\n" +
            "      }\n" +
            "    }\n" +
            "  }\n" +
            "  return arr;\n" +
            "}";
    private static final int DEFAULT_TIME_STEPS = 5;

    @Autowired
    public OptimizationRallyService(ObjectMapper objectMapper, SimpMessagingTemplate messagingTemplate, MatchRepository matchRepository) {
        this.objectMapper = objectMapper;
        this.messagingTemplate = messagingTemplate;
        this.matchRepository = matchRepository;
    }

    public OptimizationRallyState initializeNewGame(Long player1Id, Long player2Id) {
        OptimizationRallyState gameState = new OptimizationRallyState();
        gameState.setPlayer1Id(player1Id);
        gameState.setPlayer2Id(player2Id);
        gameState.setProblemDescription(DEFAULT_PROBLEM_DESCRIPTION);
        gameState.setOriginalCode(DEFAULT_ORIGINAL_CODE);
        gameState.setTimeSteps(DEFAULT_TIME_STEPS);
        gameState.setCurrentStep(1); // Start at step 1
        gameState.setGameStatus(OptimizationRallyState.GameStatus.ROUND_IN_PROGRESS); 
        // Or AWAITING_PLAYER_1_SUBMISSION if turns are sequential

        // Initialize progress for both players with the original code for step 0 (or as a baseline)
        // This isn't a formal step but can be useful for UI to show starting point.
        // For actual steps, lists will be populated on submission.
        gameState.setPlayer1Progress(new ArrayList<>());
        gameState.setPlayer2Progress(new ArrayList<>());

        logger.info("Initialized new Optimization Rally game state for players {} and {}: {}", player1Id, player2Id, gameState);
        return gameState;
    }

    public String convertGameStateToJson(OptimizationRallyState gameState) {
        try {
            return objectMapper.writeValueAsString(gameState);
        } catch (JsonProcessingException e) {
            logger.error("Error converting OptimizationRallyState to JSON: {}", e.getMessage());
            // Consider throwing a custom exception or returning a default error JSON
            return "{\"error\": \"Could not serialize game state\"}";
        }
    }

    public OptimizationRallyState convertJsonToGameState(String jsonState) {
        try {
            return objectMapper.readValue(jsonState, OptimizationRallyState.class);
        } catch (JsonProcessingException e) {
            logger.error("Error converting JSON to OptimizationRallyState: {}", e.getMessage());
            // Consider throwing a custom exception or returning a default/error state object
            return null; // Or a state object indicating error
        }
    }
    
    // Placeholder for code evaluation - to be expanded significantly
    private Map<String, Object> evaluateCode(String code, String originalCode) {
        Map<String, Object> metrics = new HashMap<>();
        // Simple heuristic: longer code might be more complex or less efficient initially
        // Shorter code might be more efficient. This is a gross simplification.
        int executionTime = 50 + random.nextInt(100) + (code.length() / 10); // Base + random + length factor
        int memoryUsage = 50 + random.nextInt(50) + (code.length() / 20);
        
        metrics.put("executionTime", Math.max(20, executionTime)); // Ensure minimums
        metrics.put("memoryUsage", Math.max(30, memoryUsage));

        // Mock complexity based on common patterns (very simplified)
        if (code.contains("for (") && code.substring(code.indexOf("for (") + 1).contains("for (")) {
            metrics.put("complexity", "n^2");
        } else if (code.contains("for (") || code.contains("while (") || code.contains(".forEach(") || code.contains(".map(")) {
            metrics.put("complexity", "n");
        } else if (code.contains(".sort(")) {
             metrics.put("complexity", "n log n");
        }else {
            metrics.put("complexity", "1"); // Constant time if no loops detected
        }
        
        // Calculate efficiency score (example, align with frontend if possible)
        double efficiency = calculateEfficiency(metrics);
        metrics.put("efficiencyScore", efficiency);

        logger.debug("Evaluated code (length {}), original (length {}), metrics: {}", code.length(), originalCode.length(), metrics);
        return metrics;
    }

    // Basic efficiency calculation (can be aligned with frontend logic)
    private double calculateEfficiency(Map<String, Object> metrics) {
        double executionTime = ((Number) metrics.getOrDefault("executionTime", 200)).doubleValue();
        double memoryUsage = ((Number) metrics.getOrDefault("memoryUsage", 200)).doubleValue();
        String complexityStr = (String) metrics.getOrDefault("complexity", "n^2");

        double complexityScore = getComplexityScore(complexityStr) * 10; // Scaled penalty

        double timeWeight = 0.4;
        double memoryWeight = 0.3;
        double complexityWeight = 0.3;

        double totalPenalty = (executionTime * timeWeight) +
                              (memoryUsage * memoryWeight) +
                              (complexityScore * complexityWeight);
        
        double efficiencyValue = 100 - (totalPenalty / 150.0 * 100.0);
        return Math.max(0, Math.min(100, efficiencyValue));
    }

    private int getComplexityScore(String complexityString) {
        if (complexityString == null) return 10;
        String s = complexityString.toLowerCase().replaceAll("[o()]", "").trim();
        if (s.equals("1")) return 1;
        if (s.equals("log n")) return 2;
        if (s.equals("n")) return 3;
        if (s.equals("n log n")) return 4;
        if (s.equals("n^2")) return 5;
        if (s.equals("n^3")) return 6;
        if (s.equals("2^n")) return 7;
        if (s.equals("n!")) return 8;
        return 10;
    }

    // Method to send game state updates via WebSocket
    public void broadcastGameStateUpdate(Long matchId, OptimizationRallyState gameState) {
        String topic = "/topic/duel/" + matchId + "/optimization/state";
        try {
            String gameStateJson = convertGameStateToJson(gameState);
            messagingTemplate.convertAndSend(topic, gameStateJson);
            logger.info("Broadcasted Optimization Rally game state update to {}: {}", topic, gameStateJson);
        } catch (Exception e) {
            logger.error("Error broadcasting game state update for match {}: {}", matchId, e.getMessage());
        }
    }

    // Method to handle player code submission
    public Mono<OptimizationRallyState> handlePlayerCodeSubmission(Long matchId, Long userId, String submittedCode, int stepNumber) {
        return matchRepository.findById(matchId)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Match not found: " + matchId)))
            .flatMap(match -> {
                OptimizationRallyState gameState = convertJsonToGameState(match.getMatchData());
                if (gameState == null) {
                    return Mono.error(new IllegalStateException("Could not parse game state for match: " + matchId));
                }

                if (gameState.getGameStatus() == OptimizationRallyState.GameStatus.GAME_OVER) {
                    logger.warn("Attempt to submit code for already ended match {}. Ignoring.", matchId);
                    return Mono.just(gameState); // Return current state without changes
                }

                if (stepNumber != gameState.getCurrentStep()) {
                    logger.warn("Submission for wrong step. Match {}, User {}, Submitted Step {}, Current Step {}. Ignoring.", 
                                matchId, userId, stepNumber, gameState.getCurrentStep());
                    return Mono.just(gameState); // Or error, depending on desired strictness
                }

                // Determine if player is P1 or P2 and if they already submitted for this step
                boolean isPlayer1 = userId.equals(gameState.getPlayer1Id());
                List<OptimizationStepProgress> playerProgress = isPlayer1 ? gameState.getPlayer1Progress() : gameState.getPlayer2Progress();

                // Check if player already submitted for this step (simple check by list size vs current step)
                if (playerProgress.size() >= gameState.getCurrentStep()) {
                    logger.warn("Player {} already submitted for step {} in match {}. Ignoring duplicate submission.", 
                                userId, gameState.getCurrentStep(), matchId);
                    // Optionally, allow re-submission by removing the last entry and adding a new one.
                    // For now, we ignore subsequent submissions for the same step by the same player.
                    return Mono.just(gameState);
                }

                Map<String, Object> metrics = evaluateCode(submittedCode, gameState.getOriginalCode());
                OptimizationStepProgress newProgress = new OptimizationStepProgress(submittedCode, metrics);
                playerProgress.add(newProgress); // Assumes list size correctly corresponds to steps completed by this player

                gameState.setLastSubmittingPlayerId(userId);

                // Update game status based on submissions for the current step
                int player1Submissions = gameState.getPlayer1Progress().size();
                int player2Submissions = gameState.getPlayer2Progress().size();
                int currentStep = gameState.getCurrentStep();

                if (player1Submissions == currentStep && player2Submissions == currentStep) {
                    // Both players have submitted for the current step
                    if (currentStep < gameState.getTimeSteps()) {
                        gameState.setGameStatus(OptimizationRallyState.GameStatus.ROUND_COMPLETED); // Intermediate status, frontend might show results then prompt to advance
                        // Or automatically advance to next round and set to ROUND_IN_PROGRESS
                        gameState.setCurrentStep(currentStep + 1);
                        gameState.setGameStatus(OptimizationRallyState.GameStatus.ROUND_IN_PROGRESS);
                        logger.info("Match {}, Step {}: Both players submitted. Advancing to step {}.", matchId, currentStep, gameState.getCurrentStep());
                    } else {
                        gameState.setGameStatus(OptimizationRallyState.GameStatus.GAME_OVER);
                        logger.info("Match {}: Game Over. All steps completed.", matchId);
                        // Here, we might also trigger MatchService.finishMatch logic if not handled by a separate call
                    }
                } else if (player1Submissions == currentStep) {
                    gameState.setGameStatus(OptimizationRallyState.GameStatus.AWAITING_PLAYER_2_SUBMISSION);
                     logger.info("Match {}, Step {}: Player 1 submitted. Awaiting Player 2.", matchId, currentStep);
                } else if (player2Submissions == currentStep) {
                    gameState.setGameStatus(OptimizationRallyState.GameStatus.AWAITING_PLAYER_1_SUBMISSION);
                    logger.info("Match {}, Step {}: Player 2 submitted. Awaiting Player 1.", matchId, currentStep);
                } else {
                    // Should not happen if logic is correct, implies one player submitted more than current step allows
                    logger.warn("Match {}, Step {}: Inconsistent submission count (P1: {}, P2: {}). Review logic.", 
                                matchId, currentStep, player1Submissions, player2Submissions);
                    gameState.setGameStatus(OptimizationRallyState.GameStatus.ROUND_IN_PROGRESS); // Default back
                }
                
                String updatedMatchDataJson = convertGameStateToJson(gameState);
                return matchRepository.updateMatchData(matchId, updatedMatchDataJson)
                    .thenReturn(gameState) // Return the updated game state object
                    .doOnSuccess(gs -> broadcastGameStateUpdate(matchId, gs));
            });
    }
} 