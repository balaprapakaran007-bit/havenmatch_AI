import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { propertyService } from '../services/propertyService';
import { PropertyType, FacingDirection, FurnishingStatus, PossessionStatus } from '../types';
import { 
  Building2, 
  MapPin, 
  Home, 
  IndianRupee, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  UploadCloud,
  Sparkles,
  Camera,
  Trash2,
  Check,
  Plus,
  Compass,
  Zap,
  Droplets,
  Layers,
  Eye,
  Sliders
} from 'lucide-react';

const SAMPLE_REAL_ESTATE_PHOTOS = [
  {
    name: 'Luxury Living Room',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    tag: 'Living'
  },
  {
    name: 'Master Bedroom',
    url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
    tag: 'Bedroom'
  },
  {
    name: 'Modular Italian Kitchen',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    tag: 'Kitchen'
  },
  {
    name: 'Balcony / City View',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    tag: 'Balcony'
  },
  {
    name: 'Exterior Facade & Garden',
    url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
    tag: 'Exterior'
  }
];

const AVAILABLE_AMENITIES = [
  'Gated Security 24x7',
  'High Speed Passenger Lift',
  '100% Power Backup',
  'Siruvani / Cauvery Water',
  'Swimming Pool',
  'Equipped Fitness Gym',
  'Children Play Zone',
  'EV Vehicle Charging',
  'Covered Car Parking',
  'Clubhouse / Party Hall',
  'Rooftop Garden',
  'Solar Water Heating'
];

