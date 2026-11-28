import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, CheckCircle2, Sparkles } from 'lucide-react';
import { speakEnglish, stopSpeech, unlockAudio } from '../utils/speech';
import { playSnap, playStarSparkle, playGentleWobble, playTap, playVictoryFanfare } from '../utils/soundEffects';

const PLACE_TASKS = [
  {
    id: 'ball_under_table',
    prompt: 'Put the soccer ball UNDER the table!',
    objectEmoji: '⚽',
    objectName: 'soccer ball',
    targetSpot: 'under_table',
  },
  {
    id: 'cat_on_sofa',
    prompt: 'Put the cat ON the sofa!',
    objectEmoji: '🐱',
    objectName: 'cat',
    targetSpot: 'on_sofa',
  },
  {
    id: 'bear_in_box',
    prompt: 'Put the teddy bear IN the box!',
    objectEmoji: '🧸',
    objectName: 'teddy bear',
    targetSpot: 'in_box',
  },
  {
    id: 'dog_behind_tree',
    prompt: 'Put the puppy BEHIND the tree!',
    objectEmoji: '🐶',
    objectName: 'puppy',
    targetSpot: 'behind_tree',
  },
  {
    id: 'apple_on_table',
    prompt: 'Put the apple ON the table!',
    objectEmoji: '🍎',
    objectName: 'apple',
    targetSpot: 'on_table',
  },
  {
    id: 'shoes_under_chair',
    prompt: 'Put the shoes UNDER the chair!',
    objectEmoji: '👟',
    objectName: 'shoes',
    targetSpot: 'under_chair',
  },
];

// Spatial drop/tap zones aligned with the SVG room/garden scene (400x260 viewBox -> %)
// No preposition text labels shown on the zones so the child truly thinks about IN/ON/UNDER/BEHIND!
const SPOTS = [
  { id: 'on_sofa', spoken: 'on the sofa', x: 18, y: 50, behind: false },
  { id: 'behind_tree', spoken: 'behind the tree', x: 40, y: 40, behind: true },
  { id: 'on_table', spoken: 'on the table', x: 58, y: 49, behind: false },
  { id: 'under_table', spoken: 'under the table', x: 58, y: 74, behind: false },
  { id: 'in_box', spoken: 'in the box', x: 80, y: 57, behind: false },
  { id: 'under_chair', spoken: 'under the chair', x: 88, y: 78, behind: false },
];

