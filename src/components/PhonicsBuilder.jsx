import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, Sparkles, Star, ArrowRight, RefreshCw, CheckCircle, HelpCircle, Trophy } from 'lucide-react';
import { speakEnglish, speakPhoneme, speakTurkish, speakGerman } from '../utils/speech';
import { playSnap, playSuccess, playSparkle, playTap, playWobble } from '../utils/soundEffects';

const PHONICS_WORDS = [
  {
    id: 'pw-1',
    word: 'CAT',
    letters: ['C', 'A', 'T'],
    emoji: '🐱',
    color: 'bg-amber-500',
    border: 'border-amber-600',
    studColor: '#f59e0b',
    tr: 'Kedi',
    de: 'Katze',
    phoneticGuide: 'C says /k/, A says /æ/, T says /t/',
  },
  {
    id: 'pw-2',
    word: 'DOG',
    letters: ['D', 'O', 'G'],
    emoji: '🐶',
    color: 'bg-blue-600',
    border: 'border-blue-700',
    studColor: '#2563eb',
    tr: 'Köpek',
    de: 'Hund',
    phoneticGuide: 'D says /d/, O says /ɒ/, G says /g/',
  },
  {
    id: 'pw-3',
    word: 'BUS',
    letters: ['B', 'U', 'S'],
    emoji: '🚌',
    color: 'bg-yellow-500',
    border: 'border-yellow-600',
    studColor: '#eab308',
    tr: 'Otobüs',
    de: 'Bus',
    phoneticGuide: 'B says /b/, U says /ʌ/, S says /s/',
  },
  {
    id: 'pw-4',
    word: 'RED',
    letters: ['R', 'E', 'D'],
    emoji: '🔴',
    color: 'bg-red-500',
    border: 'border-red-600',
    studColor: '#ef4444',
    tr: 'Kırmızı',
    de: 'Rot',
    phoneticGuide: 'R says /r/, E says /e/, D says /d/',
  },
  {
    id: 'pw-5',
    word: 'SUN',
    letters: ['S', 'U', 'N'],
    emoji: '☀️',
    color: 'bg-orange-500',
    border: 'border-orange-600',
    studColor: '#f97316',
    tr: 'Güneş',
    de: 'Sonne',
    phoneticGuide: 'S says /s/, U says /ʌ/, N says /n/',
  },
  {
    id: 'pw-6',
    word: 'CAR',
    letters: ['C', 'A', 'R'],
    emoji: '🚗',
    color: 'bg-emerald-600',
    border: 'border-emerald-700',
    studColor: '#10b981',
    tr: 'Araba',
    de: 'Auto',
    phoneticGuide: 'C says /k/, A says /ɑː/, R says /r/',
  },
  {
    id: 'pw-7',
    word: 'PEN',
    letters: ['P', 'E', 'N'],
    emoji: '🖊️',
    color: 'bg-purple-600',
    border: 'border-purple-700',
    studColor: '#9333ea',
    tr: 'Kalem',
    de: 'Stift',
    phoneticGuide: 'P says /p/, E says /e/, N says /n/',
  },
  {
    id: 'pw-8',
    word: 'BOX',
    letters: ['B', 'O', 'X'],
    emoji: '📦',
    color: 'bg-amber-700',
    border: 'border-amber-800',
    studColor: '#b45309',
    tr: 'Kutu',
    de: 'Kiste',
    phoneticGuide: 'B says /b/, O says /ɒ/, X says /ks/',
  }
];

