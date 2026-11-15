import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Music, Volume2, Sparkles } from 'lucide-react';
import { DAY_LESSONS } from '../data/dailyLessonsData';
import {
  speakEnglish,
  stopSpeech,
  unlockAudio,
  triggerHoverSpeech,
  cancelHoverSpeech,
} from '../utils/speech';
import { playSparkle, playTap } from '../utils/soundEffects';

export default function DailySingLearn({ dayId, isMuted = false }) {
  const lesson = DAY_LESSONS[dayId];
  const [isSinging, setIsSinging] = useState(false);
  const [activeLineIdx, setActiveLineIdx] = useState(-1);
  const [activeCardIdx, setActiveCardIdx] = useState(-1);
  const singSessionRef = useRef(0);
  const stepTimerRef = useRef(null);

  const stopSingAlong = () => {
    singSessionRef.current += 1;
    if (stepTimerRef.current) {
      clearTimeout(stepTimerRef.current);
      stepTimerRef.current = null;
    }
    setIsSinging(false);
    setActiveLineIdx(-1);
    stopSpeech();
  };

  useEffect(() => {
    return () => {
      singSessionRef.current += 1;
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
        stepTimerRef.current = null;
      }
      cancelHoverSpeech();
    };
  }, []);

  if (!lesson) return null;

  const playLineSequence = (idx, sessionId) => {
    if (sessionId !== singSessionRef.current) return;
    if (idx >= lesson.chantLines.length) {
      setIsSinging(false);
      setActiveLineIdx(-1);
      playSparkle(isMuted);
      return;
    }

    setActiveLineIdx(idx);
    playTap(isMuted);

    const line = lesson.chantLines[idx];
    if (isMuted) {
      stepTimerRef.current = setTimeout(() => {
        playLineSequence(idx + 1, sessionId);
      }, 1500);
      return;
    }

    // Safety timer in case speech callback is interrupted
    stepTimerRef.current = setTimeout(() => {
      playLineSequence(idx + 1, sessionId);
    }, 5500);

    speakEnglish(line.en, () => {
      if (sessionId !== singSessionRef.current) return;
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
      }
      stepTimerRef.current = setTimeout(() => {
        playLineSequence(idx + 1, sessionId);
      }, 260);
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
    setIsSinging(true);
    playSparkle(isMuted);
    playLineSequence(0, sessionId);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white rounded-3xl p-4 sm:p-6 shadow-xl border-4 border-indigo-400/50 space-y-5">
      {/* Header + Sing-Along Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-3.5">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl bg-yellow-400 text-slate-950 flex items-center justify-center shadow-md flex-shrink-0 ${
              isSinging ? 'animate-bounce' : ''
            }`}
          >
            <Music className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 font-black text-[11px] uppercase">
                Önce Öğren & Şarkı Söyle
              </span>
            </div>
            <h3 className="font-display font-black text-base sm:text-xl text-white mt-0.5">
              {lesson.songTitle}
            </h3>
            <p className="text-xs text-indigo-200 font-semibold">{lesson.songSubtitleTr}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleSingAlong}
          className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-display font-black text-sm shadow-lg transition active:scale-95 cursor-pointer flex-shrink-0 ${
            isSinging
              ? 'bg-rose-500 hover:bg-rose-600 text-white'
              : 'bg-yellow-400 hover:bg-yellow-300 text-slate-950'
          }`}
        >
          {isSinging ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isSinging ? 'Durdur' : '🎵 Şarkıyı Çal (Sing-Along)'}</span>
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
              className={`rounded-2xl p-3 sm:p-3.5 border-2 text-left transition flex items-center gap-3 cursor-pointer ${
                isActive
                  ? 'bg-yellow-400 text-slate-950 border-white scale-[1.02] shadow-lg'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/15'
              }`}
            >
              <span className={`text-2xl sm:text-3xl flex-shrink-0 ${isActive ? 'animate-bounce' : ''}`}>
                {line.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-display font-black text-sm sm:text-base leading-snug">
                  {line.en}
                </div>
                <div className={`text-[11px] font-bold mt-0.5 ${isActive ? 'text-slate-800' : 'text-indigo-200'}`}>
                  {line.tr}
                </div>
              </div>
              <Volume2 className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-900' : 'text-yellow-300'}`} />
            </button>
          );
        })}
      </div>

      {/* Animated Visual Rule Cards (Teach before Testing) */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-black text-yellow-300 uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Canlı Örneklerle Öğren (Üstüne gel veya tıkla):</span>
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
                className={`rounded-2xl p-3.5 bg-white text-slate-900 border-2 text-left transition cursor-pointer shadow-md flex flex-col justify-between gap-2 ${
                  isCardActive ? 'border-yellow-400 ring-4 ring-yellow-300/40 -translate-y-0.5' : 'border-white/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-lg font-black text-[10px] uppercase ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                  <span className={`text-2xl sm:text-3xl transition-transform duration-300 ${card.animClass}`}>
                    {card.emoji}
                  </span>
                </div>

                <div>
                  <div className="font-display font-black text-sm sm:text-base text-slate-900 leading-snug">
                    “{card.en}”
                  </div>
                  <div className="text-[11px] font-bold text-slate-600 mt-1">
                    🇹🇷 {card.tr}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400">
                    🇩🇪 {card.de}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
