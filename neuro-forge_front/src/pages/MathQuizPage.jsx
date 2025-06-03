import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TranslationBattleGame from '../minigames/TranslationBattle/TranslationBattleGame'; // Убедитесь, что путь верный
import { generateDefaultGameState } from '../services/gameLogicService'; // Предполагаемый сервис для логики игры

export default function MathQuizPage() { // Переименован компонент
    const { user } = useAuth();
    const [mathQuizMatchDetails, setMathQuizMatchDetails] = useState(null); // Переименовано состояние
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            // Используем новый gameType для генерации математических вопросов
            const defaultGameState = generateDefaultGameState(user.id, 'MATH_QUIZ');

            const mockMatchDetails = {
                id: `math-quiz-${Date.now()}`,
                player1Id: user.id,
                player2Id: null,
                player1ModelId: null,
                player2ModelId: null,
                matchType: 'MATH_QUIZ', // Новый тип матча
                startedAt: new Date().toISOString(),
                endedAt: null,
                winnerId: null,
                player1Score: 0,
                player2Score: 0,
                matchData: JSON.stringify(defaultGameState),
                isSoloMode: true,
                gameModeName: 'Math Quiz' // Новое имя режима для истории
            };
            setMathQuizMatchDetails(mockMatchDetails); // Обновлен сеттер состояния
            setIsLoading(false);
        }
    }, [user]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="bg-gray-800 p-8 rounded-lg">
                    <p className="text-xl">Loading Math Quiz...</p> {/* Обновленный текст */}
                </div>
            </div>
        );
    }

    if (!mathQuizMatchDetails) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="bg-gray-800 p-8 rounded-lg">
                    <p className="text-xl text-red-500">Could not initialize Math Quiz data.</p> {/* Обновленный текст */}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            {/* Пока используем TranslationBattleGame, но его нужно будет сильно адаптировать */}
            <TranslationBattleGame
                matchId={mathQuizMatchDetails.id}
                user={user}
                stompClient={null}
                initialMatchDetails={mathQuizMatchDetails}
                isSoloMode={true}
            />
        </div>
    );
} 