import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  ArrowRight, 
  Minimize2, 
  Maximize2,
  RefreshCw,
  Home,
  CheckCircle2
} from 'lucide-react';
import { useLifestyle } from '../../context/LifestyleContext';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  extractedCriteria?: {
    intent?: 'BUY' | 'RENT';
    bhk?: number;
    locality?: string;
    budgetMax?: number;
    propertyType?: string;
  };
  ctaAction?: {
    label: string;
    path: string;
  };
}

const STARTER_SUGGESTIONS = [
  '2 BHK Buy under 50 Lakhs',
  '2 BHK Rental in Saravanampatti',
  '3 BHK in Peelamedu near schools',
  'Luxury Villa in Race Course'
];

export const AIChatBot: React.FC = () => {
  const navigate = useNavigate();
  const { setRequirements } = useLifestyle();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: "Hi! I'm your AI real estate assistant. Are you looking to buy or rent a property?",
      timestamp: 'Just now'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  // Natural Language Extraction & Response Generator (matches HavenMatch Agent Workflow)
  const processUserQuery = (query: string) => {
    const q = query.toLowerCase();

    // 1. Detect Intent
    let detectedIntent: 'BUY' | 'RENT' | undefined = undefined;
    if (q.includes('rent') || q.includes('lease') || q.includes('/mo') || q.includes('per month') || q.includes('tenant')) {
      detectedIntent = 'RENT';
    } else if (q.includes('buy') || q.includes('purchase') || q.includes('sale') || q.includes('invest') || q.includes('lakh') || q.includes('crore')) {
      detectedIntent = 'BUY';
    }

    // 2. Detect BHK
    let detectedBhk: number | undefined = undefined;
    if (q.includes('1 bhk') || q.includes('1bhk') || q.includes('1 bedroom') || q.includes('studio') || q.includes('1-bhk')) detectedBhk = 1;
    else if (q.includes('2 bhk') || q.includes('2bhk') || q.includes('2 bedroom') || q.includes('2-bhk')) detectedBhk = 2;
    else if (q.includes('3 bhk') || q.includes('3bhk') || q.includes('3 bedroom') || q.includes('3-bhk')) detectedBhk = 3;
    else if (q.includes('4 bhk') || q.includes('4bhk') || q.includes('4 bedroom') || q.includes('4-bhk')) detectedBhk = 4;
    else if (q.includes('5 bhk') || q.includes('5bhk') || q.includes('5 bedroom') || q.includes('5-bhk') || q.includes('villa')) detectedBhk = 5;

    // 3. Detect Locality
    let detectedLocality: string | undefined = undefined;
    const localities = [
      'peelamedu',
      'saravanampatti',
      'race course',
      'rs puram',
      'saibaba colony',
      'vadavalli',
      'singanallur',
      'kalapatti',
      'gandhipuram',
      'ramanathapuram'
    ];
    for (const loc of localities) {
      if (q.includes(loc)) {
        detectedLocality = loc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        break;
      }
    }

    // 4. Detect Budget
    let detectedBudget: number | undefined = undefined;
    if (q.includes('50 lakh') || q.includes('50l') || q.includes('50 lakhs')) detectedBudget = 5000000;
    else if (q.includes('30 lakh') || q.includes('30l')) detectedBudget = 3000000;
    else if (q.includes('75 lakh') || q.includes('75l')) detectedBudget = 7500000;
    else if (q.includes('1 crore') || q.includes('1 cr') || q.includes('1cr')) detectedBudget = 10000000;
    else if (q.includes('2 crore') || q.includes('2 cr') || q.includes('2cr')) detectedBudget = 20000000;
    else if (q.includes('15000') || q.includes('15k') || q.includes('15,000')) detectedBudget = 15000;
    else if (q.includes('20000') || q.includes('20k') || q.includes('20,000')) detectedBudget = 20000;
    else if (q.includes('25000') || q.includes('25k') || q.includes('25,000')) detectedBudget = 25000;

    // 5. Detect Property Type
    let detectedType = 'Apartment';
    if (q.includes('villa')) detectedType = 'Villa';
    else if (q.includes('house') || q.includes('independent')) detectedType = 'House';

    // 6. Generate Conversational Agent Response
    let botResponse = '';
    let cta: { label: string; path: string } | undefined = undefined;

    if (q === 'hi' || q === 'hello' || q === 'hey') {
      botResponse = "Hello! I'm HavenMatch, your real estate assistant. Are you looking to buy or rent a property in Coimbatore?";
    } else if (detectedBhk && detectedIntent) {
      const bhkText = `${detectedBhk} BHK`;
      const intentText = detectedIntent === 'BUY' ? 'buy' : 'rent';
      const locText = detectedLocality ? ` in ${detectedLocality}` : ' in Coimbatore';
      const budgetText = detectedBudget 
        ? (detectedIntent === 'RENT' ? ` with a budget under ₹${detectedBudget.toLocaleString('en-IN')}/mo` : ` with a budget under ₹${(detectedBudget / 100000).toFixed(0)} Lakhs`)
        : '';

      botResponse = `Hello! I'm HavenMatch, your real estate assistant. It sounds like you're looking to ${intentText} a ${bhkText} ${detectedType}${locText}${budgetText}. I can certainly help you find matching properties!`;
      
      cta = {
        label: `View Matching ${bhkText} ${detectedIntent === 'BUY' ? 'Homes' : 'Rentals'}`,
        path: `/recommendations`
      };
    } else if (detectedLocality && !detectedBhk) {
      botResponse = `Great choice! ${detectedLocality} is one of Coimbatore's top residential zones. Are you looking to buy or rent, and how many bedrooms (1, 2, 3, or 4+ BHK) do you prefer?`;
    } else if (detectedIntent && !detectedBhk) {
      botResponse = `Got it, you want to ${detectedIntent === 'BUY' ? 'buy a home' : 'find a rental'} in Coimbatore. What bedroom configuration (1, 2, 3, or 4 BHK) and budget do you have in mind?`;
    } else {
      botResponse = `Hello! I'm HavenMatch, your real estate assistant. I can help you find verified homes and rentals across Coimbatore. Tell me your preferred BHK, location, or budget!`;
    }

    return {
      text: botResponse,
      criteria: {
        intent: detectedIntent,
        bhk: detectedBhk,
        locality: detectedLocality,
        budgetMax: detectedBudget,
        propertyType: detectedType
      },
      cta
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const messageText = (textToSend || inputValue).trim();
    if (!messageText) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate Agent execution latency (1.2s)
    setTimeout(() => {
      const processed = processUserQuery(messageText);

      // If extracted criteria exist, optionally synchronize with lifestyle context
      if (processed.criteria) {
        setRequirements(prev => ({
          ...prev,
          ...(processed.criteria.intent ? { intent: processed.criteria.intent } : {}),
          ...(processed.criteria.bhk ? { bhk: [processed.criteria.bhk] } : {}),
          ...(processed.criteria.budgetMax ? { budgetMax: processed.criteria.budgetMax } : {})
        }));
      }

      const botMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'bot',
        text: processed.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        extractedCriteria: processed.criteria,
        ctaAction: processed.cta
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1100);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <aside aria-label="AI Real Estate Assistant Chat" className="fixed bottom-5 right-5 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="group flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          title="Open AI Real Estate Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
          </div>
          <div className="text-left pr-1 hidden sm:block">
            <p className="text-xs font-black tracking-wide leading-none">AI Assistant</p>
            <p className="text-[10px] text-orange-100 font-medium leading-tight mt-0.5">Find home with AI</p>
          </div>
        </button>
      )}

      {/* Interactive Chat Window */}
      {isOpen && (
        <div
          className={`bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized 
              ? 'w-72 sm:w-80 h-16' 
              : 'w-[90vw] sm:w-[390px] h-[540px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-4 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold leading-none">AI Real Estate Assistant</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[11px] text-orange-100 mt-0.5 leading-tight">
                  Tell me what property you are looking for
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/80">
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body when not minimized */}
          {!isMinimized && (
            <>
              {/* Message History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60 text-left">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-orange-600 text-white rounded-br-xs shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-2xs'
                      }`}
                    >
                      {msg.text}

                      {/* CTA Action Button from Bot */}
                      {msg.ctaAction && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            navigate(msg.ctaAction!.path);
                          }}
                          className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-xs border border-orange-200 transition-colors cursor-pointer"
                        >
                          <Home className="w-3.5 h-3.5 text-orange-600" />
                          <span>{msg.ctaAction.label}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs bg-white border border-slate-200 px-3 py-2 rounded-2xl max-w-[160px] shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-spin" />
                    <span className="text-[11px] font-medium">Assistant thinking...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Starter Suggestions */}
              {messages.length <= 2 && (
                <div className="p-2.5 bg-white border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 text-left px-1">
                    Try asking:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {STARTER_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSendMessage(suggestion)}
                        className="text-[11px] font-semibold text-slate-600 hover:text-orange-700 bg-slate-100 hover:bg-orange-50 px-2.5 py-1 rounded-lg border border-slate-200/80 transition-all cursor-pointer"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Footer */}
              <div className="p-3 bg-white border-t border-slate-200">
                <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-3 py-2 border border-slate-200 focus-within:border-orange-500 focus-within:bg-white transition-all">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="e.g. 2BHK in Coimbatore under 50 lakhs"
                    className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim()}
                    className="p-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
                    title="Send message"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </aside>
  );
};
