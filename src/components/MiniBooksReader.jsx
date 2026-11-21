import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, ArrowRight, ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react';
import { speakEnglish, stopSpeech, triggerHoverSpeech, cancelHoverSpeech } from '../utils/speech';
import { playSnap, playStarSparkle, playTap, playDiDit } from '../utils/soundEffects';

function cleanOptionForSpeech(text) {
  return String(text || '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/[0-9]+[^\p{L}\p{N}\s]/gu, '')
    .replace(/[^\p{L}\p{N}\s.,'’"-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getMiniBooks(childName = 'Deniz') {
  const rawBooks = [
    {
      id: 'antalya_book',
      title: `${childName} Goes to Antalya`,
      emoji: '✈️',
      color: 'from-sky-500 to-cyan-500',
      pages: [
        { emoji: '🧳', text: `${childName} packs a red suitcase.` },
        { emoji: '✈️', text: 'The big airplane flies to Antalya.' },
        { emoji: '🌊', text: `${childName} goes down the fast water slide!` },
        { emoji: '🍔', text: 'Then we eat a yummy burger and fries.' },
      ],
      question: `Where did ${childName} go on the airplane?`,
      options: [
        { text: 'Antalya ☀️', isCorrect: true },
        { text: 'The Moon 🌙', isCorrect: false },
        { text: 'A Bakery 🧁', isCorrect: false },
      ],
    },
    {
      id: 'ballorig_book',
      title: `${childName} at Ballorig`,
      emoji: '🎂',
      color: 'from-pink-500 to-fuchsia-500',
      pages: [
        { emoji: '🎈', text: `Today is a birthday party at Ballorig!` },
        { emoji: '🔴', text: `${childName} jumps into the colorful ball pit.` },
        { emoji: '🤸', text: 'Friends bounce high on the trampoline.' },
        { emoji: '🎂', text: 'Everyone sings Happy Birthday and eats cake!' },
      ],
      question: `What did ${childName} jump into at Ballorig?`,
      options: [
        { text: 'The ball pit 🔴', isCorrect: true },
        { text: 'A snow hill ⛄', isCorrect: false },
        { text: 'A submarine 🚤', isCorrect: false },
      ],
    },
    {
      id: 'lost_ball_book',
      title: 'Where Is the Ball?',
      emoji: '⚽',
      color: 'from-emerald-500 to-teal-500',
      pages: [
        { emoji: '🐱', text: 'The orange cat sleeps on the blue sofa.' },
        { emoji: '🧸', text: 'The teddy bear sits in the purple box.' },
        { emoji: '🐶', text: 'The puppy hides behind the big tree.' },
        { emoji: '⚽', text: 'Aha! The soccer ball is under the table!' },
      ],
      question: 'Where is the soccer ball hiding?',
      options: [
        { text: 'Under the table ⬇️', isCorrect: true },
        { text: 'On the sofa 🛋️', isCorrect: false },
        { text: 'Behind the tree 🌳', isCorrect: false },
      ],
    },
    {
      id: 'istanbul_book',
      title: 'Istanbul Ferry Adventure',
      emoji: '⛴️',
      color: 'from-blue-600 to-indigo-600',
      pages: [
        { emoji: '⛴️', text: `${childName} rides a big white ferry in Istanbul.` },
        { emoji: '🕊️', text: 'Hungry seagulls fly next to the boat!' },
        { emoji: '🥯', text: 'We eat warm sesame simit on the deck.' },
        { emoji: '🌉', text: 'Look at the tall Galata Tower and bridge!' },
      ],
      question: 'What flies next to the ferry in Istanbul?',
      options: [
        { text: 'Seagulls 🕊️', isCorrect: true },
        { text: 'Elephants 🐘', isCorrect: false },
        { text: 'Penguins 🐧', isCorrect: false },
      ],
    },
    {
      id: 'parents_work_book',
      title: "Mom and Dad's Super Jobs",
      emoji: '💻',
      color: 'from-rose-500 to-amber-500',
      pages: [
        { emoji: '📡', text: 'Dad Dr. Ege is a 5G engineer building satellite networks.' },
        { emoji: '💻', text: `${childName} presses keys on Dad's big tech monitors.` },
        { emoji: '🏥', text: 'Mom Melis is an anesthesia resident at SAH Eschweiler.' },
        { emoji: '🩺', text: 'Mom helps patients stay calm and sleep safely during surgery!' },
      ],
      question: 'Where does Mom Melis care for her patients?',
      options: [
        { text: 'SAH Eschweiler Hospital 🏥', isCorrect: true },
        { text: 'A Toy Store 🧸', isCorrect: false },
        { text: 'A Fire Station 🚒', isCorrect: false },
      ],
    },
    {
      id: 'swimming_silver_book',
      title: `${childName}'s Silver Medal Swim`,
      emoji: '🏊',
      color: 'from-cyan-500 to-blue-600',
      pages: [
        { emoji: '🏊', text: `Every Sunday, ${childName} practices at the swimming pool.` },
        { emoji: '🥽', text: `${childName} wears cool goggles and swims fast laps!` },
        { emoji: '🤿', text: 'He dives deep down to pick up diving rings.' },
        { emoji: '🥈', text: 'He is working hard to earn the shiny Silver Medal!' },
      ],
      question: `What medal is ${childName} working hard to earn?`,
      options: [
        { text: 'Silver Medal 🥈', isCorrect: true },
        { text: 'Paper Hat 📄', isCorrect: false },
        { text: 'Wooden Stick 🪵', isCorrect: false },
      ],
    },
    {
      id: 'lego_master_book',
      title: `${childName} the Lego Master`,
      emoji: '🧱',
      color: 'from-amber-500 to-red-600',
      pages: [
        { emoji: '🧱', text: `${childName} has built huge Lego sets with thousands of bricks!` },
        { emoji: '🏰', text: 'He snaps bricks together to create grand castles and towers.' },
        { emoji: '🚀', text: 'He designs speedy rockets and futuristic spaceships.' },
        { emoji: '🏆', text: 'Everyone says: Deniz is a real Lego Master Builder!' },
      ],
      question: `What does ${childName} build with thousands of bricks?`,
      options: [
        { text: 'Castles, towers and rockets 🚀', isCorrect: true },
        { text: 'Mud puddles 🌧️', isCorrect: false },
        { text: 'Ice cream cones 🍦', isCorrect: false },
      ],
    },
    {
      id: 'baking_treats_book',
      title: 'Baking Cake and Pudding',
      emoji: '🍮',
      color: 'from-amber-400 to-orange-500',
      pages: [
        { emoji: '👨‍🍳', text: `${childName}, Mom Melis, and Dad Ege bake treats in the kitchen.` },
        { emoji: '🎂', text: 'Together, they stir sweet batter to bake a fluffy cake.' },
        { emoji: '🍫', text: 'Then they cook warm, chocolatey pudding on the stove!' },
        { emoji: '😋', text: 'Yum! Baking together at Schlossparkstrasse is so sweet!' },
      ],
      question: `What do ${childName} and his parents bake together?`,
      options: [
        { text: 'Fluffy cake and pudding 🎂', isCorrect: true },
        { text: 'Salty soup 🥣', isCorrect: false },
        { text: 'Green broccoli 🥦', isCorrect: false },
      ],
    },
    {
      id: 'piano_monday_book',
      title: 'Monday Piano with Jeremias',
      emoji: '🎹',
      color: 'from-indigo-500 to-purple-600',
      pages: [
        { emoji: '🎹', text: `Every Monday, ${childName} has piano class with teacher Jeremias.` },
        { emoji: '🎼', text: 'He places his fingers on the black and white keys.' },
        { emoji: '🎶', text: 'He plays cheerful notes: Do, Re, Mi, Fa, Sol!' },
        { emoji: '👏', text: 'Jeremias smiles and claps for the beautiful melody!' },
      ],
      question: `Who teaches ${childName} piano every Monday?`,
      options: [
        { text: 'Teacher Jeremias 🎹', isCorrect: true },
        { text: 'A Pirate 🏴‍☠️', isCorrect: false },
        { text: 'A Robot 🤖', isCorrect: false },
      ],
    },
    {
      id: 'nirvana_hotel_book',
      title: 'Holiday at Nirvana Cosmopolitan',
      emoji: '🏨',
      color: 'from-teal-400 to-emerald-600',
      pages: [
        { emoji: '🇹🇷', text: `${childName} loves flying to Turkey for holiday trips!` },
        { emoji: '🏨', text: 'He loves staying at the big Nirvana Cosmopolitan hotel.' },
        { emoji: '🌊', text: 'He zooms down giant water slides in the aquapark!' },
        { emoji: '🍝', text: 'At dinner, he enjoys delicious spaghetti bolognese!' },
      ],
      question: `Which hotel does ${childName} love staying at in Turkey?`,
      options: [
        { text: 'Nirvana Cosmopolitan 🏨', isCorrect: true },
        { text: 'An Igloo ⛄', isCorrect: false },
        { text: 'A Treehouse 🛖', isCorrect: false },
      ],
    },
    {
      id: 'checker_science_book',
      title: 'Checker Tobi & Woozle Goozle',
      emoji: '📺',
      color: 'from-violet-500 to-fuchsia-600',
      pages: [
        { emoji: '📺', text: `${childName} loves watching Checker Tobi and Woozle Goozle on TV!` },
        { emoji: '❓', text: 'They ask exciting science questions about how things work.' },
        { emoji: '🧪', text: 'Woozle tests wild inventions with funny explosions!' },
        { emoji: '💡', text: `${childName} learns amazing facts about science and nature!` },
      ],
      question: `What shows does ${childName} love watching on TV?`,
      options: [
        { text: 'Checker Tobi & Woozle Goozle 📺', isCorrect: true },
        { text: 'Cooking alone 🍳', isCorrect: false },
        { text: 'Silent movies 📽️', isCorrect: false },
      ],
    },
    {
      id: 'school_1b_book',
      title: 'Class 1b at GGS Laurensberg',
      emoji: '🏫',
      color: 'from-blue-500 to-indigo-600',
      pages: [
        { emoji: '🏫', text: `${childName} goes to GGS Laurensberg school in class 1b.` },
        { emoji: '👩‍🏫', text: 'His kind teacher Frau Schwarz teaches reading, writing, and math.' },
        { emoji: '🧮', text: `${childName} solves two-digit addition math challenges!` },
        { emoji: '🏃', text: 'At recess, he plays with friends Ojas, Elias, Julius, Vukasin, and Liam!' },
      ],
      question: `What class is ${childName} in at GGS Laurensberg?`,
      options: [
        { text: 'Class 1b with Frau Schwarz 🏫', isCorrect: true },
        { text: 'Kindergarten 🍼', isCorrect: false },
        { text: 'High School 🎓', isCorrect: false },
      ],
    },
    {
      id: 'weather_book',
      title: 'Rain and Snow Fun',
      emoji: '🌦️',
      color: 'from-cyan-500 to-sky-600',
      pages: [
        { emoji: '☔', text: 'On a rainy day, we hold a red umbrella.' },
        { emoji: '🌈', text: 'After the rain, a bright rainbow appears!' },
        { emoji: '⛄', text: 'In winter, we build a snowman with a carrot nose.' },
        { emoji: '🛷', text: 'Then we sled fast down the snowy hill!' },
      ],
      question: 'What appears in the sky after the rain?',
      options: [
        { text: 'A rainbow 🌈', isCorrect: true },
        { text: 'A snowman ⛄', isCorrect: false },
        { text: 'A submarine 🚤', isCorrect: false },
      ],
    },
  ];

  return rawBooks.map((b, bIdx) => {
    const shift = bIdx % b.options.length;
    const rotatedOptions = shift === 0
      ? b.options
      : b.options.slice(shift).concat(b.options.slice(0, shift));
    return { ...b, options: rotatedOptions };
  });
}

export default function MiniBooksReader({ onRewardEarned, isMuted = false, childName = 'Deniz' }) {
  const books = getMiniBooks(childName);
  const [bookIdx, setBookIdx] = useState(0);
  const [pageIdx, setPageIdx] = useState(0); // 0..pages.length (last index = question)
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [isReading, setIsReading] = useState(false);
  const [quizSolved, setQuizSolved] = useState(false);
  const [wrongOptions, setWrongOptions] = useState(new Set());
  const timerRef = useRef(null);
  const readingSessionRef = useRef(0);

  const book = books[bookIdx];
  const isQuestionPage = pageIdx >= book.pages.length;
  const currentPage = !isQuestionPage ? book.pages[pageIdx] : null;

  useEffect(() => {
    return () => {
      stopSpeech();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const readLine = (sentence) => {
    const readingSession = ++readingSessionRef.current;
    if (timerRef.current) clearInterval(timerRef.current);
    if (!sentence) return;

    setIsReading(true);
    const words = sentence.split(' ');
    let hasStarted = false;
    let idx = 0;
    const startHighlight = () => {
      if (hasStarted) return;
      hasStarted = true;
      setHighlightIdx(0);
      timerRef.current = setInterval(() => {
        idx++;
        if (idx < words.length) setHighlightIdx(idx);
      }, 360);
    };
    const finishReading = () => {
      if (readingSession !== readingSessionRef.current) return;
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setHighlightIdx(-1);
      setIsReading(false);
      // Wait on page so the child hears the full story; continue with button!
    };

    if (isMuted) {
      startHighlight();
      const duration = Math.max(1800, words.length * 360);
      timerRef.current = setTimeout(finishReading, duration);
      return;
    }

    speakEnglish(sentence, finishReading, { onStart: startHighlight });
  };

  useEffect(() => {
    if (isQuestionPage || !currentPage) return undefined;
    const timer = setTimeout(() => readLine(currentPage.text), 350);
    return () => {
      clearTimeout(timer);
      stopSpeech();
    };
  }, [bookIdx, pageIdx, isQuestionPage, currentPage?.text, isMuted]);

  const handlePrevPage = () => {
    playTap(isMuted);
    stopSpeech();
    readingSessionRef.current += 1;
    if (timerRef.current) clearInterval(timerRef.current);
    setHighlightIdx(-1);
    setIsReading(false);
    setPageIdx((p) => Math.max(0, p - 1));
  };

  const handleNextPage = () => {
    playTap(isMuted);
    stopSpeech();
    readingSessionRef.current += 1;
    if (timerRef.current) clearInterval(timerRef.current);
    setHighlightIdx(-1);
    setIsReading(false);
    setPageIdx((p) => Math.min(book.pages.length, p + 1));
  };

  const selectBook = (idx) => {
    playTap(isMuted);
    stopSpeech();
    readingSessionRef.current += 1;
    if (timerRef.current) clearInterval(timerRef.current);
    setBookIdx(idx);
    setPageIdx(0);
    setHighlightIdx(-1);
    setIsReading(false);
    setQuizSolved(false);
    setWrongOptions(new Set());
  };

  const handleAnswer = (opt) => {
    cancelHoverSpeech();
    if (opt.isCorrect) {
      playStarSparkle(isMuted);
      setQuizSolved(true);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.65 } });
      if (onRewardEarned) {
        onRewardEarned({ stars: 4, bricks: 1, bookTitle: book?.title || 'Mini Book' });
      }
      if (!isMuted) speakEnglish('Great reading! You got it!');
    } else {
      stopSpeech();
      playDiDit(isMuted);
      setWrongOptions((prev) => new Set([...prev, opt.text]));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 py-4">
      {/* Simple Book Picker */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-4">
        {books.map((b, idx) => (
          <button
            key={b.id}
            type="button"
            onClick={() => selectBook(idx)}
            className={`px-4 py-2.5 rounded-2xl font-display font-black text-sm sm:text-base border-2 flex items-center gap-2 cursor-pointer transition shadow-sm ${
              idx === bookIdx
                ? `bg-gradient-to-r ${b.color} text-white border-white shadow-md scale-[1.03]`
                : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'
            }`}
          >
            <span className="text-xl">{b.emoji}</span>
            <span>{b.title}</span>
          </button>
        ))}
      </div>

      {/* Book Page Card */}
      <div className="bg-white rounded-3xl shadow-xl border-4 border-slate-200 overflow-hidden">
        <div className={`bg-gradient-to-r ${book.color} px-5 py-3.5 text-white flex items-center justify-between`}>
          <div className="flex items-center gap-2 font-display font-black text-lg sm:text-xl">
            <BookOpen className="w-6 h-6" />
            <span>{book.title}</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-900/40 text-xs sm:text-sm font-black">
            {isQuestionPage ? 'Quiz' : `Page ${pageIdx + 1} / ${book.pages.length}`}
          </span>
        </div>

        <div className="p-6 sm:p-10 text-center">
          {!isQuestionPage && currentPage ? (
            <>
              <div className="text-7xl sm:text-8xl mb-5 leading-none">{currentPage.emoji}</div>
              <div className="flex flex-wrap items-center justify-center gap-2 mb-7">
                {currentPage.text.split(' ').map((word, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      playSnap(isMuted);
                      if (!isMuted) speakEnglish(word.replace(/[^a-zA-Z']/g, ''));
                    }}
                    className={`font-display font-black text-2xl sm:text-4xl px-2 py-1 rounded-xl transition cursor-pointer ${
                      highlightIdx === idx
                        ? 'bg-yellow-300 text-slate-950 scale-110 shadow-sm'
                        : 'text-slate-900 hover:bg-blue-50'
                    }`}
                  >
                    {word}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button
                  type="button"
                  disabled={pageIdx === 0}
                  onClick={handlePrevPage}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 font-black flex items-center gap-1 cursor-pointer transition transform active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Geri</span>
                </button>

                <button
                  type="button"
                  onClick={() => readLine(currentPage.text)}
                  className={`px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-lg shadow-md flex items-center gap-2 cursor-pointer transition transform active:scale-95 ${
                    isReading ? 'ring-4 ring-blue-300' : ''
                  }`}
                >
                  <Volume2 className={`w-6 h-6 ${isReading ? 'animate-bounce' : ''}`} />
                  <span>Benim İçin Oku</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextPage}
                  className={`px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-black text-lg shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer transition transform active:scale-95 ${
                    !isReading ? 'ring-4 ring-emerald-300 scale-105' : ''
                  }`}
                >
                  <span>{pageIdx === book.pages.length - 1 ? 'Soruya Geç' : 'Sonraki'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="max-w-xl mx-auto">
              <div className="text-5xl mb-3">❓</div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-900 mb-5">
                {book.question}
              </h3>
              <button
                type="button"
                onClick={() => !isMuted && speakEnglish(book.question)}
                className="mb-5 px-4 py-2 rounded-xl bg-blue-100 text-blue-900 font-black text-sm inline-flex items-center gap-1.5 cursor-pointer hover:bg-blue-200 transition"
              >
                <Volume2 className="w-4 h-4" />
                <span>Soruyu Dinle</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {book.options.map((opt, idx) => {
                  const cleanText = cleanOptionForSpeech(opt.text);
                  const isWrong = wrongOptions.has(opt.text);
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isWrong || quizSolved}
                      onPointerEnter={(e) => {
                        if (isWrong || quizSolved) return;
                        triggerHoverSpeech(cleanText, {
                          isMuted,
                          pointerType: e.pointerType,
                          delayMs: 110,
                        });
                      }}
                      onPointerLeave={cancelHoverSpeech}
                      onFocus={() => {
                        if (isWrong || quizSolved) return;
                        triggerHoverSpeech(cleanText, {
                          isMuted,
                          delayMs: 110,
                        });
                      }}
                      onBlur={cancelHoverSpeech}
                      onClick={() => {
                        if (isWrong || quizSolved) return;
                        cancelHoverSpeech();
                        handleAnswer(opt);
                      }}
                      className={`p-5 rounded-2xl border-3 font-display font-black text-lg transition shadow-sm flex items-center justify-between gap-2 text-left group ${
                        quizSolved && opt.isCorrect
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-900 scale-105'
                          : isWrong
                          ? 'bg-slate-100 border-slate-300 text-slate-400 opacity-50 line-through cursor-not-allowed scale-95'
                          : 'bg-slate-50 hover:bg-blue-50 border-slate-200 text-slate-900 hover:border-blue-300 cursor-pointer hover:scale-[1.02]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isWrong && <span className="text-rose-500 no-underline font-bold text-sm">❌</span>}
                        <span>{opt.text}</span>
                      </span>
                      {!isWrong && !quizSolved && (
                        <span
                          role="button"
                          tabIndex={-1}
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelHoverSpeech();
                            playTap(isMuted);
                            if (!isMuted) speakEnglish(cleanText);
                          }}
                          title="Seçeneği dinle"
                          className="w-8 h-8 rounded-xl bg-blue-100 group-hover:bg-blue-200 text-blue-700 flex items-center justify-center flex-shrink-0 transition active:scale-90 cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {quizSolved && (
                <div className="mt-6 flex flex-col items-center gap-3">
                  <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 px-5 py-2.5 rounded-2xl font-black">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Kitabı tamamladın! (+4 ⭐)</span>
                  </div>
                  {bookIdx < books.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => selectBook(bookIdx + 1)}
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-display font-black text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>Sonraki Kitap ({books[bookIdx + 1].title}) 📚</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => selectBook(0)}
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-display font-black text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition flex items-center gap-2 cursor-pointer"
                    >
                      <span>İlk Kitaba Dön 🌟</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
