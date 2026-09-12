import React, { useState, useEffect } from 'react';
import { ChatMessage } from '../types';
import { messageService } from '../services/messageService';
import { useApp } from '../context/AppContext';
import { Send, MapPin, ShieldCheck } from 'lucide-react';

export const MessagesView: React.FC = () => {
  const { role, userSession, selectedPropertyId } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    messageService.getMessages().then(setMessages);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const currentUserId = userSession?.userId || userSession?.email || 'user';
    const currentUserName = userSession?.name || (role === 'BUYER' ? 'Buyer' : 'Seller');

    const newMsg = await messageService.sendMessage({
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: role === 'BUYER' ? 'buyer' : 'seller',
      text: inputText,
      propertyContext: {
        id: selectedPropertyId || 'general',
        title: 'Property Inquiry Thread',
        locality: 'Direct Messaging',
        price: ''
      }
    });

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="card-haven bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-haven-sm flex flex-col h-[78vh]">
        
        {/* Header with Property Context */}
        <div className="p-4 border-b border-slate-200 bg-orange-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {role === 'BUYER' ? 'SK' : 'AS'}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                {role === 'BUYER' ? 'Property Owner' : 'Verified Buyer'}
              </h3>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-orange-600" />
                Saffron Serenade 2.5 BHK • Peelamedu
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-orange-800 bg-white px-2.5 py-1 rounded-full border border-orange-200">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
            Direct Verified Chat
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#FAFAF9]">
          {messages.map((m) => {
            const isMe = (role === 'BUYER' && m.senderRole === 'buyer') || (role === 'SELLER' && m.senderRole === 'seller');
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isMe
                      ? 'bg-orange-600 text-white rounded-br-xs shadow-haven-sm'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-xs'
                  }`}
                >
                  <p>{m.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {m.timestamp}
                </span>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 font-medium"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-haven-sm flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>

      </div>
    </div>
  );
};
