import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Phone, Mail, MapPin, Briefcase, FileText, Camera, X, Check, AlertCircle } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { userSession, updateProfile, showToast } = useApp();

  const [name, setName] = useState(userSession?.name || '');
  const [email, setEmail] = useState(userSession?.email || '');
  const [phone, setPhone] = useState(userSession?.phone || '');
  const [location, setLocation] = useState(userSession?.location || 'Coimbatore, Tamil Nadu');
  const [ownerType, setOwnerType] = useState<'OWNER' | 'AGENT'>(userSession?.ownerType || 'OWNER');
  const [bio, setBio] = useState(userSession?.bio || 'Verified real estate owner on HavenMatch AI.');
  const [avatarUrl, setAvatarUrl] = useState(
    userSession?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (userSession) {
      if (userSession.name) setName(userSession.name);
      if (userSession.email) setEmail(userSession.email);
      if (userSession.phone) setPhone(userSession.phone);
      if (userSession.location) setLocation(userSession.location);
      if (userSession.ownerType) setOwnerType(userSession.ownerType);
      if (userSession.bio) setBio(userSession.bio);
      if (userSession.avatarUrl) setAvatarUrl(userSession.avatarUrl);
    }
  }, [userSession, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      errs.name = 'Full name must be at least 2 characters.';
    }

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      errs.email = 'Please enter a valid email address.';
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (!location.trim()) {
      errs.location = 'Please specify your primary location/city.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        location: location.trim(),
        ownerType,
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim()
      });

      showToast('Profile updated successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-6 text-left my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-slate-900">Edit Owner Profile</h3>
            <p className="text-xs text-slate-500 mt-0.5">Update your personal details and public listing representation.</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Avatar Preview & URL */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <img
              src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt="Avatar Preview"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500 shadow-xs shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
              }}
            />
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-orange-600" />
                <span>Profile Photo URL</span>
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-orange-600" />
              <span>Full Name *</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Dr. K. Senthil Kumar"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                errors.name ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-200 focus:border-orange-500'
              }`}
            />
            {errors.name && (
              <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-orange-600" />
                <span>Email Address *</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="senthil.k@gmail.com"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                  errors.email ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-200 focus:border-orange-500'
                }`}
              />
              {errors.email && (
                <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-orange-600" />
                <span>Phone Number *</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                placeholder="+91 98422 11223"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                  errors.phone ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-200 focus:border-orange-500'
                }`}
              />
              {errors.phone && (
                <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>
          </div>

          {/* Owner Type & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-orange-600" />
                <span>Account Type</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOwnerType('OWNER')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    ownerType === 'OWNER'
                      ? 'bg-orange-50 border-orange-600 text-orange-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Individual Owner
                </button>
                <button
                  type="button"
                  onClick={() => setOwnerType('AGENT')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    ownerType === 'AGENT'
                      ? 'bg-orange-50 border-orange-600 text-orange-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Real Estate Agent
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                <span>Primary Location *</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
                }}
                placeholder="e.g. Peelamedu, Coimbatore"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                  errors.location ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-200 focus:border-orange-500'
                }`}
              />
              {errors.location && (
                <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.location}</span>
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-orange-600" />
              <span>About / Bio</span>
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell prospective buyers and tenants about yourself..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
