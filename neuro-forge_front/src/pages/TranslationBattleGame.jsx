import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const TranslationBattleGame = () => {
    const { t } = useTranslation();
    const { user, updateUserData } = useUser();
    const [gameState, setGameState] = useState({});
    const [rewardsProcessed, setRewardsProcessed] = useState(false);
    const [isSoloMode, setIsSoloMode] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (gameState.status === 'GAME_OVER' && !rewardsProcessed && !isSoloMode) {
            console.log('Game over, processing rewards...', gameState);

            const creditsEarned = gameState.totalScore; // Assuming totalScore is credits earned
            const currentCredits = user?.cloudCredits || 0;
            const newTotalCredits = currentCredits + creditsEarned;

            const currentElo = user?.eloRating || 1000;
            const eloChange = calculateEloChange(gameState.totalScore, gameState.roundsData.length * 10); // Example ELO change logic
            const newEloRating = currentElo + eloChange;

            const currentMatchesPlayed = user?.matchesPlayed || 0;
            const newMatchesPlayed = currentMatchesPlayed + 1;

            // Prepare match data for history
            const matchData = {
                id: `match_${Date.now()}`,
                date: new Date().toLocaleDateString(),
                mode: 'Solo Translation',
                finalScore: gameState.totalScore,
                result: 'Completed', // Could be enhanced later with Victory/Defeat logic
                rounds: gameState.roundsData.map((round, index) => ({
                    round: index + 1,
                    phraseId: round.phraseId, // Assuming phraseId is available
                    playerAnswer: round.playerAnswer,
                    correctAnswer: round.correctAnswer, // Assuming original phrase is correctAnswer
                    playerScore: round.score,
                    isCorrect: round.isCorrect,
                    result: round.isCorrect ? 'Correct' : 'Incorrect'
                })),
                eloChange: eloChange
            };

            const existingMatchHistory = user?.matchHistory || [];
            const updatedMatchHistory = [...existingMatchHistory, matchData];
            // Keep only the last, say, 20 matches to prevent localStorage from growing too large
            const MAX_MATCHES_IN_HISTORY = 20;
            if (updatedMatchHistory.length > MAX_MATCHES_IN_HISTORY) {
                updatedMatchHistory.splice(0, updatedMatchHistory.length - MAX_MATCHES_IN_HISTORY);
            }


            updateUserData({
                cloudCredits: newTotalCredits,
                eloRating: newEloRating,
                matchesPlayed: newMatchesPlayed,
                matchHistory: updatedMatchHistory // Add match history to user data
            });

            setRewardsProcessed(true);
            console.log('Rewards processed, new user data should be updated.');
        }
        if (isSoloMode && gameState.status === 'GAME_OVER' && !rewardsProcessed) {
            console.log('(Solo Mode) Game over, processing rewards...', gameState);
            setRewardsProcessed(true); // Set early to prevent re-entry if user object updates slowly

            const creditsEarned = gameState.totalScore;
            const currentCredits = user?.cloudCredits || 0;
            const newTotalCredits = currentCredits + creditsEarned;

            const currentElo = user?.eloRating || 1000;
            // Elo change: +10 for >70% score, +5 for >40%, 0 otherwise, -5 if <20%
            // Max possible score is rounds * 10
            const maxPossibleScore = gameState.roundsData.length * 10;
            const scorePercentage = maxPossibleScore > 0 ? (gameState.totalScore / maxPossibleScore) * 100 : 0;
            let eloChange = 0;
            if (scorePercentage >= 70) {
                eloChange = 10;
            } else if (scorePercentage >= 40) {
                eloChange = 5;
            } else if (scorePercentage < 20) {
                eloChange = -5;
            }
            const newEloRating = Math.max(0, currentElo + eloChange); // Elo cannot go below 0

            const currentMatchesPlayed = user?.matchesPlayed || 0;
            const newMatchesPlayed = currentMatchesPlayed + 1;

            const matchData = {
                id: `match_solo_${Date.now()}`,
                date: new Date().toLocaleString(), // Using toLocaleString for date and time
                mode: 'Solo Translation',
                finalScore: gameState.totalScore,
                result: eloChange > 0 ? 'Victory' : (eloChange < 0 ? 'Defeat' : 'Completed'),
                rounds: gameState.roundsData.map((round, index) => ({
                    round: index + 1,
                    phraseId: round.phraseDetails?.id || round.phraseId || 'unknown_phrase',
                    originalPhrase: round.phraseDetails?.text?.en || 'N/A', // Example: English text as original
                    playerAnswer: round.playerAnswer,
                    correctAnswer: round.correctAnswer || round.phraseDetails?.text?.[user?.learningLanguage || 'es'] || 'N/A',
                    playerScore: round.score,
                    isCorrect: round.isCorrect,
                    result: round.isCorrect ? 'Correct' : 'Incorrect'
                })),
                eloChange: eloChange,
                scorePercentage: parseFloat(scorePercentage.toFixed(1))
            };

            const existingMatchHistory = user?.matchHistory || [];
            let updatedMatchHistory = [...existingMatchHistory, matchData];

            const MAX_MATCHES_IN_HISTORY = 20;
            if (updatedMatchHistory.length > MAX_MATCHES_IN_HISTORY) {
                updatedMatchHistory = updatedMatchHistory.slice(updatedMatchHistory.length - MAX_MATCHES_IN_HISTORY);
            }

            console.log("Updating user data with new match:", matchData);
            updateUserData({
                cloudCredits: newTotalCredits,
                eloRating: newEloRating,
                matchesPlayed: newMatchesPlayed,
                matchHistory: updatedMatchHistory
            });

            // Navigate to results screen after a short delay
            // setTimeout(() => {
            //     navigate('/game-results', { state: { lastGameData: matchData } });
            // }, 100); 
        }
    }, [gameState.status, user, updateUserData, rewardsProcessed, isSoloMode, navigate, gameState.totalScore, gameState.roundsData]);

    return (
        <div>
            {/* Render your game components here */}
        </div>
    );
};

export default TranslationBattleGame; 