import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Phone, Mail, MapPin, Briefcase, FileText, Camera, X, Check, AlertCircle, Upload, Trash2, Loader2 } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { userSession, updateProfile, showToast, role } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(userSession?.name || '');
  const [email, setEmail] = useState(userSession?.email || '');
  const [phone, setPhone] = useState(userSession?.phone || '');
  const [location, setLocation] = useState(userSession?.location || 'Coimbatore, Tamil Nadu');
  const [ownerType, setOwnerType] = useState<'OWNER' | 'AGENT'>(userSession?.ownerType || 'OWNER');
  const [bio, setBio] = useState(userSession?.bio || 'Verified real estate user on HavenMatch AI.');
  const [avatarUrl, setAvatarUrl] = useState(
    userSession?.avatarUrl || (userSession as any)?.avatar || (userSession as any)?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  );
  const [selectedFileBase64, setSelectedFileBase64] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

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
      if (userSession.avatarUrl || (userSession as any).avatar || (userSession as any).profilePhoto) {
        setAvatarUrl(userSession.avatarUrl || (userSession as any).avatar || (userSession as any).profilePhoto);
      }
      setSelectedFileBase64(null);
      setSelectedFileName('');
    }
  }, [userSession, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Please select a JPG, PNG, or WEBP image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedFileBase64(base64);
      setSelectedFileName(file.name);
      setAvatarUrl(base64); // instant preview
      showToast('Photo selected. Click Save Changes to apply.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
    setSelectedFileBase64(null);
    setSelectedFileName('');
    setAvatarUrl(defaultAvatar);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Photo reset to default avatar.');
  };

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
      let finalAvatarUrl = avatarUrl;

      // If user uploaded a new local file base64, save it to server uploads
      if (selectedFileBase64) {
        setIsUploadingPhoto(true);
        const token = userSession?.token || localStorage.getItem('havenmatch_token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        };
        if (token) {
          headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        }

        const uploadRes = await fetch('/api/auth/profile/photo', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            token,
            userId: userSession?.id || userSession?.userId,
            email: email.trim().toLowerCase(),
            imageBase64: selectedFileBase64,
            fileName: selectedFileName
          })
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({ error: 'Photo upload failed' }));
          throw new Error(errData.error || `Photo upload failed (${uploadRes.status})`);
        }

        const uploadData = await uploadRes.json().catch(() => ({ success: false }));
        if (uploadData.success && uploadData.avatarUrl) {
          finalAvatarUrl = uploadData.avatarUrl;
        }
        setIsUploadingPhoto(false);
      }

      await updateProfile({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        location: location.trim(),
        ownerType: role === 'SELLER' ? ownerType : undefined,
        bio: bio.trim(),
        avatarUrl: finalAvatarUrl
      });

      showToast('Profile updated successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
      setIsUploadingPhoto(false);
    }
  };

  const isSeller = role === 'SELLER';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-6 text-left my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-slate-900">
              {isSeller ? 'Edit Owner Profile' : 'Edit Buyer Profile'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your photo, contact details, and account preferences.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Real Device Photo Upload Area */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <span className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-orange-600" />
              <span>Profile Photo</span>
            </span>

            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt="Avatar Preview"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-500 shadow-sm shrink-0 bg-white"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose Photo from Device</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500">
                  Supported formats: JPG, PNG, WEBP (Max 5MB). Photo is securely stored on your account.
                </p>
              </div>
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
              placeholder="e.g. Senthil Kumar"
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
