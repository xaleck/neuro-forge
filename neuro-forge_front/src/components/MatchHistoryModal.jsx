import React from 'react';

export default function MatchHistoryModal({ isOpen, onClose, matches }) {
    if (!isOpen) return null;

    const dummyMatchHistory = [
        {
            id: 'dummy_match_1_ru_en',
            date: '03.05.2025 10:16',
            mode: 'Solo Translation (Demo)',
            finalScore: 85, // Adjusted score
            result: 'Victory',
            eloChange: 10,
            scorePercentage: 85,
            rounds: [
                { round: 1, originalPhrase: 'Hello', playerAnswer: 'Привет', correctAnswer: 'Привет', playerScore: 10, result: 'Correct' },
                { round: 2, originalPhrase: 'World', playerAnswer: 'Мир', correctAnswer: 'Мир', playerScore: 10, result: 'Correct' },
                { round: 3, originalPhrase: 'Goodbye', playerAnswer: 'Покаа', correctAnswer: 'Пока', playerScore: 5, result: 'Correct' }, // Slight variation
                { round: 4, originalPhrase: 'Thank you', playerAnswer: 'Спасибо', correctAnswer: 'Спасибо', playerScore: 10, result: 'Correct' },
                { round: 5, originalPhrase: 'Yes', playerAnswer: 'Да', correctAnswer: 'Да', playerScore: 10, result: 'Correct' },
                { round: 6, originalPhrase: 'No', playerAnswer: 'Нет', correctAnswer: 'Нет', playerScore: 10, result: 'Correct' },
                { round: 7, originalPhrase: 'Please', playerAnswer: 'Пожалуйста', correctAnswer: 'Пожалуйста', playerScore: 10, result: 'Correct' },
                { round: 8, originalPhrase: 'Sorry', playerAnswer: 'Извените', correctAnswer: 'Извините', playerScore: 5, result: 'Correct' }, // Spelling mistake
                { round: 9, originalPhrase: 'Good morning', playerAnswer: 'Доброе утро', correctAnswer: 'Доброе утро', playerScore: 10, result: 'Correct' },
                { round: 10, originalPhrase: 'Good night', playerAnswer: 'Спокойной ночи', correctAnswer: 'Спокойной ночи', playerScore: 5, result: 'Correct' }, // Player might forget a word, but still close
            ]
        },
        {
            id: 'dummy_match_2_ru_en',
            date: '03.04.2025 18:32',
            mode: 'Solo Translation (Demo)',
            finalScore: 30,
            result: 'Defeat',
            eloChange: -5,
            scorePercentage: 30,
            rounds: [
                { round: 1, originalPhrase: 'Cat', playerAnswer: 'Котэ', correctAnswer: 'Кошка', playerScore: 0, result: 'Incorrect' }, // Slang / incorrect
                { round: 2, originalPhrase: 'Dog', playerAnswer: 'Собака', correctAnswer: 'Собака', playerScore: 10, result: 'Correct' },
                { round: 3, originalPhrase: 'House', playerAnswer: 'Дом', correctAnswer: 'Дом', playerScore: 10, result: 'Correct' },
                { round: 4, originalPhrase: 'Book', playerAnswer: 'Книга ', correctAnswer: 'Книга', playerScore: 10, result: 'Correct' }, // Extra space
                { round: 5, originalPhrase: 'Water', playerAnswer: 'Водичка', correctAnswer: 'Вода', playerScore: 0, result: 'Incorrect' }, // Diminutive, might be too far
                { round: 6, originalPhrase: 'Sun', playerAnswer: 'Зонт', correctAnswer: 'Солнце', playerScore: 0, result: 'Incorrect' },
                { round: 7, originalPhrase: 'Moon', playerAnswer: 'Луна', correctAnswer: 'Луна', playerScore: 10, result: 'Correct' },
                { round: 8, originalPhrase: 'Star', playerAnswer: 'Звезда', correctAnswer: 'Звезда', playerScore: 10, result: 'Correct' },
                { round: 9, originalPhrase: 'Sky', playerAnswer: 'Небо', correctAnswer: 'Небо', playerScore: 10, result: 'Correct' },
                { round: 10, originalPhrase: 'Earth', playerAnswer: 'Земляя', correctAnswer: 'Земля', playerScore: 0, result: 'Incorrect' },
            ]
        },
        {
            id: 'dummy_match_3_ru_en',
            date: '03.05.2025 11:03',
            mode: 'Solo Translation (Demo)',
            finalScore: 60, // Adjusted
            result: 'Completed',
            eloChange: 5,
            scorePercentage: 60,
            rounds: [
                { round: 1, originalPhrase: 'Red', playerAnswer: 'Красный', correctAnswer: 'Красный', playerScore: 10, result: 'Correct' },
                { round: 2, originalPhrase: 'Blue', playerAnswer: 'Синий', correctAnswer: 'Синий', playerScore: 10, result: 'Correct' },
                { round: 3, originalPhrase: 'Green', playerAnswer: 'Зеленый', correctAnswer: 'Зелёный', playerScore: 5, result: 'Correct' }, // Missing ё
                { round: 4, originalPhrase: 'Yellow', playerAnswer: 'Желтый', correctAnswer: 'Жёлтый', playerScore: 5, result: 'Correct' }, // Missing ё
                { round: 5, originalPhrase: 'Purple', playerAnswer: 'Пурпур', correctAnswer: 'Фиолетовый', playerScore: 0, result: 'Incorrect' },
                { round: 6, originalPhrase: 'Orange', playerAnswer: 'Оранжевый', correctAnswer: 'Оранжевый', playerScore: 10, result: 'Correct' },
                { round: 7, originalPhrase: 'Black', playerAnswer: 'Черный', correctAnswer: 'Чёрный', playerScore: 10, result: 'Correct' }, // Can accept both with/without ё
                { round: 8, originalPhrase: 'White', playerAnswer: 'Белый', correctAnswer: 'Белый', playerScore: 10, result: 'Correct' },
                { round: 9, originalPhrase: 'Friend', playerAnswer: 'Друган', correctAnswer: 'Друг', playerScore: 0, result: 'Incorrect' },
                { round: 10, originalPhrase: 'Family', playerAnswer: 'Семья', correctAnswer: 'Семья', playerScore: 10, result: 'Correct' },
            ]
        },
        {
            id: 'dummy_match_4_ru_en',
            date: '03.05.2025 21:44',
            mode: 'Solo Translation (Demo)',
            finalScore: 70, // Adjusted
            result: 'Victory',
            eloChange: 10,
            scorePercentage: 70,
            rounds: [
                { round: 1, originalPhrase: 'One', playerAnswer: 'Адин', correctAnswer: 'Один', playerScore: 0, result: 'Incorrect' }, // Common mistake
                { round: 2, originalPhrase: 'Two', playerAnswer: 'Два', correctAnswer: 'Два', playerScore: 10, result: 'Correct' },
                { round: 3, originalPhrase: 'Three', playerAnswer: 'Три', correctAnswer: 'Три', playerScore: 10, result: 'Correct' },
                { round: 4, originalPhrase: 'Four', playerAnswer: 'Четыре', correctAnswer: 'Четыре', playerScore: 10, result: 'Correct' },
                { round: 5, originalPhrase: 'Five', playerAnswer: 'Пять', correctAnswer: 'Пять', playerScore: 10, result: 'Correct' },
                { round: 6, originalPhrase: 'Six', playerAnswer: 'Шесть', correctAnswer: 'Шесть', playerScore: 10, result: 'Correct' },
                { round: 7, originalPhrase: 'Seven', playerAnswer: 'Семь', correctAnswer: 'Семь', playerScore: 10, result: 'Correct' },
                { round: 8, originalPhrase: 'Eight', playerAnswer: 'Восем', correctAnswer: 'Восемь', playerScore: 0, result: 'Incorrect' }, // Missing letter
                { round: 9, originalPhrase: 'Nine', playerAnswer: 'Девять', correctAnswer: 'Девять', playerScore: 10, result: 'Correct' },
                { round: 10, originalPhrase: 'Ten', playerAnswer: 'Десять', correctAnswer: 'Десять', playerScore: 10, result: 'Correct' },
            ]
        },
    ];

    // Use passed matches if available and not empty, otherwise use dummy history
    // const displayMatches = matches && matches.length > 0 ? matches : dummyMatchHistory;
    const realUserMatches = Array.isArray(matches) ? matches : [];
    const displayMatches = [...realUserMatches, ...dummyMatchHistory];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}> {/* Close on overlay click */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking inside modal */}
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-800 py-4 z-10 border-b border-gray-700">
                    <h2 className="text-2xl font-semibold text-purple-400">Match History</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-3xl leading-none"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>

                {displayMatches.length === 0 ? (
                    // This case should ideally not be reached if dummyMatches are always provided as a fallback
                    <p className="text-gray-400 text-center py-8">No match history found.</p>
                ) : (
                    <div className="space-y-6">
                        {/* Show newest matches first */}
                        {displayMatches.slice().reverse().map((match) => (
                            <div key={match.id} className="bg-gray-750 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 pb-3 border-b border-gray-700">
                                    <div>
                                        <h3 className="text-xl font-medium text-purple-300">{match.mode}</h3>
                                        <p className="text-xs text-gray-400">{match.date}</p>
                                    </div>
                                    <div className="mt-2 sm:mt-0 text-right">
                                        <span
                                            className={`px-3 py-1 text-sm rounded-full font-semibold ${match.result === 'Victory' ? 'bg-green-500 text-green-900'
                                                : match.result === 'Defeat' ? 'bg-red-500 text-red-900'
                                                    : 'bg-gray-500 text-gray-900' // For 'Completed' or other states
                                                }`}
                                        >
                                            {match.result}
                                        </span>
                                        <p className="text-lg font-bold text-white mt-1">Score: {match.finalScore}</p>
                                        {typeof match.eloChange === 'number' && (
                                            <p className={`text-xs font-medium ${match.eloChange > 0 ? 'text-green-400' : match.eloChange < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                                ELO: {match.eloChange > 0 ? `+${match.eloChange}` : match.eloChange}
                                            </p>
                                        )}
                                        {typeof match.scorePercentage === 'number' && (
                                            <p className="text-xs text-gray-400">({match.scorePercentage}%)</p>
                                        )}
                                    </div>
                                </div>
                                {match.rounds && match.rounds.length > 0 && (
                                    <details className="mt-2 text-sm">
                                        <summary className="text-gray-400 cursor-pointer hover:text-gray-200 transition-colors">Round Details ({match.rounds.length} rounds)</summary>
                                        <div className="overflow-x-auto mt-2">
                                            <table className="w-full min-w-[600px] text-left">
                                                <thead className="bg-gray-700">
                                                    <tr className="border-b border-gray-600">
                                                        <th className="py-2 px-3 text-gray-300 font-semibold">#</th>
                                                        <th className="py-2 px-3 text-gray-300 font-semibold">Вопрос/Фраза</th>
                                                        <th className="py-2 px-3 text-gray-300 font-semibold">Ваш ответ</th>
                                                        <th className="py-2 px-3 text-gray-300 font-semibold">Правильный ответ</th>
                                                        <th className="py-2 px-3 text-gray-300 font-semibold text-center">Очки</th>
                                                        <th className="py-2 px-3 text-gray-300 font-semibold text-center">Результат</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-650">
                                                    {match.rounds.map((roundData, roundIndex) => (
                                                        <tr key={roundIndex} className="hover:bg-gray-700 transition-colors">
                                                            <td className="py-2 px-3 text-gray-300">{roundData.round || roundIndex + 1}</td>
                                                            <td className="py-2 px-3 text-gray-200">{roundData.questionText || roundData.originalPhrase || 'N/A'}</td>
                                                            <td className="py-2 px-3 text-gray-200">{roundData.playerAnswer || 'N/A'}</td>
                                                            <td className="py-2 px-3 text-gray-200">{roundData.correctAnswer || 'N/A'}</td>
                                                            <td className="py-2 px-3 text-white font-medium text-center">{roundData.playerScore}</td>
                                                            <td className={`py-2 px-3 font-semibold text-center ${roundData.result === 'Correct' || roundData.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                                                {roundData.result || (roundData.isCorrect ? 'Correct' : 'Incorrect')}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </details>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 