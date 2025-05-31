import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Step components
import ModelBasicInfo from './model/ModelBasicInfo';
import ModelArchitecture from './model/ModelArchitecture';
import ModelParameters from './model/ModelParameters';
import ModelTraining from './model/ModelTraining';
import ModelReview from './model/ModelReview';

export default function ModelCreation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [modelData, setModelData] = useState({
    name: '',
    description: '',
    architecture: 'cnn', // Default architecture
    parameters: {
      learningRate: 0.001,
      layers: 3,
      activationFunction: 'relu',
      dropoutRate: 0.2
    },
    training: {
      dataset: 'default',
      epochs: 10,
      batchSize: 32
    },
    estimatedAccuracy: 0.85, // Default estimated accuracy
    estimatedSpeed: 70, // Default estimated speed score
    cost: 100 // Default cost in credits
  });

  const updateModelData = (newData) => {
    setModelData({ ...modelData, ...newData });
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All progress will be lost.')) {
      navigate('/dashboard');
    }
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ModelBasicInfo 
          modelData={modelData} 
          updateModelData={updateModelData} 
          onNext={handleNext} 
          onCancel={handleCancel} 
        />;
      case 2:
        return <ModelArchitecture 
          modelData={modelData} 
          updateModelData={updateModelData} 
          onNext={handleNext} 
          onBack={handleBack} 
        />;
      case 3:
        return <ModelParameters 
          modelData={modelData} 
          updateModelData={updateModelData} 
          onNext={handleNext} 
          onBack={handleBack} 
        />;
      case 4:
        return <ModelTraining 
          modelData={modelData} 
          updateModelData={updateModelData} 
          onNext={handleNext} 
          onBack={handleBack} 
        />;
      case 5:
        return <ModelReview 
          modelData={modelData} 
          onBack={handleBack} 
          onCancel={handleCancel}
          user={user}
        />;
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-blue-500 mb-8">Create New AI Model</h1>
        
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between">
            <div className="flex-1">
              <div className={`h-2 rounded-l-full ${currentStep >= 1 ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
              <p className="text-xs mt-1 text-center">Basics</p>
            </div>
            <div className="flex-1">
              <div className={`h-2 ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
              <p className="text-xs mt-1 text-center">Architecture</p>
            </div>
            <div className="flex-1">
              <div className={`h-2 ${currentStep >= 3 ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
              <p className="text-xs mt-1 text-center">Parameters</p>
            </div>
            <div className="flex-1">
              <div className={`h-2 ${currentStep >= 4 ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
              <p className="text-xs mt-1 text-center">Training</p>
            </div>
            <div className="flex-1">
              <div className={`h-2 rounded-r-full ${currentStep >= 5 ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
              <p className="text-xs mt-1 text-center">Review</p>
            </div>
          </div>
        </div>
        
        {/* Current step content */}
        <div className="bg-gray-800 rounded-lg p-6">
          {renderStep()}
        </div>
      </div>
    </div>
  );
} 