import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Headphones,
  Sparkles,
  Award,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  Palette,
  Cat,
  Rocket,
  Star,
  Circle,
  Square,
  Triangle,
  Dog,
  Car,
  Plane,
  Train,
  Ship,
  Compass,
  Bike,
  Truck,
  Fish,
  Shield,
  Smile,
  Zap,
  Feather,
  Crown,
  Box,
  Globe,
  Mic,
  Bot,
  Radio,
  Apple,
  BookOpen,
  Sun,
  Flame,
  Heart,
  Music,
} from 'lucide-react';
import { speakEnglish, speakTurkish, speakGerman } from '../utils/speech';
import { createSpeechListener, evaluateKidPronunciation, isSpeechRecognitionSupported } from '../utils/speechRecognition';
import {
  playLegoSnap,
  playSuccessChime,
  playGentleWobble,
  playStarSparkle,
  playFanfare,
  playTap,
} from '../utils/soundEffects';

const ICON_MAP = {
  Palette,
  Cat,
  Rocket,
  Circle,
  Square,
  Triangle,
  Star,
  Dog,
  Car,
  Plane,
  Train,
  Ship,
  Compass,
  Bike,
  Truck,
  Fish,
  Shield,
  Smile,
  Zap,
  Feather,
  Crown,
  Box,
  Apple,
  BookOpen,
  Sparkles,
  Sun,
  Flame,
  Heart,
  Music,
};

const LEVEL_EMOJIS = {
  1: '🎨',
  2: '🦁',
  3: '🚀',
  4: '🍎',
  5: '📚',
  6: '⚡',
  7: '🌈',
  8: '🔢',
  9: '🧠',
  10: '👕',
  11: '👨‍👩‍👧',
  12: '😊',
  13: '🌌',
  14: '⏰',
  15: '🌟',
  16: '🧮',
};

function getCardStyle(item) {
  const hex = item.colorHex || '#E52521';
  const isLight =
    hex === '#FFD700' ||
    hex === '#EAB308' ||
    hex === '#FACC15' ||
    item.word === 'Yellow' ||
    item.word === 'Star' ||
    item.word === 'Truck' ||
    item.word === 'Sun' ||
    item.word === 'Banana' ||
    item.word === 'Lemon' ||
    item.word === 'Cheese';

  let borderColor = '#991B1B';
  if (hex === '#0055BF' || hex === '#2563EB') borderColor = '#002D62';
  else if (hex === '#FFD700' || hex === '#EAB308' || hex === '#FACC15') borderColor = '#A16207';
  else if (hex === '#237841' || hex === '#16A34A') borderColor = '#14532D';
  else if (hex === '#FF7F00' || hex === '#EA580C') borderColor = '#9A3412';
  else if (hex === '#8A2BE2' || hex === '#9333EA') borderColor = '#581C87';
  else if (hex === '#0284C7') borderColor = '#0369A1';
  else if (hex === '#475569') borderColor = '#1E293B';
  else if (hex === '#D97706') borderColor = '#78350F';
  else if (hex === '#EC4899') borderColor = '#9D174D';

  return {
    bgColor: hex,
    borderColor,
    isLight,
    textColor: isLight ? 'text-slate-950' : 'text-white',
    textShadow: isLight ? 'none' : '0 2px 5px rgba(0, 0, 0, 0.85)',
    iconBg: 'bg-white',
    iconColor: hex,
  };
}

const shuffle = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

