import { useEffect, useState } from 'react';

export default function ModelParameters({ modelData, updateModelData, onNext, onBack }) {
  const [parameters, setParameters] = useState(modelData.parameters);
  const [statsImpact, setStatsImpact] = useState({
    accuracy: 0,
    speed: 0,
    cost: 0
  });
  
  // Calculate impact of parameter changes on model stats
  useEffect(() => {
    const baseAccuracy = modelData.estimatedAccuracy;
    const baseSpeed = modelData.estimatedSpeed;
    const baseCost = modelData.cost;
    
    // Calculate impact based on parameters
    const learningRateImpact = (parameters.learningRate - 0.001) * 10;
    const layersImpact = (parameters.layers - 3) * 0.02;
    const dropoutImpact = (parameters.dropoutRate - 0.2) * -0.5;
    
    // Different activation functions have different impacts
    const activationImpact = {
      'relu': 0,
      'sigmoid': -0.03,
      'tanh': -0.01,
      'leaky_relu': 0.02
    }[parameters.activationFunction];
    
    // Calculate total impacts
    const accuracyImpact = learningRateImpact + layersImpact + dropoutImpact + activationImpact;
    const speedImpact = -layersImpact * 10 - (activationImpact === 'sigmoid' ? 5 : 0);
    const costImpact = layersImpact * 50 + (parameters.learningRate > 0.01 ? 10 : 0);
    
    setStatsImpact({
      accuracy: accuracyImpact,
      speed: speedImpact,
      cost: costImpact
    });
    
  }, [parameters, modelData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    // Convert numeric values
    if (name === 'learningRate' || name === 'dropoutRate') {
      newValue = parseFloat(value);
    } else if (name === 'layers') {
      newValue = parseInt(value, 10);
    }
    
    setParameters({
      ...parameters,
      [name]: newValue
    });
  };
  
  const handleSubmit = () => {
    // Update the model data with parameters and adjusted stats
    updateModelData({
      parameters,
      estimatedAccuracy: Math.min(0.99, Math.max(0.5, modelData.estimatedAccuracy + statsImpact.accuracy)),
      estimatedSpeed: Math.min(100, Math.max(10, modelData.estimatedSpeed + statsImpact.speed)),
      cost: Math.max(50, modelData.cost + statsImpact.cost)
    });
    onNext();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Fine-tune Parameters</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="mb-4">
            <label className="block mb-2">Learning Rate</label>
            <input
              type="range"
              name="learningRate"
              min="0.0001"
              max="0.1"
              step="0.0001"
              value={parameters.learningRate}
              onChange={handleChange}
              className="w-full"
            />
            <div className="flex justify-between text-sm mt-1">
              <span>0.0001</span>
              <span className="font-medium">{parameters.learningRate.toFixed(4)}</span>
              <span>0.1</span>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Number of Layers</label>
            <input
              type="range"
              name="layers"
              min="1"
              max="10"
              value={parameters.layers}
              onChange={handleChange}
              className="w-full"
            />
            <div className="flex justify-between text-sm mt-1">
              <span>1</span>
              <span className="font-medium">{parameters.layers}</span>
              <span>10</span>
            </div>
          </div>
        </div>
        
        <div>
          <div className="mb-4">
            <label className="block mb-2">Dropout Rate</label>
            <input
              type="range"
              name="dropoutRate"
              min="0"
              max="0.5"
              step="0.05"
              value={parameters.dropoutRate}
              onChange={handleChange}
              className="w-full"
            />
            <div className="flex justify-between text-sm mt-1">
              <span>0</span>
              <span className="font-medium">{parameters.dropoutRate.toFixed(2)}</span>
              <span>0.5</span>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Activation Function</label>
            <select
              name="activationFunction"
              value={parameters.activationFunction}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600"
            >
              <option value="relu">ReLU</option>
              <option value="sigmoid">Sigmoid</option>
              <option value="tanh">Tanh</option>
              <option value="leaky_relu">Leaky ReLU</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Stats preview */}
      <div className="bg-gray-700 p-4 rounded-lg mb-6">
        <h3 className="text-md font-semibold mb-2">Parameter Impact</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-400">Accuracy</p>
            <p className={`font-medium ${statsImpact.accuracy >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {statsImpact.accuracy >= 0 ? '+' : ''}{statsImpact.accuracy.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Speed</p>
            <p className={`font-medium ${statsImpact.speed >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {statsImpact.speed >= 0 ? '+' : ''}{statsImpact.speed.toFixed(0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Cost</p>
            <p className={`font-medium ${statsImpact.cost <= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {statsImpact.cost > 0 ? '+' : ''}{statsImpact.cost.toFixed(0)} Credits
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
} 