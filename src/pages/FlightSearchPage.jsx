import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaPlane, FaHotel } from 'react-icons/fa';
import FlightSearchForm from '../components/FlightSearchForm';
import FlightResults from '../components/FlightResults';
import MessageBox from '../components/MessageBox';
import api from '../utils/api';

const FlightSearchPage = () => {
  const [flightResults, setFlightResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const location = useLocation();

  // This effect runs when the component loads, specifically to handle
  // the redirect from the login page.
  useEffect(() => {
    const { selectedFlightId } = location.state || {};
    if (selectedFlightId) {
      // If we have a flight ID, we need to fetch all flights again
      // to find the one the user wanted to book.
      setIsLoading(true);
      api.get('/flights/search') // Fetch all mock flights
        .then(response => {
          const allFlights = response.data;
          const selected = allFlights.find(f => f.id === selectedFlightId);
          if (selected) {
            // We set the results to just the selected flight to show the booking form.
            setFlightResults([selected]);
            setSearchPerformed(true);
          }
        })
        .catch(err => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [location.state]);


  const handleSearch = (results) => {
    setFlightResults(results);
    setSearchPerformed(true);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-blue-600">
        <div className="container mx-auto px-4 pt-4">
          {/* Service Tabs */}
          <div className="flex items-center space-x-4">
            <Link to="/search/flights" className="flex items-center space-x-2 text-white font-semibold bg-blue-700 px-4 py-2 rounded-t-lg">
              <FaPlane />
              <span>Flights</span>
            </Link>
            <Link to="/search/hotels" className="flex items-center space-x-2 text-white opacity-70 hover:opacity-100">
              <FaHotel />
              <span>Hotels</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Search Form Section */}
      <div className="bg-blue-600 p-4">
        <div className="container mx-auto">
          <FlightSearchForm 
            onSearch={handleSearch}
            onLoading={setIsLoading}
            onError={setError}
          />
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-8">
        {isLoading && <div className="text-center p-8"><p>Loading flights...</p></div>}
        
        {error && <MessageBox variant="error">{error}</MessageBox>}

        {searchPerformed && !isLoading && (
           <FlightResults flights={flightResults} error={error} />
        )}
      </div>
    </div>
  );
};

export default FlightSearchPage;


