import React, { useState, useEffect } from 'react';
import MessageBox from '../MessageBox';

const BookingReconciliation = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const response = await fetch('http://localhost:3001/api/admin/bookings', {
                    headers: { 'Authorization': `Bearer ${userInfo.accessToken}` },
                });
                if (!response.ok) throw new Error('Failed to fetch bookings');
                setBookings(await response.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    if (loading) return <div>Loading all bookings...</div>;
    if (error) return <MessageBox variant="error">{error}</MessageBox>;

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">All Bookings</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">PNR</th>
                            <th className="py-2 px-4 border-b">Agent Name</th>
                            <th className="py-2 px-4 border-b">Type</th>
                            <th className="py-2 px-4 border-b">Date</th>
                            <th className="py-2 px-4 border-b">Amount</th>
                            <th className="py-2 px-4 border-b">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map(b => (
                            <tr key={b.id}>
                                <td className="py-2 px-4 border-b">{b.pnr}</td>
                                <td className="py-2 px-4 border-b">{b.agent_name}</td>
                                <td className="py-2 px-4 border-b capitalize">{b.booking_type}</td>
                                <td className="py-2 px-4 border-b">{new Date(b.booking_date).toLocaleDateString()}</td>
                                <td className="py-2 px-4 border-b">{b.total_amount}</td>
                                <td className="py-2 px-4 border-b">{b.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookingReconciliation;
