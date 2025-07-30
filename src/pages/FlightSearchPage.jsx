import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaPlane, FaHotel } from 'react-icons/fa';
import FlightSearchForm from '../components/FlightSearchForm';
import FlightResults from '../components/FlightResults';
import FlightBookingForm from '../components/FlightBookingForm'; // Import the booking form
import MessageBox from '../components/MessageBox';
import Loader from '../components/Loader'; // Import the new Loader
import api from '../utils/api';

const FlightSearchPage = () => {
  const [flightResults, setFlightResults] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null); // State to hold a flight for direct booking
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const location = useLocation();

  // This effect runs when the component loads to handle a direct booking redirect
  useEffect(() => {
    const { flightToBook } = location.state || {};
    if (flightToBook) {
      // If we have a flight object in the state, the user was redirected from login.
      // Set this flight as the selected one to directly show the booking form.
      setSelectedFlight(flightToBook);
      setSearchPerformed(true); // Mark search as "performed" to show the content area
    }
  }, [location.state]);


  const handleSearch = (results) => {
    setFlightResults(results);
    setSelectedFlight(null); // Clear any previously selected flight on a new search
    setSearchPerformed(true);
  };

  const handleBookingSuccess = () => {
    setSelectedFlight(null); // Clear the selected flight
    setFlightResults([]); // Clear search results
    setSearchPerformed(false); // Reset the search state
    // Optionally, you could show a success message here or navigate to "My Bookings"
  };

  // This function will be passed to FlightResults to set the selected flight
  const handleSelectFlight = (flight) => {
    setSelectedFlight(flight);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {isLoading && <Loader />}
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
        
        {error && <MessageBox variant="error">{error}</MessageBox>}

        {searchPerformed && !isLoading && (
          <>
            {selectedFlight ? (
              <FlightBookingForm 
                flight={selectedFlight} 
                onBookingSuccess={handleBookingSuccess}
                onCancel={() => setSelectedFlight(null)} // Allow canceling the booking view
              />
            ) : (
              <FlightResults 
                flights={flightResults} 
                error={error} 
                onSelectFlight={handleSelectFlight} // Pass the handler down
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FlightSearchPage;


