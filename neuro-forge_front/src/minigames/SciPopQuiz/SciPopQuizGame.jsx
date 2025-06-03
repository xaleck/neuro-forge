import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Для обновления данных пользователя

// Предполагаем, что initialMatchDetails содержит phrases, totalRounds, gameModeName
export default function SciPopQuizGame({ user, initialMatchDetails, isSoloMode }) {
  const navigate = useNavigate();
  const { updateUserData } = useAuth();

  const [gameState, setGameState] = useState({
    status: 'NOT_STARTED', // WAITING_FOR_PLAYERS, ROUND_IN_PROGRESS, GAME_OVER
    currentRound: 0,
    player1GameScore: 0,
    roundsData: [], // Для истории раундов [{ round, questionText, playerAnswer, correctAnswer, score, isCorrect }]
    phrases: initialMatchDetails.phrases || [],
    totalRounds: initialMatchDetails.totalRounds || 10,
    currentPhraseIndex: -1,
    gameType: initialMatchDetails.gameType || 'SCIPOP_QUIZ',
    gameModeName: initialMatchDetails.gameModeName || 'Научпоп Викторина',
  });
  const [playerAnswer, setPlayerAnswer] = useState('');
  const [rewardsProcessed, setRewardsProcessed] = useState(false);

  const currentQuestionData = gameState.phrases && gameState.currentPhraseIndex >= 0 && gameState.currentPhraseIndex < gameState.phrases.length
    ? gameState.phrases[gameState.currentPhraseIndex]
    : null;

  const handleStartGame = useCallback(() => {
    setRewardsProcessed(false);
    setGameState(prev => ({
      ...prev,
      status: 'ROUND_IN_PROGRESS',
      currentRound: 1,
      currentPhraseIndex: 0,
      player1GameScore: 0,
      roundsData: [],
    }));
  }, []);

  const handleSubmitAnswer = useCallback(() => {
    if (!currentQuestionData || gameState.status !== 'ROUND_IN_PROGRESS') return;

    const correctAnswer = currentQuestionData.correctAnswer.trim().toLowerCase();
    const userAnswer = playerAnswer.trim().toLowerCase();
    const isCorrect = userAnswer === correctAnswer;
    const scoreForRound = isCorrect ? 10 : 0;

    const roundDataToAdd = {
      round: gameState.currentRound,
      questionText: currentQuestionData.text,
      playerAnswer: playerAnswer,
      correctAnswer: currentQuestionData.correctAnswer,
      score: scoreForRound,
      isCorrect: isCorrect,
    };

    setGameState(prev => {
      const newPlayer1Score = prev.player1GameScore + scoreForRound;
      const newRoundsData = [...prev.roundsData, roundDataToAdd];
      let nextStatus = 'ROUND_IN_PROGRESS';
      let nextRound = prev.currentRound;
      let nextPhraseIndex = prev.currentPhraseIndex;

      if (prev.currentRound >= prev.totalRounds) {
        nextStatus = 'GAME_OVER';
      } else {
        nextRound = prev.currentRound + 1;
        nextPhraseIndex = prev.currentPhraseIndex + 1;
      }

      return {
        ...prev,
        player1GameScore: newPlayer1Score,
        roundsData: newRoundsData,
        currentRound: nextRound,
        currentPhraseIndex: nextPhraseIndex,
        status: nextStatus,
      };
    });
    setPlayerAnswer('');
  }, [currentQuestionData, playerAnswer, gameState.currentRound, gameState.totalRounds, gameState.phrases]); // Added gameState.phrases

  useEffect(() => {
    if (gameState.status === 'GAME_OVER' && !rewardsProcessed && user) {
      setRewardsProcessed(true);
      console.log('(SciPop Quiz) Game over, processing rewards...', gameState);

      // --- Логика начисления ELO и кредитов (адаптировать из TranslationBattleGame.jsx) ---
      const creditsEarned = Math.floor(gameState.player1GameScore / 2); // Пример: 1 кредит за каждые 2 очка
      const currentCredits = user.cloudCredits || 0;
      const newTotalCredits = currentCredits + creditsEarned;

      const currentElo = user.eloRating || 1000;
      const maxPossibleScore = gameState.totalRounds * 10; // Если 10 очков за раунд
      const scorePercentage = maxPossibleScore > 0 ? (gameState.player1GameScore / maxPossibleScore) * 100 : 0;
      
      let eloChange = 0;
      if (scorePercentage >= 70) eloChange = 10; // Примерная логика ELO
      else if (scorePercentage >= 40) eloChange = 5;
      else if (scorePercentage < 20) eloChange = -5;
      const newEloRating = Math.max(0, currentElo + eloChange);

      const currentMatchesPlayed = user.matchesPlayed || 0;
      const newMatchesPlayed = currentMatchesPlayed + 1;

      const matchDataForHistory = {
        id: `${gameState.gameType.toLowerCase()}-${Date.now()}`,
        // date: new Date().toISOString(), // MatchHistoryModal ожидает форматированную строку или обработает ISO
        date: new Date().toLocaleString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        mode: gameState.gameModeName,
        finalScore: gameState.player1GameScore,
        result: eloChange > 0 ? 'Victory' : (eloChange < 0 ? 'Defeat' : 'Completed'),
        rounds: gameState.roundsData.map(r => ({ ...r })), // Копируем данные раундов
        eloChange: eloChange,
        scorePercentage: parseFloat(scorePercentage.toFixed(1)),
      };
      
      const existingMatchHistory = user.matchHistory || [];
      let updatedMatchHistory = [...existingMatchHistory, matchDataForHistory];
      const MAX_MATCHES_IN_HISTORY = 20; // Как в TranslationBattleGame
      if (updatedMatchHistory.length > MAX_MATCHES_IN_HISTORY) {
        updatedMatchHistory = updatedMatchHistory.slice(updatedMatchHistory.length - MAX_MATCHES_IN_HISTORY);
      }

      updateUserData({
        cloudCredits: newTotalCredits,
        eloRating: newEloRating,
        matchesPlayed: newMatchesPlayed,
        matchHistory: updatedMatchHistory,
      });
    }
  }, [gameState, user, updateUserData, rewardsProcessed]);


  if (gameState.status === 'NOT_STARTED') {
    return (
      <div className="text-center p-6">
        <p className="text-xl mb-6">Готовы проверить свои знания в Научпоп Викторине?</p>
        <button
          onClick={handleStartGame}
          className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 rounded-lg text-xl transition duration-150 ease-in-out"
        >
          Начать игру
        </button>
      </div>
    );
  }

  if (gameState.status === 'GAME_OVER') {
    // Пытаемся получить eloChange из последнего сохраненного матча в user.matchHistory, если gameState.roundsData пуст или не содержит eloChange
    let finalEloChangeDisplay = 0;
    if (user && user.matchHistory && user.matchHistory.length > 0) {
        const lastMatch = user.matchHistory[user.matchHistory.length - 1];
        if (lastMatch && lastMatch.mode === gameState.gameModeName) { // Убедимся, что это тот самый матч
            finalEloChangeDisplay = lastMatch.eloChange;
        }
    }


    return (
      <div className="text-center p-6 bg-gray-800 rounded-lg shadow-xl">
        <h3 className="text-3xl font-bold mb-4 text-yellow-400">Игра Окончена!</h3>
        <p className="text-xl mb-2">Ваш счет: <span className="font-bold text-yellow-400">{gameState.player1GameScore}</span></p>
        <p className="text-lg mb-6">
          ELO: <span className={finalEloChangeDisplay > 0 ? "text-green-400" : (finalEloChangeDisplay < 0 ? "text-red-400" : "text-gray-400")}>
            {user?.eloRating || 1000} ({finalEloChangeDisplay >= 0 ? "+" : ""}{finalEloChangeDisplay})
          </span>
        </p>
        <button
          onClick={handleStartGame}
          className="mt-10 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 rounded-lg text-xl transition duration-150 ease-in-out"
        >
          Играть снова
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 sm:mt-10 sm:ml-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition duration-150 ease-in-out"
        >
          На Панель Управления
        </button>
      </div>
    );
  }

  if (gameState.status === 'ROUND_IN_PROGRESS' && currentQuestionData) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-4"> {/* mb-4 как в TranslationBattleGame */}
          <span className="text-xl">Раунд: {gameState.currentRound}/{gameState.totalRounds}</span>
          {/* Можно добавить таймер сюда, если он нужен, как в TranslationBattleGame */}
          <span className="text-xl">Счет: {gameState.player1GameScore}</span>
        </div>
        <div className="mb-6">
          <p className="text-3xl font-semibold text-yellow-300 mb-3 whitespace-pre-wrap"> {/* Стиль вопроса как в TranslationBattleGame */}
            {currentQuestionData.text}
          </p>
          <input
            type={currentQuestionData.questionType === 'NUMBER_INPUT' ? 'number' : 'text'}
            className="w-full p-4 bg-gray-900 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-yellow-500 outline-none" /* Стиль инпута как в TranslationBattleGame */
            placeholder="Ваш ответ..."
            value={playerAnswer}
            onChange={(e) => setPlayerAnswer(e.target.value)}
            autoFocus
            onKeyPress={(event) => {
              if (event.key === 'Enter') {
                handleSubmitAnswer();
              }
            }}
          />
        </div>
        <div className="text-center">
          <button
            onClick={handleSubmitAnswer}
            disabled={playerAnswer.trim() === '' || gameState.status !== 'ROUND_IN_PROGRESS'}
            className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-lg text-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed" /* Стиль кнопки как в TranslationBattleGame */
          >
            Ответить
          </button>
        </div>
      </div>
    );
  }

  return <p className="text-center text-xl p-6">Загрузка игры...</p>;
}