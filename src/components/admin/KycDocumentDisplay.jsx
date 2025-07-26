import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import MessageBox from '../MessageBox';

const KycDocumentDisplay = () => {
    const [documentUrl, setDocumentUrl] = useState('');
    const [error, setError] = useState('');
    const { userId } = useParams();

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const response = await api.get(`/admin/kyc-document/${userId}`, {
                    responseType: 'blob',
                });
                const url = URL.createObjectURL(response.data);
                setDocumentUrl(url);
            } catch (err) {
                setError('Failed to load KYC document.');
            }
        };

        if (userId) {
            fetchDocument();
        }

        return () => {
            if (documentUrl) {
                URL.revokeObjectURL(documentUrl);
            }
        };
    }, [userId]);

    if (error) return <MessageBox type="error" message={error} />;
    if (!documentUrl) return <div className="p-4 text-center">Loading document...</div>;

    return (
        <div className="w-full h-screen">
            <iframe src={documentUrl} title="KYC Document" className="w-full h-full" />
        </div>
    );
};

export default KycDocumentDisplay;
