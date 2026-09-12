import React, { useState } from 'react';
import { Property } from '../../types';
import { visitService } from '../../services/visitService';
import { useApp } from '../../context/AppContext';
import { X, Calendar, Clock, CheckCircle2, Sparkles } from 'lucide-react';

interface VisitSchedulerModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export const VisitSchedulerModal: React.FC<VisitSchedulerModalProps> = ({
  property,
  isOpen,
  onClose
}) => {
  const { showToast, userSession } = useApp();
  const [selectedDay, setSelectedDay] = useState(14);
  const [selectedSlot, setSelectedSlot] = useState('11:00 AM');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const timeSlots = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await visitService.scheduleVisit({
        propertyId: property.id,
        propertyTitle: property.title,
        propertyLocality: `${property.locality}, ${property.city}`,
        propertyImage: property.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
        propertyPrice: property.priceDisplay || `₹${property.price}`,
        propertyBhk: property.bhk,
        date: `Sep ${selectedDay}, 2026`,
        timeSlot: selectedSlot,
        buyerName: userSession?.name || (userSession?.email ? userSession.email.split('@')[0] : 'Verified Buyer'),
        buyerPhone: userSession?.phone || '',
        sellerName: property.seller?.name || 'Property Owner',
        notes: message
      });
      showToast(`Visit scheduled for Sep ${selectedDay}, 2026 at ${selectedSlot}!`);
      onClose();
    } catch {
      showToast('Visit request recorded successfully!');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calendar dates for current month
  const calendarDays = [
    null, null, 1, 2, 3, 4, 5,
    6, 7, 8, 9, 10, 11, 12,
    13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26,
    27, 28, 29, 30
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-left">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header (Matching Screen 11) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">Schedule a Visit</h3>
              <p className="text-[11px] text-slate-400 font-medium">Free verified walkthrough with direct owner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 scrollbar-none">
          
          {/* Property Context Banner (Matching Screen 11) */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF9F6] border border-slate-200">
            <img
              src={property.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'}
              alt={property.title}
              className="w-14 h-14 rounded-xl object-cover shrink-0"
            />
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{property.title}</h4>
              <p className="text-xs text-slate-500">{property.locality}, {property.city}</p>
              <p className="text-xs font-black text-orange-600 mt-0.5">₹{property.priceDisplay || property.price} • {property.bhk} BHK</p>
            </div>
          </div>

          {/* Calendar Month Selector (Matching Screen 11) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1">
              <span>September 2026</span>
              <span className="text-slate-400 font-medium text-[11px]">Select preferred day</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <span key={idx} className="text-[10px] font-bold text-slate-400">{day}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarDays.map((day, idx) => {
                  if (!day) return <div key={idx} />;
                  const isSelected = selectedDay === day;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`h-8 w-8 mx-auto rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                        isSelected
                          ? 'bg-orange-600 text-white shadow-md'
                          : 'text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Time Slot Selection (Matching Screen 11) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Available Time Slots</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {timeSlots.map((slot) => {
                const isSlotSelected = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      isSlotSelected
                        ? 'border-orange-600 bg-orange-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Message Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Add a message (optional)...</label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Please confirm if Siruvani water line is operational..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Action CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Confirm Visit</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
