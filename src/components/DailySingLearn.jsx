import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Music, Volume2, Sparkles, Tv, X, ChevronDown, ChevronUp } from 'lucide-react';
import { DAY_LESSONS } from '../data/dailyLessonsData';
import LeoBuddy from './LeoBuddy';
import {
  speakEnglish,
  stopSpeech,
  unlockAudio,
  triggerHoverSpeech,
  cancelHoverSpeech,
  prefetchSpeech,
} from '../utils/speech';
import {
  playSparkle,
  playTap,
  startKidsSongBeat,
  stopKidsSongBeat,
} from '../utils/soundEffects';

export default function DailySingLearn({ dayId, isMuted = false, showHelper: _showHelper = false, onGoToQuiz }) {
  const lesson = DAY_LESSONS[dayId];
  const [isSinging, setIsSinging] = useState(false);
  const [showVideo, setShowVideo] = useState(() => Boolean(lesson?.youtubeClip));
  const [showExamples, setShowExamples] = useState(true);
  const [activeLineIdx, setActiveLineIdx] = useState(-1);
  const [beatStep, setBeatStep] = useState(0);
  const [activeCardIdx, setActiveCardIdx] = useState(-1);
  const singSessionRef = useRef(0);
  const stepTimerRef = useRef(null);

  const stopSingAlong = () => {
    singSessionRef.current += 1;
    if (stepTimerRef.current) {
      clearTimeout(stepTimerRef.current);
      stepTimerRef.current = null;
    }
    stopKidsSongBeat();
    setIsSinging(false);
    setActiveLineIdx(-1);
    setBeatStep(0);
    stopSpeech();
  };

  useEffect(() => {
    return () => {
      singSessionRef.current += 1;
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
        stepTimerRef.current = null;
      }
      stopKidsSongBeat();
      cancelHoverSpeech();
    };
  }, []);

  useEffect(() => {
    if (isMuted || !lesson) return;
    prefetchSpeech([
      ...(lesson.chantLines || []).map((c) => c.en),
      ...(lesson.visualCards || []).map((c) => c.en),
    ]);
  }, [lesson, isMuted]);

  if (!lesson) return null;

  const playLineSequence = (idx, sessionId) => {
    if (sessionId !== singSessionRef.current) return;
    if (idx >= lesson.chantLines.length) {
      stopKidsSongBeat();
      setIsSinging(false);
      setActiveLineIdx(-1);
      setBeatStep(0);
      playSparkle(isMuted);
      return;
    }

    setActiveLineIdx(idx);

    const line = lesson.chantLines[idx];
    if (isMuted) {
      stepTimerRef.current = setTimeout(() => {
        playLineSequence(idx + 1, sessionId);
      }, 1800);
      return;
    }

    stepTimerRef.current = setTimeout(() => {
      playLineSequence(idx + 1, sessionId);
    }, 5200);

    speakEnglish(line.en, () => {
      if (sessionId !== singSessionRef.current) return;
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
      }
      stepTimerRef.current = setTimeout(() => {
        playLineSequence(idx + 1, sessionId);
      }, 450);
    });
  };

  const handleToggleSingAlong = () => {
    cancelHoverSpeech();
    unlockAudio();
    if (isSinging) {
      stopSingAlong();
      return;
    }

    singSessionRef.current += 1;
    const sessionId = singSessionRef.current;
    const dayNum = parseInt(String(dayId).replace(/\D/g, ''), 10) || 1;
    setIsSinging(true);
    startKidsSongBeat(isMuted, dayNum - 1, (step) => {
      setBeatStep(step % 4);
    });
    playLineSequence(0, sessionId);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white rounded-3xl p-4 sm:p-6 shadow-xl border-4 border-indigo-400/50 space-y-5">
      {/* Header + Leo Buddy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-3.5">
        <div className="flex items-center gap-3">
          <LeoBuddy
            mood={isSinging ? 'dancing' : 'happy'}
            size="sm"
            isMuted={isMuted}
          />
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-yellow-300 flex items-center gap-1">
              <Music className="w-3.5 h-3.5" />
              <span>Step 2 • Watch YouTube First, Then Listen with Leo!</span>
            </div>
            <h3 className="font-display font-black text-base sm:text-xl text-white">
              {lesson.songTitle}
            </h3>
          </div>
        </div>

        {lesson.youtubeClip && (
          <button
            type="button"
            onClick={() => {
              cancelHoverSpeech();
              setShowVideo((prev) => !prev);
            }}
            className={`inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl font-display font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer flex-shrink-0 ${
              showVideo
                ? 'bg-slate-800 hover:bg-slate-700 text-white border-2 border-red-400'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {showVideo ? <X className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
            <span>{showVideo ? 'Hide Video' : '🎬 Show YouTube Song'}</span>
          </button>
        )}
      </div>

      {/* PART 1: Topic-Matched YouTube Song FIRST */}
      {lesson.youtubeClip && showVideo && (
        <div className="bg-slate-950/85 border-2 border-red-400/70 rounded-2xl p-3 sm:p-4 space-y-3 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg bg-red-600 text-white font-black text-[11px] uppercase">
                1. 🎬 Watch YouTube Song ({lesson.youtubeClip.start}s – {lesson.youtubeClip.end}s)
              </span>
              <span className="font-display font-bold text-xs sm:text-sm text-white">
                {lesson.youtubeClip.title}
              </span>
            </div>
            <a
              href={`https://www.youtube.com/watch?v=${lesson.youtubeClip.videoId}&t=${lesson.youtubeClip.start}s`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-red-300 hover:text-red-200 underline"
            >
              Open on YouTube ↗
            </a>
          </div>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${lesson.youtubeClip.videoId}?start=${lesson.youtubeClip.start}&end=${lesson.youtubeClip.end}&autoplay=0&rel=0&modestbranding=1`}
              title={lesson.youtubeClip.title}
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-xs font-semibold text-indigo-200">
              ⏱️ {lesson.youtubeClip.end - lesson.youtubeClip.start}s topic-matched song clip
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('sing-listen-leo-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-display font-black text-xs shadow-sm cursor-pointer transition"
              >
                <span>2. 🎧 Listen with Leo ↓</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playSparkle(isMuted);
                  setShowVideo(false);
                  if (onGoToQuiz) {
                    onGoToQuiz();
                  } else {
                    const el = document.getElementById('daily-step-quiz');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-display font-black text-xs sm:text-sm shadow-md cursor-pointer transition active:scale-95"
              >
                <span>✅ Done! Let’s Play ↓</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PART 2: Now Listen & Sing Along with Leo */}
      <div id="sing-listen-leo-section" className="space-y-3 pt-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500 text-white font-black text-[11px] uppercase">
              2. 🎧 Now Listen &amp; Sing Along with Leo!
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleSingAlong}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl font-display font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer ${
              isSinging
                ? 'bg-rose-500 hover:bg-rose-600 text-white ring-4 ring-yellow-300/60'
                : 'bg-yellow-400 hover:bg-yellow-300 text-slate-950'
            }`}
          >
            {isSinging ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isSinging ? 'Stop' : '🎵 Play Beat'}</span>
            {isSinging && (
              <span className="inline-flex items-end gap-0.5 h-4 ml-1" aria-hidden="true">
                {[0, 1, 2].map((bar) => (
                  <span
                    key={bar}
                    className={`w-1 rounded-full bg-yellow-300 transition-all duration-150 ${
                      (beatStep + bar) % 2 === 0 ? 'h-4' : 'h-1.5'
                    }`}
                  />
                ))}
              </span>
            )}
          </button>
        </div>

        {/* Karaoke Chant Lines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {lesson.chantLines.map((line, idx) => {
            const isActive = activeLineIdx === idx;
            return (
              <button
                key={line.en}
                type="button"
                onPointerEnter={(e) => {
                  if (!isSinging) {
                    triggerHoverSpeech(line.en, { isMuted, pointerType: e.pointerType });
                  }
                }}
                onPointerLeave={cancelHoverSpeech}
                onClick={() => {
                  if (isSinging) stopSingAlong();
                  cancelHoverSpeech();
                  unlockAudio();
                  setActiveLineIdx(idx);
                  speakEnglish(line.en, () => setActiveLineIdx(-1));
                }}
                className={`rounded-2xl p-3.5 sm:p-4 border-2 text-left transition flex items-center gap-3 cursor-pointer ${
                  isActive
                    ? 'bg-yellow-400 text-slate-950 border-white scale-[1.03] shadow-lg'
                    : 'bg-white/10 hover:bg-white/15 text-white border-white/15'
                }`}
              >
                <span className={`text-3xl sm:text-4xl flex-shrink-0 ${isActive ? 'animate-bounce' : ''}`}>
                  {line.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-display font-black text-base sm:text-lg leading-snug">
                    {line.en}
                  </div>
                  {showHelper && line.tr && (
                    <div className={`text-xs sm:text-sm font-bold mt-0.5 ${isActive ? 'text-slate-700' : 'text-indigo-200'}`}>
                      {line.tr}
                    </div>
                  )}
                </div>
                <Volume2 className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-slate-900' : 'text-yellow-300'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapsible Examples & Sentence Builder */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => {
            playTap(isMuted);
            setShowExamples((prev) => !prev);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-yellow-300 font-display font-black text-xs cursor-pointer transition"
        >
          <span>🧩 Examples &amp; Sentence Builder</span>
          {showExamples ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {showExamples && (
        <div className="space-y-5 pt-2 border-t border-white/15">
          {/* Animated Visual Rule Cards */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-yellow-300 uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Examples:</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {lesson.visualCards.map((card, idx) => {
                const isCardActive = activeCardIdx === idx;
                return (
                  <button
                    key={card.badge}
                    type="button"
                    onPointerEnter={(e) => {
                      setActiveCardIdx(idx);
                      triggerHoverSpeech(card.en, { isMuted, pointerType: e.pointerType });
                    }}
                    onPointerLeave={() => {
                      setActiveCardIdx(-1);
                      cancelHoverSpeech();
                    }}
                    onClick={() => {
                      cancelHoverSpeech();
                      unlockAudio();
                      setActiveCardIdx(idx);
                      speakEnglish(card.en, () => setActiveCardIdx(-1));
                    }}
                    className={`rounded-2xl p-4 bg-white text-slate-900 border-2 text-left transition cursor-pointer shadow-md flex flex-col justify-between gap-2.5 ${
                      isCardActive ? 'border-yellow-400 ring-4 ring-yellow-300/40 -translate-y-0.5' : 'border-white/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-lg font-black text-[11px] uppercase ${card.badgeColor}`}>
                        {card.badge}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-3xl sm:text-4xl transition-transform duration-300 ${card.animClass}`}>
                          {card.emoji}
                        </span>
                        <Volume2 className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>

                    <div className="font-display font-black text-base sm:text-lg text-slate-900 leading-snug">
                      {card.en}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
