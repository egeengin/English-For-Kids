import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GameArena from './components/GameArena';
import LegoWorkshop from './components/LegoWorkshop';
import ParentDashboard from './components/ParentDashboard';
import MathGateModal from './components/MathGateModal';
import WelcomeScreen from './components/WelcomeScreen';
import BreakModal from './components/BreakModal';
import { CURRICULUM_LEVELS } from './data/curriculum';
import { loadSavedState, saveState } from './utils/storage';
import { playTap } from './utils/soundEffects';
import { Gamepad2, Wrench, ShieldCheck } from 'lucide-react';

export default function App() {
  const [state, setState] = useState(() => loadSavedState());
  const [currentTab, setCurrentTab] = useState('arena'); // 'arena' | 'workshop' | 'parent'
  const [isMathGateOpen, setIsMathGateOpen] = useState(false);
  const [isParentUnlocked, setIsParentUnlocked] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [sessionQuestionsCount, setSessionQuestionsCount] = useState(0);
  const [showBreakModal, setShowBreakModal] = useState(false);

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

  // Sound toggle
  const handleToggleMute = () => {
    setState(prev => ({
      ...prev,
      soundMuted: !prev.soundMuted,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 lego-baseplate-pattern pb-16 sm:pb-8">
      
      {/* Welcome & Audio Unlock Overlay on First Load */}
      {showWelcome && (
        <WelcomeScreen
          onStart={() => setShowWelcome(false)}
          isMuted={state.soundMuted}
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
        bricks={state.bricks}
        isMuted={state.soundMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Content Arena */}
      <main className="flex-1 w-full flex flex-col items-center">
        {currentTab === 'arena' && (
          <GameArena
            curriculumLevels={CURRICULUM_LEVELS}
            customWords={state.customWords || []}
            onRewardEarned={handleRewardEarned}
            onWordResult={handleWordResult}
            onNavigateToWorkshop={() => setCurrentTab('workshop')}
            onQuestionCompleted={handleQuestionCompleted}
            isMuted={state.soundMuted}
          />
        )}

        {currentTab === 'workshop' && (
          <LegoWorkshop
            unlockedStages={state.unlockedStages || {}}
            bricks={state.bricks}
            onUnlockStage={handleUnlockStage}
            onNavigateToArena={() => setCurrentTab('arena')}
            isMuted={state.soundMuted}
          />
        )}

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
            onCloseDashboard={() => setCurrentTab('arena')}
            isMuted={state.soundMuted}
          />
        )}
      </main>

      {/* Mobile Sticky Thumb Bar (Large Touch Targets >= 64px height) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t-2 border-slate-800 px-4 py-2.5 flex items-center justify-around">
        <button
          onClick={() => handleTabChange('arena')}
          className={`min-h-[52px] min-w-[72px] flex flex-col items-center justify-center gap-1 text-xs font-bold cursor-pointer ${
            currentTab === 'arena' ? 'text-red-400' : 'text-slate-400'
          }`}
        >
          <Gamepad2 className="w-6 h-6" />
          <span>Play</span>
        </button>

        <button
          onClick={() => handleTabChange('workshop')}
          className={`min-h-[52px] min-w-[72px] flex flex-col items-center justify-center gap-1 text-xs font-bold cursor-pointer ${
            currentTab === 'workshop' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <Wrench className="w-6 h-6" />
          <span>Build ({state.bricks} 🧱)</span>
        </button>

        <button
          onClick={() => handleTabChange('parent')}
          className={`min-h-[52px] min-w-[72px] flex flex-col items-center justify-center gap-1 text-xs font-bold cursor-pointer ${
            currentTab === 'parent' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <ShieldCheck className="w-6 h-6" />
          <span>Parents</span>
        </button>
      </div>

      {/* Math Gate Modal for Parent Protection */}
      <MathGateModal
        isOpen={isMathGateOpen}
        onClose={() => setIsMathGateOpen(false)}
        onSuccess={handleMathGateSuccess}
        isMuted={state.soundMuted}
      />

      {/* Footer Stud Strip */}
      <footer className="w-full py-4 text-center text-xs font-bold text-slate-400 border-t border-slate-200 bg-white/60">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <span className="text-sm">🧱</span>
          <span className="font-display font-black text-slate-700">LEGO English Adventure</span>
          <span className="text-slate-300">•</span>
          <span>Kids English Learning PWA</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Audio-first gamification with dual English & Turkish learning support.
        </p>
      </footer>

    </div>
  );
}
