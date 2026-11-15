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
  speakGerman,
  speakTurkish,
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

// Rich comprehension + vocabulary challenges for 7-year-old learners
const BALLOON_CHALLENGES = [
  {
    id: 'cat',
    word: 'Cat',
    emoji: '🐱',
    color: 'bg-orange-500 border-orange-700',
    de: 'Katze',
    tr: 'Kedi',
    questionEn: 'Which cute pet says "Meow, meow"?',
    repeatPhrase: 'A cat says meow!',
  },
  {
    id: 'dog',
    word: 'Dog',
    emoji: '🐶',
    color: 'bg-amber-500 border-amber-700',
    de: 'Hund',
    tr: 'Köpek',
    questionEn: 'Which friendly animal says "Woof, woof" and loves bones?',
    repeatPhrase: 'A dog says woof!',
  },
  {
    id: 'lion',
    word: 'Lion',
    emoji: '🦁',
    color: 'bg-yellow-500 border-yellow-700',
    de: 'Löwe',
    tr: 'Aslan',
    questionEn: 'Who is the loud king of the jungle?',
    repeatPhrase: 'The lion is the king!',
  },
  {
    id: 'seven',
    word: 'Seven',
    emoji: '7️⃣',
    color: 'bg-indigo-500 border-indigo-700',
    de: 'Sieben',
    tr: 'Yedi',
    questionEn: 'Count carefully: five plus two equals what number?',
    repeatPhrase: 'Five plus two is seven!',
  },
  {
    id: 'airplane',
    word: 'Airplane',
    emoji: '✈️',
    color: 'bg-sky-500 border-sky-700',
    de: 'Flugzeug',
    tr: 'Uçak',
    questionEn: 'Which machine flies high above the clouds?',
    repeatPhrase: 'An airplane flies in the sky!',
  },
  {
    id: 'rocket',
    word: 'Rocket',
    emoji: '🚀',
    color: 'bg-rose-500 border-rose-700',
    de: 'Rakete',
    tr: 'Roket',
    questionEn: 'Which fast ship blasts off to the moon and stars?',
    repeatPhrase: 'A rocket goes to space!',
  },
  {
    id: 'train',
    word: 'Train',
    emoji: '🚂',
    color: 'bg-purple-500 border-purple-700',
    de: 'Zug',
    tr: 'Tren',
    questionEn: 'Which long vehicle rides on iron tracks and says "Choo-choo"?',
    repeatPhrase: 'The train goes on the tracks!',
  },
  {
    id: 'apple',
    word: 'Apple',
    emoji: '🍎',
    color: 'bg-emerald-500 border-emerald-700',
    de: 'Apfel',
    tr: 'Elma',
    questionEn: 'Which sweet crunchy red fruit grows on trees?',
    repeatPhrase: 'I like red apples!',
  },
  {
    id: 'banana',
    word: 'Banana',
    emoji: '🍌',
    color: 'bg-yellow-400 border-yellow-600',
    de: 'Banane',
    tr: 'Muz',
    questionEn: 'Which long yellow fruit do monkeys love to eat?',
    repeatPhrase: 'Monkeys love yellow bananas!',
  },
  {
    id: 'backpack',
    word: 'Backpack',
    emoji: '🎒',
    color: 'bg-blue-600 border-blue-800',
    de: 'Rucksack',
    tr: 'Sırt Çantası',
    questionEn: 'What do you wear on your back to carry books to school?',
    repeatPhrase: 'I carry my backpack to school!',
  },
  {
    id: 'clock',
    word: 'Clock',
    emoji: '⏰',
    color: 'bg-red-500 border-red-700',
    de: 'Uhr',
    tr: 'Saat',
    questionEn: 'What tells you the time when you wake up in the morning?',
    repeatPhrase: 'The clock tells the time!',
  },
  {
    id: 'star',
    word: 'Star',
    emoji: '⭐',
    color: 'bg-amber-400 border-amber-600',
    de: 'Stern',
    tr: 'Yıldız',
    questionEn: 'Which bright yellow shape shines in the night sky?',
    repeatPhrase: 'A golden star shines at night!',
  },
  {
    id: 'triangle',
    word: 'Triangle',
    emoji: '🔺',
    color: 'bg-red-600 border-red-800',
    de: 'Dreieck',
    tr: 'Üçgen',
    questionEn: 'Which red shape has exactly three corners and three sides?',
    repeatPhrase: 'A triangle has three sides!',
  },
  {
    id: 'blue',
    word: 'Blue',
    emoji: '🔵',
    color: 'bg-blue-500 border-blue-700',
    de: 'Blau',
    tr: 'Mavi',
    questionEn: 'What color is the clear daytime sky and the deep ocean?',
    repeatPhrase: 'The sky is blue!',
  },
  {
    id: 'green',
    word: 'Green',
    emoji: '🟢',
    color: 'bg-green-500 border-green-700',
    de: 'Grün',
    tr: 'Yeşil',
    questionEn: 'What color are fresh leaves on trees and grass in the park?',
    repeatPhrase: 'The grass is green!',
  },
  {
    id: 'cake',
    word: 'Cake',
    emoji: '🎂',
    color: 'bg-pink-500 border-pink-700',
    de: 'Kuchen',
    tr: 'Pasta',
    questionEn: 'What sweet treat has candles on top for your birthday?',
    repeatPhrase: 'Happy birthday! Let us eat cake!',
  },
  {
    id: 'bricks',
    word: 'Bricks',
    emoji: '🧱',
    color: 'bg-orange-600 border-orange-800',
    de: 'Bausteine',
    tr: 'Lego Parçaları',
    questionEn: 'What colorful blocks do we snap together to build tall towers?',
    repeatPhrase: 'I build towers with Lego bricks!',
  },
  {
    id: 'bicycle',
    word: 'Bicycle',
    emoji: '🚲',
    color: 'bg-teal-500 border-teal-700',
    de: 'Fahrrad',
    tr: 'Bisiklet',
    questionEn: 'Which fun ride has two wheels and pedals you push with your feet?',
    repeatPhrase: 'I can ride my bicycle!',
  },
];

