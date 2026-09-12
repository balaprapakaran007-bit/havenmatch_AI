import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BackgroundTheme } from '../../types';
import { Palette, Check, Sparkles, Moon, Sun, Trees, Compass } from 'lucide-react';

interface ThemeOption {
  id: BackgroundTheme;
  name: string;
  badge: string;
  icon: React.ReactNode;
  bgPreview: string;
  orbPreview: string;
  textColor: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'sunset',
    name: 'Sunset Amber',
    badge: 'Signature',
    icon: <Sun className="w-4 h-4 text-orange-500" />,
    bgPreview: 'bg-amber-50',
    orbPreview: 'from-orange-500 via-amber-400 to-rose-400',
    textColor: 'text-orange-950'
  },
  {
    id: 'midnight',
    name: 'Midnight Luxury',
    badge: 'Dark PropTech',
    icon: <Moon className="w-4 h-4 text-violet-400" />,
    bgPreview: 'bg-slate-900',
    orbPreview: 'from-orange-500 via-violet-600 to-cyan-400',
    textColor: 'text-white'
  },
  {
    id: 'aurora',
    name: 'Aurora Dream',
    badge: 'Ethereal AI',
    icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
    bgPreview: 'bg-indigo-50',
    orbPreview: 'from-indigo-500 via-fuchsia-400 to-sky-400',
    textColor: 'text-indigo-950'
  },
  {
    id: 'emerald',
    name: 'Emerald Oasis',
    badge: 'Eco-Living',
    icon: <Trees className="w-4 h-4 text-emerald-500" />,
    bgPreview: 'bg-emerald-50',
    orbPreview: 'from-emerald-500 via-teal-400 to-amber-300',
    textColor: 'text-emerald-950'
  }
];

export const ThemeSwitcher: React.FC = () => {
  const { bgTheme, setBgTheme, showToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const currentThemeObj = THEME_OPTIONS.find((t) => t.id === bgTheme) || THEME_OPTIONS[0];

  const handleSelect = (id: BackgroundTheme, name: string) => {
    setBgTheme(id);
    setIsOpen(false);
    showToast(`Switched background theme to ${name}`);
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40">
      {/* Popover Panel */}
      {isOpen && (
        <>
          {/* Backdrop click dismiss */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs" 
            onClick={() => setIsOpen(false)} 
          />

          <div className="absolute bottom-14 right-0 z-50 w-72 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-700/80 rounded-2xl shadow-haven-lg animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Atmosphere Theme
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">HavenMatch Glow</span>
            </div>

            <div className="space-y-1.5">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = bgTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleSelect(theme.id, theme.name)}
                    className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-orange-50/90 dark:bg-slate-800/90 border border-orange-200/90 dark:border-orange-500/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200/60 dark:border-slate-700">
                        <div className={`absolute inset-0 bg-gradient-to-tr ${theme.orbPreview} opacity-85`} />
                        <div className="relative z-10 text-white drop-shadow-xs">
                          {theme.icon}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{theme.name}</span>
                          {theme.badge && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {theme.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Floating Pill Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-700/80 shadow-haven-md hover:shadow-haven-lg transition-all active:scale-95 text-slate-700 dark:text-slate-200"
        title="Customize Background Atmosphere"
      >
        <div className="relative w-5 h-5 rounded-full overflow-hidden flex items-center justify-center">
          <div className={`absolute inset-0 bg-gradient-to-tr ${currentThemeObj.orbPreview} animate-spin-slow`} />
          <div className="relative z-10 text-white drop-shadow-xs scale-75">
            {currentThemeObj.icon}
          </div>
        </div>

        <span className="text-xs font-bold tracking-tight hidden sm:inline">
          {currentThemeObj.name}
        </span>

        <span className="w-2 h-2 rounded-full bg-orange-500 group-hover:animate-ping" />
      </button>
    </div>
  );
};
