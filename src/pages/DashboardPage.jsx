import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import WalletTopUpModal from '../components/WalletTopUpModal';
import MessageBox from '../components/MessageBox';
import KycForm from '../components/KycForm'; // Import the new component

const AgentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState({ balance: 0, currency: 'USD' });
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo ? userInfo.accessToken : null;
      if (!token) throw new Error('Not authenticated.');

      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch all data in parallel
      const [profileRes, walletRes, transRes] = await Promise.all([
        axios.get('http://localhost:3001/api/users/profile', { headers }),
        axios.get('http://localhost:3001/api/users/wallet', { headers }),
        axios.get('http://localhost:3001/api/users/transactions', { headers }),
      ]);
      
      setProfile(profileRes.data);
      setWallet(walletRes.data);
      setTransactions(transRes.data);

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch dashboard data.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTopUpSuccess = (newBalance) => {
    setWallet(prev => ({ ...prev, balance: newBalance }));
    setIsModalOpen(false);
    fetchData(); // Re-fetch all data to get latest transactions
  };

  if (loading) {
    return <div className="p-8 text-center">Loading Dashboard...</div>;
  }

  return (
    <>
      {isModalOpen && (
        <WalletTopUpModal 
          onClose={() => setIsModalOpen(false)} 
          onTopUpSuccess={handleTopUpSuccess}
        />
      )}
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          {profile && <h2 className="text-xl font-semibold text-gray-600">Welcome, {profile.name}!</h2>}
        </div>
        
        {error && <MessageBox type="error" message={error} />}

        {/* Top Section: Wallet, Actions, and KYC */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Wallet and Actions */}
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-500 mb-2">Wallet Balance</h2>
              <p className="text-4xl font-bold">
                {wallet && typeof wallet.balance !== 'undefined' && wallet.currency ?
                  new Intl.NumberFormat('en-IN', { style: 'currency', currency: wallet.currency }).format(parseFloat(wallet.balance)) :
                  'N/A'
                }
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Wallet Top-up
              </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-500 mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/search/flights" className="text-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg">Flight Search</Link>
                <Link to="/search/hotels" className="text-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg">Hotel Search</Link>
                <Link to="/my-bookings" className="text-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg">My Bookings</Link>
                <Link to="/reports" className="text-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg">Reports</Link>
              </div>
            </div>
          </div>
          
          {/* KYC Section */}
          <div className="lg:col-span-1">
            <KycForm kycStatus={profile ? profile.kyc_status : null} onKycSubmit={fetchData} />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? transactions.map(t => (
                  <tr key={t.id} className="border-b">
                    <td className="px-4 py-2">{new Date(t.timestamp).toLocaleString()}</td>
                    <td className={`px-4 py-2 capitalize ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>{t.type}</td>
                    <td className="px-4 py-2 text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: t.currency }).format(t.amount)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="text-center py-4">No transactions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AgentDashboard;