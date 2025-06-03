import React from 'react';
import SciPopQuizGame from './SciPopQuizGame'; // Компонент самой игры, создадим далее
import { useAuth } from '../../context/AuthContext';
import { scipopQuestions } from './scipopQuestions'; // Импортируем вопросы

// Функция для получения случайных 10 вопросов
const getRandomQuestions = (allQuestions, count) => {
  const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export default function SciPopQuizPage() {
  const { user } = useAuth();
  const gameQuestions = getRandomQuestions(scipopQuestions, 10);

  const gameConfig = {
    gameType: 'SCIPOP_QUIZ',
    gameModeName: 'Научпоп Викторина',
    totalRounds: 10,
    phrases: gameQuestions.map(q => ({ // Адаптируем структуру под ожидаемую в TranslationBattleGame
      id: q.id,
      text: q.text,
      correctAnswer: q.correctAnswer,
      questionType: q.questionType || 'TEXT_INPUT', // Тип вопроса по умолчанию
      // Можно добавить sourceLang/targetLang, если ваша логика игры этого требует, но для викторины это не нужно
    })),
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-cyan-400 mb-8">Научпоп Викторина</h1>
        {user && (
          <SciPopQuizGame
            user={user}
            initialMatchDetails={gameConfig} // Передаем конфигурацию игры
            isSoloMode={true} // Эта игра будет одиночной
            // stompClient={null} // Для соло игры stompClient не нужен
            // matchId={null} // Для соло игры matchId может генерироваться внутри или не использоваться
          />
        )}
      </div>
    </div>
  );
}