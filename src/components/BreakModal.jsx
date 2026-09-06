import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Coffee, ArrowRight, Heart, Smile } from 'lucide-react';
import { playFanfare, playTap } from '../utils/soundEffects';

export default function BreakModal({
  isOpen,
  onContinue,
  isMuted,
  milestoneCount = 10,
}) {
  const [restSeconds, setRestSeconds] = useState(15);

  useEffect(() => {
    if (isOpen) {
      playFanfare(isMuted);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#FFD700', '#E52521', '#0055BF', '#237841'],
      });
      setRestSeconds(15);
    }
  }, [isOpen, isMuted]);

  useEffect(() => {
    if (!isOpen) return;
    if (restSeconds <= 0) return;
    const interval = setInterval(() => {
      setRestSeconds(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, restSeconds]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl border-4 sm:border-6 border-slate-900 shadow-2xl p-6 sm:p-8 text-center overflow-hidden">
        
        {/* Top Header Stud Strip */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-amber-400 flex justify-around items-center px-4">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-200 border border-amber-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-200 border border-amber-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-200 border border-amber-500" />
        </div>

        {/* Milestone Trophy Icon */}
        <div className="w-20 h-20 bg-amber-100 border-4 border-amber-400 rounded-3xl mx-auto flex items-center justify-center mb-3 shadow-md animate-bounce">
          <Trophy className="w-12 h-12 text-amber-500" />
        </div>

        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-display font-black text-xs rounded-full uppercase tracking-wider mb-2">
          Milestone Reached! 🌟
        </span>

        <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-800 leading-tight mb-2">
          Awesome Work, Builder!
        </h2>

        <p className="text-sm font-bold text-slate-600 max-w-xs mx-auto mb-4">
          You completed <span className="text-amber-600 font-black">{milestoneCount} questions</span>! Time for a quick stretch and water sip. 💧
        </p>

        {/* Break Tip Card */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 mb-6 text-left flex items-center gap-3">
          <span className="text-3xl">🧘‍♂️</span>
          <div className="text-xs text-amber-900 font-bold">
            <span className="font-black text-amber-950 block">Healthy Eyes & Hands:</span>
            Look out a window, stretch your fingers like a Lego minifigure, and take 3 deep breaths!
          </div>
        </div>

        {/* Rest Timer or Ready Button */}
        <div className="space-y-2">
          <button
            onClick={() => {
              playTap(isMuted);
              onContinue();
            }}
            className="
              w-full py-4 px-6 rounded-2xl font-display font-black text-lg
              bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white
              border-3 border-b-6 border-emerald-800 active:border-b-2 active:translate-y-1
              transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer
            "
          >
            <span>I'm Ready to Keep Playing! 🚀</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {restSeconds > 0 && (
            <p className="text-xs text-slate-400 font-bold">
              Suggested rest: {restSeconds}s
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
