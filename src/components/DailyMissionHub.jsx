import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  CheckCircle2,
  BookOpen,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Mic,
} from 'lucide-react';
import {
  DAILY_EXPEDITION_DAYS,
  getWorksheetQuestions,
} from '../data/dailyMissionsData';
import {
  speakEnglish,
  stopSpeech,
  prefetchSpeech,
  unlockAudio,
  triggerHoverSpeech,
  cancelHoverSpeech,
} from '../utils/speech';
import { playTap, playSuccess, playWobble } from '../utils/soundEffects';
import { recordMissedWord, recordMasteredWord } from '../utils/reviewTracker';
import { useVoiceQuizAnswer } from '../utils/useVoiceQuizAnswer';
import DailySingLearn from './DailySingLearn';

export default function DailyMissionHub({
  dailyChecklist = {},
  onToggleChecklistItem: _onToggleChecklistItem,
  dailyQuizAnswers = {},
  onSaveDailyQuizAnswer,
  onResetDailyQuizQuestions,
  onRewardEarned,
  onOpenDiscoveryGame: _onOpenDiscoveryGame,
  onOpenStory,
  onOpenDailyRecall,
  onOpenPrintable: _onOpenPrintable,
  selectedDayId,
  onSelectDayId,
  isMuted = false,
}) {
  const [internalDayId, setInternalDayId] = useState('day-1');
  const currentDayId =
    selectedDayId && DAILY_EXPEDITION_DAYS.some((d) => d.id === selectedDayId)
      ? selectedDayId
      : internalDayId;

  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [speakingTarget, setSpeakingTarget] = useState(null);
  const [isSlowMode, setIsSlowMode] = useState(false);
  const quizSpeechSessionRef = useRef(0);
  const quizSpeechTimerRef = useRef(null);
  const voiceBonusIdsRef = useRef(new Set());

  const stopQuizSpeech = useCallback(() => {
    quizSpeechSessionRef.current += 1;
    if (quizSpeechTimerRef.current) {
      clearTimeout(quizSpeechTimerRef.current);
      quizSpeechTimerRef.current = null;
    }
    setSpeakingTarget(null);
    stopSpeech();
  }, []);

  useEffect(() => {
    return () => {
      stopQuizSpeech();
      cancelHoverSpeech();
    };
  }, [stopQuizSpeech]);

  const setDayId = (dayId) => {
    playTap(isMuted);
    stopQuizSpeech();
    setActiveQuestionIdx(0);
    if (onSelectDayId) {
      onSelectDayId(dayId);
    } else {
      setInternalDayId(dayId);
    }
  };

  const activeDay =
    DAILY_EXPEDITION_DAYS.find((d) => d.id === currentDayId) || DAILY_EXPEDITION_DAYS[0];

  const dayWorksheet = useMemo(
    () => getWorksheetQuestions({ mode: 'day', dayId: activeDay.id }),
    [activeDay.id]
  );
  const dayQuizQuestions = useMemo(
    () => dayWorksheet.questions || [],
    [dayWorksheet]
  );

  // Pre-warm Gemini TTS cache for daily key vocabulary & initial quiz prompts
  useEffect(() => {
    if (isMuted || !activeDay) return;
    prefetchSpeech([
      ...(activeDay.vocabFocus || []).map((v) => v.en),
      ...dayQuizQuestions.slice(0, 2).map((q) => q.promptEn),
    ]);
  }, [activeDay, dayQuizQuestions, isMuted]);
  const dayQuizScore = dayQuizQuestions.filter((q) => {
    const chosenId = dailyQuizAnswers[q.id];
    return q.options.some((o) => o.id === chosenId && o.isCorrect);
  }).length;

  const playQuestionAndOptions = useCallback(
    (question) => {
      if (!question || isMuted) return;
      cancelHoverSpeech();
      unlockAudio();
      stopQuizSpeech();

      const sessionId = quizSpeechSessionRef.current;
      const steps = [
        { target: 'prompt', text: question.promptEn },
        ...question.options.map((opt, idx) => ({
          target: idx,
          text: `${['A', 'B', 'C'][idx]}: ${opt.textEn}`,
        })),
      ];

      const runStep = (stepIdx) => {
        if (sessionId !== quizSpeechSessionRef.current) return;
        if (stepIdx >= steps.length) {
          setSpeakingTarget(null);
          return;
        }
        const step = steps[stepIdx];
        setSpeakingTarget(step.target);
        quizSpeechTimerRef.current = setTimeout(() => {
          runStep(stepIdx + 1);
        }, 4500);

        speakEnglish(
          step.text,
          () => {
            if (sessionId !== quizSpeechSessionRef.current) return;
            if (quizSpeechTimerRef.current) {
              clearTimeout(quizSpeechTimerRef.current);
            }
            quizSpeechTimerRef.current = setTimeout(() => {
              runStep(stepIdx + 1);
            }, 260);
          },
          { rate: isSlowMode ? 0.8 : 1.0 }
        );
      };

      runStep(0);
    },
    [isMuted, isSlowMode, stopQuizSpeech]
  );

  const handleSelectQuestion = (idx, autoRead = true) => {
    const safeIdx = Math.max(0, Math.min(idx, dayQuizQuestions.length - 1));
    setActiveQuestionIdx(safeIdx);
    const targetQ = dayQuizQuestions[safeIdx];
    if (autoRead && targetQ) {
      playQuestionAndOptions(targetQ);
    } else {
      stopQuizSpeech();
    }
  };

  const handleDailyQuizClick = useCallback((questionId, opt, viaVoice = false) => {
    cancelHoverSpeech();
    stopQuizSpeech();
    unlockAudio();
    const targetQ = dayQuizQuestions.find((item) => item.id === questionId);
    const correctOpt = targetQ?.options?.find((o) => o.isCorrect) || opt;
    if (opt.isCorrect) {
      playSuccess(isMuted);
      confetti({ particleCount: 45, spread: 65, origin: { y: 0.65 } });
      recordMasteredWord(correctOpt.textEn, correctOpt.emoji, correctOpt.labelTr || '');
      if (viaVoice && !voiceBonusIdsRef.current.has(questionId)) {
        voiceBonusIdsRef.current.add(questionId);
        if (onRewardEarned) {
          onRewardEarned({ stars: 2, bricks: 1 });
        }
        confetti({ particleCount: 65, spread: 75, origin: { y: 0.6 } });
      }
    } else {
      playWobble(isMuted);
      recordMissedWord(correctOpt.textEn, correctOpt.emoji, correctOpt.labelTr || '');
    }
    if (!isMuted) {
      setTimeout(() => speakEnglish(opt.textEn, undefined, { rate: isSlowMode ? 0.8 : 1.0 }), 280);
    }
    if (onSaveDailyQuizAnswer) {
      onSaveDailyQuizAnswer(questionId, opt.id);
    }
  }, [dayQuizQuestions, isMuted, isSlowMode, onRewardEarned, onSaveDailyQuizAnswer, stopQuizSpeech]);

  const safeQuestionIdx = Math.min(activeQuestionIdx, Math.max(0, dayQuizQuestions.length - 1));
  const activeDailyQuestion = dayQuizQuestions[safeQuestionIdx] || null;

  const {
    isListening: isQuizListening,
    heardText: quizHeardText,
    voiceNotice: quizVoiceNotice,
    micSupported: quizMicSupported,
    startVoiceAnswer: startQuizVoiceAnswer,
    stopVoiceAnswer: stopQuizVoiceAnswer,
  } = useVoiceQuizAnswer({
    options: activeDailyQuestion?.options || [],
    questionKey: activeDailyQuestion?.id || '',
    isMuted,
    onBeforeListen: stopQuizSpeech,
    onMatchedOption: (matchedOpt) => {
      if (activeDailyQuestion) {
        handleDailyQuizClick(activeDailyQuestion.id, matchedOpt, true);
      }
    },
  });

  const handleResetDayQuiz = () => {
    playTap(isMuted);
    stopQuizSpeech();
    setActiveQuestionIdx(0);
    if (onResetDailyQuizQuestions) {
      onResetDailyQuizQuestions(dayQuizQuestions.map((q) => q.id));
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-5 space-y-4 flex-1">
      {/* Clean Horizontal Day Selector */}
      <div className="bg-white rounded-3xl p-2.5 sm:p-3 shadow-sm border-2 border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {DAILY_EXPEDITION_DAYS.map((day) => {
            const isSelected = day.id === activeDay.id;
            const doneCount = (day.items || []).filter((i) => Boolean(dailyChecklist[i.id])).length;
            const totalCount = day.items?.length || 0;
            const dayWs = getWorksheetQuestions({ mode: 'day', dayId: day.id });
            const dayQuizTotal = (dayWs.questions || []).length || 10;
            const dayQuizDone = (dayWs.questions || []).filter((q) =>
              Boolean(dailyQuizAnswers[q.id])
            ).length;
            const isComplete =
              (totalCount > 0 && doneCount === totalCount) || dayQuizDone === dayQuizTotal;

            return (
              <button
                key={day.id}
                type="button"
                onClick={() => setDayId(day.id)}
                className={`px-3 py-2 rounded-2xl border-2 font-display font-black text-xs sm:text-sm whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-800 shadow-xs'
                    : isComplete
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300'
                }`}
              >
                <span>{day.shortLabel}</span>
                {dayQuizDone > 0 && !isComplete && (
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {dayQuizDone}/{dayQuizTotal}
                  </span>
                )}
                {isComplete && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Topic + 4 Key Words */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border-2 border-slate-200 space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base sm:text-xl font-display font-black text-slate-900">
            {activeDay.shortLabel}: {activeDay.title}
          </h2>

          <div className="flex items-center gap-2 flex-shrink-0">
            {onOpenDailyRecall && (
              <button
                type="button"
                onClick={() => {
                  playTap(isMuted);
                  onOpenDailyRecall();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-display font-black text-xs sm:text-sm shadow-xs cursor-pointer transition"
                title="Dün neler yaptık? Günlük hafıza özeti"
              >
                <span>🧠 Neler Yaptık?</span>
              </button>
            )}

            {onOpenStory && (
              <button
                type="button"
                onClick={() => {
                  playTap(isMuted);
                  onOpenStory();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-display font-black text-xs sm:text-sm shadow-xs flex-shrink-0 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>📖 Hikaye</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Key Words */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(activeDay.vocabFocus || []).map((v) => (
            <button
              key={v.en}
              type="button"
              onPointerEnter={(e) =>
                triggerHoverSpeech(v.en, { isMuted, pointerType: e.pointerType })
              }
              onPointerLeave={cancelHoverSpeech}
              onClick={() => {
                cancelHoverSpeech();
                unlockAudio();
                speakEnglish(v.en);
              }}
              className="bg-slate-50 hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-400 rounded-2xl p-3.5 sm:p-4 text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 active:scale-95"
            >
              <span className="text-3xl sm:text-4xl leading-none">{v.emoji}</span>
              <div className="font-display font-black text-base sm:text-xl text-slate-900 flex items-center gap-1">
                <span>{v.en}</span>
                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Animated Sing-Along */}
      <DailySingLearn key={activeDay.id} dayId={activeDay.id} isMuted={isMuted} />

      {/* Daily 10-Question Quiz (Single Clean Card) */}
      <div id="daily-step-quiz" className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border-2 border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            {dayQuizQuestions.map((q, qIdx) => {
              const chosenId = dailyQuizAnswers[q.id];
              const isCorrect = chosenId && q.options.some((o) => o.id === chosenId && o.isCorrect);
              const isActive = qIdx === activeQuestionIdx;
              let pillCls = 'bg-slate-100 text-slate-600 border-slate-200 hover:border-blue-300';
              if (chosenId) {
                pillCls = isCorrect
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                  : 'bg-rose-100 text-rose-800 border-rose-400';
              }
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => handleSelectQuestion(qIdx, true)}
                  className={`w-9 h-9 rounded-xl border-2 font-display font-black text-xs flex items-center justify-center transition cursor-pointer ${pillCls} ${
                    isActive ? 'ring-4 ring-blue-300/60 scale-110 border-blue-600' : ''
                  }`}
                  title={`Soru ${qIdx + 1}`}
                >
                  {qIdx + 1}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                playTap(isMuted);
                setIsSlowMode((prev) => !prev);
              }}
              className={`px-2.5 py-2 rounded-xl font-display font-black text-xs border-2 transition cursor-pointer ${
                isSlowMode
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="Yavaş Mod"
            >
              🐢
            </button>
            {activeDailyQuestion && (
              <button
                type="button"
                onClick={() => {
                  stopQuizVoiceAnswer();
                  playQuestionAndOptions(activeDailyQuestion);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-xs shadow-xs cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>🔊 Dinle</span>
              </button>
            )}
            {quizMicSupported && (
              <button
                type="button"
                onClick={startQuizVoiceAnswer}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-display font-black text-xs shadow-xs cursor-pointer transition ${
                  isQuizListening
                    ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-300'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>{isQuizListening ? 'Dinliyorum...' : '🎙️ Sesli (+2 ⭐)'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleResetDayQuiz}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              title="Testi Sıfırla"
              aria-label="Testi Sıfırla"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {(isQuizListening || quizVoiceNotice) && (
          <div className="flex flex-wrap items-center gap-2">
            {isQuizListening && (
              <span className="px-3 py-1 rounded-xl bg-rose-100 text-rose-900 font-black text-xs animate-pulse">
                🎙️ {quizHeardText ? `"${quizHeardText}"` : 'Dinliyorum...'}
              </span>
            )}
            {!isQuizListening && quizVoiceNotice && (
              <span
                className={`px-3 py-1 rounded-xl font-black text-xs ${
                  quizVoiceNotice.type === 'matched'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {quizVoiceNotice.text}
              </span>
            )}
          </div>
        )}

        {/* Single Focused Question */}
        {(() => {
          const safeIdx = Math.min(activeQuestionIdx, Math.max(0, dayQuizQuestions.length - 1));
          const q = dayQuizQuestions[safeIdx];
          if (!q) return null;
          const chosenId = dailyQuizAnswers[q.id];
          const isPromptSpeaking = speakingTarget === 'prompt';
          const hasNext = safeIdx < dayQuizQuestions.length - 1;
          const hasPrev = safeIdx > 0;

          return (
            <div className="space-y-4">
              <div
                onPointerEnter={(e) =>
                  triggerHoverSpeech(q.promptEn, { isMuted, pointerType: e.pointerType })
                }
                onPointerLeave={cancelHoverSpeech}
                onClick={() => {
                  stopQuizVoiceAnswer();
                  playQuestionAndOptions(q);
                }}
                className={`rounded-2xl p-4 bg-slate-50 border-2 transition flex items-center gap-4 cursor-pointer ${
                  isPromptSpeaking
                    ? 'border-yellow-400 ring-4 ring-yellow-300/50 shadow-sm'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <span className="text-4xl sm:text-5xl flex-shrink-0">{q.characterEmoji}</span>
                <div className="text-lg sm:text-2xl font-display font-black text-slate-900 leading-snug flex-1">
                  {q.promptEn}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {q.options.map((opt, optIdx) => {
                  const isChosen = chosenId === opt.id;
                  const isOptSpeaking = speakingTarget === optIdx;
                  let cls =
                    'bg-white border-slate-200 hover:border-blue-400 text-slate-800 hover:-translate-y-0.5';
                  if (chosenId) {
                    if (opt.isCorrect) {
                      cls = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-black shadow-sm';
                    } else if (isChosen) {
                      cls = 'bg-rose-50 border-rose-400 text-rose-900';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onPointerEnter={(e) =>
                        triggerHoverSpeech(opt.textEn, { isMuted, pointerType: e.pointerType })
                      }
                      onPointerLeave={cancelHoverSpeech}
                      onClick={() => handleDailyQuizClick(q.id, opt)}
                      className={`w-full text-left px-4 py-4 rounded-2xl border-2 text-base sm:text-lg font-display font-bold flex items-center justify-between gap-2 transition cursor-pointer shadow-xs ${cls} ${
                        isOptSpeaking ? 'ring-4 ring-yellow-400 border-yellow-500 scale-[1.02]' : ''
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-2xl sm:text-3xl">{opt.emoji}</span>
                        <span>{opt.textEn}</span>
                      </span>
                      {chosenId && opt.isCorrect && <span className="text-xl">✅</span>}
                      {chosenId && isChosen && !opt.isCorrect && <span className="text-xl">❌</span>}
                    </button>
                  );
                })}
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  disabled={!hasPrev}
                  onClick={() => handleSelectQuestion(safeIdx - 1, true)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-display font-black text-sm border-2 transition ${
                    hasPrev
                      ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer'
                      : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Önceki</span>
                </button>

                {hasNext ? (
                  <button
                    type="button"
                    onClick={() => handleSelectQuestion(safeIdx + 1, true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-display font-black text-sm shadow-sm border-2 border-yellow-500 cursor-pointer transition active:scale-95"
                  >
                    <span>Sonraki Soru</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-900 font-display font-black text-sm border border-emerald-300">
                    🏁 {dayQuizScore} / {dayQuizQuestions.length} Doğru!
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
