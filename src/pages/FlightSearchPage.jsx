import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import MessageBox from '../components/MessageBox';
import FlightBookingForm from '../components/FlightBookingForm';
import { FaPlane, FaHotel, FaTrain, FaCar, FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt, FaUserFriends, FaArrowRight } from 'react-icons/fa';

// Mock airline logos
const airlineLogos = {
  'IndiGo': 'https://imgak.mmtcdn.com/flights/assets/media/dt/common/icons/6E.png?v=17',
  'Vistara': 'https://imgak.mmtcdn.com/flights/assets/media/dt/common/icons/UK.png?v=17',
  'Air India': 'https://imgak.mmtcdn.com/flights/assets/media/dt/common/icons/AI.png?v=17',
  'SpiceJet': 'https://imgak.mmtcdn.com/flights/assets/media/dt/common/icons/SG.png?v=17',
};

const FlightSearchPage = () => {
  const [tripType, setTripType] = useState('round-trip');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [stopsFilter, setStopsFilter] = useState([]);
  const [departureTimeFilter, setDepartureTimeFilter] = useState('');
  const [arrivalTimeFilter, setArrivalTimeFilter] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFlights([]);
    setSelectedFlight(null);
    setSearchPerformed(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.accessToken) throw new Error('You must be logged in to search flights.');

      const queryParams = new URLSearchParams({
        origin,
        destination,
        departureDate,
        tripType,
        passengers
      }).toString();

      const response = await fetch(`http://localhost:3001/api/flights/search?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${userInfo.accessToken}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch flights.');
      }

      const data = await response.json();
      setFlights(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingComplete = () => {
      setSelectedFlight(null);
  }

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
        return flightDepartureHour >= parseInt(departureTimeFilter.split('-')[0]) && flightDepartureHour < parseInt(departureTimeFilter.split('-')[1]);
      })
      .filter(flight => {
        if (!arrivalTimeFilter) return true;
        const flightArrivalHour = new Date(flight.arrival).getHours();
        return flightArrivalHour >= parseInt(arrivalTimeFilter.split('-')[0]) && flightArrivalHour < parseInt(arrivalTimeFilter.split('-')[1]);
      });
  }, [flights, priceRange, stopsFilter, departureTimeFilter, arrivalTimeFilter]);

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
            {/* Add Links for other services as they are implemented */}
          </div>
        </div>
      </div>

      {/* Search Form Section */}
      {!selectedFlight && (
        <div className="bg-blue-600 p-4">
          <div className="container mx-auto bg-white p-6 rounded-lg shadow-lg">
            <div className="flex space-x-4 mb-4">
              <label><input type="radio" value="one-way" checked={tripType === 'one-way'} onChange={(e) => setTripType(e.target.value)} className="mr-2"/>One-way</label>
              <label><input type="radio" value="round-trip" checked={tripType === 'round-trip'} onChange={(e) => setTripType(e.target.value)} className="mr-2"/>Round-trip</label>
            </div>
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="border p-2 rounded-lg">
                <label className="text-xs text-gray-500">From</label>
                <input type="text" placeholder="Origin" value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full font-bold text-lg" required />
              </div>
              <div className="border p-2 rounded-lg">
                <label className="text-xs text-gray-500">To</label>
                <input type="text" placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full font-bold text-lg" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border p-2 rounded-lg">
                  <label className="text-xs text-gray-500">Departure</label>
                  <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className="w-full font-bold" required />
                </div>
                <div className="border p-2 rounded-lg">
                  <label className="text-xs text-gray-500">Return</label>
                  <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="w-full font-bold" disabled={tripType !== 'round-trip'} />
                </div>
              </div>
              <div className="border p-2 rounded-lg">
                <label className="text-xs text-gray-500">Passengers</label>
                <input type="number" placeholder="Passengers" value={passengers} onChange={(e) => setPassengers(e.target.value)} min="1" className="w-full font-bold text-lg" required />
              </div>
            </form>
            <div className="text-center mt-6">
              <button type="submit" onClick={handleSearch} disabled={loading} className="bg-blue-600 text-white font-bold text-lg px-12 py-3 rounded-full hover:bg-blue-700 transition-colors">
                {loading ? 'Searching...' : 'SEARCH'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 md:p-8">
        {/* Results or Booking Form */}
        {error && <MessageBox variant="error">{error}</MessageBox>}
        
        {selectedFlight ? (
          <FlightBookingForm 
              flight={selectedFlight} 
              onBookingSuccess={handleBookingComplete}
              onCancel={() => setSelectedFlight(null)}
          />
        ) : searchPerformed && (
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
                  <div>
                    <label><input type="checkbox" value="Non-stop" onChange={handleStopsChange} className="mr-2"/>Non-stop</label>
                  </div>
                  <div>
                    <label><input type="checkbox" value="1" onChange={handleStopsChange} className="mr-2"/>1 Stop</label>
                  </div>
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
              {loading ? (
                <div className="text-center p-8"><p>Loading flights...</p></div>
              ) : filteredFlights.length > 0 ? filteredFlights.map(flight => (
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
                      <button onClick={() => setSelectedFlight(flight)} className="mt-2 w-full md:w-auto px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              )) : <div className="bg-white p-8 rounded-xl shadow-lg text-center"><p>No flights match your criteria.</p></div>}
            </main>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSearchPage;


