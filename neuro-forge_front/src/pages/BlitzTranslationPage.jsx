import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TranslationBattleGame from '../minigames/TranslationBattle/TranslationBattleGame';
import { generateDefaultGameState } from '../services/gameLogicService';

export default function BlitzTranslationPage() {
    const { user } = useAuth();
    const [blitzMatchDetails, setBlitzMatchDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            // Используем новый gameType для генерации состояния с коротким временем раунда
            const defaultGameState = generateDefaultGameState(user.id, 'TRANSLATION_BLITZ');

            const mockMatchDetails = {
                id: `blitz-translation-${Date.now()}`,
                player1Id: user.id,
                player2Id: null,
                player1ModelId: null,
                player2ModelId: null,
                matchType: 'TRANSLATION_BLITZ', // Тип матча для этой игры
                startedAt: new Date().toISOString(),
                endedAt: null,
                winnerId: null,
                player1Score: 0,
                player2Score: 0,
                matchData: JSON.stringify(defaultGameState),
                isSoloMode: true,
                gameModeName: 'Blitz Translation' // Имя режима для истории матчей
            };
            setBlitzMatchDetails(mockMatchDetails);
            setIsLoading(false);
        }
    }, [user]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="bg-gray-800 p-8 rounded-lg">
                    <p className="text-xl">Loading Blitz Translation...</p>
                </div>
            </div>
        );
    }

    if (!blitzMatchDetails) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="bg-gray-800 p-8 rounded-lg">
                    <p className="text-xl text-red-500">Could not initialize Blitz Translation data.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <TranslationBattleGame
                matchId={blitzMatchDetails.id}
                user={user}
                stompClient={null}
                initialMatchDetails={blitzMatchDetails}
                isSoloMode={true}
            />
        </div>
    );
} 