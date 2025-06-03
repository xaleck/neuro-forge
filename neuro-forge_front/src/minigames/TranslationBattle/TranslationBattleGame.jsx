import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Adjusted path

// Props: matchId, user, stompClient, initialMatchDetails, isSoloMode
export default function TranslationBattleGame({ matchId, user, stompClient, initialMatchDetails, isSoloMode }) {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(null); // Will be populated by initialMatchDetails and WebSocket updates
  const [playerTranslation, setPlayerTranslation] = useState('');
  const [playerNumericAnswer, setPlayerNumericAnswer] = useState('');
  const [currentRoundTimeLeft, setCurrentRoundTimeLeft] = useState(0);
  const { updateUserData } = useAuth(); // Получаем updateUserData из AuthContext
  const [rewardsProcessed, setRewardsProcessed] = useState(false);

  // Initialize game state from initialMatchDetails.matchData or WebSocket
  useEffect(() => {
    if (initialMatchDetails && initialMatchDetails.matchData) {
      let allowUpdate = false;
      let newGameStateFromDetails = null;

      try {
        newGameStateFromDetails = JSON.parse(initialMatchDetails.matchData);
      } catch (e) {
        console.error('[TranslationBattleGame] Error parsing initialMatchDetails.matchData:', e);
        setGameState({ gameState: 'ERROR_LOADING', status: 'ERROR' });
        return; // Exit if parsing fails
      }

      if (gameState === null) {
        allowUpdate = true;
        console.log('[TranslationBattleGame] Initializing gameState (was null) from initialMatchDetails.matchData');
      } else if (!isSoloMode) {
        allowUpdate = true;
        console.log('[TranslationBattleGame] Network mode: Updating gameState from initialMatchDetails.matchData');
      } else { // isSoloMode is true and gameState is not null
        // For solo mode, only allow update from initialMatchDetails if the game is in a pre-start state.
        // This allows initial phrase loading but prevents reset if game is in progress or over.
        if (gameState.gameState === 'NOT_STARTED' || gameState.gameState === 'WAITING_FOR_PLAYERS') {
          allowUpdate = true;
          console.log(`[TranslationBattleGame] Solo mode (state: ${gameState.gameState}): Updating gameState from initialMatchDetails (e.g., for phrase loading)`);
        } else {
          console.log(`[TranslationBattleGame] Solo mode (state: ${gameState.gameState}): Ignoring initialMatchDetails update to prevent game reset.`);
        }
      }

      if (allowUpdate && newGameStateFromDetails) {
        setGameState(newGameStateFromDetails);
        if (newGameStateFromDetails.roundTimeLimit !== undefined) {
          // Set or reset timer based on the new state's roundTimeLimit
          // This is especially important if gameState was null or game state type changes (e.g. NOT_STARTED to ROUND_IN_PROGRESS)
          setCurrentRoundTimeLeft(newGameStateFromDetails.roundTimeLimit);
        }
      }
    }
    // gameState is intentionally omitted from dependencies here to prevent re-running this effect
    // on every gameState change. The logic inside correctly handles decisions based on the current gameState.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMatchDetails, isSoloMode]);

  // WebSocket subscription for game state updates
  useEffect(() => {
    if (!isSoloMode && stompClient && stompClient.connected && matchId) {
      console.log(`[TranslationBattleGame] Subscribing to /topic/duel/${matchId}/translation/state`);
      const subscription = stompClient.subscribe(`/topic/duel/${matchId}/translation/state`, message => {
        try {
          const updatedGameState = JSON.parse(message.body);
          console.log('[TranslationBattleGame] Received game state update via WebSocket:', updatedGameState);
          setGameState(updatedGameState);
          if (updatedGameState.roundTimeLimit) {
            setCurrentRoundTimeLeft(updatedGameState.roundTimeLimit);
          }
        } catch (e) {
          console.error('[TranslationBattleGame] Error parsing WebSocket game state update:', e);
        }
      });

      return () => {
        console.log(`[TranslationBattleGame] Unsubscribing from /topic/duel/${matchId}/translation/state`);
        subscription.unsubscribe();
      };
    }
  }, [stompClient, matchId, isSoloMode]);

  // Round Timer Logic
  useEffect(() => {
    if (gameState && gameState.gameState === 'ROUND_IN_PROGRESS' && gameState.roundTimeLimit) {
      // Initialize timer based on roundStartTime from server if available for more accuracy
      // For simplicity, we're using roundTimeLimit directly here and server will be the source of truth for time expiry.
      setCurrentRoundTimeLeft(gameState.roundTimeLimit);
      const timer = setInterval(() => {
        setCurrentRoundTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            // Time's up - server should handle this, but client can reflect visually
            console.log("[TranslationBattleGame] Round timer expired on client.");
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState?.gameState, gameState?.currentRound, gameState?.roundTimeLimit, gameState?.roundStartTime]);

  // ОПРЕДЕЛЯЕМ currentPhraseData ЗДЕСЬ, ДО useCallback
  const currentPhraseData = gameState?.phrases && gameState?.currentPhraseIndex >= 0 && gameState?.currentPhraseIndex < gameState.phrases.length
    ? gameState.phrases[gameState.currentPhraseIndex]
    : null;

  const currentQuestionType = currentPhraseData?.questionType; // 'TRANSLATION' or 'MATH'

  const handleStartGame = useCallback(() => {
    if (isSoloMode && user && gameState) { // Логика для одиночного режима
      console.log('[TranslationBattleGame] Starting solo game');
      setGameState(prevGameState => ({
        ...prevGameState,
        gameState: 'ROUND_IN_PROGRESS',
        currentRound: 1,
        currentPhraseIndex: 0, // Начать с первой фразы
        roundStartTime: new Date().toISOString(), // Зафиксировать время начала раунда
        player1GameScore: 0, // Сбросить очки для новой игры
        roundsData: [], // Очистить данные предыдущих раундов, если есть
        rewardsProcessed: false, // Сбросить флаг обработанных наград для новой игры
      }));
      // Таймер раунда должен запуститься через useEffect, который следит за gameState.gameState
    } else if (stompClient && stompClient.connected && matchId && user) { // Существующая логика для сетевой игры
      console.log('[TranslationBattleGame] Sending start game request');
      stompClient.publish({
        destination: `/app/duel/${matchId}/translation/start`,
        body: JSON.stringify({ userId: user.id }),
      });
    } else {
      console.warn('[TranslationBattleGame] Cannot start game. Conditions not met.', { isSoloMode, stompClient, matchId, user });
    }
  }, [stompClient, matchId, user, isSoloMode, gameState]); // Добавил isSoloMode и gameState в зависимости

  const handleAnswerChange = (e) => {
    if (currentQuestionType === 'MATH') {
      setPlayerNumericAnswer(e.target.value);
    } else {
      setPlayerTranslation(e.target.value);
    }
  };

  const handleSubmitAnswer = useCallback(() => {
    if (!isSoloMode || !user || !gameState || gameState.gameState !== 'ROUND_IN_PROGRESS' || !currentPhraseData) {
      console.warn('[TranslationBattleGame] handleSubmitAnswer: Conditions for execution not met or invalid state.');
      return;
    }

    let isCorrect = false;
    let scoreForRound = 0;
    let roundDataToAdd = {};

    if (currentQuestionType === 'MATH') {
      const playerAnswerNum = parseFloat(playerNumericAnswer);
      const correctAnswerNum = parseFloat(currentPhraseData.correctAnswer);
      isCorrect = playerAnswerNum === correctAnswerNum;
      scoreForRound = isCorrect ? 10 : 0;
      roundDataToAdd = {
        round: gameState.currentRound,
        questionText: currentPhraseData.text,
        playerNumericAnswer: playerAnswerNum,
        correctNumericAnswer: correctAnswerNum,
        score: scoreForRound,
        isCorrect: isCorrect,
        questionType: 'MATH'
      };
    } else { // TRANSLATION
      isCorrect = playerTranslation.trim().toLowerCase() === currentPhraseData.correctAnswer.toLowerCase();
      scoreForRound = isCorrect ? 10 : 0;
      roundDataToAdd = {
        round: gameState.currentRound,
        phraseId: currentPhraseData.text, // Or a proper ID if available
        originalPhrase: currentPhraseData.text, // Assuming text is original for now
        playerAnswer: playerTranslation,
        correctAnswer: currentPhraseData.correctAnswer,
        score: scoreForRound,
        isCorrect: isCorrect,
        questionType: 'TRANSLATION'
      };
    }

    setGameState(prevGameState => {
      const newPlayer1Score = prevGameState.player1GameScore + scoreForRound;
      const newRoundsData = [...(prevGameState.roundsData || []), roundDataToAdd];
      let nextGameState = 'ROUND_IN_PROGRESS';
      let nextRound = prevGameState.currentRound;
      let nextPhraseIndex = prevGameState.currentPhraseIndex;

      if (prevGameState.currentRound >= prevGameState.totalRounds) {
        nextGameState = 'GAME_OVER';
      } else {
        nextRound = prevGameState.currentRound + 1;
        nextPhraseIndex = prevGameState.currentPhraseIndex + 1;
      }
      return {
        ...prevGameState,
        player1GameScore: newPlayer1Score,
        roundsData: newRoundsData,
        currentRound: nextRound,
        currentPhraseIndex: nextPhraseIndex,
        gameState: nextGameState,
        status: nextGameState === 'GAME_OVER' ? 'GAME_OVER' : prevGameState.status, // Update status for GAME_OVER logic
        roundStartTime: nextGameState === 'ROUND_IN_PROGRESS' ? new Date().toISOString() : prevGameState.roundStartTime,
      };
    });

    setPlayerTranslation('');
    setPlayerNumericAnswer('');

  }, [user, gameState, currentPhraseData, playerTranslation, playerNumericAnswer, isSoloMode, currentQuestionType]);

  // useEffect for game state changes, including GAME_OVER logic
  useEffect(() => {
    // Check if gameState is not null before trying to access its properties
    if (isSoloMode && gameState && gameState.status === 'GAME_OVER' && !rewardsProcessed) { // Added null check for gameState
      console.log('(Solo Mode) Game over, processing rewards...', gameState);
      setRewardsProcessed(true);

      const creditsEarned = gameState.player1GameScore;
      const currentCredits = user?.cloudCredits || 0;
      const newTotalCredits = currentCredits + creditsEarned;

      const currentElo = user?.eloRating || 1000;
      const maxPossibleScore = gameState.totalRounds * 10;
      const scorePercentage = maxPossibleScore > 0 ? (gameState.player1GameScore / maxPossibleScore) * 100 : 0;
      let eloChange = 0;
      if (scorePercentage >= 70) {
        eloChange = 10;
      } else if (scorePercentage >= 40) {
        eloChange = 5;
      } else if (scorePercentage < 20 && scorePercentage >= 0) {
        eloChange = -5;
      }
      const newEloRating = Math.max(0, currentElo + eloChange);

      const currentMatchesPlayed = user?.matchesPlayed || 0;
      const newMatchesPlayed = currentMatchesPlayed + 1;

      const gameModeForHistory = initialMatchDetails?.gameModeName || (gameState.gameType === 'MATH_QUIZ' ? 'Math Quiz' : 'Solo Translation');

      // Adapt matchData.rounds based on questionType from gameState.roundsData
      const historyRounds = gameState.roundsData.map((round, index) => {
        if (round.questionType === 'MATH') {
          return {
            round: round.round || index + 1,
            questionText: round.questionText,
            playerAnswer: round.playerNumericAnswer?.toString() || 'N/A',
            correctAnswer: round.correctNumericAnswer?.toString() || 'N/A',
            playerScore: round.score,
            isCorrect: round.isCorrect,
            result: round.isCorrect ? 'Correct' : 'Incorrect'
          };
        } else { // TRANSLATION or default
          return {
            round: round.round || index + 1,
            phraseId: round.phraseId,
            originalPhrase: round.originalPhrase || round.phraseId,
            playerAnswer: round.playerAnswer,
            correctAnswer: round.correctAnswer,
            playerScore: round.score,
            isCorrect: round.isCorrect,
            result: round.isCorrect ? 'Correct' : 'Incorrect'
          };
        }
      });

      const matchData = {
        id: `${gameModeForHistory.toLowerCase().replace(' ', '-')}-${Date.now()}`,
        date: new Date().toLocaleString(),
        mode: gameModeForHistory,
        finalScore: gameState.player1GameScore,
        result: eloChange > 0 ? 'Victory' : (eloChange < 0 ? 'Defeat' : 'Completed'),
        rounds: historyRounds, // Use adapted rounds for history
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
    }
    // Updated dependency array: use gameState directly instead of its properties.
  }, [gameState, user, updateUserData, rewardsProcessed, isSoloMode, navigate, initialMatchDetails]);

  // --- UI Rendering --- //
  if (!gameState || !currentPhraseData && gameState.gameState === 'ROUND_IN_PROGRESS') {
    // Simplified loading state or phrase waiting state
    let loadingMessage = "Loading Game...";
    if (gameState && gameState.gameState === 'NOT_STARTED') loadingMessage = "Preparing game...";
    else if (gameState && gameState.gameState === 'ROUND_IN_PROGRESS' && !currentPhraseData) loadingMessage = "Waiting for phrase...";
    else if (gameState && gameState.gameState === 'ERROR_LOADING') loadingMessage = "Error loading game data. Please try again.";
    else if (gameState && gameState.gameState === 'ERROR_UNKNOWN_GAMETYPE') loadingMessage = "Error: Unknown game type configured.";

    return <div className="text-center py-10"><p className="text-xl">{loadingMessage}</p></div>;
  }

  if (gameState.gameState === 'ERROR_LOADING') {
    return <div className="text-center py-10 text-red-500"><p className="text-xl">Error loading game data. Please try again.</p></div>;
  }

  const getPlayerScore = (playerNumber) => {
    if (!user || !initialMatchDetails) return 0;
    if (playerNumber === 1 && initialMatchDetails.player1Id === user.id) return gameState.player1GameScore;
    if (playerNumber === 1 && initialMatchDetails.player2Id === user.id) return gameState.player2GameScore; // Current user is p2, show their score as "player1GameScore" on their screen effectively
    if (playerNumber === 2 && initialMatchDetails.player2Id === user.id) return gameState.player1GameScore;
    if (playerNumber === 2 && initialMatchDetails.player1Id === user.id) return gameState.player2GameScore;
    // Fallback if user ID doesn't match player1 or player2 (e.g. spectator, though not fully supported here)
    return playerNumber === 1 ? gameState.player1GameScore : gameState.player2GameScore;
  };

  const ownScore = initialMatchDetails && user.id === initialMatchDetails.player1Id ? gameState.player1GameScore : gameState.player2GameScore;
  const opponentScore = initialMatchDetails && user.id === initialMatchDetails.player1Id ? gameState.player2GameScore : gameState.player1GameScore;

  // --- Game State Based UI --- //

  if (gameState.gameState === 'NOT_STARTED' || gameState.gameState === 'WAITING_FOR_PLAYERS') {
    return (
      <div className="text-center py-10">
        <h3 className="text-2xl font-bold mb-4">{initialMatchDetails?.gameModeName || 'Game Lobby'}</h3>
        {gameState.gameState === 'NOT_STARTED' && <p className="text-lg mb-6">The game hasn't started yet. Click below when ready!</p>}
        {gameState.gameState === 'WAITING_FOR_PLAYERS' && <p className="text-lg mb-6">Waiting for opponent to join...</p>}
        <button
          onClick={handleStartGame}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-xl"
        >
          {gameState.gameState === 'NOT_STARTED' ? 'I am Ready!' : 'Join Game'}
        </button>
      </div>
    );
  }

  if (gameState.gameState === 'ROUND_IN_PROGRESS') {
    if (!currentPhraseData) {
      return <div className="text-center py-10"><p className="text-xl">Waiting for phrase...</p></div>;
    }

    // Добавляем логирование для состояния disabled кнопки
    const isSubmitDisabled = currentQuestionType === 'MATH' ? playerNumericAnswer === '' : playerTranslation.trim() === '';
    console.log('[TranslationBattleGame] Submit button state:', {
      isDisabled: isSubmitDisabled,
      currentGameState: gameState.gameState,
      isPlayerTranslationEmpty: playerTranslation.trim() === ''
    });

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl">Round: {gameState.currentRound}/{gameState.totalRounds}</span>
          <span className="text-xl font-mono bg-gray-700 px-4 py-2 rounded">
            Time: {Math.floor(currentRoundTimeLeft / 60)}:{(currentRoundTimeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          {currentQuestionType === 'TRANSLATION' && (
            <div className="flex justify-between text-sm mb-2">
              <span>Source: {currentPhraseData.sourceLang}</span>
              <span>Target: {currentPhraseData.targetLang}</span>
            </div>
          )}
          <p className="text-2xl font-medium text-yellow-300 mb-4 whitespace-pre-wrap">
            {currentPhraseData.text}
          </p>
          {currentQuestionType === 'MATH' ? (
            <input
              type="number"
              className="w-full p-4 bg-gray-900 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-yellow-500 outline-none"
              placeholder="Your answer..."
              value={playerNumericAnswer}
              onChange={handleAnswerChange}
              disabled={gameState.gameState !== 'ROUND_IN_PROGRESS'}
            />
          ) : (
            <textarea
              className="w-full p-4 bg-gray-900 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-yellow-500 outline-none"
              rows="3"
              placeholder="Type your translation here..."
              value={playerTranslation}
              onChange={handleAnswerChange}
              disabled={gameState.gameState !== 'ROUND_IN_PROGRESS'}
            ></textarea>
          )}
        </div>
        <div className="text-center">
          <button
            onClick={handleSubmitAnswer}
            disabled={isSubmitDisabled}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg disabled:opacity-50"
          >
            Submit Answer
          </button>
        </div>
      </>
    );
  }

  if (gameState.gameState === 'GAME_OVER') {
    const finalScoreDisplay = isSoloMode ? gameState.player1GameScore : `You (${ownScore}) - Opponent (${opponentScore})`;
    const gameResultText = isSoloMode
      ? (gameState.player1GameScore > 0 ? "Good Job!" : "Game Completed!")
      : (ownScore > opponentScore ? "You Won!" : ownScore < opponentScore ? "You Lost!" : "It's a Tie!");

    return (
      <div className="text-center py-10">
        <h3 className="text-3xl font-bold mb-6">Game Over!</h3>
        <p className="text-2xl mb-4">
          {isSoloMode ? `Final Score: ${gameState.player1GameScore}` : `Final Score: You (${ownScore}) - Opponent (${opponentScore})`}
        </p>
        <p className={`text-2xl font-semibold mb-4 ${isSoloMode
          ? 'text-blue-400'
          : ownScore > opponentScore
            ? 'text-green-400'
            : ownScore < opponentScore
              ? 'text-red-400'
              : 'text-yellow-400'
          }`}
        >
          {isSoloMode ? (gameState.player1GameScore > 0 ? "Well Done!" : "Game Completed") : gameResultText}
        </p>

        <div className="mt-8 w-full max-w-md mx-auto">
          <h4 className="text-xl font-semibold mb-3">Round Summary</h4>
          <div className="bg-gray-800 rounded-lg p-4 text-left">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-2 px-1">Rnd</th>
                  <th className="py-2 px-1">Вопрос/Фраза</th>
                  <th className="py-2 px-1">Your Score</th>
                  {!isSoloMode && <th className="py-2 px-1">Opp Score</th>}
                </tr>
              </thead>
              <tbody>
                {gameState.roundsData && gameState.roundsData.map((round, index) => {
                  const userIsPlayer1 = initialMatchDetails && user.id === initialMatchDetails.player1Id;
                  const displayScore = round.score !== undefined
                    ? round.score
                    : (round.playerScore !== undefined ? round.playerScore : '-');

                  const p1Score = round.player1_score !== undefined ? round.player1_score : '-';
                  const p2Score = round.player2_score !== undefined ? round.player2_score : '-';

                  const roundScoreForDisplay = isSoloMode ? displayScore : (userIsPlayer1 ? p1Score : p2Score);
                  const opponentScoreForDisplay = isSoloMode ? '-' : (userIsPlayer1 ? p2Score : p1Score);

                  return (
                    <tr key={index} className="border-t border-gray-700 hover:bg-gray-750">
                      <td className="py-2 px-1">{round.round || index + 1}</td>
                      <td className="py-2 px-1">{round.questionText || round.originalPhrase || round.phraseId || 'N/A'}</td>
                      <td className="py-2 px-1">{roundScoreForDisplay}</td>
                      {!isSoloMode && <td className="py-2 px-1">{opponentScoreForDisplay}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <button
          onClick={() => {
            // Для соло режима, можно просто сбросить состояние для новой игры
            // или перенаправить на Dashboard
            if (isSoloMode) {
              // Простой сброс для возможности "Play Again" на той же странице
              // В SoloTranslationBattlePage при желании можно добавить кнопку "Back to Dashboard"
              handleStartGame();
            } else {
              handleStartGame(); // Для сетевой игры это запрос на новый матч
            }
          }}
          className="mt-10 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-xl"
        >
          Play Again?
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-10 ml-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-xl"
          title="Back to Dashboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </button>
      </div>
    );
  }

  // Fallback for any other game states or if currentPhraseData is null during ROUND_IN_PROGRESS (should be handled)
  return (
    <div className="text-center py-10">
      <p className="text-xl">Current Game State: {gameState.gameState}</p>
      <p>Waiting for server or game to progress...</p>
      {/* Optionally show current scores if available */}
      <p>Your Score: {ownScore}</p>
      <p>Opponent Score: {opponentScore}</p>
    </div>
  );
} 