import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

const Header = ({ userInfo, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          B2B Travel
        </Link>

        {/* Login/User Menu */}
        <div className="flex items-center space-x-4">
          {userInfo ? (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                <FaUserCircle className="text-2xl" />
                <span>Hi, {userInfo.name.split(' ')[0]}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <Link to="/my-bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>My Bookings</Link>
                  {userInfo.role === 'admin' && (
                    <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>Admin</Link>
                  )}
                  <button onClick={() => { onLogout(); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-x-2">
              <Link to="/login" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md">
                Login
              </Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