const INITIAL_ROUNDS = 8;

function shuffleArray(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildRoundOptions(target) {
  const others = shuffleArray(BALLOON_CHALLENGES.filter((b) => b.id !== target.id));
  return shuffleArray([target, others[0], others[1]]);
}

function createInitialDeck() {
  return shuffleArray(BALLOON_CHALLENGES)
    .slice(0, INITIAL_ROUNDS)
    .map((item) => ({ item, isReview: false }));
}

export default function BalloonPopGame({
  onRewardEarned,
  isMuted = false,
}) {
  const [deck, setDeck] = useState(() => createInitialDeck());
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState(() => buildRoundOptions(deck[0].item));
  const [poppedIds, setPoppedIds] = useState(() => new Set());
  const [isRoundLocked, setIsRoundLocked] = useState(false);
  const [echoPhrase, setEchoPhrase] = useState(null);
  const [wrongCountInRound, setWrongCountInRound] = useState(0);
  const [missedIdsQueued, setMissedIdsQueued] = useState(() => new Set());
  const [isGameOver, setIsGameOver] = useState(false);
  const [wobbleId, setWobbleId] = useState(null);

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
    (nextIndex, activeDeckLength) => {
      clearPendingTimers();
      if (nextIndex >= activeDeckLength) {
        setIsGameOver(true);
        setEchoPhrase(null);
        setIsRoundLocked(false);
        playVictoryFanfare(isMuted);
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.5 },
        });
        if (onRewardEarned) {
          onRewardEarned({ stars: 5, bricks: 3 });
        }
        return;
      }

      const nextEntry = deck[nextIndex];
      setRoundIdx(nextIndex);
      setOptions(buildRoundOptions(nextEntry.item));
      setPoppedIds(new Set());
      setEchoPhrase(null);
      setWrongCountInRound(0);
      setWobbleId(null);
      setIsRoundLocked(false);
    },
    [clearPendingTimers, deck, isMuted, onRewardEarned]
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

      if (onRewardEarned) {
        onRewardEarned({ stars: 1, bricks: 1 });
      }

      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.6 },
      });

      const nextIdx = roundIdx + 1;
      const currentDeckLen = deck.length;
      const moveNext = () => finishOrAdvanceRound(nextIdx, currentDeckLen);

      if (!isMuted) {
        // Safety fallback so round never stalls if speech fails to fire onEnd
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

    // Wrong balloon: gentle wobble, teach the clicked word, and schedule spaced review
    playGentleWobble(isMuted);
    setWobbleId(item.id);
    if (wobbleTimerRef.current) clearTimeout(wobbleTimerRef.current);
    wobbleTimerRef.current = setTimeout(() => setWobbleId(null), 550);

    setWrongCountInRound((prev) => prev + 1);

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

  const handleRestartGame = () => {
    clearPendingTimers();
    cancelHoverSpeech();
    unlockAudio();
    playTap(isMuted);
    const freshDeck = createInitialDeck();
    setDeck(freshDeck);
    setRoundIdx(0);
    setScore(0);
    setOptions(buildRoundOptions(freshDeck[0].item));
    setPoppedIds(new Set());
    setIsRoundLocked(false);
    setEchoPhrase(null);
    setWrongCountInRound(0);
    setMissedIdsQueued(new Set());
    setWobbleId(null);
    setIsGameOver(false);
  };

  return (
    <div className="w-full max-w-none px-3 sm:px-6 lg:px-10 py-4 flex-1 flex flex-col items-center select-none">
      {/* Header Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4 bg-white p-3 sm:p-4 rounded-2xl shadow-md border-4 border-rose-400">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-2xl shadow-md border-2 border-rose-600">
            🎈
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-black text-lg sm:text-xl text-slate-800">
                Lego Balloon Pop!
              </h2>
              <span className="bg-rose-100 text-rose-800 text-[11px] font-black px-2 py-0.5 rounded-full border border-rose-300 uppercase">
                Dinle • Bul • Tekrar Et
              </span>
              {currentEntry?.isReview && !isGameOver && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-amber-400">
                  <Repeat className="w-3 h-3" />
                  <span>Tekrar Turu</span>
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-500">
              Soruyu dinle, doğru balonu patlat ve cümleyi tekrar et! Üstüne gelince sesli okur.
            </p>
          </div>
        </div>

        {/* Score & Round Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-xl text-xs sm:text-sm font-display font-black">
            <span>Skor: {score}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-yellow-400/20 text-yellow-800 border border-yellow-400/50 px-3 py-1 rounded-xl text-xs sm:text-sm font-display font-black">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>
              Tur {Math.min(roundIdx + 1, totalRounds)} / {totalRounds}
            </span>
          </div>

          <button
            type="button"
            onClick={handleRestartGame}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition-all cursor-pointer"
            title="Oyunu Yeniden Başlat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
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
              title="Soruyu Dinle"
            >
              <Volume2 className="w-7 h-7" />
            </button>

            <div>
              <span className="text-xs font-bold text-yellow-300/90 uppercase tracking-wider block">
                {currentEntry?.isReview
                  ? '🔁 Tekrar Zamanı! Doğru balonu bul:'
                  : '🎯 Soruyu dinle ve doğru balonu patlat:'}
              </span>
              <p className="font-display font-black text-xl sm:text-2xl lg:text-3xl text-white leading-snug mt-0.5">
                {targetItem.questionEn}
              </p>
            </div>
          </div>

          {/* Bilingual Helper Pills (appear gently or on tap) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                cancelHoverSpeech();
                unlockAudio();
                speakGerman(targetItem.de);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
              title="Almanca İpucu"
            >
              <span>🇩🇪</span>
              <span>{wrongCountInRound > 0 ? targetItem.de : 'İpucu'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                cancelHoverSpeech();
                unlockAudio();
                speakTurkish(targetItem.tr);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
              title="Türkçe İpucu"
            >
              <span>🇹🇷</span>
              <span>{wrongCountInRound > 0 ? targetItem.tr : 'İpucu'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Repeat-After-Me Echo Banner when Balloon Pops */}
      {echoPhrase && !isGameOver && (
        <div className="w-full mb-4 bg-emerald-50 border-4 border-emerald-400 rounded-2xl p-3.5 sm:p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🗣️</span>
            <div>
              <div className="text-xs font-black text-emerald-700 uppercase">
                Süper! Şimdi sesli tekrar et:
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
              <span>Tekrar Dinle</span>
            </button>
            <button
              type="button"
              onClick={() => finishOrAdvanceRound(roundIdx + 1, totalRounds)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs shadow-sm cursor-pointer"
            >
              <span>Sonraki Balon</span>
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
                  className="w-32 sm:w-40 flex flex-col items-center justify-center animate-balloon-pop pointer-events-none"
                >
                  <span className="text-6xl">💥</span>
                  <span className="font-display font-black text-sm text-emerald-700 mt-1">
                    +1 🧱
                  </span>
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
                  Süper Balon Şampiyonu!
                </h3>
                <p className="text-sm font-bold text-slate-900">
                  {totalRounds} turun tamamını başarıyla patlattın! +5 Yıldız ⭐ ve +3 Lego Parçası 🧱 kazandın!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRestartGame}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-display font-black text-sm shadow-md hover:bg-slate-800 transition-all cursor-pointer"
              >
                Tekrar Oyna 🎈
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
