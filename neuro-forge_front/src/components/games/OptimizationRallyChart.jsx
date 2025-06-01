import React, { useState, useEffect, useCallback } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Не используется в этой версии
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAuth } from '../../context/AuthContext'; // To get current user

// Вспомогательная функция для преобразования строки сложности в числовой балл (меньше - лучше)
const getComplexityScore = (complexityString) => {
  if (!complexityString || typeof complexityString !== 'string') return 10; // Худший балл по умолчанию для неизвестной или некорректной строки
  const s = complexityString.toLowerCase().replace(/o\s?\(/g, '').replace(/\)/g, '').trim(); // Нормализация: O(n^2) -> n^2

  if (s === '1') return 1;          // O(1)
  if (s === 'log n') return 2;    // O(log n)
  if (s === 'n') return 3;          // O(n)
  if (s === 'n log n') return 4;  // O(n log n)
  if (s === 'n^2') return 5;        // O(n^2)
  if (s === 'n^3') return 6;        // O(n^3)
  if (s === '2^n') return 7;        // O(2^n)
  if (s === 'n!') return 8;         // O(n!)
  return 10; // Если не распознано, присваиваем высокий (плохой) балл
};

// Вспомогательная функция для вычисления "эффективности" кода
const calculateEfficiency = (metrics) => {
  if (!metrics) return 0; // Возвращаем 0, если метрики отсутствуют
  const { executionTime, memoryUsage, complexity } = metrics;

  const complexityScore = getComplexityScore(complexity);

  // Веса для метрик. Можете их настроить.
  const timeWeight = 0.4;
  const memoryWeight = 0.3;
  const complexityWeight = 0.3;

  // Приводим сложность к сопоставимому масштабу с другими метриками (штрафами)
  // Например, если executionTime ~50-150, memoryUsage ~50-150,
  // то complexityScore (1-10) нужно увеличить. Умножим на 10 (O(n^2) = 5 -> 50).
  const scaledComplexityPenalty = complexityScore * 10;

  // Общий "штраф": чем он меньше, тем лучше код.
  const totalPenalty =
    (Number(executionTime) * timeWeight) +
    (Number(memoryUsage) * memoryWeight) +
    (scaledComplexityPenalty * complexityWeight);

  // Преобразуем штраф в эффективность (0-100%). 100% - идеально.
  // Предполагаем, что максимальный "разумный" штраф, дающий 0% эффективности, это, например, 150.
  // Если totalPenalty = 0, efficiency = 100.
  // Если totalPenalty >= 150, efficiency = 0.
  let efficiencyValue = 100 - (totalPenalty / 150 * 100); // Нормализация к диапазону, где 150 штрафа = 0% эффективности

  // Ограничиваем значение эффективности от 0 до 100
  efficiencyValue = Math.max(0, Math.min(100, efficiencyValue));

  return efficiencyValue;
};

