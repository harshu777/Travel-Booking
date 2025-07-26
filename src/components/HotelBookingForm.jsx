import React, { useState } from 'react';
import MessageBox from './MessageBox';
import api from '../utils/api';

const HotelBookingForm = ({ hotel, room, bookingDetails, onBookingSuccess, onCancel }) => {
  const [passengers, setPassengers] = useState([{ title: 'Mr', firstName: '', lastName: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  const handleAddPassenger = () => {
    if (passengers.length < bookingDetails.guests) {
        setPassengers([...passengers, { title: 'Mr', firstName: '', lastName: '' }]);
    } else {
        alert(`You cannot add more than ${bookingDetails.guests} guest(s) for this booking.`);
    }
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError('');

    try {
        const finalBookingDetails = { ...bookingDetails, passengers };
        const response = await api.post('/hotels/book', { hotel, room, bookingDetails: finalBookingDetails });
        onBookingSuccess(response.data); // Pass confirmation data to parent
    } catch (err) {
        setError(err.response?.data?.message || 'Booking failed.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">Confirm Hotel Booking</h2>
      <div className="mb-4 p-4 bg-gray-50 rounded-md border grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <p><strong>Hotel:</strong> {hotel.name}</p>
            <p><strong>Room:</strong> {room.type}</p>
        </div>
        <div className="text-right">
            <p><strong>Total Price:</strong></p>
            <p className="text-2xl font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: room.currency }).format(room.price)}</p>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">Guest Details</h3>
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
      <button onClick={handleAddPassenger} className="text-sm text-blue-600 mb-4">+ Add another guest (up to {bookingDetails.guests})</button>

      <div className="flex justify-end space-x-4 mt-6">
        <button onClick={onCancel} className="px-6 py-2 bg-gray-200 rounded-md">Cancel</button>
        <button onClick={handleConfirmBooking} disabled={loading} className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300">
          {loading ? 'Confirming...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
};

export default HotelBookingForm;
