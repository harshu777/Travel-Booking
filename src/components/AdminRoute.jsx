import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminRoute = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  if (userInfo && userInfo.accessToken) {
    const decodedToken = jwtDecode(userInfo.accessToken);
    if (decodedToken.role === 'admin') {
      return <Outlet />;
    }
  }

  // Redirect to home page if not an admin
  return <Navigate to="/" />;
};

export default AdminRoute;
