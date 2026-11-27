import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, CheckCircle2, Sparkles } from 'lucide-react';
import { speakEnglish } from '../utils/speech';
import { playSnap, playStarSparkle, playGentleWobble, playTap } from '../utils/soundEffects';

const PLACE_TASKS = [
  {
    prompt: 'Put the soccer ball UNDER the table!',
    objectEmoji: '⚽',
    targetSpot: 'under_table',
  },
  {
    prompt: 'Put the orange cat ON the sofa!',
    objectEmoji: '🐱',
    targetSpot: 'on_sofa',
  },
  {
    prompt: 'Put the teddy bear IN the box!',
    objectEmoji: '🧸',
    targetSpot: 'in_box',
  },
  {
    prompt: 'Put the puppy BEHIND the tree!',
    objectEmoji: '🐶',
    targetSpot: 'behind_tree',
  },
  {
    prompt: 'Put the shoes UNDER the chair!',
    objectEmoji: '👟',
    targetSpot: 'under_chair',
  },
];

const SPOTS = [
  { id: 'on_sofa', label: 'On the sofa', x: 18, y: 44, baseEmoji: '🛋️' },
  { id: 'under_table', label: 'Under the table', x: 48, y: 74, baseEmoji: '🪵' },
  { id: 'in_box', label: 'In the box', x: 73, y: 58, baseEmoji: '📦' },
  { id: 'behind_tree', label: 'Behind the tree', x: 30, y: 36, baseEmoji: '🌳' },
  { id: 'under_chair', label: 'Under the chair', x: 88, y: 74, baseEmoji: '🪑' },
];

export default function PutItThereGame({ onRewardEarned, isMuted = false }) {
  const [taskIdx, setTaskIdx] = useState(0);
  const [placedSpotId, setPlacedSpotId] = useState(null);
  const [score, setScore] = useState(0);

  const task = PLACE_TASKS[taskIdx % PLACE_TASKS.length];

  const speakTask = useCallback(() => {
    if (!isMuted && task) speakEnglish(task.prompt);
  }, [isMuted, task]);

  useEffect(() => {
    const t = setTimeout(speakTask, 300);
    return () => clearTimeout(t);
  }, [taskIdx, speakTask]);

  const handleSpotTap = (spot) => {
    if (placedSpotId) return;
    playSnap(isMuted);

    if (spot.id === task.targetSpot) {
      playStarSparkle(isMuted);
      setPlacedSpotId(spot.id);
      setScore((s) => s + 1);
      if (onRewardEarned) onRewardEarned(2);
      if ((score + 1) % 3 === 0) {
        confetti({ particleCount: 55, spread: 60, origin: { y: 0.65 } });
      }
      if (!isMuted) speakEnglish(`Great! ${spot.label}!`);
      setTimeout(() => {
        setTaskIdx((i) => i + 1);
        setPlacedSpotId(null);
      }, 1150);
    } else {
      playGentleWobble(isMuted);
      if (!isMuted) speakEnglish(`That is ${spot.label}. ${task.prompt}`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 py-4">
      <div className="bg-white rounded-3xl shadow-xl border-4 border-emerald-200 p-5 sm:p-7 text-center">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-2">
            <span>📦</span>
            <span>Put It There!</span>
          </h2>
          <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-sm border border-emerald-300">
            ⭐ Score: {score}
          </span>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap mb-4">
          <span className="text-4xl">{task.objectEmoji}</span>
          <p className="font-display font-black text-xl sm:text-2xl text-slate-900">
            {task.prompt}
          </p>
          <button
            type="button"
            onClick={() => {
              playTap(isMuted);
              speakTask();
            }}
            className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>Listen</span>
          </button>
        </div>

        {/* Interactive Room Backdrop */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-4 border-slate-200 bg-gradient-to-b from-sky-100 via-emerald-50 to-amber-100">
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-amber-200/70 border-t-4 border-amber-300" />
          {SPOTS.map((spot) => {
            const isPlacedHere = placedSpotId === spot.id;
            return (
              <button
                key={spot.id}
                type="button"
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                onClick={() => handleSpotTap(spot)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 px-4 py-3 rounded-2xl border-3 shadow-md transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  isPlacedHere
                    ? 'bg-emerald-100 border-emerald-500 scale-115 z-20'
                    : 'bg-white/95 hover:bg-yellow-50 border-dashed border-slate-400 hover:border-emerald-500 hover:scale-105'
                }`}
              >
                <span className="text-3xl sm:text-4xl leading-none">
                  {isPlacedHere ? task.objectEmoji : spot.baseEmoji}
                </span>
                <span className="font-display font-black text-xs sm:text-sm text-slate-800 whitespace-nowrap">
                  {spot.label}
                </span>
              </button>
            );
          })}
        </div>

        {placedSpotId && (
          <div className="mt-4 inline-flex items-center gap-2 text-emerald-700 font-black">
            <CheckCircle2 className="w-5 h-5" />
            <span>Great job! Right spot! (+2 ⭐)</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
        )}
      </div>
    </div>
  );
}
