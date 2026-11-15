import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Star,
  Trophy,
  Sparkles,
  RotateCcw,
  ChevronRight,
  HelpCircle,
  Flame,
  Printer,
  Target,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { DISCOVERY_STAGES } from '../data/dailyMissionsData';
import { speakEnglish, stopSpeech } from '../utils/speech';
import { playTap, playSuccess, playSparkle, playFanfare, playWobble } from '../utils/soundEffects';

export default function LevelDiscoveryGame({
  discoveryResults = {},
  onSaveDiscoveryResult,
  onResetDiscovery,
  onOpenPrintable,
  onSwitchToDay,
  isMuted = false,
  childName = 'Deniz',
}) {
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [showHelper, setShowHelper] = useState(false);
  const [viewMode, setViewMode] = useState('play'); // 'play' | 'stage-complete' | 'report'

  const currentStage = DISCOVERY_STAGES[activeStageIdx] || DISCOVERY_STAGES[0];
  const currentQuestion = currentStage.questions[activeQuestionIdx] || currentStage.questions[0];

  // Auto-speak question prompt when entering a new question in play mode
  useEffect(() => {
    if (viewMode !== 'play' || isMuted || !currentQuestion?.promptEn) {
      return;
    }
    const timer = setTimeout(() => {
      speakEnglish(currentQuestion.promptEn);
    }, 280);
    return () => {
      clearTimeout(timer);
      stopSpeech();
    };
  }, [viewMode, activeStageIdx, activeQuestionIdx, currentQuestion?.promptEn, isMuted]);

  // Compute stage completion stars (1 giant star per stage when all 4 questions are evaluated)
  const stageStats = DISCOVERY_STAGES.map((stage) => {
    const answeredCount = stage.questions.filter((q) => Boolean(discoveryResults[q.id])).length;
    const isCompleted = answeredCount === stage.questions.length;
    return {
      id: stage.id,
      number: stage.number,
      answeredCount,
      totalCount: stage.questions.length,
      isCompleted,
    };
  });

  const earnedStarsCount = stageStats.filter((s) => s.isCompleted).length;
  const totalAnsweredCount = Object.keys(discoveryResults).length;
  const totalQuestionsCount = DISCOVERY_STAGES.reduce((acc, s) => acc + s.questions.length, 0);

  // Diagnostic grouping for Report view
  const allQuestionsFlat = DISCOVERY_STAGES.flatMap((stage) =>
    stage.questions.map((q) => ({
      ...q,
      stageNumber: stage.number,
      stageTitleTr: stage.titleTr,
    }))
  );

  const masteredList = allQuestionsFlat.filter((q) => discoveryResults[q.id]?.status === 'mastered');
  const assistedList = allQuestionsFlat.filter((q) => discoveryResults[q.id]?.status === 'assisted');
  const learningList = allQuestionsFlat.filter((q) => discoveryResults[q.id]?.status === 'learning');
  const superpowerQueue = [...learningList, ...assistedList];

  const handleSelectStage = (idx) => {
    playTap(isMuted);
    setActiveStageIdx(idx);
    setActiveQuestionIdx(0);
    setSelectedOptionId(null);
    setShowHelper(false);
    setViewMode('play');
  };

  const handleOptionClick = (opt) => {
    setSelectedOptionId(opt.id);
    if (!isMuted) {
      if (opt.isCorrect) {
        playSparkle(false);
      } else {
        playWobble(false);
      }
      speakEnglish(opt.textEn);
    }
  };

  const triggerStageCelebration = (stageNumber) => {
    if (!isMuted) playFanfare(false);
    try {
      confetti({
        particleCount: stageNumber === 3 || stageNumber === 5 ? 110 : 65,
        spread: stageNumber === 3 || stageNumber === 5 ? 85 : 65,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore confetti issues in headless environments
    }
  };

  const handleDadGrade = (status) => {
    if (!currentQuestion) return;

    if (status === 'mastered') {
      playSuccess(isMuted);
    } else {
      playSparkle(isMuted);
    }

    onSaveDiscoveryResult(currentQuestion.id, {
      status,
      skillTag: currentQuestion.skillTag,
      skillLabelTr: currentQuestion.skillLabelTr,
      stageNumber: currentStage.number,
      curriculumDayTarget: currentQuestion.curriculumDayTarget,
      selectedOptionId: selectedOptionId || null,
      recordedAt: new Date().toISOString(),
    });

    const isLastQuestionInStage = activeQuestionIdx >= currentStage.questions.length - 1;
    if (!isLastQuestionInStage) {
      setActiveQuestionIdx((prev) => prev + 1);
      setSelectedOptionId(null);
      setShowHelper(false);
    } else {
      setViewMode('stage-complete');
      triggerStageCelebration(currentStage.number);
    }
  };

  const handleContinueNextStage = () => {
    playTap(isMuted);
    if (activeStageIdx < DISCOVERY_STAGES.length - 1) {
      const nextIdx = activeStageIdx + 1;
      setActiveStageIdx(nextIdx);
      setActiveQuestionIdx(0);
      setSelectedOptionId(null);
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
    setSelectedOptionId(null);
    setShowHelper(false);
    setViewMode('play');
  };

  return (
    <div className="w-full max-w-4xl px-3 sm:px-4 py-5 space-y-5">
      {/* Top 5-Stage Progress Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-6 shadow-xl border-4 border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider">
                Gün 0 • Seviye Keşfi
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-bold text-[11px]">
                🎯 3 Yıldız = Şampiyon!
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/50 text-rose-300 font-bold text-[11px]">
                🔥 Bölüm 4–5 = Efsanevi Boss
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-black text-white">
              {childName}’in 5 Bölümlü İngilizce Keşif Macerası ⭐
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Okuma bilmen gerekmez: 🔊 butonuna bas, dinle, seç veya babana sesli söyle!
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="flex items-center gap-1.5 bg-amber-500/20 border-2 border-amber-400 rounded-2xl px-3 py-1.5">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-display font-black text-base text-yellow-300">
                {earnedStarsCount} / 5
              </span>
            </div>

            <button
              onClick={() => {
                playTap(isMuted);
                setViewMode(viewMode === 'report' ? 'play' : 'report');
              }}
              className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-display font-black text-xs sm:text-sm shadow-md transition cursor-pointer"
            >
              {viewMode === 'report' ? '🎮 Oyuna Dön' : `📊 Seviye Raporu (${totalAnsweredCount}/${totalQuestionsCount})`}
            </button>
          </div>
        </div>

        {/* 5-Stage Selector Pills */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
          {DISCOVERY_STAGES.map((stage, idx) => {
            const stat = stageStats[idx];
            const isActive = viewMode !== 'report' && activeStageIdx === idx;
            return (
              <button
                key={stage.id}
                onClick={() => handleSelectStage(idx)}
                className={`relative rounded-2xl p-2 sm:p-2.5 text-left border-2 transition cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 border-yellow-400 shadow-lg scale-[1.02]'
                    : stat.isCompleted
                    ? 'bg-emerald-950/60 text-emerald-100 border-emerald-500/60 hover:bg-emerald-900/60'
                    : stage.isBossStage
                    ? 'bg-rose-950/40 text-rose-100 border-rose-500/40 hover:bg-rose-900/40'
                    : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-base sm:text-lg leading-none">{stage.badgeEmoji}</span>
                  <Star
                    className={`w-4 h-4 ${
                      stat.isCompleted
                        ? 'text-yellow-400 fill-yellow-400'
                        : isActive
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}
                  />
                </div>
                <div className="font-display font-black text-[11px] sm:text-xs leading-tight">
                  Bölüm {stage.number}
                </div>
                <div className="text-[10px] opacity-80 truncate">
                  {stage.number === 3
                    ? '🎯 Şampiyon'
                    : stage.isBossStage
                    ? '🔥 Boss'
                    : `${stat.answeredCount}/4`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODE 1: ACTIVE QUESTION VIEW */}
      {viewMode === 'play' && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border-4 border-slate-200 space-y-5">
          {/* Stage & Question Subheader */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-slate-100">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black ${currentStage.difficultyColor}`}>
                {currentStage.difficultyLabel}
              </span>
              <span className="font-display font-black text-sm sm:text-base text-slate-800">
                {currentStage.titleTr}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {currentStage.questions.map((q, qIdx) => {
                const done = Boolean(discoveryResults[q.id]);
                const isCurr = qIdx === activeQuestionIdx;
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      playTap(isMuted);
                      setActiveQuestionIdx(qIdx);
                      setSelectedOptionId(null);
                      setShowHelper(false);
                    }}
                    className={`w-8 h-8 rounded-xl font-black text-xs transition cursor-pointer border-2 ${
                      isCurr
                        ? 'bg-blue-600 text-white border-blue-800 scale-105'
                        : done
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {qIdx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Character Prompt Card */}
          <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-amber-50 rounded-3xl p-4 sm:p-5 border-2 border-indigo-200">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-indigo-300 shadow-sm flex items-center justify-center text-3xl flex-shrink-0">
                  {currentQuestion.characterEmoji}
                </div>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display font-black text-xs uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                      {currentQuestion.characterName}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Konu: {currentQuestion.skillLabelTr}
                    </span>
                  </div>
                  <p className="text-lg sm:text-xl font-display font-black text-slate-900 leading-snug">
                    “{currentQuestion.promptEn}”
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    playTap(isMuted);
                    speakEnglish(currentQuestion.promptEn);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-sm shadow-md transition active:scale-95 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Soruyu Dinle</span>
                </button>

                <button
                  onClick={() => {
                    playTap(isMuted);
                    setShowHelper((prev) => !prev);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span>{showHelper ? 'İpucunu Gizle' : '🇹🇷/🇩🇪 Baba İpucu'}</span>
                </button>
              </div>
            </div>

            {showHelper && (
              <div className="mt-4 pt-3 border-t border-indigo-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="bg-white/90 rounded-xl p-2.5 border border-indigo-100">
                  <span className="font-black text-slate-700">🇹🇷 Türkçe: </span>
                  <span className="text-slate-700">{currentQuestion.promptTrHelper}</span>
                </div>
                <div className="bg-white/90 rounded-xl p-2.5 border border-indigo-100">
                  <span className="font-black text-slate-700">🇩🇪 Deutsch: </span>
                  <span className="text-slate-700">{currentQuestion.promptDeHelper}</span>
                </div>
                <div className="sm:col-span-2 bg-amber-50 rounded-xl p-2.5 border border-amber-200 text-amber-950 font-semibold">
                  💡 <strong>Baba Taktik Notu:</strong> {currentQuestion.speakingTipTr}
                </div>
              </div>
            )}
          </div>

          {/* 3 Visual Answer Cards with Individual Audio Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const borderStyle = isSelected
                ? opt.isCorrect
                  ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-200'
                  : 'border-amber-500 bg-amber-50 ring-4 ring-amber-200'
                : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40';

              return (
                <div
                  key={opt.id}
                  onClick={() => handleOptionClick(opt)}
                  className={`rounded-2xl p-4 border-4 transition cursor-pointer flex flex-col justify-between gap-3 ${borderStyle}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-3xl sm:text-4xl leading-none">{opt.emoji}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTap(isMuted);
                        speakEnglish(opt.textEn);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border-2 border-slate-300 hover:border-blue-500 text-blue-700 font-black text-xs shadow-sm cursor-pointer"
                      title="İngilizce Dinle"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Dinle</span>
                    </button>
                  </div>

                  <div>
                    <p className="font-display font-black text-base text-slate-900 leading-snug">
                      {opt.textEn}
                    </p>
                    {showHelper && (
                      <p className="text-xs font-semibold text-slate-500 mt-1">{opt.labelTr}</p>
                    )}
                  </div>

                  {isSelected && (
                    <div
                      className={`text-xs font-black px-2.5 py-1 rounded-xl inline-flex items-center gap-1 self-start ${
                        opt.isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {opt.isCorrect ? '✨ Harika Seçim!' : '🤔 Hmm, tekrar dinleyelim mi?'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Co-op Dad Quick-Grade Bar */}
          <div className="bg-slate-900 text-white rounded-3xl p-4 border-2 border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <p className="font-display font-black text-sm text-yellow-300">
                  👨‍👦 Baba Değerlendirmesi: {childName} bu soruyu nasıl çözdü?
                </p>
                <p className="text-xs text-slate-300">
                  “Henüz Bilmiyor” desen bile sorun değil; yıldızına doğru ilerler, konuyu ise öğrenme listesine ekleriz!
                </p>
              </div>
              {discoveryResults[currentQuestion.id] && (
                <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-600 text-xs font-bold text-slate-200 self-start">
                  Kayıtlı: {discoveryResults[currentQuestion.id].status}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => handleDadGrade('mastered')}
                className="px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-black text-sm shadow-md transition active:scale-95 cursor-pointer"
              >
                🟢 Tek Başına Hemen Bildi!
              </button>

              <button
                onClick={() => handleDadGrade('assisted')}
                className="px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-black text-sm shadow-md transition active:scale-95 cursor-pointer"
              >
                🟡 Yardımla / İpucuyla Bildi
              </button>

              <button
                onClick={() => handleDadGrade('learning')}
                className="px-4 py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-display font-black text-sm shadow-md transition active:scale-95 cursor-pointer"
              >
                🔴 Henüz Bilmiyor (Öğreneceğiz!)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: STAGE COMPLETE OVERLAY */}
      {viewMode === 'stage-complete' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-400 text-center space-y-5">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-100 border-4 border-amber-400 text-5xl shadow-md">
            {currentStage.number === 3 ? '🏆' : currentStage.badgeEmoji}
          </div>

          {currentStage.number === 3 ? (
            <div className="space-y-3 max-w-2xl mx-auto">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs uppercase tracking-wider">
                🎯 3 YILDIZ ŞAMPİYONLUK HEDEFİ TAMAMLANDI!
              </span>
              <h2 className="text-2xl sm:text-4xl font-display font-black text-slate-900">
                Tebrikler Şampiyon {childName}! ⭐⭐⭐
              </h2>
              <p className="text-sm sm:text-base text-slate-700 font-semibold leading-relaxed">
                3 Yıldızla zaten tam bir Şampiyon oldun! Ama aşağıda iki gizli kapı daha var:
                <strong className="text-purple-700"> Bölüm 4 (Checker Tobi Bilim)</strong> ve{' '}
                <strong className="text-rose-600">Bölüm 5 (Efsanevi Pokemon Boss)</strong> aşırı zor!
                Denemeye cesaretin var mı, yoksa bunları günlük süper güç görevleriyle mi öğrenelim?
              </p>
            </div>
          ) : currentStage.number === 5 ? (
            <div className="space-y-3 max-w-2xl mx-auto">
              <span className="inline-block px-3 py-1 rounded-full bg-rose-600 text-white font-black text-xs uppercase tracking-wider">
                👑 BÜYÜK FİNAL TAMAMLANDI!
              </span>
              <h2 className="text-2xl sm:text-4xl font-display font-black text-slate-900">
                Efsanevi Cesaret, {childName}! ⭐⭐⭐⭐⭐
              </h2>
              <p className="text-sm sm:text-base text-slate-700 font-semibold leading-relaxed">
                En zor Efsanevi Boss sorularına kadar geldin! Şimdi neleri bildiğini ve önümüzdeki 7 günde hangi
                yeni süper güçleri açacağımızı görelim!
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-w-xl mx-auto">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase">
                +1 DEV YILDIZ & {currentStage.badgeTitle} KAZANILDI!
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900">
                {currentStage.titleTr} Tamamlandı! ⭐
              </h2>
              <p className="text-sm text-slate-600 font-semibold">
                Harika ilerliyorsun {childName}! Bir sonraki bölüm biraz daha heyecanlı olacak.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {activeStageIdx < DISCOVERY_STAGES.length - 1 && (
              <button
                onClick={handleContinueNextStage}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-display font-black text-base shadow-lg transition active:scale-95 cursor-pointer ${
                  currentStage.number === 3
                    ? 'bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Flame className="w-5 h-5" />
                <span>
                  {currentStage.number === 3
                    ? '🔥 Bölüm 4’e Meydan Oku! (Aşırı Zor)'
                    : `Bölüm ${currentStage.number + 1}’e Geç`}
                </span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => {
                playTap(isMuted);
                setViewMode('report');
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-yellow-300 font-display font-black text-base shadow-lg transition cursor-pointer"
            >
              <Trophy className="w-5 h-5" />
              <span>Seviye Raporunu & Öğreneceklerimizi Gör</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: DIAGNOSTIC REPORT & SUPERPOWER LIST */}
      {viewMode === 'report' && (
        <div className="space-y-5">
          {/* Summary Banner */}
          <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-emerald-600 text-white rounded-3xl p-5 sm:p-6 shadow-xl border-4 border-indigo-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-yellow-400 text-slate-950 font-black text-xs uppercase mb-2">
                  Teşhis & Öğrenme Haritası
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-black">
                  {childName}’in İngilizce Süper Güç Raporu ⭐ ({earnedStarsCount}/5 Yıldız)
                </h2>
                <p className="text-sm text-blue-100 font-medium mt-1">
                  Tamamlanan: {totalAnsweredCount} / {totalQuestionsCount} soru • 🟢 {masteredList.length} Biliyor • 🟡 {assistedList.length} Gelişiyor • 🔴 {learningList.length} Yeni Hedef
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    playTap(isMuted);
                    if (onOpenPrintable) onOpenPrintable();
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-slate-900 hover:bg-yellow-300 font-display font-black text-xs sm:text-sm shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Siyah-Beyaz Karne & Kart Yazdır</span>
                </button>
                <button
                  onClick={handleResetAll}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 text-white font-bold text-xs border border-white/20 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Testi Sıfırla</span>
                </button>
              </div>
            </div>

            {/* Unlocked Badges Row */}
            <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap gap-2">
              {DISCOVERY_STAGES.map((stage, idx) => {
                const unlocked = stageStats[idx].isCompleted;
                return (
                  <div
                    key={stage.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border ${
                      unlocked
                        ? 'bg-yellow-400 text-slate-950 border-yellow-200'
                        : 'bg-slate-900/40 text-slate-300 border-white/15 opacity-70'
                    }`}
                  >
                    <span>{stage.badgeEmoji}</span>
                    <span>{stage.badgeTitle}</span>
                    {unlocked ? <span>⭐</span> : <span>🔒</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Child-Facing Superpower Motivation Card */}
          <div className="bg-amber-50 rounded-3xl p-5 border-4 border-amber-300 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg sm:text-xl font-display font-black text-slate-900">
                ⚡ {childName}’in Merak & Süper Güç Listesi
              </h3>
            </div>

            {superpowerQueue.length === 0 ? (
              <p className="text-sm font-semibold text-slate-700">
                {totalAnsweredCount === 0
                  ? 'Henüz keşif testine başlamadınız! Yukarıdan Bölüm 1’e basarak soruları oynadıkça, öğrenilecek gizli süper güçler burada belirecek.'
                  : 'Vay canına! Şu ana kadar işaretlediğin tüm soruları tek başına bildin! Bölüm 4 ve 5’teki Efsanevi Boss sorularını da deneyebilirsin.'}
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-bold text-amber-950">
                  🔥 Harika! Önümüzdeki günlerde bu <strong>{superpowerQueue.length} Efsanevi Gücü</strong> günde sadece 10–15 dakikalık oyunlarla açmaya hazır mısın?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {superpowerQueue.map((item) => {
                    const status = discoveryResults[item.id]?.status;
                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl p-3 border-2 border-amber-200 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span>{status === 'learning' ? '🔴' : '🟡'}</span>
                            <span className="font-display font-black text-sm text-slate-900">
                              {item.skillLabelTr}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            Bölüm {item.stageNumber} • {item.characterName}
                          </p>
                        </div>

                        {onSwitchToDay && (
                          <button
                            onClick={() => {
                              playTap(isMuted);
                              onSwitchToDay(item.curriculumDayTarget);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs cursor-pointer flex-shrink-0"
                          >
                            {item.curriculumDayTarget.replace('day-', 'Gün ')}’e Git →
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3-Column Parent Diagnostic Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-4 border-4 border-emerald-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h4 className="font-display font-black text-base text-slate-900">
                  🟢 Tam Bildikleri ({masteredList.length})
                </h4>
              </div>
              {masteredList.length === 0 ? (
                <p className="text-xs text-slate-400 font-semibold">Henüz işaretlenen yok.</p>
              ) : (
                <ul className="space-y-1.5 text-xs font-bold text-slate-700">
                  {masteredList.map((item) => (
                    <li key={item.id} className="bg-emerald-50 rounded-xl px-3 py-2 border border-emerald-100">
                      ✅ {item.skillLabelTr}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white rounded-3xl p-4 border-4 border-amber-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-amber-600" />
                <h4 className="font-display font-black text-base text-slate-900">
                  🟡 Gelişmekte Olanlar ({assistedList.length})
                </h4>
              </div>
              {assistedList.length === 0 ? (
                <p className="text-xs text-slate-400 font-semibold">Henüz işaretlenen yok.</p>
              ) : (
                <ul className="space-y-1.5 text-xs font-bold text-slate-700">
                  {assistedList.map((item) => (
                    <li key={item.id} className="bg-amber-50 rounded-xl px-3 py-2 border border-amber-100">
                      🌱 {item.skillLabelTr}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white rounded-3xl p-4 border-4 border-rose-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-rose-600" />
                <h4 className="font-display font-black text-base text-slate-900">
                  🎯 Öğrenme Hedeflerimiz ({learningList.length})
                </h4>
              </div>
              {learningList.length === 0 ? (
                <p className="text-xs text-slate-400 font-semibold">Henüz işaretlenen yok.</p>
              ) : (
                <ul className="space-y-1.5 text-xs font-bold text-slate-700">
                  {learningList.map((item) => (
                    <li
                      key={item.id}
                      className="bg-rose-50 rounded-xl px-3 py-2 border border-rose-100 flex items-center justify-between gap-2"
                    >
                      <span>🔥 {item.skillLabelTr}</span>
                      {onSwitchToDay && (
                        <button
                          onClick={() => {
                            playTap(isMuted);
                            onSwitchToDay(item.curriculumDayTarget);
                          }}
                          className="text-[11px] font-black text-blue-700 underline cursor-pointer"
                        >
                          {item.curriculumDayTarget.replace('day-', 'Gün ')}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
