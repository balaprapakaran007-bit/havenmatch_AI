import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { sellerService, SellerListing } from '../services/sellerService';
import {
  Building2,
  PlusCircle,
  Users,
  Eye,
  MessageSquare,
  Calendar,
  TrendingUp,
  MapPin,
  ArrowRight,
  Sparkles,
  Home,
  User,
  Heart,
  CheckCircle2,
  Clock,
  Compass
} from 'lucide-react';

export const OwnerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { userSession } = useApp();

  const [listings, setListings] = useState<SellerListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sellerId = userSession?.email || 'S001';
    sellerService.getListings(sellerId)
      .then(setListings)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [userSession?.email]);

  const userName = userSession?.name || 'Seller';

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar Navigation (Matching Screen 12) */}
          <aside className="lg:col-span-3 space-y-6 text-left">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-base text-slate-900 block leading-tight">HavenMatch AI</span>
                  <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Owner Portal</span>
                </div>
              </div>

              <nav className="space-y-1">
                <Link to="/" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <Home className="w-4 h-4 text-slate-400" />
                  <span>Home</span>
                </Link>

                <Link to="/owner/dashboard" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-orange-50 text-orange-700 shadow-xs">
                  <Building2 className="w-4 h-4 text-orange-600" />
                  <span>My Properties</span>
                </Link>

                <Link to="/owner/add-property" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <PlusCircle className="w-4 h-4 text-slate-400" />
                  <span>Add Property</span>
                </Link>

                <Link to="/owner/matches" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Buyer Matches</span>
                </Link>

                <Link to="/owner/dashboard" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <Heart className="w-4 h-4 text-slate-400" />
                  <span>Interests</span>
                </Link>

                <Link to="/owner/dashboard" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Visits</span>
                </Link>

                <Link to="/messages" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span>Messages</span>
                </Link>

                <Link to="/profile" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profile</span>
                </Link>
              </nav>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  to="/owner/add-property"
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>List New Property</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Right Main Content Area (Matching Screen 12) */}
          <main className="lg:col-span-9 space-y-6 text-left">
            
            {/* Header Greeting */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Good morning, {userName} 👋
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Manage your properties and reach genuine buyers.
                </p>
              </div>

              <Link
                to="/owner/add-property"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Property</span>
              </Link>
            </div>

            {/* 4 Stat Cards Grid (Matching Screen 12) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center sm:text-left">
                <span className="text-3xl font-black text-slate-900 block leading-tight">4</span>
                <span className="text-xs text-slate-400 font-bold block mt-1">Active Properties</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center sm:text-left">
                <span className="text-3xl font-black text-slate-900 block leading-tight">18</span>
                <span className="text-xs text-slate-400 font-bold block mt-1">Interested Buyers</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center sm:text-left">
                <span className="text-3xl font-black text-slate-900 block leading-tight">12</span>
                <span className="text-xs text-slate-400 font-bold block mt-1">Compatible Matches</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center sm:text-left">
                <span className="text-3xl font-black text-slate-900 block leading-tight">5</span>
                <span className="text-xs text-slate-400 font-bold block mt-1">Upcoming Visits</span>
              </div>
            </div>

            {/* "My Properties" Section (Matching Screen 12) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900">My Properties</h2>
                <Link to="/owner/add-property" className="text-xs font-bold text-orange-600 hover:text-orange-700">
                  See All →
                </Link>
              </div>

              <div className="space-y-4">
                {listings.length === 0 ? (
                  <div className="p-8 text-center bg-[#FAF9F6] rounded-2xl border border-dashed border-slate-200">
                    <p className="text-sm font-semibold text-slate-500">No properties listed yet.</p>
                    <Link
                      to="/owner/add-property"
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-orange-600 hover:text-orange-700"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Add your first property listing</span>
                    </Link>
                  </div>
                ) : (
                  listings.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 hover:border-orange-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'}
                          alt={p.title}
                          className="w-20 h-16 sm:w-24 sm:h-20 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm sm:text-base font-bold text-slate-900">{p.title}</h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.status === 'Published'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {p.status || 'Published'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{p.locality}, {p.city}</p>
                          <p className="text-sm font-black text-orange-600 mt-1">{p.priceDisplay || `₹${p.price}`}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end text-xs text-slate-500 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                        <span>{p.viewsCount || 0} views</span>
                        <span>•</span>
                        <span className="font-bold text-slate-700">{p.interestsCount || 0} interested</span>
                        <Link
                          to="/owner/matches"
                          className="px-3.5 py-1.5 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-xs hover:bg-orange-700 ml-2"
                        >
                          View Matches
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </main>

        </div>
      </div>
    </div>
  );
};
