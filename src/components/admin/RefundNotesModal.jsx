import React, { useState, useEffect } from 'react';

const RefundNotesModal = ({ isOpen, onClose, onSubmit, status }) => {
    const [notes, setNotes] = useState('');

    useEffect(() => {
        // Reset notes when the modal is opened
        if (isOpen) {
            setNotes('');
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const isRejection = status === 'rejected';
    const title = isRejection ? 'Reason for Rejection' : 'Add Notes for Approval';
    const instruction = isRejection 
        ? 'Please provide a clear reason for rejecting this refund. This will be shared with the agent.'
        : 'You can add optional notes for this approval.';

    const handleSubmit = () => {
        if (isRejection && notes.trim() === '') {
            alert('Rejection reason is required.');
            return;
        }
        onSubmit(notes);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <p className="mb-4 text-sm text-gray-600">{instruction}</p>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2 border rounded-md h-32"
                    placeholder="Enter notes here..."
                />
                <div className="flex justify-end space-x-4 mt-6">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        className={`px-4 py-2 text-white rounded-md ${isRejection ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                    >
                        {isRejection ? 'Submit Rejection' : 'Submit Approval'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RefundNotesModal;
