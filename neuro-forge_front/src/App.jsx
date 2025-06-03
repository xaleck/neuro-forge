import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import DuelCanvas from './components/DuelCanvas';
import ModelCreation from './components/ModelCreation';
import Matchmaking from './components/Matchmaking';
import SoloTranslationBattlePage from './components/SoloTranslationBattlePage';
import LeaderboardPage from './components/LeaderboardPage';
import MathQuizPage from './pages/MathQuizPage';
import BlitzTranslationPage from './pages/BlitzTranslationPage';

// Новый компонент для маршрутов, который будет использовать useAuth
function AppRoutes() {
  const { isAuthenticated, loading } = useAuth(); // Получаем isAuthenticated и loading здесь

  if (loading) {
    // Можно оставить ваш текущий лоадер или улучшить
    return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white text-xl"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <Routes>
      {/* Маршрут для главной страницы: если залогинен - на дашборд, если нет - на логин */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
      />
      <Route
        path="/dashboard"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />
      <Route
        path="/duel"
        element={<ProtectedRoute><DuelCanvas /></ProtectedRoute>}
      />
      <Route
        path="/create-model"
        element={<ProtectedRoute><ModelCreation /></ProtectedRoute>}
      />
      <Route
        path="/matchmaking"
        element={<ProtectedRoute><Matchmaking /></ProtectedRoute>}
      />
      <Route
        path="/solo-translation-battle"
        element={<ProtectedRoute><SoloTranslationBattlePage /></ProtectedRoute>}
      />
      <Route
        path="/leaderboard"
        element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>}
      />
      <Route
        path="/math-quiz"
        element={<ProtectedRoute><MathQuizPage /></ProtectedRoute>}
      />
      <Route
        path="/blitz-translation"
        element={<ProtectedRoute><BlitzTranslationPage /></ProtectedRoute>}
      />
      {/* Запасной маршрут: если залогинен - на дашборд, если нет - на логин */}
      <Route
        path="*"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
