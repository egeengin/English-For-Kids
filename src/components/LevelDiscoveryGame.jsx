import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Mic,
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
import { playTap, playSuccess, playFanfare, playDiDit } from '../utils/soundEffects';
import { recordMissedWord, recordMasteredWord } from '../utils/reviewTracker';
import { useVoiceQuizAnswer } from '../utils/useVoiceQuizAnswer';

export default function LevelDiscoveryGame({
  discoveryResults = {},
  onSaveDiscoveryResult,
  onClearDiscoveryQuestions,
  onResetDiscovery,
  onRewardEarned,
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
  const [wrongOptionIds, setWrongOptionIds] = useState(new Set());
  const [viewMode, setViewMode] = useState('play'); // 'play' | 'stage-complete' | 'report'
  const [voiceBonusQuestionId, setVoiceBonusQuestionId] = useState(null);
  const voiceBonusIdsRef = useRef(new Set());

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
    setWrongOptionIds(new Set());
    setShowHelper(false);
    setViewMode('play');
  };

  const handleOptionSelect = useCallback((opt, viaVoice = false) => {
    if (!currentQuestion) return;

    cancelHoverSpeech();
    unlockAudio();

    if (opt.isCorrect) {
      playSuccess(isMuted);
    } else {
      playDiDit(isMuted);
      setWrongOptionIds((prev) => new Set([...prev, opt.id]));
    }

    const correctOpt = currentQuestion.options.find((o) => o.isCorrect) || opt;
    if (opt.isCorrect) {
      recordMasteredWord(correctOpt.textEn, correctOpt.emoji, correctOpt.labelTr || '');
    } else {
      recordMissedWord(correctOpt.textEn, correctOpt.emoji, correctOpt.labelTr || '');
    }

    if (viaVoice && opt.isCorrect && !voiceBonusIdsRef.current.has(currentQuestion.id)) {
      voiceBonusIdsRef.current.add(currentQuestion.id);
      setVoiceBonusQuestionId(currentQuestion.id);
      if (onRewardEarned) {
        onRewardEarned({ stars: 2, bricks: 1 });
      }
      try {
        confetti({ particleCount: 55, spread: 65, origin: { y: 0.65 } });
      } catch {
        // Ignore in headless environments
      }
    }

    if (!isMuted && opt.isCorrect) {
      setTimeout(() => {
        speakEnglish(opt.textEn);
      }, 300);
    }
    if (!opt.isCorrect) setShowHelper(true);

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
  }, [currentQuestion, currentStage, isMuted, onRewardEarned, onSaveDiscoveryResult]);

  const {
    isListening,
    heardText,
    voiceNotice,
    micSupported,
    startVoiceAnswer,
    stopVoiceAnswer,
  } = useVoiceQuizAnswer({
    options: currentQuestion?.options || [],
    questionKey: currentQuestion?.id || '',
    isMuted,
    onBeforeListen: stopSpeech,
    onMatchedOption: (matchedOpt) => handleOptionSelect(matchedOpt, true),
  });

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
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-5 space-y-4 flex-1 flex flex-col">
      {/* Compact Single-Row Stage Bar */}
      <div className="bg-white rounded-3xl p-2.5 sm:p-3 shadow-sm border-2 border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto flex-1">
          {DISCOVERY_STAGES.map((stage, idx) => {
            const stat = stageStats[idx];
            const isActive = viewMode !== 'report' && activeStageIdx === idx;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => handleSelectStage(idx)}
                className={`rounded-2xl px-3 py-2 border-2 font-display font-black text-xs sm:text-sm whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-800 shadow-xs'
                    : stat.isCompleted
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300'
                }`}
              >
                <span>Stage {stage.number}</span>
                <span className={`text-[11px] font-bold ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                  {stat.isCompleted ? '⭐' : `${stat.answeredCount}/10`}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            playTap(isMuted);
            setViewMode(viewMode === 'report' ? 'play' : 'report');
          }}
          className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-display font-black text-xs sm:text-sm cursor-pointer transition flex-shrink-0"
        >
          {viewMode === 'report' ? '🎮 Back to Test' : '📊 Scorecard'}
        </button>
      </div>

      {/* MODE 1: ACTIVE QUESTION */}
      {viewMode === 'play' && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border-2 border-slate-200 space-y-5 flex-1 flex flex-col justify-between">
          {/* Question Number Pills (1..10) + Listen / Voice Buttons */}
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
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-black text-sm border-2 transition cursor-pointer ${pillStyle}`}
                  >
                    {qIdx + 1}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  stopVoiceAnswer();
                  speakEnglish(currentQuestion.promptEn);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-xs sm:text-sm shadow-xs cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>🔊 Listen</span>
              </button>
              {micSupported && (
                <button
                  type="button"
                  onClick={startVoiceAnswer}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-display font-black text-xs sm:text-sm shadow-xs cursor-pointer transition ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-300'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>{isListening ? 'Listening...' : '🎙️ Say It (+2 ⭐)'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Clean Question Prompt */}
          <div
            onPointerEnter={(e) =>
              triggerHoverSpeech(currentQuestion.promptEn, { isMuted, pointerType: e.pointerType })
            }
            onPointerLeave={cancelHoverSpeech}
            onClick={() => {
              stopVoiceAnswer();
              speakEnglish(currentQuestion.promptEn);
            }}
            className="bg-slate-50 hover:bg-blue-50/40 rounded-2xl p-4 sm:p-5 border-2 border-slate-200 hover:border-blue-300 transition flex items-center gap-4 cursor-pointer"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0">
              {currentQuestion.characterEmoji}
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-display font-black text-slate-900 leading-snug">
              “{currentQuestion.promptEn}”
            </p>
          </div>

          {/* 3 Clean Visual Answer Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {currentQuestion.options.map((opt, optIdx) => {
              const isChosen = chosenOptionId === opt.id;
              const isAnswered = Boolean(chosenOptionId);
              const isWrong = wrongOptionIds.has(opt.id);

              let cardStyle = 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40';
              if (isAnswered) {
                if (opt.isCorrect) {
                  cardStyle = 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200';
                } else if (isChosen && !opt.isCorrect) {
                  cardStyle = 'border-rose-400 bg-rose-50 ring-2 ring-rose-200';
                } else {
                  cardStyle = 'border-slate-200 bg-slate-50 opacity-70';
                }
              } else if (isWrong) {
                cardStyle = 'border-rose-300 bg-rose-50/60 opacity-40 line-through pointer-events-none';
              }

              return (
                <div
                  key={opt.id}
                  onPointerEnter={(e) =>
                    triggerHoverSpeech(opt.textEn, { isMuted, pointerType: e.pointerType })
                  }
                  onFocus={() =>
                    triggerHoverSpeech(opt.textEn, { isMuted })
                  }
                  onPointerLeave={cancelHoverSpeech}
                  onClick={() => handleOptionSelect(opt)}
                  className={`rounded-3xl p-4 sm:p-6 border-4 transition cursor-pointer flex flex-col justify-between gap-3 min-h-[140px] sm:min-h-[190px] ${cardStyle}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 font-display font-black text-xs flex items-center justify-center">
                        {['A', 'B', 'C'][optIdx]}
                      </span>
                      <span className="text-3xl sm:text-4xl leading-none">{opt.emoji}</span>
                    </div>
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelHoverSpeech();
                        unlockAudio();
                        speakEnglish(opt.textEn);
                      }}
                      className="p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-blue-700 shadow-2xs cursor-pointer"
                      title="Listen"
                      aria-label="Listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <p className="font-display font-black text-lg sm:text-2xl text-slate-900 leading-snug">
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
                      {opt.isCorrect ? '✅ Correct!' : '❌ Try Again'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Minimalist Footer: Voice Badge + Next Button */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2 min-h-[32px]">
              {isListening && (
                <span className="px-3 py-1 rounded-xl bg-rose-100 text-rose-900 font-black text-xs animate-pulse">
                  🎙️ {heardText ? `"${heardText}"` : 'Listening...'}
                </span>
              )}
              {!isListening && (voiceNotice || voiceBonusQuestionId === currentQuestion.id) && (
                <span
                  className={`px-3 py-1 rounded-xl font-black text-xs ${
                    voiceNotice?.type === 'matched' || voiceBonusQuestionId === currentQuestion.id
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {voiceNotice?.text || '🎙️ Voice Bonus: +2 ⭐!'}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-yellow-300 font-display font-black text-base shadow-md transition active:scale-95 cursor-pointer flex-shrink-0"
            >
              <span>
                {activeQuestionIdx < currentStage.questions.length - 1
                  ? 'Next Question'
                  : 'Finish Stage 🏆'}
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
              Score: {currentStageStat.correctCount} / 10 Correct! • +1 Star ⭐
            </div>

            {currentStage.number === 3 ? (
              <>
                <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900">
                  Way to Go, Champion {childName}! ⭐⭐⭐
                </h2>
                <p className="text-sm sm:text-base text-slate-700 font-semibold leading-relaxed">
                  You unlocked 3-Star Champion status! Space, dinosaurs, and exciting new stages await!
                </p>
              </>
            ) : currentStage.number === DISCOVERY_STAGES.length ? (
              <>
                <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900">
                  Grand Finale Complete! 👑🏆
                </h2>
                <p className="text-sm text-slate-600 font-semibold">
                  You conquered all {DISCOVERY_STAGES.length * 10} questions! You are an English Grandmaster!
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900">
                  {currentStage.titleEn || `Stage ${currentStage.number}`} Complete! ⭐
                </h2>
                <p className="text-sm text-slate-600 font-semibold">
                  Awesome work, {childName}! Ready for the next stage?
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
                    ? '🔥 Challenge Stage 4!'
                    : `Go to Stage ${currentStage.number + 1}`}
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
                  <span>Retry Missed</span>
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
              <span>Scorecard</span>
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
                📊 {childName}’s Level Scorecard ({masteredList.length} Mastered / {totalAnsweredCount} Answered)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
                Missed topics are saved below as quick review targets.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleResetAll}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Test</span>
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
                    Stage {stage.number}
                  </div>
                  <div className="text-xs font-black text-emerald-700">
                    {st.correctCount} / 10 Correct
                  </div>
                  <div className="text-xs text-slate-500 font-semibold">
                    {st.isCompleted ? '⭐ Complete' : `${st.answeredCount}/10 answered`}
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
                  ✅ Mastered Skills ({masteredList.length})
                </h3>
              </div>
              {masteredList.length === 0 ? (
                <p className="text-xs text-slate-400 font-semibold">No answered questions yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {masteredList.map((item) => (
                    <span
                      key={item.id}
                      className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900"
                    >
                      ✓ S{item.stageNumber}: {item.skillTag.replace(/_/g, ' ')}
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
                  🎯 Superpowers to Practice ({learningList.length})
                </h3>
              </div>
              {learningList.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Any missed questions appear here for quick practice.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {learningList.map((item) => (
                    <div
                      key={item.id}
                      className="bg-amber-50 rounded-xl px-3 py-2 border border-amber-200 flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="font-bold text-slate-800">
                        🔥 S{item.stageNumber}: {item.skillTag.replace(/_/g, ' ')}
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
                          Practice Quest →
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