export default function PhonicsBuilder({
  onRewardEarned,
  onNavigateToWorkshop,
  isMuted = false,
  childName = 'Deniz',
  childAge = 7,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [availableBricks, setAvailableBricks] = useState([]);
  const [slots, setSlots] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);

  const currentWord = PHONICS_WORDS[currentIndex];

  // Initialize word tiles shuffled with extra distractor letter
  useEffect(() => {
    loadWord(currentIndex);
  }, [currentIndex]);

  const loadWord = (index) => {
    const wordObj = PHONICS_WORDS[index];
    const letters = [...wordObj.letters];
    
    // Add 1 playful distractor letter
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const distractor = alphabet[Math.floor(Math.random() * alphabet.length)];
    const allLetters = [...letters, distractor];
    
    // Shuffle
    const shuffled = allLetters
      .map((letter, idx) => ({ id: `brick-${idx}-${letter}`, letter }))
      .sort(() => Math.random() - 0.5);

    setAvailableBricks(shuffled);
    setSlots(new Array(wordObj.letters.length).fill(null));
    setIsSuccess(false);
    setIsChecking(false);
    setShowHint(false);

    // Speak initial target word softly
    if (!isMuted) {
      setTimeout(() => {
        speakEnglish(wordObj.word.toLowerCase());
      }, 300);
    }
  };

  // Click an available letter brick in tray
  const handleSelectBrick = (brick) => {
    if (isSuccess || isChecking) return;

    if (!isMuted) {
      playSnap();
      speakPhoneme(brick.letter);
    }

    // Find first empty slot
    const firstEmptyIndex = slots.findIndex((slot) => slot === null);
    if (firstEmptyIndex === -1) return;

    const newSlots = [...slots];
    newSlots[firstEmptyIndex] = brick;
    setSlots(newSlots);

    // Remove from available
    setAvailableBricks((prev) => prev.filter((b) => b.id !== brick.id));

    // Check if word is complete
    if (newSlots.every((s) => s !== null)) {
      validateWord(newSlots);
    }
  };

  // Click a placed brick in slot to return to tray
  const handleRemoveFromSlot = (slotIndex) => {
    if (isSuccess || isChecking) return;
    const brick = slots[slotIndex];
    if (!brick) return;

    if (!isMuted) playTap();

    const newSlots = [...slots];
    newSlots[slotIndex] = null;
    setSlots(newSlots);

    setAvailableBricks((prev) => [...prev, brick]);
  };

  // Validate complete word
  const validateWord = (completedSlots) => {
    setIsChecking(true);
    const constructed = completedSlots.map((s) => s.letter).join('');

    if (constructed === currentWord.word) {
      // SUCCESS!
      setIsSuccess(true);
      setScore((prev) => prev + 1);

      if (!isMuted) {
        playSuccess();
        playSparkle();
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Speak phoneme blend sequence
        setTimeout(() => {
          speakEnglish(`${currentWord.letters.join('... ')}... ${currentWord.word.toLowerCase()}!`);
        }, 300);
      }

      // Award Lego bricks and stars
      if (onRewardEarned) {
        onRewardEarned({ bricks: 2, stars: 1 });
      }
    } else {
      // INCORRECT - Gentle retry
      if (!isMuted) {
        playWobble();
        speakEnglish("Good try! Let's listen again.");
      }

      setTimeout(() => {
        // Return all bricks back to pool
        const allBricks = [...availableBricks, ...completedSlots.filter(Boolean)];
        setSlots(new Array(currentWord.letters.length).fill(null));
        setAvailableBricks(allBricks);
        setIsChecking(false);
      }, 1200);
    }
  };

  const handleNextWord = () => {
    if (!isMuted) playTap();
    if (currentIndex < PHONICS_WORDS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all words, loop or celebrate!
      setCurrentIndex(0);
    }
  };

  const handleHearTargetWord = () => {
    if (!isMuted) {
      playTap();
      speakEnglish(currentWord.word.toLowerCase());
    }
  };

  return (
    <div className="w-full max-w-4xl px-4 py-6 flex flex-col items-center animate-fade-in">
      
      {/* Phonics Lab Header */}
      <div className="w-full flex items-center justify-between bg-white rounded-2xl p-4 shadow-md border-2 border-slate-200 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-2xl shadow-inner border border-amber-600">
            🔤
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight">
              {childName}'s Phonics Sound Lab 🧱
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              Snap the letter bricks together to build words!
            </p>
          </div>
        </div>

        {/* Word Counter & Stars */}
        <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
          <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
          <span className="font-display font-black text-amber-900 text-sm">
            {currentIndex + 1} / {PHONICS_WORDS.length}
          </span>
        </div>
      </div>

      {/* Main Baseplate Arena */}
      <div className="w-full bg-gradient-to-b from-emerald-500 to-emerald-700 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-emerald-800 text-white relative overflow-hidden">
        
        {/* Lego Baseplate Grid Texture Dots */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)',
            backgroundSize: '18px 18px',
          }}
        />

        {/* Top Hint / Translation Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-6 bg-emerald-900/40 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-emerald-400/30">
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleHearTargetWord}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-xl font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-slate-900" />
              <span>Listen to Word 🔊</span>
            </button>

            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-800/60 hover:bg-emerald-800 text-emerald-100 rounded-xl font-bold text-xs border border-emerald-400/30 transition cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-yellow-300" />
              <span>{showHint ? 'Hide Clue' : 'Clue 💡'}</span>
            </button>
          </div>

          {/* Bilingual Helpers */}
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="bg-black/30 px-2.5 py-1 rounded-lg">
              🇩🇪 {currentWord.de}
            </span>
            <span className="bg-black/30 px-2.5 py-1 rounded-lg">
              🇹🇷 {currentWord.tr}
            </span>
          </div>

        </div>

        {/* Clue Panel (if opened) */}
        {showHint && (
          <div className="relative z-10 mb-6 p-3.5 bg-yellow-100 text-yellow-900 rounded-2xl border border-yellow-300 text-xs sm:text-sm font-semibold flex items-center justify-between animate-fade-in">
            <span>💡 <strong>Phonics Hint:</strong> {currentWord.phoneticGuide}</span>
            <span className="text-xl">{currentWord.emoji}</span>
          </div>
        )}

        {/* Target Word Illustration & Mystery Slots */}
        <div className="relative z-10 flex flex-col items-center justify-center my-6">
          
          {/* Target Illustration Card */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/90 shadow-xl border-4 border-emerald-300 flex items-center justify-center text-5xl sm:text-6xl mb-6 transform hover:scale-105 transition">
            {isSuccess ? (
              <span className="animate-bounce">{currentWord.emoji}</span>
            ) : (
              <span className="opacity-80">{currentWord.emoji}</span>
            )}
          </div>

          {/* Lego Baseplate Slots (Stud Target Holders) */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 mb-8">
            {slots.map((slotBrick, idx) => (
              <div
                key={idx}
                onClick={() => handleRemoveFromSlot(idx)}
                className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 relative ${
                  slotBrick
                    ? 'bg-gradient-to-b from-amber-400 to-amber-500 border-4 border-amber-600 shadow-xl transform -translate-y-1'
                    : 'bg-emerald-900/60 border-4 border-dashed border-emerald-400/50 hover:border-yellow-400 hover:bg-emerald-900/80 shadow-inner'
                }`}
              >
                {/* 2 Lego Studs on top */}
                <div className="absolute -top-3 flex gap-2">
                  <div
                    className={`w-3.5 h-2 rounded-t-md ${
                      slotBrick ? 'bg-amber-600' : 'bg-emerald-800'
                    }`}
                  />
                  <div
                    className={`w-3.5 h-2 rounded-t-md ${
                      slotBrick ? 'bg-amber-600' : 'bg-emerald-800'
                    }`}
                  />
                </div>

                {slotBrick ? (
                  <span className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-wider animate-scale-up">
                    {slotBrick.letter}
                  </span>
                ) : (
                  <span className="text-xl sm:text-2xl font-display font-black text-emerald-400/60">
                    {idx + 1}
                  </span>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Letter Brick Tray (Loose Bricks) */}
        <div className="relative z-10 bg-emerald-900/70 backdrop-blur-md rounded-2xl p-4 sm:p-6 border-2 border-emerald-400/40">
          <p className="text-center text-xs sm:text-sm font-bold text-emerald-200 uppercase tracking-wider mb-4">
            Tap a brick to hear its sound and snap it into place:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 min-h-[90px]">
            {availableBricks.map((brick) => (
              <button
                key={brick.id}
                onClick={() => handleSelectBrick(brick)}
                className="group relative w-14 h-18 sm:w-16 sm:h-20 bg-gradient-to-b from-yellow-300 to-amber-400 hover:from-yellow-200 hover:to-amber-300 border-3 border-amber-500 rounded-2xl shadow-lg hover:shadow-2xl flex flex-col items-center justify-center text-slate-950 font-display font-black text-2xl sm:text-3xl transition transform active:scale-90 hover:-translate-y-1 cursor-pointer"
              >
                {/* Top Stud Bump */}
                <div className="absolute -top-2 flex gap-1.5">
                  <div className="w-3 h-1.5 bg-amber-500 rounded-t-sm shadow-sm" />
                  <div className="w-3 h-1.5 bg-amber-500 rounded-t-sm shadow-sm" />
                </div>

                <span>{brick.letter}</span>

                {/* Subtitle helper phoneme tag */}
                <span className="text-[9px] font-bold text-amber-900/80 -mt-1 uppercase">
                  Sound 🔊
                </span>
              </button>
            ))}

            {availableBricks.length === 0 && !isSuccess && (
              <p className="text-xs text-emerald-200 italic">Checking word...</p>
            )}
          </div>
        </div>

        {/* Celebratory Banner (When solved) */}
        {isSuccess && (
          <div className="relative z-20 mt-6 p-4 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 text-slate-950 rounded-2xl border-2 border-yellow-500 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-yellow-300 flex items-center justify-center text-2xl shadow-md">
                🎉
              </div>
              <div>
                <h3 className="font-display font-black text-lg sm:text-xl text-slate-900">
                  Awesome Job, {childName}!
                </h3>
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  You blended <strong>{currentWord.word}</strong>! (+2 Bricks 🧱 +1 Star ⭐)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleHearTargetWord}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-yellow-300 rounded-xl text-xs font-bold shadow-md cursor-pointer transition active:scale-95"
              >
                Hear Blend 🔊
              </button>
              <button
                onClick={handleNextWord}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-black shadow-lg cursor-pointer transition active:scale-95"
              >
                <span>Next Word</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Workshop Navigation Banner */}
      <div className="w-full mt-6 flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-slate-600 text-xs sm:text-sm font-semibold">
          <span>🧱 Master Builder Tip:</span>
          <span className="text-slate-500">Each completed word awards +2 Lego Bricks for your 3D Workshop!</span>
        </div>
        {onNavigateToWorkshop && (
          <button
            onClick={onNavigateToWorkshop}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
          >
            Go to 3D Workshop ➔
          </button>
        )}
      </div>

    </div>
  );
}
