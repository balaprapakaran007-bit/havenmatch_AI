import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { sellerService, SellerListing } from '../services/sellerService';
import { 
  Building2, 
  Eye, 
  Users, 
  HeartHandshake, 
  PlusCircle, 
  MapPin, 
  ChevronRight, 
  Sparkles,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export const SellerDashboardView: React.FC = () => {
  const { setActiveView, navigateToProperty, userSession } = useApp();
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sellerId = userSession?.userId || userSession?.email || 'seller';
    sellerService.getListings(sellerId)
      .then(setListings)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [userSession]);

  const totalViews = listings.reduce((sum, item) => sum + (item.viewsCount || 0), 0);
  const totalInterests = listings.reduce((sum, item) => sum + (item.interestsCount || 0), 0);
  const totalCompatible = listings.reduce((sum, item) => sum + (item.compatibleBuyersCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* Welcome Banner */}
      <div className="card-haven p-6 sm:p-8 bg-gradient-to-tr from-orange-950 via-orange-900 to-orange-800 text-white rounded-3xl relative overflow-hidden shadow-haven-lg">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-800/80 text-orange-200 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-orange-300" />
              <span>Owner & Builder Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Seller Intelligence Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-orange-100/80 mt-1 max-w-xl">
              Track real-time lifestyle buyer interest, view demand heatmaps, and discover buyers whose lifestyle requirements overlap with your properties.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveView('seller_portal')}
              className="px-4 py-2.5 rounded-xl bg-orange-800/60 hover:bg-orange-800 text-white font-bold text-xs border border-orange-700 transition-all"
            >
              Seller Overview
            </button>
            <button
              onClick={() => setActiveView('seller_add_property')}
              className="px-5 py-2.5 rounded-xl bg-white text-orange-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow hover:bg-orange-50 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-orange-600" />
              <span>List New Property</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="card-haven p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center mb-2">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Listings</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{listings.length}</p>
          <span className="text-[11px] text-orange-700 font-semibold mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> All RERA Verified
          </span>
        </div>

        <div className="card-haven p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center mb-2">
            <Eye className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Property Views</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalViews}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">+42 this week</span>
        </div>

        <div className="card-haven p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Direct Inquiries</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalInterests}</p>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 block">3 pending walkthroughs</span>
        </div>

        <div 
          onClick={() => setActiveView('seller_buyers')}
          className="card-haven p-4 sm:p-5 bg-orange-50/70 border border-orange-200 rounded-2xl cursor-pointer hover:border-orange-400 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center mb-2 shadow-xs">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wider">Compatible Buyers</span>
          <p className="text-2xl sm:text-3xl font-black text-orange-900 mt-1">{totalCompatible}</p>
          <span className="text-[11px] text-orange-700 font-bold mt-1 flex items-center gap-1">
            <span>View reverse matches</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* My Listed Properties Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            My Published Properties
          </h2>
          <button
            onClick={() => setActiveView('seller_add_property')}
            className="text-xs font-bold text-orange-700 hover:underline flex items-center gap-1"
          >
            <span>+ Add Listing</span>
          </button>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-sm font-semibold text-slate-400">Loading your properties...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">No properties listed yet.</p>
              <button
                onClick={() => setActiveView('seller_add_property')}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List your first property</span>
              </button>
            </div>
          ) : (
            listings.map((listing) => (
            <div
              key={listing.id}
              className="card-haven p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                      {listing.status}
                    </span>
                    <span className="text-[11px] text-slate-400">Listed {listing.listedDate}</span>
                  </div>

                  <h3
                    onClick={() => navigateToProperty(listing.id)}
                    className="font-bold text-sm sm:text-base text-slate-900 hover:text-orange-700 cursor-pointer"
                  >
                    {listing.title}
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-orange-600 mr-1" />
                    {listing.locality}, {listing.city}
                  </p>

                  <p className="text-xs font-black text-slate-900">
                    {listing.priceDisplay} • {listing.bhk} BHK • {listing.builtUpAreaSqFt} sq.ft
                  </p>
                </div>
              </div>

              {/* Performance Stats & Actions */}
              <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 flex flex-col justify-between items-start sm:items-end gap-2">
                <div className="flex items-center sm:justify-end gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Views</span>
                    <span className="font-black text-slate-800">{listing.viewsCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Inquiries</span>
                    <span className="font-black text-slate-800">{listing.interestsCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Matched Buyers</span>
                    <span className="font-black text-orange-700">{listing.compatibleBuyersCount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setActiveView('seller_buyers')}
                    className="px-3.5 py-1.5 rounded-xl bg-orange-50 text-orange-800 text-xs font-bold hover:bg-orange-100 flex items-center gap-1 border border-orange-200/60"
                  >
                    <Users className="w-3.5 h-3.5 text-orange-600" />
                    <span>View Buyers ({listing.compatibleBuyersCount})</span>
                  </button>
                  <button
                    onClick={() => navigateToProperty(listing.id)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))
          )}
        </div>
      </div>

    </div>
  );
};
