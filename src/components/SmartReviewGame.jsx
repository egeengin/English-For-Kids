import React, { useState, useMemo, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { VOCAB_BANK_500 } from '../data/vocabularyBank500';
import { getReviewWords, recordMasteredWord, recordMissedWord } from '../utils/reviewTracker';
import { speakEnglish, unlockAudio } from '../utils/speech';
import { playStarSparkle, playGentleWobble, playTap } from '../utils/soundEffects';

function buildReviewOptions(target, roundSeed = 0) {
  if (!target) return [];
  const pool = VOCAB_BANK_500.filter(
    (w) => w.word.toLowerCase() !== target.word.toLowerCase()
  );
  if (pool.length === 0) return [{ word: target.word, emoji: target.emoji, isCorrect: true }];

  let hash = roundSeed;
  for (let i = 0; i < target.word.length; i++) {
    hash = (hash * 31 + target.word.charCodeAt(i)) | 0;
  }
  const idx1 = Math.abs(hash) % pool.length;
  const idx2 = (idx1 + 1 + (Math.abs(hash >> 4) % Math.max(1, pool.length - 1))) % pool.length;

  const distractors = [pool[idx1], pool[idx2]]
    .filter(Boolean)
    .map((w) => ({ word: w.word, emoji: w.emoji, isCorrect: false }));

  const arr = [{ word: target.word, emoji: target.emoji, isCorrect: true }, ...distractors];
  const shift = Math.abs(hash) % arr.length;
  return shift === 0 ? arr : arr.slice(shift).concat(arr.slice(0, shift));
}

export default function SmartReviewGame({ onRewardEarned, isMuted = false }) {
  const [reviewList, setReviewList] = useState(() => getReviewWords(8));
  const [roundSeed, setRoundSeed] = useState(0);
  const [step, setStep] = useState(0);
  const [solved, setSolved] = useState(false);

  const target = reviewList[step % reviewList.length];

  const options = useMemo(
    () => buildReviewOptions(target, roundSeed + step),
    [target, roundSeed, step]
  );

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
          setReviewList(getReviewWords(8));
          setRoundSeed((r) => r + 1);
          setStep(0);
          setSolved(false);
        }
      }, 950);
    } else {
      playGentleWobble(isMuted);
      recordMissedWord(target.word, target.emoji, target.tr);
      if (!isMuted) speakEnglish(`That is ${opt.word}. Find ${target.word}!`);
    }
  };

  const handlePickRef = useRef(handlePick);
  useEffect(() => {
    handlePickRef.current = handlePick;
  });

  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (!target) return;
      if (e.key === '1' || e.key === '2' || e.key === '3') {
        const chosen = options[Number(e.key) - 1];
        if (chosen) handlePickRef.current(chosen);
      } else if (e.code === 'Space' && tag !== 'BUTTON') {
        e.preventDefault();
        unlockAudio();
        if (!isMuted) speakEnglish(target.word);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMuted, options, target]);

  if (!target) return null;

  return (
    <div className="w-full max-w-3xl mx-auto px-3 py-4">
      <div className="bg-white rounded-3xl shadow-xl border-4 border-orange-200 p-5 sm:p-8 text-center">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-2">
              <span>🔁</span>
              <span>Today’s 8 Words</span>
            </h2>
            <p className="text-sm font-bold text-slate-500">
              Quickly review tricky and new words!
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              playTap(isMuted);
              setReviewList(getReviewWords(8));
              setRoundSeed((r) => r + 1);
              setStep(0);
              setSolved(false);
            }}
            className="px-3.5 py-2 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-950 font-black text-xs sm:text-sm flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Refresh ({step + 1}/{reviewList.length})</span>
          </button>
        </div>

        <div
          className={`font-display font-black text-slate-900 mb-4 ${
            target.word.length > 22 ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl'
          }`}
        >
          {target.word}
        </div>

        <button
          type="button"
          onClick={() => {
            playTap(isMuted);
            unlockAudio();
            if (!isMuted) speakEnglish(target.word);
          }}
          className="mb-6 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-display font-black text-base shadow-md inline-flex items-center gap-2 cursor-pointer"
        >
          <Volume2 className="w-5 h-5" />
          <span>Listen</span>
          <kbd className="hidden md:inline-flex px-1.5 py-0.5 text-[11px] rounded bg-white/20">Space</kbd>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePick(opt)}
              className={`relative p-6 rounded-3xl border-3 flex flex-col items-center gap-2 cursor-pointer transition shadow-sm ${
                solved && opt.isCorrect
                  ? 'bg-emerald-50 border-emerald-500 scale-105'
                  : 'bg-slate-50 hover:bg-orange-50 border-slate-200 hover:border-orange-400'
              }`}
            >
              <kbd className="hidden md:inline-flex absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-white border border-slate-300 text-slate-600 font-display font-black text-xs">
                {idx + 1}
              </kbd>
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
            <span>Awesome! (+2 ⭐)</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
        )}
      </div>
    </div>
  );
}
