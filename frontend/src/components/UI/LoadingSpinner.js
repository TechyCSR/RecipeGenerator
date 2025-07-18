import React from 'react';

const LoadingSpinner = ({ className = 'h-8 w-8', color = 'text-primary-500' }) => {
  return (
    <div className={`loading-spinner ${className} ${color}`} />
  );
};

export default LoadingSpinner;
