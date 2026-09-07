import React from 'react';
import { Volume2, VolumeX, Sparkles, Box, Gamepad2, Wrench, ShieldCheck, Search, BookOpen, Compass, Radio, Flame, Award, Type } from 'lucide-react';
import { playTap, playSparkle } from '../utils/soundEffects';

export default function Navbar({
  currentTab,
  onTabChange,
  stars,
  bricks,
  streak = 1,
  isMuted,
  onToggleMute,
  onOpenWalkieTalkie,
  onOpenCertificate,
  childName = 'Deniz',
}) {
  const tabs = [
    { id: 'road', label: 'Map 🗺️', icon: Compass, color: 'bg-emerald-600 hover:bg-emerald-700', border: 'border-emerald-800' },
    { id: 'story', label: 'Story', icon: BookOpen, color: 'bg-purple-600 hover:bg-purple-700', border: 'border-purple-800' },
    { id: 'phonics', label: 'Phonics 🔤', icon: Type, color: 'bg-amber-500 hover:bg-amber-600', border: 'border-amber-700' },
    { id: 'differences', label: '7 Diff', icon: Search, color: 'bg-teal-600 hover:bg-teal-700', border: 'border-teal-800' },
    { id: 'balloons', label: 'Pop 🎈', icon: Sparkles, color: 'bg-rose-500 hover:bg-rose-600', border: 'border-rose-700' },
    { id: 'town', label: 'Town 🏙️', icon: Box, color: 'bg-indigo-600 hover:bg-indigo-700', border: 'border-indigo-800' },
    { id: 'workshop', label: 'Build', icon: Wrench, color: 'bg-blue-600 hover:bg-blue-700', border: 'border-blue-800' },
    { id: 'parent', label: 'Parents', icon: ShieldCheck, color: 'bg-slate-800 hover:bg-slate-700', border: 'border-slate-900' },
  ];

  const handleTabClick = (tabId) => {
    playTap(isMuted);
    onTabChange(tabId);
  };

  return (
    <header
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      className="sticky top-0 z-40 w-full bg-slate-900 text-white shadow-xl border-b-4 border-slate-950"
    >
      {/* Decorative Studs on Top Bar */}
      <div className="w-full h-2.5 bg-red-600 flex justify-around items-center px-2 overflow-hidden">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-red-400/80 border border-red-700 shadow-inner flex-shrink-0 mx-1"
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div
          onClick={() => handleTabClick('road')}
          className="flex items-center gap-2 cursor-pointer group flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-red-600 border-2 border-red-400 shadow-md flex items-center justify-center relative group-hover:rotate-6 transition-transform">
            <Box className="w-6 h-6 text-white" />
            <div className="absolute -top-1 left-2 w-2 h-2 rounded-full bg-red-300" />
            <div className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-red-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-xs sm:text-base tracking-wide text-yellow-400 drop-shadow-sm leading-tight flex items-center gap-1">
              {(childName || 'Deniz').toUpperCase()}'S LEGO ENGLISH
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-300 tracking-wider uppercase">
              {childName || 'Deniz'}'s Adventure
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Center - scrollable on tablet) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`
                  flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black font-display
                  transition-all duration-100 relative whitespace-nowrap cursor-pointer
                  ${isActive 
                    ? `${tab.color} text-white border-2 border-b-4 ${tab.border} translate-y-0.5 shadow-sm` 
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border-2 border-transparent'}
                `}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{tab.label}</span>
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rotate-45 rounded-xs" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Stats Counters, Walkie-Talkie & Audio Control */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          
          {/* Walkie-Talkie Action Button */}
          {onOpenWalkieTalkie && (
            <button
              onClick={() => {
                if (!isMuted) playSparkle();
                onOpenWalkieTalkie();
              }}
              className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-display font-black text-xs rounded-xl shadow-md border border-amber-500 transition transform active:scale-95 cursor-pointer"
              title="Open Leo's 2-Way Walkie Talkie"
            >
              <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-900 animate-pulse" />
              <span className="hidden sm:inline">Talk to Leo</span>
              <span className="sm:hidden">📻</span>
            </button>
          )}

          {/* Daily Streak Counter */}
          <div
            className="flex items-center gap-1 bg-orange-500/20 border-2 border-orange-400/60 rounded-xl px-2 py-1 text-orange-300 font-black text-xs shadow-inner"
            title="Daily Learning Streak"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 animate-pulse" />
            <span className="font-mono">{streak}d</span>
          </div>

          {/* Stars Counter */}
          <div
            className="flex items-center gap-1 bg-amber-500/20 border-2 border-amber-400/60 rounded-xl px-2 py-1 text-amber-300 font-black text-xs shadow-inner"
            title="Earned Stars"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="font-mono">{stars}</span>
          </div>

          {/* Bricks Counter */}
          <div
            className="flex items-center gap-1 bg-blue-500/20 border-2 border-blue-400/60 rounded-xl px-2 py-1 text-blue-300 font-black text-xs shadow-inner"
            title="Collectible Lego Bricks"
          >
            <span className="text-sm leading-none">🧱</span>
            <span className="font-mono">{bricks}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              playTap(isMuted);
              onToggleMute();
            }}
            className={`
              p-1.5 sm:p-2 rounded-xl border-2 transition-colors cursor-pointer
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
