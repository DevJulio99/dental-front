import React from 'react';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-gray-100">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
  </div>
);

export default LoadingSpinner;