import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { speakEnglish, stopSpeech } from '../utils/speech';
import { playSnap, playStarSparkle, playGentleWobble, playTap, playVictoryFanfare } from '../utils/soundEffects';

const LINE_COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

function buildCurvyPath(x1, y1, x2, y2, curveSeed = 0) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  // Gentle human-like S-curve / arc offset so each line feels hand-drawn
  const arc = (curveSeed % 2 === 0 ? 1 : -1) * (16 + (curveSeed % 3) * 8);
  const cx1 = x1 + dx * 0.36;
  const cy1 = y1 + dy * 0.15 + arc;
  const cx2 = x1 + dx * 0.64;
  const cy2 = y2 - dy * 0.15 - arc * 0.7;
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${cx2.toFixed(1)} ${cy2.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

const RHYME_SETS = [
  [
    { id: 'cat', left: { word: 'Cat', emoji: '🐱' }, right: { word: 'Hat', emoji: '🎩' } },
    { id: 'dog', left: { word: 'Dog', emoji: '🐶' }, right: { word: 'Frog', emoji: '🐸' } },
    { id: 'sun', left: { word: 'Sun', emoji: '☀️' }, right: { word: 'Run', emoji: '🏃' } },
    { id: 'ball', left: { word: 'Ball', emoji: '⚽' }, right: { word: 'Tall', emoji: '🦒' } },
  ],
  [
    { id: 'star', left: { word: 'Star', emoji: '⭐' }, right: { word: 'Car', emoji: '🏎️' } },
    { id: 'cake', left: { word: 'Cake', emoji: '🎂' }, right: { word: 'Snake', emoji: '🐍' } },
    { id: 'bee', left: { word: 'Bee', emoji: '🐝' }, right: { word: 'Tree', emoji: '🌳' } },
    { id: 'fox', left: { word: 'Fox', emoji: '🦊' }, right: { word: 'Box', emoji: '📦' } },
  ],
  [
    { id: 'boat', left: { word: 'Boat', emoji: '⛵' }, right: { word: 'Coat', emoji: '🧥' } },
    { id: 'moon', left: { word: 'Moon', emoji: '🌙' }, right: { word: 'Spoon', emoji: '🥄' } },
    { id: 'bed', left: { word: 'Bed', emoji: '🛏️' }, right: { word: 'Red', emoji: '🔴' } },
    { id: 'mouse', left: { word: 'Mouse', emoji: '🐭' }, right: { word: 'House', emoji: '🏠' } },
  ],
  [
    { id: 'bear', left: { word: 'Bear', emoji: '🐻' }, right: { word: 'Pear', emoji: '🍐' } },
    { id: 'duck', left: { word: 'Duck', emoji: '🦆' }, right: { word: 'Truck', emoji: '🚚' } },
    { id: 'king', left: { word: 'King', emoji: '🤴' }, right: { word: 'Ring', emoji: '💍' } },
    { id: 'train', left: { word: 'Train', emoji: '🚂' }, right: { word: 'Rain', emoji: '🌧️' } },
  ],
  [
    { id: 'ship', left: { word: 'Ship', emoji: '🚢' }, right: { word: 'Trip', emoji: '🧳' } },
    { id: 'fish', left: { word: 'Fish', emoji: '🐟' }, right: { word: 'Dish', emoji: '🍽️' } },
    { id: 'book', left: { word: 'Book', emoji: '📖' }, right: { word: 'Cook', emoji: '👨‍🍳' } },
    { id: 'clock', left: { word: 'Clock', emoji: '⏰' }, right: { word: 'Rock', emoji: '🪨' } },
  ],
];

export default function RhymingPairsGame({ onRewardEarned, isMuted = false }) {
  const [setIdx, setSetIdx] = useState(0);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [wrongRightId, setWrongRightId] = useState(null);
  const [pointerPos, setPointerPos] = useState(null);
  const [lineCoords, setLineCoords] = useState([]);
  const [activeStartPos, setActiveStartPos] = useState(null);

  const rhymeTimerRef = useRef(null);
  const wrongTimerRef = useRef(null);
  const boardRef = useRef(null);
  const leftDotRefs = useRef({});
  const rightDotRefs = useRef({});

  useEffect(() => {
    return () => {
      if (rhymeTimerRef.current) clearTimeout(rhymeTimerRef.current);
      if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
      stopSpeech();
    };
  }, []);

  const pairs = RHYME_SETS[setIdx % RHYME_SETS.length];
  const shuffledRight = useMemo(
    () => [...pairs].sort((a, b) => a.right.word.localeCompare(b.right.word)),
    [pairs]
  );

  const recomputeLines = useCallback(() => {
    const board = boardRef.current;
    if (!board) return;
    const boardRect = board.getBoundingClientRect();

    const nextLines = matchedIds
      .map((id, idx) => {
        const lEl = leftDotRefs.current[id];
        const rEl = rightDotRefs.current[id];
        if (!lEl || !rEl) return null;
        const lRect = lEl.getBoundingClientRect();
        const rRect = rEl.getBoundingClientRect();
        const x1 = lRect.left + lRect.width / 2 - boardRect.left;
        const y1 = lRect.top + lRect.height / 2 - boardRect.top;
        const x2 = rRect.left + rRect.width / 2 - boardRect.left;
        const y2 = rRect.top + rRect.height / 2 - boardRect.top;
        const pairIndex = pairs.findIndex((p) => p.id === id);
        return {
          id,
          d: buildCurvyPath(x1, y1, x2, y2, pairIndex >= 0 ? pairIndex : idx),
          color: LINE_COLORS[(pairIndex >= 0 ? pairIndex : idx) % LINE_COLORS.length],
        };
      })
      .filter(Boolean);
    setLineCoords(nextLines);

    if (selectedLeft) {
      const selEl = leftDotRefs.current[selectedLeft.id];
      if (selEl) {
        const sRect = selEl.getBoundingClientRect();
        setActiveStartPos({
          x: sRect.left + sRect.width / 2 - boardRect.left,
          y: sRect.top + sRect.height / 2 - boardRect.top,
        });
      }
    } else {
      setActiveStartPos(null);
    }
  }, [matchedIds, pairs, selectedLeft]);

  useEffect(() => {
    const raf = requestAnimationFrame(recomputeLines);
    window.addEventListener('resize', recomputeLines);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', recomputeLines);
    };
  }, [recomputeLines]);

  const handleLeftClick = (pair) => {
    if (matchedIds.includes(pair.id)) return;
    playSnap(isMuted);
    setSelectedLeft(pair);
    setWrongRightId(null);
    if (!isMuted) speakEnglish(pair.left.word);
  };

  const handleRightClick = (pair) => {
    if (matchedIds.includes(pair.id)) return;
    if (!isMuted) speakEnglish(pair.right.word);
    if (!selectedLeft) return;

    if (selectedLeft.id === pair.id) {
      playStarSparkle(isMuted);
      const next = [...matchedIds, pair.id];
      setMatchedIds(next);
      setSelectedLeft(null);
      setPointerPos(null);
      setWrongRightId(null);
      if (!isMuted) {
        if (rhymeTimerRef.current) clearTimeout(rhymeTimerRef.current);
        rhymeTimerRef.current = setTimeout(() => speakEnglish(`${pair.left.word} and ${pair.right.word} rhyme!`), 320);
      }
      if (next.length === pairs.length) {
        playVictoryFanfare(isMuted);
        confetti({ particleCount: 65, spread: 65, origin: { y: 0.65 } });
        if (onRewardEarned) onRewardEarned(5);
      }
    } else {
      playGentleWobble(isMuted);
      setWrongRightId(pair.id);
      if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
      wrongTimerRef.current = setTimeout(() => setWrongRightId(null), 650);
    }
  };

  const handleNextSet = () => {
    playTap(isMuted);
    if (rhymeTimerRef.current) clearTimeout(rhymeTimerRef.current);
    if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
    stopSpeech();
    setSetIdx((i) => i + 1);
    setSelectedLeft(null);
    setMatchedIds([]);
    setPointerPos(null);
    setWrongRightId(null);
  };

  const allDone = matchedIds.length === pairs.length;

  return (
    <div className="w-full max-w-3xl mx-auto px-3 py-4">
      <div className="bg-white rounded-3xl shadow-xl border-4 border-purple-200 p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-2">
              <span>🎵</span>
              <span>Rhyming Pairs</span>
            </h2>
            <p className="text-sm font-bold text-slate-500">
              Pick a word on the left, then find its rhyme on the right! ({matchedIds.length}/{pairs.length})
            </p>
          </div>
          <button
            type="button"
            onClick={handleNextSet}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Set</span>
          </button>
        </div>

        <div
          ref={boardRef}
          onPointerMove={(e) => {
            if (!selectedLeft || !boardRef.current) return;
            const rect = boardRef.current.getBoundingClientRect();
            setPointerPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
          onPointerLeave={() => setPointerPos(null)}
          className="relative grid grid-cols-2 gap-10 sm:gap-20"
        >
          {/* Hand-drawn style curved SVG lines connecting matched pairs + live drawing preview */}
          <svg
            className="pointer-events-none absolute inset-0 w-full h-full z-10 overflow-visible"
            aria-hidden="true"
          >
            {lineCoords.map((line) => (
              <path
                key={line.id}
                d={line.d}
                fill="none"
                stroke={line.color}
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.9"
              />
            ))}
            {selectedLeft && activeStartPos && pointerPos && (
              <path
                d={buildCurvyPath(activeStartPos.x, activeStartPos.y, pointerPos.x, pointerPos.y, 0)}
                fill="none"
                stroke="#eab308"
                strokeWidth="5"
                strokeDasharray="10 8"
                strokeLinecap="round"
              />
            )}
          </svg>

          {/* Left Column */}
          <div className="space-y-3.5 relative z-20">
            {pairs.map((pair, pIdx) => {
              const isMatched = matchedIds.includes(pair.id);
              const isSelected = selectedLeft?.id === pair.id;
              const lineColor = LINE_COLORS[pIdx % LINE_COLORS.length];
              return (
                <button
                  key={pair.id}
                  type="button"
                  onClick={() => handleLeftClick(pair)}
                  className={`relative w-full p-4 rounded-2xl border-3 flex items-center justify-between gap-2 cursor-pointer transition shadow-sm ${
                    isMatched
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                      : isSelected
                      ? 'bg-yellow-100 border-yellow-500 scale-[1.03] ring-4 ring-yellow-300/60'
                      : 'bg-slate-50 hover:bg-purple-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl leading-none">{pair.left.emoji}</span>
                    <span className="font-display font-black text-lg sm:text-xl text-slate-900">
                      {pair.left.word}
                    </span>
                  </div>
                  <Volume2 className="w-4 h-4 text-purple-600 flex-shrink-0 mr-2" />
                  <span
                    ref={(el) => {
                      leftDotRefs.current[pair.id] = el;
                    }}
                    style={isMatched ? { backgroundColor: lineColor, borderColor: lineColor } : undefined}
                    className={`absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-3 border-white shadow-sm transition ${
                      isMatched
                        ? ''
                        : isSelected
                        ? 'bg-yellow-500 scale-125'
                        : 'bg-purple-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-3.5 relative z-20">
            {shuffledRight.map((pair) => {
              const isMatched = matchedIds.includes(pair.id);
              const isWrong = wrongRightId === pair.id;
              const origIdx = pairs.findIndex((p) => p.id === pair.id);
              const lineColor = LINE_COLORS[(origIdx >= 0 ? origIdx : 0) % LINE_COLORS.length];
              return (
                <button
                  key={pair.id}
                  type="button"
                  onClick={() => handleRightClick(pair)}
                  className={`relative w-full p-4 rounded-2xl border-3 flex items-center justify-between gap-2 cursor-pointer transition shadow-sm ${
                    isMatched
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                      : isWrong
                      ? 'bg-rose-50 border-rose-400 animate-wobble'
                      : selectedLeft
                      ? 'bg-white hover:bg-pink-50 border-pink-300'
                      : 'bg-slate-50 hover:bg-pink-50 border-slate-200'
                  }`}
                >
                  <span
                    ref={(el) => {
                      rightDotRefs.current[pair.id] = el;
                    }}
                    style={isMatched ? { backgroundColor: lineColor, borderColor: lineColor } : undefined}
                    className={`absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-3 border-white shadow-sm transition ${
                      isMatched ? '' : selectedLeft ? 'bg-pink-500 animate-pulse' : 'bg-pink-300'
                    }`}
                  />
                  <div className="flex items-center gap-2.5 ml-2">
                    <span className="text-3xl leading-none">{pair.right.emoji}</span>
                    <span className="font-display font-black text-lg sm:text-xl text-slate-900">
                      {pair.right.word}
                    </span>
                  </div>
                  <Volume2 className="w-4 h-4 text-pink-600 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {allDone && (
          <div className="mt-5 bg-emerald-100 border-2 border-emerald-400 rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 font-display font-black text-lg text-emerald-900">
              <Sparkles className="w-6 h-6 text-emerald-600" />
              <span>Awesome! You found all the rhymes! (+5 ⭐)</span>
            </div>
            <button
              type="button"
              onClick={handleNextSet}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm cursor-pointer"
            >
              Next Set →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
