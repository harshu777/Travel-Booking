import React from 'react';
import { Link } from 'react-router-dom';
import AgentLoginForm from '../components/AgentLoginForm';

const LoginPage = ({ onLoginSuccess }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <AgentLoginForm onLoginSuccess={onLoginSuccess} />
        <div className="mt-4 text-center">
          <Link to="/forgot-password" prefetch={false} className="text-sm text-blue-600 hover:underline">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;