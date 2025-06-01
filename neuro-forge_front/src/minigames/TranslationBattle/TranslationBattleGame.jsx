import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext'; // Adjusted path

// Props: matchId, user, stompClient, initialMatchDetails
export default function TranslationBattleGame({ matchId, user, stompClient, initialMatchDetails }) {
  const [gameState, setGameState] = useState(null); // Will be populated by initialMatchDetails and WebSocket updates
  const [playerTranslation, setPlayerTranslation] = useState('');
  const [currentRoundTimeLeft, setCurrentRoundTimeLeft] = useState(0);

  // Initialize game state from initialMatchDetails.matchData or WebSocket
  useEffect(() => {
    if (initialMatchDetails && initialMatchDetails.matchData) {
      try {
        const backendGameState = JSON.parse(initialMatchDetails.matchData);
        console.log('[TranslationBattleGame] Initializing gameState from initialMatchDetails.matchData:', backendGameState);
        setGameState(backendGameState);
        if (backendGameState.roundTimeLimit) {
          setCurrentRoundTimeLeft(backendGameState.roundTimeLimit);
        }
      } catch (e) {
        console.error('[TranslationBattleGame] Error parsing initialMatchDetails.matchData:', e);
        // Fallback or error state if initial data is corrupt
        setGameState({ gameState: 'ERROR_LOADING' });
      }
    }
  }, [initialMatchDetails]);

  // WebSocket subscription for game state updates
  useEffect(() => {
    if (stompClient && stompClient.connected && matchId) {
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
  }, [stompClient, matchId]);

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

  const handleStartGame = useCallback(() => {
    if (stompClient && stompClient.connected && matchId && user) {
      console.log('[TranslationBattleGame] Sending start game request');
      stompClient.publish({
        destination: `/app/duel/${matchId}/translation/start`,
        body: JSON.stringify({ userId: user.id }),
      });
    }
  }, [stompClient, matchId, user]);

  const handleTranslationChange = (e) => {
    setPlayerTranslation(e.target.value);
  };

  const handleSubmitTranslation = useCallback(() => {
    if (stompClient && stompClient.connected && matchId && user && gameState && gameState.currentRound > 0) {
      console.log(`[TranslationBattleGame] Submitting translation for round ${gameState.currentRound}: ${playerTranslation}`);
      stompClient.publish({
        destination: `/app/duel/${matchId}/translation/submit`,
        body: JSON.stringify({
          userId: user.id,
          translation: playerTranslation,
          round: gameState.currentRound,
        }),
      });
      setPlayerTranslation(''); // Clear input after submission
    }
  }, [stompClient, matchId, user, gameState, playerTranslation]);
  
  // --- UI Rendering --- //
  if (!gameState) {
    return <div className="text-center py-10"><p className="text-xl">Loading Translation Battle...</p></div>;
  }

  if (gameState.gameState === 'ERROR_LOADING') {
    return <div className="text-center py-10 text-red-500"><p className="text-xl">Error loading game data. Please try again.</p></div>;
  }

  const currentPhraseData = gameState.phrases && gameState.currentPhraseIndex >= 0 && gameState.currentPhraseIndex < gameState.phrases.length 
                            ? gameState.phrases[gameState.currentPhraseIndex] 
                            : null;
  
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
        <h3 className="text-2xl font-bold mb-4">Translation Battle</h3>
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
    return (
      <>
        <div className="flex justify-between items-center mb-4">
            <span className="text-xl">Round: {gameState.currentRound}/{gameState.totalRounds}</span>
            <span className="text-xl font-mono bg-gray-700 px-4 py-2 rounded">
                Time: {Math.floor(currentRoundTimeLeft / 60)}:{(currentRoundTimeLeft % 60).toString().padStart(2, '0')}
            </span>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Source: {currentPhraseData.sourceLang}</span>
            <span>Target: {currentPhraseData.targetLang}</span>
          </div>
          <p className="text-2xl font-medium text-yellow-300 mb-4 whitespace-pre-wrap">
            {currentPhraseData.text}
          </p>
          <textarea
            className="w-full p-4 bg-gray-900 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-yellow-500 outline-none"
            rows="3"
            placeholder="Type your translation here..."
            value={playerTranslation}
            onChange={handleTranslationChange}
            disabled={gameState.gameState !== 'ROUND_IN_PROGRESS'}
          ></textarea>
        </div>
        <div className="text-center">
          <button
            onClick={handleSubmitTranslation}
            disabled={gameState.gameState !== 'ROUND_IN_PROGRESS' || playerTranslation.trim() === ''}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg disabled:opacity-50"
          >
            Submit Translation
          </button>
        </div>
      </>
    );
  }

  if (gameState.gameState === 'GAME_OVER') {
    return (
      <div className="text-center py-10">
        <h3 className="text-3xl font-bold mb-6">Game Over!</h3>
        <p className="text-2xl mb-4">
          Final Score: You ({ownScore}) - Opponent ({opponentScore})
        </p>
        {
          ownScore > opponentScore ? <p className="text-2xl text-green-400 font-semibold">You Won!</p> :
          ownScore < opponentScore ? <p className="text-2xl text-red-400 font-semibold">You Lost!</p> :
          <p className="text-2xl text-yellow-400 font-semibold">It's a Tie!</p>
        }
        <div className="mt-8 w-full max-w-md mx-auto">
            <h4 className="text-xl font-semibold mb-3">Round Summary</h4>
            <div className="bg-gray-800 rounded-lg p-4 text-left">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="py-2 px-1">Rnd</th>
                            <th className="py-2 px-1">Phrase (ID)</th>
                            <th className="py-2 px-1">Your Score</th>
                            <th className="py-2 px-1">Opp Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gameState.roundsData && gameState.roundsData.map((round, index) => {
                            const userIsPlayer1 = initialMatchDetails && user.id === initialMatchDetails.player1Id;
                            const p1Score = round.player1_score !== undefined ? round.player1_score : '-';
                            const p2Score = round.player2_score !== undefined ? round.player2_score : '-';
                            return (
                                <tr key={index} className="border-t border-gray-700 hover:bg-gray-750">
                                    <td className="py-2 px-1">{round.round}</td>
                                    <td className="py-2 px-1">{round.phraseId}</td>
                                    <td className="py-2 px-1">{userIsPlayer1 ? p1Score : p2Score}</td>
                                    <td className="py-2 px-1">{userIsPlayer1 ? p2Score : p1Score}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
        <button 
          onClick={handleStartGame} // Or a new function to go back to lobby/request rematch
          className="mt-10 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-xl"
        >
          Play Again? (Start New Match)
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