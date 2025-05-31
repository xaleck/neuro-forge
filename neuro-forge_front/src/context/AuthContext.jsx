import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logout } from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initUser = getCurrentUser();
    if (initUser) {
      setUser(initUser);
    }
    setLoading(false);
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
  };

  const logoutUser = () => {
    logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    loginUser,
    logoutUser,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 