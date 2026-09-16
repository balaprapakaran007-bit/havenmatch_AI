import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, BuyerIntent, UserSession, BackgroundTheme } from '../types';
import { shortlistService } from '../services/shortlistService';
import { callAPI } from '../services/api';

export type ViewType =
  | 'login'
  | 'landing'
  | 'role_selection'
  | 'requirements_wizard'
  | 'lifestyle_interview'
  | 'lifestyle_profile'
  | 'discover'
  | 'property_detail'
  | 'compare'
  | 'saved'
  | 'visits'
  | 'messages'
  | 'seller_portal'
  | 'seller_dashboard'
  | 'seller_add_property'
  | 'seller_buyers';

const SESSION_KEY = 'havenmatch_session';

function loadSession(): UserSession | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveSession(session: UserSession | null): void {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  buyerIntent: BuyerIntent;
  setBuyerIntent: (intent: BuyerIntent) => void;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  bgTheme: BackgroundTheme;
  setBgTheme: (theme: BackgroundTheme) => void;
  cycleBgTheme: () => void;
  userSession: UserSession | null;
  updateProfile: (profileData: Partial<UserSession>) => Promise<UserSession>;
  login: (data: {
    email: string;
    phone?: string;
    name?: string;
    password?: string;
    role?: UserRole;
    isSignUp?: boolean;
    isGoogle?: boolean;
  }) => Promise<void>;
  logout: () => void;
  selectedPropertyId: string | null;
  navigateToProperty: (propertyId: string) => void;
  savedPropertyIds: string[];
  toggleSaveProperty: (id: string) => void;
  isSaved: (id: string) => boolean;
  comparePropertyIds: string[];
  toggleCompareProperty: (id: string) => void;
  isCompared: (id: string) => boolean;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  openVisitModal: boolean;
  setOpenVisitModal: (open: boolean) => void;
  visitTargetPropertyId: string | null;
  setVisitTargetPropertyId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialSession = loadSession();

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userSession, setUserSession] = useState<UserSession | null>(() => initialSession);
  const [role, setRole] = useState<UserRole>(() => 
    (initialSession?.role === 'SELLER' || initialSession?.role === 'OWNER' ? 'SELLER' : 'BUYER')
  );
  const [buyerIntent, setBuyerIntent] = useState<BuyerIntent>('BUY');
  const [activeView, setActiveView] = useState<ViewType>('login');
  const [bgTheme, setBgThemeState] = useState<BackgroundTheme>(() => {
    try {
      const saved = localStorage.getItem('havenmatch_bg_theme');
      if (saved === 'sunset' || saved === 'midnight' || saved === 'aurora' || saved === 'emerald') {
        return saved;
      }
    } catch { /* ignore */ }
    return 'sunset';
  });

  const setBgTheme = (newTheme: BackgroundTheme) => {
    setBgThemeState(newTheme);
    try { localStorage.setItem('havenmatch_bg_theme', newTheme); } catch { /* ignore */ }
  };

  const cycleBgTheme = () => {
    const themes: BackgroundTheme[] = ['sunset', 'midnight', 'aurora', 'emerald'];
    const next = themes[(themes.indexOf(bgTheme) + 1) % themes.length];
    setBgTheme(next);
  };

  // ─── Shortlist — real service, starts from stored IDs ─────────────────
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>(
    () => shortlistService.getShortlistedIds()
  );

  const [comparePropertyIds, setComparePropertyIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [openVisitModal, setOpenVisitModal] = useState<boolean>(false);
  const [visitTargetPropertyId, setVisitTargetPropertyId] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const login = async (data: {
    email: string;
    phone?: string;
    name?: string;
    password?: string;
    role?: UserRole;
    isSignUp?: boolean;
    isGoogle?: boolean;
  }) => {
    const selectedRole = data.role || role;
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const cleanPhone = (data.phone || '').trim();

    if (!cleanEmail && !cleanPhone) {
      throw new Error('Please enter a valid email address or mobile number.');
    }

    const action = data.isGoogle
      ? 'auth/google'
      : (data.isSignUp ? 'auth/register' : 'auth/login');

    const payload = {
      email: cleanEmail,
      phone: cleanPhone,
      name: data.name?.trim(),
      password: data.password,
      role: selectedRole
    };

    const res = await callAPI<any>(action, payload);

    if (!res || res.success === false) {
      throw new Error(res?.error || 'Authentication failed. Please verify your credentials.');
    }

    const rawUser = res.user || res.data?.user;
    const token = res.token || res.data?.token;

    if (!rawUser || !token || (!rawUser.userId && !rawUser.id)) {
      throw new Error(res?.error || 'Authentication failed. Invalid user identity returned from server.');
    }

    const userId = rawUser.userId || rawUser.id;
    const userEmail = rawUser.email || cleanEmail;
    const userPhone = rawUser.phone || cleanPhone || '';
    const userName =
      rawUser.name?.trim() ||
      rawUser.fullName?.trim() ||
      data.name?.trim() ||
      (cleanEmail ? cleanEmail.split('@')[0] : 'HavenMatch User');

    const userRoleStr = (rawUser.role || selectedRole || 'BUYER').toUpperCase();
    const realRole: UserRole = (userRoleStr === 'SELLER' || userRoleStr === 'OWNER') ? 'SELLER' : 'BUYER';

    const authenticatedSession: UserSession = {
      id: userId,
      userId: userId,
      token: token,
      email: userEmail,
      phone: userPhone,
      name: userName,
      role: realRole,
      isLoggedIn: true,
    };

    setUserSession(authenticatedSession);
    saveSession(authenticatedSession);
    setRole(realRole);

    if (realRole === 'SELLER') {
      setActiveView('seller_portal');
    } else {
      setActiveView('landing');
    }
  };

  const updateProfile = async (profileData: Partial<UserSession>): Promise<UserSession> => {
    const current = userSession || loadSession();
    if (!current) throw new Error('No user session active.');

    const targetUserId = current.id || current.userId;
    const res = await callAPI<{ success: boolean; user: UserSession }>('auth/update-profile', {
      userId: targetUserId,
      email: current.email,
      ...profileData
    });

    const updatedUser: UserSession = {
      ...current,
      ...(res?.user || {}),
      ...profileData,
      isLoggedIn: true
    };

    setUserSession(updatedUser);
    saveSession(updatedUser);
    return updatedUser;
  };

  const logout = () => {
    setUserSession(null);
    saveSession(null);
    setActiveView('login');
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView, selectedPropertyId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const navigateToProperty = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setActiveView('property_detail');
  };

  const toggleSaveProperty = (id: string) => {
    const userId = userSession?.email || 'guest';
    if (savedPropertyIds.includes(id)) {
      shortlistService.removeFromShortlist(userId, id);
      setSavedPropertyIds(prev => prev.filter(item => item !== id));
      showToast('Property removed from saved collection');
    } else {
      shortlistService.addToShortlist(userId, id);
      setSavedPropertyIds(prev => [...prev, id]);
      showToast('Property saved to your lifestyle matches');
    }
  };

  const isSaved = (id: string) => savedPropertyIds.includes(id);

  const toggleCompareProperty = (id: string) => {
    setComparePropertyIds(prev => {
      if (prev.includes(id)) {
        showToast('Removed from comparison');
        return prev.filter(item => item !== id);
      } else {
        if (prev.length >= 3) {
          showToast('You can compare up to 3 properties side-by-side');
          return prev;
        }
        showToast('Added to comparison deck');
        return [...prev, id];
      }
    });
  };

  const isCompared = (id: string) => comparePropertyIds.includes(id);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        buyerIntent,
        setBuyerIntent,
        activeView,
        setActiveView,
        bgTheme,
        setBgTheme,
        cycleBgTheme,
        userSession,
        updateProfile,
        login,
        logout,
        selectedPropertyId,
        navigateToProperty,
        savedPropertyIds,
        toggleSaveProperty,
        isSaved,
        comparePropertyIds,
        toggleCompareProperty,
        isCompared,
        toastMessage,
        showToast,
        openVisitModal,
        setOpenVisitModal,
        visitTargetPropertyId,
        setVisitTargetPropertyId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
