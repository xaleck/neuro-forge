import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import { getMatchDetails } from '../api/matchService'; // Закомментирован импорт для работы без бэкенда
import OptimizationRallyChart from './games/OptimizationRallyChart'; // Импортируем компонент

// Моковые данные для matchDetails, чтобы избежать API вызова
const mockMatchDetailsData = {
  id: 'mockMatchID123',
  player1Id: 'user1', // Пример ID игрока
  player2Id: 'user2', // Пример ID второго игрока
  player1ModelId: 'model_A_mock',
  player2ModelId: 'model_B_mock',
  matchType: 'OPTIMIZATION', // Устанавливаем тип матча для отображения нужного компонента
  matchData: null, // Для OPTIMIZATION, данные игры берутся из hardcodedOptimizationData
  endedAt: null, // null для "Match in Progress...", или дата для "Match Concluded!"
  // Пример для завершенного матча:
  // endedAt: new Date().toISOString(),
  // winnerId: 'user1', // или 'user2', или null для ничьи
  // player1Score: 150,
  // player2Score: 120,
  status: 'IN_PROGRESS',
};


export default function DuelCanvas() {
  const { user } = useAuth();
  const location = useLocation();

  // Используем моковые данные по умолчанию, setLoading(false) т.к. данные уже есть
  const [matchDetails, setMatchDetails] = useState(mockMatchDetailsData);
  const [loading, setLoading] = useState(false); // Устанавливаем в false, так как используем моковые данные
  const [error, setError] = useState(''); // Ошибок при "загрузке" моковых данных нет
  const [parsedMatchData, setParsedMatchData] = useState(null); // Для других типов матчей

  const matchId = location.state?.matchId; // matchId может все еще приходить, но не будет использоваться для загрузки

  // Захардкоженные данные для тестирования Оптимизационного Ралли
  const hardcodedOptimizationData = {
    problemDescription: "Задача: Оптимизировать функцию сортировки массива чисел",
    timeSteps: 5, // Общее количество шагов оптимизации
    originalCode: `function bubbleSort(arr) {
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Меняем элементы местами
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`,
    player1Progress: [
      {
        code: `function bubbleSort(arr) {
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Меняем элементы местами
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`,
        metrics: { executionTime: 120, memoryUsage: 85, complexity: 'n^2' }
      },
      {
        code: `function bubbleSort(arr) {
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    let swapped = false;
    for (let j = 0; j < len - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Меняем элементы местами
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swapped = true;
      }
    }
    // Если не было обменов на этой итерации, массив уже отсортирован
    if (!swapped) break;
  }
  return arr;
}`,
        metrics: { executionTime: 95, memoryUsage: 85, complexity: 'n^2' }
      },
      {
        code: `function bubbleSort(arr) {
  let len = arr.length;
  let swapped;
  do {
    swapped = false;
    for (let i = 0; i < len - 1; i++) {
      if (arr[i] > arr[i + 1]) {
        // Деструктурированное присваивание для обмена значениями
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;
      }
    }
    len--; // Уменьшаем длину, т.к. последний элемент уже на месте
  } while (swapped);
  return arr;
}`,
        metrics: { executionTime: 80, memoryUsage: 82, complexity: 'n^2' }
      },
      {
        code: `function bubbleSort(arr) {
  // Создаем копию входного массива, чтобы не изменять исходный
  const array = [...arr];
  let len = array.length;
  let swapped;
  do {
    swapped = false;
    for (let i = 0; i < len - 1; i++) {
      if (array[i] > array[i + 1]) {
        [array[i], array[i + 1]] = [array[i + 1], array[i]];
        swapped = true;
      }
    }
    len--; // Оптимизация - последний элемент уже на месте
  } while (swapped);
  return array;
}`,
        metrics: { executionTime: 75, memoryUsage: 90, complexity: 'n^2' }
      },
      {
        code: `function bubbleSort(arr) {
  // Проверяем граничные случаи
  if (!Array.isArray(arr) || arr.length <= 1) return arr;
  
  // Создаем копию входного массива
  const array = [...arr];
  let len = array.length;
  let swapped;
  
  do {
    swapped = false;
    for (let i = 0; i < len - 1; i++) {
      // Сравниваем соседние элементы
      if (array[i] > array[i + 1]) {
        // Используем деструктурирующее присваивание для обмена
        [array[i], array[i + 1]] = [array[i + 1], array[i]];
        swapped = true;
      }
    }
    len--; // Оптимизация - уменьшаем область проверки
  } while (swapped);
  
  return array;
}`,
        metrics: { executionTime: 65, memoryUsage: 90, complexity: 'n^2' }
      }
    ],
    player2Progress: [
      {
        code: `function bubbleSort(arr) {
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Меняем элементы местами
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`,
        metrics: { executionTime: 120, memoryUsage: 85, complexity: 'n^2' }
      },
      {
        code: `function sort(arr) {
  // Используем встроенный метод сортировки JavaScript
  return arr.sort((a, b) => a - b);
}`,
        metrics: { executionTime: 45, memoryUsage: 70, complexity: 'n log n' }
      },
      {
        code: `function sort(arr) {
  // Проверка входных данных
  if (!Array.isArray(arr)) return [];
  if (arr.length <= 1) return arr;
  
  // Используем встроенный метод сортировки JavaScript
  return arr.sort((a, b) => a - b);
}`,
        metrics: { executionTime: 45, memoryUsage: 70, complexity: 'n log n' }
      },
      {
        code: `function sort(arr) {
  // Проверка входных данных
  if (!Array.isArray(arr)) return [];
  if (arr.length <= 1) return arr;
  
  // Создаем копию, чтобы не изменять оригинал
  const result = [...arr];
  
  // Используем встроенный метод сортировки JavaScript
  return result.sort((a, b) => a - b);
}`,
        metrics: { executionTime: 48, memoryUsage: 75, complexity: 'n log n' }
      },
      {
        code: `function sort(arr) {
  // Проверка входных данных
  if (!Array.isArray(arr)) return [];
  if (arr.length <= 1) return arr;
  
  // Оптимизация для числовых массивов
  if (arr.every(item => typeof item === 'number')) {
    const result = [...arr];
    return result.sort((a, b) => a - b);
  }
  
  // Для других типов данных (например, строк)
  const result = [...arr];
  return result.sort();
}`,
        metrics: { executionTime: 42, memoryUsage: 78, complexity: 'n log n' }
      }
    ]
  };

  // Закомментирован useEffect для загрузки данных с бэкенда
  // useEffect(() => {
  //   if (!matchId) {
  //     setError('No Match ID provided. Cannot load duel.');
  //     setLoading(false);
  //     return;
  //   }

  //   async function fetchMatch() {
  //     setLoading(true);
  //     setError('');
  //     try {
  //       // const data = await getMatchDetails(matchId); // Вызов API закомментирован
  //       // setMatchDetails(data); // Установка данных из API закомментирована
  //     } catch (err) {
  //       console.error('Failed to fetch match details:', err);
  //       setError(`Failed to load duel: ${err.message || 'Unknown error'}`);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   fetchMatch();
  // }, [matchId]);

  // useEffect для парсинга matchData (для других типов игр)
  // Этот useEffect остается, так как он работает с состоянием matchDetails,
  // которое теперь инициализируется моковыми данными.
  useEffect(() => {
    if (matchDetails && matchDetails.matchData && matchDetails.matchType !== 'OPTIMIZATION') {
      try {
        const data = typeof matchDetails.matchData === 'string' 
          ? JSON.parse(matchDetails.matchData) 
          : matchDetails.matchData;
        setParsedMatchData(data);
      } catch (e) {
        console.error("Failed to parse matchData:", e);
        setParsedMatchData({ error: "Invalid game data format" });
      }
    } else if (matchDetails && matchDetails.matchType === 'OPTIMIZATION') {
        setParsedMatchData(null); // Не нужно парсить для OPTIMIZATION, т.к. используем hardcodedOptimizationData
    } else {
      setParsedMatchData(null);
    }
  }, [matchDetails]);

  if (loading) { // Это условие теперь не должно срабатывать при использовании моковых данных
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg">
          <p className="text-xl">Loading Duel...</p>
        </div>
      </div>
    );
  }

  if (error) { // Это условие также не должно срабатывать
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg">
          <p className="text-xl text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!matchDetails) { // Это условие не должно срабатывать, так как matchDetails инициализируется моковыми данными
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg">
          <p className="text-xl">Match details not found.</p>
        </div>
      </div>
    );
  }

  const player1Display = `Player ${matchDetails.player1Id}`;
  const player2Display = `Player ${matchDetails.player2Id}`;
  const currentUserId = user ? user.id : 'mockUserID'; // Используем мок ID если user не определен для проверки логики победителя

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">Duel Arena</h1>
        <h2 className="text-xl text-center text-yellow-400 mb-6">Match ID: {matchDetails.id}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-center">
          <div>
            <h3 className="text-2xl font-semibold text-blue-400">{player1Display}</h3>
            {matchDetails.player1ModelId && <p className="text-sm text-gray-400">Model ID: {matchDetails.player1ModelId}</p>}
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-red-400">{player2Display}</h3>
            {matchDetails.player2ModelId && <p className="text-sm text-gray-400">Model ID: {matchDetails.player2ModelId}</p>}
          </div>
        </div>
        <p className="text-center text-lg mb-6">Match Type: <span className="font-semibold text-green-400">{matchDetails.matchType}</span></p>
        
        {matchDetails.endedAt ? (
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Match Concluded!</h3>
            <p className="text-lg">Winner: {matchDetails.winnerId ? (matchDetails.winnerId === currentUserId ? 'You!' : `Player ${matchDetails.winnerId}`) : 'Draw'}</p>
            <p>Score: {player1Display} {matchDetails.player1Score || 0} - {matchDetails.player2Score || 0} {player2Display}</p>
          </div>
        ) : (
          <p className="text-center text-lg text-yellow-500">Match in Progress...</p>
        )}
      </div>

      {/* Измененный блок для отображения игры или плейсхолдера */}
      <div className="bg-gray-700 p-4 rounded-lg shadow-xl w-full max-w-2xl h-96 flex flex-col justify-center items-center">
        {matchDetails.matchType === 'OPTIMIZATION' ? (
          <OptimizationRallyChart gameData={hardcodedOptimizationData} />
        ) : (
          <>
            <p className="text-2xl text-gray-400">Duel Canvas Placeholder</p>
            {parsedMatchData && !parsedMatchData.error && (
              <pre className="mt-4 text-xs bg-gray-900 p-2 rounded overflow-auto w-full max-h-60">
                {JSON.stringify(parsedMatchData, null, 2)}
              </pre>
            )}
            {parsedMatchData && parsedMatchData.error && (
              <p className="mt-4 text-red-500">{parsedMatchData.error}</p>
            )}
            {!parsedMatchData && matchDetails.matchData && (
              <p className="mt-4 text-sm text-gray-500">Обработка данных матча...</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}