import axios from 'axios';

// Axios instance pointing to our backend API
const api = axios.create({ baseURL: 'http://localhost:8080/api' });

/**
 * Create a new PvP match between two players/models.
 * @param {number} player1Id
 * @param {number} player2Id
 * @param {number} player1ModelId
 * @param {number} player2ModelId
 * @param {string} matchType
 * @returns {Promise<object>} Created match object
 */
export const createMatch = async (player1Id, player2Id, player1ModelId, player2ModelId, matchType) => {
  const response = await api.post('/matches', {
    player1Id,
    player2Id,
    player1ModelId,
    player2ModelId,
    matchType
  });
  return response.data;
};

/**
 * Fetch a match by its ID.
 * @param {number} matchId
 * @returns {Promise<object>} Match object with latest state
 */
export const getMatchById = async (matchId) => {
  const response = await api.get(`/matches/${matchId}`);
  return response.data;
};

export const getActiveMatches = async (playerId) => {
  const response = await api.get(`/matches/player/${playerId}/active`);
  return response.data;
};

/**
 * Get details for a specific match
 * @param {number} matchId
 */
export const getMatchDetails = async (matchId) => {
  if (!matchId) {
    console.error("getMatchDetails called without matchId");
    return null; // Or throw an error
  }
  try {
    const response = await api.get(`/matches/${matchId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch details for match ${matchId}:`, error);
    throw error; // Re-throw to be caught by the calling component
  }
}; 