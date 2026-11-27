import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Star,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  HelpCircle,
  Trophy,
} from 'lucide-react';
import {
  speakEnglish,
  speakPhoneme,
  stopSpeech,
  unlockAudio,
  triggerHoverSpeech,
  cancelHoverSpeech,
} from '../utils/speech';
import {
  playSnap,
  playSuccess,
  playSparkle,
  playTap,
  playWobble,
} from '../utils/soundEffects';

import { VOCAB_CATEGORIES, getPhonicsWordsFromBank } from '../data/vocabularyBank500';

const PHONICS_COMPLETED_STORAGE_KEY = 'lego_phonics_completed_v1';
const PHONICS_WORDS = getPhonicsWordsFromBank();

function loadSavedCompletedIds() {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(PHONICS_COMPLETED_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const validIds = new Set(PHONICS_WORDS.map((w) => w.id));
    return parsed.filter((id) => validIds.has(id));
  } catch {
    return [];
  }
}

function saveCompletedIds(ids) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(PHONICS_COMPLETED_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore storage errors
  }
}

function createShuffledBricks(wordObj) {
  const letters = [...wordObj.letters];
  const letterSet = new Set(letters);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter((ch) => !letterSet.has(ch));
  const distractor = alphabet[Math.floor(Math.random() * alphabet.length)] || 'Z';
  const allLetters = [...letters, distractor];

  return allLetters
    .map((letter, idx) => ({ id: `${wordObj.id}-brick-${idx}-${letter}`, letter }))
    .sort(() => Math.random() - 0.5);
}

const PHONICS_TIERS = [
  { id: 'all', label: '🌟 All Levels' },
  { id: 'tier1', label: '🧱 Level 1 (3 Letters)' },
  { id: 'tier2', label: '⚡ Level 2 (4–5 Letters)' },
  { id: 'tier3', label: '🚀 Level 3 (6–8 Letters)' },
];

function matchesTier(item, tierId) {
  if (!tierId || tierId === 'all') return true;
  const len = item.letters.length;
  if (tierId === 'tier1') return len === 3;
  if (tierId === 'tier2') return len >= 4 && len <= 5;
  return len >= 6;
}

function getGermanFalseFriendHint(upperWord) {
  if (!upperWord) return null;
  if (upperWord.includes('W')) {
    return '💡 Sound Tip: In English, W sounds like /w/ (round lips)!';
  }
  if (upperWord.includes('V')) {
    return '💡 Sound Tip: In English, V sounds like /v/ (buzzy voice)!';
  }
  if (upperWord.includes('EI')) {
    return '💡 Sound Tip: Watch out — EI sounds different in English!';
  }
  return null;
}

function findNextUncompletedIndex(completedIds, afterIndex = -1, categoryId = 'all', tierId = 'all') {
  const doneSet = new Set(completedIds);
  for (let offset = 1; offset <= PHONICS_WORDS.length; offset += 1) {
    const candidate = (afterIndex + offset) % PHONICS_WORDS.length;
    const item = PHONICS_WORDS[candidate];
    const matchesCat = categoryId === 'all' || item.category === categoryId;
    if (matchesCat && matchesTier(item, tierId) && !doneSet.has(item.id)) {
      return candidate;
    }
  }
  return -1;
}

