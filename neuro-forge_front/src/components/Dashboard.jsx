import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiLogOut, FiCpu, FiBarChart, FiUsers, FiPlusCircle, FiSearch, FiTrendingUp, FiZap } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getPlayerModels } from '../api/modelService';
import BuyEloModal from './BuyEloModal';
import MatchHistoryModal from './MatchHistoryModal';
import { FaMoneyBillWave, FaChartLine, FaGamepad, FaUsers, FaStar, FaChessQueen, FaCalculator } from 'react-icons/fa';

export default function Dashboard() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isBuyEloModalOpen, setIsBuyEloModalOpen] = useState(false);
  const [isMatchHistoryModalOpen, setIsMatchHistoryModalOpen] = useState(false);

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

  const currentUserCredits = user?.cloudCredits || 0;

  const handleCardClick = (path) => {
    navigate(path);
  };

  const openBuyEloModal = () => setIsBuyEloModalOpen(true);
  const closeBuyEloModal = () => setIsBuyEloModalOpen(false);

  const openMatchHistoryModal = () => setIsMatchHistoryModalOpen(true);
  const closeMatchHistoryModal = () => setIsMatchHistoryModalOpen(false);

  const statsCards = [
    {
      title: "Ресурсы",
      value: `${500 + currentUserCredits} CC`,
      description: `Базовые 500 + Заработанные ${currentUserCredits}`,
      icon: <FaMoneyBillWave className="text-4xl text-blue-400" />,
      clickable: true,
      action: openBuyEloModal,
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
    },
    {
      title: "Рейтинг",
      value: user?.eloRating ? Math.round(user.eloRating) : 1000,
      description: "Текущий ELO рейтинг",
      icon: <FaStar className="text-4xl text-yellow-400" />,
      clickable: true,
      action: () => handleCardClick('/leaderboard'),
      bgColor: 'bg-yellow-500/10 hover:bg-yellow-500/20',
    },
    {
      title: "Матчи",
      value: user?.matchesPlayed || 0,
      description: "Всего сыграно матчей",
      icon: <FaGamepad className="text-4xl text-purple-400" />,
      clickable: true,
      action: openMatchHistoryModal,
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
    },
  ];

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
          {statsCards.map((card, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${card.bgColor} p-6 rounded-lg shadow-lg cursor-pointer hover:from-blue-500 hover:to-blue-600 transition-all duration-200`}
              onClick={card.action}
              title={card.description}
            >
              <div className="flex items-center mb-4">
                {card.icon}
                <h3 className="text-lg font-semibold">{card.title}</h3>
              </div>
              <p className="text-3xl font-bold">{card.value}</p>
              <p className="text-sm opacity-80 mt-1">{card.description}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Удаляем кнопку Create Model */}
          {/* 
          <button
            onClick={() => navigate('/create-model')}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition duration-150"
          >
            <FiPlusCircle className="mr-2" />
            Create Model
          </button>
          */}

          <button
            onClick={() => navigate('/solo-translation-battle')}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg transition duration-150"
          >
            <FiSearch className="mr-2" />
            Переводной вызов
          </button>

          <button
            onClick={() => navigate('/math-quiz')}
            className="flex items-center bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg transition duration-150"
          >
            <FaCalculator className="mr-2" />
            Математический Квиз
          </button>

          <button
            onClick={() => navigate('/scipop-quiz')}
            className="flex items-center bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg transition duration-150"
          >
            <FiBarChart className="mr-2" />
            Научпоп Викторина
          </button>

          {/* <button
            onClick={() => navigate('/blitz-translation')}
            className="flex items-center bg-teal-600 hover:bg-teal-700 text-white py-2 px-6 rounded-lg transition duration-150"
          >
            <FiZap className="mr-2" />
            Play Blitz Translation
          </button> */}

        </div>

        {/* Удаляем всю секцию Models List or Empty State */}
        {/* 
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
        */}
      </div>

      {/* Модальное окно для покупки ELO */}
      <BuyEloModal
        isOpen={isBuyEloModalOpen}
        onClose={closeBuyEloModal}
        currentUserCredits={currentUserCredits}
      />
      <MatchHistoryModal
        isOpen={isMatchHistoryModalOpen}
        onClose={closeMatchHistoryModal}
        matches={user?.matchHistory || []}
      />
    </div>
  );
} 