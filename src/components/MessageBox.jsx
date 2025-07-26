import React from 'react';

/**
 * A component to display messages (e.g., errors, success, info).
 * @param {object} props
 * @param {'error' | 'success' | 'info'} props.variant - The style of the message box.
 * @param {React.Node} props.children - The message content.
 */
const MessageBox = ({ variant = 'info', children }) => {
  const baseClasses = 'p-4 rounded-md';
  const variants = {
    error: 'bg-red-100 text-red-700',
    success: 'bg-green-100 text-green-700',
    info: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className={`${baseClasses} ${variants[variant]}`}>
      {children}
    </div>
  );
};

export default MessageBox;
