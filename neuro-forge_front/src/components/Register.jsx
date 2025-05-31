import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLock, FiMail, FiUserPlus } from 'react-icons/fi';
import { register } from '../api/authService';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(username, email, password);
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err) {
      setError(err.errorMessage || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full p-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-blue-500 mb-6">NeuroForge</h2>
        <h3 className="text-xl font-semibold text-center text-white mb-6">Register</h3>
        
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
              placeholder="Choose a username"
            />
          </div>
          
          <div className="mb-4">
            <label className="flex items-center text-gray-300 text-sm font-bold mb-2">
              <FiMail className="mr-2" />
              Email
            </label>
            <input
              className="bg-gray-700 appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-blue-500"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="mb-4">
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
              placeholder="Create a password"
            />
          </div>
          
          <div className="mb-6">
            <label className="flex items-center text-gray-300 text-sm font-bold mb-2">
              <FiLock className="mr-2" />
              Confirm Password
            </label>
            <input
              className="bg-gray-700 appearance-none border border-gray-600 rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:border-blue-500"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-150 ease-in-out"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : (
                <FiUserPlus className="mr-2" />
              )}
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-500 hover:text-blue-400">
                Log In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 