import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, CheckCircle2, Sparkles } from 'lucide-react';
import { speakEnglish, stopSpeech, triggerHoverSpeech, cancelHoverSpeech } from '../utils/speech';
import { playStarSparkle, playTap, playDiDit } from '../utils/soundEffects';
import { recordMissedWord, recordMasteredWord } from '../utils/reviewTracker';

function cleanOptionForSpeech(text) {
  return String(text || '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/[0-9]+[^\p{L}\p{N}\s]/gu, '')
    .replace(/[^\p{L}\p{N}\s.,'’"-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

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
  {
    emoji: '⛴️',
    q: 'Which boat crosses the Bosphorus in Istanbul?',
    word: 'Ferry',
    options: [
      { text: 'Ferry boat ⛴️', correct: true },
      { text: 'Train 🚂', correct: false },
      { text: 'Sled 🛷', correct: false },
    ],
  },
  {
    emoji: '🎂',
    q: 'Where did we celebrate the birthday with a ball pit?',
    word: 'Ballorig',
    options: [
      { text: 'Ballorig Kerkrade 🎂', correct: true },
      { text: 'Hospital 🏥', correct: false },
      { text: 'Airport ✈️', correct: false },
    ],
  },
  {
    emoji: '🦆',
    q: 'What swims in the pond at Laurensberg Park?',
    word: 'Duck',
    options: [
      { text: 'Yellow duck 🦆', correct: true },
      { text: 'Keyboard ⌨️', correct: false },
      { text: 'Rocket 🚀', correct: false },
    ],
  },
  {
    emoji: '🌳',
    q: 'Where is the puppy hiding during hide and seek?',
    word: 'Behind',
    options: [
      { text: 'Behind the tree 🌳', correct: true },
      { text: 'Inside the oven 🔥', correct: false },
      { text: 'Under the ocean 🌊', correct: false },
    ],
  },
  {
    emoji: '💻',
    q: 'What do we type words on at Dad’s desk?',
    word: 'Keyboard',
    options: [
      { text: 'Keyboard ⌨️', correct: true },
      { text: 'Pillow ☁️', correct: false },
      { text: 'Umbrella ☔', correct: false },
    ],
  },
  {
    emoji: '🎹',
    q: 'Which instrument has black and white keys?',
    word: 'Piano',
    options: [
      { text: 'Piano 🎹', correct: true },
      { text: 'Drum 🥁', correct: false },
      { text: 'Whistle 📣', correct: false },
    ],
  },
  {
    emoji: '🦒',
    q: 'Which animal is very TALL with a long neck?',
    word: 'Tall',
    options: [
      { text: 'Giraffe 🦒', correct: true },
      { text: 'Mouse 🐭', correct: false },
      { text: 'Duck 🦆', correct: false },
    ],
  },
  {
    emoji: '💰',
    q: 'What do pirates keep inside the treasure chest?',
    word: 'Treasure',
    options: [
      { text: 'Gold coins 💰', correct: true },
      { text: 'Wet socks 🧦', correct: false },
      { text: 'Broccoli 🥦', correct: false },
    ],
  },
  {
    emoji: '🧁',
    q: 'Who bakes bread, croissants, and cupcakes?',
    word: 'Baker',
    options: [
      { text: 'Baker 👨‍🍳', correct: true },
      { text: 'Pilot 👨‍✈️', correct: false },
      { text: 'Lifeguard 🛟', correct: false },
    ],
  },
  {
    emoji: '🏖️',
    q: 'What can we build on the sandy beach?',
    word: 'Sandcastle',
    options: [
      { text: 'Sandcastle 🏰', correct: true },
      { text: 'Elevator 🛗', correct: false },
      { text: 'Printer 🖨️', correct: false },
    ],
  },
  {
    emoji: '🪁',
    q: 'What flies high in the autumn wind?',
    word: 'Kite',
    options: [
      { text: 'Kite 🪁', correct: true },
      { text: 'Sofa 🛋️', correct: false },
      { text: 'Suitcase 🧳', correct: false },
    ],
  },
  {
    emoji: '🍎',
    q: 'Where do we push a shopping cart to buy apples and milk?',
    word: 'Supermarket',
    options: [
      { text: 'Supermarket 🛒', correct: true },
      { text: 'Swimming pool 🏊', correct: false },
      { text: 'Basketball court 🏀', correct: false },
    ],
  },
  {
    emoji: '🍝',
    q: "What is Deniz's absolute favorite food in the whole world?",
    word: 'Spaghetti',
    options: [
      { text: 'Spaghetti Bolognese 🍝', correct: true },
      { text: 'Broccoli soup 🥦', correct: false },
      { text: 'Plain bread 🍞', correct: false },
    ],
  },
  {
    emoji: '🥈',
    q: 'What shiny swimming medal is Deniz working hard to earn?',
    word: 'Medal',
    options: [
      { text: 'Silver Medal (Silberabzeichen) 🥈', correct: true },
      { text: 'Paper Badge 📄', correct: false },
      { text: 'Wooden Coin 🪵', correct: false },
    ],
  },
  {
    emoji: '🎹',
    q: 'On which day does Deniz play piano with teacher Jeremias?',
    word: 'Piano',
    options: [
      { text: 'Monday 🎹', correct: true },
      { text: 'Sunday midnight 🌙', correct: false },
      { text: 'Never ❌', correct: false },
    ],
  },
  {
    emoji: '🏀',
    q: 'On which day does Deniz practice basketball?',
    word: 'Basketball',
    options: [
      { text: 'Wednesday 🏀', correct: true },
      { text: 'Sunday 💤', correct: false },
      { text: 'Only in winter ❄️', correct: false },
    ],
  },
  {
    emoji: '🏥',
    q: 'Where does Mom Melis work as an anesthesiology doctor?',
    word: 'Hospital',
    options: [
      { text: 'SAH Eschweiler Hospital 🏥', correct: true },
      { text: 'At a bakery 🥖', correct: false },
      { text: 'On a pirate ship 🏴‍☠️', correct: false },
    ],
  },
  {
    emoji: '📡',
    q: 'What does Dad Dr. Ege design as an engineer?',
    word: 'Engineer',
    options: [
      { text: '5G signals & networks 📡', correct: true },
      { text: 'Teddy bears 🧸', correct: false },
      { text: 'Skateboards 🛹', correct: false },
    ],
  },
  {
    emoji: '🏫',
    q: 'Which school and class does Deniz attend in Aachen?',
    word: 'School',
    options: [
      { text: 'GGS Laurensberg - Class 1b 🏫', correct: true },
      { text: 'Art University 🎨', correct: false },
      { text: 'Space Station 🚀', correct: false },
    ],
  },
  {
    emoji: '👩‍🏫',
    q: 'Who is Deniz’s wonderful teacher at GGS Laurensberg?',
    word: 'Teacher',
    options: [
      { text: 'Frau Schwarz 👩‍🏫', correct: true },
      { text: 'Captain Hook 🏴‍☠️', correct: false },
      { text: 'Pikachu ⚡', correct: false },
    ],
  },
  {
    emoji: '👦',
    q: 'Who are Deniz’s school friends in Class 1b?',
    word: 'Friends',
    options: [
      { text: 'Ojas, Elias, Julius, Vukasin & Liam 👦', correct: true },
      { text: 'Only robots 🤖', correct: false },
      { text: 'Aliens from Mars 👽', correct: false },
    ],
  },
  {
    emoji: '🏨',
    q: 'Which hotel in Turkey does Deniz love staying at for holidays?',
    word: 'Hotel',
    options: [
      { text: 'Nirvana Cosmopolitan 🏨', correct: true },
      { text: 'A small tent ⛺', correct: false },
      { text: 'A wooden shed 🪵', correct: false },
    ],
  },
  {
    emoji: '📺',
    q: 'Which curious science TV shows does Deniz love watching?',
    word: 'Show',
    options: [
      { text: 'Checker Tobi & Woozle Goozle 📺', correct: true },
      { text: 'The silent news 📰', correct: false },
      { text: 'Weather only 🌧️', correct: false },
    ],
  },
  {
    emoji: '🍮',
    q: 'What sweet treats do Deniz, Mom Melis, and Dad Ege bake together?',
    word: 'Cake',
    options: [
      { text: 'Fluffy cake and pudding 🍮', correct: true },
      { text: 'Salty lemons 🍋', correct: false },
      { text: 'Spicy chili 🌶️', correct: false },
    ],
  },
];

export default function QuestionQuizGame({ onRewardEarned, isMuted = false }) {
  const [qIdx, setQIdx] = useState(0);
  const [solved, setSolved] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongOptions, setWrongOptions] = useState(new Set());

  const item = QUESTION_BANK[qIdx % QUESTION_BANK.length];

  const shuffledOptions = useMemo(() => {
    if (!item?.options) return [];
    const shift = qIdx % item.options.length;
    return shift === 0
      ? item.options
      : item.options.slice(shift).concat(item.options.slice(0, shift));
  }, [item, qIdx]);

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
        setWrongOptions(new Set());
      }, 1050);
    } else {
      stopSpeech();
      playDiDit(isMuted);
      recordMissedWord(item.word, item.emoji);
      setWrongOptions((prev) => new Set([...prev, opt.text]));
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
            ⭐ Score: {score}
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
          <span>Listen to Question</span>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {shuffledOptions.map((opt, idx) => {
            const cleanText = cleanOptionForSpeech(opt.text);
            const isWrong = wrongOptions.has(opt.text);
            return (
              <button
                key={idx}
                type="button"
                disabled={isWrong || solved}
                onPointerEnter={(e) => {
                  if (isWrong || solved) return;
                  triggerHoverSpeech(cleanText, {
                    isMuted,
                    pointerType: e.pointerType,
                    delayMs: 110,
                  });
                }}
                onPointerLeave={cancelHoverSpeech}
                onFocus={() => {
                  if (isWrong || solved) return;
                  triggerHoverSpeech(cleanText, {
                    isMuted,
                    delayMs: 110,
                  });
                }}
                onBlur={cancelHoverSpeech}
                onClick={() => {
                  if (isWrong || solved) return;
                  cancelHoverSpeech();
                  handleChoice(opt);
                }}
                className={`p-5 sm:p-6 rounded-2xl border-3 font-display font-black text-lg sm:text-xl transition shadow-sm flex items-center justify-between gap-2 text-left group ${
                  solved && opt.correct
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-900 scale-105'
                    : isWrong
                    ? 'bg-slate-100 border-slate-300 text-slate-400 opacity-50 line-through cursor-not-allowed scale-95'
                    : 'bg-slate-50 hover:bg-teal-50 border-slate-200 hover:border-teal-400 text-slate-900 cursor-pointer hover:scale-[1.02]'
                }`}
              >
                <span className="flex items-center gap-2">
                  {isWrong && <span className="text-rose-500 no-underline font-bold text-sm">❌</span>}
                  <span>{opt.text}</span>
                </span>
                {!isWrong && !solved && (
                  <span
                    role="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelHoverSpeech();
                      playTap(isMuted);
                      if (!isMuted) speakEnglish(cleanText);
                    }}
                    title="Listen to choice"
                    className="w-8 h-8 rounded-xl bg-teal-100 group-hover:bg-teal-200 text-teal-800 flex items-center justify-center flex-shrink-0 transition active:scale-90 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {solved && (
          <div className="mt-4 inline-flex items-center gap-2 text-emerald-700 font-black text-base">
            <CheckCircle2 className="w-5 h-5" />
            <span>Awesome! (+2 ⭐)</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
        )}
      </div>
    </div>
  );
}
