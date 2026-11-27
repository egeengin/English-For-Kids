import React, { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
const GameArena = lazy(() => import('./components/GameArena'));
const ParentDashboard = lazy(() => import('./components/ParentDashboard'));
const MathGateModal = lazy(() => import('./components/MathGateModal'));
const WelcomeScreen = lazy(() => import('./components/WelcomeScreen'));
const BreakModal = lazy(() => import('./components/BreakModal'));
const AdventureIsland = lazy(() => import('./components/AdventureIsland'));
const ArcadeHub = lazy(() => import('./components/ArcadeHub'));
const SceneExplorer = lazy(() => import('./components/SceneExplorer'));
const StoryAdventure = lazy(() => import('./components/StoryAdventure'));
const BalloonPopGame = lazy(() => import('./components/BalloonPopGame'));
const PhonicsBuilder = lazy(() => import('./components/PhonicsBuilder'));
const AudioMemoryGame = lazy(() => import('./components/AudioMemoryGame'));
const SoundDetectiveGame = lazy(() => import('./components/SoundDetectiveGame'));
const RhymingPairsGame = lazy(() => import('./components/RhymingPairsGame'));
const StickerCollection = lazy(() => import('./components/StickerCollection'));
const MiniBooksReader = lazy(() => import('./components/MiniBooksReader'));
const QuestionQuizGame = lazy(() => import('./components/QuestionQuizGame'));
const QuickSpeakGame = lazy(() => import('./components/QuickSpeakGame'));
const SmartReviewGame = lazy(() => import('./components/SmartReviewGame'));
const ListenColorGame = lazy(() => import('./components/ListenColorGame'));
const PutItThereGame = lazy(() => import('./components/PutItThereGame'));
const WalkieTalkieModal = lazy(() => import('./components/WalkieTalkieModal'));
const CertificateModal = lazy(() => import('./components/CertificateModal'));
const DailyMissionHub = lazy(() => import('./components/DailyMissionHub'));
const LevelDiscoveryGame = lazy(() => import('./components/LevelDiscoveryGame'));
const PrintableMissionSheetModal = lazy(() => import('./components/PrintableMissionSheetModal'));
const DailyRecallModal = lazy(() => import('./components/DailyRecallModal'));
import { CURRICULUM_LEVELS } from './data/curriculum';
import {
  markQuestStepInProgress,
  markSpokenPhraseInProgress,
  claimQuestChestInProgress,
} from './data/islandMapData';
import { loadSavedState, saveState } from './utils/storage';
import { saveGeminiApiKey } from './utils/gemini';
import { stopSpeech, cancelHoverSpeech } from './utils/speech';
import {
  logDailyActivity,
  getDailyMemorySummary,
  shouldShowDailyRecall,
  markDailyRecallSeen,
} from './utils/dailyMemory';
import {
  Sparkles,
  ShieldCheck,
  BookOpen,
  Compass,
  Map,
  ArrowLeft,
} from 'lucide-react';

const findCurriculumWord = (wordId) => {
  for (const level of CURRICULUM_LEVELS) {
    const found = level.items?.find(
      (i) => i.id === wordId || i.word.toLowerCase() === String(wordId).toLowerCase()
    );
    if (found) return found;
  }
  return null;
};

export default function App() {
  const [state, setState] = useState(() => loadSavedState());
  const [currentTab, setCurrentTab] = useState(() => state.lastTab || 'island');
  const [isMathGateOpen, setIsMathGateOpen] = useState(false);
  const [isParentUnlocked, setIsParentUnlocked] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isDailyRecallOpen, setIsDailyRecallOpen] = useState(() => {
    if (!shouldShowDailyRecall()) return false;
    return Boolean(
      getDailyMemorySummary({
        childName: state.childName || 'Deniz',
        streak: state.streak || 1,
      })?.hasPreviousActivity
    );
  });
  const [sessionQuestionsCount, setSessionQuestionsCount] = useState(0);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [isWalkieTalkieOpen, setIsWalkieTalkieOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isPrintableOpen, setIsPrintableOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState(() => state.selectedDayId || 'day-1');
  const [requestedQuestStep, setRequestedQuestStep] = useState({
    dayId: null,
    step: null,
    seq: 0,
  });
  const [printConfig, setPrintConfig] = useState({
    mode: 'stage',
    stageId: 'stage-1',
    dayId: 'day-1',
  });

  // Sync state to localStorage
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Track playtime in minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => ({
        ...prev,
        playtimeMinutes: (prev.playtimeMinutes || 0) + 1,
      }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Handle Tab Switch (guards parent dashboard with math challenge)
  const handleTabChange = (tabId) => {
    stopSpeech();
    cancelHoverSpeech();
    if (tabId === 'parent') {
      if (!isParentUnlocked) {
        setIsMathGateOpen(true);
        return;
      }
    }
    setCurrentTab(tabId);
    if (tabId !== 'parent') {
      setState(prev => ({ ...prev, lastTab: tabId }));
    }
  };

  const handleSelectDayId = (dayId) => {
    setSelectedDayId(dayId);
    setState(prev => ({ ...prev, selectedDayId: dayId }));
  };

  const handleLaunchQuest = (dayId, step = 'learn') => {
    stopSpeech();
    cancelHoverSpeech();
    const targetDayId = dayId || selectedDayId || 'day-1';
    handleSelectDayId(targetDayId);
    setRequestedQuestStep((prev) => ({
      dayId: targetDayId,
      step,
      seq: prev.seq + 1,
    }));
    setCurrentTab('daily');
    setState((prev) => ({ ...prev, lastTab: 'daily' }));
  };

  const handleMarkQuestStep = useCallback((dayId, stepKey) => {
    if (!dayId || !stepKey) return;
    setState((prev) => {
      const nextProgress = markQuestStepInProgress(prev.questProgress, dayId, stepKey);
      if (nextProgress === prev.questProgress) return prev;
      return {
        ...prev,
        questProgress: nextProgress,
      };
    });
  }, []);

  const handleMarkSpokenPhrase = useCallback((dayId, phrase) => {
    if (!dayId || !phrase) return;
    setState((prev) => {
      const nextProgress = markSpokenPhraseInProgress(prev.questProgress, dayId, phrase);
      if (nextProgress === prev.questProgress) return prev;
      return {
        ...prev,
        questProgress: nextProgress,
      };
    });
  }, []);

  const handleClaimQuestChest = useCallback((dayId) => {
    if (!dayId) return;
    setState((prev) => {
      const { questProgress: nextProgress, newlyClaimed } = claimQuestChestInProgress(
        prev.questProgress,
        dayId
      );
      if (!newlyClaimed) return prev;
      logDailyActivity({ stars: 5, bricks: 2, missionTitle: `Island Chest: ${dayId}` });
      return {
        ...prev,
        stars: (prev.stars || 0) + 5,
        bricks: (prev.bricks || 0) + 2,
        questProgress: nextProgress,
      };
    });
  }, []);

  // Math gate solved successfully
  const handleMathGateSuccess = () => {
    setIsMathGateOpen(false);
    setIsParentUnlocked(true);
    setCurrentTab('parent');
  };

  // Reward earned from quiz completion or question
  const handleRewardEarned = useCallback((reward = {}) => {
    const stars = typeof reward === 'number' ? reward : (reward.stars || 0);
    const bricks = typeof reward === 'number' ? reward : (reward.bricks || 0);
    const bookTitle = typeof reward === 'object' ? reward.bookTitle : null;
    const missionTitle = typeof reward === 'object' ? reward.missionTitle : null;
    const gameName = typeof reward === 'object' ? reward.gameName : null;
    const word = typeof reward === 'object' ? reward.word : null;

    logDailyActivity({ stars, bricks, bookTitle, missionTitle, gameName, word });

    setState(prev => ({
      ...prev,
      stars: prev.stars + stars,
      bricks: prev.bricks + bricks,
      totalQuestionsAnswered: (prev.totalQuestionsAnswered || 0) + 1,
    }));
  }, []);

  // Track question completion for milestone / screen-time awareness
  const handleQuestionCompleted = useCallback(() => {
    logDailyActivity({ questionAnswered: true });
    setSessionQuestionsCount((prev) => {
      const newCount = prev + 1;
      if (newCount % 10 === 0) {
        setShowBreakModal(true);
      }
      return newCount;
    });
  }, []);

  // Word result telemetry from quiz
  const handleWordResult = useCallback(({ wordId, isMastered }) => {
    const found = findCurriculumWord(wordId);
    const wordObj = found
      ? { word: found.word, emoji: found.emoji, tr: found.translation }
      : { word: String(wordId), emoji: '⭐', tr: '' };

    logDailyActivity({ word: wordObj, questionAnswered: true });

    setState(prev => {
      const mastered = new Set(prev.masteredWords || []);
      const practicing = new Set(prev.practicingWords || []);

      if (isMastered) {
        mastered.add(wordId);
        practicing.delete(wordId);
      } else {
        practicing.add(wordId);
      }

      return {
        ...prev,
        masteredWords: Array.from(mastered),
        practicingWords: Array.from(practicing),
      };
    });
  }, []);

  // Parent adds custom word
  const handleAddCustomWord = (newWordObj) => {
    setState(prev => ({
      ...prev,
      customWords: [newWordObj, ...(prev.customWords || [])],
    }));
  };

  // Parent deletes custom word
  const handleDeleteCustomWord = (wordId) => {
    setState(prev => ({
      ...prev,
      customWords: (prev.customWords || []).filter(w => w.id !== wordId),
      masteredWords: (prev.masteredWords || []).filter(id => id !== wordId),
      practicingWords: (prev.practicingWords || []).filter(id => id !== wordId),
    }));
  };

  // Parent resets learning progress
  const handleResetProgress = () => {
    setState(prev => ({
      ...prev,
      stars: 0,
      bricks: 4,
      masteredWords: [],
      practicingWords: [],
      unlockedStages: { rocket: [1], racecar: [], castle: [] },
      cardLevels: {},
      totalQuestionsAnswered: 0,
    }));
    setSessionQuestionsCount(0);
  };

  // Evolve collectible hero card level (Lv.1 -> Lv.2 -> Lv.3)
  const handleEvolveCard = (badgeId, nextLevel) => {
    setState(prev => ({
      ...prev,
      cardLevels: {
        ...(prev.cardLevels || {}),
        [badgeId]: nextLevel,
      },
    }));
  };

  // Parent updates child profile or Gemini API settings
  const handleUpdateProfile = ({ childName, childAge, geminiApiKey }) => {
    saveGeminiApiKey(geminiApiKey);
    setState(prev => ({
      ...prev,
      childName: (childName && childName.trim()) || 'Deniz',
      childAge: Number(childAge) || 7,
      geminiApiKey: typeof geminiApiKey === 'string' ? geminiApiKey.trim() : '',
    }));
  };

  // Sound toggle
  const handleToggleMute = () => {
    setState(prev => ({
      ...prev,
      soundMuted: !prev.soundMuted,
    }));
  };

  // Daily Mission checklist toggle
  const handleToggleChecklistItem = (itemId) => {
    setState(prev => {
      const current = prev.dailyChecklist || {};
      const nextVal = !current[itemId];
      if (nextVal) {
        logDailyActivity({ stars: 1, missionTitle: `Görev: ${itemId}` });
      }
      return {
        ...prev,
        stars: nextVal ? prev.stars + 1 : Math.max(0, prev.stars - 1),
        dailyChecklist: {
          ...current,
          [itemId]: nextVal,
        },
      };
    });
  };

  // Save 5-Stage Level Discovery evaluation
  const handleSaveDiscoveryResult = (questionId, resultObj) => {
    setState(prev => {
      const existing = prev.discoveryResults || {};
      const isNew = !existing[questionId];
      return {
        ...prev,
        stars: isNew ? prev.stars + 1 : prev.stars,
        discoveryResults: {
          ...existing,
          [questionId]: resultObj,
        },
      };
    });
  };

  // Clear specific question results (e.g. "Yanlışları Tekrar Çöz")
  const handleClearDiscoveryQuestions = (questionIds = []) => {
    if (!Array.isArray(questionIds) || questionIds.length === 0) return;
    setState(prev => {
      const existing = { ...(prev.discoveryResults || {}) };
      questionIds.forEach(id => {
        delete existing[id];
      });
      return {
        ...prev,
        discoveryResults: existing,
      };
    });
  };

  // Reset 5-Stage Level Discovery progress
  const handleResetDiscovery = () => {
    setState(prev => ({
      ...prev,
      discoveryResults: {},
    }));
  };

  // Save Daily 10-Question Quiz answer & award +1 star on first answer
  const handleSaveDailyQuizAnswer = (questionId, optionId) => {
    setState(prev => {
      const existing = prev.dailyQuizAnswers || {};
      const isNew = !existing[questionId];
      return {
        ...prev,
        stars: isNew ? prev.stars + 1 : prev.stars,
        dailyQuizAnswers: {
          ...existing,
          [questionId]: optionId,
        },
      };
    });
  };

  // Clear Daily Quiz answers for a specific day
  const handleResetDailyQuizQuestions = (questionIds = []) => {
    if (!Array.isArray(questionIds) || questionIds.length === 0) return;
    setState(prev => {
      const next = { ...(prev.dailyQuizAnswers || {}) };
      questionIds.forEach(id => {
        delete next[id];
      });
      return {
        ...prev,
        dailyQuizAnswers: next,
      };
    });
  };

  const handleSwitchToDay = (dayId) => {
    if (dayId) setSelectedDayId(dayId);
    setCurrentTab('daily');
  };

  const handleOpenPrintable = (config) => {
    if (config && typeof config === 'object') {
      setPrintConfig(prev => ({
        ...prev,
        mode: config.mode || prev.mode || 'stage',
        stageId: config.stageId || prev.stageId || 'stage-1',
        dayId: config.dayId || selectedDayId || 'day-1',
      }));
      if (config.dayId) {
        setSelectedDayId(config.dayId);
      }
    } else {
      setPrintConfig(prev => ({
        ...prev,
        mode: currentTab === 'daily' ? 'day' : 'stage',
        dayId: selectedDayId || 'day-1',
      }));
    }
    setIsPrintableOpen(true);
  };

  const childName = state.childName || 'Deniz';
  const childAge = state.childAge || 7;
  const geminiApiKey = state.geminiApiKey || '';

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FFFDF5] font-display font-black text-slate-700">Loading {childName}’s Adventure Island…</div>}>
    <div className="min-h-screen flex flex-col island-sky-bg text-slate-900 pb-32 sm:pb-8 print:bg-white print:pb-0">
      
      {/* Welcome & Audio Unlock Overlay on First Load */}
      {showWelcome && (
        <WelcomeScreen
          onStart={() => setShowWelcome(false)}
          isMuted={state.soundMuted}
          childName={childName}
        />
      )}

      {/* Break & Screen-Time Awareness Modal */}
      <BreakModal
        isOpen={showBreakModal}
        onContinue={() => setShowBreakModal(false)}
        isMuted={state.soundMuted}
        milestoneCount={sessionQuestionsCount}
      />

      {/* Daily Recall & Memory Welcome Modal */}
      <DailyRecallModal
        isOpen={isDailyRecallOpen}
        onClose={() => {
          stopSpeech();
          markDailyRecallSeen();
          setIsDailyRecallOpen(false);
        }}
        summary={getDailyMemorySummary({
          childName,
          streak: state.streak || 1,
          fallbackMasteredWords: state.masteredWords || [],
        })}
        childName={childName}
        isMuted={state.soundMuted}
        onNavigateTab={(tabId) => {
          markDailyRecallSeen();
          setIsDailyRecallOpen(false);
          handleTabChange(tabId);
        }}
      />

      {/* Lego Header & Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        stars={state.stars}
        streak={state.streak || 1}
        isMuted={state.soundMuted}
        onToggleMute={handleToggleMute}
        onOpenWalkieTalkie={() => setIsWalkieTalkieOpen(true)}
        onOpenDailyRecall={() => setIsDailyRecallOpen(true)}
        childName={childName}
      />

      {/* Main Content Arena */}
      <main className={`flex-1 w-full flex flex-col items-center ${isPrintableOpen || isCertificateOpen ? 'print:hidden' : ''}`}>
        {/* Cozy Adventure Island Home */}
        {currentTab === 'island' && (
          <AdventureIsland
            childName={childName}
            selectedDayId={selectedDayId}
            questProgress={state.questProgress || {}}
            dailyQuizAnswers={state.dailyQuizAnswers || {}}
            onLaunchQuest={handleLaunchQuest}
            onClaimChest={handleClaimQuestChest}
            onNavigateTab={handleTabChange}
            onOpenWalkieTalkie={() => setIsWalkieTalkieOpen(true)}
            isMuted={state.soundMuted}
          />
        )}

        {/* Daily Mission Hub */}
        {currentTab === 'daily' && (
          <DailyMissionHub
            key={`${selectedDayId}-${requestedQuestStep.seq}`}
            dailyChecklist={state.dailyChecklist || {}}
            onToggleChecklistItem={handleToggleChecklistItem}
            dailyQuizAnswers={state.dailyQuizAnswers || {}}
            onSaveDailyQuizAnswer={handleSaveDailyQuizAnswer}
            onResetDailyQuizQuestions={handleResetDailyQuizQuestions}
            onRewardEarned={handleRewardEarned}
            onOpenDiscoveryGame={() => setCurrentTab('discovery')}
            onOpenStory={() => setCurrentTab('story')}
            onOpenDailyRecall={() => setIsDailyRecallOpen(true)}
            onOpenPrintable={handleOpenPrintable}
            selectedDayId={selectedDayId}
            onSelectDayId={handleSelectDayId}
            initialStep={requestedQuestStep.dayId === selectedDayId ? requestedQuestStep.step : null}
            questProgress={state.questProgress || {}}
            onMarkQuestStep={handleMarkQuestStep}
            onMarkSpokenPhrase={handleMarkSpokenPhrase}
            onBackToIsland={() => handleTabChange('island')}
            childName={childName}
            isMuted={state.soundMuted}
          />
        )}

        {/* 5-Stage Progressive Level Discovery Game */}
        {currentTab === 'discovery' && (
          <LevelDiscoveryGame
            discoveryResults={state.discoveryResults || {}}
            onSaveDiscoveryResult={handleSaveDiscoveryResult}
            onClearDiscoveryQuestions={handleClearDiscoveryQuestions}
            onResetDiscovery={handleResetDiscovery}
            onRewardEarned={handleRewardEarned}
            onOpenPrintable={handleOpenPrintable}
            onSwitchToDay={handleSwitchToDay}
            isMuted={state.soundMuted}
            childName={childName}
          />
        )}

        {/* Guru Feature 2: Phonics Letter-Brick Snapping */}
        {currentTab === 'phonics' && (
          <PhonicsBuilder
            onRewardEarned={handleRewardEarned}
            onNavigateToWorkshop={() => setCurrentTab('collection')}
            isMuted={state.soundMuted}
            childName={childName}
            childAge={childAge}
          />
        )}

        {/* Spot 7 Differences Explorer */}
        {currentTab === 'differences' && (
          <SceneExplorer
            onRewardEarned={handleRewardEarned}
            onNavigateToWorkshop={() => setCurrentTab('collection')}
            isMuted={state.soundMuted}
          />
        )}

        {/* Story Mode Switcher: Interactive Scenes vs Mini Reading Books */}
        {(currentTab === 'story' || currentTab === 'books') && (
          <div className="w-full max-w-4xl mx-auto px-3 pt-3 pb-0 flex items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => handleTabChange('story')}
              className={`px-3.5 py-1.5 rounded-xl border-2 font-display font-black text-xs sm:text-sm transition cursor-pointer ${
                currentTab === 'story'
                  ? 'bg-purple-600 text-white border-purple-800 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-purple-300'
              }`}
            >
              🗺️ Story Scenes
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('books')}
              className={`px-3.5 py-1.5 rounded-xl border-2 font-display font-black text-xs sm:text-sm transition cursor-pointer ${
                currentTab === 'books'
                  ? 'bg-blue-600 text-white border-blue-800 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'
              }`}
            >
              📖 Mini Books
            </button>
          </div>
        )}

        {/* Story Adventure with Voice Talk & Karaoke */}
        {currentTab === 'story' && (
          <StoryAdventure
            onRewardEarned={handleRewardEarned}
            onNavigateToWorkshop={() => setCurrentTab('collection')}
            isMuted={state.soundMuted}
            childName={childName}
            childAge={childAge}
            geminiApiKey={geminiApiKey}
          />
        )}

        {currentTab === 'books' && (
          <MiniBooksReader
            onRewardEarned={handleRewardEarned}
            isMuted={state.soundMuted}
            childName={childName}
          />
        )}

        {/* Clean Back-to-Arcade Bar inside Individual Mini-Games */}
        {['balloons', 'phonics', 'differences', 'memory', 'sound_pairs', 'rhymes', 'questions', 'quick_speak', 'smart_review', 'listen_color', 'put_it', 'collection', 'discovery'].includes(currentTab) && (
          <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 pt-4 pb-1 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => handleTabChange('games')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-rose-50 text-slate-800 border-2 border-slate-200 hover:border-rose-300 font-display font-black text-xs sm:text-sm shadow-2xs cursor-pointer transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Arcade</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('island')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-900 border-2 border-sky-200 font-display font-black text-xs sm:text-sm shadow-2xs cursor-pointer transition"
            >
              <span>🏝️ Island Map</span>
            </button>
          </div>
        )}

        {/* Curated Arcade Pier */}
        {currentTab === 'games' && (
          <ArcadeHub
            childName={childName}
            stars={state.stars}
            onSelectGame={(gameId) => handleTabChange(gameId)}
            onOpenWalkieTalkie={() => setIsWalkieTalkieOpen(true)}
            isMuted={state.soundMuted}
          />
        )}

        {/* Active Listening Balloon Pop */}
        {currentTab === 'balloons' && (
          <BalloonPopGame
            onRewardEarned={handleRewardEarned}
            onNavigateToWorkshop={() => setCurrentTab('daily')}
            isMuted={state.soundMuted}
          />
        )}

        {currentTab === 'memory' && (
          <AudioMemoryGame onRewardEarned={handleRewardEarned} isMuted={state.soundMuted} />
        )}

        {currentTab === 'sound_pairs' && (
          <SoundDetectiveGame onRewardEarned={handleRewardEarned} isMuted={state.soundMuted} />
        )}

        {currentTab === 'rhymes' && (
          <RhymingPairsGame onRewardEarned={handleRewardEarned} isMuted={state.soundMuted} />
        )}

        {currentTab === 'questions' && (
          <QuestionQuizGame onRewardEarned={handleRewardEarned} isMuted={state.soundMuted} />
        )}

        {currentTab === 'quick_speak' && (
          <QuickSpeakGame onRewardEarned={handleRewardEarned} isMuted={state.soundMuted} />
        )}

        {currentTab === 'smart_review' && (
          <SmartReviewGame onRewardEarned={handleRewardEarned} isMuted={state.soundMuted} />
        )}

        {currentTab === 'listen_color' && (
          <ListenColorGame onRewardEarned={handleRewardEarned} isMuted={state.soundMuted} />
        )}

        {currentTab === 'put_it' && (
          <PutItThereGame onRewardEarned={handleRewardEarned} isMuted={state.soundMuted} />
        )}

        {currentTab === 'collection' && (
          <StickerCollection
            bricks={state.bricks}
            cardLevels={state.cardLevels || {}}
            onEvolveCard={handleEvolveCard}
            onRewardEarned={handleRewardEarned}
            isMuted={state.soundMuted}
            childName={childName}
            childAge={childAge}
            geminiApiKey={geminiApiKey}
          />
        )}

        {/* Traditional Quiz Arena */}
        {currentTab === 'arena' && (
          <GameArena
            curriculumLevels={CURRICULUM_LEVELS}
            customWords={state.customWords || []}
            onRewardEarned={handleRewardEarned}
            onWordResult={handleWordResult}
            onNavigateToWorkshop={() => setCurrentTab('collection')}
            onQuestionCompleted={handleQuestionCompleted}
            isAdventureStarted={!showWelcome}
            isMuted={state.soundMuted}
            childName={childName}
            childAge={childAge}
            geminiApiKey={geminiApiKey}
          />
        )}

        {/* Parent Hub & Multi-Child Settings */}
        {currentTab === 'parent' && (
          <ParentDashboard
            streak={state.streak}
            playtimeMinutes={state.playtimeMinutes}
            totalQuestionsAnswered={state.totalQuestionsAnswered || 0}
            masteredWords={state.masteredWords || []}
            practicingWords={state.practicingWords || []}
            questProgress={state.questProgress || {}}
            dailyQuizAnswers={state.dailyQuizAnswers || {}}
            curriculumLevels={CURRICULUM_LEVELS}
            customWords={state.customWords || []}
            onAddCustomWord={handleAddCustomWord}
            onDeleteCustomWord={handleDeleteCustomWord}
            onResetProgress={handleResetProgress}
            onCloseDashboard={() => setCurrentTab('island')}
            isMuted={state.soundMuted}
            childName={childName}
            childAge={childAge}
            geminiApiKey={geminiApiKey}
            onUpdateProfile={handleUpdateProfile}
            onOpenCertificate={() => setIsCertificateOpen(true)}
          />
        )}
      </main>

      {/* Mobile Sticky Thumb Bar (Large Touch Targets >= 50px height + iPhone Safe Area) */}
      <div
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t-2 border-slate-800 px-2 pt-2 flex items-center justify-around print:hidden"
      >
        <button
          onClick={() => handleTabChange('island')}
          className={`min-h-[50px] flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer ${
            currentTab === 'island' ? 'text-sky-400 font-black' : 'text-slate-400'
          }`}
        >
          <Map className="w-5 h-5" />
          <span>Island</span>
        </button>

        <button
          onClick={() => handleTabChange('daily')}
          className={`min-h-[50px] flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer ${
            currentTab === 'daily' ? 'text-emerald-400 font-black' : 'text-slate-400'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Quest</span>
        </button>

        <button
          onClick={() => handleTabChange('story')}
          className={`min-h-[50px] flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer ${
            currentTab === 'story' || currentTab === 'books' ? 'text-purple-400 font-black' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Stories</span>
        </button>

        <button
          onClick={() => handleTabChange('games')}
          className={`min-h-[50px] flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer ${
            ['games', 'balloons', 'phonics', 'differences', 'memory', 'sound_pairs', 'rhymes', 'questions', 'quick_speak', 'smart_review', 'listen_color', 'put_it', 'collection', 'discovery'].includes(currentTab)
              ? 'text-rose-400 font-black'
              : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Arcade</span>
        </button>

        <button
          onClick={() => handleTabChange('parent')}
          className={`min-h-[50px] flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer ${
            currentTab === 'parent' ? 'text-emerald-400 font-black' : 'text-slate-400'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Parent</span>
        </button>
      </div>

      {/* Black & White Printable 10-Question Test Worksheet Modal */}
      <PrintableMissionSheetModal
        isOpen={isPrintableOpen}
        onClose={() => setIsPrintableOpen(false)}
        childName={childName}
        childAge={childAge}
        printConfig={printConfig}
        isMuted={state.soundMuted}
      />

      {/* Math Gate Modal for Parent Protection */}
      <MathGateModal
        isOpen={isMathGateOpen}
        onClose={() => setIsMathGateOpen(false)}
        onSuccess={handleMathGateSuccess}
        isMuted={state.soundMuted}
      />

      {/* Walkie-Talkie Open-Ended Gemini Companion Modal */}
      <WalkieTalkieModal
        isOpen={isWalkieTalkieOpen}
        onClose={() => {
          stopSpeech();
          setIsWalkieTalkieOpen(false);
        }}
        onRewardEarned={handleRewardEarned}
        childName={childName}
        childAge={childAge}
        geminiApiKey={geminiApiKey}
        isMuted={state.soundMuted}
      />

      {/* Printable Refrigerator Diploma / Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        childName={childName}
        childAge={childAge}
        masteredWordsCount={(state.masteredWords || []).length || 18}
        totalBricks={state.bricks || 12}
        totalStars={state.stars || 36}
        isMuted={state.soundMuted}
      />

    </div>
    </Suspense>
  );
}
