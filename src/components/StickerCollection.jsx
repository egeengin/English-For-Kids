import React from 'react';
import { Lock, Volume2, Award } from 'lucide-react';
import { speakEnglish } from '../utils/speech';
import { playSnap } from '../utils/soundEffects';

const STICKER_BADGES = [
  { id: 'pilot', cost: 10, emoji: '👨‍✈️', title: 'Antalya Pilot', line: 'I can fly to Antalya!' },
  { id: 'dolphin', cost: 25, emoji: '🐬', title: 'Happy Dolphin', line: 'Dolphins swim fast in the sea!' },
  { id: 'dino', cost: 45, emoji: '🦖', title: 'Museum T-Rex', line: 'The giant dinosaur lives in the museum!' },
  { id: 'piano', cost: 70, emoji: '🎹', title: 'Piano Star', line: 'I play a happy song on the piano!' },
  { id: 'rocket', cost: 100, emoji: '🚀', title: 'Space Explorer', line: 'Three, two, one, blast off to space!' },
  { id: 'parrot', cost: 140, emoji: '🦜', title: 'Pirate Parrot', line: 'We found the gold treasure chest!' },
  { id: 'ferry', cost: 190, emoji: '⛴️', title: 'Bosphorus Captain', line: 'Seagulls fly next to our ferry in Istanbul!' },
  { id: 'party', cost: 250, emoji: '🎂', title: 'Ballorig Champion', line: 'Happy birthday party in Ballorig Kerkrade!' },
];

export default function StickerCollection({ bricks = 0, isMuted = false, childName = 'Deniz' }) {
  const unlockedCount = STICKER_BADGES.filter((b) => bricks >= b.cost).length;

  return (
    <div className="w-full max-w-4xl mx-auto px-3 py-4">
      <div className="bg-white rounded-3xl shadow-xl border-4 border-amber-200 p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
          <div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-2">
              <Award className="w-7 h-7 text-amber-500" />
              <span>{childName}&apos;s Sticker Album</span>
            </h2>
            <p className="text-sm font-bold text-slate-500">
              Yıldız/Tuğla kazandıkça yeni rozetler otomatik açılır! ({unlockedCount}/{STICKER_BADGES.length})
            </p>
          </div>
          <span className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-950 font-black text-sm border-2 border-amber-300">
            🧱 Puanın: {bricks}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STICKER_BADGES.map((badge) => {
            const isUnlocked = bricks >= badge.cost;
            return (
              <button
                key={badge.id}
                type="button"
                onClick={() => {
                  playSnap(isMuted);
                  if (!isMuted) {
                    speakEnglish(
                      isUnlocked
                        ? `${badge.title}! ${badge.line}`
                        : `Earn ${badge.cost} bricks to unlock ${badge.title}!`
                    );
                  }
                }}
                className={`p-5 rounded-3xl border-4 flex flex-col items-center text-center gap-2 transition cursor-pointer shadow-sm ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-amber-50 to-yellow-50 border-amber-400 hover:scale-105'
                    : 'bg-slate-100 border-slate-200 opacity-75 hover:opacity-95'
                }`}
              >
                <span className={`text-5xl leading-none ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                  {badge.emoji}
                </span>
                <div className="font-display font-black text-base text-slate-900 leading-tight">
                  {badge.title}
                </div>
                {isUnlocked ? (
                  <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Dinle</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-black text-slate-600 bg-slate-200 px-2.5 py-0.5 rounded-full">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{badge.cost} 🧱</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
