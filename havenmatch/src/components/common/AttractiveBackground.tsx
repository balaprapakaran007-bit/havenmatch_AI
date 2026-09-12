import React from 'react';
import { BackgroundTheme } from '../../types';

interface AttractiveBackgroundProps {
  theme?: BackgroundTheme;
}

export const AttractiveBackground: React.FC<AttractiveBackgroundProps> = ({ theme = 'sunset' }) => {
  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10 transition-colors duration-700"
    >
      {/* 1. Base Gradient Canvas */}
      {theme === 'sunset' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF9] via-[#FAF8F5] to-[#F5F2EC]" />
      )}
      {theme === 'midnight' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#080C14] via-[#0C101D] to-[#060910]" />
      )}
      {theme === 'aurora' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8FF] via-[#F5F2FC] to-[#EDE9F8]" />
      )}
      {theme === 'emerald' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#F7FAF8] via-[#F2F7F4] to-[#E9F3EC]" />
      )}

      {/* 2. Fluid Animated Ambient Aurora Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Theme: SUNSET AMBER */}
        {theme === 'sunset' && (
          <>
            {/* Top-Left: Warm Sunset Orange */}
            <div 
              className="haven-blob haven-blob-1 absolute -top-32 -left-32 w-[620px] h-[620px] rounded-full bg-gradient-to-tr from-orange-400/25 via-amber-300/20 to-orange-200/10 blur-[100px]"
            />
            {/* Top-Right: Golden Amber Glow */}
            <div 
              className="haven-blob haven-blob-2 absolute top-10 -right-28 w-[580px] h-[580px] rounded-full bg-gradient-to-bl from-amber-400/20 via-orange-300/15 to-rose-200/10 blur-[110px]"
            />
            {/* Center-Floating: Soft Coral & Rose */}
            <div 
              className="haven-blob haven-blob-3 absolute top-1/3 left-1/4 w-[520px] h-[520px] rounded-full bg-gradient-to-r from-rose-400/12 via-orange-200/10 to-amber-200/10 blur-[120px]"
            />
            {/* Bottom-Right: Warm Twilight Lavender Accent */}
            <div 
              className="haven-blob haven-blob-1 absolute -bottom-40 right-10 w-[640px] h-[640px] rounded-full bg-gradient-to-tl from-orange-300/20 via-amber-200/15 to-indigo-200/8 blur-[110px]"
            />
          </>
        )}

        {/* Theme: MIDNIGHT HAVEN */}
        {theme === 'midnight' && (
          <>
            {/* Top-Left: Electric Neon Orange Flare */}
            <div 
              className="haven-blob haven-blob-1 absolute -top-28 -left-28 w-[640px] h-[640px] rounded-full bg-gradient-to-tr from-orange-600/35 via-amber-600/25 to-transparent blur-[110px]"
            />
            {/* Top-Right: Cyber Violet Nebula */}
            <div 
              className="haven-blob haven-blob-2 absolute top-4 -right-24 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-violet-600/30 via-indigo-700/20 to-transparent blur-[120px]"
            />
            {/* Center: Radiant Cyan Glow */}
            <div 
              className="haven-blob haven-blob-3 absolute top-1/2 left-1/3 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-600/15 to-transparent blur-[130px]"
            />
            {/* Bottom-Right: Deep Amber Ember */}
            <div 
              className="haven-blob haven-blob-1 absolute -bottom-36 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-orange-500/25 via-amber-700/15 to-transparent blur-[110px]"
            />
          </>
        )}

        {/* Theme: AURORA DREAM */}
        {theme === 'aurora' && (
          <>
            {/* Top-Left: Mystic Indigo */}
            <div 
              className="haven-blob haven-blob-1 absolute -top-32 -left-24 w-[620px] h-[620px] rounded-full bg-gradient-to-tr from-indigo-400/25 via-violet-300/20 to-transparent blur-[105px]"
            />
            {/* Top-Right: Fuchsia Radiance */}
            <div 
              className="haven-blob haven-blob-2 absolute top-12 -right-28 w-[580px] h-[580px] rounded-full bg-gradient-to-bl from-fuchsia-400/20 via-pink-300/15 to-transparent blur-[115px]"
            />
            {/* Center: Sky Cyan Aura */}
            <div 
              className="haven-blob haven-blob-3 absolute top-1/3 left-1/3 w-[520px] h-[520px] rounded-full bg-gradient-to-r from-sky-400/18 via-teal-300/12 to-transparent blur-[125px]"
            />
            {/* Bottom-Right: Lavender Twilight */}
            <div 
              className="haven-blob haven-blob-1 absolute -bottom-40 right-10 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-violet-400/20 via-indigo-300/15 to-transparent blur-[110px]"
            />
          </>
        )}

        {/* Theme: EMERALD OASIS */}
        {theme === 'emerald' && (
          <>
            {/* Top-Left: Emerald Botanic */}
            <div 
              className="haven-blob haven-blob-1 absolute -top-32 -left-28 w-[620px] h-[620px] rounded-full bg-gradient-to-tr from-emerald-400/25 via-teal-300/20 to-transparent blur-[105px]"
            />
            {/* Top-Right: Sunlit Amber Honey */}
            <div 
              className="haven-blob haven-blob-2 absolute top-10 -right-24 w-[580px] h-[580px] rounded-full bg-gradient-to-bl from-amber-400/20 via-yellow-200/15 to-transparent blur-[115px]"
            />
            {/* Center: Coastal Mint Breeze */}
            <div 
              className="haven-blob haven-blob-3 absolute top-1/3 left-1/4 w-[540px] h-[540px] rounded-full bg-gradient-to-r from-teal-400/15 via-emerald-200/12 to-transparent blur-[125px]"
            />
            {/* Bottom-Right: Fresh Leaf Gold */}
            <div 
              className="haven-blob haven-blob-1 absolute -bottom-36 right-8 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-emerald-400/20 via-lime-300/12 to-transparent blur-[110px]"
            />
          </>
        )}
      </div>

      {/* 3. Architectural Real Estate Blueprint / Dot Matrix Grid */}
      <div 
        className="absolute inset-0 haven-grid-mask"
        style={{
          backgroundImage: theme === 'midnight'
            ? `radial-gradient(circle, rgba(255, 255, 255, 0.08) 1.2px, transparent 1.2px)`
            : theme === 'emerald'
            ? `radial-gradient(circle, rgba(16, 185, 129, 0.10) 1.2px, transparent 1.2px)`
            : theme === 'aurora'
            ? `radial-gradient(circle, rgba(99, 102, 241, 0.10) 1.2px, transparent 1.2px)`
            : `radial-gradient(circle, rgba(234, 88, 12, 0.09) 1.2px, transparent 1.2px)`,
          backgroundSize: '28px 28px',
          backgroundPosition: '0 0'
        }}
      />

      {/* 4. Subtle Telemetry Crosshairs & Coordinate Accents */}
      <div className="absolute inset-0 hidden sm:block pointer-events-none opacity-40">
        {/* Coordinates top right */}
        <div className={`absolute top-20 right-12 text-[10px] font-mono tracking-widest ${theme === 'midnight' ? 'text-orange-400/40' : 'text-orange-600/30'}`}>
          11.0168° N • 76.9558° E [CBE]
        </div>

        {/* Crosshair 1 */}
        <div className={`absolute top-48 left-16 text-xs font-mono select-none ${theme === 'midnight' ? 'text-slate-500/40' : 'text-slate-400/30'}`}>
          +
        </div>

        {/* Crosshair 2 */}
        <div className={`absolute top-96 right-24 text-xs font-mono select-none ${theme === 'midnight' ? 'text-slate-500/40' : 'text-slate-400/30'}`}>
          +
        </div>

        {/* Micro Telemetry Pill */}
        <div className={`absolute bottom-32 left-12 text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full border select-none ${
          theme === 'midnight' 
            ? 'border-white/10 text-slate-400/40 bg-white/5' 
            : 'border-orange-200/40 text-orange-700/40 bg-orange-50/20'
        }`}>
          SATELLITE TELEMETRY ACTIVE
        </div>
      </div>

      {/* 5. Top Horizon Ambient Light Flare */}
      <div 
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-32 blur-3xl opacity-60 ${
          theme === 'midnight'
            ? 'bg-gradient-to-b from-orange-500/20 to-transparent'
            : theme === 'aurora'
            ? 'bg-gradient-to-b from-indigo-300/30 to-transparent'
            : theme === 'emerald'
            ? 'bg-gradient-to-b from-emerald-300/30 to-transparent'
            : 'bg-gradient-to-b from-orange-300/30 via-amber-200/20 to-transparent'
        }`}
      />
    </div>
  );
};
