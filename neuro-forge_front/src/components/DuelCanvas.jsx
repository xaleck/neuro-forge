import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMatchDetails } from '../api/matchService'; // Uncommented import
import OptimizationRallyGame from './games/OptimizationRallyChart'; // Corrected import name for the refactored component
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import TranslationBattleGame from '../minigames/TranslationBattle/TranslationBattleGame';

export default function DuelCanvas() {
  const { user } = useAuth();
  const location = useLocation();

  // WebSocket client for real-time duel updates
  const [stompClient, setStompClient] = useState(null);
  // Используем моковые данные по умолчанию, setLoading(false) т.к. данные уже есть - REVERTED
  const [matchDetails, setMatchDetails] = useState(null); // Initialize with null
  const [loading, setLoading] = useState(true); // Set to true, data will be fetched
  const [error, setError] = useState('');
  
  // Translation Battle game state
  const [gameState, setGameState] = useState({
    currentRound: 0,
    totalRounds: 10,
    playerScore: 0,
    opponentScore: 0,
    currentPhrase: null,
    playerTranslation: '',
    timeRemaining: 60,
    gameActive: false,
    roundResult: null,
    phraseHistory: []
  });
  
  // Sample phrases for translation (in real app, these would come from backend)
  const samplePhrases = [
    { id: 1, sourceLanguage: 'en', targetLanguage: 'es', text: 'The quick brown fox jumps over the lazy dog', correctTranslation: 'El rápido zorro marrón salta sobre el perro perezoso' },
    { id: 2, sourceLanguage: 'fr', targetLanguage: 'en', text: 'Je voudrais une tasse de café', correctTranslation: 'I would like a cup of coffee' },
    { id: 3, sourceLanguage: 'de', targetLanguage: 'en', text: 'Können Sie mir bitte helfen', correctTranslation: 'Can you please help me' },
    { id: 4, sourceLanguage: 'en', targetLanguage: 'fr', text: 'Where is the nearest restaurant', correctTranslation: 'Où est le restaurant le plus proche' },
    { id: 5, sourceLanguage: 'es', targetLanguage: 'en', text: 'Mi casa es tu casa', correctTranslation: 'My house is your house' },
    { id: 6, sourceLanguage: 'en', targetLanguage: 'de', text: 'I need to buy a new computer', correctTranslation: 'Ich muss einen neuen Computer kaufen' },
    { id: 7, sourceLanguage: 'it', targetLanguage: 'en', text: 'Quanto costa questo', correctTranslation: 'How much does this cost' },
    { id: 8, sourceLanguage: 'en', targetLanguage: 'ja', text: 'Thank you for your help', correctTranslation: 'ご協力ありがとうございます' },
    { id: 9, sourceLanguage: 'ru', targetLanguage: 'en', text: 'Доброе утро', correctTranslation: 'Good morning' },
    { id: 10, sourceLanguage: 'en', targetLanguage: 'zh', text: 'Nice to meet you', correctTranslation: '很高兴见到你' }
  ];
  const [parsedMatchData, setParsedMatchData] = useState(null); 

  const matchId = location.state?.matchId; 

  // Uncommented useEffect for loading data from backend
  useEffect(() => {
    if (!matchId) {
      setError('No Match ID provided. Cannot load duel.');
      setLoading(false);
      return;
    }

    async function fetchMatch() {
      setLoading(true);
      setError('');
      try {
        console.log(`[DuelCanvas] Fetching match details for matchId: ${matchId}`);
        const data = await getMatchDetails(matchId);
        console.log('[DuelCanvas] Fetched match details:', data);
        setMatchDetails(data);
      } catch (err) {
        console.error('[DuelCanvas] Failed to fetch match details:', err);
        setError(`Failed to load duel: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    fetchMatch();
  }, [matchId]);

  // useEffect to parse matchData when matchDetails changes or matchData within it changes
  useEffect(() => {
    if (matchDetails && matchDetails.matchData) {
      if (typeof matchDetails.matchData === 'string') {
        try {
          const parsed = JSON.parse(matchDetails.matchData);
          setParsedMatchData(parsed);
          console.log('[DuelCanvas] Successfully parsed matchData JSON string:', parsed);
        } catch (e) {
          console.error('[DuelCanvas] Failed to parse matchData JSON string:', e, "\nRaw data:", matchDetails.matchData);
          setError('Failed to parse game data.');
          setParsedMatchData(null); 
        }
      } else if (typeof matchDetails.matchData === 'object') {
        // If matchData is already an object (e.g., from a WebSocket update that pre-parses it, or if backend sends object)
        setParsedMatchData(matchDetails.matchData);
        console.log('[DuelCanvas] Used pre-existing object for matchData:', matchDetails.matchData);
      } else {
        // matchData is of an unexpected type
        console.warn('[DuelCanvas] matchData is of unexpected type:', typeof matchDetails.matchData);
        setError('Game data is in an unexpected format.');
        setParsedMatchData(null);
      }
    } else {
      // No matchDetails or no matchData in it, reset parsedMatchData
      setParsedMatchData(null);
    }
  }, [matchDetails]); // Dependency: re-run if the matchDetails object reference changes.

  // Set up WebSocket connection for live duel updates
  useEffect(() => {
    if (!matchId) return;

    console.log('[DuelCanvas WebSocket] Attempting to connect for matchId:', matchId);
    const socket = new SockJS(`http://${window.location.hostname}:8080/ws-duel`);
    const client = new Client({
      webSocketFactory: () => socket,
      debug: function (str) {
        console.log('[DuelCanvas STOMP]', str);
      },
      onConnect: () => {
        console.log('[DuelCanvas WebSocket] Connected!');
        
        // Subscribe to general match updates (e.g., if opponent joins, or overall match status changes)
        // This topic is NOT for game-specific state, which will be handled by the minigame component itself.
        client.subscribe(`/topic/duel/${matchId}`, message => {
          try {
            const update = JSON.parse(message.body);
            console.log('[DuelCanvas WebSocket] Received general duel update:', update);
            // Update overall match details if necessary (e.g. player2 joining, match ending from server)
            setMatchDetails(prev => ({ ...prev, ...update, matchData: prev?.matchData })); // Preserve existing matchData unless update specifically changes it
          } catch (e) {
            console.error('[DuelCanvas WebSocket] Error parsing general duel update JSON:', e);
          }
        });
        console.log(`[DuelCanvas WebSocket] Subscribed to /topic/duel/${matchId}`);

        // User-specific queue (optional, if used for private notifications not specific to a minigame)
        if (user?.id) {
          client.subscribe(`/user/queue/duel-updates`, message => {
            console.log('[DuelCanvas WebSocket] Received user-specific update:', JSON.parse(message.body));
            // Handle private updates if needed
          });
          console.log(`[DuelCanvas WebSocket] Subscribed to /user/queue/duel-updates for user ${user.id}`);
        }
        setStompClient(client); // Set stompClient only after successful connection and subscriptions
      },
      onStompError: frame => {
        console.error('[DuelCanvas WebSocket] STOMP Error - Headers:', frame.headers, 'Body:', frame.body);
        setError('STOMP protocol error. Check console.');
      },
      onWebSocketError: event => {
        console.error('[DuelCanvas WebSocket] WebSocket Connection Error:', event);
        setError('WebSocket connection failed. Ensure backend is running and accessible.');
      },
      onDisconnect: () => {
        console.log('[DuelCanvas WebSocket] Disconnected.');
      }
    });

    client.activate();
    
    return () => {
      console.log('[DuelCanvas WebSocket] Deactivating client for matchId:', matchId);
      if (client) {
        client.deactivate();
      }
      setStompClient(null);
    };
  }, [matchId, user]); // user dependency for user-specific queue
  
  // Game timer effect
  useEffect(() => {
    let timer;
    if (gameState.gameActive && gameState.timeRemaining > 0) {
      timer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    } else if (gameState.timeRemaining === 0) {
      // Game ended due to time
      endRound(false);
    }
    return () => clearInterval(timer);
  }, [gameState.gameActive, gameState.timeRemaining]);

  // Start the game
  const startGame = () => {
    const initialPhrase = samplePhrases[0];
    setGameState({
      ...gameState,
      gameActive: true,
      currentRound: 1,
      playerScore: 0,
      opponentScore: 0,
      currentPhrase: initialPhrase,
      playerTranslation: '',
      timeRemaining: 60,
      phraseHistory: []
    });
    
    // In a real app, notify the server via WebSocket
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: `/app/duel/${matchId}/start`,
        body: JSON.stringify({ userId: user?.id })
      });
    }
  };

  // Handle input changes
  const handleTranslationChange = (e) => {
    setGameState({
      ...gameState,
      playerTranslation: e.target.value
    });
  };

  // Submit translation for current round
  const submitTranslation = () => {
    if (!gameState.gameActive || gameState.playerTranslation.trim() === '') return;
    
    // Calculate score based on simple string comparison (in real app would use more sophisticated algorithm)
    const correctAnswer = gameState.currentPhrase.correctTranslation.toLowerCase().trim();
    const playerAnswer = gameState.playerTranslation.toLowerCase().trim();
    
    // Simple scoring (0-100)
    let accuracy = 0;
    if (playerAnswer === correctAnswer) {
      accuracy = 100; // Perfect match
    } else {
      // Calculate Levenshtein distance (simplified version)
      const maxLength = Math.max(playerAnswer.length, correctAnswer.length);
      let sameChars = 0;
      for (let i = 0; i < Math.min(playerAnswer.length, correctAnswer.length); i++) {
        if (playerAnswer[i] === correctAnswer[i]) sameChars++;
      }
      accuracy = Math.round((sameChars / maxLength) * 100);
    }
    
    // For demo, simulate opponent score
    const opponentAccuracy = Math.floor(Math.random() * 100);
    
    // Update score
    const newPlayerScore = gameState.playerScore + accuracy;
    const newOpponentScore = gameState.opponentScore + opponentAccuracy;
    
    // Record this round
    const roundResult = {
      round: gameState.currentRound,
      phrase: gameState.currentPhrase,
      playerTranslation: gameState.playerTranslation,
      playerAccuracy: accuracy,
      opponentAccuracy: opponentAccuracy
    };
    
    // Check if game should continue
    if (gameState.currentRound < gameState.totalRounds) {
      // Next round
      setGameState({
        ...gameState,
        currentRound: gameState.currentRound + 1,
        playerScore: newPlayerScore,
        opponentScore: newOpponentScore,
        currentPhrase: samplePhrases[gameState.currentRound],
        playerTranslation: '',
        roundResult: roundResult,
        phraseHistory: [...gameState.phraseHistory, roundResult]
      });
    } else {
      // Game over
      setGameState({
        ...gameState,
        gameActive: false,
        playerScore: newPlayerScore,
        opponentScore: newOpponentScore,
        roundResult: roundResult,
        phraseHistory: [...gameState.phraseHistory, roundResult]
      });
    }
    
    // In a real app, send the score to the server
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: `/app/duel/${matchId}/score`,
        body: JSON.stringify({ 
          userId: user?.id,
          score: accuracy,
          round: gameState.currentRound
        })
      });
    }
  };
  
  // Handle round end when time expires
  const endRound = (completed) => {
    if (completed) return; // If already completed by submitTranslation
    
    // Auto-submit with current state
    submitTranslation();
  };

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
    if (!matchDetails) { // Check if matchDetails itself is null
      return <p className="text-center py-10 text-gray-400">Loading match details...</p>;
    }
    if (!matchDetails.matchType) {
      return <p className="text-center py-10 text-gray-400">Match type not determined yet.</p>;
    }

    switch (matchDetails.matchType) {
      case 'TRANSLATION':
        if (stompClient && user) {
          return (
            <TranslationBattleGame
              matchId={matchId}
              user={user}
              stompClient={stompClient}
              initialMatchDetails={matchDetails}
            />
          );
        }
        return (
          <div className="text-center py-10">
            <p className="text-xl text-yellow-500">Connecting to Translation Battle...</p>
          </div>
        );

      case 'OPTIMIZATION':
        // OptimizationRallyGame expects initialMatchDetails (containing matchData which is our parsedGameState)
        // It also needs stompClient, matchId, and user for its operations.
        // Ensure parsedMatchData is being correctly populated in DuelCanvas from matchDetails.matchData (JSON string)
        if (!parsedMatchData && matchDetails.matchData) {
            // This suggests parsedMatchData hasn't updated yet from the useEffect that parses matchDetails.matchData.
            // Or, if matchData from backend is already an object, parsedMatchData should reflect it.
            // OptimizationRallyGame will show its own loading state if its internal gameState is null.
            console.log("[DuelCanvas] Waiting for parsedMatchData to be populated for OPTIMIZATION game.");
        }
        return (
          <OptimizationRallyGame 
            matchId={matchId} 
            stompClient={stompClient} 
            user={user} 
            initialMatchDetails={{ // Construct the initialMatchDetails prop for OptimizationRallyGame
                ...matchDetails, // Spread all of matchDetails for general info like player IDs, matchType etc.
                matchData: parsedMatchData // Specifically pass the parsed game state object here
            }} 
          />
        );
      
      // TODO: Добавить другие типы игр
      // case 'ANOTHER_GAME_TYPE':
      //   return <AnotherGameComponent gameData={parsedMatchData} />;

      default:
        return (
          <div className="text-center py-10">
            <p className="text-2xl text-gray-400">This is a '{matchDetails.matchType}' duel.</p>
            <p className="text-lg mt-2">No specific UI implemented for this game type yet.</p>
            {matchDetails.matchData && (
              <details className="mt-4 text-xs bg-gray-900 p-2 rounded text-left">
                <summary className="cursor-pointer">View Raw Match Data</summary>
                <pre className="mt-2 overflow-auto max-h-48">
                  {typeof matchDetails.matchData === 'string'
                    ? JSON.stringify(JSON.parse(matchDetails.matchData), null, 2)
                    : JSON.stringify(matchDetails.matchData, null, 2)}
                </pre>
              </details>
            )}
            {!matchDetails.matchData && <p className="text-sm text-gray-500 mt-2">(No raw game data available)</p>}
          </div>
        );
    }
  };

  const getStatusText = () => {
    if (matchDetails.endedAt) {
      return `Match Concluded! Winner: ${matchDetails.winnerId || 'Draw'}`;
    }
    return 'Match in Progress...';
  };

  // Determine player display names based on who the current user is
  const isPlayer1 = user?.id === matchDetails.player1Id;
  const player1DisplayName = isPlayer1 ? `You (Player ${matchDetails.player1Id})` : `Player ${matchDetails.player1Id}`;
  const player2DisplayName = !isPlayer1 ? `You (Player ${matchDetails.player2Id})` : `Player ${matchDetails.player2Id}`;
  
  const ownGeneralScore = isPlayer1 ? matchDetails.player1Score : matchDetails.player2Score;
  const opponentGeneralScore = isPlayer1 ? matchDetails.player2Score : matchDetails.player1Score;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-start p-4 pt-10">
      {/* Header Section: General Match Info */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-3xl mb-6">
        <h1 className="text-3xl font-bold text-center mb-1">Duel Arena</h1>
        <p className="text-sm text-center text-gray-400 mb-1">Match ID: {matchDetails.id}</p>
        <p className="text-lg text-center text-yellow-400 mb-4">Type: {matchDetails.matchType}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 text-center">
          <div>
            <h3 className={`text-2xl font-semibold ${isPlayer1 ? 'text-blue-400' : 'text-red-400'}`}>{player1DisplayName}</h3>
            {matchDetails.player1ModelId && <p className="text-xs text-gray-500">Model: {matchDetails.player1ModelId}</p>}
            <p className="text-lg">Overall Score: {matchDetails.player1Score}</p>

          </div>
          <div>
            <h3 className={`text-2xl font-semibold ${!isPlayer1 ? 'text-blue-400' : 'text-red-400'}`}>{player2DisplayName}</h3>
            {matchDetails.player2ModelId && <p className="text-xs text-gray-500">Model: {matchDetails.player2ModelId}</p>}
            <p className="text-lg">Overall Score: {matchDetails.player2Score}</p>
          </div>
        </div>

        {matchDetails.endedAt && (
          <div className="text-center mt-4 p-3 bg-gray-700 rounded">
            <h3 className="text-xl font-bold mb-1 text-green-400">Match Concluded!</h3>
            <p className="text-md">
              Winner: {matchDetails.winnerId 
                ? (matchDetails.winnerId === user.id ? 'You!' : `Player ${matchDetails.winnerId}`)
                : 'Draw'}
            </p>
          </div>
        )}
      </div>

      {/* Game-Specific Content Area */}
      <div className="bg-gray-750 p-6 rounded-lg shadow-xl w-full max-w-3xl min-h-[300px] flex flex-col justify-center">
        {/* renderGameComponent will handle loading states internally or based on matchDetails presence */}
        {renderGameComponent()}
      </div>
    </div>
  );
}