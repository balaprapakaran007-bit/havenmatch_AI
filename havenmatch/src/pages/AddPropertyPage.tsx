import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { propertyService } from '../services/propertyService';
import { PropertyType, FacingDirection, FurnishingStatus, PossessionStatus } from '../types';
import {
  Sparkles,
  Building2,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Camera,
  Layers,
  ShieldCheck,
  Plus,
  Trash2,
  UploadCloud,
  Image as ImageIcon
} from 'lucide-react';

export const AddPropertyPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, userSession } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [intent, setIntent] = useState<'BUY' | 'RENT'>('BUY');
  const [propertyType, setPropertyType] = useState<PropertyType>('Apartment');
  const [city, setCity] = useState('Coimbatore');
  const [locality, setLocality] = useState('');
  const [pincode, setPincode] = useState('641004');
  const [fullAddress, setFullAddress] = useState('');
  const [price, setPrice] = useState<number>(6500000);
  const [bhk, setBhk] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [builtUpArea, setBuiltUpArea] = useState<number>(1200);
  const [carpetArea, setCarpetArea] = useState<number>(1000);
  const [floor, setFloor] = useState<number>(3);
  const [totalFloors, setTotalFloors] = useState<number>(8);
  const [facing, setFacing] = useState<FacingDirection>('East');
  const [furnishing, setFurnishing] = useState<FurnishingStatus>('Semi-Furnished');
  const [possession, setPossession] = useState<PossessionStatus>('Ready to Move');
  const [reraId, setReraId] = useState('TN/11/Building/0244/2024');
  const [vastuCompliant, setVastuCompliant] = useState(true);
  const [description, setDescription] = useState('');
  const [ownerName, setOwnerName] = useState(userSession?.name || '');
  const [ownerPhone, setOwnerPhone] = useState(userSession?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real user-uploaded photos (starts completely empty for new listing)
  const [images, setImages] = useState<string[]>([]);

  const allAmenities = [
    'Gated Security 24x7',
    'Clubhouse & Gym',
    'Children Play Area',
    'Power Backup (100%)',
    'Covered Car Parking',
    'EV Charging Station',
    'Siruvani Water Connection',
    'High Speed Lifts',
    'Solar Water Heating',
    'Intercom & CCTV'
  ];

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Gated Security 24x7',
    'Clubhouse & Gym',
    'Children Play Area',
    'Covered Car Parking'
  ]);

  const toggleAmenity = (name: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const validFiles = fileList.filter(f => f.type.startsWith('image/'));

    if (validFiles.length === 0) {
      showToast('Please select valid image files (JPG, PNG, WebP).');
      return;
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setImages(prev => [...prev, dataUrl]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) {
      e.target.value = '';
    }

    showToast(`${validFiles.length} photo${validFiles.length > 1 ? 's' : ''} added`);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    showToast('Photo removed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      showToast('Please upload at least 1 photo of your property before publishing.');
      return;
    }

    setIsSubmitting(true);

    try {
      await propertyService.createProperty({
        title: title || `${bhk} BHK ${propertyType} in ${locality || 'Peelamedu'}`,
        slug: (title || 'property').toLowerCase().replace(/\s+/g, '-'),
        tagline: `Spacious vastu-compliant residence in prime ${locality || 'Peelamedu'}`,
        description:
          description ||
          `Well-maintained ${bhk} BHK property located in prime ${locality}, ${city}. Excellent ventilation, ready infrastructure, 24/7 security, and close proximity to key landmarks.`,
        propertyType,
        intent,
        city,
        locality: locality || 'Peelamedu',
        pincode,
        fullAddress: fullAddress || `${locality || 'Peelamedu'}, ${city}`,
        coordinates: { lat: 11.0255, lng: 77.0028 },
        price,
        priceDisplay: intent === 'BUY' ? `₹${(price / 100000).toFixed(0)} Lakhs` : `₹${price.toLocaleString()}/mo`,
        pricePerSqFt: `₹${Math.round(price / (builtUpArea || 1200))}/sq.ft`,
        maintenanceMonthly: '₹2,500/month',
        bhk,
        bathrooms,
        balconies: 2,
        builtUpAreaSqFt: builtUpArea,
        carpetAreaSqFt: carpetArea,
        floor,
        totalFloors,
        facing,
        furnishing,
        propertyAgeYears: 1,
        possession,
        reraApproved: true,
        reraId,
        vastuCompliant,
        parking: '1 Covered Stilt',
        powerBackup: '100% Full',
        waterSupply: 'Corporation + Siruvani',
        gatedCommunity: true,
        security24x7: true,
        amenities: selectedAmenities,
        images: images,
        seller: {
          id: userSession?.email || 'S001',
          name: ownerName || userSession?.name || 'Property Owner',
          role: 'Individual Owner',
          phone: ownerPhone || userSession?.phone || '+91 98422 11223',
          email: userSession?.email || 'owner@havenmatch.ai',
          verified: true,
          responseRate: '98%'
        }
      });

      showToast('Property successfully listed on HavenMatch AI!');
      navigate('/owner/dashboard');
    } catch (err) {
      showToast('Error publishing property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/owner/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <span className="text-xs font-bold text-orange-700 bg-orange-100/80 px-3 py-1 rounded-full uppercase tracking-wider">
            100% Free Listing
          </span>
        </div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            List Your Residential Property
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-md mx-auto">
            Provide property specifications and high-resolution images to match verified buyers instantly.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Photo Upload */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-orange-600" />
                <span>1. Property Photos</span>
              </h2>
              <span className="text-xs font-bold text-slate-500">
                {images.length === 0 ? 'No photos uploaded' : `${images.length} photo${images.length > 1 ? 's' : ''} uploaded`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Upload real photos of your property from your computer or device (JPG, PNG, WebP).
            </p>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 shadow-xs group">
                  <img src={img} alt={`Uploaded ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    Photo {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                    title="Remove photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[4/3] rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/50 hover:bg-orange-100/60 text-orange-700 font-bold text-xs flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-6 h-6 text-orange-600" />
                <span>Add Photo</span>
              </button>
            </div>

            {images.length === 0 && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 hover:bg-slate-50 text-center cursor-pointer transition-colors flex items-center justify-center gap-2 text-xs font-semibold text-slate-500"
              >
                <UploadCloud className="w-4 h-4 text-orange-600" />
                <span>Click "Add Photo" to select images from your computer</span>
              </div>
            )}
          </div>

          {/* 2. Basic Info & Pricing */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-100 space-y-4">
            <h2 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-600" />
              <span>2. Property Details & Price</span>
            </h2>

            {/* Intent Toggle */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Listing Type:
              </span>
              <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setIntent('BUY');
                    setPrice(6500000);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    intent === 'BUY'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sell Property
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIntent('RENT');
                    setPrice(25000);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    intent === 'RENT'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rent Out
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Property Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Amber Heights 3 BHK Luxury Flat"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {intent === 'BUY' ? 'Expected Price (₹ INR)' : 'Monthly Rent (₹ INR)'}
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Independent House">Independent House</option>
                  <option value="Builder Floor">Builder Floor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  BHK Space
                </label>
                <select
                  value={bhk}
                  onChange={(e) => setBhk(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                >
                  <option value={1}>1 BHK</option>
                  <option value={2}>2 BHK</option>
                  <option value={3}>3 BHK</option>
                  <option value={4}>4 BHK</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bathrooms
                </label>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                >
                  <option value={1}>1 Bath</option>
                  <option value={2}>2 Baths</option>
                  <option value={3}>3 Baths</option>
                  <option value={4}>4 Baths</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Location */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-100 space-y-4">
            <h2 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" />
              <span>3. Location & Address</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                >
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Pune">Pune</option>
                  <option value="Coimbatore">Coimbatore</option>
                  <option value="Kochi">Kochi</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Jaipur">Jaipur</option>
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Goa">Goa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Locality / Area
                </label>
                <input
                  type="text"
                  required
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g. Peelamedu"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pincode
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Street Address
              </label>
              <input
                type="text"
                required
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="e.g. Tower B, Flat 402, Near Fun Republic Mall, Avinashi Road"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* 4. Specifications & Amenities */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-100 space-y-4">
            <h2 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-600" />
              <span>4. Specifications & Amenities</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Built-up (sq.ft)
                </label>
                <input
                  type="number"
                  value={builtUpArea}
                  onChange={(e) => setBuiltUpArea(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Facing Direction
                </label>
                <select
                  value={facing}
                  onChange={(e) => setFacing(e.target.value as FacingDirection)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                >
                  <option value="East">East</option>
                  <option value="North">North</option>
                  <option value="North-East">North-East</option>
                  <option value="South">South</option>
                  <option value="West">West</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Furnishing
                </label>
                <select
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value as FurnishingStatus)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                >
                  <option value="Fully Furnished">Fully Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Possession
                </label>
                <select
                  value={possession}
                  onChange={(e) => setPossession(e.target.value as PossessionStatus)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                >
                  <option value="Ready to Move">Ready to Move</option>
                  <option value="Immediate">Immediate</option>
                  <option value="Under Construction">Under Construction</option>
                </select>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Available Amenities
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {allAmenities.map((amenity) => {
                  const isChecked = selectedAmenities.includes(amenity);
                  return (
                    <div
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`cursor-pointer p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                        isChecked
                          ? 'border-orange-600 bg-orange-50 text-orange-800 shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 ${isChecked ? 'text-orange-600' : 'text-slate-300'}`}
                      />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. Owner Contact */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-100 space-y-4">
            <h2 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-orange-600" />
              <span>5. Owner / Contact Info</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Owner Full Name
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contact Phone (Direct)
                </label>
                <input
                  type="text"
                  required
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-4">
            <Link
              to="/owner/dashboard"
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-base shadow-lg shadow-orange-600/30 transition-all hover:scale-105"
            >
              <span>{isSubmitting ? 'Publishing...' : 'Publish Listing'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
