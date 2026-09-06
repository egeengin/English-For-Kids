import React from 'react';
import { Volume2, VolumeX, Sparkles, Box, Gamepad2, Wrench, ShieldCheck } from 'lucide-react';
import { playTap } from '../utils/soundEffects';

export default function Navbar({
  currentTab,
  onTabChange,
  stars,
  bricks,
  isMuted,
  onToggleMute,
}) {
  const tabs = [
    { id: 'arena', label: 'Play', icon: Gamepad2, color: 'bg-red-500 hover:bg-red-600', border: 'border-red-700' },
    { id: 'workshop', label: 'Workshop', icon: Wrench, color: 'bg-blue-600 hover:bg-blue-700', border: 'border-blue-800' },
    { id: 'parent', label: 'Parents', icon: ShieldCheck, color: 'bg-amber-500 hover:bg-amber-600', border: 'border-amber-700' },
  ];

  const handleTabClick = (tabId) => {
    playTap(isMuted);
    onTabChange(tabId);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 text-white shadow-xl border-b-4 border-slate-950">
      {/* Decorative Studs on Top Bar */}
      <div className="w-full h-2.5 bg-red-600 flex justify-around items-center px-2 overflow-hidden">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-red-400/80 border border-red-700 shadow-inner flex-shrink-0 mx-1"
          />
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div
          onClick={() => handleTabClick('arena')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-red-600 border-2 border-red-400 shadow-md flex items-center justify-center relative group-hover:rotate-6 transition-transform">
            <Box className="w-6 h-6 text-white" />
            <div className="absolute -top-1 left-2 w-2 h-2 rounded-full bg-red-300" />
            <div className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-red-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-lg sm:text-xl tracking-wide text-yellow-400 drop-shadow-sm leading-tight flex items-center gap-1">
              LEGO ENGLISH
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-300 tracking-wider uppercase">
              Kids Adventure
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Center) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-black font-display
                  transition-all duration-100 relative
                  ${isActive 
                    ? `${tab.color} text-white border-2 border-b-4 ${tab.border} translate-y-0.5 shadow-sm` 
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border-2 border-transparent'}
                `}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden xs:inline">{tab.label}</span>
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rotate-45 rounded-xs" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Stats Counters & Audio Control */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Stars Counter */}
          <div
            className="flex items-center gap-1.5 bg-amber-500/20 border-2 border-amber-400/60 rounded-xl px-2.5 py-1 text-amber-300 font-black text-xs sm:text-sm shadow-inner"
            title="Earned Stars"
          >
            <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
            <span className="font-mono">{stars}</span>
          </div>

          {/* Bricks Counter */}
          <div
            className="flex items-center gap-1.5 bg-blue-500/20 border-2 border-blue-400/60 rounded-xl px-2.5 py-1 text-blue-300 font-black text-xs sm:text-sm shadow-inner"
            title="Collectible Lego Bricks for Building"
          >
            <span className="text-base leading-none">🧱</span>
            <span className="font-mono">{bricks}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              playTap(isMuted);
              onToggleMute();
            }}
            className={`
              p-2 rounded-xl border-2 transition-colors
              ${isMuted 
                ? 'bg-red-950/60 border-red-500 text-red-400' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'}
            `}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label="Sound Settings"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
