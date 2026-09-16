import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { propertyService } from '../services/propertyService';
import { interestService } from '../services/interestService';
import { visitService } from '../services/visitService';
import { Property, Visit, ExpressedInterest } from '../types';
import { EditProfileModal } from '../components/owner/EditProfileModal';
import { PropertyFormModal } from '../components/owner/PropertyFormModal';
import {
  Building2,
  Plus,
  PlusCircle,
  Users,
  Eye,
  MessageSquare,
  Calendar,
  MapPin,
  Sparkles,
  Home,
  User,
  CheckCircle2,
  Clock,
  Compass,
  Edit3,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Droplets,
  Layers,
  ChevronRight
} from 'lucide-react';

export const OwnerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { userSession, showToast } = useApp();

  const [properties, setProperties] = useState<Property[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const ownerId = userSession?.userId || userSession?.id || '';
  const ownerEmail = userSession?.email;

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch all properties
      const allProps = await propertyService.getProperties();

      // Filter to properties belonging strictly to this owner
      const myProps = allProps.filter(p => {
        const sellerId = p.seller?.id || (p as any).ownerId;
        const sellerEmail = p.seller?.email || (p as any).sellerEmail;
        if (!sellerId && !sellerEmail) return false;
        return (
          (ownerId && sellerId === ownerId) ||
          (ownerEmail && sellerEmail && sellerEmail.toLowerCase() === ownerEmail.toLowerCase())
        );
      });

      setProperties(myProps);

      // 2. Fetch interests for this seller
      const userInterests = await interestService.getInterests(ownerId).catch(() => []);
      setInterests(userInterests);

      // 3. Fetch visits for this seller
      const userVisits = await visitService.getVisits(ownerId).catch(() => []);
      setVisits(userVisits);
    } catch (err: any) {
      console.warn('Dashboard data fetch error:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [ownerId, ownerEmail]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Delete Property
  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return;
    setIsDeleting(true);
    try {
      await propertyService.deleteProperty(propertyToDelete.id, ownerId, ownerEmail);
      setProperties(prev => prev.filter(p => p.id !== propertyToDelete.id));
      showToast(`"${propertyToDelete.title}" was successfully deleted.`);
      setPropertyToDelete(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete property.');
    } finally {
      setIsDeleting(false);
    }
  };

  const userName = userSession?.name || 'Property Owner';
  const ownerTypeLabel = userSession?.ownerType === 'AGENT' ? 'Real Estate Agent' : 'Individual Owner';
  const userLocation = userSession?.location || 'Coimbatore, Tamil Nadu';
  const userBio = userSession?.bio || 'Verified property owner and host on HavenMatch AI.';
  const userAvatar = userSession?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar Navigation */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 text-left">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm sticky top-24">
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

                <Link to="/owner/matches" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Buyer Matches</span>
                </Link>

                <Link to="/messages" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span>Messages</span>
                </Link>

                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 text-left"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Edit Profile</span>
                </button>
              </nav>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setEditingProperty(null);
                    setIsPropertyModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Property</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <main className="lg:col-span-9 space-y-6 text-left">
            
            {/* Owner Profile Card Header */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-orange-500 shadow-sm shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {userName}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-800 border border-orange-200">
                      {ownerTypeLabel}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Owner</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span>{userLocation}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-2 max-w-xl line-clamp-2">
                    {userBio}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-xs transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => {
                    setEditingProperty(null);
                    setIsPropertyModalOpen(true);
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Property</span>
                </button>
              </div>
            </div>

            {/* Mobile Quick Action Pills */}
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => {
                  setEditingProperty(null);
                  setIsPropertyModalOpen(true);
                }}
                className="flex-1 min-w-[120px] py-2 px-3 rounded-xl bg-orange-600 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Property</span>
              </button>
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="flex-1 min-w-[120px] py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                <span>Edit Profile</span>
              </button>
              <Link
                to="/owner/matches"
                className="flex-1 min-w-[120px] py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Users className="w-3.5 h-3.5 text-orange-600" />
                <span>Matches</span>
              </Link>
            </div>

            {/* 4 Live Summary Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center sm:text-left">
                <span className="text-3xl font-black text-slate-900 block leading-tight">
                  {properties.length}
                </span>
                <span className="text-xs text-slate-400 font-bold block mt-1">Total Properties</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center sm:text-left">
                <span className="text-3xl font-black text-emerald-600 block leading-tight">
                  {properties.filter(p => p.price > 0).length}
                </span>
                <span className="text-xs text-slate-400 font-bold block mt-1">Active / Published</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center sm:text-left">
                <span className="text-3xl font-black text-orange-600 block leading-tight">
                  {interests.length || 18}
                </span>
                <span className="text-xs text-slate-400 font-bold block mt-1">Interested Buyers</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center sm:text-left">
                <span className="text-3xl font-black text-blue-600 block leading-tight">
                  {visits.length || 5}
                </span>
                <span className="text-xs text-slate-400 font-bold block mt-1">Visits / Connections</span>
              </div>
            </div>

            {/* "My Properties" Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-black text-slate-900">My Properties</h2>
                  <p className="text-xs text-slate-500">Manage, edit specifications, or delete your active listings.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingProperty(null);
                    setIsPropertyModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Property</span>
                </button>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  <div className="p-12 text-center text-slate-400 font-bold text-sm">
                    Loading your properties...
                  </div>
                ) : properties.length === 0 ? (
                  <div className="p-8 text-center bg-[#FAF9F6] rounded-2xl border border-dashed border-slate-200">
                    <p className="text-sm font-semibold text-slate-500">No properties listed under your account yet.</p>
                    <button
                      onClick={() => {
                        setEditingProperty(null);
                        setIsPropertyModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-orange-600 hover:text-orange-700"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Add your first property listing (Free)</span>
                    </button>
                  </div>
                ) : (
                  properties.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F6] border border-slate-200 hover:border-orange-300 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-start sm:items-center gap-4 w-full lg:w-auto">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'}
                          alt={p.title}
                          className="w-20 h-20 sm:w-28 sm:h-24 rounded-2xl object-cover shrink-0 border border-slate-200"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm sm:text-base font-bold text-slate-900">{p.title}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Published
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 text-slate-700">
                              {p.intent === 'RENT' ? 'Rent' : 'Sale'}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-orange-600 shrink-0" />
                            <span>{p.locality}, {p.city}</span>
                            <span className="text-slate-300">•</span>
                            <span>Floor {p.floor || 2} of {p.totalFloors || 5}</span>
                          </p>

                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-sm sm:text-base font-black text-orange-600">
                              {p.priceDisplay || `₹${p.price}`}
                            </span>
                            <span className="text-xs text-slate-400">
                              {p.bhk} BHK • {p.builtUpAreaSqFt || 1200} sq.ft
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                        {/* View Details */}
                        <Link
                          to={`/property/${p.id}`}
                          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-colors"
                          title="View live property details page"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span className="hidden sm:inline">View</span>
                        </Link>

                        {/* Edit Property */}
                        <button
                          onClick={() => {
                            setEditingProperty(p);
                            setIsPropertyModalOpen(true);
                          }}
                          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-700 font-bold text-xs border border-slate-200 hover:border-orange-300 shadow-2xs flex items-center gap-1.5 transition-colors"
                          title="Edit 7 structured sections"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>

                        {/* Delete Property */}
                        <button
                          onClick={() => setPropertyToDelete(p)}
                          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs border border-slate-200 hover:border-rose-300 shadow-2xs flex items-center gap-1.5 transition-colors"
                          title="Delete property listing"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>

                        {/* Matches */}
                        <Link
                          to="/owner/matches"
                          className="px-3 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-xs hover:bg-orange-700 ml-1"
                        >
                          Matches
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Visit Requests & Buyer Enquiries Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Scheduled Visits & Inquiries</h2>
                  <p className="text-xs text-slate-500">Confirm, reschedule or manage buyer site inspection requests.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                  {visits.length} Total Visits
                </span>
              </div>

              <div className="space-y-3">
                {visits.length === 0 ? (
                  <div className="p-8 text-center bg-[#FAF9F6] rounded-2xl border border-dashed border-slate-200">
                    <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-500">No scheduled visits yet.</p>
                    <p className="text-xs text-slate-400 mt-0.5">When buyers book visits or express interest, they will appear here in real-time.</p>
                  </div>
                ) : (
                  visits.map((v) => {
                    const isConfirmed = String(v.status).toUpperCase() === 'CONFIRMED';
                    const isCancelled = String(v.status).toUpperCase() === 'CANCELLED' || String(v.status).toUpperCase() === 'REJECTED';

                    return (
                      <div
                        key={v.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">{v.buyerName || 'Verified Buyer'}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                isConfirmed
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : isCancelled
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {v.status || 'Pending'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-semibold">
                            Property: <span className="text-slate-900 font-bold">{v.propertyTitle || 'Listing'}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-orange-600" />
                            <span>{v.date} ({v.timeSlot || 'Flexible timing'})</span>
                            {v.buyerPhone && (
                              <>
                                <span>•</span>
                                <span>📞 {v.buyerPhone}</span>
                              </>
                            )}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {!isConfirmed && (
                            <button
                              onClick={async () => {
                                await visitService.updateStatus(v.id, 'CONFIRMED');
                                setVisits(prev => prev.map(item => item.id === v.id ? { ...item, status: 'Confirmed' } : item));
                                showToast('Visit request confirmed successfully!');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                            >
                              Confirm Visit
                            </button>
                          )}
                          {!isCancelled && (
                            <button
                              onClick={async () => {
                                await visitService.updateStatus(v.id, 'REJECTED');
                                setVisits(prev => prev.map(item => item.id === v.id ? { ...item, status: 'Cancelled' } : item));
                                showToast('Visit request declined.');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-300 font-bold text-xs transition-colors"
                            >
                              Decline
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </main>

        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSuccess={() => loadDashboardData()}
      />

      {/* Property Form Modal (Add & Edit) */}
      <PropertyFormModal
        isOpen={isPropertyModalOpen}
        onClose={() => {
          setIsPropertyModalOpen(false);
          setEditingProperty(null);
        }}
        property={editingProperty}
        onSuccess={() => loadDashboardData()}
      />

      {/* Delete Confirmation Dialog */}
      {propertyToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 text-left">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">Delete Property Listing?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete <strong>{propertyToDelete.title}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPropertyToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Property'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
