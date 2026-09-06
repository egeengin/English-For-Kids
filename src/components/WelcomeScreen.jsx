import React from 'react';
import { Volume2, Sparkles, Play, Rocket, Star, Heart } from 'lucide-react';
import { unlockAudio } from '../utils/speech';
import { initAudioContext, playLegoSnap, playSuccessChime } from '../utils/soundEffects';

export default function WelcomeScreen({ onStart, isMuted }) {
  const handleStartAdventure = () => {
    // Unlock browser audio context & SpeechSynthesis on explicit user gesture
    unlockAudio();
    initAudioContext();
    playLegoSnap(isMuted);
    playSuccessChime(isMuted);
    onStart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border-4 sm:border-6 border-slate-900 shadow-2xl p-6 sm:p-10 text-center overflow-hidden">
        
        {/* Top Decorative Lego Studs Strip */}
        <div className="absolute top-0 left-0 right-0 h-4 sm:h-5 bg-red-600 flex justify-around items-center px-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400 border border-red-700 shadow-inner"
            />
          ))}
        </div>

        {/* Floating Lego Elements */}
        <div className="flex justify-center items-center gap-3 my-4">
          <div className="w-12 h-12 bg-yellow-400 border-2 border-yellow-600 rounded-2xl flex items-center justify-center shadow-md -rotate-6">
            <span className="text-2xl">🧱</span>
          </div>
          <div className="w-16 h-16 bg-red-600 border-2 border-red-800 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
            <Rocket className="w-9 h-9 text-white" />
          </div>
          <div className="w-12 h-12 bg-blue-600 border-2 border-blue-800 rounded-2xl flex items-center justify-center shadow-md rotate-6">
            <Star className="w-7 h-7 text-yellow-300 fill-yellow-300" />
          </div>
        </div>

        {/* Title & Welcome Copy */}
        <span className="inline-block px-4 py-1.5 bg-yellow-400 text-slate-950 font-display font-black text-xs sm:text-sm rounded-full tracking-wider uppercase mb-2 shadow-xs">
          Kids English Learning Game
        </span>

        <h1 className="text-3xl sm:text-5xl font-black font-display text-slate-900 leading-tight mb-2">
          LEGO ENGLISH <br />
          <span className="text-red-600">ADVENTURE</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 font-bold max-w-sm mx-auto mb-6">
          Listen to English words, collect colorful Lego bricks, and build awesome rockets and race cars! 🚀
        </p>

        {/* Big Touch-Friendly Start Adventure Button */}
        <button
          onClick={handleStartAdventure}
          className="
            w-full py-5 px-8 rounded-3xl font-display font-black text-xl sm:text-2xl
            bg-red-500 hover:bg-red-600 active:bg-red-700 text-white
            border-4 border-b-8 border-red-800 active:border-b-2 active:translate-y-1.5
            transition-all shadow-xl flex items-center justify-center gap-3
            animate-pulse-ring cursor-pointer select-none
          "
        >
          <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-yellow-300 text-yellow-300" />
          <span>START ADVENTURE! 🧱</span>
        </button>

        <p className="text-[11px] sm:text-xs text-slate-400 font-bold mt-4 flex items-center justify-center gap-1.5">
          <Volume2 className="w-4 h-4 text-emerald-500" />
          <span>Tap to unlock sound effects and English voice prompts!</span>
        </p>

      </div>
    </div>
  );
}
