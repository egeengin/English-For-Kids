import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Trophy,
  RotateCcw,
  ChevronRight,
  Flame,
  CheckCircle2,
  Sparkles,
  Target,
} from 'lucide-react';
import { DISCOVERY_STAGES } from '../data/dailyMissionsData';
import {
  speakEnglish,
  stopSpeech,
  prefetchSpeech,
  unlockAudio,
  triggerHoverSpeech,
  cancelHoverSpeech,
} from '../utils/speech';
import { playTap, playSuccess, playFanfare, playWobble } from '../utils/soundEffects';

export default function LevelDiscoveryGame({
  discoveryResults = {},
  onSaveDiscoveryResult,
  onClearDiscoveryQuestions,
  onResetDiscovery,
  onOpenPrintable: _onOpenPrintable,
  onSwitchToDay,
  isMuted = false,
  childName = 'Deniz',
}) {
  const findResumePosition = () => {
    for (let sIdx = 0; sIdx < DISCOVERY_STAGES.length; sIdx += 1) {
      const qs = DISCOVERY_STAGES[sIdx].questions;
      const qIdx = qs.findIndex((q) => !discoveryResults[q.id]);
      if (qIdx !== -1) return { sIdx, qIdx };
    }
    return { sIdx: 0, qIdx: 0 };
  };

  const [activeStageIdx, setActiveStageIdx] = useState(() => findResumePosition().sIdx);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(() => findResumePosition().qIdx);
  const [showHelper, setShowHelper] = useState(false);
  const [viewMode, setViewMode] = useState('play'); // 'play' | 'stage-complete' | 'report'

  const currentStage = DISCOVERY_STAGES[activeStageIdx] || DISCOVERY_STAGES[0];
  const currentQuestion = currentStage.questions[activeQuestionIdx] || currentStage.questions[0];
  const nextQuestion = currentStage.questions[activeQuestionIdx + 1] || null;
  const savedAnswer = currentQuestion ? discoveryResults[currentQuestion.id] : null;
  const chosenOptionId = savedAnswer?.selectedOptionId || null;

  // Auto-speak English question prompt and pre-warm Gemini TTS cache for options & next question
  useEffect(() => {
    if (viewMode !== 'play' || isMuted || !currentQuestion?.promptEn) {
      return;
    }
    prefetchSpeech([
      ...(currentQuestion.options || []).map((o) => o.textEn),
      nextQuestion?.promptEn,
    ]);
    const timer = setTimeout(() => {
      speakEnglish(currentQuestion.promptEn);
    }, 240);
    return () => {
      clearTimeout(timer);
      stopSpeech();
    };
  }, [viewMode, activeStageIdx, activeQuestionIdx, currentQuestion, nextQuestion, isMuted]);

  const stageStats = DISCOVERY_STAGES.map((stage) => {
    const answered = stage.questions.filter((q) => Boolean(discoveryResults[q.id]));
    const correct = stage.questions.filter((q) => discoveryResults[q.id]?.isCorrect === true);
    const isCompleted = answered.length === stage.questions.length;
    return {
      id: stage.id,
      number: stage.number,
      answeredCount: answered.length,
      correctCount: correct.length,
      totalCount: stage.questions.length,
      isCompleted,
    };
  });

  const currentStageStat = stageStats[activeStageIdx] || stageStats[0];
  const earnedStarsCount = stageStats.filter((s) => s.isCompleted).length;
  const totalQuestionsCount = DISCOVERY_STAGES.reduce((acc, s) => acc + s.questions.length, 0);
  const totalAnsweredCount = Object.keys(discoveryResults).length;

  const allQuestionsFlat = DISCOVERY_STAGES.flatMap((stage) =>
    stage.questions.map((q) => ({
      ...q,
      stageNumber: stage.number,
    }))
  );
  const masteredList = allQuestionsFlat.filter((q) => discoveryResults[q.id]?.isCorrect === true);
  const learningList = allQuestionsFlat.filter((q) => discoveryResults[q.id]?.isCorrect === false);

  const triggerStageCelebration = (stageNumber) => {
    if (!isMuted) playFanfare(false);
    try {
      confetti({
        particleCount: stageNumber === 3 || stageNumber === 5 ? 110 : 65,
        spread: stageNumber === 3 || stageNumber === 5 ? 85 : 65,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore in headless environments
    }
  };

  const handleSelectStage = (idx) => {
    playTap(isMuted);
    setActiveStageIdx(idx);
    setActiveQuestionIdx(0);
    setShowHelper(false);
    setViewMode('play');
  };

  const handleOptionSelect = (opt) => {
    if (!currentQuestion) return;

    cancelHoverSpeech();
    unlockAudio();

    if (opt.isCorrect) {
      playSuccess(isMuted);
    } else {
      playWobble(isMuted);
    }

    if (!isMuted) {
      setTimeout(() => speakEnglish(opt.textEn), 380);
    }

    onSaveDiscoveryResult(currentQuestion.id, {
      status: opt.isCorrect ? 'mastered' : 'learning',
      isCorrect: Boolean(opt.isCorrect),
      skillTag: currentQuestion.skillTag,
      skillLabelTr: currentQuestion.skillLabelTr,
      stageNumber: currentStage.number,
      curriculumDayTarget: currentQuestion.curriculumDayTarget,
      selectedOptionId: opt.id,
      recordedAt: new Date().toISOString(),
    });
  };

  const handleNextStep = () => {
    playTap(isMuted);
    if (activeQuestionIdx < currentStage.questions.length - 1) {
      setActiveQuestionIdx((prev) => prev + 1);
      setShowHelper(false);
    } else {
      setViewMode('stage-complete');
      triggerStageCelebration(currentStage.number);
    }
  };

  const handleRetryWrongInStage = () => {
    playTap(isMuted);
    const wrongQuestions = currentStage.questions.filter(
      (q) => discoveryResults[q.id]?.isCorrect === false
    );
    if (wrongQuestions.length === 0) return;

    if (onClearDiscoveryQuestions) {
      onClearDiscoveryQuestions(wrongQuestions.map((q) => q.id));
    }
    const firstWrongIdx = currentStage.questions.findIndex((q) => q.id === wrongQuestions[0].id);
    setActiveQuestionIdx(firstWrongIdx >= 0 ? firstWrongIdx : 0);
    setShowHelper(false);
    setViewMode('play');
  };

  const handleContinueNextStage = () => {
    playTap(isMuted);
    if (activeStageIdx < DISCOVERY_STAGES.length - 1) {
      setActiveStageIdx((prev) => prev + 1);
      setActiveQuestionIdx(0);
      setShowHelper(false);
      setViewMode('play');
    } else {
      setViewMode('report');
    }
  };

  const handleResetAll = () => {
    playTap(isMuted);
    onResetDiscovery();
    setActiveStageIdx(0);
    setActiveQuestionIdx(0);
    setShowHelper(false);
    setViewMode('play');
  };

  return (
    <div className="w-full max-w-none px-3 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-5 flex-1 flex flex-col">
      {/* Compact Light Top Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-md border-2 border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">⭐</span>
            <div>
              <h1 className="text-lg sm:text-2xl font-display font-black text-slate-900 leading-tight">
                5 Bölümlü Seviye Testi ({earnedStarsCount}/5 Yıldız)
              </h1>
              <p className="text-xs text-slate-500 font-semibold">
                Her bölümde 10 soru • 3 Bölüm = Şampiyon! • 4–5 = Zor Boss
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-black text-xs sm:text-sm">
              Doğru: {currentStageStat.correctCount} / 10
            </span>

            <button
              type="button"
              onClick={() => {
                playTap(isMuted);
                setViewMode(viewMode === 'report' ? 'play' : 'report');
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-display font-black text-xs sm:text-sm cursor-pointer transition"
            >
              {viewMode === 'report'
                ? '🎮 Teste Dön'
                : `📊 Sonuç Karnesi (${totalAnsweredCount}/${totalQuestionsCount})`}
            </button>
          </div>
        </div>

        {/* 5 Clean Stage Buttons */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {DISCOVERY_STAGES.map((stage, idx) => {
            const stat = stageStats[idx];
            const isActive = viewMode !== 'report' && activeStageIdx === idx;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => handleSelectStage(idx)}
                className={`rounded-2xl px-3 py-3 border-2 text-left transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-800 shadow-sm'
                    : stat.isCompleted
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-display font-black text-sm sm:text-base">
                    Bölüm {stage.number}
                  </span>
                  <span className="text-xs">
                    {stat.isCompleted ? '⭐' : stage.number >= 4 ? '👑' : ''}
                  </span>
                </div>
                <div className={`text-xs sm:text-sm font-bold ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                  {stat.answeredCount}/10 soru
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODE 1: ACTIVE QUESTION */}
      {viewMode === 'play' && (
        <div className="bg-white rounded-3xl p-4 sm:p-7 lg:p-8 shadow-md border-2 border-slate-200 space-y-6 flex-1 flex flex-col justify-between">
          {/* Question Number Pills (1..10) + Next Button */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-1.5">
              {currentStage.questions.map((q, qIdx) => {
                const res = discoveryResults[q.id];
                const isCurr = qIdx === activeQuestionIdx;
                let pillStyle = 'bg-slate-100 text-slate-600 border-slate-200';
                if (isCurr) {
                  pillStyle = 'bg-blue-600 text-white border-blue-800 scale-105';
                } else if (res?.isCorrect === true) {
                  pillStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                } else if (res?.isCorrect === false) {
                  pillStyle = 'bg-rose-100 text-rose-800 border-rose-300';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      playTap(isMuted);
                      setActiveQuestionIdx(qIdx);
                      setShowHelper(false);
                    }}
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl font-black text-sm sm:text-base border-2 transition cursor-pointer ${pillStyle}`}
                  >
                    {qIdx + 1}
                  </button>
                );
              })}
            </div>

            <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-black ${currentStage.difficultyColor}`}>
              {currentStage.difficultyLabel}
            </span>
          </div>

          {/* Question Prompt */}
          <div
            onPointerEnter={(e) =>
              triggerHoverSpeech(currentQuestion.promptEn, { isMuted, pointerType: e.pointerType })
            }
            onPointerLeave={cancelHoverSpeech}
            className="bg-slate-50 hover:bg-blue-50/40 rounded-2xl p-4 sm:p-6 border-2 border-slate-200 hover:border-blue-300 transition space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0">
                  {currentQuestion.characterEmoji}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black text-slate-400 uppercase">
                    Soru {activeQuestionIdx + 1} / 10 • {currentQuestion.skillLabelTr}
                  </div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-display font-black text-slate-900 leading-snug mt-0.5">
                    “{currentQuestion.promptEn}”
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    speakEnglish(currentQuestion.promptEn);
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-sm sm:text-base shadow-sm cursor-pointer"
                >
                  <Volume2 className="w-5 h-5" />
                  <span>🔊 Dinle</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3 Self-Graded Visual Answer Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {currentQuestion.options.map((opt, optIdx) => {
              const letter = ['A', 'B', 'C'][optIdx] || '';
              const isChosen = chosenOptionId === opt.id;
              const isAnswered = Boolean(chosenOptionId);

              let cardStyle = 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40';
              if (isAnswered) {
                if (opt.isCorrect) {
                  cardStyle = 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200';
                } else if (isChosen && !opt.isCorrect) {
                  cardStyle = 'border-rose-400 bg-rose-50 ring-2 ring-rose-200';
                } else {
                  cardStyle = 'border-slate-200 bg-slate-50 opacity-70';
                }
              }

              return (
                <div
                  key={opt.id}
                  onPointerEnter={(e) =>
                    triggerHoverSpeech(opt.textEn, { isMuted, pointerType: e.pointerType })
                  }
                  onPointerLeave={cancelHoverSpeech}
                  onClick={() => handleOptionSelect(opt)}
                  className={`rounded-3xl p-5 sm:p-7 border-4 transition cursor-pointer flex flex-col justify-between gap-4 min-h-[150px] sm:min-h-[220px] ${cardStyle}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 text-white font-display font-black text-sm sm:text-base flex items-center justify-center">
                        {letter}
                      </span>
                      <span className="text-4xl sm:text-6xl leading-none">{opt.emoji}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakEnglish(opt.textEn);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-slate-300 hover:border-blue-500 text-blue-700 font-black text-xs sm:text-sm shadow-sm cursor-pointer"
                      title="Şıkkı Dinle"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Dinle</span>
                    </button>
                  </div>

                  <div>
                    <p className="font-display font-black text-lg sm:text-2xl lg:text-3xl text-slate-900 leading-snug">
                      {opt.textEn}
                    </p>
                    {showHelper && (
                      <p className="text-xs font-semibold text-slate-500 mt-1">{opt.labelTr}</p>
                    )}
                  </div>

                  {isAnswered && (opt.isCorrect || isChosen) && (
                    <div
                      className={`text-xs font-black px-2.5 py-1 rounded-xl inline-flex items-center gap-1 self-start ${
                        opt.isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {opt.isCorrect
                        ? isChosen
                          ? '✅ Harika! Doğru Cevap!'
                          : '✅ Doğrusu Bu!'
                        : '❌ Yanlış Şık'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Direct Next Question Footer */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold text-slate-500">
              {chosenOptionId
                ? savedAnswer?.isCorrect
                  ? 'Harika gidiyorsun! Sonraki soruya geçebilirsin.'
                  : 'Yeşil kutudaki doğru cevabı dinleyip sonraki soruya geçebilirsin.'
                : 'Bir şıkka tıkla! Bilmiyorsan tahmin edebilirsin.'}
            </span>

            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-yellow-300 font-display font-black text-base sm:text-lg shadow-md transition active:scale-95 cursor-pointer"
            >
              <span>
                {activeQuestionIdx < currentStage.questions.length - 1
                  ? 'Sonraki Soru'
                  : 'Bölümü Tamamla 🏆'}
              </span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: STAGE COMPLETE */}
      {viewMode === 'stage-complete' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border-4 border-amber-400 text-center space-y-5">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-100 border-4 border-amber-400 text-5xl">
            {currentStage.number === 3 ? '🏆' : currentStage.badgeEmoji}
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
              Skor: {currentStageStat.correctCount} / 10 Doğru! • +1 Yıldız ⭐
            </div>

            {currentStage.number === 3 ? (
              <>
                <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900">
                  Tebrikler Şampiyon {childName}! ⭐⭐⭐
                </h2>
                <p className="text-sm sm:text-base text-slate-700 font-semibold leading-relaxed">
                  3 Yıldızla Şampiyonluk hedefini tamamladın! Ama{' '}
                  <strong className="text-purple-700">Bölüm 4 (Checker Tobi Bilim)</strong> ve{' '}
                  <strong className="text-rose-600">Bölüm 5 (Efsanevi Boss)</strong> aşırı zor. Onları
                  da denemek ister misin?
                </p>
              </>
            ) : currentStage.number === 5 ? (
              <>
                <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900">
                  Efsanevi Final Tamamlandı! ⭐⭐⭐⭐⭐
                </h2>
                <p className="text-sm text-slate-600 font-semibold">
                  50 soruluk tüm macerayı bitirdin! Şimdi sonuç karnenden neleri öğreneceğimize bakabilirsin.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900">
                  {currentStage.titleTr} Bitti! ⭐
                </h2>
                <p className="text-sm text-slate-600 font-semibold">
                  Harika iş çıkardın {childName}! Bir sonraki bölüme geçmeye hazır mısın?
                </p>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {activeStageIdx < DISCOVERY_STAGES.length - 1 && (
              <button
                type="button"
                onClick={handleContinueNextStage}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-sm shadow-md cursor-pointer"
              >
                <Flame className="w-4 h-4" />
                <span>
                  {currentStage.number === 3
                    ? '🔥 Bölüm 4’e Meydan Oku! (Zor)'
                    : `Bölüm ${currentStage.number + 1}’e Geç`}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {currentStageStat.correctCount < 10 &&
              currentStage.questions.some((q) => discoveryResults[q.id]?.isCorrect === false) && (
                <button
                  type="button"
                  onClick={handleRetryWrongInStage}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-black text-sm shadow-md cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Yanlışları Tekrar Çöz</span>
                </button>
              )}

            <button
              type="button"
              onClick={() => {
                playTap(isMuted);
                setViewMode('report');
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-display font-black text-sm shadow-md cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>Sonuç Karnesi</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: DIAGNOSTIC REPORT */}
      {viewMode === 'report' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-md border-2 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900">
                📊 {childName}’in Seviye Karnesi ({masteredList.length} Doğru / {totalAnsweredCount} Çözülen)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
                Yanlış yapılan konular sıradaki günlük ders hedeflerimiz olarak listelendi.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleResetAll}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Testi Sıfırla</span>
              </button>
            </div>
          </div>

          {/* Stage-by-stage score cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {DISCOVERY_STAGES.map((stage, idx) => {
              const st = stageStats[idx];
              return (
                <div
                  key={stage.id}
                  className="bg-white rounded-2xl p-3 border-2 border-slate-200 text-center space-y-1"
                >
                  <div className="text-2xl">{stage.badgeEmoji}</div>
                  <div className="font-display font-black text-sm text-slate-900">
                    Bölüm {stage.number}
                  </div>
                  <div className="text-xs font-black text-emerald-700">
                    {st.correctCount} / 10 Doğru
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold">
                    {st.isCompleted ? '⭐ Tamamlandı' : `${st.answeredCount}/10 çözüldü`}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mastered */}
            <div className="bg-white rounded-3xl p-4 border-2 border-emerald-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-display font-black text-base text-slate-900">
                  ✅ Bildiği Konular ({masteredList.length})
                </h3>
              </div>
              {masteredList.length === 0 ? (
                <p className="text-xs text-slate-400 font-semibold">Henüz doğru işaretlenen soru yok.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {masteredList.map((item) => (
                    <span
                      key={item.id}
                      className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900"
                    >
                      ✓ B{item.stageNumber}: {item.skillLabelTr}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Next Learning Targets */}
            <div className="bg-white rounded-3xl p-4 border-2 border-amber-300">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-amber-600" />
                <h3 className="font-display font-black text-base text-slate-900">
                  🎯 Öğreneceğimiz Süper Güçler ({learningList.length})
                </h3>
              </div>
              {learningList.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Yanlış yaptığı sorular burada günlük hedefler olarak toplanır.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {learningList.map((item) => (
                    <div
                      key={item.id}
                      className="bg-amber-50 rounded-xl px-3 py-2 border border-amber-200 flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="font-bold text-slate-800">
                        🔥 B{item.stageNumber}: {item.skillLabelTr}
                      </span>
                      {onSwitchToDay && (
                        <button
                          type="button"
                          onClick={() => {
                            playTap(isMuted);
                            onSwitchToDay(item.curriculumDayTarget);
                          }}
                          className="font-black text-blue-700 hover:underline cursor-pointer flex-shrink-0"
                        >
                          {item.curriculumDayTarget.replace('day-', 'Gün ')}’e Git →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
