import React, { useState } from 'react';
import api from '../utils/api';

const FlightSearchForm = ({ onSearch, onLoading, onError }) => {
  const [tripType, setTripType] = useState('one-way');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    onLoading(true);
    onError('');

    try {
      const queryParams = new URLSearchParams({
        origin,
        destination,
        departureDate,
        tripType,
        passengers,
      }).toString();
      
      const response = await api.get(`/flights/search?${queryParams}`);
      onSearch(response.data);

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch flights.';
      onError(errorMessage);
      onSearch([]); // Clear previous results on error
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex space-x-4 mb-4">
        <label>
          <input type="radio" value="one-way" checked={tripType === 'one-way'} onChange={(e) => setTripType(e.target.value)} className="mr-2"/>
          One-way
        </label>
        <label>
          <input type="radio" value="round-trip" checked={tripType === 'round-trip'} onChange={(e) => setTripType(e.target.value)} className="mr-2"/>
          Round-trip
        </label>
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
        <div className={`grid ${tripType === 'round-trip' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
          <div className="border p-2 rounded-lg">
            <label className="text-xs text-gray-500">Departure</label>
            <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className="w-full font-bold" required />
          </div>
          {tripType === 'round-trip' && (
            <div className="border p-2 rounded-lg">
              <label className="text-xs text-gray-500">Return</label>
              <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="w-full font-bold" required={tripType === 'round-trip'} />
            </div>
          )}
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
  );
};

export default FlightSearchForm;