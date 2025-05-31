import { useState } from 'react';
import { FiCpu, FiGrid, FiLayers } from 'react-icons/fi';

export default function ModelArchitecture({ modelData, updateModelData, onNext, onBack }) {
  const [selectedArchitecture, setSelectedArchitecture] = useState(modelData.architecture);
  
  const architectures = [
    {
      id: 'cnn',
      name: 'Convolutional Neural Network',
      icon: <FiGrid className="text-4xl mb-2" />,
      description: 'Best for image recognition and visual processing tasks.',
      stats: {
        accuracy: 0.85,
        speed: 70,
        cost: 100
      }
    },
    {
      id: 'rnn',
      name: 'Recurrent Neural Network',
      icon: <FiLayers className="text-4xl mb-2" />,
      description: 'Ideal for sequential data like text or time series.',
      stats: {
        accuracy: 0.82,
        speed: 65,
        cost: 120
      }
    },
    {
      id: 'transformer',
      name: 'Transformer Architecture',
      icon: <FiCpu className="text-4xl mb-2" />,
      description: 'Powerful for language understanding and generation.',
      stats: {
        accuracy: 0.90,
        speed: 60,
        cost: 150
      }
    }
  ];

  const handleArchitectureSelect = (architecture) => {
    setSelectedArchitecture(architecture.id);
    updateModelData({
      architecture: architecture.id,
      estimatedAccuracy: architecture.stats.accuracy,
      estimatedSpeed: architecture.stats.speed,
      cost: architecture.stats.cost
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Select Model Architecture</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {architectures.map(architecture => (
          <div
            key={architecture.id}
            className={`p-4 rounded-lg cursor-pointer transition-all transform hover:-translate-y-1 ${
              selectedArchitecture === architecture.id 
                ? 'bg-blue-700 border-2 border-blue-500' 
                : 'bg-gray-700'
            }`}
            onClick={() => handleArchitectureSelect(architecture)}
          >
            <div className="text-center">
              {architecture.icon}
              <h3 className="font-medium mb-2">{architecture.name}</h3>
            </div>
            <p className="text-sm text-gray-300 mb-4">{architecture.description}</p>
            <div className="grid grid-cols-3 text-center text-sm">
              <div>
                <p className="text-gray-400">Accuracy</p>
                <p className="font-medium text-yellow-400">{(architecture.stats.accuracy * 100).toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-gray-400">Speed</p>
                <p className="font-medium text-green-400">{architecture.stats.speed}/100</p>
              </div>
              <div>
                <p className="text-gray-400">Cost</p>
                <p className="font-medium text-blue-400">{architecture.stats.cost} Credits</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
} 