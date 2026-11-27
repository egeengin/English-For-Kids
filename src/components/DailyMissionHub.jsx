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
  Sparkles,
  Globe,
  Flame,
  Trophy,
} from 'lucide-react';
import {
  DAILY_EXPEDITION_DAYS,
  getWorksheetQuestions,
} from '../data/dailyMissionsData';
import { getIslandStopMeta, getSpokenPhrasesForDay } from '../data/islandMapData';
import {
  speakEnglish,
  stopSpeech,
  prefetchSpeech,
  unlockAudio,
  triggerHoverSpeech,
  cancelHoverSpeech,
} from '../utils/speech';
import {
  playTap,
  playSuccess,
  playDiDit,
  playVictoryFanfare,
  playGentleWobble,
} from '../utils/soundEffects';
import { recordMissedWord, recordMasteredWord } from '../utils/reviewTracker';
import { useVoiceQuizAnswer } from '../utils/useVoiceQuizAnswer';
import {
  createSpeechListener,
  evaluateKidPronunciation,
  isSpeechRecognitionSupported,
} from '../utils/speechRecognition';
import { startAudioClipRecorder } from '../utils/audioRecorder';
import DailySingLearn from './DailySingLearn';
import LeoBuddy from './LeoBuddy';

export default function DailyMissionHub({
  dailyChecklist: _dailyChecklist = {},
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
  initialStep = null,
  questProgress = {},
  onMarkQuestStep,
  onMarkSpokenPhrase,
  onBackToIsland,
  childName = 'Deniz',
  isMuted = false,
}) {
  const [internalDayId, setInternalDayId] = useState('day-1');
  const currentDayId =
    selectedDayId && DAILY_EXPEDITION_DAYS.some((d) => d.id === selectedDayId)
      ? selectedDayId
      : internalDayId;

  const [lessonStep, setLessonStep] = useState(() => initialStep || 'learn'); // 'learn' | 'song' | 'quiz' | 'speak'
  const [showHelper, setShowHelper] = useState(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [speakingTarget, setSpeakingTarget] = useState(null);
  const [isSlowMode, setIsSlowMode] = useState(false);
  const [wrongOptionIds, setWrongOptionIds] = useState(new Set());
  const [quizStreak, setQuizStreak] = useState(0);
  const [starBurst, setStarBurst] = useState(null);

  // Learn-step inline voice echo state
  const [learnListeningWord, setLearnListeningWord] = useState(null);
  const [learnSpokenWords, setLearnSpokenWords] = useState(() =>
    getSpokenPhrasesForDay(questProgress, currentDayId)
  );
  const learnListenerRef = useRef(null);

  // Step 4 Speak spotlight state
  const [speakCardIdx, setSpeakCardIdx] = useState(0);
  const [isSpeakListening, setIsSpeakListening] = useState(false);
  const [speakHeardText, setSpeakHeardText] = useState('');
  const [speakFeedback, setSpeakFeedback] = useState('');
  const [speakPassedMap, setSpeakPassedMap] = useState(() =>
    getSpokenPhrasesForDay(questProgress, currentDayId)
  );
  const [speakRecordingUrl, setSpeakRecordingUrl] = useState(null);
  const [isStopCelebrated, setIsStopCelebrated] = useState(false);
  const speakListenerRef = useRef(null);
  const speakRecorderRef = useRef(null);

  const quizSpeechSessionRef = useRef(0);
  const quizSpeechTimerRef = useRef(null);
  const burstTimerRef = useRef(null);
  const voiceBonusIdsRef = useRef(new Set());
  const micSupported = isSpeechRecognitionSupported();

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
      if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
      if (learnListenerRef.current) learnListenerRef.current.abort();
      if (speakListenerRef.current) speakListenerRef.current.abort();
    };
  }, [stopQuizSpeech]);

  const setDayId = (dayId) => {
    playTap(isMuted);
    stopQuizSpeech();
    if (learnListenerRef.current) learnListenerRef.current.abort();
    if (speakListenerRef.current) speakListenerRef.current.abort();
    setLessonStep('learn');
    setActiveQuestionIdx(0);
    setSpeakCardIdx(0);
    const persistedSpoken = getSpokenPhrasesForDay(questProgress, dayId);
    setLearnSpokenWords(persistedSpoken);
    setSpeakPassedMap(persistedSpoken);
    setSpeakFeedback('');
    setSpeakHeardText('');
    setSpeakRecordingUrl(null);
    setIsStopCelebrated(false);
    setQuizStreak(0);
    setWrongOptionIds(new Set());
    if (onSelectDayId) {
      onSelectDayId(dayId);
    } else {
      setInternalDayId(dayId);
    }
  };

  const activeDayIndex = Math.max(
    0,
    DAILY_EXPEDITION_DAYS.findIndex((d) => d.id === currentDayId)
  );
  const activeDay = DAILY_EXPEDITION_DAYS[activeDayIndex] || DAILY_EXPEDITION_DAYS[0];
  const nextDay = DAILY_EXPEDITION_DAYS[activeDayIndex + 1] || null;
  const stopMeta = getIslandStopMeta(activeDay.id);
  const vocabList = useMemo(() => activeDay.vocabFocus || [], [activeDay]);

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
      ...vocabList.map((v) => v.en),
      ...dayQuizQuestions.slice(0, 2).map((q) => q.promptEn),
    ]);
  }, [activeDay, vocabList, dayQuizQuestions, isMuted]);

  const dayQuizScore = dayQuizQuestions.filter((q) => {
    const chosenId = dailyQuizAnswers[q.id];
    return q.options.some((o) => o.id === chosenId && o.isCorrect);
  }).length;

  const safeQuestionIdx = Math.min(activeQuestionIdx, Math.max(0, dayQuizQuestions.length - 1));
  const activeDailyQuestion = dayQuizQuestions[safeQuestionIdx] || null;

  const triggerBurst = useCallback((label) => {
    if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
    setStarBurst({ id: Date.now(), label });
    burstTimerRef.current = setTimeout(() => setStarBurst(null), 1400);
  }, []);

  const playQuestionPrompt = useCallback(
    (question) => {
      if (!question || isMuted) return;
      cancelHoverSpeech();
      unlockAudio();
      stopQuizSpeech();

      const sessionId = quizSpeechSessionRef.current;
      setSpeakingTarget('prompt');

      speakEnglish(
        question.promptEn,
        () => {
          if (sessionId !== quizSpeechSessionRef.current) return;
          setSpeakingTarget(null);
        },
        { rate: isSlowMode ? 0.8 : 1.0 }
      );
    },
    [isMuted, isSlowMode, stopQuizSpeech]
  );

  const handleSelectQuestion = useCallback(
    (idx, autoRead = true) => {
      const safeIdx = Math.max(0, Math.min(idx, dayQuizQuestions.length - 1));
      setActiveQuestionIdx(safeIdx);
      setWrongOptionIds(new Set());
      const targetQ = dayQuizQuestions[safeIdx];
      if (autoRead && targetQ) {
        playQuestionPrompt(targetQ);
      } else {
        stopQuizSpeech();
      }
    },
    [dayQuizQuestions, playQuestionPrompt, stopQuizSpeech]
  );

  const handleDailyQuizClick = useCallback(
    (questionId, opt, viaVoice = false) => {
      cancelHoverSpeech();
      stopQuizSpeech();
      unlockAudio();
      const targetQ = dayQuizQuestions.find((item) => item.id === questionId);
      const correctOpt = targetQ?.options?.find((o) => o.isCorrect) || opt;

      if (opt.isCorrect) {
        playSuccess(isMuted);
        const nextCombo = wrongOptionIds.size === 0 ? quizStreak + 1 : 1;
        setQuizStreak(nextCombo);
        try {
          confetti({
            particleCount: nextCombo >= 3 ? 75 : 45,
            spread: 65,
            origin: { y: 0.65 },
          });
        } catch {
          // ignore
        }
        recordMasteredWord(correctOpt.textEn, correctOpt.emoji, correctOpt.labelTr || '');
        if (viaVoice && !voiceBonusIdsRef.current.has(questionId)) {
          voiceBonusIdsRef.current.add(questionId);
          if (onRewardEarned) {
            onRewardEarned({ stars: 2, bricks: 1 });
          }
          triggerBurst('+2 ⭐ VOICE!');
        } else {
          triggerBurst(nextCombo >= 3 ? `⚡ ${nextCombo}x +1 ⭐` : '+1 ⭐');
        }
        if (!isMuted) {
          setTimeout(
            () => speakEnglish(opt.textEn, undefined, { rate: isSlowMode ? 0.8 : 1.0 }),
            280
          );
        }
        if (onSaveDailyQuizAnswer) {
          onSaveDailyQuizAnswer(questionId, opt.id);
        }
        const answeredAfter = dayQuizQuestions.filter(
          (item) => item.id === questionId || Boolean(dailyQuizAnswers[item.id])
        ).length;
        const isLastQuestion =
          dayQuizQuestions.length > 0 &&
          dayQuizQuestions[dayQuizQuestions.length - 1]?.id === questionId;
        if (
          onMarkQuestStep &&
          (isLastQuestion || (dayQuizQuestions.length > 0 && answeredAfter >= Math.ceil(dayQuizQuestions.length / 2)))
        ) {
          onMarkQuestStep(activeDay.id, 'quiz');
        }
      } else {
        setQuizStreak(0);
        playDiDit(isMuted);
        recordMissedWord(correctOpt.textEn, correctOpt.emoji, correctOpt.labelTr || '');
        setWrongOptionIds((prev) => new Set([...prev, opt.id]));
      }
    },
    [
      activeDay.id,
      dailyQuizAnswers,
      dayQuizQuestions,
      isMuted,
      isSlowMode,
      onMarkQuestStep,
      onRewardEarned,
      onSaveDailyQuizAnswer,
      quizStreak,
      stopQuizSpeech,
      triggerBurst,
      wrongOptionIds.size,
    ]
  );

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
    setQuizStreak(0);
    setWrongOptionIds(new Set());
    if (onResetDailyQuizQuestions) {
      onResetDailyQuizQuestions(dayQuizQuestions.map((q) => q.id));
    }
  };

  // Step 1 Learn: Quick Voice Echo on any flashcard
  const handleLearnSayIt = (vocabItem) => {
    if (!micSupported) {
      speakEnglish(vocabItem.en);
      return;
    }
    cancelHoverSpeech();
    unlockAudio();
    playTap(isMuted);
    if (learnListenerRef.current) learnListenerRef.current.abort();

    if (learnListeningWord === vocabItem.en) {
      setLearnListeningWord(null);
      return;
    }

    setLearnListeningWord(vocabItem.en);
    learnListenerRef.current = createSpeechListener({
      lang: 'en-US',
      onResult: async ({ transcript, isFinal } = {}) => {
        if (!isFinal) return;
        setLearnListeningWord(null);
        const res = await evaluateKidPronunciation({
          targetPhrase: vocabItem.en,
          transcript: transcript || '',
          childName,
        });
        if (res?.isAccepted) {
          playSuccess(isMuted);
          recordMasteredWord(vocabItem.en, vocabItem.emoji, vocabItem.tr || '');
          setLearnSpokenWords((prev) => ({ ...prev, [vocabItem.en]: true }));
          if (onMarkSpokenPhrase) onMarkSpokenPhrase(activeDay.id, vocabItem.en);
          if (onRewardEarned) onRewardEarned({ stars: 1, bricks: 1 });
          triggerBurst('+1 ⭐ NICE!');
          if (!isMuted) speakEnglish('Awesome!');
        } else {
          playGentleWobble(isMuted);
          if (!isMuted) speakEnglish(vocabItem.en);
        }
      },
      onError: () => setLearnListeningWord(null),
      onEnd: () => setLearnListeningWord(null),
    });
    learnListenerRef.current.start();
  };

  // Step 4 Speak Spotlight handlers
  const activeSpeakItem = vocabList[speakCardIdx % Math.max(1, vocabList.length)] || vocabList[0];
  const speakDoneCount = vocabList.filter((v) => Boolean(speakPassedMap[v.en])).length;
  const allSpeakDone = vocabList.length > 0 && speakDoneCount === vocabList.length;

  const markSpeakPassed = useCallback(
    (item) => {
      if (!item) return;
      const alreadyDone = Boolean(speakPassedMap[item.en]);
      const nextMap = { ...speakPassedMap, [item.en]: true };
      setSpeakPassedMap(nextMap);
      setLearnSpokenWords((prev) => ({ ...prev, [item.en]: true }));
      if (onMarkSpokenPhrase) onMarkSpokenPhrase(activeDay.id, item.en);
      recordMasteredWord(item.en, item.emoji, item.tr || '');
      playSuccess(isMuted);
      if (!alreadyDone && onRewardEarned) {
        onRewardEarned({ stars: 2, bricks: 1 });
        triggerBurst('+2 ⭐ SPEAK!');
      }
      const nextDoneCount = vocabList.filter((v) => Boolean(nextMap[v.en])).length;
      if (nextDoneCount === vocabList.length && !isStopCelebrated) {
        setIsStopCelebrated(true);
        if (onMarkQuestStep) onMarkQuestStep(activeDay.id, 'speak');
        playVictoryFanfare(isMuted);
        if (onRewardEarned) onRewardEarned({ stars: 5, bricks: 2 });
        try {
          confetti({ particleCount: 110, spread: 85, origin: { y: 0.55 } });
        } catch {
          // ignore
        }
        if (!isMuted) {
          speakEnglish(`Amazing job ${childName}! You finished Stop ${stopMeta.stopNumber}!`);
        }
      } else if (!isMuted) {
        speakEnglish('Great speaking!');
      }
    },
    [
      activeDay.id,
      childName,
      isMuted,
      isStopCelebrated,
      onMarkQuestStep,
      onMarkSpokenPhrase,
      onRewardEarned,
      speakPassedMap,
      stopMeta.stopNumber,
      triggerBurst,
      vocabList,
    ]
  );

  const handleStartSpotlightSpeak = useCallback(async () => {
    if (!activeSpeakItem || isSpeakListening) return;
    cancelHoverSpeech();
    stopQuizSpeech();
    unlockAudio();
    playTap(isMuted);
    setSpeakHeardText('');
    setSpeakFeedback('');
    setSpeakRecordingUrl(null);

    if (!micSupported) {
      setSpeakFeedback('Tap "I said it aloud!" after reading with Leo.');
      return;
    }

    setIsSpeakListening(true);
    speakRecorderRef.current = await startAudioClipRecorder();

    speakListenerRef.current = createSpeechListener({
      lang: 'en-US',
      onInterim: (t) => setSpeakHeardText(t),
      onResult: async ({ transcript, isFinal } = {}) => {
        if (!isFinal) return;
        setIsSpeakListening(false);
        if (speakRecorderRef.current) {
          const url = await speakRecorderRef.current.stopAndGetUrl();
          speakRecorderRef.current = null;
          if (url) setSpeakRecordingUrl(url);
        }
        const finalText = transcript || '';
        setSpeakHeardText(finalText);
        const res = await evaluateKidPronunciation({
          targetPhrase: activeSpeakItem.en,
          transcript: finalText,
          childName,
        });
        if (res?.isAccepted) {
          setSpeakFeedback('Awesome speaking! Leo heard you loud and clear!');
          markSpeakPassed(activeSpeakItem);
        } else {
          playGentleWobble(isMuted);
          setSpeakFeedback('Good try! Listen once and say it again.');
        }
      },
      onError: async () => {
        setIsSpeakListening(false);
        if (speakRecorderRef.current) {
          await speakRecorderRef.current.stopAndGetUrl();
          speakRecorderRef.current = null;
        }
        setSpeakFeedback('Could not hear clearly. Try again!');
      },
    });
    speakListenerRef.current.start();
  }, [
    activeSpeakItem,
    childName,
    isMuted,
    isSpeakListening,
    markSpeakPassed,
    micSupported,
    stopQuizSpeech,
  ]);

  const goToStep = useCallback(
    (nextStepId, markCurrentKey = null) => {
      playTap(isMuted);
      stopQuizSpeech();
      if (markCurrentKey && onMarkQuestStep) {
        onMarkQuestStep(activeDay.id, markCurrentKey);
      }
      setLessonStep(nextStepId);
    },
    [activeDay.id, isMuted, onMarkQuestStep, stopQuizSpeech]
  );

  // Auto-read active quiz prompt when entering the Play step
  useEffect(() => {
    if (lessonStep !== 'quiz' || isMuted || !activeDailyQuestion?.promptEn) return undefined;
    const t = setTimeout(() => {
      playQuestionPrompt(activeDailyQuestion);
    }, 240);
    return () => {
      clearTimeout(t);
      stopQuizSpeech();
    };
  }, [lessonStep, activeDailyQuestion, isMuted, playQuestionPrompt, stopQuizSpeech]);

  // Desktop keyboard shortcuts for Play (Quiz) and Speak steps
  useEffect(() => {
    const onKeyDown = (e) => {
      const target = e.target;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const isInteractiveTarget =
        tag === 'BUTTON' ||
        tag === 'A' ||
        target?.getAttribute?.('role') === 'button' ||
        Boolean(target?.closest?.('button, a, [role="button"]'));

      if (lessonStep === 'learn') {
        const digit = Number(e.key);
        if (digit >= 1 && digit <= 9) {
          const item = vocabList[digit - 1];
          if (item && !isMuted) {
            cancelHoverSpeech();
            unlockAudio();
            speakEnglish(item.en);
          }
        }
      } else if (lessonStep === 'quiz' && activeDailyQuestion) {
        if (e.key === '1' || e.key === '2' || e.key === '3') {
          const opt = activeDailyQuestion.options[Number(e.key) - 1];
          if (opt && !wrongOptionIds.has(opt.id)) {
            handleDailyQuizClick(activeDailyQuestion.id, opt);
          }
        } else if (e.code === 'Space' && !isInteractiveTarget) {
          e.preventDefault();
          stopQuizVoiceAnswer();
          playQuestionPrompt(activeDailyQuestion);
        } else if (e.key === 'm' || e.key === 'M') {
          startQuizVoiceAnswer();
        } else if ((e.key === 'Enter' && !isInteractiveTarget) || e.key === 'ArrowRight') {
          if (safeQuestionIdx < dayQuizQuestions.length - 1) {
            handleSelectQuestion(safeQuestionIdx + 1, true);
          } else {
            goToStep('speak', 'quiz');
          }
        }
      } else if (lessonStep === 'speak' && activeSpeakItem) {
        if (e.code === 'Space' && !isInteractiveTarget) {
          e.preventDefault();
          unlockAudio();
          speakEnglish(activeSpeakItem.en);
        } else if (e.key === 'm' || e.key === 'M') {
          handleStartSpotlightSpeak();
        } else if ((e.key === 'Enter' && !isInteractiveTarget) || e.key === 'ArrowRight') {
          if (speakCardIdx < vocabList.length - 1) {
            setSpeakCardIdx((prev) => prev + 1);
            setSpeakHeardText('');
            setSpeakFeedback('');
            setSpeakRecordingUrl(null);
          }
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    activeDailyQuestion,
    activeSpeakItem,
    dayQuizQuestions.length,
    goToStep,
    handleDailyQuizClick,
    handleSelectQuestion,
    handleStartSpotlightSpeak,
    isMuted,
    lessonStep,
    playQuestionPrompt,
    safeQuestionIdx,
    speakCardIdx,
    startQuizVoiceAnswer,
    stopQuizVoiceAnswer,
    vocabList,
    wrongOptionIds,
  ]);

  const dayQuestEntry = questProgress?.[activeDay.id] || {};
  const quizStepDone =
    Boolean(dayQuestEntry.quiz) ||
    (dayQuizQuestions.length > 0 && dayQuizScore >= Math.ceil(dayQuizQuestions.length / 2));

  const leoQuizMood = isQuizListening
    ? 'listening'
    : quizStreak >= 2
    ? 'cheering'
    : wrongOptionIds.size > 0
    ? 'thinking'
    : 'happy';

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-5 space-y-4 flex-1 island-pop-in">
      {/* Floating Star Burst */}
      {starBurst && (
        <div
          key={starBurst.id}
          className="fixed top-20 right-8 z-50 pointer-events-none px-4 py-2 rounded-2xl bg-amber-400 text-slate-950 border-2 border-amber-600 font-display font-black text-base shadow-lg star-burst-pop"
        >
          {starBurst.label}
        </div>
      )}

      {/* Clean Horizontal Stop Selector */}
      <div className="bg-white rounded-3xl p-2.5 sm:p-3 shadow-sm border-2 border-amber-200 flex items-center gap-2">
        {onBackToIsland && (
          <button
            type="button"
            onClick={() => {
              playTap(isMuted);
              stopQuizSpeech();
              onBackToIsland();
            }}
            className="px-3 py-2 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-900 border-2 border-sky-200 font-display font-black text-xs sm:text-sm whitespace-nowrap cursor-pointer transition flex items-center gap-1 flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Island</span>
          </button>
        )}

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 flex-1">
          {DAILY_EXPEDITION_DAYS.map((day) => {
            const meta = getIslandStopMeta(day.id);
            const isSelected = day.id === activeDay.id;
            const entry = questProgress?.[day.id] || {};
            const isComplete = Boolean(entry.learn && entry.song && entry.speak);

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
                <span>{meta.emoji}</span>
                <span>Stop {meta.stopNumber}</span>
                {isComplete && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Stop Header + 4-Step Guided Stepper */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border-2 border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl flex-shrink-0">
              {stopMeta.emoji}
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-sky-700">
                Stop {stopMeta.stopNumber} of 16
              </div>
              <h2 className="text-base sm:text-xl font-display font-black text-slate-900">
                {stopMeta.titleEn}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-500">{stopMeta.taglineEn}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                playTap(isMuted);
                setShowHelper((prev) => !prev);
              }}
              aria-pressed={showHelper}
              className={`flex items-center gap-1 px-3 py-2 rounded-2xl border font-display font-black text-xs cursor-pointer transition ${
                showHelper
                  ? 'bg-amber-100 text-amber-900 border-amber-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
              }`}
              title="Toggle optional helper translations"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{showHelper ? 'Helper On' : 'Helper'}</span>
            </button>

            {onOpenDailyRecall && (
              <button
                type="button"
                onClick={() => {
                  playTap(isMuted);
                  onOpenDailyRecall();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-display font-black text-xs sm:text-sm shadow-xs cursor-pointer transition"
                title="See today's memory recap"
              >
                <span>🧠 Recap</span>
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
                <span>📖 Stories</span>
              </button>
            )}
          </div>
        </div>

        {/* 4-Step Guided Navigation: 1. Learn -> 2. Sing -> 3. Play -> 4. Speak */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {[
            { id: 'learn', label: '1. 🎓 Learn', sub: `${vocabList.length} Key Phrases`, done: Boolean(dayQuestEntry.learn) },
            { id: 'song', label: '2. 🎵 Sing', sub: 'Rhythm & Beats', done: Boolean(dayQuestEntry.song) },
            { id: 'quiz', label: '3. 🎮 Play', sub: `${dayQuizScore}/${dayQuizQuestions.length} Stars`, done: quizStepDone },
            { id: 'speak', label: '4. 🎙️ Speak', sub: `${speakDoneCount}/${vocabList.length} Spoken`, done: Boolean(dayQuestEntry.speak) },
          ].map((step) => {
            const active = lessonStep === step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => goToStep(step.id)}
                className={`px-3 py-2.5 rounded-2xl border-2 text-center transition cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-[1.02]'
                    : step.done
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="font-display font-black text-xs sm:text-sm flex items-center justify-center gap-1">
                  <span>{step.label}</span>
                  {step.done && !active && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <div className={`text-[11px] font-bold ${active ? 'text-blue-100' : 'text-slate-500'}`}>
                  {step.sub}
                </div>
              </button>
            );
          })}
        </div>

        {/* STEP 1: LEARN (Visual Flashcards + Voice Echo) */}
        {lessonStep === 'learn' && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between flex-wrap gap-2 bg-sky-50 border border-sky-200 rounded-2xl p-3">
              <LeoBuddy
                mood="happy"
                size="sm"
                speechBubble={`Listen to all ${vocabList.length} phrases, or tap Say It to echo me!`}
                isMuted={isMuted}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {vocabList.map((v) => {
                const isListeningThis = learnListeningWord === v.en;
                const isSpoken = Boolean(learnSpokenWords[v.en]);
                return (
                  <div
                    key={v.en}
                    className={`bg-gradient-to-br from-white to-sky-50/70 border-2 rounded-3xl p-4 space-y-3 transition shadow-xs ${
                      isSpoken ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <button
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
                        className="flex items-center gap-3.5 min-w-0 text-left cursor-pointer group flex-1"
                      >
                        <span className="text-5xl leading-none flex-shrink-0">{v.emoji}</span>
                        <div className="min-w-0">
                          <div className="font-display font-black text-lg sm:text-xl text-slate-900 group-hover:text-blue-700 leading-snug">
                            {v.en}
                          </div>
                          {showHelper && v.tr && (
                            <div className="text-xs font-black text-emerald-700 mt-0.5">{v.tr}</div>
                          )}
                        </div>
                      </button>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            cancelHoverSpeech();
                            unlockAudio();
                            speakEnglish(v.en);
                          }}
                          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                          title="Listen"
                          aria-label={`Listen to ${v.en}`}
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLearnSayIt(v)}
                          className={`px-2.5 py-2.5 rounded-xl font-display font-black text-xs flex items-center gap-1 shadow-xs cursor-pointer transition ${
                            isListeningThis
                              ? 'bg-rose-500 text-white animate-pulse'
                              : isSpoken
                              ? 'bg-emerald-500 text-white'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                          title="Say this phrase aloud"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>{isListeningThis ? '...' : isSpoken ? '✓' : 'Say It'}</span>
                        </button>
                      </div>
                    </div>

                    {v.exampleEn && (
                      <button
                        type="button"
                        onClick={() => {
                          cancelHoverSpeech();
                          unlockAudio();
                          speakEnglish(v.exampleEn);
                        }}
                        className="w-full text-left bg-white hover:bg-blue-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2 cursor-pointer transition"
                      >
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-display font-black text-slate-800">
                            “{v.exampleEn}”
                          </div>
                          {showHelper && v.exampleTr && (
                            <div className="text-xs font-bold text-slate-500">{v.exampleTr}</div>
                          )}
                        </div>
                        <Volume2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => goToStep('song', 'learn')}
              className="w-full py-3.5 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-black text-base sm:text-lg shadow-md border-b-4 border-emerald-700 active:translate-y-0.5 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Got It! Let’s Sing 🎵</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* STEP 2: MATCHED SONG */}
      {lessonStep === 'song' && (
        <div className="space-y-4">
          <DailySingLearn
            key={activeDay.id}
            dayId={activeDay.id}
            isMuted={isMuted}
            showHelper={showHelper}
            onGoToQuiz={() => goToStep('quiz', 'song')}
          />
          <button
            type="button"
            onClick={() => goToStep('quiz', 'song')}
            className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-base sm:text-lg shadow-md border-b-4 border-blue-800 active:translate-y-0.5 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Ready to Play! Start Quiz 🎮</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* STEP 3: STEP-BY-STEP PLAY & QUIZ */}
      {lessonStep === 'quiz' && (
        <div
          id="daily-step-quiz"
          className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border-2 border-slate-200 space-y-4"
        >
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
                    title={`Question ${qIdx + 1}`}
                  >
                    {qIdx + 1}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {quizStreak >= 2 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-100 border border-amber-400 text-amber-900 font-display font-black text-xs">
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                  <span>{quizStreak}x Combo!</span>
                </span>
              )}
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
                title="Slow Speech Mode"
                aria-pressed={isSlowMode}
              >
                🐢
              </button>
              {activeDailyQuestion && (
                <button
                  type="button"
                  onClick={() => {
                    stopQuizVoiceAnswer();
                    playQuestionPrompt(activeDailyQuestion);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-xs shadow-xs cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen</span>
                  <kbd className="hidden md:inline-flex px-1.5 py-0.5 text-[10px] rounded bg-white/20">Space</kbd>
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
                  <span>{isQuizListening ? 'Listening...' : 'Say Answer (+2 ⭐)'}</span>
                  {!isQuizListening && (
                    <kbd className="hidden md:inline-flex px-1.5 py-0.5 text-[10px] rounded bg-white/20">M</kbd>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={handleResetDayQuiz}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                title="Reset Quiz"
                aria-label="Reset Quiz"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {(isQuizListening || quizVoiceNotice) && (
            <div className="flex flex-wrap items-center gap-2">
              {isQuizListening && (
                <span className="px-3 py-1 rounded-xl bg-rose-100 text-rose-900 font-black text-xs animate-pulse">
                  🎙️ {quizHeardText ? `"${quizHeardText}"` : 'Listening...'}
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
                    playQuestionPrompt(q);
                  }}
                  className={`rounded-3xl p-4 sm:p-5 bg-amber-50/60 border-2 transition flex items-center gap-4 cursor-pointer ${
                    isPromptSpeaking
                      ? 'border-yellow-400 ring-4 ring-yellow-300/50 shadow-sm'
                      : 'border-amber-200 hover:border-blue-300'
                  }`}
                >
                  <LeoBuddy mood={leoQuizMood} size="sm" isMuted={isMuted} />
                  <span className="text-4xl sm:text-5xl flex-shrink-0">{q.characterEmoji}</span>
                  <div className="flex-1 min-w-0">
                    {q.isReview && (
                      <span className="inline-block mb-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black">
                        🔄 Review Boost
                      </span>
                    )}
                    <div className="text-lg sm:text-2xl font-display font-black text-slate-900 leading-snug">
                      {q.promptEn}
                    </div>
                    {showHelper && q.promptTr && (
                      <div className="text-xs sm:text-sm font-bold text-blue-700 mt-1">
                        {q.promptTr}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3 Big Visual Answer Cards (non-nested accessible button containers) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {q.options.map((opt, optIdx) => {
                    const isChosen = chosenId === opt.id;
                    const isWrong = wrongOptionIds.has(opt.id);
                    let cls =
                      'bg-white border-slate-200 hover:border-blue-400 text-slate-900 hover:-translate-y-0.5';
                    if (chosenId && opt.isCorrect) {
                      cls = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-black shadow-sm';
                    } else if (isWrong) {
                      cls = 'bg-rose-50 border-rose-300 text-rose-800 opacity-40 line-through pointer-events-none';
                    } else if (chosenId && isChosen) {
                      cls = 'bg-rose-50 border-rose-400 text-rose-900';
                    }

                    return (
                      <div
                        key={opt.id}
                        role="button"
                        tabIndex={isWrong ? -1 : 0}
                        aria-disabled={isWrong}
                        onPointerEnter={(e) =>
                          triggerHoverSpeech(opt.textEn, { isMuted, pointerType: e.pointerType })
                        }
                        onFocus={() =>
                          triggerHoverSpeech(opt.textEn, { isMuted })
                        }
                        onPointerLeave={cancelHoverSpeech}
                        onKeyDown={(e) => {
                          if (isWrong) return;
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleDailyQuizClick(q.id, opt);
                          }
                        }}
                        onClick={() => {
                          if (!isWrong) handleDailyQuizClick(q.id, opt);
                        }}
                        className={`w-full text-left px-4 py-4 rounded-3xl border-3 text-base sm:text-lg font-display font-bold flex flex-col justify-between gap-3 transition cursor-pointer shadow-xs min-h-[120px] ${cls}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 text-xs font-black flex items-center justify-center flex-shrink-0">
                              {optIdx + 1}
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
                            className="p-2 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 transition cursor-pointer"
                            title="Listen to choice"
                            aria-label={`Listen to ${opt.textEn}`}
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-end justify-between gap-2">
                          <div>
                            <div className="leading-snug">{opt.textEn}</div>
                            {showHelper && opt.labelTr && (
                              <div className="text-xs font-semibold text-slate-500 mt-0.5">{opt.labelTr}</div>
                            )}
                          </div>
                          {chosenId && opt.isCorrect && <span className="text-xl flex-shrink-0">✅</span>}
                          {isWrong && <span className="text-xl flex-shrink-0">❌</span>}
                        </div>
                      </div>
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
                    <span>Previous</span>
                  </button>

                  {hasNext ? (
                    <button
                      type="button"
                      onClick={() => handleSelectQuestion(safeIdx + 1, true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-display font-black text-sm shadow-sm border-2 border-yellow-500 cursor-pointer transition"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => goToStep('speak', 'quiz')}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-display font-black text-sm shadow-md border-b-4 border-purple-900 cursor-pointer transition"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Next: Speak with Leo!</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* STEP 4: SPEAK SPOTLIGHT */}
      {lessonStep === 'speak' && activeSpeakItem && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-md border-3 border-purple-200 space-y-6 island-pop-in">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <LeoBuddy
              mood={isSpeakListening ? 'listening' : allSpeakDone ? 'cheering' : 'waving'}
              size="md"
              speechBubble={
                allSpeakDone
                  ? `Superstar ${childName}! You spoke every phrase!`
                  : `Your turn, ${childName}! Listen and say this aloud!`
              }
              isMuted={isMuted}
            />

            <div className="flex items-center gap-1.5">
              {vocabList.map((v, idx) => {
                const done = Boolean(speakPassedMap[v.en]);
                const active = idx === speakCardIdx;
                return (
                  <button
                    key={v.en}
                    type="button"
                    onClick={() => {
                      playTap(isMuted);
                      setSpeakCardIdx(idx);
                      setSpeakHeardText('');
                      setSpeakFeedback('');
                      setSpeakRecordingUrl(null);
                    }}
                    className={`w-10 h-10 rounded-xl border-2 font-display font-black text-xs flex items-center justify-center cursor-pointer transition ${
                      done
                        ? 'bg-emerald-500 text-white border-emerald-700'
                        : active
                        ? 'bg-purple-600 text-white border-purple-800 ring-4 ring-purple-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {done ? '✓' : idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spotlight Card */}
          <div className="rounded-3xl bg-gradient-to-br from-purple-50 via-white to-amber-50 border-3 border-purple-200 p-6 sm:p-8 text-center space-y-5">
            <div className="text-7xl leading-none">{activeSpeakItem.emoji}</div>

            <div className="space-y-1">
              <div className="font-display font-black text-2xl sm:text-4xl text-slate-900">
                “{activeSpeakItem.en}”
              </div>
              {showHelper && activeSpeakItem.tr && (
                <div className="text-sm font-bold text-purple-700">{activeSpeakItem.tr}</div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  unlockAudio();
                  speakEnglish(activeSpeakItem.en);
                }}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-base shadow-sm cursor-pointer"
              >
                <Volume2 className="w-5 h-5" />
                <span>Hear It</span>
                <kbd className="hidden md:inline-flex px-1.5 py-0.5 text-[10px] rounded bg-white/20">Space</kbd>
              </button>

              <button
                type="button"
                onClick={handleStartSpotlightSpeak}
                className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-display font-black text-base shadow-md border-b-4 cursor-pointer transition ${
                  isSpeakListening
                    ? 'bg-rose-500 text-white border-rose-700 ring-4 ring-rose-300'
                    : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-900'
                }`}
              >
                <Mic className="w-5 h-5" />
                <span>{isSpeakListening ? 'Listening...' : 'Say It!'}</span>
                {!isSpeakListening && (
                  <kbd className="hidden md:inline-flex px-1.5 py-0.5 text-[10px] rounded bg-white/20">M</kbd>
                )}
              </button>

              <button
                type="button"
                onClick={() => markSpeakPassed(activeSpeakItem)}
                className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-2 border-emerald-300 font-display font-black text-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I said it aloud!</span>
              </button>
            </div>

            {/* Live Soundwave Bars while listening */}
            {isSpeakListening && (
              <div className="flex items-end justify-center gap-1.5 h-8" aria-label="Listening soundwave">
                {[0, 1, 2, 3, 4].map((bar) => (
                  <span
                    key={bar}
                    style={{ animationDelay: `${bar * 110}ms` }}
                    className="w-2 h-7 rounded-full bg-rose-500 voice-bar"
                  />
                ))}
              </div>
            )}

            {(speakHeardText || speakFeedback || speakRecordingUrl) && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {speakHeardText && (
                  <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700">
                    Heard: “{speakHeardText}”
                  </span>
                )}
                {speakFeedback && (
                  <span className="px-3 py-1 rounded-xl bg-amber-100 border border-amber-300 text-xs font-black text-amber-900">
                    {speakFeedback}
                  </span>
                )}
                {speakRecordingUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      const audio = new Audio(speakRecordingUrl);
                      audio.play().catch(() => {});
                    }}
                    className="px-3 py-1 rounded-xl bg-sky-100 hover:bg-sky-200 border border-sky-300 text-xs font-black text-sky-900 cursor-pointer"
                  >
                    🔊 Play My Voice
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Step 4 Footer / Stop Celebration */}
          {allSpeakDone ? (
            <div className="rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3">
                <Trophy className="w-10 h-10 text-yellow-300 flex-shrink-0" />
                <div>
                  <div className="font-display font-black text-lg sm:text-xl flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                    <span>Stop {stopMeta.stopNumber} Complete!</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-emerald-100">
                    Awesome work! Head back to the Island to open your Treasure Chest!
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {onBackToIsland && (
                  <button
                    type="button"
                    onClick={() => {
                      playTap(isMuted);
                      onBackToIsland();
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-display font-black text-sm shadow-sm cursor-pointer"
                  >
                    🏝️ Back to Island
                  </button>
                )}
                {nextDay && (
                  <button
                    type="button"
                    onClick={() => setDayId(nextDay.id)}
                    className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-emerald-900 font-display font-black text-sm shadow-sm cursor-pointer flex items-center gap-1"
                  >
                    <span>Next Stop</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={speakCardIdx === 0}
                onClick={() => {
                  setSpeakCardIdx((prev) => Math.max(0, prev - 1));
                  setSpeakHeardText('');
                  setSpeakFeedback('');
                  setSpeakRecordingUrl(null);
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-display font-black text-sm border-2 ${
                  speakCardIdx > 0
                    ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer'
                    : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {speakCardIdx < vocabList.length - 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setSpeakCardIdx((prev) => prev + 1);
                    setSpeakHeardText('');
                    setSpeakFeedback('');
                    setSpeakRecordingUrl(null);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-display font-black text-sm border-2 border-yellow-500 cursor-pointer"
                >
                  <span>Next Phrase</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
