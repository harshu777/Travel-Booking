import React, { useState, useEffect } from 'react';
import MessageBox from '../MessageBox';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsReports = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const response = await fetch('http://localhost:3001/api/admin/analytics', {
                    headers: { 'Authorization': `Bearer ${userInfo.accessToken}` },
                });
                if (!response.ok) throw new Error('Failed to fetch analytics data');
                setData(await response.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Loading analytics...</div>;
    if (error) return <MessageBox variant="error">{error}</MessageBox>;

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Sales & Bookings Overview</h2>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="sales" fill="#8884d8" name="Sales (INR)" />
                        <Bar yAxisId="right" dataKey="bookings" fill="#82ca9d" name="Bookings" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AnalyticsReports;
