import React from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Award,
  Calendar,
  Star,
  Radio,
} from 'lucide-react';
import { playTap } from '../utils/soundEffects';

export default function Navbar({
  currentTab,
  onTabChange,
  stars = 0,
  dailyGoalCount = 0,
  isMuted = false,
  onToggleMute,
  onOpenPrintable: _onOpenPrintable,
  onOpenWalkieTalkie,
  childName = 'Deniz',
}) {
  const tabs = [
    { id: 'daily', label: '📅 Günlük', icon: Calendar, activeClass: 'bg-emerald-600 text-white border-emerald-800' },
    { id: 'story', label: '📖 Hikaye', icon: BookOpen, activeClass: 'bg-purple-600 text-white border-purple-800' },
    { id: 'games', label: '🎮 Oyunlar', icon: Sparkles, activeClass: 'bg-rose-500 text-white border-rose-700' },
    { id: 'discovery', label: '⭐ Test', icon: Award, activeClass: 'bg-blue-600 text-white border-blue-800' },
  ];

  const handleTabClick = (tabId) => {
    playTap(isMuted);
    onTabChange(tabId);
  };

  return (
    <header
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      className="sticky top-0 z-40 w-full bg-white text-slate-900 shadow-sm border-b-2 border-slate-200 print:hidden"
    >
      <div className="w-full max-w-none px-3 sm:px-6 lg:px-10 py-3 space-y-2.5">
        {/* Top Row: Simple Brand + Quick Actions */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => handleTabClick('discovery')}
            className="flex items-center gap-2 cursor-pointer text-left"
          >
            <span className="text-2xl">🌟</span>
            <span className="font-display font-black text-base sm:text-xl text-slate-900">
              {childName}’in İngilizce Dünyası
            </span>
          </button>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 rounded-xl px-2.5 py-1 font-black text-xs border ${
                dailyGoalCount >= 10
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-sky-50 border-sky-200 text-sky-800'
              }`}
              title="Günlük 10 Dakika Hedefi"
            >
              <span>🎯 {Math.min(dailyGoalCount, 10)}/10{dailyGoalCount >= 10 ? ' ✓' : ''}</span>
            </div>

            <div
              className="flex items-center gap-1 bg-amber-50 border border-amber-300 rounded-xl px-2.5 py-1 text-amber-800 font-black text-xs"
              title="Kazanılan Yıldızlar"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>{stars}</span>
            </div>

            {onOpenWalkieTalkie && (
              <button
                type="button"
                onClick={() => {
                  playTap(isMuted);
                  onOpenWalkieTalkie();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-black text-xs sm:text-sm shadow-sm border border-amber-500 cursor-pointer transition"
              >
                <Radio className="w-4 h-4 text-slate-900" />
                <span>🎙️ Leo ile Konuş</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                playTap(isMuted);
                onToggleMute();
              }}
              className={`p-1.5 rounded-xl border transition cursor-pointer ${
                isMuted
                  ? 'bg-rose-50 border-rose-300 text-rose-600'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
              aria-label="Ses Ayarı"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('parent')}
              className={`p-1.5 rounded-xl border transition cursor-pointer ${
                currentTab === 'parent'
                  ? 'bg-slate-900 text-white border-slate-950'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
              title="Ebeveyn Paneli"
              aria-label="Ebeveyn Paneli"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Row: Always visible on all screen sizes */}
        <nav className="flex items-center gap-2 overflow-x-auto pb-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.id === 'games'
                ? ['games', 'balloons', 'phonics', 'differences', 'memory', 'sound_pairs', 'rhymes', 'questions', 'quick_speak', 'smart_review', 'listen_color', 'put_it', 'collection'].includes(currentTab)
                : tab.id === 'story'
                ? currentTab === 'story' || currentTab === 'books'
                : currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm md:text-base font-display font-black whitespace-nowrap border-2 transition cursor-pointer ${
                  isActive
                    ? tab.activeClass
                    : 'bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
