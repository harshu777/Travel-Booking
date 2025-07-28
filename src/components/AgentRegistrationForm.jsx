import React, { useState } from 'react';
import MessageBox from './MessageBox';
import api from '../utils/api'; // Import the api instance

const AgentRegistrationForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true); // Set loading to true
    try {
      // Use the api instance
      const response = await api.post('/auth/register', { name, email, password });

      setSuccess(response.data.message || 'Registration successful! You can now log in.');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

    } catch (err) {
      // Handle errors from axios, including validation errors
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map(e => e.msg).join(' ');
        setError(errorMessages);
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to register');
      }
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center">Agent Registration</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <MessageBox variant="error">{error}</MessageBox>}
        {success && <MessageBox variant="success">{success}</MessageBox>}
        <div>
          <label className="block mb-1 text-sm font-medium">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
            disabled={loading} // Disable input during loading
          />
        </div>
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
        <div>
          <label className="block mb-1 text-sm font-medium">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default AgentRegistrationForm;
