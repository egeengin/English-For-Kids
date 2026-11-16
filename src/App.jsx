import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GameArena from './components/GameArena';
import ParentDashboard from './components/ParentDashboard';
import MathGateModal from './components/MathGateModal';
import WelcomeScreen from './components/WelcomeScreen';
import BreakModal from './components/BreakModal';
import SceneExplorer from './components/SceneExplorer';
import StoryAdventure from './components/StoryAdventure';
import BalloonPopGame from './components/BalloonPopGame';
import PhonicsBuilder from './components/PhonicsBuilder';
import AudioMemoryGame from './components/AudioMemoryGame';
import SoundDetectiveGame from './components/SoundDetectiveGame';
import RhymingPairsGame from './components/RhymingPairsGame';
import StickerCollection from './components/StickerCollection';
import MiniBooksReader from './components/MiniBooksReader';
import QuestionQuizGame from './components/QuestionQuizGame';
import QuickSpeakGame from './components/QuickSpeakGame';
import SmartReviewGame from './components/SmartReviewGame';
import WalkieTalkieModal from './components/WalkieTalkieModal';
import CertificateModal from './components/CertificateModal';
import DailyMissionHub from './components/DailyMissionHub';
import LevelDiscoveryGame from './components/LevelDiscoveryGame';
import PrintableMissionSheetModal from './components/PrintableMissionSheetModal';
import { CURRICULUM_LEVELS } from './data/curriculum';
import { loadSavedState, saveState } from './utils/storage';
import { Sparkles, ShieldCheck, BookOpen, Compass, Award } from 'lucide-react';

