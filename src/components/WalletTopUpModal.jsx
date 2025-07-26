import React, { useState } from 'react';
import MessageBox from './MessageBox';

const WalletTopUpModal = ({ onClose, onTopUpSuccess }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card'); // Default payment method
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTopUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch('http://localhost:3001/api/users/wallet/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.accessToken}`,
        },
        body: JSON.stringify({ 
          amount: parseFloat(amount),
          paymentMethod: paymentMethod 
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to top-up wallet.');
      }
      
      onTopUpSuccess(data.newBalance);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Wallet Top-up</h2>
        <form onSubmit={handleTopUp}>
          {error && <MessageBox type="error" message={error} />}
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount (INR)</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., 5000.00"
              min="1"
              step="0.01"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="net_banking">Net Banking</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300">
              {loading ? 'Processing...' : 'Add Funds'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalletTopUpModal;