export default function GameArena({
  curriculumLevels,
  customWords,
  onRewardEarned,
  onWordResult,
  onNavigateToWorkshop: _onNavigateToWorkshop,
  onQuestionCompleted,
  isAdventureStarted = true,
  isMuted,
  childName = 'Deniz',
  childAge = 7,
  geminiApiKey = '',
}) {
  const [selectedLevelId, setSelectedLevelId] = useState(curriculumLevels[0]?.id || 'level-1');

  // Spaced Repetition Active Queue:
  // questionQueue holds items remaining to be mastered in this session
  const [questionQueue, setQuestionQueue] = useState([]);
  const [masteredIds, setMasteredIds] = useState(() => new Set());
  const [reviewIds, setReviewIds] = useState(() => new Set());
  const [targetItem, setTargetItem] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [wobbleOptionId, setWobbleOptionId] = useState(null);
  const [revealedCardHints, setRevealedCardHints] = useState({});
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [encouragementText, setEncouragementText] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Voice Interaction State
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceFeedback, setVoiceFeedback] = useState(null);
  const voiceRecognitionRef = useRef(null);

  // Early-Reader Settings:
  // helperLanguage: 'both' | 'de' | 'tr'
  const [helperLanguage, setHelperLanguage] = useState(() => {
    return localStorage.getItem('lego_helper_lang') || 'both';
  });
  // cardCountMode: 2 (Junior) | 4 (Master) | 6 (Superstar)
  const [cardCountMode, setCardCountMode] = useState(() => {
    const saved = parseInt(localStorage.getItem('lego_card_mode') || '4', 10);
    return [2, 4, 6].includes(saved) ? saved : 4;
  });

  const hoverDebounceRef = useRef(null);
  const repeatTimerRef = useRef(null);

  // Abort voice recognition on target item change
  useEffect(() => {
    if (voiceRecognitionRef.current) {
      voiceRecognitionRef.current.abort();
    }
  }, [targetItem?.id]);

  // Save helper preferences
  const handleSetHelperLanguage = (lang) => {
    playTap(isMuted);
    setHelperLanguage(lang);
    localStorage.setItem('lego_helper_lang', lang);
  };

  const currentLevel = curriculumLevels.find((l) => l.id === selectedLevelId) || {
    id: 'custom',
    number: 8,
    title: 'Custom Words',
    titleTr: 'Özel Kelimeler',
    titleDe: 'Eigene Wörter',
    description: 'Words added by mom and dad!',
    themeColor: 'from-purple-500 to-indigo-500',
    borderColor: 'border-purple-600',
    icon: 'PlusCircle',
    badge: '🌟 Superstar',
    bricksReward: Math.max(3, Math.min(customWords.length, 6)),
    items: customWords,
  };

  const pool = currentLevel.items || [];

  const launchConfetti = useCallback(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#E52521', '#0055BF', '#FFD700', '#237841', '#FF7F00', '#8A2BE2'],
    });
  }, []);

  const resetRepeatTimer = useCallback((word) => {
    if (repeatTimerRef.current) {
      clearInterval(repeatTimerRef.current);
    }
    if (!word) return;

    repeatTimerRef.current = setInterval(() => {
      setIsSpeaking(true);
      speakEnglish(word, () => setIsSpeaking(false));
    }, 7500);
  }, []);

  // Sets up options for a specific target item
  const setupQuestionForTarget = useCallback(
    (target, currentPool, countMode) => {
      if (!target || !currentPool || currentPool.length === 0) return;

      setTargetItem(target);
      setSelectedOptionId(null);
      setIsCorrect(null);
      setWobbleOptionId(null);
      setRevealedCardHints({});
      setEncouragementText(null);
      setIsListeningVoice(false);
      setVoiceTranscript('');
      setVoiceFeedback(null);

      // Pick distractors according to Junior (2 cards), Master (4 cards), or Superstar (6 cards)
      const otherItems = currentPool.filter((item) => item.id !== target.id);
      const distractorCount = countMode === 2 ? 1 : countMode === 4 ? 3 : 5;
      const actualCount = Math.min(distractorCount, otherItems.length);
      const distractors = shuffle(otherItems).slice(0, actualCount);
      const questionChoices = shuffle([target, ...distractors]);
      setOptions(questionChoices);

      if (isAdventureStarted) {
        setIsSpeaking(true);
        speakEnglish(target.word, () => setIsSpeaking(false));
        resetRepeatTimer(target.word);
      }
    },
    [isAdventureStarted, resetRepeatTimer]
  );

  const handleToggleCardMode = (mode) => {
    playTap(isMuted);
    setCardCountMode(mode);
    localStorage.setItem('lego_card_mode', mode.toString());
    if (targetItem && pool.length > 0) {
      setupQuestionForTarget(targetItem, pool, mode);
    }
  };

  // Initialize or re-initialize level spaced repetition queue
  useEffect(() => {
    queueMicrotask(() => {
      setLevelCompleted(false);
      setIsTransitioning(false);
      setMasteredIds(new Set());
      setReviewIds(new Set());

      if (pool.length > 0) {
        const initialQueue = shuffle(pool);
        setQuestionQueue(initialQueue);
        setupQuestionForTarget(initialQueue[0], pool, cardCountMode);
      } else {
        setQuestionQueue([]);
        setTargetItem(null);
      }
    });

    return () => {
      if (repeatTimerRef.current) clearInterval(repeatTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLevelId, pool.length]);

  useEffect(() => {
    if (isAdventureStarted && targetItem && !levelCompleted && isCorrect === null) {
      const t = setTimeout(() => {
        setIsSpeaking(true);
        speakEnglish(targetItem.word, () => setIsSpeaking(false));
        resetRepeatTimer(targetItem.word);
      }, 0);
      return () => clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdventureStarted]);

  // Replay English voice
  const handleReplayEnglish = () => {
    if (!targetItem) return;
    playTap(isMuted);
    setIsSpeaking(true);
    speakEnglish(targetItem.word, () => setIsSpeaking(false));
    resetRepeatTimer(targetItem.word);
  };

  // Play Helper Audio (German, Turkish, or Both)
  const playHelperAudio = (item) => {
    if (helperLanguage === 'de') {
      speakGerman(item.translationDe || item.translation);
    } else if (helperLanguage === 'tr') {
      speakTurkish(item.translation);
    } else {
      speakGerman(item.translationDe || item.translation, () => {
        setTimeout(() => speakTurkish(item.translation), 200);
      });
    }
  };

  // Hover over card speaks English word
  const handleCardHover = (item) => {
    if (isCorrect === true || isTransitioning) return;
    if (hoverDebounceRef.current) clearTimeout(hoverDebounceRef.current);

    hoverDebounceRef.current = setTimeout(() => {
      speakEnglish(item.word);
    }, 120);
  };

  // Hover over headphone icon speaks helper language
  const handleHintHover = (e, item) => {
    e.stopPropagation();
    if (hoverDebounceRef.current) clearTimeout(hoverDebounceRef.current);
    setRevealedCardHints((prev) => ({ ...prev, [item.id]: true }));
    playHelperAudio(item);
  };

  // Card Hint Click Handler
  const handleCardHintClick = (e, item) => {
    e.stopPropagation();
    playTap(isMuted);
    setRevealedCardHints((prev) => ({ ...prev, [item.id]: true }));
    playHelperAudio(item);

    onWordResult({
      wordId: item.id,
      isMastered: false,
    });
  };

  // Answer card selection with Spaced Repetition queue
  const handleSelectOption = (item) => {
    if (isCorrect === true || isTransitioning || !targetItem) return;

    if (repeatTimerRef.current) clearInterval(repeatTimerRef.current);
    setSelectedOptionId(item.id);

    if (item.id === targetItem.id) {
      // Correct!
      setIsCorrect(true);
      setIsTransitioning(true);
      setEncouragementText(null);
      speakEnglish(item.word);
      playLegoSnap(isMuted);
      playSuccessChime(isMuted);
      playStarSparkle(isMuted);

      const hadHint = revealedCardHints[item.id];
      const wasInReview = reviewIds.has(targetItem.id);

      onWordResult({
        wordId: targetItem.id,
        isMastered: !hadHint && !wasInReview && !wobbleOptionId,
      });

      onRewardEarned({ stars: 1, bricks: 1 });

      if (onQuestionCompleted) {
        onQuestionCompleted();
      }

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#22c55e', '#FFD700', '#3b82f6'],
      });

      // Add to mastered IDs
      const nextMastered = new Set(masteredIds);
      nextMastered.add(targetItem.id);
      setMasteredIds(nextMastered);

      setTimeout(() => {
        setIsTransitioning(false);
        // Remove correctly answered item from queue (never repeat!)
        const nextQueue = questionQueue.slice(1);
        if (nextQueue.length === 0) {
          // Level Completed: All items in this level are mastered!
          if (repeatTimerRef.current) clearInterval(repeatTimerRef.current);
          setLevelCompleted(true);
          playFanfare(isMuted);
          launchConfetti();
          onRewardEarned({
            stars: currentLevel.bricksReward || 3,
            bricks: currentLevel.bricksReward || 4,
          });
        } else {
          setQuestionQueue(nextQueue);
          setupQuestionForTarget(nextQueue[0], pool, cardCountMode);
        }
      }, 1250);
    } else {
      // Incorrect answer: Spaced Repetition Re-queue
      setIsCorrect(false);
      setIsTransitioning(true);
      setWobbleOptionId(item.id);
      playGentleWobble(isMuted);

      // Friendly spoken feedback:
      const prompts = [
        `That is ${item.word}. I am asking for ${targetItem.word}.`,
        `Not this one. I am asking for ${targetItem.word}.`,
        `Good try! Find ${targetItem.word}.`,
      ];
      const chosen = prompts[Math.floor(Math.random() * prompts.length)];
      setEncouragementText(chosen);
      if (!isMuted) speakEnglish(chosen);

      onWordResult({
        wordId: targetItem.id,
        isMastered: false,
      });

      // Mark this word as needing review
      setReviewIds((prev) => new Set([...prev, targetItem.id]));

      // Spaced repetition insertion:
      // Re-insert this target item 2 questions later so Deniz can try again!
      setTimeout(() => {
        setIsTransitioning(false);
        setWobbleOptionId(null);
        setSelectedOptionId(null);
        setIsCorrect(null);
        setEncouragementText(null);

        const remaining = questionQueue.slice(1);
        let nextQueue;
        if (remaining.length === 0) {
          nextQueue = [targetItem];
        } else {
          // Re-insert 2 questions later (or at the end if fewer than 2 questions remain)
          const insertIdx = Math.min(2, remaining.length);
          nextQueue = [
            ...remaining.slice(0, insertIdx),
            targetItem,
            ...remaining.slice(insertIdx),
          ];
        }
        setQuestionQueue(nextQueue);
        setupQuestionForTarget(nextQueue[0], pool, cardCountMode);
      }, 1600);
    }
  };

  // Voice interactive answering with Gemini AI fallback
  const handleStartVoiceAnswer = () => {
    if (isListeningVoice) {
      if (voiceRecognitionRef.current) voiceRecognitionRef.current.stop();
      setIsListeningVoice(false);
      return;
    }

    if (!targetItem || isCorrect === true || isTransitioning) return;
    playTap(isMuted);
    setVoiceTranscript('');
    setVoiceFeedback(null);

    if (!isSpeechRecognitionSupported()) {
      setVoiceFeedback({
        text: 'Speech recognition is not supported in this browser. Try Chrome or Safari!',
        isError: true,
      });
      return;
    }

    const listener = createSpeechListener({
      lang: 'en-US',
      onStart: () => {
        setIsListeningVoice(true);
      },
      onResult: async ({ transcript, isFinal }) => {
        setVoiceTranscript(transcript);
        if (isFinal && transcript) {
          setIsListeningVoice(false);

          const evalResult = await evaluateKidPronunciation({
            targetPhrase: targetItem.word,
            transcript,
            childName,
            childAge,
            geminiApiKey,
          });

          if (evalResult.isAccepted) {
            setVoiceFeedback({ text: `Heard "${transcript}": Perfect! 🌟`, isSuccess: true, source: evalResult.source });
            handleSelectOption(targetItem);
          } else {
            // Check if spoken word matched one of the distractor options
            const matchedOption = options.find((opt) => {
              const optLower = opt.word.toLowerCase();
              return transcript.toLowerCase().includes(optLower);
            });

            if (matchedOption) {
              setVoiceFeedback({ text: `Heard "${transcript}"`, isSuccess: false });
              handleSelectOption(matchedOption);
            } else {
              setVoiceFeedback({ text: evalResult.feedbackEn, isSuccess: false, source: evalResult.source });
              playGentleWobble(isMuted);
            }
          }
        }
      },
      onError: (msg) => {
        setIsListeningVoice(false);
        setVoiceFeedback({ text: msg, isError: true });
      },
      onEnd: () => {
        setIsListeningVoice(false);
      },
    });

    if (listener) {
      voiceRecognitionRef.current = listener;
      listener.start();
    }
  };

  const handleRestartLevel = () => {
    playTap(isMuted);
    setLevelCompleted(false);
    setIsTransitioning(false);
    setMasteredIds(new Set());
    setReviewIds(new Set());
    if (pool.length > 0) {
      const initialQueue = shuffle(pool);
      setQuestionQueue(initialQueue);
      setupQuestionForTarget(initialQueue[0], pool, cardCountMode);
    }
  };

  const currentLevelIdx = curriculumLevels.findIndex((l) => l.id === selectedLevelId);
  const nextLevel = curriculumLevels[currentLevelIdx + 1];

  const renderIcon = (iconName, className = 'w-12 h-12') => {
    const IconComponent = ICON_MAP[iconName] || ICON_MAP.Box;
    return <IconComponent className={className} />;
  };

  const isReviewQuestion = targetItem && reviewIds.has(targetItem.id);

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-6">
      {/* Early-Reader Control Bar: Language Helper & Difficulty Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 bg-white/90 backdrop-blur-md rounded-2xl border-3 border-slate-800 p-2 sm:p-3 shadow-md">
        {/* Helper Language Switcher (German 🇩🇪 / Turkish 🇹🇷 / Both 🌟) */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-black uppercase text-slate-500 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Hint:</span>
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-300">
            <button
              onClick={() => handleSetHelperLanguage('both')}
              className={`px-2 py-1 rounded-lg text-xs font-black transition-all ${
                helperLanguage === 'both'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Both German and Turkish hints"
            >
              🇩🇪 + 🇹🇷 Both
            </button>
            <button
              onClick={() => handleSetHelperLanguage('de')}
              className={`px-2 py-1 rounded-lg text-xs font-black transition-all ${
                helperLanguage === 'de'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="German hints"
            >
              🇩🇪 Deutsch
            </button>
            <button
              onClick={() => handleSetHelperLanguage('tr')}
              className={`px-2 py-1 rounded-lg text-xs font-black transition-all ${
                helperLanguage === 'tr'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Turkish hints"
            >
              🇹🇷 Türkçe
            </button>
          </div>
        </div>

        {/* Choice Density Mode (Junior 2 Cards vs Master 4 Cards vs Superstar 6 Cards) */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-black uppercase text-slate-500">Cards:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-300">
            <button
              onClick={() => handleToggleCardMode(2)}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                cardCountMode === 2 ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Junior 2-card mode for early readers"
            >
              <span>👶 2</span>
            </button>
            <button
              onClick={() => handleToggleCardMode(4)}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                cardCountMode === 4 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Master 4-card mode"
            >
              <span>🧱 4</span>
            </button>
            <button
              onClick={() => handleToggleCardMode(6)}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                cardCountMode === 6 ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Superstar 6-card mode"
            >
              <span>🌟 6</span>
            </button>
          </div>
        </div>
      </div>

      {/* Level Selector Badges for all 7 levels */}
      <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-2.5 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-none">
        {curriculumLevels.map((lvl) => {
          const isCurrent = lvl.id === selectedLevelId;
          const emoji = LEVEL_EMOJIS[lvl.number] || '⭐';
          return (
            <button
              key={lvl.id}
              onClick={() => {
                playTap(isMuted);
                setSelectedLevelId(lvl.id);
              }}
              className={`
                min-h-[44px] flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2 rounded-2xl font-display font-black text-xs sm:text-sm
                transition-all duration-100 whitespace-nowrap cursor-pointer shadow-sm
                ${
                  isCurrent
                    ? `bg-gradient-to-r ${lvl.themeColor} text-white border-2 border-b-4 ${lvl.borderColor} scale-105 shadow-md`
                    : 'bg-white text-slate-800 hover:bg-slate-100 border-2 border-slate-300'
                }
              `}
            >
              <span className="text-base">{emoji}</span>
              <span>{lvl.title}</span>
            </button>
          );
        })}

        {customWords && customWords.length > 0 && (
          <button
            onClick={() => {
              playTap(isMuted);
              setSelectedLevelId('custom');
            }}
            className={`
              min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-2xl font-display font-black text-xs sm:text-sm
              transition-all duration-100 whitespace-nowrap cursor-pointer shadow-sm
              ${
                selectedLevelId === 'custom'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-2 border-b-4 border-purple-700 scale-105 shadow-md'
                  : 'bg-white text-slate-800 hover:bg-slate-100 border-2 border-slate-300'
              }
            `}
          >
            <span>⭐</span>
            <span>Custom ({customWords.length})</span>
          </button>
        )}
      </div>

      {/* Main Game Screen */}
      {!levelCompleted && targetItem ? (
        <div className="bg-white rounded-3xl border-4 sm:border-6 border-slate-900 shadow-2xl p-4 sm:p-7 relative overflow-hidden">
          {/* Header Progress & Mastery Tracker */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 bg-yellow-400 text-slate-950 border-2 border-yellow-600 rounded-xl font-display font-black text-xs sm:text-sm shadow-xs flex items-center gap-1.5">
                <span>{LEVEL_EMOJIS[currentLevel.number] || '⭐'}</span>
                <span>LEVEL {currentLevel.number || 1}</span>
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-600">
                Mastered: <span className="text-emerald-700 font-black">{masteredIds.size}</span> / {pool.length}
              </span>
              {isReviewQuestion && (
                <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded-full font-black text-[11px] animate-pulse flex items-center gap-1">
                  <span>🔄 Spaced Review</span>
                </span>
              )}
            </div>

            {/* Visual Progress Bar (Mastered / Total) */}
            <div className="flex items-center gap-2">
              <div className="w-24 sm:w-36 h-3.5 bg-slate-200 rounded-full overflow-hidden border border-slate-400">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, (masteredIds.size / (pool.length || 1)) * 100)}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                {Math.round((masteredIds.size / (pool.length || 1)) * 100)}%
              </span>
            </div>
          </div>

          {/* Educational Hero Prompt Card with Phonics, Clue & Spoken Audio */}
          <div className="bg-gradient-to-b from-amber-100 to-amber-50 rounded-3xl p-4 sm:p-6 border-3 border-amber-400 shadow-inner mb-6 text-center flex flex-col items-center relative">
            {/* Multi-Dimensional Learning Header */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
              <span className="px-3 py-1 bg-amber-200/90 text-amber-950 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                🎧 Listen & Find, {childName}!
              </span>

              {/* Phonics Initial Letter & Sound Badge */}
              {targetItem.phonicsLetter && (
                <span className="px-2.5 py-1 bg-purple-100 text-purple-900 border border-purple-300 rounded-full font-black text-xs flex items-center gap-1 shadow-2xs">
                  <span className="text-sm font-mono font-black text-purple-700">
                    🔤 Starts with {targetItem.phonicsLetter}
                  </span>
                  {targetItem.phonicsSound && (
                    <span className="text-purple-600 font-mono">[{targetItem.phonicsSound}]</span>
                  )}
                </span>
              )}

              {/* Spaced Review Tag */}
              {isReviewQuestion && (
                <span className="px-2.5 py-1 bg-amber-200 text-amber-950 border border-amber-400 rounded-full font-black text-xs flex items-center gap-1 shadow-2xs">
                  <span>💪 You got this, Deniz!</span>
                </span>
              )}
            </div>

            {/* Big Prominent Speaker Button */}
            <button
              onClick={handleReplayEnglish}
              className={`
                group relative my-2 min-h-[76px] min-w-[240px] sm:min-w-[300px] flex items-center justify-center gap-3 px-7 py-4 rounded-3xl
                bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-display font-black text-2xl sm:text-3xl
                border-4 border-b-8 border-red-800 active:border-b-2 active:translate-y-1.5 transition-all shadow-xl
                cursor-pointer select-none
                ${isSpeaking ? 'ring-4 ring-yellow-400 scale-105' : ''}
              `}
              title="Tap to hear English word again"
            >
              <div className="absolute -top-2.5 left-8 w-4 h-4 rounded-full bg-red-400 border border-red-700 shadow-sm" />
              <div className="absolute -top-2.5 right-8 w-4 h-4 rounded-full bg-red-400 border border-red-700 shadow-sm" />

              <Volume2
                className={`w-8 h-8 sm:w-10 sm:h-10 text-yellow-300 ${
                  isSpeaking ? 'animate-bounce' : 'group-hover:scale-110'
                }`}
              />

              {/* Syllable-formatted English Word */}
              <div className="flex flex-col items-start text-left">
                <span className="tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] leading-tight">
                  {targetItem.word}
                </span>
                {targetItem.syllables && targetItem.syllables !== targetItem.word && (
                  <span className="text-[11px] font-mono tracking-widest text-yellow-200 font-bold -mt-0.5">
                    {targetItem.syllables}
                  </span>
                )}
              </div>

              {/* Emoji Anchor for Visual Reinforcement */}
              {targetItem.emoji && <span className="text-2xl sm:text-3xl ml-1">{targetItem.emoji}</span>}
            </button>

            {/* Educational Clue / Real-World Trait Tag */}
            {targetItem.clue && (
              <div className="mt-2 px-3.5 py-1.5 bg-white/95 border border-amber-300 rounded-2xl max-w-md shadow-2xs">
                <p className="text-xs sm:text-sm font-bold text-slate-700 italic">
                  💡 {childName}&apos;s Clue:{' '}
                  <span className="font-semibold text-slate-900 not-italic">"{targetItem.clue}"</span>
                </p>
              </div>
            )}

            {/* Ask Dad Ege & Mom Melis Curiosity Box */}
            {targetItem.dadPrompt && (
              <div className="mt-2.5 w-full max-w-md bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border-2 border-blue-300 rounded-2xl p-2.5 sm:p-3 shadow-xs text-left flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs text-lg">
                  👨‍🔬
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider">
                      Ask Dad Ege / Babana Sor:
                    </span>
                    <button
                      type="button"
                      onClick={() => speakEnglish(targetItem.dadPrompt)}
                      className="px-2 py-0.5 bg-white border border-blue-200 text-blue-700 hover:text-blue-900 rounded-md text-[10px] font-bold flex items-center gap-1 hover:bg-blue-100 transition-colors shadow-2xs"
                      title="Hear the curiosity question"
                    >
                      <Volume2 className="w-3 h-3 text-blue-600" />
                      <span>Hear 🔊</span>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm font-black text-slate-800 leading-snug">
                    "{targetItem.dadPrompt}"
                  </p>
                  <span className="text-[10px] font-bold text-indigo-600 block mt-0.5">
                    👉 Go ask Dad Ege or Mom Melis this cool question!
                  </span>
                </div>
              </div>
            )}

            {/* Bilingual Meaning Helper Bar (DE / TR) */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              {(helperLanguage === 'both' || helperLanguage === 'de') && targetItem.translationDe && (
                <button
                  type="button"
                  onClick={() => speakGerman(targetItem.translationDe)}
                  className="px-3 py-1 rounded-xl bg-white border-2 border-amber-300 text-slate-800 text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-2xs hover:bg-amber-100 transition-colors"
                  title="Auf Deutsch anhören"
                >
                  <span>🇩🇪 {targetItem.translationDe}</span>
                  <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                </button>
              )}

              {(helperLanguage === 'both' || helperLanguage === 'tr') && targetItem.translation && (
                <button
                  type="button"
                  onClick={() => speakTurkish(targetItem.translation)}
                  className="px-3 py-1 rounded-xl bg-white border-2 border-amber-300 text-slate-800 text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-2xs hover:bg-amber-100 transition-colors"
                  title="Türkçe dinle"
                >
                  <span>🇹🇷 {targetItem.translation}</span>
                  <Volume2 className="w-3.5 h-3.5 text-red-600" />
                </button>
              )}
            </div>

            {/* Interactive Voice Answer Button (Hands-free voice recognition with Gemini AI) */}
            <div className="mt-3 flex flex-col items-center gap-1.5 w-full max-w-xs">
              <button
                type="button"
                onClick={handleStartVoiceAnswer}
                disabled={isCorrect === true || isTransitioning}
                className={`
                  w-full py-2.5 px-4 rounded-2xl font-display font-black text-xs sm:text-sm
                  transition-all duration-200 flex items-center justify-center gap-2 shadow-md cursor-pointer select-none
                  border-2 border-b-4 active:border-b-2 active:translate-y-1
                  ${
                    isListeningVoice
                      ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-800 animate-pulse ring-4 ring-rose-300'
                      : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-900'
                  }
                `}
                title="Speak the English word into your microphone"
              >
                {isListeningVoice ? (
                  <>
                    <Radio className="w-4 h-4 text-white animate-spin" />
                    <span>Listening to {childName}... 🎙️</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-amber-300" />
                    <span>Say it Out Loud! 🎙️</span>
                  </>
                )}
              </button>

              {voiceTranscript && (
                <div className="text-[11px] font-bold text-purple-900 bg-purple-100 px-3 py-1 rounded-xl border border-purple-200 animate-scaleUp">
                  Heard: "{voiceTranscript}"
                </div>
              )}

              {voiceFeedback && (
                <div
                  className={`text-[11px] font-black px-3 py-1 rounded-xl border animate-scaleUp flex items-center gap-1 ${
                    voiceFeedback.isSuccess
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  {voiceFeedback.source === 'gemini' && <Bot className="w-3.5 h-3.5 text-purple-600" />}
                  <span>{voiceFeedback.text}</span>
                </div>
              )}
            </div>

            {/* Friendly encouragement banner if tried recently */}
            {encouragementText && !isCorrect && (
              <div className="mt-3 px-4 py-1.5 bg-amber-200 border-2 border-amber-400 rounded-full text-xs sm:text-sm font-black text-amber-950 animate-bounce">
                {encouragementText}
              </div>
            )}
          </div>

          {/* High-Contrast, Chunky Early-Reader Answer Cards Grid (Supports 2, 4, or 6 cards) */}
          <div
            className={`grid gap-3.5 sm:gap-5 ${
              cardCountMode === 2
                ? 'grid-cols-2 max-w-2xl mx-auto'
                : cardCountMode === 4
                  ? 'grid-cols-2 max-w-3xl mx-auto'
                  : 'grid-cols-2 sm:grid-cols-3 max-w-4xl mx-auto'
            }`}
          >
            {options.map((item) => {
              const isSelected = selectedOptionId === item.id;
              const isWobbling = wobbleOptionId === item.id;
              const isThisCorrect = isCorrect && isSelected;
              const isHintRevealed = revealedCardHints[item.id];
              const cardStyle = getCardStyle(item);

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectOption(item)}
                  onMouseEnter={() => handleCardHover(item)}
                  onPointerEnter={() => handleCardHover(item)}
                  style={{
                    backgroundColor: cardStyle.bgColor,
                    borderColor: cardStyle.borderColor,
                  }}
                  className={`
                    group relative rounded-3xl p-3 sm:p-5
                    flex flex-col items-center justify-center text-center
                    border-4 border-b-8 cursor-pointer select-none
                    transition-all duration-150 shadow-lg
                    ${
                      cardCountMode === 6
                        ? 'min-h-[155px] sm:min-h-[180px]'
                        : cardCountMode === 4
                          ? 'min-h-[170px] sm:min-h-[195px]'
                          : 'min-h-[195px] sm:min-h-[225px]'
                    }
                    ${isSelected ? 'scale-102 border-b-4 translate-y-1' : 'hover:-translate-y-1 hover:shadow-2xl'}
                    ${isThisCorrect ? 'ring-6 ring-emerald-400 brightness-110 animate-brick-snap' : ''}
                    ${isWobbling ? 'animate-wobble ring-4 ring-rose-400' : ''}
                  `}
                >
                  {/* Real 3D Top Studs matching card color */}
                  <div className="absolute -top-3 left-0 right-0 flex justify-center gap-3 sm:gap-4 pointer-events-none">
                    <div
                      className="w-4 sm:w-5 h-3 sm:h-3.5 rounded-t-lg border-2 border-b-0 shadow-sm"
                      style={{
                        backgroundColor: cardStyle.bgColor,
                        borderColor: cardStyle.borderColor,
                      }}
                    />
                    <div
                      className="w-4 sm:w-5 h-3 sm:h-3.5 rounded-t-lg border-2 border-b-0 shadow-sm"
                      style={{
                        backgroundColor: cardStyle.bgColor,
                        borderColor: cardStyle.borderColor,
                      }}
                    />
                  </div>

                  {/* Phonics Initial Letter Badge on Card */}
                  {item.phonicsLetter && (
                    <div
                      className="absolute top-2.5 left-2.5 min-w-[28px] h-7 px-1.5 rounded-xl bg-black/45 text-yellow-300 font-mono font-black text-xs border border-white/30 flex items-center justify-center shadow-xs"
                      title={`Starts with letter ${item.phonicsLetter}`}
                    >
                      {item.phonicsLetter}
                    </div>
                  )}

                  {/* Dedicated Child-Friendly Hint / Kulaklık Button */}
                  <button
                    type="button"
                    onClick={(e) => handleCardHintClick(e, item)}
                    onMouseEnter={(e) => handleHintHover(e, item)}
                    onPointerEnter={(e) => handleHintHover(e, item)}
                    className="
                      absolute top-2.5 right-2.5 min-w-[42px] min-h-[42px] p-2 rounded-2xl
                      bg-slate-950/85 hover:bg-slate-950 text-yellow-300
                      border-2 border-yellow-400/80 shadow-md
                      flex items-center justify-center transition-transform active:scale-95 cursor-pointer z-10
                    "
                    title="İpucu / Hilfe (Deutsch & Türkçe)"
                    aria-label="Hint in German or Turkish"
                  >
                    <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
                  </button>

                  {/* Solid White Icon Capsule - Large Picture for Early Readers */}
                  <div
                    className={`
                    rounded-2xl bg-white border-2 border-white/90 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center relative
                    ${
                      cardCountMode === 6
                        ? 'w-14 h-14 sm:w-16 sm:h-16 my-1'
                        : cardCountMode === 4
                          ? 'w-16 h-16 sm:w-20 sm:h-20 my-1.5'
                          : 'w-20 h-20 sm:w-24 sm:h-24 my-2'
                    }
                  `}
                  >
                    <div style={{ color: cardStyle.bgColor }}>
                      {renderIcon(
                        item.icon,
                        cardCountMode === 6
                          ? 'w-8 h-8 sm:w-10 sm:h-10'
                          : cardCountMode === 4
                            ? 'w-10 h-10 sm:w-14 sm:h-14'
                            : 'w-12 h-12 sm:w-16 sm:h-16'
                      )}
                    </div>
                    {/* Visual Emoji Badge Anchor */}
                    {item.emoji && (
                      <span className="absolute -bottom-2 -right-2 text-lg sm:text-2xl drop-shadow-sm">
                        {item.emoji}
                      </span>
                    )}
                  </div>

                  {/* Large English Word Label */}
                  <span
                    style={{ textShadow: cardStyle.textShadow }}
                    className={`font-display font-black tracking-wide leading-tight mt-1 ${
                      cardCountMode === 6
                        ? 'text-lg sm:text-2xl'
                        : cardCountMode === 4
                          ? 'text-xl sm:text-3xl'
                          : 'text-2xl sm:text-4xl'
                    } ${cardStyle.textColor}`}
                  >
                    {item.word}
                  </span>

                  {/* Early-Reader Syllables Breakdown */}
                  {item.syllables && item.syllables !== item.word && (
                    <span className="text-[10px] sm:text-[11px] font-mono tracking-wider font-bold opacity-90 text-white/90 bg-black/25 px-2 py-0.5 rounded-md mt-0.5">
                      {item.syllables}
                    </span>
                  )}

                  {/* Bilingual Translation Chip (Revealed on hover or tap) */}
                  {isHintRevealed && (
                    <div className="mt-2 px-2.5 py-1 rounded-xl bg-slate-950 text-yellow-300 text-xs sm:text-sm font-black border border-yellow-400 shadow-md animate-fadeIn flex items-center gap-1.5">
                      {helperLanguage === 'de' && <span>🇩🇪 {item.translationDe || item.translation}</span>}
                      {helperLanguage === 'tr' && <span>🇹🇷 {item.translation}</span>}
                      {helperLanguage === 'both' && (
                        <span>
                          🇩🇪 {item.translationDe || item.word} • 🇹🇷 {item.translation}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Correct Positive Feedback Banner */}
          {isCorrect === true && (
            <div className="mt-5 p-3.5 bg-emerald-100 border-3 border-emerald-500 rounded-2xl text-emerald-900 font-display font-black text-center text-sm sm:text-base flex items-center justify-center gap-2 animate-bounce shadow-sm">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              <span>SUPER, {childName.toUpperCase()}! You mastered this word! +1 Star ⭐ and +1 Brick 🧱</span>
            </div>
          )}
        </div>
      ) : levelCompleted ? (
        /* Victory Screen */
        <div className="bg-white rounded-3xl border-4 sm:border-6 border-slate-900 shadow-2xl p-6 sm:p-10 text-center relative overflow-hidden animate-fadeIn">
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500" />

          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-yellow-100 border-4 border-yellow-400 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-lg animate-bounce">
            <Award className="w-12 h-12 sm:w-14 sm:h-14 text-yellow-500" />
          </div>

          <span className="px-4 py-1.5 bg-yellow-400 text-slate-950 rounded-full font-display font-black text-xs uppercase tracking-wider shadow-xs">
            Level Complete! 🎉
          </span>

          <h2 className="text-2xl sm:text-4xl font-black font-display text-slate-900 mt-2 mb-1">
            GREAT JOB, {childName.toUpperCase()}!
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-bold max-w-md mx-auto mb-6">
            You mastered all {pool.length} words in <span className="text-red-600 font-black">{currentLevel.title}</span>! Dad Ege & Mom Melis are super proud of you! 🎉
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-6">
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 flex flex-col items-center">
              <Sparkles className="w-6 h-6 text-yellow-500 mb-1" />
              <span className="text-xl font-black font-mono text-slate-800">+{currentLevel.bricksReward || 3}</span>
              <span className="text-xs font-bold text-slate-500">Stars</span>
            </div>
            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-3 flex flex-col items-center">
              <span className="text-2xl mb-1">🏆</span>
              <span className="text-xl font-black font-mono text-slate-800">+{currentLevel.bricksReward || 4}</span>
              <span className="text-xs font-bold text-slate-500">Points</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleRestartLevel}
              className="w-full sm:w-auto min-h-[56px] px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-black rounded-2xl border-2 border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>

            {nextLevel && (
              <button
                onClick={() => {
                  playTap(isMuted);
                  setSelectedLevelId(nextLevel.id);
                }}
                className="w-full sm:w-auto min-h-[56px] px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-display font-black rounded-2xl border-2 border-b-4 border-emerald-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Next Level: {nextLevel.title}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border-4 border-slate-800 p-8 text-center">
          <p className="text-base font-bold text-slate-600">
            No words in this pack yet. Select another level above or ask grown-ups to add custom words!
          </p>
        </div>
      )}
    </div>
  );
}
