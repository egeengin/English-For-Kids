import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, RotateCcw, Sparkles } from 'lucide-react';
import { VOCAB_BANK_500 } from '../data/vocabularyBank500';
import { speakEnglish } from '../utils/speech';
import { playSnap, playStarSparkle, playGentleWobble, playTap, playVictoryFanfare } from '../utils/soundEffects';

function buildMemoryDeck(pairCount = 4) {
  const pool = [...VOCAB_BANK_500].sort(() => Math.random() - 0.5).slice(0, pairCount);
  const cards = [];
  pool.forEach((item, idx) => {
    cards.push({ uid: `${item.id}-a-${idx}`, pairId: item.id, word: item.word, emoji: item.emoji, tr: item.tr });
    cards.push({ uid: `${item.id}-b-${idx}`, pairId: item.id, word: item.word, emoji: item.emoji, tr: item.tr });
  });
  return cards.sort(() => Math.random() - 0.5);
}

export default function AudioMemoryGame({ onRewardEarned, isMuted = false }) {
  const [pairCount, setPairCount] = useState(4); // 4 pairs = 8 cards (simple!)
  const [cards, setCards] = useState(() => buildMemoryDeck(4));
  const [flippedUids, setFlippedUids] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const hasRewardedRef = useRef(false);

  const startNewGame = useCallback((count = pairCount) => {
    hasRewardedRef.current = false;
    playTap(isMuted);
    setCards(buildMemoryDeck(count));
    setFlippedUids([]);
    setMatchedIds([]);
    setIsLocked(false);
    setMoves(0);
  }, [isMuted, pairCount]);

  useEffect(() => {
    if (matchedIds.length === pairCount && pairCount > 0 && !hasRewardedRef.current) {
      hasRewardedRef.current = true;
      playVictoryFanfare(isMuted);
      confetti({ particleCount: 70, spread: 65, origin: { y: 0.65 } });
      if (onRewardEarned) onRewardEarned(5);
      if (!isMuted) {
        speakEnglish('Awesome memory! You matched them all!');
      }
    }
  }, [matchedIds.length, pairCount, isMuted, onRewardEarned]);

  const handleCardClick = (card) => {
    if (isLocked) return;
    if (flippedUids.includes(card.uid) || matchedIds.includes(card.pairId)) return;

    playSnap(isMuted);
    if (!isMuted) {
      speakEnglish(card.word);
    }

    const nextFlipped = [...flippedUids, card.uid];
    setFlippedUids(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsLocked(true);
      const firstCard = cards.find((c) => c.uid === nextFlipped[0]);
      if (firstCard && firstCard.pairId === card.pairId) {
        setTimeout(() => {
          playStarSparkle(isMuted);
          setMatchedIds((prev) => [...prev, card.pairId]);
          setFlippedUids([]);
          setIsLocked(false);
        }, 420);
      } else {
        setTimeout(() => {
          playGentleWobble(isMuted);
          setFlippedUids([]);
          setIsLocked(false);
        }, 900);
      }
    }
  };

  const isAllMatched = matchedIds.length === pairCount;

  return (
    <div className="w-full max-w-4xl mx-auto px-3 py-4 flex flex-col items-center">
      <div className="w-full bg-white rounded-3xl shadow-xl border-4 border-indigo-200 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
          <div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-2">
              <span>🃏</span>
              <span>Audio Memory Match</span>
            </h2>
            <p className="text-sm font-bold text-slate-500">
              Kartları çevir, sesi dinle ve eşini bul! ({matchedIds.length}/{pairCount})
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[3, 4].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => {
                  setPairCount(cnt);
                  startNewGame(cnt);
                }}
                className={`px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm border-2 cursor-pointer transition ${
                  pairCount === cnt
                    ? 'bg-indigo-600 text-white border-indigo-800'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {cnt * 2} Kart
              </button>
            ))}
            <button
              type="button"
              onClick={() => startNewGame(pairCount)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm border-2 border-amber-600 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Yeni Oyun</span>
            </button>
          </div>
        </div>

        <div className={`grid gap-3 sm:gap-4 ${pairCount === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
          {cards.map((card) => {
            const isMatched = matchedIds.includes(card.pairId);
            const isRevealed = isMatched || flippedUids.includes(card.uid);
            return (
              <button
                key={card.uid}
                type="button"
                onClick={() => handleCardClick(card)}
                className={`h-32 sm:h-36 rounded-2xl border-4 transition-all duration-200 flex flex-col items-center justify-center p-3 cursor-pointer shadow-md ${
                  isMatched
                    ? 'bg-emerald-50 border-emerald-400 scale-[0.98]'
                    : isRevealed
                    ? 'bg-yellow-50 border-yellow-400 scale-105'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-700 hover:scale-[1.03] text-white'
                }`}
              >
                {isRevealed ? (
                  <>
                    <span className="text-4xl sm:text-5xl mb-1 leading-none">{card.emoji}</span>
                    <span className="font-display font-black text-base sm:text-lg text-slate-900">
                      {card.word}
                    </span>
                    <Volume2 className="w-4 h-4 text-indigo-600 mt-0.5" />
                  </>
                ) : (
                  <span className="text-4xl font-black text-white/90">?</span>
                )}
              </button>
            );
          })}
        </div>

        {isAllMatched && (
          <div className="mt-5 bg-emerald-100 border-2 border-emerald-400 rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 font-display font-black text-lg text-emerald-900">
              <Sparkles className="w-6 h-6 text-emerald-600" />
              <span>Harika hafıza! {moves} hamlede tamamlandı! (+5 ⭐)</span>
            </div>
            <button
              type="button"
              onClick={() => startNewGame(pairCount)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm cursor-pointer"
            >
              Tekrar Oyna →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
