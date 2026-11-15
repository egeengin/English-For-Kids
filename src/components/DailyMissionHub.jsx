import React, { useState } from 'react';
import {
  Volume2,
  Printer,
  CheckCircle2,
  Tv,
  ExternalLink,
  BookOpen,
  Star,
  RotateCcw,
} from 'lucide-react';
import {
  DAILY_EXPEDITION_DAYS,
  getWorksheetQuestions,
} from '../data/dailyMissionsData';
import { speakEnglish } from '../utils/speech';
import { playTap, playSuccess, playWobble } from '../utils/soundEffects';

export default function DailyMissionHub({
  dailyChecklist = {},
  onToggleChecklistItem,
  onOpenDiscoveryGame,
  onOpenStory,
  onOpenPrintable,
  selectedDayId,
  onSelectDayId,
  isMuted = false,
}) {
  const [internalDayId, setInternalDayId] = useState('day-1');
  const [dailyQuizAnswers, setDailyQuizAnswers] = useState({});
  const currentDayId =
    selectedDayId && DAILY_EXPEDITION_DAYS.some((d) => d.id === selectedDayId)
      ? selectedDayId
      : internalDayId;

  const setDayId = (dayId) => {
    playTap(isMuted);
    if (onSelectDayId) {
      onSelectDayId(dayId);
    } else {
      setInternalDayId(dayId);
    }
  };

  const activeDay =
    DAILY_EXPEDITION_DAYS.find((d) => d.id === currentDayId) || DAILY_EXPEDITION_DAYS[0];

  const dayWorksheet = getWorksheetQuestions({ mode: 'day', dayId: activeDay.id });
  const dayQuizQuestions = dayWorksheet.questions || [];
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

  const handleDailyQuizClick = (questionId, opt) => {
    if (opt.isCorrect) {
      playSuccess(isMuted);
    } else {
      playWobble(isMuted);
    }
    if (!isMuted) {
      setTimeout(() => speakEnglish(opt.textEn), 120);
    }
    setDailyQuizAnswers((prev) => ({
      ...prev,
      [questionId]: opt.id,
    }));
  };

  const handleResetDayQuiz = () => {
    playTap(isMuted);
    setDailyQuizAnswers((prev) => {
      const next = { ...prev };
      dayQuizQuestions.forEach((q) => {
        delete next[q.id];
      });
      return next;
    });
  };

  return (
    <div className="w-full max-w-4xl px-3 sm:px-4 py-4 space-y-4">
      {/* Clean Day Selector & Print Bar */}
      <div className="bg-white rounded-3xl p-4 shadow-md border-2 border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-base sm:text-lg font-display font-black text-slate-900">
              📅 Günlük Plan &amp; Basılabilir 10 Soruluk Testler
            </h1>
            <p className="text-xs text-slate-500 font-semibold">
              Günü seç, evdeki kısa oyunu oyna ve 10 soruluk siyah-beyaz kağıt testi yazdır.
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

        {/* Gün 1 - Gün 7 Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {DAILY_EXPEDITION_DAYS.map((day) => {
            const isSelected = day.id === activeDay.id;
            const doneCount = (day.items || []).filter((i) => Boolean(dailyChecklist[i.id])).length;
            const totalCount = day.items?.length || 0;
            const isComplete = totalCount > 0 && doneCount === totalCount;

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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(activeDay.vocabFocus || []).map((v) => (
            <button
              key={v.en}
              type="button"
              onClick={() => {
                playTap(isMuted);
                speakEnglish(v.en);
              }}
              className="bg-slate-50 hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-400 rounded-2xl p-2.5 text-left transition cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg">{v.emoji}</span>
                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="font-display font-black text-xs sm:text-sm text-slate-900">{v.en}</div>
              <div className="text-[11px] font-semibold text-slate-500">
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
                          onClick={() => {
                            playTap(isMuted);
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

      {/* Daily 10-Question Interactive + Printable Quiz */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-md border-2 border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-display font-black text-slate-900">
              📝 {activeDay.shortLabel}: 10 Soruluk Hızlı Test (Ekranda Çöz veya Kağıda Yazdır)
            </h2>
            <p className="text-xs text-slate-500 font-semibold">
              Skor: <strong>{dayQuizScore} / 10</strong> ({dayQuizAnsweredCount}/10 işaretlendi)
            </p>
          </div>

          <div className="flex items-center gap-2">
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
              <span>Kağıt Test Olarak Yazdır (A4)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dayQuizQuestions.map((q, qIdx) => {
            const chosenId = dailyQuizAnswers[q.id];
            return (
              <div
                key={q.id}
                className="rounded-2xl p-3.5 border-2 border-slate-200 bg-slate-50 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs sm:text-sm font-display font-black text-slate-900 leading-snug">
                    <span className="text-blue-700 mr-1">{qIdx + 1}.</span>
                    <span>{q.characterEmoji} {q.promptEn}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playTap(isMuted);
                      speakEnglish(q.promptEn);
                    }}
                    className="p-1.5 rounded-lg bg-white border border-slate-300 text-blue-700 flex-shrink-0 cursor-pointer"
                    title="Dinle"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {q.options.map((opt, optIdx) => {
                    const letter = ['A', 'B', 'C'][optIdx];
                    const isChosen = chosenId === opt.id;
                    let cls = 'bg-white border-slate-200 hover:border-blue-400 text-slate-800';
                    if (chosenId) {
                      if (opt.isCorrect) {
                        cls = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-black';
                      } else if (isChosen) {
                        cls = 'bg-rose-50 border-rose-400 text-rose-900';
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleDailyQuizClick(q.id, opt)}
                        className={`w-full text-left px-3 py-2 rounded-xl border-2 text-xs font-bold flex items-center justify-between gap-2 transition cursor-pointer ${cls}`}
                      >
                        <span>
                          <strong className="mr-1">{letter})</strong>
                          {opt.emoji} {opt.textEn}
                        </span>
                        {chosenId && opt.isCorrect && <span>✅</span>}
                        {chosenId && isChosen && !opt.isCorrect && <span>❌</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
