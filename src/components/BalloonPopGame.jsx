import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Sparkles,
  RotateCcw,
  Trophy,
  ArrowRight,
  Wrench,
  HelpCircle,
  Play,
} from 'lucide-react';
import { CURRICULUM_LEVELS } from '../data/curriculum';
import { speakEnglish, speakGerman, speakTurkish, speakEncouragement } from '../utils/speech';
import { playSnap, playVictoryFanfare, playStarSparkle, playGentleWobble, playTap } from '../utils/soundEffects';

// Flattened pool of child-friendly words for Balloon Pop
const BALLOON_POOL = [
  { id: 'red', word: 'Red', emoji: '🔴', color: 'bg-red-500 border-red-700', de: 'Rot', tr: 'Kırmızı' },
  { id: 'blue', word: 'Blue', emoji: '🔵', color: 'bg-blue-500 border-blue-700', de: 'Blau', tr: 'Mavi' },
  { id: 'yellow', word: 'Yellow', emoji: '🟡', color: 'bg-yellow-400 border-yellow-600', de: 'Gelb', tr: 'Sarı' },
  { id: 'green', word: 'Green', emoji: '🟢', color: 'bg-green-500 border-green-700', de: 'Grün', tr: 'Yeşil' },
  { id: 'dog', word: 'Dog', emoji: '🐶', color: 'bg-amber-500 border-amber-700', de: 'Hund', tr: 'Köpek' },
  { id: 'cat', word: 'Cat', emoji: '🐱', color: 'bg-orange-500 border-orange-700', de: 'Katze', tr: 'Kedi' },
  { id: 'lion', word: 'Lion', emoji: '🦁', color: 'bg-yellow-500 border-yellow-700', de: 'Löwe', tr: 'Aslan' },
  { id: 'car', word: 'Car', emoji: '🚗', color: 'bg-red-600 border-red-800', de: 'Auto', tr: 'Araba' },
  { id: 'airplane', word: 'Airplane', emoji: '✈️', color: 'bg-sky-500 border-sky-700', de: 'Flugzeug', tr: 'Uçak' },
  { id: 'train', word: 'Train', emoji: '🚂', color: 'bg-purple-500 border-purple-700', de: 'Zug', tr: 'Tren' },
  { id: 'rocket', word: 'Rocket', emoji: '🚀', color: 'bg-rose-500 border-rose-700', de: 'Rakete', tr: 'Roket' },
  { id: 'star', word: 'Star', emoji: '⭐', color: 'bg-amber-400 border-amber-600', de: 'Stern', tr: 'Yıldız' },
  { id: 'backpack', word: 'Backpack', emoji: '🎒', color: 'bg-blue-600 border-blue-800', de: 'Rucksack', tr: 'Sırt Çantası' },
  { id: 'clock', word: 'Clock', emoji: '⏰', color: 'bg-red-500 border-red-700', de: 'Uhr', tr: 'Saat' },
  { id: 'apple', word: 'Apple', emoji: '🍎', color: 'bg-emerald-500 border-emerald-700', de: 'Apfel', tr: 'Elma' },
];

const TOTAL_ROUNDS = 6;

