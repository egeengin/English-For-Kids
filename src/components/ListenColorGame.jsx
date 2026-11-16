import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, CheckCircle2, Sparkles } from 'lucide-react';
import { speakEnglish } from '../utils/speech';
import { playSnap, playStarSparkle, playGentleWobble, playTap } from '../utils/soundEffects';

const COLORS = [
  { id: 'red', name: 'Red', hex: '#ef4444', ring: 'ring-red-400', bg: 'bg-red-500' },
  { id: 'blue', name: 'Blue', hex: '#3b82f6', ring: 'ring-blue-400', bg: 'bg-blue-500' },
  { id: 'yellow', name: 'Yellow', hex: '#facc15', ring: 'ring-yellow-400', bg: 'bg-yellow-400' },
  { id: 'green', name: 'Green', hex: '#22c55e', ring: 'ring-green-400', bg: 'bg-emerald-500' },
  { id: 'purple', name: 'Purple', hex: '#a855f7', ring: 'ring-purple-400', bg: 'bg-purple-500' },
];

const CHALLENGES = [
  {
    prompt: 'Color the car red!',
    targetObject: 'car',
    targetColor: 'red',
    objects: [
      { id: 'car', name: 'Car', emoji: '🚗' },
      { id: 'duck', name: 'Duck', emoji: '🦆' },
      { id: 'hat', name: 'Hat', emoji: '🎩' },
      { id: 'ball', name: 'Ball', emoji: '⚽' },
    ],
  },
  {
    prompt: 'Color the elephant blue!',
    targetObject: 'elephant',
    targetColor: 'blue',
    objects: [
      { id: 'elephant', name: 'Elephant', emoji: '🐘' },
      { id: 'banana', name: 'Banana', emoji: '🍌' },
      { id: 'book', name: 'Book', emoji: '📘' },
      { id: 'kite', name: 'Kite', emoji: '🪁' },
    ],
  },
  {
    prompt: 'Color the umbrella yellow!',
    targetObject: 'umbrella',
    targetColor: 'yellow',
    objects: [
      { id: 'umbrella', name: 'Umbrella', emoji: '☔' },
      { id: 'rocket', name: 'Rocket', emoji: '🚀' },
      { id: 'apple', name: 'Apple', emoji: '🍎' },
      { id: 'boat', name: 'Boat', emoji: '⛵' },
    ],
  },
  {
    prompt: 'Color the dinosaur green!',
    targetObject: 'dino',
    targetColor: 'green',
    objects: [
      { id: 'dino', name: 'Dinosaur', emoji: '🦖' },
      { id: 'cake', name: 'Cake', emoji: '🎂' },
      { id: 'bus', name: 'Bus', emoji: '🚌' },
      { id: 'cat', name: 'Cat', emoji: '🐱' },
    ],
  },
  {
    prompt: 'Color the backpack purple!',
    targetObject: 'backpack',
    targetColor: 'purple',
    objects: [
      { id: 'backpack', name: 'Backpack', emoji: '🎒' },
      { id: 'guitar', name: 'Guitar', emoji: '🎸' },
      { id: 'fish', name: 'Fish', emoji: '🐠' },
      { id: 'clock', name: 'Clock', emoji: '⏰' },
    ],
  },
];

export default function ListenColorGame({ onRewardEarned, isMuted = false }) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState('red');
  const [coloredMap, setColoredMap] = useState({});
  const [solved, setSolved] = useState(false);
  const [score, setScore] = useState(0);

  const challenge = CHALLENGES[roundIdx % CHALLENGES.length];

  const speakPrompt = useCallback(() => {
    if (!isMuted && challenge) speakEnglish(challenge.prompt);
  }, [isMuted, challenge]);

  useEffect(() => {
    const t = setTimeout(speakPrompt, 300);
    return () => clearTimeout(t);
  }, [roundIdx, speakPrompt]);

  const handleObjectTap = (obj) => {
    if (solved) return;
    playSnap(isMuted);

    if (obj.id === challenge.targetObject && selectedColor === challenge.targetColor) {
      playStarSparkle(isMuted);
      setColoredMap((prev) => ({ ...prev, [obj.id]: selectedColor }));
      setSolved(true);
      setScore((s) => s + 1);
      if (onRewardEarned) onRewardEarned(2);
      if ((score + 1) % 3 === 0) {
        confetti({ particleCount: 55, spread: 60, origin: { y: 0.65 } });
      }
      if (!isMuted) speakEnglish(`Awesome! ${selectedColor} ${obj.name}!`);
      setTimeout(() => {
        setRoundIdx((i) => i + 1);
        setColoredMap({});
        setSolved(false);
      }, 1050);
    } else {
      playGentleWobble(isMuted);
      if (!isMuted) {
        speakEnglish(`Try again! ${challenge.prompt}`);
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 py-4">
      <div className="bg-white rounded-3xl shadow-xl border-4 border-pink-200 p-5 sm:p-7 text-center">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-2">
            <span>🎨</span>
            <span>Listen &amp; Color</span>
          </h2>
          <span className="px-3.5 py-1 rounded-full bg-pink-100 text-pink-900 font-black text-sm border border-pink-300">
            ⭐ Doğru: {score}
          </span>
        </div>

        <p className="font-display font-black text-xl sm:text-3xl text-slate-900 mb-3">
          {challenge.prompt}
        </p>

        <button
          type="button"
          onClick={() => {
            playTap(isMuted);
            speakPrompt();
          }}
          className="mb-5 px-5 py-2 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-display font-black text-sm sm:text-base shadow-sm inline-flex items-center gap-2 cursor-pointer"
        >
          <Volume2 className="w-5 h-5" />
          <span>Dinle</span>
        </button>

        {/* Color Palette */}
        <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
          {COLORS.map((c) => {
            const isActive = selectedColor === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  playTap(isMuted);
                  setSelectedColor(c.id);
                  if (!isMuted) speakEnglish(c.name);
                }}
                className={`px-4 py-2 rounded-2xl font-display font-black text-sm text-white shadow-md cursor-pointer transition flex items-center gap-2 ${c.bg} ${
                  isActive ? `scale-110 ring-4 ${c.ring} border-2 border-white` : 'opacity-85 hover:opacity-100'
                }`}
              >
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* 4 Objects Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {challenge.objects.map((obj) => {
            const appliedColorId = coloredMap[obj.id];
            const colorObj = COLORS.find((c) => c.id === appliedColorId);
            return (
              <button
                key={obj.id}
                type="button"
                onClick={() => handleObjectTap(obj)}
                style={colorObj ? { backgroundColor: `${colorObj.hex}22`, borderColor: colorObj.hex } : undefined}
                className={`p-6 rounded-3xl border-4 flex flex-col items-center gap-2 cursor-pointer transition shadow-sm ${
                  colorObj
                    ? 'scale-105'
                    : 'bg-slate-50 hover:bg-pink-50 border-slate-200 hover:border-pink-300'
                }`}
              >
                <span className="text-5xl sm:text-6xl leading-none">{obj.emoji}</span>
                <span className="font-display font-black text-lg text-slate-900">{obj.name}</span>
              </button>
            );
          })}
        </div>

        {solved && (
          <div className="mt-4 inline-flex items-center gap-2 text-emerald-700 font-black">
            <CheckCircle2 className="w-5 h-5" />
            <span>Harika boyadın! (+2 ⭐)</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
        )}
      </div>
    </div>
  );
}
