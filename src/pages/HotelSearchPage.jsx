import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlane, FaHotel, FaTrain, FaCar } from 'react-icons/fa';

const HotelSearchPage = () => {
  return (
    <div>
      <div className="bg-blue-600">
        <div className="container mx-auto px-4 pt-4">
          {/* Service Tabs */}
          <div className="flex items-center space-x-4">
            <Link to="/search/flights" className="flex items-center space-x-2 text-white opacity-70 hover:opacity-100">
              <FaPlane />
              <span>Flights</span>
            </Link>
            <Link to="/search/hotels" className="flex items-center space-x-2 text-white font-semibold bg-blue-700 px-4 py-2 rounded-t-lg">
              <FaHotel />
              <span>Hotels</span>
            </Link>
            {/* Add Links for other services as they are implemented */}
          </div>
        </div>
      </div>
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Hotel Search</h1>
        <p className="text-lg text-gray-600">This feature is coming soon. Please check back later!</p>
      </div>
    </div>
  );
};

export default HotelSearchPage;