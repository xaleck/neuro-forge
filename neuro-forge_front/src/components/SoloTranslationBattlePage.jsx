import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TranslationBattleGame from '../minigames/TranslationBattle/TranslationBattleGame'; // Убедитесь, что путь верный
import { generateDefaultGameState } from '../services/gameLogicService'; // Предполагаемый сервис для логики игры

export default function SoloTranslationBattlePage() {
    const { user } = useAuth();
    const [soloGameMatchDetails, setSoloGameMatchDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Имитация загрузки данных для одиночной игры
        // Создаем моковый объект matchDetails, который будет использоваться в TranslationBattleGame
        // В реальном приложении здесь может быть запрос на бэкенд для получения настроек одиночной игры
        // или генерация данных на клиенте.

        if (user) {
            const defaultGameState = generateDefaultGameState(user.id, 'TRANSLATION'); // Пример функции для генерации состояния

            const mockMatchDetails = {
                id: `solo-${Date.now()}`,
                player1Id: user.id,
                player2Id: null, // Нет второго игрока
                player1ModelId: null, // Модель не используется в соло
                player2ModelId: null,
                matchType: 'TRANSLATION',
                startedAt: new Date().toISOString(),
                endedAt: null,
                winnerId: null,
                player1Score: 0,
                player2Score: 0,
                matchData: JSON.stringify(defaultGameState),
                isSoloMode: true, // Флаг для указания одиночного режима
                gameModeName: 'Solo Translation' // Explicitly set game mode name
            };
            setSoloGameMatchDetails(mockMatchDetails);
            setIsLoading(false);
        }
    }, [user]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="bg-gray-800 p-8 rounded-lg">
                    <p className="text-xl">Loading Solo Game...</p>
                </div>
            </div>
        );
    }

    if (!soloGameMatchDetails) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="bg-gray-800 p-8 rounded-lg">
                    <p className="text-xl text-red-500">Could not initialize solo game data.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <TranslationBattleGame
                matchId={soloGameMatchDetails.id}
                user={user}
                stompClient={null} // WebSocket не используется в соло режиме
                initialMatchDetails={soloGameMatchDetails}
                isSoloMode={true} // Передаем флаг соло режима
            />
        </div>
    );
} 