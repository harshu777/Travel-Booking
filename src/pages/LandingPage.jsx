import React, { useState } from 'react';
import FlightSearchForm from '../components/FlightSearchForm';
import FlightResults from '../components/FlightResults';
import MessageBox from '../components/MessageBox';

const LandingPage = () => {
  const [flightResults, setFlightResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = (results) => {
    setFlightResults(results);
    setSearchPerformed(true);
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="container mx-auto p-4 relative">
        {/* Background overlay for better readability */}
        <div className="absolute inset-0 bg-black bg-opacity-10 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="text-center my-8">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              Welcome to the B2B Travel Platform
            </h1>
            <p className="text-lg text-white text-opacity-90 drop-shadow-md mt-2">
              Your one-stop solution for travel bookings.
            </p>
          </div>

          <div className="my-8" style={{ marginTop: '100px', marginBottom: '100px' }}>
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
              <FlightSearchForm 
                onSearch={handleSearch}
                onLoading={setIsLoading}
                onError={setError}
              />
            </div>
          </div>

          {isLoading && (
            <div className="text-center p-8">
              <div className="bg-white bg-opacity-90 rounded-xl p-6 max-w-md mx-auto shadow-lg">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="text-gray-700 font-medium">Loading flights...</p>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="max-w-4xl mx-auto">
              <MessageBox variant="error">{error}</MessageBox>
            </div>
          )}

          {searchPerformed && !isLoading && (
            <div className="my-8">
              <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Search Results</h2>
                <FlightResults flights={flightResults} error={error} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;