// Компонент для отображения метрик
const MetricsDisplay = ({ metrics, title, color }) => {
  const efficiency = calculateEfficiency(metrics);
  return (
    <div className="flex flex-col bg-gray-800 rounded-md p-2 mb-2 shrink-0"> {/* shrink-0 */}
      <h4 className={`text-sm font-semibold mb-1 ${color}`}>{title}</h4>
      <div className="grid grid-cols-3 gap-1 text-xs">
        <div className="flex flex-col">
          <span className="text-gray-400">Время выполнения</span>
          <span className="font-mono">{metrics.executionTime}ms</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400">Память</span>
          <span className="font-mono">{metrics.memoryUsage}KB</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400">Сложность</span>
          <span className="font-mono">O({metrics.complexity})</span>
        </div>
      </div>
      <div className="mt-2">
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${color === 'text-blue-400' ? 'bg-blue-600' : 'bg-red-600'}`}
            style={{ width: `${efficiency}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span>Эффективность</span>
          <span>{efficiency.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

// Компонент для отображения изменений кода (или просто кода)
const CodeDisplay = ({ code, title, color, language = 'javascript' }) => {
  return (
    <div className="flex flex-col h-full">
      <h4 className={`text-sm font-semibold mb-1 ${color} shrink-0`}>{title}</h4>
      <div className="bg-gray-800 rounded-md p-2 flex-1 overflow-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{ margin: 0, borderRadius: '0.25rem', fontSize: '0.8rem', height: '100%' }}
          showLineNumbers={true}
          wrapLines={true}
        >
          {code || "// No code submitted yet"}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

// Renamed from OptimizationRallyChart to OptimizationRallyGame to reflect its new role
// Props: matchId, user (from useAuth), stompClient, initialMatchDetails (passed as gameData initially by DuelCanvas)
export default function OptimizationRallyGame({ matchId, stompClient, initialMatchDetails, user: externallyPassedUser }) { 
  const { user: authUser } = useAuth(); // Get authenticated user from context
  const currentUser = externallyPassedUser || authUser; // Prioritize passed user if available (e.g. for testing or specific scenarios)
  
  const [optimizationGameState, setOptimizationGameState] = useState(null);
  const [currentUserCode, setCurrentUserCode] = useState('');
  // const [isLoading, setIsLoading] = useState(true); // Replaced by checking optimizationGameState
  // const [error, setError] = useState(null); // Can be added if specific errors for this component arise

  // Initialize and update game state from props (initial load) or WebSocket
  useEffect(() => {
    if (initialMatchDetails && initialMatchDetails.matchData) {
      console.log("[OptimizationRallyGame] Received initialMatchDetails with matchData:", initialMatchDetails.matchData);
      try {
        // Assuming matchData in initialMatchDetails is the already parsed OptimizationRallyState object
        // as prepared by DuelCanvas's parsedMatchData state.
        // If it were a JSON string, we'd JSON.parse() it here.
        if (typeof initialMatchDetails.matchData === 'object'){
            setOptimizationGameState(initialMatchDetails.matchData);
            // Populate currentUserCode if resuming a game where user already typed something (more advanced)
            // For now, we start with empty editor.
        } else {
             console.error("[OptimizationRallyGame] initialMatchDetails.matchData is not an object as expected. Type:", typeof initialMatchDetails.matchData, initialMatchDetails.matchData);
             // Attempt to parse if it's a string, otherwise error
             try {
                const parsedData = JSON.parse(initialMatchDetails.matchData);
                setOptimizationGameState(parsedData);
             } catch (e) {
                console.error("[OptimizationRallyGame] Failed to parse initialMatchDetails.matchData string:", e);
                // setError("Failed to load game data from initial details.");
             }
        }
      } catch (e) {
        console.error("[OptimizationRallyGame] Error processing initialMatchDetails.matchData:", e);
        // setError("Error processing initial game data.");
      }
    } else if (initialMatchDetails) {
        // This case handles when initialMatchDetails is present, but matchData is not (yet).
        // It implies that DuelCanvas passed down `parsedMatchData` which was null.
        // OptimizationRallyChart shows "Загрузка данных игры..." in this scenario already.
        console.log("[OptimizationRallyGame] initialMatchDetails present, but no matchData yet. Waiting for WebSocket or valid data.");
        setOptimizationGameState(null); // Ensure it's null if no valid data
    }
  }, [initialMatchDetails]);

  // WebSocket subscription for game state updates
  useEffect(() => {
    if (stompClient && stompClient.connected && matchId) {
      const topic = `/topic/duel/${matchId}/optimization/state`;
      console.log(`[OptimizationRallyGame] Subscribing to ${topic}`);
      const subscription = stompClient.subscribe(topic, message => {
        try {
          const updatedGameState = JSON.parse(message.body);
          console.log('[OptimizationRallyGame] Received game state update via WebSocket:', updatedGameState);
          setOptimizationGameState(updatedGameState);
        } catch (e) {
          console.error('[OptimizationRallyGame] Error parsing WebSocket game state update:', e);
          // setError("Error receiving game update.");
        }
      });

      // Request initial state upon connection (optional, if backend doesn't send it automatically on match creation broadcast)
      // stompClient.publish({ destination: `/app/duel/${matchId}/optimization/requestState`, body: JSON.stringify({ userId: currentUser?.id }) });

      return () => {
        console.log(`[OptimizationRallyGame] Unsubscribing from ${topic}`);
        subscription.unsubscribe();
      };
    }
  }, [stompClient, matchId, currentUser]); // currentUser dependency if used in requestState

  const handleCodeSubmission = useCallback(() => {
    if (!stompClient || !stompClient.connected || !currentUser || !optimizationGameState) {
      console.warn("[OptimizationRallyGame] Cannot submit: STOMP not connected, no user, or no game state.");
      return;
    }
    if (optimizationGameState.gameStatus !== 'ROUND_IN_PROGRESS' && 
        !(currentUser.id === optimizationGameState.player1Id && optimizationGameState.gameStatus === 'AWAITING_PLAYER_1_SUBMISSION') &&
        !(currentUser.id === optimizationGameState.player2Id && optimizationGameState.gameStatus === 'AWAITING_PLAYER_2_SUBMISSION')) {
      console.warn("[OptimizationRallyGame] Cannot submit: Not player's turn or game not in submittable state. Status:", optimizationGameState.gameStatus);
      return;
    }
    if (currentUserCode.trim() === '') {
      alert("Please enter your optimized code.");
      return;
    }

    const payload = {
      userId: currentUser.id,
      code: currentUserCode,
      step: optimizationGameState.currentStep,
    };
    console.log("[OptimizationRallyGame] Submitting code:", payload);
    stompClient.publish({
      destination: `/app/duel/${matchId}/optimization/submit`,
      body: JSON.stringify(payload),
    });
    setCurrentUserCode(''); // Clear input after submission
  }, [stompClient, matchId, currentUser, optimizationGameState, currentUserCode]);


  // --- UI Rendering --- //
  if (!optimizationGameState) {
    return <p className="text-gray-400 text-center py-10">Loading Optimization Rally game data...</p>;
  }

  const {
    problemDescription,
    originalCode,
    timeSteps,
    currentStep,
    player1Progress,
    player2Progress,
    gameStatus,
    player1Id,
    // player2Id // Can be derived if needed
  } = optimizationGameState;
  
  const isPlayer1 = currentUser?.id === player1Id;
  const ownProgress = isPlayer1 ? player1Progress : player2Progress;
  const opponentProgress = isPlayer1 ? player2Progress : player1Progress;

  // Get current code and metrics for display for a specific step and player progress list
  const getStepData = (progressList, stepIndex) => {
    if (progressList && stepIndex >= 0 && progressList.length > stepIndex) {
      const entry = progressList[stepIndex];
      if (entry && typeof entry === 'object') {
        return entry;
      }
    }
    return { code: "// Not submitted yet", metrics: null }; // Default if no data for the step
  };

  // For now, just display the latest submission. A more complex UI could show all steps.
  const player1CurrentStepData = getStepData(player1Progress, currentStep -1 ); // currentStep is 1-indexed
  const player2CurrentStepData = getStepData(player2Progress, currentStep - 1);
  
  let gameStatusText = "Loading status...";
  let canSubmit = false;

  switch (gameStatus) {
    case 'NOT_STARTED':
      gameStatusText = "Game has not started yet.";
      break;
    case 'ROUND_IN_PROGRESS':
      gameStatusText = `Round ${currentStep} of ${timeSteps}. Submit your optimization!`;
      canSubmit = true;
      break;
    case 'AWAITING_PLAYER_1_SUBMISSION':
      gameStatusText = isPlayer1 ? `Round ${currentStep}: Your turn to submit.` : `Round ${currentStep}: Waiting for Player 1.`;
      canSubmit = isPlayer1;
      break;
    case 'AWAITING_PLAYER_2_SUBMISSION':
      gameStatusText = !isPlayer1 ? `Round ${currentStep}: Your turn to submit.` : `Round ${currentStep}: Waiting for Player 2.`;
      canSubmit = !isPlayer1;
      break;
    case 'ROUND_COMPLETED': // This state might be brief, backend auto-advances
      gameStatusText = `Round ${currentStep -1} completed. Preparing next round...`;
      break;
    case 'GAME_OVER':
      gameStatusText = "Game Over!";
      // Determine winner here based on final scores (to be added to gameState from backend)
      break;
    default:
      gameStatusText = `Status: ${gameStatus}`;
  }

  return (
    <div className="w-full h-full flex flex-col p-1 text-white">
      {problemDescription && (
        <h3 className="text-lg font-semibold mb-3 text-center text-yellow-400 shrink-0">{problemDescription}</h3>
      )}
      <p className="text-center text-md mb-3">{gameStatusText}</p>
      <p className="text-center text-sm mb-3">Step: {currentStep} / {timeSteps}</p>

      {/* Original Code Display (for reference) */}
      {currentStep === 1 && originalCode && (
         <div className="mb-4 p-2 bg-gray-850 rounded-md">
            <h4 className="text-sm font-semibold mb-1 text-gray-300">Original Code to Optimize:</h4>
            <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, fontSize: '0.75rem' }} showLineNumbers wrapLines>
                {originalCode}
            </SyntaxHighlighter>
         </div>
      )}

      {/* Player Code Submission Area */}
      {gameStatus !== 'GAME_OVER' && (
        <div className="mb-4 p-3 bg-gray-750 rounded-lg">
          <h4 className="text-md font-semibold mb-2">Your Code for Step {currentStep}:</h4>
          <textarea
            className="w-full p-2 bg-gray-900 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-yellow-500 outline-none font-mono text-sm min-h-[150px]"
            value={currentUserCode}
            onChange={(e) => setCurrentUserCode(e.target.value)}
            placeholder={`Enter your optimized code for step ${currentStep}...`}
            disabled={!canSubmit}
          />
          <button
            onClick={handleCodeSubmission}
            disabled={!canSubmit || currentUserCode.trim() === ''}
            className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm disabled:opacity-50 w-full sm:w-auto"
          >
            Submit Code for Step {currentStep}
          </button>
        </div>
      )}

      {/* Progress Display Area - showing current or last submitted step */}
      <div className="flex flex-col sm:flex-row flex-1 gap-3 overflow-hidden mt-2">
        {/* Current User's Last Submission & Metrics */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-800 p-3 rounded-lg">
          <h4 className="text-md font-semibold mb-2 text-blue-400">Your Last Submission (Step {isPlayer1 ? player1Progress?.length : player2Progress?.length})</h4>
          {getStepData(ownProgress, (isPlayer1 ? player1Progress?.length : player2Progress?.length) -1).metrics && (
            <MetricsDisplay 
                metrics={getStepData(ownProgress, (isPlayer1 ? player1Progress?.length : player2Progress?.length) -1).metrics} 
                title="Your Metrics" color="text-blue-400" 
            />
          )}
          <div className="flex-1 relative mt-2">
            <CodeDisplay 
                code={getStepData(ownProgress, (isPlayer1 ? player1Progress?.length : player2Progress?.length) -1).code} 
                title="Your Code" color="text-blue-400" 
            />
          </div>
        </div>

        {/* Opponent's Last Submission & Metrics */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-800 p-3 rounded-lg">
          <h4 className="text-md font-semibold mb-2 text-red-400">Opponent's Last Submission (Step {!isPlayer1 ? player1Progress?.length : player2Progress?.length})</h4>
          {getStepData(opponentProgress, (!isPlayer1 ? player1Progress?.length : player2Progress?.length)-1).metrics && (
            <MetricsDisplay 
                metrics={getStepData(opponentProgress, (!isPlayer1 ? player1Progress?.length : player2Progress?.length)-1).metrics} 
                title="Opponent's Metrics" color="text-red-400" 
            />
          )}
          <div className="flex-1 relative mt-2">
            <CodeDisplay 
                code={getStepData(opponentProgress, (!isPlayer1 ? player1Progress?.length : player2Progress?.length)-1).code} 
                title="Opponent's Code" color="text-red-400" 
            />
          </div>
        </div>
      </div>

      {/* TODO: Add a section for GAME_OVER summary, scores, winner */}
      {gameStatus === 'GAME_OVER' && (
        <div className="mt-6 text-center p-4 bg-gray-700 rounded-lg">
          <h3 className="text-2xl font-bold text-green-400">Game Over!</h3>
          {/* Display final scores and winner - requires backend to send this info */}
          <p className="mt-2">Final results will be displayed here.</p>
        </div>
      )}
    </div>
  );
}

// Old structure was for display only, replaced by the interactive game component above
// export default function OptimizationRallyChart({ gameData }) { ... }