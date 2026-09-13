import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Home, Building2, X, ChevronRight, Sparkles } from 'lucide-react';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { setRole, showToast } = useApp();

  if (!isOpen) return null;

  const handleSelect = (intent: 'SELL' | 'RENT_OUT') => {
    setRole('SELLER');
    onClose();
    if (intent === 'SELL') {
      showToast('Opening Sell Property listing flow');
      navigate('/owner/add-property?intent=SELL');
    } else {
      showToast('Opening Rent Out Property listing flow');
      navigate('/owner/add-property?intent=RENT_OUT');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal / Bottom Sheet */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl z-10 border border-slate-100 animate-in fade-in slide-in-from-bottom-5 duration-200 text-left">
        {/* Drag handle for mobile */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Add Property</h2>
              <p className="text-xs text-slate-500">Choose your listing intent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3 pt-5 pb-2">
          {/* Option 1: Sell Property */}
          <div
            onClick={() => handleSelect('SELL')}
            className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 bg-slate-50/60 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-700 transition-colors">
                  Sell Property
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">List your property for sale</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white text-slate-400 group-hover:text-orange-600 flex items-center justify-center shadow-xs">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Option 2: Rent Out Property */}
          <div
            onClick={() => handleSelect('RENT_OUT')}
            className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 bg-slate-50/60 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  Rent Out Property
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">List your property for rent</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white text-slate-400 group-hover:text-blue-600 flex items-center justify-center shadow-xs">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <span className="text-[11px] font-semibold text-slate-400">
            100% Free Direct Connect • No Brokerage Fees
          </span>
        </div>
      </div>
    </div>
  );
};
