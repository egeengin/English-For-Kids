import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, CheckCircle2, Sparkles } from 'lucide-react';
import { speakEnglish } from '../utils/speech';
import { playStarSparkle, playGentleWobble, playTap } from '../utils/soundEffects';
import { recordMissedWord, recordMasteredWord } from '../utils/reviewTracker';

const QUESTION_BANK = [
  {
    emoji: '👩‍⚕️',
    q: 'Who helps sick people at the hospital?',
    word: 'Doctor',
    options: [
      { text: 'Doctor 👩‍⚕️', correct: true },
      { text: 'Baker 👨‍🍳', correct: false },
      { text: 'Pilot 👨‍✈️', correct: false },
    ],
  },
  {
    emoji: '🐙',
    q: 'How many arms does an octopus have?',
    word: 'Octopus',
    options: [
      { text: 'Eight 8️⃣', correct: true },
      { text: 'Two 2️⃣', correct: false },
      { text: 'One 1️⃣', correct: false },
    ],
  },
  {
    emoji: '☔',
    q: 'What do we hold in the rain?',
    word: 'Umbrella',
    options: [
      { text: 'Umbrella ☔', correct: true },
      { text: 'Sled 🛷', correct: false },
      { text: 'Sunglasses 🕶️', correct: false },
    ],
  },
  {
    emoji: '📦',
    q: 'Where is the soccer ball hiding?',
    word: 'Under',
    options: [
      { text: 'Under the table ⬇️', correct: true },
      { text: 'In space 🚀', correct: false },
      { text: 'On the cloud ☁️', correct: false },
    ],
  },
  {
    emoji: '🚒',
    q: 'Who drives the big red fire truck?',
    word: 'Firefighter',
    options: [
      { text: 'Firefighter 🧑‍🚒', correct: true },
      { text: 'Dolphin 🐬', correct: false },
      { text: 'Cat 🐱', correct: false },
    ],
  },
  {
    emoji: '✈️',
    q: 'What do we show at the airport before flying?',
    word: 'Passport',
    options: [
      { text: 'Passport 🛂', correct: true },
      { text: 'Pillow ☁️', correct: false },
      { text: 'Teapot 🫖', correct: false },
    ],
  },
  {
    emoji: '🏎️',
    q: 'Which animal or vehicle is super FAST?',
    word: 'Fast',
    options: [
      { text: 'Race car 🏎️', correct: true },
      { text: 'Turtle 🐢', correct: false },
      { text: 'Sofa 🛋️', correct: false },
    ],
  },
  {
    emoji: '🦷',
    q: 'What do we use to brush our teeth before bed?',
    word: 'Toothbrush',
    options: [
      { text: 'Toothbrush 🪥', correct: true },
      { text: 'Basketball 🏀', correct: false },
      { text: 'Printer 🖨️', correct: false },
    ],
  },
];

export default function QuestionQuizGame({ onRewardEarned, isMuted = false }) {
  const [qIdx, setQIdx] = useState(0);
  const [solved, setSolved] = useState(false);
  const [score, setScore] = useState(0);

  const item = QUESTION_BANK[qIdx % QUESTION_BANK.length];

  const speakQ = useCallback(() => {
    if (!isMuted && item) speakEnglish(item.q);
  }, [isMuted, item]);

  useEffect(() => {
    const t = setTimeout(speakQ, 300);
    return () => clearTimeout(t);
  }, [qIdx, speakQ]);

  const handleChoice = (opt) => {
    if (solved) return;
    if (opt.correct) {
      playStarSparkle(isMuted);
      setSolved(true);
      setScore((s) => s + 1);
      recordMasteredWord(item.word, item.emoji);
      if (onRewardEarned) onRewardEarned(2);
      if ((score + 1) % 4 === 0) {
        confetti({ particleCount: 55, spread: 60, origin: { y: 0.65 } });
      }
      if (!isMuted) speakEnglish('Awesome! That is right!');
      setTimeout(() => {
        setQIdx((i) => i + 1);
        setSolved(false);
      }, 1050);
    } else {
      playGentleWobble(isMuted);
      recordMissedWord(item.word, item.emoji);
      if (!isMuted) speakEnglish('Oops! Listen to the question again!');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 py-4">
      <div className="bg-white rounded-3xl shadow-xl border-4 border-teal-200 p-5 sm:p-8 text-center">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-2">
            <span>❓</span>
            <span>Who / Where / What?</span>
          </h2>
          <span className="px-3.5 py-1 rounded-full bg-teal-100 text-teal-900 font-black text-sm border border-teal-300">
            ⭐ Doğru: {score}
          </span>
        </div>

        <div className="text-6xl mb-3 leading-none">{item.emoji}</div>
        <h3 className="font-display font-black text-xl sm:text-3xl text-slate-900 mb-4">
          {item.q}
        </h3>

        <button
          type="button"
          onClick={() => {
            playTap(isMuted);
            speakQ();
          }}
          className="mb-6 px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-display font-black text-base shadow-sm inline-flex items-center gap-2 cursor-pointer"
        >
          <Volume2 className="w-5 h-5" />
          <span>Soruyu Dinle</span>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {item.options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChoice(opt)}
              className={`p-5 sm:p-6 rounded-2xl border-3 font-display font-black text-lg sm:text-xl cursor-pointer transition shadow-sm ${
                solved && opt.correct
                  ? 'bg-emerald-100 border-emerald-500 text-emerald-900 scale-105'
                  : 'bg-slate-50 hover:bg-teal-50 border-slate-200 hover:border-teal-400 text-slate-900'
              }`}
            >
              {opt.text}
            </button>
          ))}
        </div>

        {solved && (
          <div className="mt-4 inline-flex items-center gap-2 text-emerald-700 font-black text-base">
            <CheckCircle2 className="w-5 h-5" />
            <span>Süper! (+2 ⭐)</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
        )}
      </div>
    </div>
  );
}
