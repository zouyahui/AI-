import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-12 h-12 border-4 border-garden-200 border-t-garden-600 rounded-full animate-spin"></div>
      {message && <p className="text-garden-700 font-medium animate-pulse">{message}</p>}
    </div>
  );
};
