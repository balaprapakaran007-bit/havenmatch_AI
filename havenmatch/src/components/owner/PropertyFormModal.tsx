import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { propertyService } from '../../services/propertyService';
import { Property, PropertyType, FacingDirection, FurnishingStatus, PossessionStatus, NearbyPlace } from '../../types';
import {
  Building2,
  MapPin,
  Camera,
  Layers,
  ShieldCheck,
  Plus,
  Trash2,
  UploadCloud,
  X,
  Check,
  AlertCircle,
  Sparkles,
  Star,
  Compass,
  BedDouble,
  Bath,
  Droplets,
  Zap,
  Volume2,
  Heart,
  Users,
  FileText,
  Navigation
} from 'lucide-react';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property | null; // If provided, Edit mode; else Add mode
  onSuccess?: (savedProperty: Property) => void;
}

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  onClose,
  property,
  onSuccess
}) => {
  const { userSession, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!property;

  // Active step / section for navigation
  const [activeSection, setActiveSection] = useState<number>(1);

  // 1. Basic Details
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('Apartment');
  const [intent, setIntent] = useState<'BUY' | 'RENT'>('BUY');
  const [price, setPrice] = useState<number>(6500000);
  const [bhk, setBhk] = useState<number>(2);
  const [builtUpArea, setBuiltUpArea] = useState<number>(1200);
  const [carpetArea, setCarpetArea] = useState<number>(1000);
  const [propertyAge, setPropertyAge] = useState<number>(1);
  const [floor, setFloor] = useState<number>(2);
  const [totalFloors, setTotalFloors] = useState<number>(5);
  const [facing, setFacing] = useState<FacingDirection>('East');
  const [furnishing, setFurnishing] = useState<FurnishingStatus>('Semi-Furnished');
  const [possession, setPossession] = useState<PossessionStatus>('Ready to Move');
  const [vastuCompliant, setVastuCompliant] = useState<boolean>(true);
  const [reraId, setReraId] = useState<string>('TN/11/Building/0244/2024');

  // 2. Location Details
  const [fullAddress, setFullAddress] = useState('');
  const [locality, setLocality] = useState('Peelamedu');
  const [city, setCity] = useState('Coimbatore');
  const [pincode, setPincode] = useState('641004');
  const [lat, setLat] = useState<number>(11.0255);
  const [lng, setLng] = useState<number>(77.0028);

  // 3. Property Features
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [balconies, setBalconies] = useState<number>(1);
  const [parking, setParking] = useState<string>('1 Covered Stilt');
  const [powerBackup, setPowerBackup] = useState<string>('100% Full Backup');
  const [waterSupply, setWaterSupply] = useState<string>('Corporation + Siruvani');
  const [gatedCommunity, setGatedCommunity] = useState<boolean>(true);
  const [security24x7, setSecurity24x7] = useState<boolean>(true);

  // 4. Amenities
  const allAvailableAmenities = [
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

  // 5. Nearby Places (Structured)
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
      highlight: 'Premier K-12 Institution'
    },
    {
      id: 'poi-3',
      name: 'Saravanampatti / Peelamedu Bus Transit',
      category: 'transit',
      categoryLabel: 'Public Bus Stop',
      distanceKm: 0.5,
      driveTimeMins: 2,
      direction: 'S',
      directionDegrees: 180,
      highlight: 'Direct buses every 3 mins'
    },
    {
      id: 'poi-4',
      name: 'Nilgiris Supermarket & Fresh Mart',
      category: 'supermarket',
      categoryLabel: 'Groceries & Daily Essentials',
      distanceKm: 0.6,
      driveTimeMins: 2,
      direction: 'W',
      directionDegrees: 270,
      highlight: 'Fresh Produce & Bakery'
    }
  ]);

  const [newPoiName, setNewPoiName] = useState('');
  const [newPoiCategory, setNewPoiCategory] = useState<'hospital' | 'school' | 'transit' | 'supermarket' | 'techpark'>('hospital');
  const [newPoiDist, setNewPoiDist] = useState('1.5');
  const [newPoiDrive, setNewPoiDrive] = useState('5');

  // 6. Additional Details & Lifestyle Signals
  const [noiseLevel, setNoiseLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [safety, setSafety] = useState('Gated & 24/7 Guarded');
  const [waterAvailability, setWaterAvailability] = useState('24 Hours Supply (Siruvani)');
  const [electricityAvailability, setElectricityAvailability] = useState('24/7 No Powercuts');
  const [petFriendly, setPetFriendly] = useState<boolean>(true);
  const [suitableFor, setSuitableFor] = useState<string[]>(['Families', 'Working Professionals']);
  const [rules, setRules] = useState('');
  const [description, setDescription] = useState('');

  // 7. Image Management
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize form if editing
  useEffect(() => {
    if (property) {
      setTitle(property.title || '');
      setPropertyType(property.propertyType || 'Apartment');
      setIntent(property.intent || 'BUY');
      setPrice(property.price || (property.intent === 'RENT' ? 25000 : 6500000));
      setBhk(property.bhk || 2);
      setBuiltUpArea(property.builtUpAreaSqFt || 1200);
      setCarpetArea(property.carpetAreaSqFt || 1000);
      setPropertyAge(property.propertyAgeYears || 1);
      setFloor(property.floor || 2);
      setTotalFloors(property.totalFloors || 5);
      setFacing(property.facing || 'East');
      setFurnishing(property.furnishing || 'Semi-Furnished');
      setPossession(property.possession || 'Ready to Move');
      setVastuCompliant(property.vastuCompliant ?? true);
      setReraId(property.reraId || '');

      setFullAddress(property.fullAddress || '');
      setLocality(property.locality || 'Peelamedu');
      setCity(property.city || 'Coimbatore');
      setPincode(property.pincode || '641004');
      if (property.coordinates) {
        setLat(property.coordinates.lat || 11.0255);
        setLng(property.coordinates.lng || 77.0028);
      }

      setBathrooms(property.bathrooms || property.bhk || 2);
      setBalconies(property.balconies || 1);
      setParking(property.parking || '1 Covered Stilt');
      setPowerBackup(property.powerBackup || '100% Full Backup');
      setWaterSupply(property.waterSupply || 'Corporation + Siruvani');
      setGatedCommunity(property.gatedCommunity ?? true);
      setSecurity24x7(property.security24x7 ?? true);

      if (property.amenities && property.amenities.length > 0) {
        setSelectedAmenities(property.amenities);
      }

      if (property.nearbyPlaces && property.nearbyPlaces.length > 0) {
        setNearbyPlaces(property.nearbyPlaces);
      }

      setNoiseLevel(property.noiseLevel || 'LOW');
      setSafety(property.safety || 'Gated & 24/7 Guarded');
      setWaterAvailability(property.waterAvailability || '24 Hours Supply');
      setElectricityAvailability(property.electricityAvailability || '24/7 No Powercuts');
      setPetFriendly(property.petFriendly ?? true);
      if (property.suitableFor && property.suitableFor.length > 0) {
        setSuitableFor(property.suitableFor);
      }
      setRules(property.rules || '');
      setDescription(property.description || '');

      if (property.images && property.images.length > 0) {
        setImages(property.images);
      }
    }
  }, [property]);

  if (!isOpen) return null;

  // Amenity Toggle
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  // Suitable For Toggle
  const toggleSuitable = (category: string) => {
    setSuitableFor(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  // Add POI
  const handleAddPoi = () => {
    if (!newPoiName.trim()) return;
    const newPoi: NearbyPlace = {
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
    setNearbyPlaces(prev => [...prev, newPoi]);
    setNewPoiName('');
    showToast('Nearby place added');
  };

  const handleRemovePoi = (id: string) => {
    setNearbyPlaces(prev => prev.filter(p => p.id !== id));
    showToast('Nearby place removed');
  };

  // Image Management
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages(prev => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
    showToast('Image added to gallery');
  };

  const handleRemoveImage = (index: number) => {
    if (images.length <= 1) {
      showToast('Property must have at least one image.');
      return;
    }
    setImages(prev => prev.filter((_, idx) => idx !== index));
    showToast('Image removed');
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
    showToast('Cover image updated');
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

  // Validation
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
      errs.images = 'At least 1 property photo is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please resolve validation errors before saving.');
      return;
    }

    setIsSubmitting(true);

    const priceDisplay =
      intent === 'RENT'
        ? `₹${price.toLocaleString()}/mo`
        : price >= 10000000
        ? `₹${(price / 10000000).toFixed(2)} Cr`
        : `₹${(price / 100000).toFixed(0)} Lakhs`;

    const propertyPayload: Partial<Property> = {
      ...(property || {}),
      title: title.trim(),
      slug: (property?.slug || title).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tagline: `Spacious ${bhk} BHK ${propertyType} in ${locality}, ${city}`,
      description:
        description.trim() ||
        `Well-maintained ${bhk} BHK ${propertyType.toLowerCase()} located in prime ${locality}, ${city}. Excellent ventilation, ready infrastructure, and close proximity to key landmarks.`,
      propertyType,
      intent,
      city,
      locality,
      pincode,
      fullAddress: fullAddress.trim() || `${locality}, ${city} ${pincode}`,
      coordinates: { lat, lng },
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
    };

    try {
      let saved: Property;
      if (isEdit && property?.id) {
        saved = await propertyService.updateProperty(
          propertyPayload,
          userSession?.userId || userSession?.email,
          userSession?.email
        );
        showToast('Property updated successfully!');
      } else {
        saved = await propertyService.createProperty(propertyPayload);
        showToast('Property published successfully to HavenMatch AI!');
      }

      if (onSuccess) onSuccess(saved);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Error saving property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { num: 1, label: '1. Basic Details' },
    { num: 2, label: '2. Location Details' },
    { num: 3, label: '3. Features' },
    { num: 4, label: '4. Amenities' },
    { num: 5, label: '5. Nearby Places' },
    { num: 6, label: '6. Lifestyle Signals' },
    { num: 7, label: '7. Photos' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-4xl w-full border border-slate-200 shadow-2xl space-y-6 text-left my-6 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isEdit ? 'Edit Property Listing' : 'Add New Property Listing'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured 7-Section Lifestyle Specification • MongoDB Live Persistence
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 scrollbar-none shrink-0">
          {sections.map(s => (
            <button
              key={s.num}
              type="button"
              onClick={() => setActiveSection(s.num)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeSection === s.num
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pr-1 space-y-6">
          
          {/* SECTION 1: Basic Property Details */}
          {activeSection === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>Section 1: Basic Property Details</span>
              </h3>

              {/* Title */}
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

              {/* Type & Intent */}
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

              {/* Price & BHK */}
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
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">
                    Preview: {intent === 'BUY' ? `₹${((price || 0) / 100000).toFixed(0)} Lakhs` : `₹${(price || 0).toLocaleString()}/mo`}
                  </p>
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
                    <option value="East">East (Most Preferred)</option>
                    <option value="North">North</option>
                    <option value="North-East">North-East</option>
                    <option value="West">West</option>
                    <option value="South">South</option>
                    <option value="South-East">South-East</option>
                  </select>
                </div>
              </div>

              {/* Area & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Built-up Area (sq.ft)</label>
                  <input
                    type="number"
                    value={builtUpArea}
                    onChange={e => setBuiltUpArea(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Carpet Area (sq.ft)</label>
                  <input
                    type="number"
                    value={carpetArea}
                    onChange={e => setCarpetArea(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Property Age (Years)</label>
                  <input
                    type="number"
                    value={propertyAge}
                    onChange={e => setPropertyAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Floor vs Total Floors (WITH STRICT VALIDATION) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Property Floor Number *</label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Building Floors *</label>
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

              {/* Furnishing & Possession */}
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
                    <option value="Immediate">Immediate Possession</option>
                    <option value="Under Construction">Under Construction</option>
                  </select>
                </div>
              </div>

              {/* Vastu & RERA */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vastuCompliant}
                    onChange={e => setVastuCompliant(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-800">100% Vastu Compliant Design</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">RERA ID:</span>
                  <input
                    type="text"
                    value={reraId}
                    onChange={e => setReraId(e.target.value)}
                    placeholder="TN/11/Building/..."
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

            </div>
          )}

          {/* SECTION 2: Location Details */}
          {activeSection === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Locality / Neighborhood *</label>
                  <input
                    type="text"
                    value={locality}
                    onChange={e => {
                      setLocality(e.target.value);
                      if (errors.locality) setErrors(prev => ({ ...prev, locality: '' }));
                    }}
                    placeholder="e.g. Peelamedu, Race Course"
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

              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={e => setLat(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={e => setLng(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: Property Features */}
          {activeSection === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>Section 3: Property Features & Utilities</span>
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
                    <option value={3}>3+ Balconies</option>
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
                    <option value="None">None</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span>Water Supply Source</span>
                  </label>
                  <select
                    value={waterSupply}
                    onChange={e => setWaterSupply(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500 bg-white"
                  >
                    <option value="Corporation + Siruvani">Corporation (Siruvani) + Borewell</option>
                    <option value="24/7 Siruvani Water Supply">24/7 Dedicated Siruvani Water</option>
                    <option value="Corporation Supply Only">Corporation Supply Only</option>
                    <option value="Borewell + Tanker">Borewell + Tanker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Power Backup</span>
                  </label>
                  <select
                    value={powerBackup}
                    onChange={e => setPowerBackup(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500 bg-white"
                  >
                    <option value="100% Full Backup">100% Full Generator Backup</option>
                    <option value="Common Areas + Lifts">Common Areas & Lifts Only</option>
                    <option value="Inverter Provision">Inverter Provision</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gatedCommunity}
                    onChange={e => setGatedCommunity(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-800">Gated Community Compound</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={security24x7}
                    onChange={e => setSecurity24x7(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-800">24/7 Security Guard & CCTV</span>
                </label>
              </div>

            </div>
          )}

          {/* SECTION 4: Amenities (Multi-select) */}
          {activeSection === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Section 4: Verified Amenities</span>
              </h3>
              <p className="text-xs text-slate-500">Select all amenities available at this property or community:</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {allAvailableAmenities.map((amenity, idx) => {
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

          {/* SECTION 5: Nearby Places (Structured) */}
          {activeSection === 5 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                <Navigation className="w-4 h-4" />
                <span>Section 5: Nearby Places & Commute POIs</span>
              </h3>
              <p className="text-xs text-slate-500">
                Key landmarks and essential services used by HavenMatch AI to compute lifestyle scores:
              </p>

              {/* POI List */}
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
                        {poi.distanceKm} km • {poi.driveTimeMins} mins drive • {poi.highlight || 'Landmark'}
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
                <span className="text-xs font-bold text-orange-900 block">Add Nearby Landmark</span>
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
                    <option value="supermarket">Shopping / Grocery</option>
                    <option value="techpark">IT Park / Office</option>
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
                      className="flex-1 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* SECTION 6: Additional Details & Lifestyle Signals */}
          {activeSection === 6 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4" />
                <span>Section 6: Lifestyle Signals & Guidelines</span>
              </h3>

              {/* Noise Level */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ambient Noise Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: 'LOW', label: 'Quiet & Serene', sub: 'Low traffic, residential lane' },
                    { val: 'MEDIUM', label: 'Balanced Urban', sub: 'Moderate neighborhood buzz' },
                    { val: 'HIGH', label: 'Vibrant Corridor', sub: 'Active commercial hub' }
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

              {/* Suitable For (Multi-Select) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Suitable For (Target Residents)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Families', 'Working Professionals', 'Students', 'Senior Citizens', 'Bachelors', 'Expatriates'].map(cat => {
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

              {/* Pet Friendly Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Pet Friendly Property</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Allows dogs, cats, or other indoor pets.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPetFriendly(!petFriendly)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    petFriendly ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white block absolute top-0.5 transition-transform ${
                      petFriendly ? 'left-6.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Property Rules */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Community Rules & Restrictions</label>
                <input
                  type="text"
                  value={rules}
                  onChange={e => setRules(e.target.value)}
                  placeholder="e.g. Vegetarian preferred, No late-night loud parties"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Share unique selling points, interior highlights, and neighborhood advantages..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

            </div>
          )}

          {/* SECTION 7: Image Management */}
          {activeSection === 7 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                <Camera className="w-4 h-4" />
                <span>Section 7: Image Gallery & Management</span>
              </h3>
              <p className="text-xs text-slate-500">
                Upload real photos. The first photo is automatically used as the <strong>Cover Photo</strong>.
              </p>

              {/* Image Grid */}
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
                          className="p-1.5 rounded-lg bg-white/90 text-slate-800 text-[10px] font-bold hover:bg-white shadow-xs"
                          title="Make Cover Photo"
                        >
                          Make Cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Image URL / Upload */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">Add Photo to Gallery</span>
                
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
                  <span className="text-[11px] text-slate-500 font-semibold">Or upload local image file:</span>
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

          {/* Modal Footer / Navigation & Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              {activeSection > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveSection(prev => prev - 1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  ← Back
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
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>Saving to MongoDB...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isEdit ? 'Update Property' : 'Publish Property'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
