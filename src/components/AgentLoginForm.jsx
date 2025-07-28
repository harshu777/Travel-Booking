import React, { useState } from 'react';
import MessageBox from './MessageBox';
import api from '../utils/api'; // Import the api instance

const AgentLoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Set loading to true

    try {
      // Use the api instance
      const response = await api.post('/auth/login', { email, password });
      
      // On successful login, call the callback function passed from App.jsx
      if (onLoginSuccess) {
        onLoginSuccess(response.data);
      }

    } catch (err) {
      // Handle errors from axios
      setError(err.response?.data?.message || err.message || 'Failed to login');
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center">Agent Login</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <MessageBox variant="error">{error}</MessageBox>}
        <div>
          <label className="block mb-1 text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
            disabled={loading} // Disable input during loading
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
            disabled={loading} // Disable input during loading
          />
        </div>
        <button 
          type="submit" 
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          disabled={loading} // Disable button during loading
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default AgentLoginForm;
