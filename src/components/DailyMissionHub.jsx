import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Printer,
  CheckCircle2,
  Tv,
  ExternalLink,
  BookOpen,
  Star,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Play,
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
import DailySingLearn from './DailySingLearn';

export default function DailyMissionHub({
  dailyChecklist = {},
  onToggleChecklistItem,
  dailyQuizAnswers = {},
  onSaveDailyQuizAnswer,
  onResetDailyQuizQuestions,
  onOpenDiscoveryGame,
  onOpenStory,
  onOpenPrintable,
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
  const [todayGoalCount, setTodayGoalCount] = useState(() => {
    try {
      const todayKey = new Date().toISOString().slice(0, 10);
      const saved = JSON.parse(localStorage.getItem('lego_daily_micro_goal_v1') || '{}');
      return saved.date === todayKey ? Number(saved.count || 0) : 0;
    } catch {
      return 0;
    }
  });
  const quizSpeechSessionRef = useRef(0);
  const quizSpeechTimerRef = useRef(null);

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
  const dayQuizAnsweredCount = dayQuizQuestions.filter((q) => Boolean(dailyQuizAnswers[q.id])).length;

  const handleToggleItem = (itemId) => {
    const willBeDone = !dailyChecklist[itemId];
    if (willBeDone) {
      playSuccess(isMuted);
    } else {
      playTap(isMuted);
    }
    onToggleChecklistItem(itemId);
  };

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

  const handleDailyQuizClick = (questionId, opt) => {
    cancelHoverSpeech();
    stopQuizSpeech();
    unlockAudio();
    if (opt.isCorrect) {
      playSuccess(isMuted);
      confetti({ particleCount: 45, spread: 65, origin: { y: 0.65 } });
    } else {
      playWobble(isMuted);
    }
    if (!isMuted) {
      setTimeout(() => speakEnglish(opt.textEn, undefined, { rate: isSlowMode ? 0.8 : 1.0 }), 280);
    }
    if (!dailyQuizAnswers[questionId]) {
      const nextCount = todayGoalCount + 1;
      setTodayGoalCount(nextCount);
      try {
        const todayKey = new Date().toISOString().slice(0, 10);
        localStorage.setItem('lego_daily_micro_goal_v1', JSON.stringify({ date: todayKey, count: nextCount }));
      } catch {
        // ignore
      }
      if (nextCount === 10) {
        confetti({ particleCount: 90, spread: 90, origin: { y: 0.5 } });
      }
    }
    if (onSaveDailyQuizAnswer) {
      onSaveDailyQuizAnswer(questionId, opt.id);
    }
  };

  const handleResetDayQuiz = () => {
    playTap(isMuted);
    stopQuizSpeech();
    setActiveQuestionIdx(0);
    if (onResetDailyQuizQuestions) {
      onResetDailyQuizQuestions(dayQuizQuestions.map((q) => q.id));
    }
  };

  return (
    <div className="w-full max-w-none px-3 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-5 flex-1">
      {/* Clean Day Selector & Print Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-md border-2 border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-2xl font-display font-black text-slate-900">
              🗺️ 14 Bölümlük Öğrenme Yolculuğu
            </h1>
            <p className="text-xs text-slate-500 font-semibold">
              Her gün acele etmeden 10–15 dakika ilerle, istediğin zaman kağıt test yazdır!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playTap(isMuted);
                if (onOpenPrintable) {
                  onOpenPrintable({ mode: 'day', dayId: activeDay.id });
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-display font-black text-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-yellow-300" />
              <span>{activeDay.shortLabel} Testini Yazdır (10 Soru)</span>
            </button>

            {onOpenDiscoveryGame && (
              <button
                type="button"
                onClick={() => {
                  playTap(isMuted);
                  onOpenDiscoveryGame();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-black text-xs cursor-pointer"
              >
                <Star className="w-3.5 h-3.5" />
                <span>50 Soruluk Seviye Testi</span>
              </button>
            )}
          </div>
        </div>

        {/* Daily Micro-Goal Bar */}
        <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200 rounded-2xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{todayGoalCount >= 10 ? '🏆' : '🎯'}</span>
            <span className="text-xs sm:text-sm font-display font-black text-slate-800">
              {todayGoalCount >= 10
                ? 'Bugünkü Mikro-Hedef Tamamlandı! Harikasın!'
                : `Bugünkü Hedef: ${Math.min(todayGoalCount, 10)} / 10 Soru`}
            </span>
          </div>
          <div className="flex-1 min-w-[140px] max-w-xs h-2.5 bg-white rounded-full overflow-hidden border border-amber-200">
            <div
              className={`h-full transition-all duration-500 ${
                todayGoalCount >= 10 ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.min(100, (todayGoalCount / 10) * 100)}%` }}
            />
          </div>
        </div>

        {/* Weekly Progress Tracker */}
        {(() => {
          const allDayStats = DAILY_EXPEDITION_DAYS.map((day) => {
            const ws = getWorksheetQuestions({ mode: 'day', dayId: day.id });
            const qs = ws.questions || [];
            const done = qs.filter((q) => Boolean(dailyQuizAnswers[q.id])).length;
            return { id: day.id, shortLabel: day.shortLabel, done, total: qs.length || 10 };
          });
          const weeklyDone = allDayStats.reduce((sum, s) => sum + s.done, 0);
          const weeklyTotal = allDayStats.reduce((sum, s) => sum + s.total, 0) || 70;
          const weeklyPct = Math.round((weeklyDone / weeklyTotal) * 100);
          const firstIncomplete = allDayStats.find((s) => s.done < s.total);
          return (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-black text-slate-700">
                  <span>📊 Haftalık Test İlerlemesi: {weeklyDone} / {weeklyTotal} Soru</span>
                  <span className="text-emerald-700">%{weeklyPct}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${weeklyPct}%` }}
                  />
                </div>
              </div>
              {firstIncomplete && firstIncomplete.id !== activeDay.id && (
                <button
                  type="button"
                  onClick={() => setDayId(firstIncomplete.id)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-xs whitespace-nowrap cursor-pointer shadow-sm"
                >
                  🎯 Kaldığın Güne Git ({firstIncomplete.shortLabel})
                </button>
              )}
            </div>
          );
        })()}

        {/* Gün 1 - Gün 7 Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
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
                className={`px-3.5 py-2 rounded-2xl border-2 font-display font-black text-xs sm:text-sm whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-800 shadow-sm'
                    : isComplete
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300'
                }`}
              >
                <span>{day.shortLabel}</span>
                {dayQuizDone > 0 && (
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    ⭐{dayQuizDone}/{dayQuizTotal}
                  </span>
                )}
                {isComplete && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Topic + 4 Key Words */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-md border-2 border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-black text-xs">
                {activeDay.shortLabel} • {activeDay.badge}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                🎯 {activeDay.grammarFocus}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-black text-slate-900">
              {activeDay.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">{activeDay.desc}</p>
          </div>

          {onOpenStory && (
            <button
              type="button"
              onClick={() => {
                playTap(isMuted);
                onOpenStory();
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-display font-black text-xs sm:text-sm shadow-sm flex-shrink-0 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>📖 Sesli Hikayeyi Aç (Story)</span>
            </button>
          )}
        </div>

        {/* 4 Key Words */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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
              className="bg-slate-50 hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-400 rounded-2xl p-4 sm:p-5 text-left transition cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl sm:text-4xl leading-none">{v.emoji}</span>
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="font-display font-black text-base sm:text-xl text-slate-900">{v.en}</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
                🇹🇷 {v.tr} • 🇩🇪 {v.de}
              </div>
            </button>
          ))}
        </div>

        {/* 2 Short Home Games + TV Recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(activeDay.items || []).map((item) => {
            const isChecked = Boolean(dailyChecklist[item.id]);
            return (
              <div
                key={item.id}
                className={`rounded-2xl p-3.5 border-2 transition space-y-2 ${
                  isChecked ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleToggleItem(item.id)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-600 border-emerald-700 text-white'
                        : 'bg-white border-slate-400'
                    }`}
                    aria-label={item.title}
                  >
                    {isChecked && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-900 text-white font-black text-[10px]">
                      {item.time}
                    </span>
                    <h3 className="font-display font-black text-sm text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-700 leading-relaxed">{item.desc}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(item.phrasesEn || []).map((phrase) => (
                        <button
                          key={phrase}
                          type="button"
                          onPointerEnter={(e) =>
                            triggerHoverSpeech(phrase, { isMuted, pointerType: e.pointerType })
                          }
                          onPointerLeave={cancelHoverSpeech}
                          onClick={() => {
                            cancelHoverSpeech();
                            unlockAudio();
                            speakEnglish(phrase);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-blue-200 text-blue-800 font-bold text-[11px] hover:bg-blue-600 hover:text-white transition cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{phrase}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compact TV Suggestion */}
        {activeDay.tvRecommendation && (
          <div className="bg-slate-900 text-white rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Tv className="w-5 h-5 text-yellow-300 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-black text-yellow-300">📺 TV Önerisi ({activeDay.tvRecommendation.duration}): </span>
                <span className="font-bold">{activeDay.tvRecommendation.title}</span>
                <span className="text-slate-300"> — {activeDay.tvRecommendation.topicTr}</span>
              </div>
            </div>
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                activeDay.tvRecommendation.searchQuery
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex-shrink-0"
            >
              <span>YouTube’da Aç</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Animated Sing-Along & Mini Lesson Before Quiz */}
      <DailySingLearn key={activeDay.id} dayId={activeDay.id} isMuted={isMuted} />

      {/* Daily Interactive Step-by-Step + Printable Quiz */}
      <div id="daily-step-quiz" className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border-2 border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-display font-black text-slate-900">
              🎯 {activeDay.shortLabel}: Sesli Adım Adım Test
            </h2>
            <p className="text-xs text-slate-500 font-semibold">
              Skor: <strong>{dayQuizScore} / {dayQuizQuestions.length}</strong> ({dayQuizAnsweredCount}/{dayQuizQuestions.length} tamamlandı) •{' '}
              <span className="text-amber-600 font-black">⭐ +{dayQuizAnsweredCount} Yıldız Kaydedildi</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playTap(isMuted);
                setIsSlowMode((prev) => !prev);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-display font-black text-xs border-2 transition cursor-pointer ${
                isSlowMode
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="Uzun cümleleri %80 hızda daha yavaş ve net oku"
            >
              <span>🐢 {isSlowMode ? 'Yavaş Mod Açık' : 'Yavaş Mod'}</span>
            </button>
            {dayQuizQuestions[activeQuestionIdx] && (
              <button
                type="button"
                onClick={() => playQuestionAndOptions(dayQuizQuestions[activeQuestionIdx])}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-xs shadow-sm cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Soruyu & Şıkları Sesli Dinle</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleResetDayQuiz}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Temizle</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playTap(isMuted);
                if (onOpenPrintable) {
                  onOpenPrintable({ mode: 'day', dayId: activeDay.id });
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-display font-black text-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-yellow-300" />
              <span>Kağıt Test (A4)</span>
            </button>
          </div>
        </div>

        {/* 1..10 Interactive Step Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pb-1">
          <span className="text-xs font-bold text-slate-400 mr-1">Sorular:</span>
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

        {/* Single Focused Question Card */}
        {(() => {
          const safeIdx = Math.min(activeQuestionIdx, Math.max(0, dayQuizQuestions.length - 1));
          const q = dayQuizQuestions[safeIdx];
          if (!q) return null;
          const chosenId = dailyQuizAnswers[q.id];
          const isPromptSpeaking = speakingTarget === 'prompt';
          const hasNext = safeIdx < dayQuizQuestions.length - 1;
          const hasPrev = safeIdx > 0;

          return (
            <div className="rounded-3xl p-5 sm:p-7 border-4 border-blue-200 bg-gradient-to-br from-slate-50 to-blue-50/40 space-y-5 shadow-inner">
              <div className="flex items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-display font-black text-xs">
                  Soru {safeIdx + 1} / {dayQuizQuestions.length}
                </span>
                <button
                  type="button"
                  onClick={() => playQuestionAndOptions(q)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-blue-300 text-blue-700 font-display font-black text-xs hover:bg-blue-50 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Tekrar Dinle</span>
                </button>
              </div>

              <div
                onPointerEnter={(e) =>
                  triggerHoverSpeech(q.promptEn, { isMuted, pointerType: e.pointerType })
                }
                onPointerLeave={cancelHoverSpeech}
                className={`rounded-2xl p-4 bg-white border-2 transition flex items-center gap-4 ${
                  isPromptSpeaking
                    ? 'border-yellow-400 ring-4 ring-yellow-300/50 shadow-md'
                    : 'border-slate-200'
                }`}
              >
                <span className="text-4xl sm:text-5xl flex-shrink-0">{q.characterEmoji}</span>
                <div className="text-lg sm:text-2xl font-display font-black text-slate-900 leading-snug flex-1">
                  {q.promptEn}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {q.options.map((opt, optIdx) => {
                  const letter = ['A', 'B', 'C'][optIdx];
                  const isChosen = chosenId === opt.id;
                  const isOptSpeaking = speakingTarget === optIdx;
                  let cls =
                    'bg-white border-slate-200 hover:border-blue-400 text-slate-800 hover:-translate-y-0.5';
                  if (chosenId) {
                    if (opt.isCorrect) {
                      cls = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-black shadow-md';
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
                      className={`w-full text-left px-4 py-4 rounded-2xl border-2 text-base sm:text-lg font-display font-bold flex items-center justify-between gap-2 transition cursor-pointer shadow-sm ${cls} ${
                        isOptSpeaking ? 'ring-4 ring-yellow-400 border-yellow-500 scale-[1.02]' : ''
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center flex-shrink-0">
                          {letter}
                        </span>
                        <span className="text-2xl">{opt.emoji}</span>
                        <span>{opt.textEn}</span>
                      </span>
                      {chosenId && opt.isCorrect && <span className="text-xl">✅</span>}
                      {chosenId && isChosen && !opt.isCorrect && <span className="text-xl">❌</span>}
                    </button>
                  );
                })}
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between gap-3 pt-2">
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
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-display font-black text-sm shadow-md border-2 border-yellow-500 cursor-pointer transition active:scale-95"
                  >
                    <span>Sonraki Soru</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-900 font-display font-black text-sm border border-emerald-300">
                    🏁 Test Sonu: {dayQuizScore} / {dayQuizQuestions.length} Doğru!
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
