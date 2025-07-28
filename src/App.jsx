import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FlightSearchPage from './pages/FlightSearchPage';
import HotelSearchPage from './pages/HotelSearchPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Header from './components/Header';
import { jwtDecode } from 'jwt-decode';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import KycDocumentDisplay from './components/admin/KycDocumentDisplay';
import LandingPage from './pages/LandingPage'; // Import the new LandingPage

function App() {
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if (user && user.accessToken) {
      try {
        const decoded = jwtDecode(user.accessToken);
        if (decoded.exp * 1000 > Date.now()) {
          setUserInfo({ ...user, role: decoded.role });
        } else {
          // Token expired, clear it
          localStorage.removeItem('userInfo');
        }
      } catch (e) {
        console.error("Invalid token:", e);
        localStorage.removeItem('userInfo');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    navigate('/login'); // Redirect to login after logout
  };

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    const decoded = jwtDecode(userData.accessToken);
    setUserInfo({ ...userData, role: decoded.role });
    
    // Redirect based on role after login
    if (decoded.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <>
      <Header userInfo={userInfo} onLogout={handleLogout} />
      <main className="pt-16"> {/* Add padding to main to offset fixed header */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Protected Agent Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/search/flights" element={<FlightSearchPage />} />
            <Route path="/search/hotels" element={<HotelSearchPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/kyc-document/:userId" element={<KycDocumentDisplay />} />
          </Route>

          {/* Fallback redirect if user is logged in and hits a non-existent path */}
          <Route path="*" element={
            <Navigate to={userInfo ? (userInfo.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/'} />
          } />
        </Routes>
      </main>
    </>
  );
}

const Root = () => (
  <Router>
    <App />
  </Router>
);

export default Root;

