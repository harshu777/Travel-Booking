import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import MessageBox from '../MessageBox';

const KycManagement = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fetchSubmissions = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/admin/kyc-submissions');
            setSubmissions(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch KYC submissions.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const handleUpdateStatus = async (userId, status) => {
        setMessage('');
        setError('');
        try {
            const response = await api.put(`/admin/kyc/${userId}`, { status });
            setMessage(response.data.message);
            fetchSubmissions(); // Refresh the list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update KYC status.');
        }
    };

    const handleViewDocument = async (userId) => {
        setMessage('');
        setError('');
        try {
            const response = await api.get(`/admin/kyc-document/${userId}`, {
                responseType: 'blob',
            });
            const url = URL.createObjectURL(response.data);
            window.open(url, '_blank');
        } catch (err) {
            setError('Failed to view document.');
        }
    };

    const handleDownloadDocument = async (userId, fileName) => {
        setMessage('');
        setError('');
        try {
            const response = await api.get(`/admin/kyc-document/${userId}`, {
                responseType: 'blob',
            });
            const url = URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || 'kyc-document');
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            setError('Failed to download document.');
        }
    };

    const handleRequestResubmission = async (userId) => {
        setMessage('');
        setError('');
        try {
            const response = await api.post(`/admin/kyc/request-resubmission`, { userId });
            setMessage(response.data.message);
            fetchSubmissions(); // Refresh the list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request resubmission.');
        }
    };

    if (loading) return <div className="p-4 text-center">Loading KYC Submissions...</div>;

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4">KYC Management</h3>
            {error && <MessageBox variant="error">{error}</MessageBox>}
            {message && <MessageBox variant="success">{message}</MessageBox>}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left">Agent Name</th>
                            <th className="px-4 py-2 text-left">Email</th>
                            <th className="px-4 py-2 text-left">Submitted Details</th>
                            <th className="px-4 py-2 text-center">Document</th>
                            <th className="px-4 py-2 text-center">Status</th>
                            <th className="px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.length > 0 ? submissions.map(s => {
                            const details = s.kyc_details ? JSON.parse(s.kyc_details) : {};
                            return (
                                <tr key={s.id} className="border-b">
                                    <td className="px-4 py-2">{s.name}</td>
                                    <td className="px-4 py-2">{s.email}</td>
                                    <td className="px-4 py-2">{`${details.documentType || 'N/A'} - ${details.fileName || 'N/A'}`}</td>
                                    <td className="px-4 py-2 text-center space-x-2">
                                        <button onClick={() => handleViewDocument(s.id)} className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">View</button>
                                        <button onClick={() => handleDownloadDocument(s.id, details.fileName)} className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600">Download</button>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800`}>
                                            {s.kyc_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-center space-x-2">
                                        <button onClick={() => handleUpdateStatus(s.id, 'approved')} className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">Approve</button>
                                        <button onClick={() => handleUpdateStatus(s.id, 'rejected')} className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">Reject</button>
                                        <button onClick={() => handleRequestResubmission(s.id)} className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 mt-1">Request Resubmission</button>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="6" className="text-center py-6">No pending KYC submissions found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default KycManagement;
