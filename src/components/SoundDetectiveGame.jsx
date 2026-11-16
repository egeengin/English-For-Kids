import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, CheckCircle2, Sparkles } from 'lucide-react';
import { speakEnglish } from '../utils/speech';
import { playStarSparkle, playGentleWobble, playTap } from '../utils/soundEffects';
import { recordMissedWord, recordMasteredWord } from '../utils/reviewTracker';

const SOUND_PAIRS = [
  { a: { word: 'Ship', emoji: '🚢' }, b: { word: 'Sheep', emoji: '🐑' } },
  { a: { word: 'Cat', emoji: '🐱' }, b: { word: 'Hat', emoji: '🎩' } },
  { a: { word: 'Pen', emoji: '🖊️' }, b: { word: 'Pin', emoji: '📌' } },
  { a: { word: 'Sun', emoji: '☀️' }, b: { word: 'Run', emoji: '🏃' } },
  { a: { word: 'Boat', emoji: '⛵' }, b: { word: 'Coat', emoji: '🧥' } },
  { a: { word: 'Bed', emoji: '🛏️' }, b: { word: 'Red', emoji: '🔴' } },
  { a: { word: 'Fox', emoji: '🦊' }, b: { word: 'Box', emoji: '📦' } },
  { a: { word: 'Dog', emoji: '🐶' }, b: { word: 'Frog', emoji: '🐸' } },
  { a: { word: 'Ball', emoji: '⚽' }, b: { word: 'Tall', emoji: '🦒' } },
  { a: { word: 'Cake', emoji: '🎂' }, b: { word: 'Snake', emoji: '🐍' } },
  { a: { word: 'Bee', emoji: '🐝' }, b: { word: 'Tree', emoji: '🌳' } },
  { a: { word: 'Star', emoji: '⭐' }, b: { word: 'Car', emoji: '🏎️' } },
  { a: { word: 'Bear', emoji: '🐻' }, b: { word: 'Pear', emoji: '🍐' } },
  { a: { word: 'Mouse', emoji: '🐭' }, b: { word: 'House', emoji: '🏠' } },
  { a: { word: 'King', emoji: '🤴' }, b: { word: 'Ring', emoji: '💍' } },
  { a: { word: 'Clock', emoji: '⏰' }, b: { word: 'Lock', emoji: '🔒' } },
  { a: { word: 'Train', emoji: '🚂' }, b: { word: 'Rain', emoji: '🌧️' } },
  { a: { word: 'Duck', emoji: '🦆' }, b: { word: 'Truck', emoji: '🚚' } },
  { a: { word: 'Moon', emoji: '🌙' }, b: { word: 'Spoon', emoji: '🥄' } },
  { a: { word: 'Plane', emoji: '✈️' }, b: { word: 'Crane', emoji: '🏗️' } },
];

export default function SoundDetectiveGame({ onRewardEarned, isMuted = false }) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [targetSide, setTargetSide] = useState(() => (Math.random() < 0.5 ? 'a' : 'b'));
  const [status, setStatus] = useState(null); // 'correct' | 'wrong' | null
  const [score, setScore] = useState(0);

  const pair = SOUND_PAIRS[roundIdx % SOUND_PAIRS.length];
  const target = pair[targetSide];

  const speakCurrentTarget = useCallback(() => {
    if (!isMuted && target) {
      speakEnglish(target.word);
    }
  }, [isMuted, target]);

  useEffect(() => {
    const t = setTimeout(() => {
      speakCurrentTarget();
    }, 300);
    return () => clearTimeout(t);
  }, [roundIdx, targetSide, speakCurrentTarget]);

  const nextRound = () => {
    setRoundIdx((i) => i + 1);
    setTargetSide(Math.random() < 0.5 ? 'a' : 'b');
    setStatus(null);
  };

  const handlePick = (side) => {
    if (status === 'correct') return;
    if (side === targetSide) {
      playStarSparkle(isMuted);
      setStatus('correct');
      setScore((s) => s + 1);
      recordMasteredWord(target.word, target.emoji);
      if (onRewardEarned) onRewardEarned(2);
      if ((score + 1) % 5 === 0) {
        confetti({ particleCount: 55, spread: 60, origin: { y: 0.65 } });
      }
      setTimeout(nextRound, 950);
    } else {
      playGentleWobble(isMuted);
      setStatus('wrong');
      recordMissedWord(target.word, target.emoji);
      if (!isMuted) {
        speakEnglish(`That is ${pair[side].word}. Find ${target.word}!`);
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 py-4">
      <div className="bg-white rounded-3xl shadow-xl border-4 border-sky-200 p-5 sm:p-8 text-center">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-2">
            <span>👂</span>
            <span>Sound Detective</span>
          </h2>
          <span className="px-3.5 py-1 rounded-full bg-sky-100 text-sky-900 font-black text-sm border border-sky-300">
            ⭐ Doğru: {score}
          </span>
        </div>

        <p className="text-sm sm:text-base font-bold text-slate-600 mb-5">
          Sesi dinle ve doğru balona dokun!
        </p>

        <button
          type="button"
          onClick={() => {
            playTap(isMuted);
            speakCurrentTarget();
          }}
          className="mb-6 px-6 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-display font-black text-lg shadow-md inline-flex items-center gap-2 cursor-pointer active:scale-95 transition"
        >
          <Volume2 className="w-6 h-6" />
          <span>Tekrar Dinle</span>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {['a', 'b'].map((side) => {
            const item = pair[side];
            const isWin = status === 'correct' && side === targetSide;
            return (
              <button
                key={side}
                type="button"
                onClick={() => handlePick(side)}
                className={`p-8 rounded-3xl border-4 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 shadow-md ${
                  isWin
                    ? 'bg-emerald-50 border-emerald-500 scale-105'
                    : 'bg-slate-50 hover:bg-sky-50 border-slate-200 hover:border-sky-400 active:scale-95'
                }`}
              >
                <span className="text-6xl sm:text-7xl leading-none">{item.emoji}</span>
                <span className="font-display font-black text-2xl sm:text-3xl text-slate-900">
                  {item.word}
                </span>
                {isWin && (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-black text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Harika! (+2 ⭐)</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {status === 'wrong' && (
          <div className="mt-4 inline-flex items-center gap-2 text-amber-800 bg-amber-100 px-4 py-2 rounded-xl font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Tekrar dinle ve doğru kelimeyi seç!</span>
          </div>
        )}
      </div>
    </div>
  );
}
