import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiLogOut, FiCpu, FiBarChart, FiUsers, FiPlusCircle, FiSearch } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getPlayerModels } from '../api/modelService';

export default function Dashboard() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Fetch user's models
  useEffect(() => {
    const fetchModels = async () => {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }
      try {
        const data = await getPlayerModels(user.id);
        setModels(data);
      } catch (error) {
        console.error('Failed to fetch models:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchModels();
  }, [user]);
  
  // Handle success message from model creation
  useEffect(() => {
    if (location.state?.success) {
      setShowSuccess(true);
      setSuccessMessage(location.state.message);
      
      // Clear the success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);
  
  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-blue-500">NeuroForge Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition duration-150"
          >
            <FiLogOut className="mr-2" />
            Logout
          </button>
        </div>
        
        {/* Success message */}
        {showSuccess && (
          <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-4 mb-6">
            <p className="text-green-400">{successMessage}</p>
          </div>
        )}
        
        {/* Welcome message */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-2">Welcome back, {user?.username}!</h2>
          <p className="text-gray-300">
            Your current ELO rating: <span className="text-yellow-400 font-bold">{user?.eloRating || 1000}</span>
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <FiCpu className="text-2xl mr-3" />
              <h3 className="text-lg font-semibold">Your Models</h3>
            </div>
            <p className="text-3xl font-bold">{models.length}</p>
            <p className="text-sm opacity-80 mt-1">Models created</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <FiBarChart className="text-2xl mr-3" />
              <h3 className="text-lg font-semibold">Resources</h3>
            </div>
            <p className="text-3xl font-bold">500</p>
            <p className="text-sm opacity-80 mt-1">Cloud Credits</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <FiUsers className="text-2xl mr-3" />
              <h3 className="text-lg font-semibold">Matches</h3>
            </div>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm opacity-80 mt-1">Total matches</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => navigate('/create-model')}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition duration-150"
          >
            <FiPlusCircle className="mr-2" />
            Create Model
          </button>
          
          <button
            onClick={() => navigate('/matchmaking')}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg transition duration-150"
          >
            <FiSearch className="mr-2" />
            Find Match
          </button>
          
          <button
            onClick={() => navigate('/duel')}
            className="flex items-center bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg transition duration-150"
          >
            Start PvP Duel
          </button>
        </div>
        
        {/* Models List or Empty State */}
        {loading ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading your models...</p>
          </div>
        ) : models.length > 0 ? (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Your AI Models</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.map(model => (
                <div key={model.id} className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-lg mb-1">{model.name}</h4>
                  <p className="text-sm text-gray-300 mb-3">Accuracy: {(model.accuracy * 100).toFixed(0)}%</p>
                  <div className="flex justify-between text-sm">
                    <span className={`px-2 py-1 rounded ${model.deployed ? 'bg-green-900 text-green-300' : 'bg-gray-600'}`}>
                      {model.deployed ? 'Deployed' : 'Not Deployed'}
                    </span>
                    <span className="text-blue-300">{model.creditsPerMinute} Credits/min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <FiCpu className="text-5xl mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No AI Models Yet</h3>
            <p className="text-gray-400 mb-4">Create your first AI model to start competing!</p>
            <button 
              onClick={() => navigate('/create-model')}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition duration-150"
            >
              Create Model
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 