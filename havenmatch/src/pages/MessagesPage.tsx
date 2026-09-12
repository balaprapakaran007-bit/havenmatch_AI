import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Search,
  Send,
  Home,
  Compass,
  Heart,
  Calendar,
  MessageSquare,
  User,
  MapPin,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  propertyTitle: string;
  propertyPrice: string;
  propertyLocality: string;
  propertyImage: string;
}

const CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    name: 'Rahul S.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    lastMessage: 'Hi, I am interested in this property. Is it available for a site visit?',
    time: '10:30 AM',
    unread: false,
    propertyTitle: '2 BHK Apartment',
    propertyPrice: '₹68 Lakhs',
    propertyLocality: 'Saravanampatti, Coimbatore',
    propertyImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'c2',
    name: 'Aditi M.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    lastMessage: 'Are you available this weekend for a tour?',
    time: 'Yesterday',
    unread: false,
    propertyTitle: '3 BHK Villa',
    propertyPrice: '₹1.25 Crores',
    propertyLocality: 'Vadavalli, Coimbatore',
    propertyImage: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'c3',
    name: 'Suresh K.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    lastMessage: 'Price discussion and Siruvani water connection details.',
    time: 'Feb 8',
    unread: false,
    propertyTitle: '2 BHK Residence',
    propertyPrice: '₹55 Lakhs',
    propertyLocality: 'Peelamedu, Coimbatore',
    propertyImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'c4',
    name: 'Nivetha R.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    lastMessage: 'Let me know your thoughts on the floor plan.',
    time: 'Feb 7',
    unread: false,
    propertyTitle: 'Independent House',
    propertyPrice: '₹85 Lakhs',
    propertyLocality: 'RS Puram, Coimbatore',
    propertyImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=300&q=80'
  }
];

export const MessagesPage: React.FC = () => {
  const { userSession } = useApp();
  const [activeConv, setActiveConv] = useState<Conversation>(CONVERSATIONS[0]);
  const [messages, setMessages] = useState<Array<{ sender: 'buyer' | 'owner'; text: string; time: string }>>([
    { sender: 'buyer', text: 'Hi, I am interested in this property. Is it available for a site visit?', time: '10:15 AM' },
    { sender: 'owner', text: 'Yes, it is available. We can schedule a visit this weekend.', time: '10:19 AM' },
    { sender: 'buyer', text: 'Great! Saturday morning works for me.', time: '10:30 AM' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    setMessages((prev) => [
      ...prev,
      { sender: 'buyer', text: inputMsg.trim(), time: 'Just now' }
    ]);
    setInputMsg('');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[750px] max-h-[85vh]">
          
          {/* Left Sidebar Navigation (Matching Screen 10) */}
          <aside className="lg:col-span-3 hidden lg:block bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm text-left">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-slate-900">HavenMatch AI</span>
            </div>

            <nav className="space-y-1">
              <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                <Home className="w-4 h-4 text-slate-400" />
                <span>Home</span>
              </Link>
              <Link to="/recommendations" className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                <Compass className="w-4 h-4 text-slate-400" />
                <span>Discover</span>
              </Link>
              <Link to="/buyer/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                <Sparkles className="w-4 h-4 text-slate-400" />
                <span>My Matches</span>
              </Link>
              <Link to="/buyer/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                <Heart className="w-4 h-4 text-slate-400" />
                <span>Shortlist</span>
              </Link>
              <Link to="/buyer/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Visits</span>
              </Link>
              <Link to="/messages" className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold bg-orange-50 text-orange-700 shadow-xs">
                <MessageSquare className="w-4 h-4 text-orange-600" />
                <span>Messages</span>
              </Link>
              <Link to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                <User className="w-4 h-4 text-slate-400" />
                <span>Profile</span>
              </Link>
            </nav>
          </aside>

          {/* Middle: Conversation List (Matching Screen 10) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col text-left overflow-hidden">
            <div className="pb-3 border-b border-slate-100 space-y-2">
              <h2 className="text-lg font-black text-slate-900">Messages</h2>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full text-xs text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pt-3 scrollbar-none">
              {CONVERSATIONS.map((c) => {
                const isActive = activeConv.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveConv(c)}
                    className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                      isActive
                        ? 'border-orange-200 bg-orange-50/70 shadow-xs'
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{c.name}</h4>
                        <span className="text-[10px] text-slate-400 font-medium">{c.time}</span>
                      </div>
                      <p className="text-[11px] font-bold text-orange-700 truncate">{c.propertyTitle}</p>
                      <p className="text-[11px] text-slate-500 truncate">{c.lastMessage}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Main Chat Pane (Matching Screen 10) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col text-left overflow-hidden">
            
            {/* Header with user status */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={activeConv.avatar} alt={activeConv.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{activeConv.name}</h3>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                  </span>
                </div>
              </div>
            </div>

            {/* Top Property Context Card (Matching Screen 10) */}
            <div className="px-4 py-2.5 bg-[#FAF9F6] border-b border-slate-200/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={activeConv.propertyImage} alt="Property" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{activeConv.propertyTitle}</h4>
                  <p className="text-[11px] text-slate-500">{activeConv.propertyLocality} • <span className="font-bold text-orange-600">{activeConv.propertyPrice}</span></p>
                </div>
              </div>

              <Link
                to="/recommendations"
                className="text-xs font-bold text-orange-600 hover:text-orange-700 shrink-0"
              >
                View Property
              </Link>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === 'buyer' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      m.sender === 'buyer'
                        ? 'bg-orange-600 text-white rounded-br-none shadow-xs'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
                </div>
              ))}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-xl bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center shadow-sm transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>

        </div>
      </div>
    </div>
  );
};
