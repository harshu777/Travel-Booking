import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import MessageBox from '../components/MessageBox';

const MyBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/bookings');
            setBookings(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch bookings.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleRequestRefund = async (bookingId) => {
        if (!window.confirm('Are you sure you want to request a refund for this booking?')) {
            return;
        }
        setMessage('');
        setError('');
        try {
            const response = await api.post(`/bookings/${bookingId}/refund`);
            setMessage(response.data.message);
            fetchBookings(); // Refresh bookings to show updated status
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request refund.');
        }
    };

    const handleDownloadInvoice = async (bookingId) => {
        try {
            const response = await api.get(`/invoices/booking/${bookingId}`);
            // In a real app, this would trigger a PDF download.
            // For now, we'll just show the invoice data in an alert.
            alert(`Invoice Generated:\nNumber: ${response.data.invoice_number}\nAmount: ${response.data.total_amount} ${response.data.currency}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to download invoice.');
        }
    };

    const handleDownloadETicket = async (bookingId, pnr) => {
        try {
            setMessage('Generating E-Ticket... Please wait.');
            setError('');
            const response = await api.get(
                `/bookings/${bookingId}/eticket`,
                {
                    responseType: 'blob', // Crucial for file downloads
                }
            );

            // Create a URL from the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `e-ticket-${pnr}.pdf`);
            
            // Append to html link element page
            document.body.appendChild(link);
            
            // Start download
            link.click();
            
            // Clean up and remove the link
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            setMessage('');

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to download e-ticket.');
            setMessage('');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading your bookings...</div>;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
            {error && <MessageBox type="error" message={error} />}
            {message && <MessageBox type="info" message={message} />}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">PNR</th>
                                <th className="px-4 py-2 text-left">Type</th>
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-right">Amount</th>
                                <th className="px-4 py-2 text-center">Status</th>
                                <th className="px-4 py-2 text-center">Refund</th>
                                <th className="px-4 py-2 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length > 0 ? bookings.map(b => (
                                <tr key={b.id} className="border-b">
                                    <td className="px-4 py-2 font-mono">{b.pnr}</td>
                                    <td className="px-4 py-2 capitalize">{b.booking_type}</td>
                                    <td className="px-4 py-2">{new Date(b.booking_date).toLocaleDateString()}</td>
                                    <td className="px-4 py-2 text-right">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: b.currency }).format(b.total_amount)}</td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            b.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            b.refund_status === 'none' ? 'bg-gray-100 text-gray-800' :
                                            b.refund_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            b.refund_status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {b.refund_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-center space-x-2">
                                        {b.status === 'confirmed' && <button onClick={() => handleDownloadETicket(b.id, b.pnr)} className="text-indigo-600 hover:underline text-sm">E-Ticket</button>}
                                        {/* <button onClick={() => handleDownloadInvoice(b.id)} className="text-indigo-600 hover:underline text-sm">Invoice</button> */}
                                        {b.status === 'confirmed' && b.refund_status === 'none' && (
                                            <button onClick={() => handleRequestRefund(b.id)} className="text-red-600 hover:underline text-sm">Request Refund</button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-8">You have no bookings yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyBookingsPage;