export default function PhonicsBuilder({
  onRewardEarned,
  isMuted = false,
  childName = 'Deniz',
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [completedIds, setCompletedIds] = useState(() => loadSavedCompletedIds());
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = loadSavedCompletedIds();
    const idx = findNextUncompletedIndex(saved, -1);
    return idx === -1 ? 0 : idx;
  });
  const [allDone, setAllDone] = useState(() => {
    const saved = loadSavedCompletedIds();
    return saved.length >= PHONICS_WORDS.length;
  });
  const [availableBricks, setAvailableBricks] = useState(() =>
    createShuffledBricks(PHONICS_WORDS[currentIndex])
  );
  const [slots, setSlots] = useState(() =>
    new Array(PHONICS_WORDS[currentIndex].letters.length).fill(null)
  );
  const [isSuccess, setIsSuccess] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const initialBricksRef = useRef(availableBricks);
  const retryTimerRef = useRef(null);
  const speakTimerRef = useRef(null);

  const currentWord = PHONICS_WORDS[currentIndex];
  const completedSet = new Set(completedIds);

  const clearTimers = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (speakTimerRef.current) {
      clearTimeout(speakTimerRef.current);
      speakTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
      cancelHoverSpeech();
      stopSpeech();
    };
  }, [clearTimers]);

  // Speak target word when active word changes
  useEffect(() => {
    if (allDone || !currentWord) return undefined;
    if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
    if (!isMuted) {
      speakTimerRef.current = setTimeout(() => {
        speakEnglish(currentWord.word.toLowerCase());
      }, 280);
    }
    return () => {
      if (speakTimerRef.current) {
        clearTimeout(speakTimerRef.current);
        speakTimerRef.current = null;
      }
    };
  }, [currentIndex, allDone, currentWord, isMuted]);

  const loadWordAtIndex = useCallback(
    (idx) => {
      clearTimers();
      const wordObj = PHONICS_WORDS[idx];
      const shuffled = createShuffledBricks(wordObj);
      initialBricksRef.current = shuffled;
      setCurrentIndex(idx);
      setAvailableBricks(shuffled);
      setSlots(new Array(wordObj.letters.length).fill(null));
      setIsSuccess(false);
      setIsChecking(false);
      setShowHint(false);
      setAllDone(false);
    },
    [clearTimers]
  );

  // Validate complete word using initialBricksRef so mistakes NEVER duplicate bricks
  const validateWord = (completedSlots) => {
    setIsChecking(true);
    const constructed = completedSlots.map((s) => s.letter).join('');

    if (constructed === currentWord.word) {
      setIsSuccess(true);
      setIsChecking(false);

      const nextCompleted = completedSet.has(currentWord.id)
        ? completedIds
        : [...completedIds, currentWord.id];
      if (nextCompleted !== completedIds) {
        setCompletedIds(nextCompleted);
        saveCompletedIds(nextCompleted);
      }

      if (!isMuted) {
        playSuccess();
        playSparkle();
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
        speakTimerRef.current = setTimeout(() => {
          speakEnglish(`${currentWord.letters.join('... ')}... ${currentWord.word.toLowerCase()}!`);
        }, 280);
      }

      if (onRewardEarned) {
        onRewardEarned({ bricks: 2, stars: 1 });
      }
      return;
    }

    // Incorrect: return cleanly to the exact original shuffled bricks
    if (!isMuted) {
      playWobble();
      speakEnglish("Good try! Let's listen again.");
    }

    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    retryTimerRef.current = setTimeout(() => {
      setSlots(new Array(currentWord.letters.length).fill(null));
      setAvailableBricks(initialBricksRef.current);
      setIsChecking(false);
    }, 1050);
  };

  const handleSelectBrick = (brick) => {
    if (isSuccess || isChecking) return;

    cancelHoverSpeech();
    unlockAudio();

    if (!isMuted) {
      playSnap();
      speakPhoneme(brick.letter);
    }

    const firstEmptyIndex = slots.findIndex((slot) => slot === null);
    if (firstEmptyIndex === -1) return;

    const newSlots = [...slots];
    newSlots[firstEmptyIndex] = brick;
    setSlots(newSlots);
    setAvailableBricks((prev) => prev.filter((b) => b.id !== brick.id));

    if (newSlots.every((s) => s !== null)) {
      validateWord(newSlots);
    }
  };

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

  const handleNextWord = () => {
    cancelHoverSpeech();
    unlockAudio();
    if (!isMuted) playTap();

    let nextIdx = findNextUncompletedIndex(completedIds, currentIndex, selectedCategory, selectedTier);
    if (nextIdx === -1 && (selectedCategory !== 'all' || selectedTier !== 'all')) {
      nextIdx = findNextUncompletedIndex(completedIds, currentIndex, 'all', 'all');
      if (nextIdx !== -1) {
        setSelectedCategory('all');
        setSelectedTier('all');
      }
    }
    if (nextIdx === -1) {
      setAllDone(true);
      if (!isMuted) playSparkle();
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
      return;
    }
    loadWordAtIndex(nextIdx);
  };

  const applyFilterJump = (catId, tierId) => {
    const nextUnfinished = findNextUncompletedIndex(completedIds, -1, catId, tierId);
    if (nextUnfinished !== -1) {
      loadWordAtIndex(nextUnfinished);
      return;
    }
    const firstMatch = PHONICS_WORDS.findIndex(
      (w) => (catId === 'all' || w.category === catId) && matchesTier(w, tierId)
    );
    loadWordAtIndex(firstMatch === -1 ? 0 : firstMatch);
  };

  const handleSelectCategory = (catId) => {
    cancelHoverSpeech();
    unlockAudio();
    if (!isMuted) playTap();
    setSelectedCategory(catId);
    applyFilterJump(catId, selectedTier);
  };

  const handleSelectTier = (tierId) => {
    cancelHoverSpeech();
    unlockAudio();
    if (!isMuted) playTap();
    setSelectedTier(tierId);
    applyFilterJump(selectedCategory, tierId);
  };

  const handleResetProgress = () => {
    cancelHoverSpeech();
    unlockAudio();
    if (!isMuted) playTap();
    setCompletedIds([]);
    saveCompletedIds([]);
    const firstInCat = PHONICS_WORDS.findIndex(
      (w) => (selectedCategory === 'all' || w.category === selectedCategory) && matchesTier(w, selectedTier)
    );
    loadWordAtIndex(firstInCat === -1 ? 0 : firstInCat);
  };

  const handleHearTargetWord = () => {
    cancelHoverSpeech();
    unlockAudio();
    if (!isMuted) {
      playTap();
      speakEnglish(currentWord.word.toLowerCase());
    }
  };

  const categoryEntries = PHONICS_WORDS.map((item, idx) => ({ item, idx })).filter(
    ({ item }) => (selectedCategory === 'all' || item.category === selectedCategory) && matchesTier(item, selectedTier)
  );
  const falseFriendHint = getGermanFalseFriendHint(currentWord?.word);
  const activePosInCat = categoryEntries.findIndex(({ idx }) => idx === currentIndex);
  const stripEntries =
    categoryEntries.length <= 55
      ? categoryEntries
      : categoryEntries.slice(
          Math.max(0, (activePosInCat === -1 ? 0 : activePosInCat) - 6),
          Math.max(18, (activePosInCat === -1 ? 0 : activePosInCat) + 12)
        );

  return (
    <div className="w-full max-w-none px-3 sm:px-6 lg:px-10 py-4 sm:py-6 flex-1 flex flex-col items-center">
      {/* Phonics Lab Header */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl p-4 shadow-md border-2 border-slate-200 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-2xl shadow-inner border border-amber-600">
            🔤
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight">
              {childName}&apos;s Phonics Lab ({PHONICS_WORDS.length} Words)
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span className="font-display font-black text-amber-900 text-sm">
              {completedIds.length} / {PHONICS_WORDS.length} Done
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetProgress}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition cursor-pointer"
            title="Reset Progress"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tier Difficulty Selector Bar */}
      <div className="w-full flex flex-wrap items-center gap-2 mb-2">
        {PHONICS_TIERS.map((tier) => {
          const isTierActive = selectedTier === tier.id;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => handleSelectTier(tier.id)}
              className={`px-3 py-1.5 rounded-xl font-display font-bold text-xs border-2 transition cursor-pointer ${
                isTierActive
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {tier.label}
            </button>
          );
        })}
      </div>

      {/* Category Filter Bar */}
      <div className="w-full flex items-center gap-2 overflow-x-auto pb-2 mb-3">
        {VOCAB_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const wordsInCat =
            cat.id === 'all'
              ? PHONICS_WORDS
              : PHONICS_WORDS.filter((w) => w.category === cat.id);
          const doneInCat = wordsInCat.filter((w) => completedSet.has(w.id)).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectCategory(cat.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display font-bold text-xs border-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-slate-950 border-amber-600 shadow-sm scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.labelEn || cat.labelTr}</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-slate-900/15 text-slate-950' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {doneInCat}/{wordsInCat.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Completed Words Memory Strip */}
      <div className="w-full bg-white rounded-2xl p-3 border-2 border-slate-200 shadow-sm mb-4 max-h-28 overflow-y-auto flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span className="text-xs font-black text-slate-500 mr-1">
          Words ({categoryEntries.length}):
        </span>
        {stripEntries.map(({ item: w, idx }) => {
          const isDone = completedSet.has(w.id);
          const isCurrent = !allDone && idx === currentIndex;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => loadWordAtIndex(idx)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-display font-black border-2 transition cursor-pointer ${
                isCurrent
                  ? 'bg-amber-400 text-slate-950 border-amber-600 shadow-sm scale-105'
                  : isDone
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-300'
              }`}
              title={isDone ? `${w.word} done` : `Jump to ${w.word}`}
            >
              <span>{w.emoji}</span>
              <span>{isDone || isCurrent ? w.word : '•••'}</span>
              {isDone && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
            </button>
          );
        })}
      </div>

      {/* All Words Mastered View */}
      {allDone ? (
        <div className="w-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-3xl p-8 shadow-2xl border-4 border-emerald-300 text-center space-y-5">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-yellow-400 text-slate-950 flex items-center justify-center shadow-xl">
            <Trophy className="w-11 h-11" />
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl">
            Awesome {childName}! You mastered all {PHONICS_WORDS.length} words! 🎉
          </h2>
          <p className="text-sm sm:text-base font-bold text-emerald-100 max-w-xl mx-auto">
            All your built words are saved! Want to play through them again?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetProgress}
              className="px-5 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-display font-black text-sm shadow-lg cursor-pointer"
            >
              🔄 Play All Words Again
            </button>
          </div>
        </div>
      ) : (
        /* Main Baseplate Arena */
        <div className="w-full bg-gradient-to-b from-emerald-500 to-emerald-700 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-emerald-800 text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)',
              backgroundSize: '18px 18px',
            }}
          />

          {/* Top Hint / Translation Bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-4 bg-emerald-900/40 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-emerald-400/30">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onPointerEnter={(e) =>
                  triggerHoverSpeech(currentWord.word.toLowerCase(), {
                    isMuted,
                    pointerType: e.pointerType,
                  })
                }
                onPointerLeave={cancelHoverSpeech}
                onClick={handleHearTargetWord}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-xl font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-slate-900" />
                <span>Listen to Word 🔊</span>
              </button>
              {falseFriendHint && (
                <span className="px-3 py-1 rounded-xl bg-amber-300 text-slate-950 font-display font-black text-xs shadow-sm">
                  {falseFriendHint}
                </span>
              )}

              <button
                type="button"
                onClick={() => setShowHint((prev) => !prev)}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-800/60 hover:bg-emerald-800 text-emerald-100 rounded-xl font-bold text-xs border border-emerald-400/30 transition cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-yellow-300" />
                <span>{showHint ? 'Hide' : '💡 Hint'}</span>
              </button>
            </div>
          </div>

          {showHint && (
            <div className="relative z-10 mb-6 p-3.5 bg-yellow-100 text-yellow-900 rounded-2xl border border-yellow-300 text-xs sm:text-sm font-semibold flex items-center justify-between">
              <span>
                💡 <strong>Sound Hint:</strong> {currentWord.phoneticGuide}
              </span>
              <span className="text-xl">{currentWord.emoji}</span>
            </div>
          )}

          {/* Target Word Illustration & Mystery Slots */}
          <div className="relative z-10 flex flex-col items-center justify-center my-6">
            <div
              onPointerEnter={(e) =>
                triggerHoverSpeech(currentWord.word.toLowerCase(), {
                  isMuted,
                  pointerType: e.pointerType,
                })
              }
              onPointerLeave={cancelHoverSpeech}
              onClick={handleHearTargetWord}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/90 shadow-xl border-4 border-emerald-300 flex items-center justify-center text-5xl sm:text-6xl mb-6 transform hover:scale-105 transition cursor-pointer"
              title="Hover or click to listen"
            >
              {isSuccess ? (
                <span className="animate-bounce">{currentWord.emoji}</span>
              ) : (
                <span className="opacity-90">{currentWord.emoji}</span>
              )}
            </div>

            {/* Lego Baseplate Slots */}
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
                    <span className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-wider">
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

          {/* Letter Brick Tray */}
          <div className="relative z-10 bg-emerald-900/70 backdrop-blur-md rounded-2xl p-4 sm:p-6 border-2 border-emerald-400/40">
            <p className="text-center text-xs sm:text-sm font-bold text-emerald-200 uppercase tracking-wider mb-4">
              Tap letter bricks to build the word:
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 min-h-[90px]">
              {availableBricks.map((brick) => (
                <button
                  key={brick.id}
                  type="button"
                  onClick={() => handleSelectBrick(brick)}
                  className="group relative w-14 h-18 sm:w-16 sm:h-20 bg-gradient-to-b from-yellow-300 to-amber-400 hover:from-yellow-200 hover:to-amber-300 border-3 border-amber-500 rounded-2xl shadow-lg hover:shadow-2xl flex flex-col items-center justify-center text-slate-950 font-display font-black text-2xl sm:text-3xl transition transform active:scale-90 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="absolute -top-2 flex gap-1.5">
                    <div className="w-3 h-1.5 bg-amber-500 rounded-t-sm shadow-sm" />
                    <div className="w-3 h-1.5 bg-amber-500 rounded-t-sm shadow-sm" />
                  </div>

                  <span>{brick.letter}</span>

                  <span className="text-[9px] font-bold text-amber-900/80 -mt-1 uppercase">
                    Sound 🔊
                  </span>
                </button>
              ))}

              {availableBricks.length === 0 && !isSuccess && (
                <p className="text-xs text-emerald-200 italic">Checking...</p>
              )}
            </div>
          </div>

          {/* Celebratory Banner */}
          {isSuccess && (
            <div className="relative z-20 mt-6 p-4 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 text-slate-950 rounded-2xl border-2 border-yellow-500 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-900 text-yellow-300 flex items-center justify-center text-2xl shadow-md">
                  🎉
                </div>
                <div>
                  <h3 className="font-display font-black text-lg sm:text-xl text-slate-900">
                    Awesome, {childName}!
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    You built <strong>{currentWord.word}</strong>! (+2 Bricks 🧱 +1 Star ⭐)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleHearTargetWord}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-yellow-300 rounded-xl text-xs font-bold shadow-md cursor-pointer transition active:scale-95"
                >
                  Listen Again 🔊
                </button>
                <button
                  type="button"
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
      )}

    </div>
  );
}
