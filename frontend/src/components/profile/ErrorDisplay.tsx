import React from 'react';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="btn-primary"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;
