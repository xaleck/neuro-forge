import React, { useState, useEffect } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Не используется в этой версии
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

// Компонент для отображения изменений кода
const CodeDiff = ({ originalCode, optimizedCode, title, color }) => {
  const originalLines = originalCode.split('\n');
  const optimizedLines = optimizedCode.split('\n');
  const maxLength = Math.max(originalLines.length, optimizedLines.length);
  const diffLines = [];

  for (let i = 0; i < maxLength; i++) {
    const originalLine = i < originalLines.length ? originalLines[i] : '';
    const optimizedLine = i < optimizedLines.length ? optimizedLines[i] : '';
    if (originalLine !== optimizedLine) {
      diffLines.push({
        lineNumber: i + 1,
        originalLine,
        optimizedLine,
        status: originalLine === '' ? 'added' : optimizedLine === '' ? 'removed' : 'modified'
      });
    }
  }

  return (
    <div className="flex flex-col h-full"> {/* h-full чтобы занять пространство от родителя (flex-1) */}
      <h4 className={`text-sm font-semibold mb-1 ${color} shrink-0`}>{title}</h4>
      <div className="bg-gray-800 rounded-md p-2 flex-1 overflow-auto"> {/* flex-1 чтобы занять оставшееся место, overflow-auto для скролла */}
        <SyntaxHighlighter
          language="javascript"
          style={vscDarkPlus}
          customStyle={{ margin: 0, borderRadius: '0.25rem', fontSize: '0.8rem', height: '100%' }} // height: 100% для заполнения родителя
          showLineNumbers={true}
          wrapLines={true}
          lineProps={lineNumber => {
            const diff = diffLines.find(d => d.lineNumber === lineNumber);
            if (!diff) return { style: {} };
            return {
              style: {
                backgroundColor: diff.status === 'added' ? 'rgba(46, 160, 67, 0.15)' :
                               diff.status === 'removed' ? 'rgba(248, 81, 73, 0.15)' :
                               'rgba(246, 185, 59, 0.15)',
                display: 'block'
              }
            };
          }}
        >
          {optimizedCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default function OptimizationRallyChart({ gameData }) {
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!gameData) {
    return <p className="text-gray-400">Загрузка данных игры...</p>;
  }

  const {
    problemDescription,
    originalCode,
    timeSteps = 10, // Убедитесь, что timeSteps соответствует длине массивов progress
    player1Progress,
    player2Progress
  } = gameData;

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTimeIndex(prev => {
        if (prev >= timeSteps - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [isPlaying, timeSteps]);

  const player1CurrentState = player1Progress && player1Progress[currentTimeIndex] ?
    player1Progress[currentTimeIndex] : { code: originalCode, metrics: { executionTime: 999, memoryUsage: 999, complexity: 'N/A' } };

  const player2CurrentState = player2Progress && player2Progress[currentTimeIndex] ?
    player2Progress[currentTimeIndex] : { code: originalCode, metrics: { executionTime: 999, memoryUsage: 999, complexity: 'N/A' } };

  const player1Efficiency = calculateEfficiency(player1CurrentState.metrics);
  const player2Efficiency = calculateEfficiency(player2CurrentState.metrics);
  
  let currentLeaderText = 'Ничья';
  if (player1Efficiency > player2Efficiency) {
    currentLeaderText = 'Модель 1';
  } else if (player2Efficiency > player1Efficiency) {
    currentLeaderText = 'Модель 2';
  }

  return (
    <div className="w-full h-full flex flex-col p-1 text-white"> {/* Родитель в DuelCanvas имеет h-96 */}
      {problemDescription && (
        <h4 className="text-md font-semibold mb-2 text-center text-yellow-300 shrink-0">{problemDescription}</h4>
      )}

      <div className="flex flex-row justify-between mb-2 items-center shrink-0">
        <div className="text-sm">
          Шаг: {currentTimeIndex + 1} из {timeSteps}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentTimeIndex(prev => Math.max(0, prev - 1))}
            disabled={currentTimeIndex === 0}
            className="px-2 py-1 bg-gray-700 rounded-md text-xs disabled:opacity-50"
          >
            ◀ Назад
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-2 py-1 bg-blue-600 rounded-md text-xs"
          >
            {isPlaying ? '⏸ Пауза' : '▶ Воспроизвести'}
          </button>
          <button
            onClick={() => setCurrentTimeIndex(prev => Math.min(timeSteps - 1, prev + 1))}
            disabled={currentTimeIndex === timeSteps - 1}
            className="px-2 py-1 bg-gray-700 rounded-md text-xs disabled:opacity-50"
          >
            Вперед ▶
          </button>
        </div>
        <div className="text-sm">
          Лидер: {currentLeaderText}
        </div>
      </div>

      {/* Этот блок должен занимать оставшееся место и позволять внутренним блокам корректно распределять высоту */}
      <div className="flex flex-col sm:flex-row flex-1 gap-2 overflow-hidden"> {/* flex-1 для занятия оставшегося места, overflow-hidden для обрезки */}
        {/* Колонка для Модели 1 */}
        <div className="flex-1 flex flex-col min-w-0"> {/* min-w-0 для правильного flex поведения с текстом */}
          <MetricsDisplay
            metrics={player1CurrentState.metrics}
            title="Модель 1"
            color="text-blue-400"
          />
          <div className="flex-1 relative"> {/* Этот div позволяет CodeDiff занять оставшееся место */}
            <CodeDiff
              originalCode={originalCode}
              optimizedCode={player1CurrentState.code}
              title="Оптимизированный код (Модель 1)"
              color="text-blue-400"
            />
          </div>
        </div>

        {/* Колонка для Модели 2 */}
        <div className="flex-1 flex flex-col min-w-0">
          <MetricsDisplay
            metrics={player2CurrentState.metrics}
            title="Модель 2"
            color="text-red-400"
          />
          <div className="flex-1 relative">
            <CodeDiff
              originalCode={originalCode}
              optimizedCode={player2CurrentState.code}
              title="Оптимизированный код (Модель 2)"
              color="text-red-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}