export default function PutItThereGame({ onRewardEarned, isMuted = false }) {
  const [taskIdx, setTaskIdx] = useState(0);
  const [placedSpotId, setPlacedSpotId] = useState(null);
  const [wrongSpotId, setWrongSpotId] = useState(null);
  const [score, setScore] = useState(0);
  const advanceTimerRef = useRef(null);
  const wrongTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
      stopSpeech();
    };
  }, []);

  const task = PLACE_TASKS[taskIdx % PLACE_TASKS.length];

  const speakTask = useCallback(() => {
    if (!isMuted && task) speakEnglish(task.prompt);
  }, [isMuted, task]);

  useEffect(() => {
    const t = setTimeout(speakTask, 280);
    return () => clearTimeout(t);
  }, [taskIdx, speakTask]);

  const handleSpotSelect = (spot) => {
    if (placedSpotId) return;
    unlockAudio();
    playSnap(isMuted);

    if (spot.id === task.targetSpot) {
      playStarSparkle(isMuted);
      setPlacedSpotId(spot.id);
      setWrongSpotId(null);
      const nextScore = score + 1;
      setScore(nextScore);
      if (onRewardEarned) onRewardEarned({ stars: 2, bricks: 1, gameName: 'Put It There!' });
      if (nextScore % PLACE_TASKS.length === 0) {
        playVictoryFanfare(isMuted);
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      }
      if (!isMuted) speakEnglish(`Great! The ${task.objectName} is ${spot.spoken}!`);
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = setTimeout(() => {
        setTaskIdx((i) => i + 1);
        setPlacedSpotId(null);
      }, 1350);
    } else {
      playGentleWobble(isMuted);
      setWrongSpotId(spot.id);
      if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
      wrongTimerRef.current = setTimeout(() => setWrongSpotId(null), 650);
      if (!isMuted) speakEnglish(`Oops! That is ${spot.spoken}. ${task.prompt}`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 py-4">
      <div className="bg-white rounded-3xl shadow-xl border-4 border-teal-200 p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-2">
            <span>📦</span>
            <span>Put It There!</span>
          </h2>
          <span className="px-3.5 py-1 rounded-full bg-teal-100 text-teal-900 font-black text-sm border border-teal-300">
            ⭐ Score: {score}
          </span>
        </div>

        {/* Prompt + Draggable/Hold Object */}
        <div className="bg-slate-900 text-white rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3.5">
            <div
              draggable={!placedSpotId}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', task.id);
              }}
              className="w-16 h-16 rounded-2xl bg-amber-300 border-3 border-amber-500 flex items-center justify-center text-4xl shadow-md cursor-grab active:cursor-grabbing flex-shrink-0"
              title="Drag me or tap the right spot!"
            >
              {task.objectEmoji}
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-teal-300">
                Drag or tap the right place!
              </div>
              <p className="font-display font-black text-lg sm:text-2xl text-white">
                {task.prompt}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playTap(isMuted);
              unlockAudio();
              speakTask();
            }}
            className="px-4 py-2.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-display font-black text-sm inline-flex items-center gap-1.5 cursor-pointer flex-shrink-0"
          >
            <Volume2 className="w-5 h-5" />
            <span>Listen</span>
          </button>
        </div>

        {/* Illustrated Room + Garden Scene (No spoiler labels!) */}
        <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden border-4 border-slate-200 bg-sky-100 select-none shadow-inner">
          <svg viewBox="0 0 800 500" className="w-full h-full" aria-hidden="true">
            {/* Wall & Window */}
            <rect x="0" y="0" width="800" height="330" fill="#fef9c3" />
            <rect x="0" y="330" width="800" height="170" fill="#fde68a" />
            <line x1="0" y1="330" x2="800" y2="330" stroke="#d97706" strokeWidth="5" />

            {/* Garden Window showing the Tree outside */}
            <rect x="235" y="45" width="170" height="210" rx="14" fill="#bae6fd" stroke="#92400e" strokeWidth="8" />
            <rect x="235" y="210" width="170" height="45" fill="#86efac" />

            {/* Tree (Puppy hides BEHIND it when placed!) */}
            <g>
              {placedSpotId === 'behind_tree' && (
                <text x="320" y="205" fontSize="52" textAnchor="middle">
                  {task.objectEmoji}
                </text>
              )}
              <rect x="306" y="155" width="28" height="90" fill="#78350f" rx="4" />
              <circle cx="320" cy="120" r="56" fill="#22c55e" stroke="#15803d" strokeWidth="5" />
            </g>

            {/* Sofa on Left */}
            <g transform="translate(65, 225)">
              <rect x="0" y="35" width="165" height="65" rx="14" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="4" />
              <rect x="18" y="0" width="129" height="45" rx="12" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="4" />
              <rect x="0" y="22" width="24" height="72" rx="10" fill="#2563eb" stroke="#1d4ed8" strokeWidth="4" />
              <rect x="141" y="22" width="24" height="72" rx="10" fill="#2563eb" stroke="#1d4ed8" strokeWidth="4" />
            </g>

            {/* Wooden Table in Center */}
            <g transform="translate(385, 255)">
              <rect x="0" y="0" width="165" height="22" rx="6" fill="#b45309" stroke="#78350f" strokeWidth="4" />
              <rect x="18" y="22" width="16" height="105" fill="#92400e" />
              <rect x="131" y="22" width="16" height="105" fill="#92400e" />
            </g>

            {/* Open Toy Box on Right */}
            <g transform="translate(590, 265)">
              <polygon points="10,18 90,18 82,82 18,82" fill="#f97316" stroke="#c2410c" strokeWidth="4" />
              <rect x="4" y="8" width="92" height="14" rx="4" fill="#fb923c" stroke="#c2410c" strokeWidth="4" />
            </g>

            {/* Chair on Far Right */}
            <g transform="translate(675, 295)">
              <rect x="8" y="0" width="14" height="62" rx="4" fill="#10b981" stroke="#047857" strokeWidth="3" />
              <rect x="8" y="54" width="66" height="14" rx="5" fill="#34d399" stroke="#047857" strokeWidth="3" />
              <rect x="12" y="68" width="10" height="48" fill="#047857" />
              <rect x="60" y="68" width="10" height="48" fill="#047857" />
            </g>
          </svg>

          {/* Interactive Drop / Tap Zones (No preposition text spoilers!) */}
          {SPOTS.map((spot) => {
            const isPlacedHere = placedSpotId === spot.id;
            const isWrong = wrongSpotId === spot.id;
            const hidePlacedEmoji = isPlacedHere && spot.behind; // Tree renders puppy behind trunk!

            return (
              <button
                key={spot.id}
                type="button"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleSpotSelect(spot);
                }}
                onClick={() => handleSpotSelect(spot)}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                aria-label={`Place ${spot.spoken}`}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isPlacedHere
                    ? 'bg-emerald-400/35 border-4 border-emerald-500 scale-110 z-20 shadow-lg'
                    : isWrong
                    ? 'bg-rose-400/40 border-4 border-rose-500 animate-wobble'
                    : 'border-3 border-dashed border-slate-600/40 bg-white/30 hover:bg-yellow-200/60 hover:border-amber-500 hover:scale-110'
                }`}
              >
                {isPlacedHere && !hidePlacedEmoji ? (
                  <span className="text-4xl sm:text-5xl drop-shadow-md animate-bounce">
                    {task.objectEmoji}
                  </span>
                ) : (
                  <span className="w-3 h-3 rounded-full bg-slate-700/40" />
                )}
              </button>
            );
          })}
        </div>

        {placedSpotId && (
          <div className="flex items-center justify-center gap-2 text-emerald-700 font-display font-black text-base sm:text-lg">
            <CheckCircle2 className="w-5 h-5" />
            <span>Awesome! Right spot! (+2 ⭐)</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
        )}
      </div>
    </div>
  );
}
