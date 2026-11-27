import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, Mic, CheckCircle2, Sparkles, Shuffle } from 'lucide-react';
import LeoBuddy from './LeoBuddy';
import {
  SILLY_SENTENCE_PARTS,
  buildSillySentence,
  getNextCyclicIndex,
  getRandomSillyIndices,
} from '../data/funnyData';
import { speakEnglish, speakEnglishSequence, stopSpeech, unlockAudio } from '../utils/speech';
import { playBoing, playComicPop, playGiggle, playTap } from '../utils/soundEffects';
import { createSpeechListener, evaluateKidPronunciation, isSpeechRecognitionSupported } from '../utils/speechRecognition';

const SLOT_META = [
  { key: 's', poolKey: 'subjects', label: 'WHO', bg: 'from-sky-50 to-blue-100 border-sky-300 text-sky-900' },
  { key: 'v', poolKey: 'verbs', label: 'ACTION', bg: 'from-rose-50 to-pink-100 border-rose-300 text-rose-900' },
  { key: 'o', poolKey: 'objects', label: 'SILLY THING', bg: 'from-amber-50 to-yellow-100 border-amber-300 text-amber-900' },
  { key: 'p', poolKey: 'places', label: 'WHERE', bg: 'from-emerald-50 to-teal-100 border-emerald-300 text-emerald-900' },
];

