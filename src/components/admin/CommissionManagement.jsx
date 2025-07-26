import React, { useState, useEffect } from 'react';
import MessageBox from '../MessageBox';

const CommissionManagement = () => {
    const [rates, setRates] = useState({ flight_commission_rate: '', hotel_commission_rate: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const response = await fetch('http://localhost:3001/api/admin/commissions', {
                    headers: { 'Authorization': `Bearer ${userInfo.accessToken}` },
                });
                if (!response.ok) throw new Error('Failed to fetch rates');
                setRates(await response.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRates();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const response = await fetch('http://localhost:3001/api/admin/commissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.accessToken}`,
                },
                body: JSON.stringify(rates),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            setSuccess(data.message);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !rates.flight_commission_rate) return <div>Loading...</div>;

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Commission Management</h2>
            {error && <MessageBox variant="error">{error}</MessageBox>}
            {success && <MessageBox variant="success">{success}</MessageBox>}
            <form onSubmit={handleUpdate} className="space-y-4 max-w-md">
                <div>
                    <label className="block font-medium">Flight Commission Rate (%)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={rates.flight_commission_rate}
                        onChange={(e) => setRates({ ...rates, flight_commission_rate: e.target.value })}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <label className="block font-medium">Hotel Commission Rate (%)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={rates.hotel_commission_rate}
                        onChange={(e) => setRates({ ...rates, hotel_commission_rate: e.target.value })}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    {loading ? 'Updating...' : 'Update Rates'}
                </button>
            </form>
        </div>
    );
};

export default CommissionManagement;
