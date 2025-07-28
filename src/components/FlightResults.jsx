import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MessageBox from './MessageBox';
import FlightBookingForm from './FlightBookingForm';

// Mock airline logos - this could be moved to a shared utility file
const airlineLogos = {
  'IndiGo': 'https://imgak.mmtcdn.com/flights/assets/media/dt/common/icons/6E.png?v=17',
  'Vistara': 'https://imgak.mmtcdn.com/flights/assets/media/dt/common/icons/UK.png?v=17',
  'Air India': 'https://imgak.mmtcdn.com/flights/assets/media/dt/common/icons/AI.png?v=17',
  'SpiceJet': 'https://imgak.mmtcdn.com/flights/assets/media/dt/common/icons/SG.png?v=17',
};

const FlightResults = ({ flights, error }) => {
  const [selectedFlight, setSelectedFlight] = useState(null);
  const navigate = useNavigate();

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [stopsFilter, setStopsFilter] = useState([]);
  const [departureTimeFilter, setDepartureTimeFilter] = useState('');

  const handleSelectFlight = (flight) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      // If user is not logged in, redirect them to login page
      // We can pass the selected flight info in state to return to it after login
      navigate('/login', { state: { from: '/search/flights', selectedFlightId: flight.id } });
    } else {
      setSelectedFlight(flight);
    }
  };

  const handleBookingComplete = () => {
    setSelectedFlight(null);
    // Potentially show a success message and clear search results
  };

  const handleStopsChange = (e) => {
    const { value, checked } = e.target;
    setStopsFilter(prev =>
      checked ? [...prev, value] : prev.filter(stop => stop !== value)
    );
  };

  const filteredFlights = useMemo(() => {
    return flights
      .filter(flight => flight.price >= priceRange[0] && flight.price <= priceRange[1])
      .filter(flight => {
        if (stopsFilter.length === 0) return true;
        return stopsFilter.includes(flight.stops.split(' ')[0]);
      })
      .filter(flight => {
        if (!departureTimeFilter) return true;
        const flightDepartureHour = new Date(flight.departure).getHours();
        const [start, end] = departureTimeFilter.split('-').map(Number);
        return flightDepartureHour >= start && flightDepartureHour < end;
      });
  }, [flights, priceRange, stopsFilter, departureTimeFilter]);

  if (error) {
    return <MessageBox variant="error">{error}</MessageBox>;
  }

  if (selectedFlight) {
    return (
      <FlightBookingForm
        flight={selectedFlight}
        onBookingSuccess={handleBookingComplete}
        onCancel={() => setSelectedFlight(null)}
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Filters Sidebar */}
      <aside className="w-full md:w-1/4 md:sticky top-24 self-start">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4">Popular Filters</h3>
          {/* Price Range Filter */}
          <div className="mb-4">
            <label className="font-semibold">Price Range</label>
            <div className="flex justify-between text-sm text-gray-600">
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="200000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full"
            />
          </div>
          {/* Stops Filter */}
          <div className="mb-4">
            <label className="font-semibold">Stops</label>
            <div><label><input type="checkbox" value="Non-stop" onChange={handleStopsChange} className="mr-2"/>Non-stop</label></div>
            <div><label><input type="checkbox" value="1" onChange={handleStopsChange} className="mr-2"/>1 Stop</label></div>
          </div>
          {/* Departure Time Filter */}
          <div className="mb-4">
            <label htmlFor="departureTime" className="font-semibold">Departure Time</label>
            <select id="departureTime" value={departureTimeFilter} onChange={(e) => setDepartureTimeFilter(e.target.value)} className="w-full p-2 border rounded mt-1">
              <option value="">Any</option>
              <option value="0-6">Before 6 AM</option>
              <option value="6-12">6 AM - 12 PM</option>
              <option value="12-18">12 PM - 6 PM</option>
              <option value="18-24">After 6 PM</option>
            </select>
          </div>
        </div>
      </aside>

      {/* Flight List */}
      <main className="w-full md:w-3/4 space-y-4">
        {filteredFlights.length > 0 ? filteredFlights.map(flight => (
          <div key={flight.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 ease-in-out">
            <div className="p-4 flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <img src={airlineLogos[flight.airline]} alt={`${flight.airline} logo`} className="w-10 h-10 mr-3"/>
                <div>
                  <div className="font-bold">{flight.airline}</div>
                  <div className="text-sm text-gray-500">{flight.flightNumber}</div>
                </div>
              </div>
              <div className="flex-grow flex items-center justify-center text-center md:text-left mx-4">
                  <div className="text-center">
                      <div className="font-bold text-lg">{new Date(flight.departure).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      <div className="text-sm">{flight.origin}</div>
                  </div>
                  <div className="flex-grow items-center justify-center mx-4 text-center">
                      <div className="text-sm text-gray-500">{flight.duration}</div>
                      <div className="w-full bg-gray-200 h-0.5 mt-1"><div className="bg-blue-500 h-0.5"></div></div>
                      <div className="text-xs text-gray-500">{flight.stops}</div>
                  </div>
                  <div className="text-center">
                      <div className="font-bold text-lg">{new Date(flight.arrival).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      <div className="text-sm">{flight.destination}</div>
                  </div>
              </div>
              <div className="text-center md:text-right mt-4 md:mt-0">
                <div className="text-xl font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: flight.currency }).format(flight.price)}</div>
                <button onClick={() => handleSelectFlight(flight)} className="mt-2 w-full md:w-auto px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        )) : <div className="bg-white p-8 rounded-xl shadow-lg text-center"><p>No flights match your criteria.</p></div>}
      </main>
    </div>
  );
};

export default FlightResults;