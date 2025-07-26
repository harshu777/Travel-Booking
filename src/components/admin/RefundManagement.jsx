import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import MessageBox from '../MessageBox';
import RefundNotesModal from './RefundNotesModal'; // Import the modal

const RefundManagement = () => {
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // State for modal management
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRefund, setCurrentRefund] = useState(null); // To store { id, status }

    const fetchRefunds = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo ? userInfo.accessToken : null;
            const response = await axios.get('http://localhost:3001/api/admin/refunds', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRefunds(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch refund requests.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRefunds();
    }, [fetchRefunds]);

    // Function to open the modal
    const handleOpenModal = (refundId, status) => {
        setCurrentRefund({ id: refundId, status });
        setIsModalOpen(true);
    };

    // Function to close the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentRefund(null);
    };

    // Function to handle the submission from the modal
    const handleModalSubmit = async (admin_notes) => {
        if (!currentRefund) return;

        setMessage('');
        setError('');

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo ? userInfo.accessToken : null;
            const response = await axios.put(`http://localhost:3001/api/admin/refunds/${currentRefund.id}`, 
                { status: currentRefund.status, admin_notes }, // Send status and notes
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setMessage(response.data.message);
            fetchRefunds(); // Refresh the list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process refund.');
        } finally {
            handleCloseModal(); // Close the modal regardless of outcome
        }
    };

    if (loading) return <div className="p-4 text-center">Loading Refund Requests...</div>;

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4">Refund Management</h3>
            {error && <MessageBox type="error" message={error} />}
            {message && <MessageBox type="success" message={message} />}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left">Request Date</th>
                            <th className="px-4 py-2 text-left">Agent Name</th>
                            <th className="px-4 py-2 text-left">Booking ID</th>
                            <th className="px-4 py-2 text-right">Amount</th>
                            <th className="px-4 py-2 text-center">Status</th>
                            <th className="px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {refunds.length > 0 ? refunds.map(r => (
                            <tr key={r.id} className="border-b">
                                <td className="px-4 py-2">{new Date(r.request_date).toLocaleString()}</td>
                                <td className="px-4 py-2">{r.agent_name}</td>
                                <td className="px-4 py-2">{r.booking_id}</td>
                                <td className="px-4 py-2 text-right">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: r.currency }).format(r.refund_amount)}</td>
                                <td className="px-4 py-2 text-center">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        r.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {r.status}
                                    </span>
                                </td>
                                <td className="px-4 py-2 text-center space-x-2">
                                    {r.status === 'pending' && (
                                        <>
                                            {/* Update buttons to open the modal */}
                                            <button onClick={() => handleOpenModal(r.id, 'approved')} className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">Approve</button>
                                            <button onClick={() => handleOpenModal(r.id, 'rejected')} className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">Reject</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="text-center py-6">No refund requests found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Render the modal */}
            <RefundNotesModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleModalSubmit}
                status={currentRefund?.status}
            />
        </div>
    );
};

export default RefundManagement;
