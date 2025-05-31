import axios from 'axios';
import { getCurrentToken } from './authService';

// Axios instance with JWT
const api = axios.create({ baseURL: 'http://localhost:8080/api' });
api.interceptors.request.use(
  config => {
    const token = getCurrentToken();
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

/**
 * Join matchmaking queue with a specific player, model and match type
 * @param {number} playerId - ID of the player
 * @param {number} modelId - ID of the model to use
 * @param {string} matchType - Type of match
 */
export const joinQueue = async (playerId, modelId, matchType) => {
  const response = await api.post('/matchmaking/join', { playerId, modelId, matchType });
  return response.data;
};

/**
 * Leave the matchmaking queue for a specific player
 * @param {number} playerId
 */
export const leaveQueue = async (playerId) => {
  const response = await api.post('/matchmaking/leave', { playerId });
  return response.data;
};

/**
 * Get active matches for the player
 * @param {number} playerId
 */
export const getActiveMatches = async (playerId) => {
  const response = await api.get(`/matches/player/${playerId}/active`);
  return response.data;
}; 