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
  HelpCircle,
  Palette,
  Cat,
  Rocket,
  PlusCircle,
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
} from 'lucide-react';
import { speakEnglish, speakTurkish, speakEncouragement, stopSpeech } from '../utils/speech';
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
};

// Safe color and contrast mapper to ensure 100% legibility on all backgrounds
function getCardStyle(item) {
  const hex = item.colorHex || '#E52521';
  const isLight = hex === '#FFD700' || hex === '#EAB308' || hex === '#FACC15' || item.word === 'Yellow' || item.word === 'Star' || item.word === 'Truck';

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

export default function GameArena({
  curriculumLevels,
  customWords,
  onRewardEarned,
  onWordResult,
  onNavigateToWorkshop,
  onQuestionCompleted,
  isAdventureStarted = true,
  isMuted,
}) {
  const [selectedLevelId, setSelectedLevelId] = useState(curriculumLevels[0].id);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [targetItem, setTargetItem] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [wobbleOptionId, setWobbleOptionId] = useState(null);
  const [revealedCardHints, setRevealedCardHints] = useState({});
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [encouragementText, setEncouragementText] = useState(null);

  const hoverDebounceRef = useRef(null);
  const repeatTimerRef = useRef(null);

  const currentLevel = curriculumLevels.find(l => l.id === selectedLevelId) || {
    id: 'custom',
    number: 4,
    title: 'Custom Words',
    titleTr: 'Özel Kelimeler',
    description: 'Words added by mom and dad!',
    themeColor: 'from-purple-500 to-indigo-500',
    borderColor: 'border-purple-600',
    icon: 'PlusCircle',
    badge: '🌟 Superstar',
    bricksReward: Math.max(3, Math.min(customWords.length, 6)),
    items: customWords,
  };

  const pool = currentLevel.items || [];

  const shuffle = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const launchConfetti = useCallback(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#E52521', '#0055BF', '#FFD700', '#237841', '#FF7F00', '#8A2BE2'],
    });
  }, []);

  // Periodic repetition while staying on the question
  const resetRepeatTimer = useCallback((word) => {
    if (repeatTimerRef.current) {
      clearInterval(repeatTimerRef.current);
    }
    if (!word) return;

    // While child stays on this question, repeat pronunciation every 7s
    repeatTimerRef.current = setInterval(() => {
      setIsSpeaking(true);
      speakEnglish(word, () => setIsSpeaking(false));
    }, 7000);
  }, []);

  const setupQuestion = useCallback((index, currentPool) => {
    if (!currentPool || currentPool.length === 0) return;
    if (index >= currentPool.length) {
      if (repeatTimerRef.current) clearInterval(repeatTimerRef.current);
      setLevelCompleted(true);
      playFanfare(isMuted);
      launchConfetti();
      onRewardEarned({
        stars: currentLevel.bricksReward || 3,
        bricks: currentLevel.bricksReward || 4,
      });
      return;
    }

    const current = currentPool[index];
    setTargetItem(current);
    setSelectedOptionId(null);
    setIsCorrect(null);
    setWobbleOptionId(null);
    setRevealedCardHints({});
    setEncouragementText(null);

    const otherItems = currentPool.filter(item => item.id !== current.id);
    const distractors = shuffle(otherItems).slice(0, 3);
    const questionChoices = shuffle([current, ...distractors]);
    setOptions(questionChoices);

    // If adventure has started, pronounce immediately and begin stay-loop!
    if (isAdventureStarted) {
      setIsSpeaking(true);
      speakEnglish(current.word, () => setIsSpeaking(false));
      resetRepeatTimer(current.word);
    }
  }, [currentLevel, isMuted, launchConfetti, onRewardEarned, isAdventureStarted, resetRepeatTimer]);

  useEffect(() => {
    setQuestionIndex(0);
    setLevelCompleted(false);
    if (pool.length > 0) {
      setupQuestion(0, pool);
    }
    return () => {
      if (repeatTimerRef.current) clearInterval(repeatTimerRef.current);
    };
  }, [selectedLevelId, pool.length]);

  // When adventure starts (welcome screen dismissed), immediately play target question
  useEffect(() => {
    if (isAdventureStarted && targetItem && !levelCompleted && isCorrect === null) {
      setIsSpeaking(true);
      speakEnglish(targetItem.word, () => setIsSpeaking(false));
      resetRepeatTimer(targetItem.word);
    }
  }, [isAdventureStarted]);

  // Replay English voice manually
  const handleReplayEnglish = () => {
    if (!targetItem) return;
    playTap(isMuted);
    setIsSpeaking(true);
    speakEnglish(targetItem.word, () => setIsSpeaking(false));
    resetRepeatTimer(targetItem.word);
  };

  // While staying/hovering over each card, play its English word without waiting for click!
  const handleCardHover = (item) => {
    if (isCorrect === true) return;
    if (hoverDebounceRef.current) clearTimeout(hoverDebounceRef.current);

    hoverDebounceRef.current = setTimeout(() => {
      speakEnglish(item.word);
    }, 100);
  };

  // While staying/hovering over the 🎧 headphone icon, play Turkish hint without waiting for click!
  const handleHintHover = (e, item) => {
    e.stopPropagation();
    if (hoverDebounceRef.current) clearTimeout(hoverDebounceRef.current);
    setRevealedCardHints(prev => ({ ...prev, [item.id]: true }));
    speakTurkish(item.translation);
  };

  // Dedicated Card Hint Click Handler
  const handleCardHintClick = (e, item) => {
    e.stopPropagation();
    playTap(isMuted);
    setRevealedCardHints(prev => ({ ...prev, [item.id]: true }));
    speakTurkish(item.translation);

    onWordResult({
      wordId: item.id,
      isMastered: false,
    });
  };

  // Answer card click
  const handleSelectOption = (item) => {
    if (isCorrect === true || !targetItem) return;

    if (repeatTimerRef.current) clearInterval(repeatTimerRef.current);
    setSelectedOptionId(item.id);

    if (item.id === targetItem.id) {
      // Correct! Speak the word and celebrate!
      setIsCorrect(true);
      setEncouragementText(null);
      speakEnglish(item.word);
      playLegoSnap(isMuted);
      playSuccessChime(isMuted);
      playStarSparkle(isMuted);

      const hadHint = revealedCardHints[item.id];
      onWordResult({
        wordId: targetItem.id,
        isMastered: !hadHint && !wobbleOptionId,
      });

      onRewardEarned({ stars: 1, bricks: 1 });

      if (onQuestionCompleted) {
        onQuestionCompleted();
      }

      confetti({
        particleCount: 35,
        spread: 55,
        origin: { y: 0.7 },
        colors: ['#22c55e', '#FFD700', '#3b82f6'],
      });

      setTimeout(() => {
        const nextIdx = questionIndex + 1;
        setQuestionIndex(nextIdx);
        setupQuestion(nextIdx, pool);
      }, 1400);
    } else {
      // Gentle error handling: NO red X, NO penalty buzzer!
      setIsCorrect(false);
      setWobbleOptionId(item.id);
      playGentleWobble(isMuted);

      const prompts = ['Try again! 🧱', 'Almost there!', 'You can do it!', 'Good try! ⭐'];
      const chosen = prompts[Math.floor(Math.random() * prompts.length)];
      setEncouragementText(chosen);
      speakEncouragement();

      onWordResult({
        wordId: targetItem.id,
        isMastered: false,
      });

      setTimeout(() => {
        setWobbleOptionId(null);
        if (targetItem) resetRepeatTimer(targetItem.word);
      }, 500);
    }
  };

  const handleRestartLevel = () => {
    playTap(isMuted);
    setQuestionIndex(0);
    setLevelCompleted(false);
    setupQuestion(0, pool);
  };

  const renderIcon = (iconName, className = 'w-12 h-12') => {
    const IconComponent = ICON_MAP[iconName] || ICON_MAP.Box;
    return <IconComponent className={className} />;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-6">
      
      {/* Level Selector Badges */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-none">
        {curriculumLevels.map((lvl) => {
          const isCurrent = lvl.id === selectedLevelId;
          return (
            <button
              key={lvl.id}
              onClick={() => {
                playTap(isMuted);
                setSelectedLevelId(lvl.id);
              }}
              className={`
                min-h-[48px] flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl font-display font-black text-xs sm:text-sm
                transition-all duration-100 whitespace-nowrap cursor-pointer shadow-sm
                ${isCurrent
                  ? `bg-gradient-to-r ${lvl.themeColor} text-white border-2 border-b-4 ${lvl.borderColor} scale-105 shadow-md`
                  : 'bg-white text-slate-800 hover:bg-slate-100 border-2 border-slate-300'}
              `}
            >
              <span className="text-base">{lvl.number === 1 ? '🎨' : lvl.number === 2 ? '🦁' : '🚀'}</span>
              <span>{lvl.title}</span>
            </button>
          );
        })}

        {customWords.length > 0 && (
          <button
            onClick={() => {
              playTap(isMuted);
              setSelectedLevelId('custom');
            }}
            className={`
              min-h-[48px] flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl font-display font-black text-xs sm:text-sm
              transition-all duration-100 whitespace-nowrap cursor-pointer shadow-sm
              ${selectedLevelId === 'custom'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-2 border-b-4 border-purple-700 scale-105 shadow-md'
                : 'bg-white text-slate-800 hover:bg-slate-100 border-2 border-slate-300'}
            `}
          >
            <span>⭐</span>
            <span>Custom Words ({customWords.length})</span>
          </button>
        )}
      </div>

      {/* Main Game Screen */}
      {!levelCompleted && targetItem ? (
        <div className="bg-white rounded-3xl border-4 sm:border-6 border-slate-900 shadow-2xl p-4 sm:p-7 relative overflow-hidden">
          
          {/* Header Progress & Level Tag */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 bg-yellow-400 text-slate-950 border-2 border-yellow-600 rounded-xl font-display font-black text-xs sm:text-sm shadow-xs">
                LEVEL {currentLevel.number || 1}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-600">
                Question {questionIndex + 1} of {pool.length}
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="flex-1 max-w-[140px] sm:max-w-[200px] h-3.5 bg-slate-200 rounded-full overflow-hidden border border-slate-400">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${((questionIndex + 1) / pool.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Persistent Audio Hero Prompt Card */}
          <div className="bg-gradient-to-b from-amber-100 to-amber-50 rounded-3xl p-4 sm:p-6 border-3 border-amber-400 shadow-inner mb-6 text-center flex flex-col items-center relative">
            
            <span className="px-3 py-1 bg-amber-200/80 text-amber-950 rounded-full font-bold text-xs uppercase tracking-wider mb-2">
              🎧 Audio Challenge
            </span>

            {/* Large Speaker Replay Button */}
            <button
              onClick={handleReplayEnglish}
              className={`
                group relative my-2 min-h-[72px] min-w-[240px] sm:min-w-[280px] flex items-center justify-center gap-3 px-6 py-4 rounded-3xl
                bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-display font-black text-2xl sm:text-3xl
                border-4 border-b-8 border-red-800 active:border-b-2 active:translate-y-1.5 transition-all shadow-xl
                cursor-pointer select-none
                ${isSpeaking ? 'ring-4 ring-yellow-400 scale-105' : ''}
              `}
              title="Tap to hear English word again"
            >
              {/* Studs on top of speaker button */}
              <div className="absolute -top-2.5 left-8 w-4 h-4 rounded-full bg-red-400 border border-red-700 shadow-sm" />
              <div className="absolute -top-2.5 right-8 w-4 h-4 rounded-full bg-red-400 border border-red-700 shadow-sm" />

              <Volume2 className={`w-8 h-8 sm:w-10 sm:h-10 text-yellow-300 ${isSpeaking ? 'animate-bounce' : 'group-hover:scale-110'}`} />
              <span className="tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{targetItem.word}</span>
            </button>

            {/* Visual Speech & Phonetic Helper */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs sm:text-sm font-bold text-slate-600">
                Phonetic: <span className="font-mono font-bold text-slate-800 bg-white/80 px-2 py-0.5 rounded-md border border-amber-200">"{targetItem.phonetic}"</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                {isSpeaking ? (
                  <span className="flex items-center gap-1 animate-pulse">
                    <span>🔊 Playing voice...</span>
                  </span>
                ) : (
                  <span>🔊 Hover or tap cards to listen</span>
                )}
              </span>
            </div>

            {/* Friendly encouragement banner if tried recently */}
            {encouragementText && !isCorrect && (
              <div className="mt-3 px-4 py-1.5 bg-amber-200 border-2 border-amber-400 rounded-full text-xs sm:text-sm font-black text-amber-950 animate-bounce">
                {encouragementText}
              </div>
            )}
          </div>

          {/* High-Contrast, Chunky Lego Brick Answer Cards Grid */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
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
                    group relative min-h-[160px] sm:min-h-[190px] rounded-3xl p-4 sm:p-6
                    flex flex-col items-center justify-center text-center
                    border-4 border-b-8 cursor-pointer select-none
                    transition-all duration-150 shadow-lg
                    ${isSelected ? 'scale-102 border-b-4 translate-y-1' : 'hover:-translate-y-1 hover:shadow-2xl'}
                    ${isThisCorrect ? 'ring-6 ring-emerald-400 brightness-110 animate-brick-snap' : ''}
                    ${isWobbling ? 'animate-wobble ring-4 ring-rose-400' : ''}
                  `}
                >
                  {/* Real 3D Top Studs matching card color */}
                  <div className="absolute -top-3 left-0 right-0 flex justify-center gap-4 pointer-events-none">
                    <div
                      className="w-5 h-3.5 rounded-t-lg border-2 border-b-0 shadow-sm"
                      style={{
                        backgroundColor: cardStyle.bgColor,
                        borderColor: cardStyle.borderColor,
                      }}
                    />
                    <div
                      className="w-5 h-3.5 rounded-t-lg border-2 border-b-0 shadow-sm"
                      style={{
                        backgroundColor: cardStyle.bgColor,
                        borderColor: cardStyle.borderColor,
                      }}
                    />
                  </div>

                  {/* Dedicated Child-Friendly Hint / Kulaklık Button (Hover or Tap speaks Turkish) */}
                  <button
                    type="button"
                    onClick={(e) => handleCardHintClick(e, item)}
                    onMouseEnter={(e) => handleHintHover(e, item)}
                    onPointerEnter={(e) => handleHintHover(e, item)}
                    className="
                      absolute top-2.5 right-2.5 min-w-[48px] min-h-[48px] p-2 rounded-2xl
                      bg-slate-950/85 hover:bg-slate-950 text-yellow-300
                      border-2 border-yellow-400/80 shadow-md
                      flex items-center justify-center transition-transform active:scale-95 cursor-pointer z-10
                    "
                    title="İpucu / Türkçe Sesli Çeviri (Hover or Tap)"
                    aria-label="Turkish Hint"
                  >
                    <Headphones className="w-5 h-5 text-yellow-300" />
                  </button>

                  {/* Solid White Icon Capsule - Guarantees 100% visibility */}
                  <div className="my-2 p-3 sm:p-4 rounded-2xl bg-white border-2 border-white/90 shadow-md group-hover:scale-110 transition-transform flex items-center justify-center">
                    <div style={{ color: cardStyle.bgColor }}>
                      {renderIcon(item.icon, 'w-10 h-10 sm:w-14 sm:h-14')}
                    </div>
                  </div>

                  {/* Ultra-Clear High-Contrast English Word Label */}
                  <span
                    style={{ textShadow: cardStyle.textShadow }}
                    className={`font-display font-black text-xl sm:text-3xl tracking-wide leading-tight mt-1 ${cardStyle.textColor}`}
                  >
                    {item.word}
                  </span>

                  {/* Turkish Translation Chip */}
                  {isHintRevealed && (
                    <div className="mt-2 px-3 py-1 rounded-xl bg-slate-950 text-yellow-300 text-xs sm:text-sm font-black border border-yellow-400 shadow-md animate-fadeIn">
                      🇹🇷 {item.translation}
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
              <span>SUPER! You earned +1 Star ⭐ and +1 Lego Brick 🧱</span>
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
            GREAT JOB, MASTER BUILDER!
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-bold max-w-md mx-auto mb-6">
            You completed all challenges in <span className="text-red-600 font-black">{currentLevel.title}</span>! Let's build models in the workshop!
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-6">
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 flex flex-col items-center">
              <Sparkles className="w-6 h-6 text-yellow-500 mb-1" />
              <span className="text-xl font-black font-mono text-slate-800">+{currentLevel.bricksReward || 3}</span>
              <span className="text-xs font-bold text-slate-500">Stars</span>
            </div>
            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-3 flex flex-col items-center">
              <span className="text-2xl mb-1">🧱</span>
              <span className="text-xl font-black font-mono text-slate-800">+{currentLevel.bricksReward || 4}</span>
              <span className="text-xs font-bold text-slate-500">Bricks</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                playTap(isMuted);
                onNavigateToWorkshop();
              }}
              className="w-full sm:w-auto min-h-[56px] px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-display font-black rounded-2xl border-2 border-b-6 border-blue-900 active:border-b-2 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span>Build in Workshop 🚀</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleRestartLevel}
              className="w-full sm:w-auto min-h-[56px] px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-black rounded-2xl border-2 border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
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
