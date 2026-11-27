import React, { useState, useEffect, useCallback } from 'react';
import { Lock, X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { playGentleWobble, playSuccessChime, playTap } from '../utils/soundEffects';

function createRandomMathPair() {
  return {
    a: Math.floor(Math.random() * 30) + 15, // 15 to 44
    b: Math.floor(Math.random() * 25) + 12, // 12 to 36
  };
}

function MathGateModalContent({ onClose, onSuccess, isMuted }) {
  const [nums, setNums] = useState(createRandomMathPair);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  const num1 = nums.a;
  const num2 = nums.b;

  const generateQuestion = () => {
    setNums(createRandomMathPair());
    setAnswer('');
    setError(false);
  };

  const expectedAnswer = num1 + num2;

  const handleKeyPress = useCallback((digit) => {
    playTap(isMuted);
    setAnswer((prev) => (prev.length < 3 ? prev + digit : prev));
    setError(false);
  }, [isMuted]);

  const handleBackspace = useCallback(() => {
    playTap(isMuted);
    setAnswer((prev) => prev.slice(0, -1));
    setError(false);
  }, [isMuted]);

  const handleSubmit = useCallback((e) => {
    if (e) e.preventDefault();
    if (parseInt(answer, 10) === expectedAnswer) {
      playSuccessChime(isMuted);
      onSuccess();
    } else {
      playGentleWobble(isMuted);
      setError(true);
      generateQuestion();
    }
  }, [answer, expectedAnswer, isMuted, onSuccess]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter' && answer) {
        handleSubmit();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [answer, handleBackspace, handleKeyPress, handleSubmit, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white rounded-3xl border-4 border-slate-800 shadow-2xl p-6 overflow-hidden">
        
        {/* Top Header Studs Accent */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-red-500 flex justify-around items-center px-4">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 border border-red-600" />
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 border border-red-600" />
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 border border-red-600" />
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 border border-red-600" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon & Title */}
        <div className="flex flex-col items-center text-center mt-2 mb-4">
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-2 border-2 border-amber-300 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold font-display text-slate-800">
            Parents Only: Mom Melis & Dad Ege 👨‍👩‍👦
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Solve this two-digit math puzzle to unlock the Parent Dashboard:
          </p>
        </div>

        {/* Math Challenge Display */}
        <div className="bg-slate-100 rounded-2xl p-4 border-2 border-slate-300 mb-4 flex items-center justify-between">
          <span className="text-3xl font-black font-display text-slate-800 tracking-wider">
            {num1} + {num2} = ?
          </span>
          <button
            type="button"
            onClick={() => {
              playTap(isMuted);
              generateQuestion();
            }}
            className="p-2 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
            title="New Question"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Answer Screen */}
        <div className="w-full bg-white border-2 border-slate-400 rounded-xl py-3 px-4 text-center mb-3">
          <span className="text-2xl font-bold font-mono text-slate-800 tracking-widest min-h-[32px] inline-block">
            {answer || <span className="text-slate-300">Tap or type digits</span>}
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 mb-3 justify-center">
            <AlertCircle className="w-4 h-4" />
            <span>Oops! Try this new question.</span>
          </div>
        )}

        {/* Number Keypad */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="py-2.5 text-xl font-bold bg-slate-50 hover:bg-slate-100 active:bg-slate-200 rounded-xl border border-b-2 border-slate-300 text-slate-800 transition-all active:translate-y-0.5"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleBackspace}
            className="py-2.5 text-sm font-bold bg-slate-100 hover:bg-slate-200 rounded-xl border border-b-2 border-slate-300 text-slate-600 active:translate-y-0.5"
          >
            ⌫
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress(0)}
            className="py-2.5 text-xl font-bold bg-slate-50 hover:bg-slate-100 rounded-xl border border-b-2 border-slate-300 text-slate-800 active:translate-y-0.5"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!answer}
            className="py-2.5 font-bold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl border border-b-2 border-emerald-700 flex items-center justify-center active:translate-y-0.5"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-700 text-center"
        >
          Cancel and return to game
        </button>

      </div>
    </div>
  );
}

export default function MathGateModal({ isOpen, onClose, onSuccess, isMuted }) {
  if (!isOpen) return null;
  return <MathGateModalContent onClose={onClose} onSuccess={onSuccess} isMuted={isMuted} />;
}
