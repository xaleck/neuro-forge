import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCpu, FiCheck, FiX } from 'react-icons/fi';
import { createModel } from '../../api/modelService';

export default function ModelReview({ modelData, onBack, onCancel, user }) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleCreateModel = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      await createModel({
        name: modelData.name,
        description: modelData.description,
        architecture: modelData.architecture,
        parameters: JSON.stringify(modelData.parameters),
        accuracy: modelData.estimatedAccuracy,
        speedScore: modelData.estimatedSpeed,
        playerId: user.id,
      });
      
      navigate('/dashboard', { 
        state: { 
          success: true, 
          message: `Your model "${modelData.name}" has been created successfully!` 
        } 
      });
    } catch (err) {
      console.error('Error creating model:', err);
      setError(err.errorMessage || 'Failed to create model. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const architectureNames = {
    'cnn': 'Convolutional Neural Network',
    'rnn': 'Recurrent Neural Network',
    'transformer': 'Transformer Architecture'
  };
  
  const datasetNames = {
    'default': 'Standard Dataset',
    'premium': 'Premium Dataset',
    'specialized': 'Specialized Dataset'
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Review Model Configuration</h2>
      
      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-3 mb-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="font-medium mb-3 border-b border-gray-600 pb-2">Basic Information</h3>
          <div className="mb-4">
            <p className="text-gray-400 text-sm">Model Name</p>
            <p className="font-medium">{modelData.name}</p>
          </div>
          <div className="mb-4">
            <p className="text-gray-400 text-sm">Description</p>
            <p className="text-sm">{modelData.description}</p>
          </div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="font-medium mb-3 border-b border-gray-600 pb-2">Architecture</h3>
          <div className="mb-4">
            <p className="text-gray-400 text-sm">Type</p>
            <p className="font-medium">{architectureNames[modelData.architecture]}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Learning Rate</p>
              <p>{modelData.parameters.learningRate}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Layers</p>
              <p>{modelData.parameters.layers}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="font-medium mb-3 border-b border-gray-600 pb-2">Training Configuration</h3>
          <div className="mb-4">
            <p className="text-gray-400 text-sm">Dataset</p>
            <p className="font-medium">{datasetNames[modelData.training.dataset]}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Epochs</p>
              <p>{modelData.training.epochs}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Batch Size</p>
              <p>{modelData.training.batchSize}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="font-medium mb-3 border-b border-gray-600 pb-2">Expected Performance</h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <p className="text-gray-400 text-sm">Accuracy</p>
              <p className="font-medium text-yellow-400">{(modelData.estimatedAccuracy * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Speed</p>
              <p className="font-medium text-green-400">{modelData.estimatedSpeed}/100</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Cost</p>
              <p className="font-medium text-blue-400">{Math.round(modelData.cost)} Credits</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4 mb-6 flex items-start">
        <FiCpu className="text-blue-400 text-xl mt-1 mr-3 flex-shrink-0" />
        <div>
          <p className="text-blue-300 font-medium">Ready to create your model?</p>
          <p className="text-sm text-blue-200 opacity-90">
            This will deduct {Math.round(modelData.cost)} Credits from your account. Your model will be available after training is complete.
          </p>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded flex items-center"
          disabled={isSubmitting}
        >
          <FiX className="mr-1" />
          Back
        </button>
        
        <button
          onClick={handleCreateModel}
          className={`bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Creating...
            </>
          ) : (
            <>
              <FiCheck className="mr-1" />
              Create Model
            </>
          )}
        </button>
      </div>
    </div>
  );
} 