export const AddPropertyView: React.FC = () => {
  const { setActiveView, setRole, showToast, userSession } = useApp();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState<string>('');

  // Form State
  const [intent, setIntent] = useState<'BUY' | 'RENT'>('BUY');
  const [propertyType, setPropertyType] = useState<PropertyType>('Apartment');
  const [city, setCity] = useState('Coimbatore');
  const [locality, setLocality] = useState('Peelamedu');
  const [pincode, setPincode] = useState('641004');
  const [address, setAddress] = useState('Tower B, Horizon Enclave, Avinashi Road');
  const [landmark, setLandmark] = useState('Near PSG Tech & Fun Republic Mall');

  // Specs
  const [bhk, setBhk] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(3);
  const [balconies, setBalconies] = useState<number>(2);
  const [builtUpArea, setBuiltUpArea] = useState<number>(1650);
  const [floor, setFloor] = useState<number>(4);
  const [totalFloors, setTotalFloors] = useState<number>(9);
  const [facing, setFacing] = useState<FacingDirection>('East');
  const [furnishing, setFurnishing] = useState<FurnishingStatus>('Semi-Furnished');
  const [possession, setPossession] = useState<PossessionStatus>('Ready to Move');

  // Media / Photos Upload State (starts empty for new listings)
  const [images, setImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Utilities & Amenities
  const [priceLakhs, setPriceLakhs] = useState<number>(85);
  const [maintenance, setMaintenance] = useState<string>('₹3,200/month');
  const [waterSupply, setWaterSupply] = useState<string>('Siruvani Corporation + 24/7 Treated Borewell');
  const [powerBackup, setPowerBackup] = useState<string>('100% Full DG Backup');
  const [reraId, setReraId] = useState<string>('TN/11/Building/0890/2024');
  const [vastuCompliant, setVastuCompliant] = useState<boolean>(true);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Gated Security 24x7',
    'High Speed Passenger Lift',
    '100% Power Backup',
    'Siruvani / Cauvery Water',
    'Covered Car Parking',
    'Children Play Zone'
  ]);

  // Contact Info
  const [ownerName, setOwnerName] = useState(userSession?.name || 'Dr. K. Senthil Kumar');
  const [ownerPhone, setOwnerPhone] = useState(userSession?.phone || '+91 98400 11223');

  // Quick Demo Autofill
  const handleAutofillDemo = () => {
    setIntent('BUY');
    setPropertyType('Apartment');
    setCity('Coimbatore');
    setLocality('Peelamedu');
    setPincode('641004');
    setAddress('Penthouse 7B, Emerald Heights, Avinashi Road');
    setLandmark('Opposite CODISSIA Trade Center');
    setBhk(3);
    setBathrooms(3);
    setBalconies(2);
    setBuiltUpArea(1850);
    setFloor(7);
    setTotalFloors(12);
    setFacing('East');
    setFurnishing('Semi-Furnished');
    setPossession('Ready to Move');
    setPriceLakhs(98);
    setMaintenance('₹3,500/month');
    setWaterSupply('Siruvani Corporation + Treated RO Plant');
    setPowerBackup('100% Full DG Backup');
    setReraId('TN/11/Building/1042/2024');
    setVastuCompliant(true);
    setImages([
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ]);
    showToast('Loaded demo luxury Coimbatore 3 BHK listing data!');
  };

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    showToast(`Added ${files.length} photo(s) to property gallery`);
  };

  // Add sample photo
  const addSamplePhoto = (url: string) => {
    if (images.includes(url)) {
      showToast('Photo already attached');
      return;
    }
    setImages((prev) => [...prev, url]);
    showToast('Sample photo added to gallery');
  };

  // Remove photo
  const removePhoto = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Toggle amenity
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  // Submit and publish
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const created = await propertyService.createProperty({
        title: `${bhk} BHK Luxury ${propertyType} in ${locality}`,
        slug: `${bhk}-bhk-${propertyType.toLowerCase()}-${locality.toLowerCase()}-${Date.now()}`,
        tagline: `${facing}-facing ${propertyType} with ${waterSupply}`,
        description: `Direct Owner Listing: Newly available ${bhk} BHK ${propertyType} situated at ${address}, ${locality}, ${city}. Features ${balconies} balconies, ${bathrooms} bathrooms, ${waterSupply}, and 100% power backup. RERA Approved and 100% Vastu aligned.`,
        propertyType,
        intent,
        city,
        locality,
        pincode,
        fullAddress: `${address}, ${locality}, ${city} - ${pincode}. Landmark: ${landmark}`,
        coordinates: { lat: 11.0255, lng: 77.0028 },
        price: intent === 'BUY' ? priceLakhs * 100000 : priceLakhs * 1000,
        priceDisplay: intent === 'BUY' ? `₹${priceLakhs} Lakhs` : `₹${priceLakhs},000/mo`,
        pricePerSqFt: `₹${Math.round((priceLakhs * 100000) / builtUpArea)}/sq.ft`,
        maintenanceMonthly: maintenance,
        bhk,
        bathrooms,
        balconies,
        builtUpAreaSqFt: builtUpArea,
        carpetAreaSqFt: Math.round(builtUpArea * 0.82),
        floor,
        totalFloors,
        facing,
        furnishing,
        propertyAgeYears: 0,
        possession,
        reraApproved: Boolean(reraId),
        reraId,
        vastuCompliant,
        parking: '1 Covered',
        powerBackup,
        waterSupply,
        gatedCommunity: true,
        security24x7: true,
        amenities: selectedAmenities,
        images: images.length > 0 ? images : [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
        ],
        seller: {
          id: 'owner-verified-direct',
          name: ownerName,
          role: 'Individual Owner',
          phone: ownerPhone,
          verified: true,
          responseRate: 'Within 15 mins'
        }
      });

      setCreatedPropertyId(created.id);
      setShowSuccessModal(true);
      showToast('Property published successfully! Reverse buyer matching activated.');
    } catch (err) {
      showToast('Failed to publish property');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 space-y-4 sm:space-y-6">
      
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <button
            onClick={() => setActiveView('landing')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors mb-2 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Landing Page</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Upload & List Your Property
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-extrabold tracking-wide uppercase">
              0% Brokerage
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Direct owner listing portal • Instant AI Reverse Matching with active lifestyle home seekers
          </p>
        </div>

        {/* Action: Autofill Demo */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAutofillDemo}
            className="px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            title="Populate test data for a 3 BHK in Coimbatore"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Autofill Demo Listing</span>
          </button>
        </div>
      </div>

      {/* Step Tracker */}
      <div className="card-haven p-4 sm:p-5 bg-white/95 border border-slate-200/90 rounded-2xl shadow-haven-sm">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-extrabold">
              {step}
            </span>
            <span className="text-slate-900 font-extrabold">
              {step === 1 && 'Step 1: Property Intent & Location'}
              {step === 2 && 'Step 2: Specifications & Dimensions'}
              {step === 3 && 'Step 3: Upload Photos & Media Gallery'}
              {step === 4 && 'Step 4: Indian Utilities & Amenities'}
              {step === 5 && 'Step 5: Pricing, Preview & Publish'}
            </span>
          </div>
          <span className="text-orange-700 font-extrabold">{step * 20}% Completed</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300 rounded-full"
            style={{ width: `${step * 20}%` }}
          />
        </div>

        {/* Step Pills */}
        <div className="grid grid-cols-5 gap-1.5 mt-3 pt-3 border-t border-slate-100 text-[11px] font-semibold text-center">
          <button 
            onClick={() => setStep(1)}
            className={`py-1 rounded-lg transition-colors ${step === 1 ? 'text-orange-700 font-bold bg-orange-50' : 'text-slate-500 hover:text-slate-900'}`}
          >
            1. Location
          </button>
          <button 
            onClick={() => setStep(2)}
            className={`py-1 rounded-lg transition-colors ${step === 2 ? 'text-orange-700 font-bold bg-orange-50' : 'text-slate-500 hover:text-slate-900'}`}
          >
            2. Specs
          </button>
          <button 
            onClick={() => setStep(3)}
            className={`py-1 rounded-lg transition-colors ${step === 3 ? 'text-orange-700 font-bold bg-orange-50' : 'text-slate-500 hover:text-slate-900'}`}
          >
            3. Photos
          </button>
          <button 
            onClick={() => setStep(4)}
            className={`py-1 rounded-lg transition-colors ${step === 4 ? 'text-orange-700 font-bold bg-orange-50' : 'text-slate-500 hover:text-slate-900'}`}
          >
            4. Utilities
          </button>
          <button 
            onClick={() => setStep(5)}
            className={`py-1 rounded-lg transition-colors ${step === 5 ? 'text-orange-700 font-bold bg-orange-50' : 'text-slate-500 hover:text-slate-900'}`}
          >
            5. Preview
          </button>
        </div>
      </div>

      {/* Main Upload Form Container */}
      <div className="card-haven p-4 sm:p-8 bg-white/95 border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-haven-md space-y-5 sm:space-y-6">

        {/* STEP 1: Intent & Location */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Listing Intent & Property Location
              </h2>
              <p className="text-xs text-slate-500">
                Specify whether you are selling or renting out, along with precise location coordinates.
              </p>
            </div>

            {/* Intent Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Listing Goal
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => setIntent('BUY')}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-center gap-2 ${
                    intent === 'BUY'
                      ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Sell My Property</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIntent('RENT')}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-center gap-2 ${
                    intent === 'RENT'
                      ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Rent Out Property</span>
                </button>
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Property Architecture
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(['Apartment', 'Villa', 'Independent House', 'Builder Floor', 'Studio Apartment', 'Plot / Land'] as PropertyType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPropertyType(type)}
                    className={`p-3 rounded-xl text-xs font-bold border text-left transition-all ${
                      propertyType === type
                        ? 'bg-orange-50 text-orange-900 border-orange-400 ring-1 ring-orange-300'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-slate-50 focus:outline-orange-500"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Locality / Neighborhood</label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g. Peelamedu, Indiranagar, OMR"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 641004"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Building Name / Society & Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Penthouse 7B, Emerald Heights, Avinashi Road"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Prominent Landmark (for buyer commute calculations)</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opposite CODISSIA Trade Center / Near Metro Station"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-orange-500"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Specifications & Layout */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Property Dimensions & Layout
              </h2>
              <p className="text-xs text-slate-500">
                Detailed room count, area measurements, facing direction, and possession timeline.
              </p>
            </div>

            {/* BHK Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Bedrooms (BHK)
              </label>
              <div className="flex gap-2 max-w-md">
                {[1, 2, 3, 4, 5].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBhk(b)}
                    className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl border transition-all ${
                      bhk === b
                        ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {b} BHK
                  </button>
                ))}
              </div>
            </div>

            {/* Bathrooms & Balconies */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bathrooms</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBathrooms(num)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                        bathrooms === num
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Balconies</label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBalconies(num)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                        balconies === num
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Area & Floor */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Super Built-Up Area (sq.ft)</label>
                <input
                  type="number"
                  value={builtUpArea}
                  onChange={(e) => setBuiltUpArea(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-orange-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Est. Carpet Area: ~{Math.round(builtUpArea * 0.82)} sq.ft (82%)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Property on Floor</label>
                <input
                  type="number"
                  value={floor}
                  onChange={(e) => setFloor(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Floors in Building</label>
                <input
                  type="number"
                  value={totalFloors}
                  onChange={(e) => setTotalFloors(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-orange-500"
                />
              </div>
            </div>

            {/* Facing & Vastu Direction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Main Entrance Facing</span>
                  <span className="text-[10px] text-orange-700 font-semibold">East / North-East preferred</span>
                </label>
                <select
                  value={facing}
                  onChange={(e) => setFacing(e.target.value as FacingDirection)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-slate-50 focus:outline-orange-500"
                >
                  <option value="East">East (Most Auspicious & High Demand)</option>
                  <option value="North">North (Kuber Direction)</option>
                  <option value="North-East">North-East (Ishanya)</option>
                  <option value="West">West</option>
                  <option value="South">South</option>
                  <option value="South-East">South-East</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Furnishing Status</label>
                <select
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value as FurnishingStatus)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-slate-50 focus:outline-orange-500"
                >
                  <option value="Fully Furnished">Fully Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished (Wardrobes + Modular Kitchen)</option>
                  <option value="Unfurnished">Unfurnished (Raw)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Photos & Media Upload */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-orange-600" />
                <span>Upload Photos & Media Gallery</span>
              </h2>
              <p className="text-xs text-slate-500">
                Listings with 3+ high-quality photos receive 4.8x more buyer inquiries and higher AI compatibility scores.
              </p>
            </div>

            {/* Local File Upload Dropzone */}
            <div className="relative border-2 border-dashed border-orange-200 hover:border-orange-500 rounded-3xl p-6 sm:p-8 text-center bg-orange-50/40 transition-all group cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-100 group-hover:bg-orange-600 text-orange-600 group-hover:text-white flex items-center justify-center transition-colors mb-3 shadow-xs">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Drag & Drop property photos here, or <span className="text-orange-600 underline">Browse files</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Supports JPG, PNG, WebP up to 10MB each. High resolution living room, kitchen, and exterior shots.
              </p>
            </div>

            {/* Instant One-Click Sample Photo Picker */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span>One-Click Curated HD Real Estate Photos</span>
                </div>
                <span className="text-[11px] text-slate-500">Click any photo to attach to listing</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {SAMPLE_REAL_ESTATE_PHOTOS.map((sample, idx) => {
                  const isAdded = images.includes(sample.url);
                  return (
                    <div
                      key={idx}
                      onClick={() => !isAdded && addSamplePhoto(sample.url)}
                      className={`relative rounded-xl overflow-hidden cursor-pointer border transition-all group ${
                        isAdded
                          ? 'border-orange-500 ring-2 ring-orange-400 opacity-90'
                          : 'border-slate-200 hover:border-orange-400 hover:shadow-sm'
                      }`}
                    >
                      <img
                        src={sample.url}
                        alt={sample.name}
                        className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-1.5">
                        <span className="text-[10px] font-bold text-white leading-tight truncate">
                          {sample.name}
                        </span>
                        {isAdded && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-orange-300">
                            <Check className="w-2.5 h-2.5" /> Added
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom URL Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Or paste an image web link (https://...)"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-orange-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (customImageUrl.trim()) {
                    setImages((prev) => [...prev, customImageUrl.trim()]);
                    setCustomImageUrl('');
                    showToast('Photo added from URL');
                  }
                }}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
              >
                Add Image URL
              </button>
            </div>

            {/* Attached Photos Gallery */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Attached Gallery ({images.length} photos)
                </span>
                {images.length > 0 && (
                  <span className="text-[11px] text-orange-700 font-semibold">
                    First photo is your listing's Cover Image
                  </span>
                )}
              </div>

              {images.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500">
                  No photos uploaded yet. Select sample photos or upload from your device above.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((imgUrl, index) => (
                    <div
                      key={index}
                      className="relative rounded-2xl overflow-hidden border border-slate-200 group shadow-xs"
                    >
                      <img
                        src={imgUrl}
                        alt={`Property Upload ${index + 1}`}
                        className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-orange-600 text-white text-[10px] font-extrabold shadow-sm">
                          Cover Photo
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white transition-colors"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Indian Utilities & Amenities */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Indian Utilities, Amenities & Verifications
              </h2>
              <p className="text-xs text-slate-500">
                Critical regional factors Indian buyers look for: Siruvani/Cauvery water, DG backup, RERA and Vastu.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Water Connection Source</label>
                <input
                  type="text"
                  value={waterSupply}
                  onChange={(e) => setWaterSupply(e.target.value)}
                  placeholder="e.g. Siruvani Corporation + 24/7 Treated RO"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Power Backup Configuration</label>
                <select
                  value={powerBackup}
                  onChange={(e) => setPowerBackup(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-slate-50 focus:outline-orange-500"
                >
                  <option value="100% Full DG Backup">100% Full DG Generator Backup (Lights, Fans, ACs)</option>
                  <option value="Partial (Lifts + Common Areas)">Partial (Lifts + Common + 1kVA per unit)</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">RERA Registration Number</label>
                <input
                  type="text"
                  value={reraId}
                  onChange={(e) => setReraId(e.target.value)}
                  placeholder="e.g. TN/11/Building/0890/2024"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-mono font-semibold focus:outline-orange-500"
                />
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Increases buyer trust by 85%
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vastu Shastra Alignment</label>
                <button
                  type="button"
                  onClick={() => setVastuCompliant(!vastuCompliant)}
                  className={`w-full p-2.5 rounded-xl border text-sm font-bold flex items-center justify-between transition-colors ${
                    vastuCompliant
                      ? 'bg-orange-50 text-orange-900 border-orange-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <span>100% Vastu Compliant (Kitchen in SE, Master Bedroom in SW)</span>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${vastuCompliant ? 'bg-orange-600 text-white' : 'border border-slate-300'}`}>
                    {vastuCompliant && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              </div>
            </div>

            {/* Amenities Multi-Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Society Amenities & Lifestyle Features
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVAILABLE_AMENITIES.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`p-2.5 rounded-xl text-xs font-semibold border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-orange-50 text-orange-900 border-orange-300 ring-1 ring-orange-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{amenity}</span>
                      <div className={`w-4 h-4 rounded shrink-0 flex items-center justify-center ${isSelected ? 'bg-orange-600 text-white' : 'border border-slate-300'}`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Pricing, Direct Contact & Live Buyer Preview */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Pricing, Contact Details & Live Buyer Preview
              </h2>
              <p className="text-xs text-slate-500">
                Review your listing details and see how buyers will view your property on HavenMatch AI.
              </p>
            </div>

            {/* Pricing Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {intent === 'BUY' ? 'Expected Sale Price (₹ Lakhs)' : 'Monthly Rent (₹ Thousands)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={priceLakhs}
                    onChange={(e) => setPriceLakhs(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-200 text-base font-extrabold text-slate-900 focus:outline-orange-500"
                  />
                </div>
                <span className="text-[11px] text-orange-800 font-bold mt-1 block">
                  {intent === 'BUY' ? `Display Price: ₹${priceLakhs} Lakhs (₹${Math.round((priceLakhs * 100000) / builtUpArea)}/sq.ft)` : `Display Rent: ₹${priceLakhs},000/month`}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Maintenance</label>
                <input
                  type="text"
                  value={maintenance}
                  onChange={(e) => setMaintenance(e.target.value)}
                  placeholder="e.g. ₹3,200/month"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-orange-500"
                />
              </div>
            </div>

            {/* Seller Contact Info */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Owner Direct Contact (No Brokers Allowed)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Owner Name</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Direct Mobile Phone</label>
                  <input
                    type="text"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Live Buyer Card Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-orange-600" />
                  <span>Live Buyer Card Preview</span>
                </span>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Ready to Publish
                </span>
              </div>

              <div className="max-w-md mx-auto card-haven overflow-hidden border border-orange-200 bg-white shadow-haven-md rounded-2xl">
                <div className="relative h-48 bg-slate-100">
                  <img
                    src={images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold">
                    {bhk} BHK • {propertyType}
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-orange-600 text-white text-xs font-black shadow-sm">
                    {intent === 'BUY' ? `₹${priceLakhs} Lakhs` : `₹${priceLakhs},000/mo`}
                  </div>
                  {vastuCompliant && (
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1">
                      <Check className="w-3 h-3" /> Vastu Compliant
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <h4 className="font-extrabold text-base text-slate-900 line-clamp-1">
                    {bhk} BHK Luxury {propertyType} in {locality}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span>{locality}, {city}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>{builtUpArea} sq.ft • {facing} Facing</span>
                    <span className="text-orange-700 font-bold">{waterSupply.split('+')[0]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation & Submission Action Bar */}
        <div className="pt-5 border-t border-slate-200/80 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Step</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveView('landing')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors text-center"
            >
              Cancel
            </button>
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-xs font-bold shadow-haven-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>Continue to Step {step + 1}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 active:scale-95 text-white text-xs sm:text-sm font-extrabold shadow-haven-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing Property...' : 'Publish Property Listing'}</span>
            </button>
          )}
        </div>

      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md card-haven p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl shadow-haven-lg text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
              <CheckCircle className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Property Successfully Uploaded!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Your {bhk} BHK {propertyType} in {locality}, {city} is now live with 0% brokerage.
              </p>
            </div>

            {/* Reverse Match Telemetry highlight */}
            <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-left space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-orange-900">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>AI Reverse Matching Activated</span>
              </div>
              <p className="text-[11px] text-slate-700">
                <strong>4 active lifestyle buyers</strong> in {locality} have been automatically matched with a high compatibility score (&gt;90%).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setRole('SELLER');
                  setActiveView('seller_dashboard');
                }}
                className="py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-haven-sm"
              >
                Go to Seller Dashboard
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setRole('BUYER');
                  setActiveView('discover');
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                View in Discover Feed
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
