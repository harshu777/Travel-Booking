import React, { useState } from 'react';
import AgentManagement from '../components/admin/AgentManagement';
import AnalyticsReports from '../components/admin/AnalyticsReports';
import CommissionManagement from '../components/admin/CommissionManagement';
import BookingReconciliation from '../components/admin/BookingReconciliation';
import SupportTickets from '../components/admin/SupportTickets';
import KycManagement from '../components/admin/KycManagement';
import RefundManagement from '../components/admin/RefundManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('agents');

  const renderContent = () => {
    switch (activeTab) {
      case 'agents':
        return <AgentManagement />;
      case 'kyc':
        return <KycManagement />;
      case 'refunds':
        return <RefundManagement />;
      case 'analytics':
        return <AnalyticsReports />;
      case 'commissions':
        return <CommissionManagement />;
      case 'bookings':
        return <BookingReconciliation />;
      case 'support':
        return <SupportTickets />;
      default:
        return <div>Select a tab</div>;
    }
  };

  const TabButton = ({ tabName, title }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 rounded-md text-sm font-medium ${
        activeTab === tabName ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {title}
    </button>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <TabButton tabName="agents" title="Agent Management" />
        <TabButton tabName="kyc" title="KYC Management" />
        <TabButton tabName="refunds" title="Refunds" />
        <TabButton tabName="bookings" title="All Bookings" />
        <TabButton tabName="analytics" title="Analytics" />
        <TabButton tabName="commissions" title="Commissions" />
        <TabButton tabName="support" title="Support Tickets" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
