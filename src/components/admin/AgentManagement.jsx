import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import MessageBox from '../MessageBox';

const AgentManagement = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fetchAgents = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/admin/agents');
            setAgents(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch agents.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

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
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request resubmission.');
        }
    };

    if (loading) return <div className="p-4 text-center">Loading Agents...</div>;

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4">Agent Management</h3>
            {error && <MessageBox variant="error">{error}</MessageBox>}
            {message && <MessageBox variant="success">{message}</MessageBox>}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Email</th>
                            <th className="px-4 py-2 text-center">KYC Status</th>
                            <th className="px-4 py-2 text-center">KYC Documents</th>
                            <th className="px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {agents.length > 0 ? agents.map(agent => {
                            const details = agent.kyc_details ? JSON.parse(agent.kyc_details) : {};
                            return (
                                <tr key={agent.id} className="border-b">
                                    <td className="px-4 py-2">{agent.name}</td>
                                    <td className="px-4 py-2">{agent.email}</td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            agent.kyc_status === 'approved' ? 'bg-green-100 text-green-800' :
                                            agent.kyc_status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {agent.kyc_status || 'Not Submitted'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-center space-x-2">
                                        {agent.kyc_status !== 'not_submitted' && (
                                            <>
                                                <button onClick={() => handleViewDocument(agent.id)} className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">View</button>
                                                <button onClick={() => handleDownloadDocument(agent.id, details.fileName)} className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600">Download</button>
                                            </>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <button onClick={() => handleRequestResubmission(agent.id)} className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600">Request Resubmission</button>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="5" className="text-center py-6">No agents found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AgentManagement;
