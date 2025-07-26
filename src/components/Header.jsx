import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlane, FaHotel, FaTrain, FaCar, FaUserCircle } from 'react-icons/fa';

const Header = ({ userInfo, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <h1>Travel Booking</h1>
          {/* <Link to="/">
            <img src="https://imgak.mmtcdn.com/pwa_v3/pwa_hotel_assets/header/logo@2x.png" alt="MakeMyTrip" className="h-12" />
          </Link> */}
        </div>

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
                  <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</Link>
                  <Link to="/my-bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Bookings</Link>
                  {userInfo.role === 'admin' && (
                    <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin</Link>
                  )}
                  <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Login or Create Account
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
