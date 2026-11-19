import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { VOCAB_BANK_500 } from '../data/vocabularyBank500';
import { getReviewWords, recordMasteredWord, recordMissedWord } from '../utils/reviewTracker';
import { speakEnglish } from '../utils/speech';
import { playStarSparkle, playGentleWobble, playTap } from '../utils/soundEffects';

export default function SmartReviewGame({ onRewardEarned, isMuted = false }) {
  const [refreshTick, setRefreshTick] = useState(0);
  const [step, setStep] = useState(0);
  const [solved, setSolved] = useState(false);

  const reviewList = useMemo(() => getReviewWords(8), [refreshTick]);
  const target = reviewList[step % reviewList.length];

  const options = useMemo(() => {
    if (!target) return [];
    const distractors = VOCAB_BANK_500.filter(
      (w) => w.word.toLowerCase() !== target.word.toLowerCase()
    )
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
      .map((w) => ({ word: w.word, emoji: w.emoji, isCorrect: false }));
    return [{ word: target.word, emoji: target.emoji, isCorrect: true }, ...distractors].sort(
      () => Math.random() - 0.5
    );
  }, [target, step, refreshTick]);

  const handlePick = (opt) => {
    if (solved) return;
    if (opt.isCorrect) {
      playStarSparkle(isMuted);
      setSolved(true);
      recordMasteredWord(target.word, target.emoji, target.tr);
      if (onRewardEarned) onRewardEarned(2);
      if (step + 1 >= reviewList.length) {
        confetti({ particleCount: 65, spread: 65, origin: { y: 0.65 } });
      }
      if (!isMuted) speakEnglish(`Great! ${target.word}!`);
      setTimeout(() => {
        if (step + 1 < reviewList.length) {
          setStep((s) => s + 1);
          setSolved(false);
        } else {
          setStep(0);
          setSolved(false);
          setRefreshTick((t) => t + 1);
        }
      }, 950);
    } else {
      playGentleWobble(isMuted);
      recordMissedWord(target.word, target.emoji, target.tr);
      if (!isMuted) speakEnglish(`That is ${opt.word}. Find ${target.word}!`);
    }
  };

  if (!target) return null;

  return (
    <div className="w-full max-w-3xl mx-auto px-3 py-4">
      <div className="bg-white rounded-3xl shadow-xl border-4 border-orange-200 p-5 sm:p-8 text-center">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-2">
              <span>🔁</span>
              <span>Bugünün 8 Kelimesi</span>
            </h2>
            <p className="text-sm font-bold text-slate-500">
              Zorlandığın veya yeni öğrendiğin kelimeleri hızlıca tekrar et!
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              playTap(isMuted);
              setStep(0);
              setSolved(false);
              setRefreshTick((t) => t + 1);
            }}
            className="px-3.5 py-2 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-950 font-black text-xs sm:text-sm flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Yenile ({step + 1}/{reviewList.length})</span>
          </button>
        </div>

        <div
          className={`font-display font-black text-slate-900 mb-3 ${
            target.word.length > 22 ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl'
          }`}
        >
          {target.word}
        </div>
        {target.tr && <div className="text-sm font-bold text-slate-400 mb-4">{target.tr}</div>}

        <button
          type="button"
          onClick={() => {
            playTap(isMuted);
            if (!isMuted) speakEnglish(target.word);
          }}
          className="mb-6 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-display font-black text-base shadow-md inline-flex items-center gap-2 cursor-pointer"
        >
          <Volume2 className="w-5 h-5" />
          <span>Kelimeyi Dinle</span>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePick(opt)}
              className={`p-6 rounded-3xl border-3 flex flex-col items-center gap-2 cursor-pointer transition shadow-sm ${
                solved && opt.isCorrect
                  ? 'bg-emerald-50 border-emerald-500 scale-105'
                  : 'bg-slate-50 hover:bg-orange-50 border-slate-200 hover:border-orange-400'
              }`}
            >
              <span className="text-5xl leading-none">{opt.emoji}</span>
              <span
                className={`font-display font-black text-slate-900 ${
                  opt.word.length > 18 ? 'text-sm sm:text-base' : 'text-xl'
                }`}
              >
                {opt.word}
              </span>
            </button>
          ))}
        </div>

        {solved && (
          <div className="mt-4 inline-flex items-center gap-2 text-emerald-700 font-black">
            <CheckCircle2 className="w-5 h-5" />
            <span>Harika! (+2 ⭐)</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
        )}
      </div>
    </div>
  );
}
