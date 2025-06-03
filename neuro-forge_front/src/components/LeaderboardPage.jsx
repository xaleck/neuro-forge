import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LeaderboardPage() {
    const { user: currentUser } = useAuth();

    // Захардкоженные пользователи для демонстрации с новыми именами
    const dummyUsers = [
        { id: 'dummy1', username: 'Akbar', eloRating: 1450, cloudCredits: 0, matchesPlayed: 0 },
        { id: 'dummy2', username: 'Azam', eloRating: 1030, cloudCredits: 0, matchesPlayed: 0 },
        { id: 'dummy3', username: 'Aman', eloRating: 1230, cloudCredits: 0, matchesPlayed: 0 },
        { id: 'dummy4', username: 'Sasha', eloRating: 970, cloudCredits: 0, matchesPlayed: 0 },
        { id: 'dummy5', username: 'Ell', eloRating: 1201, cloudCredits: 0, matchesPlayed: 0 },
    ];

    // Объединяем и подготавливаем пользователей для таблицы
    let displayedUsers = [...dummyUsers];
    if (currentUser) {
        // Проверяем, есть ли текущий пользователь уже в списке (по id или username)
        const currentUserInList = displayedUsers.find(u => u.id === currentUser.id || u.username === currentUser.username);
        if (currentUserInList) {
            // Если есть, обновляем его данные (особенно ELO)
            Object.assign(currentUserInList, currentUser);
        } else {
            // Если нет, добавляем
            displayedUsers.push(currentUser);
        }
    }

    // Сортируем пользователей по ELO (по убыванию)
    displayedUsers.sort((a, b) => (b.eloRating || 0) - (a.eloRating || 0));

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-yellow-400">Leaderboard</h1>
                    <Link
                        to="/dashboard"
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-150"
                    >
                        Back to Dashboard
                    </Link>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                    {displayedUsers.length > 0 ? (
                        <table className="w-full mt-2 text-left">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-400">Rank</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-400">Player</th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-400">ELO Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedUsers.map((player, index) => (
                                    <tr
                                        key={player.id || player.username}
                                        className={`border-t border-gray-700 hover:bg-gray-750 ${currentUser && (player.id === currentUser.id || player.username === currentUser.username) ? 'bg-blue-900 bg-opacity-50' : ''
                                            }`}
                                    >
                                        <td className="py-3 px-4">{index + 1}</td>
                                        <td className="py-3 px-4 font-medium">{player.username}</td>
                                        <td className="py-3 px-4 text-yellow-400 font-semibold">{player.eloRating || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-xl">Leaderboard data is currently unavailable.</p>
                    )}
                </div>
            </div>
        </div>
    );
} 