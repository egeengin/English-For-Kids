import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Music, Volume2, Sparkles, Tv, X, Mic, ChevronDown, ChevronUp } from 'lucide-react';
import { DAY_LESSONS } from '../data/dailyLessonsData';
import LeoBuddy from './LeoBuddy';
import {
  speakEnglish,
  stopSpeech,
  unlockAudio,
  triggerHoverSpeech,
  cancelHoverSpeech,
} from '../utils/speech';
import {
  playSparkle,
  playTap,
  startKidsSongBeat,
  stopKidsSongBeat,
} from '../utils/soundEffects';

export default function DailySingLearn({ dayId, isMuted = false, showHelper = false, onGoToQuiz }) {
  const lesson = DAY_LESSONS[dayId];
  const [isSinging, setIsSinging] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const [activeLineIdx, setActiveLineIdx] = useState(-1);
  const [beatStep, setBeatStep] = useState(0);
  const [activeCardIdx, setActiveCardIdx] = useState(-1);
  const [selectedPatternChips, setSelectedPatternChips] = useState({});
  const [recordingPatternId, setRecordingPatternId] = useState(null);
  const [playingPatternId, setPlayingPatternId] = useState(null);
  const [recordedUrls, setRecordedUrls] = useState({});
  const [micStatus, setMicStatus] = useState('');
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [sandboxSubj, setSandboxSubj] = useState('I');
  const [sandboxAct, setSandboxAct] = useState('can swim');
  const [sandboxExtra, setSandboxExtra] = useState('every day');
  const singSessionRef = useRef(0);
  const stepTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const micStopTimerRef = useRef(null);

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
      if (micStopTimerRef.current) {
        clearTimeout(micStopTimerRef.current);
        micStopTimerRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }
      stopKidsSongBeat();
      cancelHoverSpeech();
    };
  }, []);

  const handlePracticeSpeak = async (patternId) => {
    cancelHoverSpeech();
    stopSingAlong();

    if (recordingPatternId === patternId) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      setMicStatus('Voice recording is not supported in this browser.');
      return;
    }

    try {
      setMicStatus('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      setRecordingPatternId(patternId);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecordingPatternId(null);
        if (micStopTimerRef.current) {
          clearTimeout(micStopTimerRef.current);
          micStopTimerRef.current = null;
        }
        if (chunks.length === 0) return;
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedUrls((prev) => {
          if (prev[patternId]) URL.revokeObjectURL(prev[patternId]);
          return { ...prev, [patternId]: url };
        });
        const audio = new Audio(url);
        setPlayingPatternId(patternId);
        audio.onended = () => setPlayingPatternId(null);
        audio.onerror = () => setPlayingPatternId(null);
        audio.play().catch(() => setPlayingPatternId(null));
      };

      recorder.start();
      micStopTimerRef.current = setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 3500);
    } catch {
      setRecordingPatternId(null);
      setMicStatus('Microphone permission was not granted.');
    }
  };

  const handleCompareSpeak = (patternId, referenceEn) => {
    const clipUrl = recordedUrls[patternId];
    if (!clipUrl) return;
    cancelHoverSpeech();
    unlockAudio();
    speakEnglish(referenceEn, () => {
      setTimeout(() => {
        const audio = new Audio(clipUrl);
        setPlayingPatternId(patternId);
        audio.onended = () => setPlayingPatternId(null);
        audio.onerror = () => setPlayingPatternId(null);
        audio.play().catch(() => setPlayingPatternId(null));
      }, 450);
    });
  };

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

    setShowVideo(false);
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
      {/* Header + Leo Buddy + Sing-Along Action */}
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
              <span>Sing Along with Leo</span>
            </div>
            <h3 className="font-display font-black text-base sm:text-xl text-white">
              {lesson.songTitle}
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          {lesson.youtubeClip && (
            <button
              type="button"
              onClick={() => {
                cancelHoverSpeech();
                if (!showVideo) {
                  stopSingAlong();
                }
                setShowVideo((prev) => !prev);
              }}
              className={`inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl font-display font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer ${
                showVideo
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border-2 border-red-400'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {showVideo ? <X className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
              <span>{showVideo ? 'Close' : '🎬 Watch Song'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleSingAlong}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-display font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer ${
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
      </div>

      {/* Curated YouTube Song Clip */}
      {showVideo && lesson.youtubeClip && (
        <div className="bg-slate-950/80 border-2 border-red-400/60 rounded-2xl p-3 sm:p-4 space-y-2.5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-red-600 text-white font-black text-[11px] uppercase">
                🎬 Clip ({lesson.youtubeClip.start}s – {lesson.youtubeClip.end}s)
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
              src={`https://www.youtube.com/embed/${lesson.youtubeClip.videoId}?start=${lesson.youtubeClip.start}&end=${lesson.youtubeClip.end}&autoplay=1&rel=0&modestbranding=1`}
              title={lesson.youtubeClip.title}
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-xs font-semibold text-indigo-200">
              ⏱️ {lesson.youtubeClip.end - lesson.youtubeClip.start}s song clip
            </span>
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
      )}

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
                      <span className={`text-3xl sm:text-4xl transition-transform duration-300 ${card.animClass}`}>
                        {card.emoji}
                      </span>
                    </div>

                    <div className="font-display font-black text-base sm:text-lg text-slate-900 leading-snug">
                      {card.en}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Sentence Pattern Builder */}
          {Array.isArray(lesson.patterns) && lesson.patterns.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-white/15">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-300 uppercase tracking-wide">
                <span>🧩 Sentence Builder (Tap a word, build &amp; speak!):</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lesson.patterns.map((pattern) => {
                  const selectedIdx = selectedPatternChips[pattern.id] ?? 0;
                  const activeOpt = pattern.options[selectedIdx] || pattern.options[0];
                  return (
                    <div
                      key={pattern.id}
                      className="bg-white/10 border border-white/20 rounded-2xl p-3.5 sm:p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-black text-yellow-300 uppercase">
                          {showHelper && pattern.titleTr ? pattern.titleTr : 'Build & Speak'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handlePracticeSpeak(pattern.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-black text-[11px] cursor-pointer transition ${
                              recordingPatternId === pattern.id
                                ? 'bg-rose-500 text-white animate-pulse'
                                : playingPatternId === pattern.id
                                ? 'bg-emerald-400 text-slate-950'
                                : 'bg-white/20 hover:bg-white/30 text-white'
                            }`}
                            title="Record your voice and listen back"
                          >
                            <Mic className="w-3.5 h-3.5" />
                            <span>
                              {recordingPatternId === pattern.id
                                ? 'Listening... (Stop)'
                                : playingPatternId === pattern.id
                                ? 'Playing!'
                                : 'Record'}
                            </span>
                          </button>
                          {recordedUrls[pattern.id] && (
                            <button
                              type="button"
                              onClick={() => handleCompareSpeak(pattern.id, activeOpt.fullEn)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-400 text-slate-950 font-black text-[11px] cursor-pointer hover:bg-sky-300"
                              title="Play English model, then your voice"
                            >
                              <span>🔁 Compare</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              cancelHoverSpeech();
                              unlockAudio();
                              speakEnglish(activeOpt.fullEn);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-400 text-slate-950 font-black text-[11px] cursor-pointer hover:bg-yellow-300"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen</span>
                          </button>
                        </div>
                      </div>
                      {micStatus && (
                        <div className="text-[11px] font-bold text-amber-200">{micStatus}</div>
                      )}

                      {/* Assembled Sentence Slot */}
                      <div className="bg-slate-950/60 border border-white/15 rounded-xl p-3">
                        <div className="font-display font-black text-base sm:text-lg text-white flex flex-wrap items-center gap-1.5">
                          <span>{pattern.templateBefore}</span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-yellow-400 text-slate-950 shadow-sm">
                            {activeOpt.emoji} {activeOpt.word}
                          </span>
                          <span>{pattern.templateAfter}</span>
                        </div>
                      </div>

                      {/* Selectable Word Chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {pattern.options.map((opt, oIdx) => {
                          const isPicked = oIdx === selectedIdx;
                          return (
                            <button
                              key={opt.word}
                              type="button"
                              onPointerEnter={(e) =>
                                triggerHoverSpeech(opt.fullEn, {
                                  isMuted,
                                  pointerType: e.pointerType,
                                })
                              }
                              onPointerLeave={cancelHoverSpeech}
                              onClick={() => {
                                cancelHoverSpeech();
                                unlockAudio();
                                playTap(isMuted);
                                setSelectedPatternChips((prev) => ({
                                  ...prev,
                                  [pattern.id]: oIdx,
                                }));
                                speakEnglish(opt.fullEn);
                              }}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-display font-black border transition cursor-pointer ${
                                isPicked
                                  ? 'bg-emerald-500 text-white border-emerald-300 shadow-sm'
                                  : 'bg-white text-slate-900 border-slate-200 hover:bg-yellow-100'
                              }`}
                            >
                              {opt.emoji} {opt.word}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Free Sentence Sandbox */}
          <div className="pt-2 border-t border-white/15 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  playTap(isMuted);
                  setSandboxOpen((prev) => !prev);
                }}
                className="inline-flex items-center gap-2 text-xs font-black text-sky-300 hover:text-sky-200 uppercase tracking-wide cursor-pointer"
              >
                <span>🧪 Silly Sentence Sandbox (Make your own!)</span>
                <span className="px-2 py-0.5 rounded-lg bg-white/10 text-white text-[10px]">
                  {sandboxOpen ? 'Hide ▲' : 'Open ▼'}
                </span>
              </button>
            </div>

            {sandboxOpen && (
              <div className="bg-slate-950/60 border border-sky-400/30 rounded-2xl p-3.5 sm:p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-display font-black text-base sm:text-lg text-white">
                    {sandboxSubj} <span className="text-yellow-300">{sandboxAct}</span>{' '}
                    <span className="text-emerald-300">{sandboxExtra}</span>!
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      cancelHoverSpeech();
                      unlockAudio();
                      speakEnglish(`${sandboxSubj} ${sandboxAct} ${sandboxExtra}!`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-display font-black text-xs cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Read Sentence</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {['I', 'My friend', 'The fox', 'Dad'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          playTap(isMuted);
                          setSandboxSubj(s);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer ${
                          sandboxSubj === s
                            ? 'bg-sky-400 text-slate-950'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['can swim', 'have got a rocket', 'played basketball', 'is faster than a car'].map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => {
                          playTap(isMuted);
                          setSandboxAct(a);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer ${
                          sandboxAct === a
                            ? 'bg-yellow-400 text-slate-950'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['every day', 'in the park', 'at 8 o’clock', 'tomorrow'].map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => {
                          playTap(isMuted);
                          setSandboxExtra(ex);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer ${
                          sandboxExtra === ex
                            ? 'bg-emerald-400 text-slate-950'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
