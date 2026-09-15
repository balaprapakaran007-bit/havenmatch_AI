import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { propertyService } from '../services/propertyService';
import { Property, PropertyType, FacingDirection, FurnishingStatus, PossessionStatus, NearbyPlace } from '../types';
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
  ArrowLeft,
  Sparkles,
  Check,
  AlertCircle,
  Volume2,
  Droplets,
  Zap,
  Navigation
} from 'lucide-react';

export const AddPropertyPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, userSession } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryParams = new URLSearchParams(location.search);
  const queryIntent = queryParams.get('intent');

  const [activeSection, setActiveSection] = useState<number>(1);

  // 1. Basic Details
  const [intent, setIntent] = useState<'BUY' | 'RENT'>(
    queryIntent === 'RENT_OUT' || queryIntent === 'RENT' ? 'RENT' : 'BUY'
  );
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('Apartment');
  const [price, setPrice] = useState<number>(
    queryIntent === 'RENT_OUT' || queryIntent === 'RENT' ? 25000 : 6500000
  );
  const [bhk, setBhk] = useState<number>(2);
  const [builtUpArea, setBuiltUpArea] = useState<number>(1200);
  const [carpetArea, setCarpetArea] = useState<number>(1000);
  const [propertyAge, setPropertyAge] = useState<number>(1);
  const [floor, setFloor] = useState<number>(2);
  const [totalFloors, setTotalFloors] = useState<number>(5);
  const [facing, setFacing] = useState<FacingDirection>('East');
  const [furnishing, setFurnishing] = useState<FurnishingStatus>('Semi-Furnished');
  const [possession, setPossession] = useState<PossessionStatus>('Ready to Move');
  const [vastuCompliant, setVastuCompliant] = useState(true);
  const [reraId, setReraId] = useState('TN/11/Building/0244/2024');

  // 2. Location
  const [city, setCity] = useState('Coimbatore');
  const [locality, setLocality] = useState('Peelamedu');
  const [pincode, setPincode] = useState('641004');
  const [fullAddress, setFullAddress] = useState('');

  // 3. Features
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [balconies, setBalconies] = useState<number>(1);
  const [parking, setParking] = useState<string>('1 Covered Stilt');
  const [powerBackup, setPowerBackup] = useState<string>('100% Full Backup');
  const [waterSupply, setWaterSupply] = useState<string>('Corporation + Siruvani');
  const [gatedCommunity, setGatedCommunity] = useState<boolean>(true);
  const [security24x7, setSecurity24x7] = useState<boolean>(true);

  // 4. Amenities
  const allAmenities = [
    'Swimming Pool',
    'Modern Gymnasium',
    'Clubhouse',
    "Children's Play Area",
    '24/7 Security & CCTV',
    '100% Power Backup',
    'High-Speed Lift',
    'Covered Car Parking',
    'Siruvani Water Connection',
    'Landscaped Garden',
    'EV Charging Station',
    'Intercom Facility',
    'Badminton Court',
    'Jogging Track',
    'Rainwater Harvesting',
    'Solar Water Heating'
  ];

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    '24/7 Security & CCTV',
    '100% Power Backup',
    'High-Speed Lift',
    'Covered Car Parking',
    'Siruvani Water Connection'
  ]);

  // 5. Nearby Places
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([
    {
      id: 'poi-1',
      name: 'PSG Hospitals & KMCH',
      category: 'hospital',
      categoryLabel: 'Super Specialty Hospital',
      distanceKm: 1.2,
      driveTimeMins: 4,
      direction: 'NE',
      directionDegrees: 45,
      highlight: '24/7 Emergency Care'
    },
    {
      id: 'poi-2',
      name: 'Delhi Public School',
      category: 'school',
      categoryLabel: 'CBSE School',
      distanceKm: 1.8,
      driveTimeMins: 6,
      direction: 'N',
      directionDegrees: 20,
      highlight: 'Top CBSE School'
    },
    {
      id: 'poi-3',
      name: 'Peelamedu Bus Corridor',
      category: 'transit',
      categoryLabel: 'Public Bus Stop',
      distanceKm: 0.45,
      driveTimeMins: 2,
      direction: 'S',
      directionDegrees: 180,
      highlight: 'Direct city buses'
    }
  ]);
  const [newPoiName, setNewPoiName] = useState('');
  const [newPoiCategory, setNewPoiCategory] = useState<'hospital' | 'school' | 'transit' | 'supermarket' | 'techpark'>('hospital');
  const [newPoiDist, setNewPoiDist] = useState('1.5');
  const [newPoiDrive, setNewPoiDrive] = useState('5');

  // 6. Lifestyle Signals
  const [noiseLevel, setNoiseLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [safety, setSafety] = useState('Gated & 24/7 Guarded');
  const [waterAvailability, setWaterAvailability] = useState('24 Hours Supply');
  const [electricityAvailability, setElectricityAvailability] = useState('24/7 No Powercuts');
  const [petFriendly, setPetFriendly] = useState<boolean>(true);
  const [suitableFor, setSuitableFor] = useState<string[]>(['Families', 'Working Professionals']);
  const [rules, setRules] = useState('');
  const [description, setDescription] = useState('');

  // 7. Images
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (queryIntent === 'RENT_OUT' || queryIntent === 'RENT') {
      setIntent('RENT');
      setPrice(25000);
    } else if (queryIntent === 'SELL') {
      setIntent('BUY');
      setPrice(6500000);
    }
  }, [queryIntent]);

  const toggleAmenity = (name: string) => {
    setSelectedAmenities(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  const toggleSuitable = (cat: string) => {
    setSuitableFor(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleAddPoi = () => {
    if (!newPoiName.trim()) return;
    const poi: NearbyPlace = {
      id: `poi-${Date.now()}`,
      name: newPoiName.trim(),
      category: newPoiCategory,
      categoryLabel: newPoiCategory.charAt(0).toUpperCase() + newPoiCategory.slice(1),
      distanceKm: parseFloat(newPoiDist) || 1.0,
      driveTimeMins: parseInt(newPoiDrive) || 3,
      direction: 'NE',
      directionDegrees: 45,
      highlight: 'Verified Landmark'
    };
    setNearbyPlaces(prev => [...prev, poi]);
    setNewPoiName('');
    showToast('Nearby landmark added');
  };

  const handleRemovePoi = (id: string) => {
    setNearbyPlaces(prev => prev.filter(p => p.id !== id));
    showToast('Landmark removed');
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages(prev => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
    showToast('Photo added');
  };

  const handleRemoveImage = (index: number) => {
    if (images.length <= 1) {
      showToast('Property must have at least one photo.');
      return;
    }
    setImages(prev => prev.filter((_, idx) => idx !== index));
    showToast('Photo removed');
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
    showToast('Cover photo updated');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = evt => {
          const res = evt.target?.result as string;
          if (res) setImages(prev => [...prev, res]);
        };
        reader.readAsDataURL(file);
      }
    });

    if (e.target) e.target.value = '';
    showToast('Photos uploaded');
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!title.trim() || title.trim().length < 3) {
      errs.title = 'Property title is required (min 3 characters).';
    }

    if (!price || price <= 0) {
      errs.price = 'Please enter a valid price / rent amount.';
    }

    if (floor > totalFloors) {
      errs.floor = `Floor number (${floor}) cannot exceed Total Floors (${totalFloors}).`;
    }

    if (!locality.trim()) {
      errs.locality = 'Locality / Area is required.';
    }

    if (!city.trim()) {
      errs.city = 'City is required.';
    }

    if (images.length === 0) {
      errs.images = 'At least 1 photo is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please resolve validation errors before listing.');
      return;
    }

    setIsSubmitting(true);

    const priceDisplay =
      intent === 'RENT'
        ? `₹${price.toLocaleString()}/mo`
        : price >= 10000000
        ? `₹${(price / 10000000).toFixed(2)} Cr`
        : `₹${(price / 100000).toFixed(0)} Lakhs`;

    try {
      await propertyService.createProperty({
        title: title.trim(),
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tagline: `Spacious ${bhk} BHK ${propertyType} in ${locality}, ${city}`,
        description:
          description.trim() ||
          `Well-maintained ${bhk} BHK ${propertyType.toLowerCase()} located in prime ${locality}, ${city}. Excellent ventilation, ready infrastructure, 24/7 security, and close proximity to key landmarks.`,
        propertyType,
        intent,
        city,
        locality,
        pincode,
        fullAddress: fullAddress.trim() || `${locality}, ${city} ${pincode}`,
        coordinates: { lat: 11.0255, lng: 77.0028 },
        price,
        priceDisplay,
        pricePerSqFt: `₹${Math.round(price / (builtUpArea || 1200))}/sq.ft`,
        maintenanceMonthly: '₹2,500/month',
        bhk,
        bathrooms,
        balconies,
        builtUpAreaSqFt: builtUpArea,
        carpetAreaSqFt: carpetArea,
        floor,
        totalFloors,
        facing,
        furnishing,
        propertyAgeYears: propertyAge,
        possession,
        reraApproved: !!reraId,
        reraId,
        vastuCompliant,
        parking,
        powerBackup,
        waterSupply,
        gatedCommunity,
        security24x7,
        noiseLevel,
        safety,
        waterAvailability,
        electricityAvailability,
        petFriendly,
        suitableFor,
        rules,
        additionalDetails: description,
        nearbyPlaces,
        amenities: selectedAmenities,
        images,
        seller: {
          id: userSession?.userId || userSession?.email || 'S001',
          name: userSession?.name || 'Property Owner',
          role: userSession?.ownerType === 'AGENT' ? 'Real Estate Agent' : 'Individual Owner',
          phone: userSession?.phone || '+91 98422 11223',
          email: userSession?.email || 'owner@havenmatch.ai',
          verified: true,
          responseRate: '98%',
          avatarUrl: userSession?.avatarUrl,
          location: userSession?.location,
          bio: userSession?.bio
        }
      });

      showToast('Property successfully listed on HavenMatch AI!');
      navigate('/owner/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Error publishing property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { num: 1, label: '1. Basic Specs' },
    { num: 2, label: '2. Location' },
    { num: 3, label: '3. Features' },
    { num: 4, label: '4. Amenities' },
    { num: 5, label: '5. Landmarks' },
    { num: 6, label: '6. Lifestyle' },
    { num: 7, label: '7. Photos' }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 pb-24 md:pb-12 text-left">
      <div className="max-w-4xl mx-auto space-y-6">
        
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
            100% Free Direct Listing
          </span>
        </div>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mx-auto mb-2">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {intent === 'BUY' ? 'List Your Property for Sale' : 'List Your Property for Rent'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Reach verified buyers and tenants matched by lifestyle compatibility.
          </p>
        </div>

        {/* 7 Section Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
          {sections.map(s => (
            <button
              key={s.num}
              type="button"
              onClick={() => setActiveSection(s.num)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeSection === s.num
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Main Form Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* SECTION 1: Basic Specs */}
            {activeSection === 1 && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>Section 1: Basic Property Details</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Property Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => {
                      setTitle(e.target.value);
                      if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                    }}
                    placeholder="e.g. Mayflower Sakthi Garden 3 BHK Luxury Flat"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none ${
                      errors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-orange-500'
                    }`}
                  />
                  {errors.title && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.title}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Property Type</label>
                    <select
                      value={propertyType}
                      onChange={e => setPropertyType(e.target.value as PropertyType)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500 bg-white"
                    >
                      <option value="Apartment">Apartment</option>
                      <option value="Independent House">Independent House</option>
                      <option value="Villa">Luxury Villa</option>
                      <option value="Builder Floor">Builder Floor</option>
                      <option value="Studio Apartment">Studio Apartment</option>
                      <option value="Plot / Land">Plot / Land</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Listing Intent</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIntent('BUY')}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          intent === 'BUY'
                            ? 'bg-orange-50 border-orange-600 text-orange-700 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        For Sale
                      </button>
                      <button
                        type="button"
                        onClick={() => setIntent('RENT')}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          intent === 'RENT'
                            ? 'bg-orange-50 border-orange-600 text-orange-700 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        For Rent
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {intent === 'BUY' ? 'Total Price (₹) *' : 'Monthly Rent (₹) *'}
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={e => {
                        setPrice(Number(e.target.value));
                        if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">BHK Configuration</label>
                    <select
                      value={bhk}
                      onChange={e => setBhk(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500 bg-white"
                    >
                      <option value={1}>1 BHK</option>
                      <option value={2}>2 BHK</option>
                      <option value={3}>3 BHK</option>
                      <option value={4}>4 BHK</option>
                      <option value={5}>5+ BHK</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Facing Direction</label>
                    <select
                      value={facing}
                      onChange={e => setFacing(e.target.value as FacingDirection)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500 bg-white"
                    >
                      <option value="East">East</option>
                      <option value="North">North</option>
                      <option value="North-East">North-East</option>
                      <option value="West">West</option>
                      <option value="South">South</option>
                      <option value="South-East">South-East</option>
                    </select>
                  </div>
                </div>

                {/* Floor vs Total Floors with validation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Floor Number *</label>
                    <input
                      type="number"
                      value={floor}
                      onChange={e => {
                        setFloor(Number(e.target.value));
                        if (errors.floor) setErrors(prev => ({ ...prev, floor: '' }));
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none ${
                        errors.floor ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus:border-orange-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Total Floors *</label>
                    <input
                      type="number"
                      value={totalFloors}
                      onChange={e => {
                        setTotalFloors(Number(e.target.value));
                        if (errors.floor) setErrors(prev => ({ ...prev, floor: '' }));
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {errors.floor && (
                    <div className="sm:col-span-2">
                      <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.floor}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Furnishing Status</label>
                    <select
                      value={furnishing}
                      onChange={e => setFurnishing(e.target.value as FurnishingStatus)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500 bg-white"
                    >
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Fully Furnished">Fully Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Possession Status</label>
                    <select
                      value={possession}
                      onChange={e => setPossession(e.target.value as PossessionStatus)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500 bg-white"
                    >
                      <option value="Ready to Move">Ready to Move</option>
                      <option value="Immediate">Immediate</option>
                      <option value="Under Construction">Under Construction</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: Location */}
            {activeSection === 2 && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>Section 2: Location Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                    <select
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500 bg-white"
                    >
                      <option value="Coimbatore">Coimbatore</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Hyderabad">Hyderabad</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Locality *</label>
                    <input
                      type="text"
                      value={locality}
                      onChange={e => setLocality(e.target.value)}
                      placeholder="e.g. Peelamedu"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={e => setPincode(e.target.value)}
                      placeholder="641004"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Street Address</label>
                  <textarea
                    rows={2}
                    value={fullAddress}
                    onChange={e => setFullAddress(e.target.value)}
                    placeholder="e.g. Avinashi Road, Near PSG Tech, Peelamedu, Coimbatore 641004"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            )}

            {/* SECTION 3: Features */}
            {activeSection === 3 && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Section 3: Features & Water Supply</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bathrooms</label>
                    <select
                      value={bathrooms}
                      onChange={e => setBathrooms(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500 bg-white"
                    >
                      <option value={1}>1 Bathroom</option>
                      <option value={2}>2 Bathrooms</option>
                      <option value={3}>3 Bathrooms</option>
                      <option value={4}>4+ Bathrooms</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Balconies</label>
                    <select
                      value={balconies}
                      onChange={e => setBalconies(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500 bg-white"
                    >
                      <option value={0}>No Balcony</option>
                      <option value={1}>1 Balcony</option>
                      <option value={2}>2 Balconies</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Parking</label>
                    <select
                      value={parking}
                      onChange={e => setParking(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500 bg-white"
                    >
                      <option value="1 Covered Stilt">1 Covered Stilt</option>
                      <option value="1 Covered + 1 Open">1 Covered + 1 Open</option>
                      <option value="2 Covered Parking">2 Covered Parking</option>
                      <option value="Open Parking">Open Parking</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Water Supply</label>
                    <select
                      value={waterSupply}
                      onChange={e => setWaterSupply(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500 bg-white"
                    >
                      <option value="Corporation + Siruvani">Corporation (Siruvani) + Borewell</option>
                      <option value="24/7 Siruvani Water Supply">24/7 Dedicated Siruvani Water</option>
                      <option value="Corporation Supply Only">Corporation Supply Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Power Backup</label>
                    <select
                      value={powerBackup}
                      onChange={e => setPowerBackup(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500 bg-white"
                    >
                      <option value="100% Full Backup">100% Full Generator Backup</option>
                      <option value="Common Areas + Lifts">Common Areas & Lifts Only</option>
                      <option value="Inverter Provision">Inverter Provision</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: Amenities */}
            {activeSection === 4 && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Section 4: Verified Amenities</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {allAmenities.map((amenity, idx) => {
                    const isChecked = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all flex items-center justify-between ${
                          isChecked
                            ? 'bg-orange-50 border-orange-500 text-orange-800 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{amenity}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 5: Nearby Landmarks */}
            {activeSection === 5 && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation className="w-4 h-4" />
                  <span>Section 5: Nearby Places & Commute POIs</span>
                </h3>

                <div className="space-y-2">
                  {nearbyPlaces.map(poi => (
                    <div
                      key={poi.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{poi.name}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-200 text-slate-700">
                            {poi.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-orange-600 font-bold mt-0.5">
                          {poi.distanceKm} km • {poi.driveTimeMins} mins drive
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePoi(poi.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New POI */}
                <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200/80 space-y-3">
                  <span className="text-xs font-bold text-orange-900 block">Add Landmark</span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={newPoiName}
                      onChange={e => setNewPoiName(e.target.value)}
                      placeholder="Place name (e.g. TIDEL Park)"
                      className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                    />
                    <select
                      value={newPoiCategory}
                      onChange={e => setNewPoiCategory(e.target.value as any)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                    >
                      <option value="hospital">Hospital</option>
                      <option value="school">School</option>
                      <option value="transit">Transit / Bus</option>
                      <option value="supermarket">Grocery / Mall</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={newPoiDist}
                        onChange={e => setNewPoiDist(e.target.value)}
                        placeholder="Km"
                        className="w-16 px-2 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddPoi}
                        className="flex-1 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 6: Lifestyle Signals */}
            {activeSection === 6 && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4" />
                  <span>Section 6: Lifestyle Signals</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ambient Noise Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: 'LOW', label: 'Quiet & Serene', sub: 'Low traffic' },
                      { val: 'MEDIUM', label: 'Balanced Urban', sub: 'Moderate buzz' },
                      { val: 'HIGH', label: 'Vibrant Corridor', sub: 'Busy avenue' }
                    ].map(n => (
                      <button
                        key={n.val}
                        type="button"
                        onClick={() => setNoiseLevel(n.val as any)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          noiseLevel === n.val
                            ? 'bg-orange-50 border-orange-600 text-orange-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs font-black block">{n.label}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{n.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Suitable For</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Families', 'Working Professionals', 'Students', 'Senior Citizens'].map(cat => {
                      const isSel = suitableFor.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleSuitable(cat)}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                            isSel
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {isSel ? `✓ ${cat}` : cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Community Rules & Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe unique highlights, ventilation, security, and house guidelines..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            )}

            {/* SECTION 7: Photos */}
            {activeSection === 7 && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  <span>Section 7: Property Photo Gallery</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-slate-200 group bg-slate-900"
                    >
                      <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      
                      {idx === 0 && (
                        <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                          ★ Cover Photo
                        </span>
                      )}

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className="p-1.5 rounded-lg bg-white/90 text-slate-800 text-[10px] font-bold hover:bg-white"
                          >
                            Make Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={e => setNewImageUrl(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700"
                    >
                      Add URL
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-semibold">Or upload from device:</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-orange-600" />
                      <span>Upload Files</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {activeSection > 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveSection(prev => prev - 1)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
                  >
                    ← Previous
                  </button>
                )}
                {activeSection < 7 && (
                  <button
                    type="button"
                    onClick={() => setActiveSection(prev => prev + 1)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                  >
                    Next Section →
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/owner/dashboard"
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Publishing to Atlas...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Publish Property Listing</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
