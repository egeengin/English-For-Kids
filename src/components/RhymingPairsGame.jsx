import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { speakEnglish } from '../utils/speech';
import { playSnap, playStarSparkle, playGentleWobble, playTap, playVictoryFanfare } from '../utils/soundEffects';

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

  const pairs = RHYME_SETS[setIdx % RHYME_SETS.length];
  const shuffledRight = useMemo(
    () => [...pairs].sort((a, b) => a.right.word.localeCompare(b.right.word)),
    [pairs]
  );

  const handleLeftClick = (pair) => {
    if (matchedIds.includes(pair.id)) return;
    playSnap(isMuted);
    setSelectedLeft(pair);
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
      if (!isMuted) {
        setTimeout(() => speakEnglish(`${pair.left.word} and ${pair.right.word} rhyme!`), 320);
      }
      if (next.length === pairs.length) {
        playVictoryFanfare(isMuted);
        confetti({ particleCount: 65, spread: 65, origin: { y: 0.65 } });
        if (onRewardEarned) onRewardEarned(5);
      }
    } else {
      playGentleWobble(isMuted);
      setSelectedLeft(null);
    }
  };

  const handleNextSet = () => {
    playTap(isMuted);
    setSetIdx((i) => i + 1);
    setSelectedLeft(null);
    setMatchedIds([]);
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

        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="space-y-3">
            {pairs.map((pair) => {
              const isMatched = matchedIds.includes(pair.id);
              const isSelected = selectedLeft?.id === pair.id;
              return (
                <button
                  key={pair.id}
                  type="button"
                  onClick={() => handleLeftClick(pair)}
                  className={`w-full p-4 rounded-2xl border-3 flex items-center justify-between gap-2 cursor-pointer transition shadow-sm ${
                    isMatched
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                      : isSelected
                      ? 'bg-yellow-100 border-yellow-500 scale-[1.03]'
                      : 'bg-slate-50 hover:bg-purple-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl leading-none">{pair.left.emoji}</span>
                    <span className="font-display font-black text-lg sm:text-xl text-slate-900">
                      {pair.left.word}
                    </span>
                  </div>
                  <Volume2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            {shuffledRight.map((pair) => {
              const isMatched = matchedIds.includes(pair.id);
              return (
                <button
                  key={pair.id}
                  type="button"
                  onClick={() => handleRightClick(pair)}
                  className={`w-full p-4 rounded-2xl border-3 flex items-center justify-between gap-2 cursor-pointer transition shadow-sm ${
                    isMatched
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                      : 'bg-slate-50 hover:bg-pink-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
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