export default function BalloonPopGame({
  onRewardEarned,
  onNavigateToWorkshop,
  isMuted = false,
}) {
  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [targetItem, setTargetItem] = useState(null);
  const [options, setOptions] = useState([]);
  const [poppedIds, setPoppedIds] = useState(new Set());
  const [isGameOver, setIsGameOver] = useState(false);
  const [wobbleId, setWobbleId] = useState(null);

  // Setup a new round with 3 balloons (1 target, 2 distractors)
  const setupRound = (roundNum) => {
    // Pick target randomly
    const targetIdx = Math.floor(Math.random() * BALLOON_POOL.length);
    const target = BALLOON_POOL[targetIdx];

    // Pick 2 distinct distractors
    const poolWithoutTarget = BALLOON_POOL.filter(b => b.id !== target.id);
    const shuffledDistractors = [...poolWithoutTarget].sort(() => 0.5 - Math.random());
    const distractors = shuffledDistractors.slice(0, 2);

    // Shuffle options
    const roundOptions = [target, ...distractors].sort(() => 0.5 - Math.random());

    setTargetItem(target);
    setOptions(roundOptions);
    setPoppedIds(new Set());
    setWobbleId(null);

    // Speak target prompt
    if (!isMuted) {
      setTimeout(() => {
        speakEnglish(target.id);
      }, 300);
    }
  };

  useEffect(() => {
    setupRound(currentRound);
  }, [currentRound]);

  // Handle clicking a balloon
  const handleBalloonClick = (item) => {
    playSnap(isMuted);

    if (item.id === targetItem.id) {
      // Correct balloon!
      playStarSparkle(isMuted);
      const newPopped = new Set(poppedIds);
      newPopped.add(item.id);
      setPoppedIds(newPopped);
      setScore(prev => prev + 1);

      // Reward 1 brick
      if (onRewardEarned) {
        onRewardEarned({ stars: 1, bricks: 1 });
      }

      // Small confetti pop
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });

      // Spoken encouragement
      if (!isMuted) {
        setTimeout(() => {
          speakEncouragement('en');
        }, 350);
      }

      // Advance round after short animation
      setTimeout(() => {
        if (currentRound >= TOTAL_ROUNDS) {
          setIsGameOver(true);
          playVictoryFanfare(isMuted);
          confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.5 },
          });
          if (onRewardEarned) {
            onRewardEarned({ stars: 5, bricks: 3 });
          }
        } else {
          setCurrentRound(prev => prev + 1);
        }
      }, 1000);

    } else {
      // Wrong balloon: gentle bounce without penalty
      playGentleWobble(isMuted);
      setWobbleId(item.id);
      setTimeout(() => setWobbleId(null), 600);

      // Repeat target audio gently
      if (!isMuted) {
        speakEnglish(targetItem.id);
      }
    }
  };

  const handleRestartGame = () => {
    playTap(isMuted);
    setScore(0);
    setCurrentRound(1);
    setIsGameOver(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 flex flex-col items-center select-none">
      
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between gap-3 mb-4 bg-white p-3 sm:p-4 rounded-2xl shadow-md border-4 border-rose-400">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-2xl shadow-md border-2 border-rose-600">
            🎈
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-lg sm:text-xl text-slate-800">
                Lego Balloon Pop!
              </h2>
              <span className="bg-rose-100 text-rose-800 text-[11px] font-black px-2 py-0.5 rounded-full border border-rose-300 uppercase">
                Playlearning™
              </span>
            </div>
            <p className="text-xs font-bold text-slate-500">
              Listen to the word and pop the right floating Lego balloon!
            </p>
          </div>
        </div>

        {/* Score & Round Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-yellow-400/20 text-yellow-800 border border-yellow-400/50 px-3 py-1 rounded-xl text-xs sm:text-sm font-display font-black">
            <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
            <span>Round {currentRound} / {TOTAL_ROUNDS}</span>
          </div>

          <button
            onClick={handleRestartGame}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition-all"
            title="Restart Balloon Pop"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Word Speaker Card */}
      {targetItem && !isGameOver && (
        <div className="w-full bg-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-xl border-4 border-slate-800 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => speakEnglish(targetItem.id)}
              className="w-14 h-14 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 flex items-center justify-center shadow-lg transition-transform active:scale-95 flex-shrink-0 cursor-pointer"
              title="Replay word pronunciation"
            >
              <Volume2 className="w-7 h-7 animate-pulse" />
            </button>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Pop the matching balloon:
              </span>
              <span className="font-display font-black text-3xl sm:text-4xl text-yellow-300 tracking-wide">
                {targetItem.word}
              </span>
            </div>
          </div>

          {/* Bilingual Helpers */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => speakGerman(targetItem.de)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
              title="Hear in German"
            >
              <span>🇩🇪</span>
              <span>{targetItem.de}</span>
            </button>
            <button
              onClick={() => speakTurkish(targetItem.tr)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
              title="Hear in Turkish"
            >
              <span>🇹🇷</span>
              <span>{targetItem.tr}</span>
            </button>
          </div>

        </div>
      )}

      {/* Balloon Play Sky Area */}
      {!isGameOver && (
        <div className="w-full h-80 sm:h-96 bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50 rounded-3xl border-4 border-slate-300 shadow-inner relative overflow-hidden flex items-center justify-around px-4">
          
          {/* Subtle clouds in background */}
          <div className="absolute top-6 left-10 text-4xl opacity-50 select-none">☁️</div>
          <div className="absolute top-16 right-16 text-5xl opacity-40 select-none">☁️</div>
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-3xl opacity-30 select-none">☁️</div>

          {/* 3 Floating Balloons */}
          {options.map((balloon, idx) => {
            const isPopped = poppedIds.has(balloon.id);
            const isWobbling = wobbleId === balloon.id;

            if (isPopped) {
              return (
                <div
                  key={balloon.id}
                  className="flex flex-col items-center animate-ping"
                >
                  <span className="text-5xl">💥</span>
                  <span className="font-display font-black text-xs text-yellow-600">+1 🧱</span>
                </div>
              );
            }

            return (
              <button
                key={balloon.id}
                onClick={() => handleBalloonClick(balloon)}
                className={`
                  relative flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 active:scale-95
                  ${isWobbling ? 'animate-wiggle' : 'hover:scale-105'}
                `}
                style={{
                  animation: `float ${2.5 + idx * 0.4}s ease-in-out infinite alternate`,
                }}
              >
                {/* Balloon Top Oval with Lego Border */}
                <div className={`
                  w-28 h-36 sm:w-32 sm:h-40 rounded-[50%/60%_60%_40%_40%] shadow-xl border-4
                  flex flex-col items-center justify-center p-3 relative
                  ${balloon.color} text-white
                `}>
                  {/* Lego Stud on Balloon */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-2 bg-white/40 rounded-full" />
                  
                  {/* Big Emoji */}
                  <span className="text-4xl sm:text-5xl drop-shadow-md mb-1">
                    {balloon.emoji}
                  </span>

                  {/* Word Label Capsule */}
                  <div className="bg-white/95 text-slate-900 font-display font-black text-xs sm:text-sm px-2.5 py-0.5 rounded-full shadow-sm">
                    {balloon.word}
                  </div>
                </div>

                {/* Balloon Knot */}
                <div className="w-3 h-3 bg-amber-800 rotate-45 -mt-1.5 rounded-xs" />

                {/* Balloon String */}
                <div className="w-0.5 h-12 bg-slate-400/80 mt-0.5" />
              </button>
            );
          })}

        </div>
      )}

      {/* Game Over / Victory Screen */}
      {isGameOver && (
        <div className="w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 text-slate-950 rounded-3xl shadow-xl p-6 mb-4 border-4 border-yellow-500 animate-bounce">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-white text-4xl flex items-center justify-center shadow-md">
                🏆
              </div>
              <div>
                <h3 className="font-display font-black text-2xl text-slate-950">
                  Super Pop Champion!
                </h3>
                <p className="text-xs font-bold text-slate-800">
                  You popped all {TOTAL_ROUNDS} balloons! You earned +5 Stars ⭐ and +3 Lego Bricks 🧱!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRestartGame}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-display font-black text-xs shadow-md hover:bg-slate-800 transition-all cursor-pointer"
              >
                Play Again 🎈
              </button>
              <button
                onClick={onNavigateToWorkshop}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-display font-black text-xs shadow-md hover:bg-blue-700 transition-all cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                <span>Build in Workshop</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
