import React, { useState } from 'react';
import MessageBox from './MessageBox';
import api from '../utils/api';

const FlightBookingForm = ({ flight, onBookingSuccess, onCancel }) => {
  const [passengers, setPassengers] = useState([{ title: 'Mr', firstName: '', lastName: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  const handleAddPassenger = () => {
    setPassengers([...passengers, { title: 'Mr', firstName: '', lastName: '' }]);
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError('');
    setSuccess(null);

    try {
        const response = await api.post('/flights/book', { flight, passengers });
        setSuccess(response.data);
        onBookingSuccess(); // Notify parent to update wallet, etc.
    } catch (err) {
        setError(err.response?.data?.message || 'Booking failed.');
    } finally {
        setLoading(false);
    }
  };
  
  if (success) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <MessageBox variant="success">
                <h2 className="text-xl font-bold mb-2">{success.message}</h2>
                <p>Your PNR is: <strong className="text-lg">{success.pnr}</strong></p>
                <a href={success.eticketUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View E-Ticket
                </a>
            </MessageBox>
            <button onClick={onCancel} className="mt-4 px-6 py-2 bg-gray-200 rounded-md">Back to Search</button>
        </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Confirm Booking</h2>
      <div className="mb-4 p-4 bg-gray-50 rounded-md border">
        <p><strong>Flight:</strong> {flight.airline} {flight.flightNumber}</p>
        <p><strong>From:</strong> {flight.origin} <strong>To:</strong> {flight.destination}</p>
        <p><strong>Total Price:</strong> {new Intl.NumberFormat('en-IN', { style: 'currency', currency: flight.currency }).format(flight.price)}</p>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">Passenger Details</h3>
      {error && <MessageBox variant="error">{error}</MessageBox>}
      {passengers.map((p, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-2 mb-2">
          <select value={p.title} onChange={(e) => handlePassengerChange(index, 'title', e.target.value)} className="p-2 border rounded">
            <option>Mr</option><option>Mrs</option><option>Miss</option>
          </select>
          <input type="text" placeholder="First Name" value={p.firstName} onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)} className="p-2 border rounded" required />
          <input type="text" placeholder="Last Name" value={p.lastName} onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)} className="p-2 border rounded" required />
        </div>
      ))}
      <button onClick={handleAddPassenger} className="text-sm text-blue-600 mb-4">+ Add another passenger</button>

      <div className="flex justify-end space-x-4 mt-6">
        <button onClick={onCancel} className="px-6 py-2 bg-gray-200 rounded-md">Cancel</button>
        <button onClick={handleConfirmBooking} disabled={loading} className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300">
          {loading ? 'Confirming...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
};

export default FlightBookingForm;
