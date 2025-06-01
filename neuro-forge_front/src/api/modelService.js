import { getCurrentToken } from './authService';
import api from '../services/api-service';
// Create axios instance

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = getCurrentToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Create a new AI model
 * @param {Object} modelData - The model data
 * @returns {Promise<Object>} Created model object
 */
export const createModel = async (modelData) => {
  try {
    const response = await api.post('/models', modelData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { errorMessage: 'Failed to create model' };
  }
};

/**
 * Get all models for the current player
 * @param {number} playerId - The ID of the player
 * @returns {Promise<Array>} List of models
 */
export const getPlayerModels = async (playerId) => {
  try {
    // Append playerId to the URL path
    const response = await api.get(`/models/player/${playerId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { errorMessage: 'Failed to fetch models' };
  }
};

/**
 * Get a specific model by ID
 * @param {number} modelId - The model ID
 * @returns {Promise<Object>} Model data
 */
export const getModelById = async (modelId) => {
  try {
    const response = await api.get(`/models/${modelId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { errorMessage: 'Failed to fetch model' };
  }
};

/**
 * Delete a model
 * @param {number} modelId - The model ID
 * @returns {Promise<void>}
 */
export const deleteModel = async (modelId) => {
  try {
    await api.delete(`/models/${modelId}`);
  } catch (error) {
    throw error.response?.data || { errorMessage: 'Failed to delete model' };
  }
}; 