export default function SillySentenceGame({ onRewardEarned, isMuted = false, costume = 'cap' }) {
  const [indices, setIndices] = useState({ s: 0, v: 0, o: 0, p: 0 });
  const [isListening, setIsListening] = useState(false);
  const [heardText, setHeardText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [passedCount, setPassedCount] = useState(0);
  const [leoMood, setLeoMood] = useState('happy');
  const listenerRef = useRef(null);
  const moodTimerRef = useRef(null);
  const micSupported = isSpeechRecognitionSupported();

  const sentence = buildSillySentence(indices);

  useEffect(() => {
    return () => {
      if (listenerRef.current) listenerRef.current.abort();
      if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
      stopSpeech();
    };
  }, []);

  const flashLeoMood = useCallback((mood, durationMs = 2000) => {
    if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
    setLeoMood(mood);
    moodTimerRef.current = setTimeout(() => setLeoMood('happy'), durationMs);
  }, []);

  const handleCycleSlot = (slotKey, poolKey) => {
    unlockAudio();
    playComicPop(isMuted);
    const pool = SILLY_SENTENCE_PARTS[poolKey];
    const nextIdx = getNextCyclicIndex(indices[slotKey], pool.length);
    setIndices((prev) => ({ ...prev, [slotKey]: nextIdx }));
    setFeedback('');
    setHeardText('');
    if (!isMuted) {
      speakEnglish(pool[nextIdx].text);
    }
  };

  const handleMixCrazy = useCallback(() => {
    unlockAudio();
    playBoing(isMuted);
    const next = getRandomSillyIndices();
    setIndices(next);
    setFeedback('');
    setHeardText('');
    flashLeoMood('dancing', 2200);
    try {
      confetti({ particleCount: 45, spread: 70, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    if (!isMuted) {
      const mixed = buildSillySentence(next);
      speakEnglishSequence(mixed.parts);
    }
  }, [flashLeoMood, isMuted]);

  const handleReadSentence = useCallback(() => {
    unlockAudio();
    playTap(isMuted);
    flashLeoMood('cheering', 1800);
    if (!isMuted) {
      speakEnglishSequence(sentence.parts);
    }
  }, [flashLeoMood, isMuted, sentence.parts]);

  const handleCelebrateSayIt = useCallback(() => {
    playGiggle(isMuted);
    flashLeoMood('cheering', 2500);
    setPassedCount((c) => c + 1);
    setFeedback('Haha! Awesome silly English! (+3 ⭐)');
    try {
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    if (onRewardEarned) {
      onRewardEarned({ stars: 3, bricks: 1, gameName: 'Silly Sentence Lab' });
    }
    if (!isMuted) {
      speakEnglish('Awesome speaking!');
    }
  }, [flashLeoMood, isMuted, onRewardEarned]);

  const handleStartMic = async () => {
    if (!micSupported || isListening) return;
    unlockAudio();
    playTap(isMuted);
    setHeardText('');
    setFeedback('');
    setIsListening(true);
    setLeoMood('listening');

    listenerRef.current = createSpeechListener({
      lang: 'en-US',
      onInterim: (t) => setHeardText(t),
      onResult: async ({ transcript, isFinal } = {}) => {
        if (!isFinal) return;
        const finalText = transcript || '';
        setIsListening(false);
        setHeardText(finalText);
        const res = await evaluateKidPronunciation({
          targetPhrase: sentence.fullText,
          transcript: finalText,
        });
        if (res?.isAccepted) {
          handleCelebrateSayIt();
        } else {
          playBoing(isMuted);
          flashLeoMood('happy', 1200);
          setFeedback('Nice try! Tap Read It or say it loud!');
        }
      },
      onError: () => {
        setIsListening(false);
        setLeoMood('happy');
        setFeedback('Mic unavailable — tap "I Said It!" after reading!');
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
    if (listenerRef.current) listenerRef.current.start();
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      const target = e.target;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const isInteractive =
        tag === 'BUTTON' ||
        tag === 'A' ||
        target?.getAttribute?.('role') === 'button' ||
        Boolean(target?.closest?.('button, a, [role="button"]'));

      if (e.code === 'Space' && !isInteractive) {
        e.preventDefault();
        handleReadSentence();
      } else if (e.key === 'r' || e.key === 'R') {
        handleMixCrazy();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleMixCrazy, handleReadSentence]);

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-5 flex-1 island-pop-in">
      <div className="bg-white rounded-3xl shadow-xl border-4 border-amber-300 p-5 sm:p-7 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <LeoBuddy
            mood={leoMood}
            size="md"
            costume={costume}
            speechBubble="Mix crazy bricks to build a funny English sentence!"
            isMuted={isMuted}
          />
          <span className="px-3.5 py-1.5 rounded-full bg-amber-100 border-2 border-amber-300 font-display font-black text-xs sm:text-sm text-amber-900">
            🤣 {passedCount} Silly Sentences Spoken
          </span>
        </div>

        {/* Live Comic Picture & Full Sentence Preview */}
        <div className="rounded-3xl bg-gradient-to-br from-yellow-50 via-white to-sky-50 border-3 border-slate-200 p-5 text-center space-y-3">
          <div className="text-4xl sm:text-5xl tracking-wider">{sentence.emojis}</div>
          <p className="font-display font-black text-2xl sm:text-3xl text-slate-900 leading-snug">
            “{sentence.fullText}”
          </p>
        </div>

        {/* 4 Clickable Spinner Slots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SLOT_META.map((slot) => {
            const currentItem = sentence.slots[slot.key];
            return (
              <button
                key={slot.key}
                type="button"
                onClick={() => handleCycleSlot(slot.key, slot.poolKey)}
                className={`rounded-3xl bg-gradient-to-br ${slot.bg} border-3 border-b-4 p-4 text-center shadow-sm hover:-translate-y-0.5 transition cursor-pointer flex flex-col items-center gap-1.5`}
              >
                <span className="text-[11px] font-black uppercase tracking-wider opacity-75">
                  {slot.label} (Tap)
                </span>
                <span className="text-4xl my-1">{currentItem.emoji}</span>
                <span className="font-display font-black text-base leading-tight">
                  {currentItem.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleMixCrazy}
            className="px-5 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-black text-base shadow-md border-b-4 border-amber-600 inline-flex items-center gap-2 cursor-pointer"
          >
            <Shuffle className="w-5 h-5" />
            <span>🎲 Mix Something Crazy!</span>
          </button>

          <button
            type="button"
            onClick={handleReadSentence}
            className="px-5 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-base shadow-md border-b-4 border-blue-800 inline-flex items-center gap-2 cursor-pointer"
          >
            <Volume2 className="w-5 h-5" />
            <span>Read It!</span>
          </button>

          {micSupported && (
            <button
              type="button"
              onClick={handleStartMic}
              disabled={isListening}
              className={`px-5 py-3.5 rounded-2xl font-display font-black text-base shadow-md border-b-4 inline-flex items-center gap-2 cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-700 animate-pulse'
                  : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-800'
              }`}
            >
              <Mic className="w-5 h-5" />
              <span>{isListening ? 'Listening...' : 'Say It Aloud!'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCelebrateSayIt}
            className="px-5 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-black text-base shadow-md border-b-4 border-emerald-700 inline-flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>I Said It! (+3 ⭐)</span>
          </button>
        </div>

        {(heardText || feedback) && (
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-black">
            {heardText && (
              <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800">
                Heard: “{heardText}”
              </span>
            )}
            {feedback && (
              <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{feedback}</span>
              </span>
            )}
          </div>
        )}

        <div className="hidden sm:block text-center text-xs font-bold text-slate-400">
          Keyboard: Space = Read It • R = Mix Crazy Sentence
        </div>
      </div>
    </div>
  );
}
