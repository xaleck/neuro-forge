import api from '../services/api-service';
// Create axios instance with baseURL and interceptors

// No longer attach JWT tokens to requests
api.interceptors.request.use(
  (config) => {
    // Token is still stored but no longer used for authentication
    return config;
  },
  (error) => Promise.reject(error)
);

// No longer handle 401 errors specifically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export const register = async (username, email, password) => {
  try {
    const response = await api.post('/players/register', { username, email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { errorMessage: 'Registration failed' };
  }
};

export const login = async (username, password) => {
  try {
    const response = await api.post('/players/login', { username, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    if (user && typeof user.cloudCredits === 'undefined') {
      user.cloudCredits = 0;
      console.log('[AuthService] Set initial cloudCredits on login:', user.cloudCredits);
    }
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    throw error.response?.data || { errorMessage: 'Login failed' };
  }
};

export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && typeof user.cloudCredits === 'undefined') {
        user.cloudCredits = 0;
        console.log('[AuthService] Set default cloudCredits in getCurrentUser:', user.cloudCredits);
      }
      return user;
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
      localStorage.removeItem('user');
      return null;
    }
  }
  return null;
};

export const saveUser = (userData) => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      if (userData && typeof userData.cloudCredits !== 'number') {
        userData.cloudCredits = Number(userData.cloudCredits) || 0;
      }
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('[AuthService] User data saved to localStorage:', userData);
    } catch (error) {
      console.error("Error saving user to localStorage", error);
    }
  }
};

export const getCurrentToken = () => localStorage.getItem('token');

// Still use token existence to determine if user is "authenticated" in the frontend
export const isAuthenticated = () => !!getCurrentToken(); 