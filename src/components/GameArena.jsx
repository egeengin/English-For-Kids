import React, { useState, useEffect, useCallback } from 'react';
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
import { speakEnglish, speakTurkish, speakEncouragement } from '../utils/speech';
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

export default function GameArena({
  curriculumLevels,
  customWords,
  onRewardEarned,
  onWordResult,
  onNavigateToWorkshop,
  onQuestionCompleted,
  isMuted,
}) {
  const [selectedLevelId, setSelectedLevelId] = useState(curriculumLevels[0].id);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [targetItem, setTargetItem] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [wobbleOptionId, setWobbleOptionId] = useState(null);
  const [revealedCardHints, setRevealedCardHints] = useState({}); // { [itemId]: boolean }
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [encouragementText, setEncouragementText] = useState(null);

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

  const setupQuestion = useCallback((index, currentPool) => {
    if (!currentPool || currentPool.length === 0) return;
    if (index >= currentPool.length) {
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

    setIsSpeaking(true);
    speakEnglish(current.word, () => setIsSpeaking(false));
  }, [currentLevel, isMuted, launchConfetti, onRewardEarned]);

  useEffect(() => {
    setQuestionIndex(0);
    setLevelCompleted(false);
    if (pool.length > 0) {
      setupQuestion(0, pool);
    }
  }, [selectedLevelId, pool.length]);

  // Replay English voice
  const handleReplayEnglish = () => {
    if (!targetItem) return;
    playTap(isMuted);
    setIsSpeaking(true);
    speakEnglish(targetItem.word, () => setIsSpeaking(false));
  };

  // Dedicated Card Hint Handler (Zero penalty, dedicated headphone icon on card)
  const handleCardHintClick = (e, item) => {
    e.stopPropagation(); // Prevents card selection as an answer
    playTap(isMuted);
    setRevealedCardHints(prev => ({ ...prev, [item.id]: true }));
    speakTurkish(item.translation);

    // Track that hint was used for this item in parent analytics
    onWordResult({
      wordId: item.id,
      isMastered: false,
    });
  };

  // Desktop hover hint trigger
  const handleCardHover = (item) => {
    // Reveal tooltip on desktop
    setRevealedCardHints(prev => ({ ...prev, [item.id]: true }));
  };

  // Answer card click with gentle error psychology
  const handleSelectOption = (item) => {
    if (isCorrect === true || !targetItem) return;

    setSelectedOptionId(item.id);

    if (item.id === targetItem.id) {
      // Correct!
      setIsCorrect(true);
      setEncouragementText(null);
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
        particleCount: 30,
        spread: 50,
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

      // Friendly voice encouragement
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
                min-h-[48px] flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl font-display font-black text-xs sm:text-sm
                transition-all duration-100 whitespace-nowrap cursor-pointer
                ${isCurrent
                  ? `bg-gradient-to-r ${lvl.themeColor} text-white border-2 border-b-4 ${lvl.borderColor} scale-105 shadow-md`
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-2 border-slate-200'}
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
              min-h-[48px] flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl font-display font-black text-xs sm:text-sm
              transition-all duration-100 whitespace-nowrap cursor-pointer
              ${selectedLevelId === 'custom'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-2 border-b-4 border-purple-700 scale-105 shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-2 border-slate-200'}
            `}
          >
            <span>⭐</span>
            <span>Custom Words ({customWords.length})</span>
          </button>
        )}
      </div>

      {/* Main Game Screen */}
      {!levelCompleted && targetItem ? (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border-4 sm:border-6 border-slate-900 shadow-2xl p-4 sm:p-7 relative overflow-hidden">
          
          {/* Header Progress & Level Tag */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-yellow-400 text-slate-900 border-2 border-yellow-600 rounded-xl font-display font-black text-xs sm:text-sm">
                LEVEL {currentLevel.number || 1}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-500">
                Question {questionIndex + 1} of {pool.length}
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="flex-1 max-w-[140px] sm:max-w-[200px] h-3.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${((questionIndex + 1) / pool.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Persistent Audio Hero Prompt Card */}
          <div className="bg-amber-50/90 rounded-2xl p-4 sm:p-5 border-3 border-amber-300 shadow-inner mb-5 text-center flex flex-col items-center relative">
            
            <p className="text-xs sm:text-sm font-bold text-amber-900 uppercase tracking-wider mb-1">
              Tap Speaker to Listen:
            </p>

            {/* Persistent Large Speaker Replay Button (min 64x64 touch target) */}
            <button
              onClick={handleReplayEnglish}
              className={`
                group relative my-2 min-h-[64px] min-w-[220px] flex items-center justify-center gap-3 px-6 py-3.5 rounded-3xl
                bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-display font-black text-xl sm:text-2xl
                border-3 border-b-6 border-red-700 active:border-b-2 active:translate-y-1 transition-all shadow-lg
                cursor-pointer select-none
                ${isSpeaking ? 'ring-4 ring-red-300 scale-105' : ''}
              `}
              title="Tap to hear English word again"
            >
              {/* Studs on top of speaker button */}
              <div className="absolute -top-2 left-6 w-3.5 h-3.5 rounded-full bg-red-400 border border-red-600" />
              <div className="absolute -top-2 right-6 w-3.5 h-3.5 rounded-full bg-red-400 border border-red-600" />

              <Volume2 className={`w-8 h-8 text-yellow-300 ${isSpeaking ? 'animate-bounce' : 'group-hover:scale-110'}`} />
              <span className="tracking-wide">{targetItem.word}</span>
            </button>

            <span className="text-[11px] font-bold text-slate-500 mt-0.5">
              🔊 Hear English pronunciation anytime
            </span>

            {/* Friendly encouragement banner if tried recently */}
            {encouragementText && !isCorrect && (
              <div className="mt-2.5 px-3 py-1 bg-amber-100 border border-amber-300 rounded-full text-xs font-bold text-amber-900 animate-fadeIn">
                {encouragementText}
              </div>
            )}
          </div>

          {/* Child-Friendly Large Touch Answer Cards (Min 64x64 touch targets, generous gap-4 sm:gap-6) */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {options.map((item) => {
              const isSelected = selectedOptionId === item.id;
              const isWobbling = wobbleOptionId === item.id;
              const isThisCorrect = isCorrect && isSelected;
              const isHintRevealed = revealedCardHints[item.id];

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectOption(item)}
                  onMouseEnter={() => handleCardHover(item)}
                  className={`
                    group relative min-h-[140px] sm:min-h-[160px] rounded-3xl p-4 sm:p-6
                    flex flex-col items-center justify-center text-center
                    border-3 sm:border-4 border-b-6 sm:border-b-8 cursor-pointer select-none
                    transition-all duration-150 lego-baseplate-pattern
                    ${item.bgClass || 'bg-white'}
                    ${item.borderClass || 'border-slate-400'}
                    ${isSelected ? 'scale-102 border-b-3 translate-y-1' : 'hover:-translate-y-1 hover:shadow-xl'}
                    ${isThisCorrect ? 'ring-4 ring-emerald-400 brightness-110 animate-brick-snap' : ''}
                    ${isWobbling ? 'animate-wobble' : ''}
                  `}
                >
                  {/* Dedicated Child-Friendly Hint / Kulaklık Icon (Explicit Mobile & Desktop Trigger) */}
                  <button
                    type="button"
                    onClick={(e) => handleCardHintClick(e, item)}
                    className="
                      absolute top-2 right-2 min-w-[48px] min-h-[48px] p-2 rounded-2xl
                      bg-black/30 hover:bg-black/45 text-white/90 hover:text-white
                      flex items-center justify-center backdrop-blur-xs transition-transform active:scale-95
                    "
                    title="İpucu / Türkçe Sesli Çeviri"
                    aria-label="Turkish Hint"
                  >
                    <Headphones className="w-5 h-5 text-amber-300" />
                  </button>

                  {/* Decorative Studs */}
                  <div className="absolute top-2 left-3 flex gap-1.5 pointer-events-none">
                    <div
                      className="w-3 h-3 rounded-full border border-black/20 shadow-inner"
                      style={{ backgroundColor: item.studColor || '#cbd5e1' }}
                    />
                    <div
                      className="w-3 h-3 rounded-full border border-black/20 shadow-inner"
                      style={{ backgroundColor: item.studColor || '#cbd5e1' }}
                    />
                  </div>

                  {/* Large Icon Representation */}
                  <div className="my-1.5 sm:my-2 p-2.5 sm:p-3.5 rounded-2xl bg-white/20 backdrop-blur-xs border-2 border-white/30 group-hover:scale-105 transition-transform">
                    {renderIcon(item.icon, 'w-10 h-10 sm:w-14 sm:h-14 text-current')}
                  </div>

                  {/* English Word Label */}
                  <span className="font-display font-black text-lg sm:text-2xl tracking-wide leading-tight drop-shadow-xs">
                    {item.word}
                  </span>

                  {/* Turkish Translation Chip (Shown on explicit hint button tap or desktop hover) */}
                  {isHintRevealed && (
                    <div className="mt-1 px-2.5 py-0.5 rounded-full bg-black/40 text-amber-200 text-xs font-bold animate-fadeIn">
                      🇹🇷 {item.translation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Correct Positive Feedback Message */}
          {isCorrect === true && (
            <div className="mt-4 p-3 bg-emerald-100 border-2 border-emerald-400 rounded-2xl text-emerald-800 font-display font-black text-center text-sm sm:text-base flex items-center justify-center gap-2 animate-bounce">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>AWESOME! +1 Star ⭐ and +1 Lego Brick 🧱 collected!</span>
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

          <span className="px-4 py-1.5 bg-yellow-400 text-slate-900 rounded-full font-display font-black text-xs uppercase tracking-wider">
            Level Complete! 🎉
          </span>

          <h2 className="text-2xl sm:text-4xl font-black font-display text-slate-900 mt-2 mb-1">
            GREAT JOB, MASTER BUILDER!
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-bold max-w-md mx-auto mb-6">
            You finished all challenges in <span className="text-red-600">{currentLevel.title}</span>! Let's use your bricks to assemble models!
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
              className="w-full sm:w-auto min-h-[56px] px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-display font-black rounded-2xl border-2 border-b-6 border-blue-900 active:border-b-2 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Build in Workshop 🚀</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleRestartLevel}
              className="w-full sm:w-auto min-h-[56px] px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-black rounded-2xl border-2 border-slate-300 transition-all flex items-center justify-center gap-2"
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
