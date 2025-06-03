// Пример сервиса для игровой логики, например, для генерации состояния игры

// В реальном приложении эти фразы лучше хранить в конфигурации или получать с бэкенда
const SAMPLE_PHRASES_TRANSLATION = [
    { original: "Hello", correctAnswer: "Привет", options: ["Привет", "Пока", "Спасибо", "Да"] },
    { original: "Thank you", correctAnswer: "Спасибо", options: ["Спасибо", "Пожалуйста", "Извините", "Нет"] },
    { original: "Good morning", correctAnswer: "Доброе утро", options: ["Добрый день", "Добрый вечер", "Доброй ночи", "Доброе утро"] },
    { original: "Goodbye", correctAnswer: "До свидания", options: ["До свидания", "Здравствуйте", "Удачи", "Скоро увидимся"] },
    { original: "Yes", correctAnswer: "Да", options: ["Да", "Нет", "Возможно", "Конечно"] },
    { original: "No", correctAnswer: "Нет", options: ["Нет", "Да", "Никогда", "Всегда"] },
    { original: "Please", correctAnswer: "Пожалуйста", options: ["Пожалуйста", "Спасибо", "Простите", "Хорошо"] },
    { original: "Sorry", correctAnswer: "Извините", options: ["Извините", "Пожалуйста", "Ничего", "Конечно"] },
    { original: "I don't understand", correctAnswer: "Я не понимаю", options: ["Я понимаю", "Я не понимаю", "Повторите", "Что это?"] },
    { original: "How are you?", correctAnswer: "Как дела?", options: ["Как дела?", "Что нового?", "Хорошо", "Плохо"] }
];

const TOTAL_ROUNDS_DEFAULT = 10;
const TOTAL_ROUNDS_MATH_QUIZ = 10; // Новая константа для математического квиза

// Функция для генерации математических вопросов
const generateMathQuestion = () => {
    const num1 = Math.floor(Math.random() * 20) + 1; // Числа от 1 до 20
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operations = [
        { symbol: '+', func: (a, b) => a + b },
        { symbol: '-', func: (a, b) => a - b },
        { symbol: '*', func: (a, b) => a * b },
    ];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    // Для вычитания, убедимся что результат не отрицательный (для простоты)
    if (operation.symbol === '-' && num1 < num2) {
        return { text: `${num2} - ${num1} = ?`, correctAnswer: num2 - num1 };
    }
    return { text: `${num1} ${operation.symbol} ${num2} = ?`, correctAnswer: operation.func(num1, num2) };
};

export const generateDefaultGameState = (userId, gameType) => {
    let roundTime = 60;
    let totalRounds = TOTAL_ROUNDS_DEFAULT;
    let gamePhrases = [];
    let specificGameType = gameType;

    if (gameType === 'TRANSLATION_BLITZ') {
        roundTime = 15;
        specificGameType = 'TRANSLATION'; // Базовая логика фраз - перевод
    }

    if (gameType === 'TRANSLATION' || gameType === 'TRANSLATION_CHALLENGE' || specificGameType === 'TRANSLATION') {
        totalRounds = TOTAL_ROUNDS_DEFAULT; // Убедимся, что для перевода 10 раундов
        const shuffledPhrases = [...SAMPLE_PHRASES_TRANSLATION].sort(() => 0.5 - Math.random());
        gamePhrases = shuffledPhrases.slice(0, totalRounds).map(p => ({
            text: p.original,
            sourceLang: 'EN',
            targetLang: 'RU',
            correctAnswer: p.correctAnswer,
            options: p.options,
            questionType: 'TRANSLATION' // Добавляем тип вопроса
        }));
    } else if (gameType === 'MATH_QUIZ') {
        roundTime = 45; // Дадим чуть больше времени на математику
        totalRounds = TOTAL_ROUNDS_MATH_QUIZ; // Используем новую константу
        for (let i = 0; i < totalRounds; i++) {
            const mathProblem = generateMathQuestion();
            gamePhrases.push({
                text: mathProblem.text, // "5 + 7 = ?"
                correctAnswer: mathProblem.correctAnswer.toString(), // Ответ как строка для унификации, но будем парсить в число при проверке
                questionType: 'MATH' // Добавляем тип вопроса
            });
        }
    } else {
        console.warn(`[gameLogicService] Unknown gameType: ${gameType}. Returning error state.`);
        return { gameState: 'ERROR_UNKNOWN_GAMETYPE', status: 'ERROR' };
    }

    return {
        gameType: gameType, // Сохраняем оригинальный gameType (e.g. 'MATH_QUIZ', 'TRANSLATION_BLITZ')
        totalRounds: totalRounds,
        currentRound: 0,
        phrases: gamePhrases, // Массив вопросов (переводы или математика)
        roundsData: [],
        player1GameScore: 0,
        currentPhraseIndex: -1,
        gameState: 'NOT_STARTED',
        roundStartTime: null,
        roundTimeLimit: roundTime,
        status: 'NOT_STARTED'
    };
}; 