import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { propertyService } from '../services/propertyService';
import { PropertyType, FacingDirection, FurnishingStatus, PossessionStatus } from '../types';
import {
  Building2,
  MapPin,
  Camera,
  Layers,
  ShieldCheck,
  Plus,
  Trash2,
  UploadCloud,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export const AddPropertyPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, userSession } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryParams = new URLSearchParams(location.search);
  const queryIntent = queryParams.get('intent');

  const [intent, setIntent] = useState<'BUY' | 'RENT'>(
    queryIntent === 'RENT_OUT' || queryIntent === 'RENT' ? 'RENT' : 'BUY'
  );
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('Apartment');
  const [city, setCity] = useState('Coimbatore');
  const [locality, setLocality] = useState('');
  const [pincode, setPincode] = useState('641004');
  const [fullAddress, setFullAddress] = useState('');
  const [price, setPrice] = useState<number>(
    queryIntent === 'RENT_OUT' || queryIntent === 'RENT' ? 25000 : 6500000
  );
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
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (queryIntent === 'RENT_OUT' || queryIntent === 'RENT') {
      setIntent('RENT');
      setPrice(25000);
    } else if (queryIntent === 'SELL') {
      setIntent('BUY');
      setPrice(6500000);
    }
  }, [queryIntent]);

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
    const validFiles = fileList.filter((f) => f.type.startsWith('image/'));

    if (validFiles.length === 0) {
      showToast('Please select valid image files (JPG, PNG, WebP).');
      return;
    }

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setImages((prev) => [...prev, dataUrl]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
    showToast(`${validFiles.length} photo(s) added`);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    showToast('Photo removed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      // Add default nice placeholder if user didn't pick photos
      images.push('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80');
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
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 pb-24 md:pb-12 text-left">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
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

        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mx-auto mb-2">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {intent === 'BUY' ? 'List Your Property for Sale' : 'List Your Property for Rent'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
            Provide property specifications and photos to match verified buyers instantly.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Photos */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-orange-600" />
                <span>1. Property Photos</span>
              </h2>
              <span className="text-xs text-slate-400">
                {images.length} photo(s)
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 group">
                  <img src={img} alt={`Uploaded ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[4/3] rounded-xl border-2 border-dashed border-orange-300 bg-orange-50/50 hover:bg-orange-100/60 text-orange-700 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-5 h-5 text-orange-600" />
                <span>Add Photo</span>
              </button>
            </div>
          </div>

          {/* 2. Basic Info & Pricing */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-600" />
              <span>2. Details & Price</span>
            </h2>

            {/* Listing Type Toggle */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setIntent('BUY');
                  setPrice(6500000);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  intent === 'BUY' ? 'bg-white text-orange-700 shadow-xs' : 'text-slate-600'
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
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  intent === 'RENT' ? 'bg-white text-orange-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Rent Out Property
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Property Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 2 BHK Modern Flat"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {intent === 'BUY' ? 'Expected Price (₹ INR)' : 'Monthly Rent (₹ INR)'}
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Independent House">Independent House</option>
                  <option value="Builder Floor">Builder Floor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">BHK Configuration</label>
                <select
                  value={bhk}
                  onChange={(e) => setBhk(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value={1}>1 BHK</option>
                  <option value={2}>2 BHK</option>
                  <option value={3}>3 BHK</option>
                  <option value={4}>4 BHK</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Location */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>3. Location</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="Coimbatore">Coimbatore</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Locality / Area</label>
                <input
                  type="text"
                  required
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g. Peelamedu"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-2">
            <Link
              to="/owner/dashboard"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
            >
              <span>{isSubmitting ? 'Publishing...' : 'Publish Listing'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
