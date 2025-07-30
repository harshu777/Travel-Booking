import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { debounce } from 'lodash';

const FlightSearchForm = ({ onSearch, onLoading, onError }) => {
  const [tripType, setTripType] = useState('one-way');
  
  // State for the text shown in the input fields
  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');

  // State for the actual IATA code to be sent to the API
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  // State for managing suggestions dropdown
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [activeSuggestionBox, setActiveSuggestionBox] = useState(null);

  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async (keyword, field) => {
    if (keyword.length < 2) {
      field === 'origin' ? setOriginSuggestions([]) : setDestinationSuggestions([]);
      return;
    }
    try {
      const response = await api.get(`/locations/search?keyword=${keyword}`);
      if (field === 'origin') {
        setOriginSuggestions(response.data);
        setActiveSuggestionBox('origin');
      } else {
        setDestinationSuggestions(response.data);
        setActiveSuggestionBox('destination');
      }
    } catch (err) {
      console.error("Suggestion fetch error:", err);
      // Optionally set an error state for suggestions
    }
  };

  // Using useCallback and debounce to prevent API calls on every keystroke
  const debouncedFetch = useCallback(debounce(fetchSuggestions, 300), []);

  const handleOriginChange = (e) => {
    const value = e.target.value;
    setOriginInput(value);
    setOrigin(''); // Clear the selected IATA code if user is typing again
    debouncedFetch(value, 'origin');
  };

  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestinationInput(value);
    setDestination(''); // Clear the selected IATA code
    debouncedFetch(value, 'destination');
  };

  const handleSelectSuggestion = (field, suggestion) => {
    if (field === 'origin') {
      setOriginInput(suggestion.name);
      setOrigin(suggestion.iataCode);
      setOriginSuggestions([]);
    } else {
      setDestinationInput(suggestion.name);
      setDestination(suggestion.iataCode);
      setDestinationSuggestions([]);
    }
    setActiveSuggestionBox(null);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!origin || !destination) {
      onError("Please select a valid origin and destination from the suggestions.");
      return;
    }
    setLoading(true);
    onLoading(true);
    onError('');

    try {
      const queryParams = new URLSearchParams({
        origin, // Use the IATA code state
        destination, // Use the IATA code state
        departureDate,
        tripType,
        passengers,
      }).toString();
      
      const response = await api.get(`/flights/search?${queryParams}`);
      onSearch(response.data.outboundFlights);

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch flights.';
      onError(errorMessage);
      onSearch([]); // Clear previous results on error
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  const SuggestionsBox = ({ suggestions, onSelect }) => (
    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
      {suggestions.length > 0 ? suggestions.map((item, index) => (
        <li 
          key={`${item.iataCode}-${index}`} 
          className="p-2 hover:bg-blue-100 cursor-pointer"
          onClick={() => onSelect(item)}
        >
          {item.name} <span className="text-gray-500">({item.subType})</span>
        </li>
      )) : (
        <li className="p-2 text-gray-500">No results found</li>
      )}
    </ul>
  );

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
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        <div className="relative">
          <div className="border p-2 rounded-lg">
            <label className="text-xs text-gray-500">From</label>
            <input type="text" placeholder="Origin" value={originInput} onChange={handleOriginChange} className="w-full font-bold text-lg bg-transparent" required autoComplete="off" />
          </div>
          {activeSuggestionBox === 'origin' && originSuggestions.length > 0 && <SuggestionsBox suggestions={originSuggestions} onSelect={(s) => handleSelectSuggestion('origin', s)} />}
        </div>
        <div className="relative">
          <div className="border p-2 rounded-lg">
            <label className="text-xs text-gray-500">To</label>
            <input type="text" placeholder="Destination" value={destinationInput} onChange={handleDestinationChange} className="w-full font-bold text-lg bg-transparent" required autoComplete="off" />
          </div>
          {activeSuggestionBox === 'destination' && destinationSuggestions.length > 0 && <SuggestionsBox suggestions={destinationSuggestions} onSelect={(s) => handleSelectSuggestion('destination', s)} />}
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