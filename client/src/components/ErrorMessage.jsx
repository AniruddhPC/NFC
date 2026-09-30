import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorMessage = ({ title = 'An Error Occurred', message, onRetry }) => {
  return (
    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6 text-rose-300 my-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-rose-200 text-base">{title}</h3>
          <p className="mt-1 text-sm text-rose-300/90 leading-relaxed">{message || 'Something went wrong.'}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-medium rounded-lg transition-colors duration-200"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
