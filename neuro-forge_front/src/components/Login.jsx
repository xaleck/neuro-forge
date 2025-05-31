import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';
import { login } from '../api/authService';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const userData = await login(username, password);
      loginUser(userData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.errorMessage || 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full p-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-blue-500 mb-6">NeuroForge</h2>
        <h3 className="text-xl font-semibold text-center text-white mb-6">Login</h3>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="flex items-center text-gray-300 text-sm font-bold mb-2">
              <FiUser className="mr-2" />
              Username
            </label>
            <input
              className="bg-gray-700 appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-blue-500"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>
          
          <div className="mb-6">
            <label className="flex items-center text-gray-300 text-sm font-bold mb-2">
              <FiLock className="mr-2" />
              Password
            </label>
            <input
              className="bg-gray-700 appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-blue-500"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-150 ease-in-out"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : (
                <FiLogIn className="mr-2" />
              )}
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-500 hover:text-blue-400">
                Register
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 