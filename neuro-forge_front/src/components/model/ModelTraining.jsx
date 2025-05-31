import { useState } from 'react';
import { FiDatabase } from 'react-icons/fi';

export default function ModelTraining({ modelData, updateModelData, onNext, onBack }) {
  const [training, setTraining] = useState(modelData.training);
  
  const datasets = [
    {
      id: 'default',
      name: 'Standard Dataset',
      size: 'Medium (10,000 samples)',
      quality: 'Good',
      cost: 0,
      description: 'A balanced dataset suitable for general purpose training.'
    },
    {
      id: 'premium',
      name: 'Premium Dataset',
      size: 'Large (50,000 samples)',
      quality: 'Excellent',
      cost: 50,
      description: 'High-quality data with diverse samples and excellent annotations.'
    },
    {
      id: 'specialized',
      name: 'Specialized Dataset',
      size: 'Medium (15,000 samples)',
      quality: 'Very Good',
      cost: 30,
      description: 'Domain-specific data optimized for particular use cases.'
    }
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    // Convert numeric values
    if (name === 'epochs' || name === 'batchSize') {
      newValue = parseInt(value, 10);
    }
    
    setTraining({
      ...training,
      [name]: newValue
    });
  };
  
  const handleDatasetSelect = (datasetId) => {
    // Find additional cost for dataset
    const selectedDataset = datasets.find(d => d.id === datasetId);
    const additionalCost = selectedDataset ? selectedDataset.cost : 0;
    
    // Update training config
    setTraining({
      ...training,
      dataset: datasetId
    });
    
    // Update cost if changing from default dataset
    if (datasetId !== 'default') {
      updateModelData({
        cost: modelData.cost + additionalCost
      });
    }
  };
  
  const handleSubmit = () => {
    updateModelData({ training });
    onNext();
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Training Configuration</h2>
      
      <div className="mb-6">
        <h3 className="text-lg mb-3">Select Dataset</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {datasets.map(dataset => (
            <div
              key={dataset.id}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                training.dataset === dataset.id 
                  ? 'bg-blue-700 border-2 border-blue-500' 
                  : 'bg-gray-700'
              }`}
              onClick={() => handleDatasetSelect(dataset.id)}
            >
              <div className="flex items-center mb-2">
                <FiDatabase className="mr-2" />
                <h4 className="font-medium">{dataset.name}</h4>
              </div>
              <p className="text-sm text-gray-300 mb-3">{dataset.description}</p>
              <div className="grid grid-cols-2 text-sm">
                <div>
                  <p className="text-gray-400">Size:</p>
                  <p>{dataset.size}</p>
                </div>
                <div>
                  <p className="text-gray-400">Quality:</p>
                  <p>{dataset.quality}</p>
                </div>
              </div>
              {dataset.cost > 0 && (
                <p className="mt-2 text-sm text-blue-300">+{dataset.cost} Credits</p>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="mb-4">
          <label className="block mb-2">Training Epochs</label>
          <input
            type="range"
            name="epochs"
            min="1"
            max="50"
            value={training.epochs}
            onChange={handleChange}
            className="w-full"
          />
          <div className="flex justify-between text-sm mt-1">
            <span>1</span>
            <span className="font-medium">{training.epochs} epochs</span>
            <span>50</span>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">Batch Size</label>
          <input
            type="range"
            name="batchSize"
            min="8"
            max="128"
            step="8"
            value={training.batchSize}
            onChange={handleChange}
            className="w-full"
          />
          <div className="flex justify-between text-sm mt-1">
            <span>8</span>
            <span className="font-medium">{training.batchSize}</span>
            <span>128</span>
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