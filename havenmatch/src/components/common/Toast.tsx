import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle, Sparkles } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 animate-bounce-short">
      <div className="flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-haven-lg border border-slate-800 text-sm font-medium">
        <CheckCircle className="w-5 h-5 text-orange-400 shrink-0" />
        <span className="flex-1">{toastMessage}</span>
        <Sparkles className="w-4 h-4 text-orange-400/80 shrink-0" />
      </div>
    </div>
  );
};