export default function App() {
  const [state, setState] = useState(() => loadSavedState());
  const [currentTab, setCurrentTab] = useState(() => loadSavedState().lastTab || 'discovery');
  const [isMathGateOpen, setIsMathGateOpen] = useState(false);
  const [isParentUnlocked, setIsParentUnlocked] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [sessionQuestionsCount, setSessionQuestionsCount] = useState(0);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [isWalkieTalkieOpen, setIsWalkieTalkieOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isPrintableOpen, setIsPrintableOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState(() => loadSavedState().selectedDayId || 'day-1');
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

  // Math gate solved successfully
  const handleMathGateSuccess = () => {
    setIsMathGateOpen(false);
    setIsParentUnlocked(true);
    setCurrentTab('parent');
  };

  // Reward earned from quiz completion or question
  const handleRewardEarned = ({ stars = 0, bricks = 0 }) => {
    setState(prev => ({
      ...prev,
      stars: prev.stars + stars,
      bricks: prev.bricks + bricks,
      totalQuestionsAnswered: (prev.totalQuestionsAnswered || 0) + 1,
    }));
  };

  // Track question completion for milestone / screen-time awareness
  const handleQuestionCompleted = () => {
    const newCount = sessionQuestionsCount + 1;
    setSessionQuestionsCount(newCount);
    if (newCount % 10 === 0) {
      setShowBreakModal(true);
    }
  };

  // Word result telemetry from quiz
  const handleWordResult = ({ wordId, isMastered }) => {
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
  };

  // Virtual builder unlocks stage
  const handleUnlockStage = (modelId, stageNumber, cost) => {
    setState(prev => {
      const currentModelStages = prev.unlockedStages[modelId] || [];
      if (currentModelStages.includes(stageNumber)) return prev;

      return {
        ...prev,
        bricks: Math.max(0, prev.bricks - cost),
        unlockedStages: {
          ...prev.unlockedStages,
          [modelId]: [...currentModelStages, stageNumber],
        },
      };
    });
  };

  // Minifigure accessory unlock
  const handleUnlockAccessory = (accessoryId, cost) => {
    setState(prev => {
      const currentUnlocked = prev.unlockedAccessories || ['cap'];
      if (currentUnlocked.includes(accessoryId)) return prev;

      return {
        ...prev,
        bricks: Math.max(0, prev.bricks - cost),
        unlockedAccessories: [...currentUnlocked, accessoryId],
        equippedAccessory: accessoryId,
      };
    });
  };

  // Minifigure accessory equip
  const handleEquipAccessory = (accessoryId) => {
    setState(prev => ({
      ...prev,
      equippedAccessory: accessoryId,
    }));
  };

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
      totalQuestionsAnswered: 0,
    }));
    setSessionQuestionsCount(0);
  };

  // Parent updates child profile or Gemini API settings
  const handleUpdateProfile = ({ childName, childAge, geminiApiKey }) => {
    setState(prev => ({
      ...prev,
      childName: (childName && childName.trim()) || 'Deniz',
      childAge: Number(childAge) || 7,
      geminiApiKey: typeof geminiApiKey === 'string' ? geminiApiKey.trim() : prev.geminiApiKey || '',
    }));
  };

  // Sound toggle
  const handleToggleMute = () => {
    setState(prev => ({
      ...prev,
      soundMuted: !prev.soundMuted,
    }));
  };

  // Lego Town diorama items persistence
  const handleSaveDioramaItems = (items) => {
    setState(prev => ({
      ...prev,
      dioramaItems: items,
    }));
  };

  // Daily Mission checklist toggle
  const handleToggleChecklistItem = (itemId) => {
    setState(prev => {
      const current = prev.dailyChecklist || {};
      const nextVal = !current[itemId];
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
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 lego-baseplate-pattern pb-32 sm:pb-8 print:bg-white print:pb-0">
      
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

      {/* Lego Header & Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        stars={state.stars}
        isMuted={state.soundMuted}
        onToggleMute={handleToggleMute}
        onOpenPrintable={() => handleOpenPrintable()}
        onOpenWalkieTalkie={() => setIsWalkieTalkieOpen(true)}
        childName={childName}
      />

      {/* Main Content Arena */}
      <main className={`flex-1 w-full flex flex-col items-center ${isPrintableOpen || isCertificateOpen ? 'print:hidden' : ''}`}>
        {/* Daily Mission Hub */}
        {currentTab === 'daily' && (
          <DailyMissionHub
            dailyChecklist={state.dailyChecklist || {}}
            onToggleChecklistItem={handleToggleChecklistItem}
            dailyQuizAnswers={state.dailyQuizAnswers || {}}
            onSaveDailyQuizAnswer={handleSaveDailyQuizAnswer}
            onResetDailyQuizQuestions={handleResetDailyQuizQuestions}
            onOpenDiscoveryGame={() => setCurrentTab('discovery')}
            onOpenStory={() => setCurrentTab('story')}
            onOpenPrintable={handleOpenPrintable}
            selectedDayId={selectedDayId}
            onSelectDayId={handleSelectDayId}
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
          <div className="w-full max-w-4xl mx-auto px-3 pt-4 pb-1 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleTabChange('story')}
              className={`px-4 py-2 rounded-2xl border-2 font-display font-black text-sm sm:text-base transition cursor-pointer ${
                currentTab === 'story'
                  ? 'bg-purple-600 text-white border-purple-800 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-purple-300'
              }`}
            >
              🗺️ Hikaye Sahneleri
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('books')}
              className={`px-4 py-2 rounded-2xl border-2 font-display font-black text-sm sm:text-base transition cursor-pointer ${
                currentTab === 'books'
                  ? 'bg-blue-600 text-white border-blue-800 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'
              }`}
            >
              📖 Mini Kitaplar
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

        {/* Games Hub Switcher */}
        {['games', 'balloons', 'phonics', 'differences', 'memory', 'sound_pairs', 'rhymes', 'questions', 'quick_speak', 'smart_review', 'collection'].includes(currentTab) && (
          <div className="w-full max-w-5xl mx-auto px-3 pt-4 pb-1 flex items-center justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleTabChange('balloons')}
              className={`px-3 py-2 rounded-2xl border-2 font-display font-black text-xs sm:text-sm transition cursor-pointer ${
                currentTab === 'games' || currentTab === 'balloons'
                  ? 'bg-rose-500 text-white border-rose-700 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-rose-300'
              }`}
            >
              🎈 Balon
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('memory')}
              className={`px-3 py-2 rounded-2xl border-2 font-display font-black text-xs sm:text-sm transition cursor-pointer ${
                currentTab === 'memory'
                  ? 'bg-indigo-600 text-white border-indigo-800 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300'
              }`}
            >
              🃏 Hafıza
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('sound_pairs')}
              className={`px-3 py-2 rounded-2xl border-2 font-display font-black text-xs sm:text-sm transition cursor-pointer ${
                currentTab === 'sound_pairs'
                  ? 'bg-sky-600 text-white border-sky-800 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-sky-300'
              }`}
            >
              👂 Ses
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('rhymes')}
              className={`px-3 py-2 rounded-2xl border-2 font-display font-black text-xs sm:text-sm transition cursor-pointer ${
                currentTab === 'rhymes'
                  ? 'bg-purple-600 text-white border-purple-800 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-purple-300'
              }`}
            >
              🎵 Kafiye
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('questions')}
              className={`px-3 py-2 rounded-2xl border-2 font-display font-black text-xs sm:text-sm transition cursor-pointer ${
                currentTab === 'questions'
                  ? 'bg-teal-600 text-white border-teal-800 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-teal-300'
              }`}
            >
              ❓ Sorular
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('quick_speak')}
              className={`px-3 py-2 rounded-2xl border-2 font-display font-black text-xs sm:text-sm transition cursor-pointer ${
                currentTab === 'quick_speak'
                  ? 'bg-violet-600 text-white border-violet-800 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-violet-300'
              }`}
            >
              🎙️ Konuş
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('smart_review')}
              className={`px-3 py-2 rounded-2xl border-2 font-display font-black text-xs sm:text-sm transition cursor-pointer ${
                currentTab === 'smart_review'
                  ? 'bg-orange-500 text-white border-orange-700 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-orange-300'
              }`}
            >
              🔁 Tekrar
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('phonics')}
              className={`px-3 py-2 rounded-2xl border-2 font-display font-black text-xs sm:text-sm transition cursor-pointer ${
                currentTab === 'phonics'
                  ? 'bg-amber-500 text-slate-950 border-amber-700 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300'
              }`}
            >
              🔤 Harfler
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('differences')}
              className={`px-3 py-2 rounded-2xl border-2 font-display font-black text-xs sm:text-sm transition cursor-pointer ${
                currentTab === 'differences'
                  ? 'bg-emerald-600 text-white border-emerald-800 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
              }`}
            >
              🔍 7 Fark
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('collection')}
              className={`px-3 py-2 rounded-2xl border-2 font-display font-black text-xs sm:text-sm transition cursor-pointer ${
                currentTab === 'collection'
                  ? 'bg-amber-400 text-slate-950 border-amber-600 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300'
              }`}
            >
              🏆 Rozetler
            </button>
          </div>
        )}

        {/* Active Listening Balloon Pop (Default Game) */}
        {(currentTab === 'games' || currentTab === 'balloons') && (
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

        {currentTab === 'collection' && (
          <StickerCollection bricks={state.bricks} isMuted={state.soundMuted} childName={childName} />
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
            curriculumLevels={CURRICULUM_LEVELS}
            customWords={state.customWords || []}
            onAddCustomWord={handleAddCustomWord}
            onDeleteCustomWord={handleDeleteCustomWord}
            onResetProgress={handleResetProgress}
            onCloseDashboard={() => setCurrentTab('road')}
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
          onClick={() => handleTabChange('discovery')}
          className={`min-h-[50px] flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer ${
            currentTab === 'discovery' ? 'text-yellow-400 font-black' : 'text-slate-400'
          }`}
        >
          <Award className="w-5 h-5" />
          <span>Test ⭐</span>
        </button>

        <button
          onClick={() => handleTabChange('daily')}
          className={`min-h-[50px] flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer ${
            currentTab === 'daily' ? 'text-blue-400 font-black' : 'text-slate-400'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Günlük 🚀</span>
        </button>

        <button
          onClick={() => handleTabChange('story')}
          className={`min-h-[50px] flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer ${
            currentTab === 'story' || currentTab === 'books' ? 'text-purple-400 font-black' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Story</span>
        </button>

        <button
          onClick={() => handleTabChange('games')}
          className={`min-h-[50px] flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer ${
            ['games', 'balloons', 'phonics', 'differences', 'memory', 'sound_pairs', 'rhymes', 'questions', 'quick_speak', 'smart_review', 'collection'].includes(currentTab)
              ? 'text-rose-400 font-black'
              : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Oyunlar</span>
        </button>

        <button
          onClick={() => handleTabChange('parent')}
          className={`min-h-[50px] flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer ${
            currentTab === 'parent' ? 'text-emerald-400 font-black' : 'text-slate-400'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Ebeveyn</span>
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
        onClose={() => setIsWalkieTalkieOpen(false)}
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

      {/* Footer Stud Strip */}
      <footer className="w-full py-4 text-center text-xs font-bold text-slate-400 border-t border-slate-200 bg-white/60 print:hidden">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <span className="text-sm">🌟</span>
          <span className="font-display font-black text-slate-700">{childName}’in İngilizce Dünyası</span>
          <span className="text-slate-300">•</span>
          <span>Kids English Learning PWA</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Audio-first gamification with trilingual English, German & Turkish learning support.
        </p>
      </footer>

    </div>
  );
}
