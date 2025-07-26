import React, { useState, useEffect } from 'react';
import MessageBox from '../MessageBox';

const SupportTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const response = await fetch('http://localhost:3001/api/admin/tickets', {
                    headers: { 'Authorization': `Bearer ${userInfo.accessToken}` },
                });
                if (!response.ok) throw new Error('Failed to fetch tickets');
                setTickets(await response.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    if (loading) return <div>Loading tickets...</div>;
    if (error) return <MessageBox variant="error">{error}</MessageBox>;

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Support Tickets</h2>
            <div className="space-y-4">
                {tickets.map(ticket => (
                    <div key={ticket.id} className="p-4 border rounded-md">
                        <div className="flex justify-between">
                            <h3 className="font-bold">{ticket.subject}</h3>
                            <span className="text-sm font-mono">{ticket.id}</span>
                        </div>
                        <p>Agent: {ticket.agent}</p>
                        <p>Status: {ticket.status}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SupportTickets;
