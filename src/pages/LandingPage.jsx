import React, { useState } from 'react';
import FlightSearchForm from '../components/FlightSearchForm';
import FlightResults from '../components/FlightResults';
import MessageBox from '../components/MessageBox';
import travelImage from '../assets/composition-small-plane-passport-compass-laptop-tickets-grapefruit-plants-leaves.jpg';
import Loader from '../components/Loader';

const LandingPage = () => {
  const [flightResults, setFlightResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = (results) => {
    // Ensure we always have an array
    setFlightResults(Array.isArray(results) ? results : []);
  };

  const handleSelectFlight = (flight) => {
    // On the landing page, the primary action is to encourage login/signup.
    // The main booking flow is on the dedicated search page.
    console.log("Flight selected on Landing Page:", flight);
    alert("Please log in or navigate to the main search page to book flights.");
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: `url(${travelImage})`,
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="container mx-auto p-4 relative">
        {/* Background overlay for better readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
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

          {isLoading && <Loader />}
          
          {error && (
            <div className="max-w-4xl mx-auto mt-8">
              <MessageBox variant="error">{error}</MessageBox>
            </div>
          )}

          {!isLoading && flightResults.length > 0 && (
            <div className="my-8">
              <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Search Results</h2>
                <FlightResults 
                  flights={flightResults} 
                  error={error} 
                  onSelectFlight={handleSelectFlight} 
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;