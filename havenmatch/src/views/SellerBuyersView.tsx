import React, { useState, useEffect } from 'react';
import { sellerService, CompatibleBuyer } from '../services/sellerService';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Sparkles, 
  Check, 
  MapPin, 
  MessageSquare, 
  Clock, 
  ArrowRight
} from 'lucide-react';

export const SellerBuyersView: React.FC = () => {
  const { setActiveView, showToast, userSession } = useApp();
  const [buyers, setBuyers] = useState<CompatibleBuyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sellerId = userSession?.userId || userSession?.email || 'seller';
    sellerService.getCompatibleBuyers(sellerId)
      .then(setBuyers)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [userSession]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Reverse Lifestyle Matchmaking</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Compatible Buyers for Your Property
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Active verified home seekers whose lifestyle requirements overlap with your property inventory.
          </p>
        </div>

        <button
          onClick={() => setActiveView('seller_dashboard')}
          className="text-xs font-bold text-orange-700 hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Back to Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Buyers List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-sm font-semibold text-slate-400">Loading compatible buyers from database...</p>
          </div>
        ) : buyers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600">No compatible buyers found yet.</p>
            <p className="text-xs text-slate-400 mt-1">When buyers search for homes matching your property specs, they will appear here.</p>
          </div>
        ) : (
          buyers.map((buyer) => (
            <div
              key={buyer.id}
              className="card-haven p-4 sm:p-6 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <img
                  src={buyer.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={buyer.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-orange-300/60 shrink-0"
                />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">{buyer.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-800 border border-orange-200">
                      {buyer.matchPercentage}% Compatibility
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="font-bold text-slate-800">{buyer.budgetDisplay}</span>
                    <span className="text-slate-300">•</span>
                    <span>{buyer.preferredBhk}</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 text-orange-600 mr-1" />
                      {buyer.targetLocality}
                    </span>
                  </div>

                  {/* Overlap reasons */}
                  <div className="space-y-1 pt-1">
                    {buyer.lifestyleMatchReason?.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                        <Check className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 flex flex-col justify-between items-start sm:items-end gap-2">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Active {buyer.lastActive || 'recently'}
                </span>

                <button
                  onClick={() => {
                    showToast(`Conversation started with ${buyer.name}`);
                    setActiveView('messages');
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-haven-sm flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Contact Buyer</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
