import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Loader2 className="w-10 h-10 text-sky-400 animate-spin mb-4" />
      <p className="text-slate-400 text-sm font-medium tracking-wide animate-pulse">{message}</p>
    </div>
  );
};

export default Loading;
