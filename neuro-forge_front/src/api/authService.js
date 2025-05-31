import axios from 'axios';

// Create axios instance with baseURL and interceptors
const api = axios.create({ baseURL: 'http://localhost:8080/api' });

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
    // Still store token for frontend state management, but not used for auth
    localStorage.setItem('token', token);
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
  return userStr ? JSON.parse(userStr) : null;
};

export const getCurrentToken = () => localStorage.getItem('token');

// Still use token existence to determine if user is "authenticated" in the frontend
export const isAuthenticated = () => !!getCurrentToken(); 