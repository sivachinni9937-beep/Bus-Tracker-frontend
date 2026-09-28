// frontend/src/components/LoadingSpinner.jsx
import React from 'react';

export const LoadingSpinner = ({ message = 'Loading transit data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
        <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-r-cyan-400 border-b-transparent border-l-transparent animate-spin" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-400 animate-pulse tracking-wide">
        {message}
      </p>
    </div>
  );
};

export default LoadingSpinner;
