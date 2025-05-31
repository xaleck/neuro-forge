import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMatchDetails } from '../api/matchService';

export default function DuelCanvas() {
  const { user } = useAuth();
  const location = useLocation();

  const [matchDetails, setMatchDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const matchId = location.state?.matchId;

  useEffect(() => {
    if (!matchId) {
      setError('No Match ID provided. Cannot load duel.');
      setLoading(false);
      return;
    }

    async function fetchMatch() {
      setLoading(true);
      setError('');
      try {
        const data = await getMatchDetails(matchId);
        setMatchDetails(data);
      } catch (err) {
        console.error('Failed to fetch match details:', err);
        setError(`Failed to load duel: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    fetchMatch();

  }, [matchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg">
          <p className="text-xl">Loading Duel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg">
          <p className="text-xl text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!matchDetails) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg">
          <p className="text-xl">Match details not found.</p>
        </div>
      </div>
    );
  }

  const player1Display = `Player ${matchDetails.player1Id}`;
  const player2Display = `Player ${matchDetails.player2Id}`;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">Duel Arena</h1>
        <h2 className="text-xl text-center text-yellow-400 mb-6">Match ID: {matchDetails.id}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-center">
          <div>
            <h3 className="text-2xl font-semibold text-blue-400">{player1Display}</h3>
            {matchDetails.player1ModelId && <p className="text-sm text-gray-400">Model ID: {matchDetails.player1ModelId}</p>}
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-red-400">{player2Display}</h3>
            {matchDetails.player2ModelId && <p className="text-sm text-gray-400">Model ID: {matchDetails.player2ModelId}</p>}
          </div>
        </div>
        <p className="text-center text-lg mb-6">Match Type: <span className="font-semibold text-green-400">{matchDetails.matchType}</span></p>
        
        {matchDetails.endedAt ? (
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Match Concluded!</h3>
            <p className="text-lg">Winner: {matchDetails.winnerId ? (matchDetails.winnerId === user.id ? 'You!' : `Player ${matchDetails.winnerId}`) : 'Draw'}</p>
            <p>Score: {player1Display} {matchDetails.player1Score} - {matchDetails.player2Score} {player2Display}</p>
          </div>
        ) : (
          <p className="text-center text-lg text-yellow-500">Match in Progress...</p>
        )}
      </div>

      <div className="bg-gray-700 p-8 rounded-lg shadow-xl w-full max-w-2xl h-96 flex items-center justify-center">
        <p className="text-2xl text-gray-400">Duel Canvas Placeholder</p>
        {matchDetails.matchData && <pre className="mt-4 text-xs bg-gray-900 p-2 rounded overflow-auto">{JSON.stringify(JSON.parse(matchDetails.matchData), null, 2)}</pre>}
      </div>
    </div>
  );
} 