import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AgentLoginForm from '../components/AgentLoginForm';

const LoginPage = ({ onLoginSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // This function will be passed to the login form.
  // It wraps the original onLoginSuccess to add the redirect logic.
  const handleLoginAndRedirect = (userData) => {
    // Call the original function from App.jsx to set the global user state
    onLoginSuccess(userData);

    // Check if we were redirected here with a flight to book
    const { from, selectedFlightId } = location.state || {};
    if (from === '/search/flights' && selectedFlightId) {
      // If so, navigate to the search page, which will now show the booking form
      // because the user is logged in. We pass the flight ID along.
      // Note: The FlightResults component needs to be able to handle this.
      navigate('/search/flights', { state: { selectedFlightId } });
    }
    // The default redirect to dashboard is handled by onLoginSuccess in App.jsx
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <AgentLoginForm onLoginSuccess={handleLoginAndRedirect} />
        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot Password?
          </Link>
          <p className="mt-2 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;