import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logout, saveUser } from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initUser = getCurrentUser();
    if (initUser) {
      console.log('[AuthContext] Initializing user from authService:', initUser);
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

  const updateUserData = (newData) => {
    console.log('[AuthContext] updateUserData called with newData:', newData);
    setUser(prevUser => {
      console.log('[AuthContext] User state before update:', prevUser);
      const updatedUser = { ...prevUser, ...newData };
      if (updatedUser.cloudCredits && typeof updatedUser.cloudCredits !== 'number') {
        updatedUser.cloudCredits = Number(updatedUser.cloudCredits) || 0;
      }
      console.log('[AuthContext] User data updated (in state):', updatedUser);
      saveUser(updatedUser);
      return updatedUser;
    });
  };

  const value = {
    user,
    loading,
    loginUser,
    logoutUser,
    updateUserData,
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