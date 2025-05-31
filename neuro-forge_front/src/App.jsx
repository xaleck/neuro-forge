import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import DuelCanvas from './components/DuelCanvas';
import ModelCreation from './components/ModelCreation';
import Matchmaking from './components/Matchmaking';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/duel" 
            element={
              <ProtectedRoute>
                <DuelCanvas />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-model" 
            element={
              <ProtectedRoute>
                <ModelCreation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/matchmaking"
            element={
              <ProtectedRoute>
                <Matchmaking />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
