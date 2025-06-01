import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPlayerModels } from '../api/modelService';
import { joinQueue, leaveQueue, getActiveMatches } from '../api/matchmakingService';
import { FiSearch, FiXCircle } from 'react-icons/fi';

export default function Matchmaking() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [models, setModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(true);

  const [selectedModel, setSelectedModel] = useState('');
  const [matchType, setMatchType] = useState('CLASSIFICATION');

  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const pollRef = useRef(null);

  // Load player's models
  useEffect(() => {
    async function fetchModels() {
      try {
        const data = await getPlayerModels(user.id);
        setModels(data);
        if (data.length > 0) setSelectedModel(data[0].id);
      } catch (err) {
        console.error('Failed to fetch models for matchmaking:', err);
        setError('Could not load your models.');
      } finally {
        setLoadingModels(false);
      }
    }
    if (user && user.id) fetchModels();
  }, [user]);

  // Start polling for active matches
  const startPolling = () => {
    pollRef.current = setInterval(async () => {
      try {
        const active = await getActiveMatches(user.id);
        if (active && active.length > 0) {
          // Stop polling
          clearInterval(pollRef.current);
          setSearching(false);
          // Navigate to duel page for the first active match
          navigate('/duel', { state: { matchId: active[0].id } });
        }
      } catch (err) {
        console.error('Error polling active matches:', err);
      }
    }, 2000);
  };

  const handleFindMatch = async () => {
    if (!selectedModel) {
      setError('Please select a model');
      return;
    }
    setError('');
    setSearching(true);
    try {
      await joinQueue(user.id, selectedModel, matchType);
      startPolling();
    } catch (err) {
      console.error('Failed to join matchmaking queue:', err);
      setError('Failed to start matchmaking.');
      setSearching(false);
    }
  };

  const handleCancelSearch = async () => {
    clearInterval(pollRef.current);
    setSearching(false);
    try {
      await leaveQueue(user.id);
    } catch (err) {
      console.error('Failed to leave matchmaking queue:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6">Find a Match</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {loadingModels ? (
          <p>Loading models...</p>
        ) : models.length === 0 ? (
          <p>No models available. Create a model first.</p>
        ) : (
          <>
            <div className="mb-4">
              <label className="block mb-2">Select Model</label>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                disabled={searching}
              >
                {models.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block mb-2">Match Type</label>
              <select
                value={matchType}
                onChange={e => setMatchType(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                disabled={searching}
              >
                <option value="CLASSIFICATION">Classification</option>
                <option value="COMPRESSION">Compression</option>
                <option value="BIAS_DETECTIVE">Bias Detective</option>
                <option value="LOGIC_TRACE">Logic Trace</option>
                <option value="TRANSLATION">Translation Battle</option>
                <option value="OPTIMIZATION">Optimization Rally</option>
              </select>
            </div>

            {searching ? (
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <button
                  onClick={handleCancelSearch}
                  className="flex items-center text-red-500 hover:text-red-400"
                >
                  <FiXCircle className="mr-2" />
                  Cancel Search
                </button>
              </div>
            ) : (
              <button
                onClick={handleFindMatch}
                className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 py-2 rounded text-white"
              >
                <FiSearch className="mr-2" />
                Find Match
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
} 