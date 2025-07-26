import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import MessageBox from './MessageBox';

const KycForm = ({ kycStatus, onKycSubmit }) => {
  const [documentType, setDocumentType] = useState('PAN');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(kycStatus);

  useEffect(() => {
    setCurrentStatus(kycStatus);
  }, [kycStatus]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleResetKyc = async () => {
    setMessage(null);
    try {
      const response = await api.post('/users/reset-kyc');
      setMessage({ type: 'success', text: response.data.message });
      setCurrentStatus('none'); // Immediately update local state to re-render the form
      
      // Clear the success message after a few seconds so the form is clearly visible
      setTimeout(() => {
        setMessage(null);
      }, 3000);

      if (onKycSubmit) {
        onKycSubmit(); 
      }
    } catch (error) {
      const errorText =
        error.response?.data?.message || 'An error occurred during KYC reset.';
      setMessage({ type: 'error', text: errorText });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file to upload.' });
      return;
    }
    setIsSubmitting(true);
    setMessage(null);
    
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('document', file);

    try {
      const response = await api.post(
        '/users/kyc',
        formData,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      setMessage({ type: 'success', text: response.data.message });
      if (onKycSubmit) {
        onKycSubmit(); // Callback to refresh parent component data
      }
    } catch (error) {
      const errorText = error.response?.data?.message || 'An error occurred during KYC submission.';
      setMessage({ type: 'error', text: errorText });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    switch (currentStatus) {
      case null:
        return <p className="text-gray-500">Loading KYC status...</p>;
      case 'approved':
        return (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="font-bold text-green-800">KYC Approved</p>
            <p className="text-green-700">Congratulations! Your account is fully verified.</p>
          </div>
        );
      case 'pending':
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="font-bold text-yellow-800">KYC Pending Review</p>
            <p className="text-yellow-700">Your documents have been submitted and are awaiting approval. You cannot submit new documents at this time. Please check back later.</p>
            <button
              onClick={handleResetKyc}
              className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Incorrect status? Click here to reset and submit again.
            </button>
          </div>
        );
      case 'rejected':
        return (
          <div>
            <p className="text-red-600 font-semibold mb-2">Your last KYC submission was rejected. Please resubmit with correct documents.</p>
            {renderForm()}
          </div>
        );
      case 'none':
      default:
        return renderForm();
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
          Document Type
        </label>
        <select
          id="documentType"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option>PAN</option>
          <option>Aadhaar</option>
          <option>Passport</option>
          <option>Business Registration</option>
        </select>
      </div>
      <div>
        <label htmlFor="documentFile" className="block text-sm font-medium text-gray-700">
          KYC Document
        </label>
        <input
          type="file"
          id="documentFile"
          onChange={handleFileChange}
          required
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
      >
        {isSubmitting ? 'Submitting...' : 'Submit KYC'}
      </button>
    </form>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">KYC Verification</h3>
      {message && <MessageBox type={message.type} message={message.text} />}
      <div className="mt-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default KycForm;
