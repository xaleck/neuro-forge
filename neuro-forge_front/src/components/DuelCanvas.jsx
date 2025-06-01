import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMatchDetails } from '../api/matchService'; // Uncommented import
import OptimizationRallyChart from './games/OptimizationRallyChart'; // Импортируем компонент

export default function DuelCanvas() {
  const { user } = useAuth();
  const location = useLocation();

  // Используем моковые данные по умолчанию, setLoading(false) т.к. данные уже есть - REVERTED
  const [matchDetails, setMatchDetails] = useState(null); // Initialize with null
  const [loading, setLoading] = useState(true); // Set to true, data will be fetched
  const [error, setError] = useState('');
  const [parsedMatchData, setParsedMatchData] = useState(null); 

  const matchId = location.state?.matchId; 

  // Uncommented useEffect for loading data from backend
  useEffect(() => {
    if (matchId) {
      const fetchDetails = async () => {
        try {
          setLoading(true);
          setError('');
          const data = await getMatchDetails(matchId);
          setMatchDetails(data);

          // Parse matchData if it's a string (e.g., for OPTIMIZATION or other types)
          if (data && data.matchData && typeof data.matchData === 'string') {
            try {
              const parsedData = JSON.parse(data.matchData);
              setParsedMatchData(parsedData);
            } catch (parseError) {
              console.error("Failed to parse matchData:", parseError);
              setError('Ошибка при обработке данных матча.');
              setParsedMatchData(null); // Or handle as appropriate
            }
          } else if (data && data.matchData) {
            // If matchData is already an object (e.g. for OPTIMIZATION from backend)
            setParsedMatchData(data.matchData);
          }

        } catch (err) {
          console.error("Error fetching match details:", err);
          setError(err.message || 'Не удалось загрузить детали матча.');
          setMatchDetails(null);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    } else {
      setError('ID матча не найден.');
      setLoading(false);
    }
  }, [matchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg">
          <p className="text-xl">Loading Duel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg">
          <p className="text-xl text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!matchDetails) {
    return <div className="text-center text-red-500">Не удалось загрузить детали матча или матч не найден.</div>;
  }

  // Определяем, какой компонент игры отображать
  const renderGameComponent = () => {
    if (!matchDetails || !matchDetails.matchType) {
      return <p>Тип матча не определен.</p>;
    }

    switch (matchDetails.matchType) {
      case 'OPTIMIZATION':
        // Для OPTIMIZATION, данные игры теперь должны приходить в matchDetails.matchData (или parsedMatchData)
        // Если бэкенд возвращает gameData прямо в matchDetails.matchData, используем его.
        // Если gameData это JSON строка в matchDetails.matchData, то parsedMatchData будет содержать объект.
        return <OptimizationRallyChart gameData={parsedMatchData} />;
      // TODO: Добавить другие типы игр
      // case 'ANOTHER_GAME_TYPE':
      //   return <AnotherGameComponent gameData={parsedMatchData} />;
      default:
        return <p>Неизвестный тип матча: {matchDetails.matchType}</p>;
    }
  };

  const getStatusText = () => {
    if (matchDetails.endedAt) {
      return `Match Concluded! Winner: ${matchDetails.winnerId || 'Draw'}`;
    }
    return 'Match in Progress...';
  };

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
          <OptimizationRallyChart gameData={parsedMatchData} />
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