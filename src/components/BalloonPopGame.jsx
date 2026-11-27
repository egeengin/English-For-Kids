import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Repeat,
} from 'lucide-react';
import {
  speakEnglish,
  stopSpeech,
  unlockAudio,
  triggerHoverSpeech,
  cancelHoverSpeech,
} from '../utils/speech';
import {
  playSnap,
  playVictoryFanfare,
  playStarSparkle,
  playGentleWobble,
  playTap,
} from '../utils/soundEffects';

import { VOCAB_CATEGORIES, VOCAB_BANK_500 } from '../data/vocabularyBank500';

const INITIAL_ROUNDS = 10;
const BALLOON_MASTERED_KEY = 'lego_balloon_mastered_v1';
const BALLOON_REVIEW_KEY = 'lego_balloon_review_v1';

function loadIdSet(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

function saveIdSet(storageKey, idsSet) {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...idsSet]));
  } catch {
    // Ignore storage quota errors
  }
}

function shuffleArray(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getCategoryPool(categoryId) {
  if (!categoryId || categoryId === 'all') return VOCAB_BANK_500;
  const filtered = VOCAB_BANK_500.filter((item) => item.category === categoryId);
  return filtered.length >= 3 ? filtered : VOCAB_BANK_500;
}

function buildRoundOptions(target, categoryId = 'all') {
  const pool = getCategoryPool(categoryId).filter((b) => b.id !== target.id);
  const fallbackPool =
    pool.length >= 2
      ? pool
      : VOCAB_BANK_500.filter((b) => b.id !== target.id);
  const others = shuffleArray(fallbackPool);
  return shuffleArray([target, others[0], others[1]]);
}

function createInitialDeck(categoryId = 'all', masteredIds = new Set(), reviewIds = new Set()) {
  const pool = getCategoryPool(categoryId);
  const dueReviews = shuffleArray(pool.filter((item) => reviewIds.has(item.id))).map((item) => ({
    item,
    isReview: true,
  }));
  const unmastered = shuffleArray(
    pool.filter((item) => !reviewIds.has(item.id) && !masteredIds.has(item.id))
  ).map((item) => ({ item, isReview: false }));
  const mastered = shuffleArray(
    pool.filter((item) => !reviewIds.has(item.id) && masteredIds.has(item.id))
  ).map((item) => ({ item, isReview: false }));
  return [...dueReviews, ...unmastered, ...mastered].slice(0, INITIAL_ROUNDS);
}

export default function BalloonPopGame({
  onRewardEarned,
  isMuted = false,
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [masteredIds, setMasteredIds] = useState(() => loadIdSet(BALLOON_MASTERED_KEY));
  const [reviewIds, setReviewIds] = useState(() => loadIdSet(BALLOON_REVIEW_KEY));
  const [deck, setDeck] = useState(() =>
    createInitialDeck('all', loadIdSet(BALLOON_MASTERED_KEY), loadIdSet(BALLOON_REVIEW_KEY))
  );
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hypeMessage, setHypeMessage] = useState('');
  const [options, setOptions] = useState(() =>
    buildRoundOptions(deck[0].item, 'all')
  );
  const [poppedIds, setPoppedIds] = useState(() => new Set());
  const [isRoundLocked, setIsRoundLocked] = useState(false);
  const [echoPhrase, setEchoPhrase] = useState(null);
  const [wrongCountInRound, setWrongCountInRound] = useState(0);
  const [missedIdsQueued, setMissedIdsQueued] = useState(() => new Set());
  const [isGameOver, setIsGameOver] = useState(false);
  const [wobbleId, setWobbleId] = useState(null);

  const deckRef = useRef(deck);
  useEffect(() => {
    deckRef.current = deck;
  }, [deck]);
  const advanceTimerRef = useRef(null);
  const promptTimerRef = useRef(null);
  const wobbleTimerRef = useRef(null);

  const currentEntry = deck[roundIdx] || null;
  const targetItem = currentEntry ? currentEntry.item : null;
  const totalRounds = deck.length;

  const clearPendingTimers = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    if (promptTimerRef.current) {
      clearTimeout(promptTimerRef.current);
      promptTimerRef.current = null;
    }
    if (wobbleTimerRef.current) {
      clearTimeout(wobbleTimerRef.current);
      wobbleTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearPendingTimers();
      cancelHoverSpeech();
      stopSpeech();
    };
  }, [clearPendingTimers]);

  // Speak question cleanly whenever round changes
  useEffect(() => {
    if (isGameOver || !targetItem) return undefined;
    if (promptTimerRef.current) clearTimeout(promptTimerRef.current);

    if (!isMuted) {
      promptTimerRef.current = setTimeout(() => {
        speakEnglish(targetItem.questionEn);
      }, 260);
    }

    return () => {
      if (promptTimerRef.current) {
        clearTimeout(promptTimerRef.current);
        promptTimerRef.current = null;
      }
    };
  }, [roundIdx, isGameOver, targetItem, isMuted]);

  const finishOrAdvanceRound = useCallback(
    (nextIndex) => {
      clearPendingTimers();
      const latestDeck = deckRef.current;
      if (nextIndex >= latestDeck.length) {
        setIsGameOver(true);
        setEchoPhrase(null);
        setHypeMessage('');
        setIsRoundLocked(false);
        playVictoryFanfare(isMuted);
        confetti({
          particleCount: 110,
          spread: 100,
          origin: { y: 0.5 },
        });
        if (onRewardEarned) {
          onRewardEarned({ stars: 5, bricks: 3 });
        }
        return;
      }

      const nextEntry = latestDeck[nextIndex];
      setRoundIdx(nextIndex);
      setOptions(buildRoundOptions(nextEntry.item, selectedCategory));
      setPoppedIds(new Set());
      setEchoPhrase(null);
      setHypeMessage('');
      setWrongCountInRound(0);
      setWobbleId(null);
      setIsRoundLocked(false);
    },
    [clearPendingTimers, isMuted, onRewardEarned, selectedCategory]
  );

  const handleBalloonClick = (item) => {
    if (!targetItem || isRoundLocked || poppedIds.has(item.id)) return;

    cancelHoverSpeech();
    unlockAudio();
    playSnap(isMuted);

    if (item.id === targetItem.id) {
      setIsRoundLocked(true);
      playStarSparkle(isMuted);

      const newPopped = new Set(poppedIds);
      newPopped.add(item.id);
      setPoppedIds(newPopped);
      setScore((prev) => prev + 1);
      setEchoPhrase(targetItem.repeatPhrase);

      setMasteredIds((prev) => {
        if (prev.has(targetItem.id)) return prev;
        const updated = new Set(prev);
        updated.add(targetItem.id);
        saveIdSet(BALLOON_MASTERED_KEY, updated);
        return updated;
      });

      if (wrongCountInRound === 0) {
        setReviewIds((prev) => {
          if (!prev.has(targetItem.id)) return prev;
          const updated = new Set(prev);
          updated.delete(targetItem.id);
          saveIdSet(BALLOON_REVIEW_KEY, updated);
          return updated;
        });
      }

      const nextStreak = wrongCountInRound === 0 ? streak + 1 : 1;
      setStreak(nextStreak);

      const bonusStars = nextStreak >= 3 ? 2 : 1;
      if (onRewardEarned) {
        onRewardEarned({ stars: bonusStars, bricks: 1 });
      }

      if (nextStreak === 2) {
        setHypeMessage('🔥 2x Streak! Awesome!');
      } else if (nextStreak === 3) {
        setHypeMessage('⚡ 3x Super Combo! (+1 Bonus ⭐)');
      } else if (nextStreak >= 4) {
        setHypeMessage(`👑 ${nextStreak}x Unstoppable! (+1 Bonus ⭐)`);
      } else {
        setHypeMessage('');
      }

      confetti({
        particleCount: nextStreak >= 2 ? 75 : 50,
        spread: nextStreak >= 2 ? 85 : 65,
        origin: { y: 0.6 },
      });

      if (nextStreak >= 2) {
        confetti({
          particleCount: 38,
          angle: 60,
          spread: 55,
          origin: { x: 0.1, y: 0.65 },
        });
        confetti({
          particleCount: 38,
          angle: 120,
          spread: 55,
          origin: { x: 0.9, y: 0.65 },
        });
      }

      const nextIdx = roundIdx + 1;
      const moveNext = () => finishOrAdvanceRound(nextIdx);

      if (!isMuted) {
        advanceTimerRef.current = setTimeout(moveNext, 4800);
        speakEnglish(`Great job! ${targetItem.repeatPhrase}`, () => {
          if (advanceTimerRef.current) {
            clearTimeout(advanceTimerRef.current);
            advanceTimerRef.current = setTimeout(moveNext, 650);
          }
        });
      } else {
        advanceTimerRef.current = setTimeout(moveNext, 1300);
      }
      return;
    }

    // Wrong balloon: reset combo, gentle wobble, teach word, and queue review
    setStreak(0);
    setHypeMessage('');
    playGentleWobble(isMuted);
    setWobbleId(item.id);
    if (wobbleTimerRef.current) clearTimeout(wobbleTimerRef.current);
    wobbleTimerRef.current = setTimeout(() => setWobbleId(null), 550);

    setWrongCountInRound((prev) => prev + 1);

    setReviewIds((prev) => {
      if (prev.has(targetItem.id)) return prev;
      const updated = new Set(prev);
      updated.add(targetItem.id);
      saveIdSet(BALLOON_REVIEW_KEY, updated);
      return updated;
    });

    if (!currentEntry?.isReview && !missedIdsQueued.has(targetItem.id)) {
      const nextQueued = new Set(missedIdsQueued);
      nextQueued.add(targetItem.id);
      setMissedIdsQueued(nextQueued);
      setDeck((prev) => [...prev, { item: targetItem, isReview: true }]);
    }

    if (!isMuted) {
      speakEnglish(`That is ${item.word}! ${targetItem.questionEn}`);
    }
  };

  const startFreshDeck = (categoryId = selectedCategory) => {
    clearPendingTimers();
    cancelHoverSpeech();
    unlockAudio();
    playTap(isMuted);
    const freshDeck = createInitialDeck(categoryId, masteredIds, reviewIds);
    setSelectedCategory(categoryId);
    setDeck(freshDeck);
    setRoundIdx(0);
    setScore(0);
    setStreak(0);
    setHypeMessage('');
    setOptions(buildRoundOptions(freshDeck[0].item, categoryId));
    setPoppedIds(new Set());
    setIsRoundLocked(false);
    setEchoPhrase(null);
    setWrongCountInRound(0);
    setMissedIdsQueued(new Set());
    setWobbleId(null);
    setIsGameOver(false);
  };

  const handleRestartGame = () => {
    startFreshDeck(selectedCategory);
  };

  // Desktop keyboard shortcuts: 1/2/3 pop balloons, Space replays prompt
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (isGameOver || !targetItem) return;

      if (e.key === '1' || e.key === '2' || e.key === '3') {
        const chosen = options[Number(e.key) - 1];
        if (chosen) handleBalloonClick(chosen);
      } else if (e.code === 'Space') {
        e.preventDefault();
        unlockAudio();
        speakEnglish(targetItem.questionEn);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div className="w-full max-w-none px-3 sm:px-6 lg:px-10 py-4 flex-1 flex flex-col items-center select-none">
      {/* Compact Header Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-3 bg-white p-3 sm:p-4 rounded-2xl shadow-sm border-2 border-rose-200">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎈</span>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display font-black text-lg sm:text-xl text-slate-900">
              {masteredIds.size} / {VOCAB_BANK_500.length}
            </h2>
            {currentEntry?.isReview && !isGameOver && (
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-400">
                <Repeat className="w-3.5 h-3.5" />
                <span>Review</span>
              </span>
            )}
          </div>
        </div>

        {/* Score, Combo Streak & Round Pill */}
        <div className="flex items-center gap-2 flex-wrap">
          {streak >= 2 && (
            <div className="flex items-center gap-1 bg-orange-500 text-white px-3 py-1 rounded-xl text-xs sm:text-sm font-display font-black shadow-sm animate-bounce">
              <span>🔥 {streak}x Streak!</span>
            </div>
          )}
          {reviewIds.size > 0 && (
            <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-300 px-3 py-1 rounded-xl text-xs sm:text-sm font-display font-black" title="Missed words return soon for extra practice">
              <span>🔁 {reviewIds.size} Review</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-xl text-xs sm:text-sm font-display font-black">
            <span>Score: {score}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-yellow-400/20 text-yellow-800 border border-yellow-400/50 px-3 py-1 rounded-xl text-xs sm:text-sm font-display font-black">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>
              Round {Math.min(roundIdx + 1, totalRounds)} / {totalRounds}
            </span>
          </div>

          <button
            type="button"
            onClick={handleRestartGame}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition-all cursor-pointer"
            title="Play Again"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="w-full flex items-center gap-2 overflow-x-auto pb-2 mb-3">
        {VOCAB_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => startFreshDeck(cat.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display font-bold text-xs border-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-rose-500 text-white border-rose-700 shadow-sm scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.labelEn || cat.labelTr}</span>
            </button>
          );
        })}
      </div>

      {/* Question Prompt Banner (Hover or Click to Listen) */}
      {targetItem && !isGameOver && (
        <div
          onPointerEnter={(e) =>
            triggerHoverSpeech(targetItem.questionEn, {
              isMuted,
              pointerType: e.pointerType,
            })
          }
          onPointerLeave={cancelHoverSpeech}
          className="w-full bg-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-xl border-4 border-slate-800 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                cancelHoverSpeech();
                unlockAudio();
                speakEnglish(targetItem.questionEn);
              }}
              className="w-14 h-14 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 flex items-center justify-center shadow-lg transition-transform active:scale-95 flex-shrink-0 cursor-pointer"
              title="Listen"
            >
              <Volume2 className="w-7 h-7" />
            </button>

            <div>
              <span className="text-xs font-bold text-yellow-300/90 uppercase tracking-wider block">
                {currentEntry?.isReview
                  ? '🔁 Review Time! Pop the right balloon:'
                  : '🎯 Listen and pop the right balloon (Keys 1, 2, 3):'}
              </span>
              <p className="font-display font-black text-xl sm:text-2xl lg:text-3xl text-white leading-snug mt-0.5">
                {targetItem.questionEn}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Repeat-After-Me Echo Banner + Combo Hype when Balloon Pops */}
      {echoPhrase && !isGameOver && (
        <div className="w-full mb-4 bg-emerald-50 border-4 border-emerald-400 rounded-2xl p-3.5 sm:p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🗣️</span>
            <div>
              {hypeMessage && (
                <div className="inline-block mb-1 px-2.5 py-0.5 rounded-full bg-orange-500 text-white font-display font-black text-xs shadow-sm">
                  {hypeMessage}
                </div>
              )}
              <div className="text-xs font-black text-emerald-700 uppercase">
                Awesome! Now say it aloud:
              </div>
              <div className="font-display font-black text-lg sm:text-2xl text-emerald-950">
                “{echoPhrase}”
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                unlockAudio();
                speakEnglish(echoPhrase);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border-2 border-emerald-300 text-emerald-800 font-black text-xs hover:bg-emerald-100 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Listen Again</span>
            </button>
            <button
              type="button"
              onClick={() => finishOrAdvanceRound(roundIdx + 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs shadow-sm cursor-pointer"
            >
              <span>Next Balloon</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Balloon Play Sky Area */}
      {!isGameOver && (
        <div className="w-full flex-1 min-h-[48vh] sm:min-h-[54vh] bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50 rounded-3xl border-4 border-slate-300 shadow-inner relative overflow-hidden flex items-center justify-around px-3 sm:px-8 py-6">
          {/* Subtle clouds in background */}
          <div className="pointer-events-none absolute top-6 left-10 text-4xl opacity-50 select-none">
            ☁️
          </div>
          <div className="pointer-events-none absolute top-14 right-14 text-5xl opacity-40 select-none">
            ☁️
          </div>
          <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 text-3xl opacity-30 select-none">
            ☁️
          </div>

          {/* 3 Floating Balloons */}
          {options.map((balloon, idx) => {
            const isPopped = poppedIds.has(balloon.id);
            const isWobbling = wobbleId === balloon.id;

            if (isPopped) {
              return (
                <div
                  key={balloon.id}
                  className="relative w-36 sm:w-44 h-44 flex flex-col items-center justify-center pointer-events-none"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="w-28 h-28 rounded-full border-4 border-yellow-400/80 animate-ping" />
                  </div>
                  <div className="relative flex flex-col items-center animate-balloon-pop">
                    <div className="flex items-center gap-1 text-4xl sm:text-5xl">
                      <span>✨</span>
                      <span className="text-6xl">💥</span>
                      <span>🎊</span>
                    </div>
                    <span className="font-display font-black text-sm sm:text-base text-amber-700 bg-yellow-200 px-3 py-0.5 rounded-full border border-yellow-400 shadow-sm mt-1">
                      {streak >= 3 ? '+2 ⭐ COMBO!' : '+1 ⭐ Awesome!'}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={balloon.id}
                type="button"
                onPointerEnter={(e) =>
                  triggerHoverSpeech(balloon.word, {
                    isMuted,
                    pointerType: e.pointerType,
                  })
                }
                onPointerLeave={cancelHoverSpeech}
                onClick={() => handleBalloonClick(balloon)}
                className={`
                  relative flex flex-col items-center justify-center cursor-pointer transition-transform duration-200 active:scale-95
                  ${isWobbling ? 'animate-wobble' : 'animate-balloon-float hover:scale-105'}
                `}
                style={{
                  animationDuration: isWobbling ? undefined : `${2.8 + idx * 0.45}s`,
                  animationDelay: isWobbling ? undefined : `${idx * 0.35}s`,
                }}
              >
                {/* Balloon Top Oval with Lego Border */}
                <div
                  className={`
                    w-32 h-40 sm:w-40 sm:h-48 rounded-[50%/60%_60%_40%_40%] shadow-xl border-4
                    flex flex-col items-center justify-center p-3 relative
                    ${balloon.color} text-white
                  `}
                >
                  {/* Lego Stud on Balloon */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-2.5 bg-white/40 rounded-full" />

                  {/* Big Emoji */}
                  <span className="text-5xl sm:text-6xl drop-shadow-md mb-2">
                    {balloon.emoji}
                  </span>

                  {/* Word Label Capsule */}
                  <div className="bg-white/95 text-slate-900 font-display font-black text-sm sm:text-base px-3 py-0.5 rounded-full shadow-sm">
                    {balloon.word}
                  </div>
                </div>

                {/* Balloon Knot */}
                <div className="w-3.5 h-3.5 bg-amber-800 rotate-45 -mt-1.5 rounded-xs" />

                {/* Balloon String */}
                <div className="w-0.5 h-14 bg-slate-400/80 mt-0.5" />
              </button>
            );
          })}
        </div>
      )}

      {/* Game Over / Victory Screen */}
      {isGameOver && (
        <div className="w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 text-slate-950 rounded-3xl shadow-xl p-6 mb-4 border-4 border-yellow-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white text-4xl flex items-center justify-center shadow-md">
                🏆
              </div>
              <div>
                <h3 className="font-display font-black text-2xl text-slate-950">
                  Super Balloon Champion!
                </h3>
                <p className="text-sm font-bold text-slate-900">
                  You popped all {totalRounds} rounds! +5 Stars ⭐ and +3 Bricks 🧱!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRestartGame}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-display font-black text-sm shadow-md hover:bg-slate-800 transition-all cursor-pointer"
              >
                Play Again 🎈
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
