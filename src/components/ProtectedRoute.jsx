import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // Check if the user has an access token
  if (userInfo && userInfo.accessToken) {
    // If authorized, return an outlet that will render child elements
    return <Outlet />;
  }

  // If not authorized, return to the login page
  return <Navigate to="/login" />;
};

export default ProtectedRoute;
