import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Volume2,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { SCENES_DATA } from '../data/scenesData';
import { speakEnglish, stopSpeech } from '../utils/speech';
import { playSnap, playVictoryFanfare, playStarSparkle, playTap, playGentleWobble } from '../utils/soundEffects';
import VoiceRecorderWidget from './VoiceRecorderWidget';

export default function SceneExplorer({
  onRewardEarned,
  onNavigateToWorkshop: _onNavigateToWorkshop,
  isMuted = false,
}) {
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [foundDiffIds, setFoundDiffIds] = useState(new Set());
  const [activeItem, setActiveItem] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [missPoint, setMissPoint] = useState(null);
  const missTimerRef = useRef(null);

  const currentScene = SCENES_DATA[selectedSceneIndex] || SCENES_DATA[0];
  const totalDifferences = currentScene.differences.length;
  const foundCount = foundDiffIds.size;

  useEffect(() => {
    return () => {
      stopSpeech();
      if (missTimerRef.current) clearTimeout(missTimerRef.current);
    };
  }, []);

  const selectScene = (idx) => {
    setSelectedSceneIndex(idx);
    setFoundDiffIds(new Set());
    setActiveItem(null);
    setIsCompleted(false);
    setShowHint(false);
    setMissPoint(null);
  };

  // Handle clicking an empty spot (not a difference)
  const handleMissClick = (panel, e) => {
    if (isCompleted) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    playGentleWobble(isMuted);
    setMissPoint({ panel, x, y });
    if (missTimerRef.current) clearTimeout(missTimerRef.current);
    missTimerRef.current = setTimeout(() => setMissPoint(null), 900);
  };

  // Handle clicking a difference hotspot
  const handleSpotClick = (diff, e) => {
    if (e) e.stopPropagation();
    setMissPoint(null);
    playSnap(isMuted);

    const isNewFind = !foundDiffIds.has(diff.id);

    if (isNewFind) {
      playStarSparkle(isMuted);
      const updated = new Set(foundDiffIds);
      updated.add(diff.id);
      setFoundDiffIds(updated);

      // Reward 1 Lego brick for discovering a difference
      if (onRewardEarned) {
        onRewardEarned({ stars: 1, bricks: 1 });
      }

      // Check if all differences in the scene are found
      if (updated.size === totalDifferences) {
        setIsCompleted(true);
        playVictoryFanfare(isMuted);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
        if (onRewardEarned) {
          onRewardEarned({ stars: 5, bricks: 3 });
        }
      }
    }

    setActiveItem(diff);

    // Pronounce the word and explain what changed!
    if (!isMuted) {
      const spokenLine = diff.differenceText
        ? `${diff.name}! ${diff.differenceText}`
        : (diff.audioKey || diff.targetWord);
      speakEnglish(spokenLine);
    }
  };

  // Switch to next scene
  const handleNextScene = () => {
    playTap(isMuted);
    const nextIndex = (selectedSceneIndex + 1) % SCENES_DATA.length;
    selectScene(nextIndex);
  };

  // Reset current scene
  const handleResetScene = () => {
    playTap(isMuted);
    setFoundDiffIds(new Set());
    setActiveItem(null);
    setIsCompleted(false);
    setShowHint(false);
  };

  return (
    <div className="w-full max-w-none px-3 sm:px-6 lg:px-10 py-4 flex-1 flex flex-col items-center">
      
      {/* Header & Scene Selector */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 bg-white p-3 sm:p-4 rounded-2xl shadow-sm border-2 border-slate-200">
        
        {/* Compact Title */}
        <div className="flex items-center gap-2.5">
          <span className="text-3xl">🔍</span>
          <h2 className="font-display font-black text-lg sm:text-xl text-slate-900">
            Spot 7 Differences
          </h2>
        </div>

        {/* Scene Selection Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {SCENES_DATA.map((scene, idx) => {
            const isCurrent = idx === selectedSceneIndex;
            return (
              <button
                key={scene.id}
                onClick={() => {
                  playTap(isMuted);
                  selectScene(idx);
                }}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display font-black text-xs transition-all whitespace-nowrap
                  ${isCurrent
                    ? `${scene.badgeColor} text-white shadow-md border-2 ${scene.borderColor} scale-105`
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-2 border-slate-200'}
                `}
              >
                <span>{scene.icon}</span>
                <span>{scene.title.replace('The Lego ', '')}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Progress & Controls Strip */}
      <div className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-lg border-2 border-slate-800 mb-4 flex flex-wrap items-center justify-between gap-3">
        
        {/* Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-xl border border-yellow-400/40 text-sm font-black font-display">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span>{foundCount} / {totalDifferences} Found</span>
          </div>

          <div className="hidden xs:flex items-center gap-1 text-xs font-bold text-slate-300">
            <span>Reward:</span>
            <span className="text-blue-400 font-mono font-black">+1 🧱 per find</span>
          </div>
        </div>

        {/* Hint & Reset */}
        <div className="flex items-center gap-2">
          {/* Hint Button */}
          <button
            onClick={() => {
              playTap(isMuted);
              setShowHint(!showHint);
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-bold transition-all cursor-pointer"
            title="Need a hint?"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Hint</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleResetScene}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Reset scene differences"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Hint Alert Box */}
      {showHint && (
        <div className="w-full bg-amber-50 border-2 border-amber-300 text-amber-900 rounded-2xl p-3 mb-4 flex items-center justify-between text-xs font-bold animate-fadeIn shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <span>
              {currentScene.differences.find(d => !foundDiffIds.has(d.id))?.hint || 'Great job! You found all differences!'}
            </span>
          </div>
          <button
            onClick={() => setShowHint(false)}
            className="text-amber-700 hover:text-amber-900 font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Interactive Scene Canvas Container */}
      <div className="w-full grid gap-4 mb-4 grid-cols-1 md:grid-cols-2">

        {/* Scene 1: Original Scene Panel */}
        <div className="relative bg-white rounded-2xl shadow-md border-4 border-slate-300 overflow-hidden flex flex-col">
          {/* Lego top header */}
          <div className="w-full bg-slate-200 border-b-2 border-slate-300 px-3 py-1.5 flex items-center justify-between">
            <span className="text-xs font-black font-display text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>🖼️</span> Picture A
            </span>
          </div>

          {/* SVG Scene Graphic */}
          <div
            onClick={(e) => handleMissClick('orig', e)}
            className="relative w-full aspect-[4/3] bg-gradient-to-b from-sky-100 to-amber-50 select-none cursor-crosshair"
          >
            <SceneGraphic sceneId={currentScene.id} variant="original" />

            {missPoint?.panel === 'orig' && (
              <div
                style={{ left: `${missPoint.x}%`, top: `${missPoint.y}%` }}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-full bg-rose-500 text-white font-black text-xs shadow-md"
              >
                👀 Look closer!
              </div>
            )}

            {/* Clickable Hotspots overlay on Original (completely hidden until found!) */}
            {currentScene.differences.map((diff) => {
              const isFound = foundDiffIds.has(diff.id);
              return (
                <button
                  key={`orig-${diff.id}`}
                  type="button"
                  onClick={(e) => handleSpotClick(diff, e)}
                  style={{
                    left: `${diff.x}%`,
                    top: `${diff.y}%`,
                    width: `${Math.max(diff.r * 2.1, 10)}%`,
                    height: `${Math.max(diff.r * 2.1, 10)}%`,
                  }}
                  className={`
                    absolute -translate-x-1/2 -translate-y-1/2 rounded-full cursor-crosshair transition-all duration-300
                    flex items-center justify-center
                    ${isFound
                      ? 'border-4 border-emerald-500 bg-emerald-400/25 shadow-lg scale-105'
                      : 'border-0 bg-transparent'}
                  `}
                  aria-label={isFound ? diff.name : 'Hidden spot'}
                >
                  {isFound && (
                    <div className="bg-emerald-500 text-white font-black text-xs px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">{diff.emoji}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scene 2: The Differences Scene Panel */}
        <div className="relative bg-white rounded-2xl shadow-md border-4 border-amber-400 overflow-hidden flex flex-col">
          {/* Lego top header */}
          <div className="w-full bg-amber-100 border-b-2 border-amber-300 px-3 py-1.5 flex items-center justify-between">
            <span className="text-xs font-black font-display text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>🔍</span> Picture B — Spot 7 Changes!
            </span>
            <span className="text-xs font-black text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full">
              {foundCount} / 7
            </span>
          </div>

          {/* SVG Scene Graphic with real visual differences */}
          <div
            onClick={(e) => handleMissClick('diff', e)}
            className="relative w-full aspect-[4/3] bg-gradient-to-b from-sky-100 to-amber-50 select-none cursor-crosshair"
          >
            <SceneGraphic sceneId={currentScene.id} variant="changed" />

            {missPoint?.panel === 'diff' && (
              <div
                style={{ left: `${missPoint.x}%`, top: `${missPoint.y}%` }}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-full bg-rose-500 text-white font-black text-xs shadow-md"
              >
                👀 Look closer!
              </div>
            )}

            {/* Clickable Hotspots overlay on Differences (completely hidden until found!) */}
            {currentScene.differences.map((diff) => {
              const isFound = foundDiffIds.has(diff.id);
              return (
                <button
                  key={`diff-${diff.id}`}
                  type="button"
                  onClick={(e) => handleSpotClick(diff, e)}
                  style={{
                    left: `${diff.x}%`,
                    top: `${diff.y}%`,
                    width: `${Math.max(diff.r * 2.1, 10)}%`,
                    height: `${Math.max(diff.r * 2.1, 10)}%`,
                  }}
                  className={`
                    absolute -translate-x-1/2 -translate-y-1/2 rounded-full cursor-crosshair transition-all duration-300
                    flex items-center justify-center
                    ${isFound
                      ? 'border-4 border-emerald-500 bg-emerald-400/25 shadow-lg scale-105'
                      : 'border-0 bg-transparent'}
                  `}
                  aria-label={isFound ? diff.name : 'Hidden spot'}
                >
                  {isFound && (
                    <div className="bg-emerald-500 text-white font-black text-xs px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{diff.name}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Active Word Audio & Translation Popover */}
      {activeItem && (
        <div className="w-full bg-white rounded-2xl shadow-xl border-4 border-yellow-400 p-4 mb-4 animate-scaleUp">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Left: Emoji, Word, Syllables */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 shadow-inner flex items-center justify-center text-3xl">
                {activeItem.emoji}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-2xl text-slate-800">
                    {activeItem.name}
                  </span>
                  <button
                    onClick={() => speakEnglish(activeItem.audioKey || activeItem.targetWord)}
                    className="p-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 shadow-sm transition-all"
                    title="Replay English pronunciation"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span>{activeItem.syllables}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-400">{activeItem.phonetic}</span>
                </div>
                <p className="text-xs text-amber-700 font-bold mt-0.5">
                  {activeItem.differenceText}
                </p>
              </div>
            </div>

          </div>

          {/* Voice Echo Studio Widget: Practice speaking out loud! */}
          <div className="mt-3 pt-3 border-t border-yellow-200">
            <VoiceRecorderWidget
              targetWord={activeItem.name}
              targetAudioKey={activeItem.audioKey || activeItem.targetWord}
              onRewardEarned={onRewardEarned}
              isMuted={isMuted}
            />
          </div>

        </div>
      )}

      {/* Completion Modal / Celebration */}
      {isCompleted && (
        <div className="w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 text-slate-950 rounded-2xl shadow-xl p-5 mb-4 border-4 border-yellow-500 animate-bounce">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white text-3xl flex items-center justify-center shadow-md">
                🏆
              </div>
              <div>
                <h3 className="font-display font-black text-xl text-slate-900">
                  Awesome! All 7 Differences Found!
                </h3>
                <p className="text-xs font-bold text-slate-800">
                  You earned +5 Stars ⭐!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleNextScene}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-950 text-white font-display font-black text-sm shadow-md hover:bg-slate-900 transition-all cursor-pointer"
              >
                <span>Next Scene</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * Procedural SVG Graphic Renderer for Lego Scenes
 * Provides high-contrast, scalable, child-friendly visuals for Classroom, Playground, and City scenes.
 */
function SceneGraphic({ sceneId, variant = 'original' }) {
  const isChanged = variant === 'changed';

  if (sceneId === 'classroom') {
    return (
      <svg viewBox="0 0 800 600" className="w-full h-full">
        {/* Wall & Floor */}
        <rect x="0" y="0" width="800" height="420" fill="#f8fafc" />
        <rect x="0" y="420" width="800" height="180" fill="#e2e8f0" />
        <line x1="0" y1="420" x2="800" y2="420" stroke="#cbd5e1" strokeWidth="6" />

        {/* Blackboard in Center */}
        <rect x="260" y="60" width="280" height="150" rx="12" fill="#1e293b" stroke="#92400e" strokeWidth="10" />
        <text x="400" y="115" fill="#fef08a" fontSize="24" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
          LEGO SCHOOL 🏫
        </text>
        <text x="400" y="150" fill="#a7f3d0" fontSize="18" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
          ABC • 1 2 3
        </text>

        {/* 1. CLOCK (top center) - Difference: 3:00 white vs 9:00 yellow */}
        <g transform="translate(400, 60)">
          <circle cx="0" cy="0" r="28" fill={isChanged ? '#fef08a' : '#ffffff'} stroke="#ef4444" strokeWidth="5" />
          <circle cx="0" cy="0" r="3" fill="#000000" />
          <line x1="0" y1="0" x2="0" y2="-18" stroke="#000000" strokeWidth="3" />
          <line
            x1="0"
            y1="0"
            x2={isChanged ? -16 : 16}
            y2="0"
            stroke="#ef4444"
            strokeWidth="4"
          />
        </g>

        {/* Left Bookshelf & 4. GLOBE */}
        <rect x="40" y="120" width="160" height="240" rx="8" fill="#d97706" stroke="#b45309" strokeWidth="6" />
        <rect x="50" y="180" width="140" height="10" fill="#b45309" />
        <rect x="50" y="260" width="140" height="10" fill="#b45309" />
        {/* Books on shelf */}
        <rect x="60" y="200" width="20" height="60" fill="#3b82f6" rx="3" />
        <rect x="85" y="210" width="18" height="50" fill="#10b981" rx="3" />
        <rect x="110" y="195" width="22" height="65" fill="#f59e0b" rx="3" />
        {/* Globe - Difference: Earth vs Ringed Space Globe */}
        <g transform="translate(144, 228)">
          <path d="M -15 25 L 15 25 L 0 0 Z" fill="#64748b" />
          <circle cx="0" cy="-12" r="22" fill={isChanged ? '#a855f7' : '#0284c7'} stroke="#38bdf8" strokeWidth="2" />
          <circle cx="-5" cy="-15" r="8" fill={isChanged ? '#fde047' : '#22c55e'} />
          <circle cx="8" cy="-8" r="6" fill={isChanged ? '#fde047' : '#22c55e'} />
          {isChanged && (
            <ellipse cx="0" cy="-12" rx="30" ry="7" fill="none" stroke="#facc15" strokeWidth="3.5" transform="rotate(-18 0 -12)" />
          )}
        </g>

        {/* Right Bookshelf & 6. BOOK */}
        <rect x="600" y="120" width="160" height="240" rx="8" fill="#d97706" stroke="#b45309" strokeWidth="6" />
        <rect x="610" y="180" width="140" height="10" fill="#b45309" />
        <rect x="610" y="260" width="140" height="10" fill="#b45309" />
        {/* Book - Difference: Closed Red Book vs Open Book with Star */}
        <g transform="translate(680, 240)">
          {isChanged ? (
            <>
              <path d="M -28 -12 Q 0 -6 28 -12 L 28 16 Q 0 22 -28 16 Z" fill="#ffffff" stroke="#334155" strokeWidth="2.5" />
              <line x1="0" y1="-9" x2="0" y2="19" stroke="#334155" strokeWidth="2" />
              <text x="13" y="8" fontSize="16" textAnchor="middle">⭐</text>
            </>
          ) : (
            <>
              <rect x="-18" y="-14" width="36" height="30" rx="4" fill="#ef4444" stroke="#991b1b" strokeWidth="2.5" />
              <line x1="-10" y1="-14" x2="-10" y2="16" stroke="#fee2e2" strokeWidth="2" />
            </>
          )}
        </g>

        {/* Teacher Desk & Minifigure in Center */}
        <rect x="250" y="320" width="300" height="130" rx="10" fill="#b45309" stroke="#78350f" strokeWidth="6" />
        {/* Teacher Minifigure */}
        <circle cx="400" cy="275" r="24" fill="#fde047" stroke="#ca8a04" strokeWidth="3" />
        <rect x="382" y="299" width="36" height="40" rx="8" fill="#dc2626" />
        {/* Teacher Face */}
        <circle cx="392" cy="272" r="3" fill="#000000" />
        <circle cx="408" cy="272" r="3" fill="#000000" />
        <path d="M 394 283 Q 400 288 406 283" stroke="#000000" strokeWidth="2.5" fill="none" />

        {/* 2. APPLE on Teacher Desk - Difference: Red vs Green */}
        <g transform="translate(340, 310)">
          <circle cx="0" cy="0" r="16" fill={isChanged ? '#22c55e' : '#ef4444'} stroke="#991b1b" strokeWidth="2" />
          <path d="M 0 -16 Q 4 -24 8 -20" stroke="#78350f" strokeWidth="3" fill="none" />
          <ellipse cx="6" cy="-18" rx="4" ry="2" fill="#15803d" />
        </g>

        {/* 3. PENCIL on Teacher Desk - Difference: Present vs Missing */}
        <g transform="translate(460, 316)">
          {!isChanged && (
            <>
              <rect x="0" y="0" width="36" height="9" rx="2" fill="#eab308" stroke="#a16207" strokeWidth="1.5" />
              <polygon points="36,0 44,4.5 36,9" fill="#fed7aa" stroke="#a16207" strokeWidth="1" />
            </>
          )}
        </g>

        {/* 5. BACKPACK on Left Student Chair */}
        <g transform="translate(176, 468)">
          <rect x="-24" y="-30" width="48" height="60" rx="10" fill={isChanged ? '#ef4444' : '#2563eb'} stroke="#1e3a8a" strokeWidth="4" />
          <rect x="-14" y="-12" width="28" height="24" rx="4" fill="#ffffff" />
          <circle cx="0" cy="0" r="4" fill="#f59e0b" />
        </g>

        {/* 7. SCISSORS on Right Student Table - Difference: Missing on Left, Orange on Right */}
        {isChanged && (
          <g transform="translate(610, 446)">
            <circle cx="-10" cy="0" r="9" fill="none" stroke="#f97316" strokeWidth="4" />
            <circle cx="10" cy="0" r="9" fill="none" stroke="#f97316" strokeWidth="4" />
            <line x1="-5" y1="-6" x2="18" y2="-28" stroke="#475569" strokeWidth="4" />
            <line x1="5" y1="-6" x2="-18" y2="-28" stroke="#475569" strokeWidth="4" />
          </g>
        )}
      </svg>
    );
  }

  if (sceneId === 'playground') {
    return (
      <svg viewBox="0 0 800 600" className="w-full h-full">
        {/* Sky & Grass */}
        <rect x="0" y="0" width="800" height="360" fill="#bae6fd" />
        <rect x="0" y="360" width="800" height="240" fill="#86efac" />
        {/* Sun */}
        <circle cx="700" cy="80" r="45" fill="#fde047" stroke="#facc15" strokeWidth="4" />

        {/* 4. BALLOON - Top right */}
        <g transform="translate(704, 110)">
          <ellipse cx="0" cy="0" rx="18" ry="24" fill={isChanged ? '#ef4444' : '#3b82f6'} />
          <path d="M 0 24 Q 5 45 -5 65" stroke="#475569" strokeWidth="1.5" fill="none" />
        </g>

        {/* 5. KITE - Top left */}
        <g transform="translate(112, 96)">
          <polygon points="0,-25 20,0 0,25 -20,0" fill={isChanged ? '#f59e0b' : '#ec4899'} stroke="#be185d" strokeWidth="2" />
          <path d={isChanged ? 'M 0 25 Q 18 50 4 85' : 'M 0 25 Q 15 45 5 70'} stroke="#f43f5e" strokeWidth="2.5" fill="none" />
          {isChanged && (
            <>
              <polygon points="3,48 13,44 13,52" fill="#3b82f6" />
              <polygon points="15,48 5,44 5,52" fill="#3b82f6" />
              <polygon points="1,68 11,64 11,72" fill="#10b981" />
              <polygon points="13,68 3,64 3,72" fill="#10b981" />
            </>
          )}
        </g>

        {/* 6. BIG TREE in Center */}
        <g transform="translate(416, 192)">
          <rect x="-18" y="40" width="36" height="120" fill="#78350f" rx="4" />
          <circle cx="0" cy="0" r="75" fill="#22c55e" stroke="#16a34a" strokeWidth="6" />
          {isChanged && (
            <>
              <circle cx="-25" cy="-15" r="8" fill="#facc15" />
              <circle cx="30" cy="10" r="8" fill="#facc15" />
              <circle cx="0" cy="-35" r="8" fill="#facc15" />
            </>
          )}
        </g>

        {/* 1. SLIDE on Left */}
        <g transform="translate(192, 276)">
          <polygon points="-40,120 -30,120 40,-30 30,-30" fill="#64748b" />
          <path
            d="M 30 -30 Q 80 50 140 120"
            stroke={isChanged ? '#ef4444' : '#eab308'}
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* 2. SWING on Right */}
        <g transform="translate(608, 264)">
          <line x1="-50" y1="-80" x2="-20" y2="80" stroke="#047857" strokeWidth="6" />
          <line x1="50" y1="-80" x2="20" y2="80" stroke="#047857" strokeWidth="6" />
          <line x1="-60" y1="-80" x2="60" y2="-80" stroke="#047857" strokeWidth="8" />
          <line x1="-15" y1="-80" x2="-15" y2="30" stroke="#94a3b8" strokeWidth="2" />
          <line x1="15" y1="-80" x2="15" y2="30" stroke="#94a3b8" strokeWidth="2" />
          <rect x="-22" y="30" width="44" height="10" fill="#d97706" rx="3" />
          {isChanged && <text x="0" y="24" fontSize="18" textAnchor="middle">🧸</text>}
        </g>

        {/* 3. SOCCER BALL in Foreground */}
        <g transform="translate(384, 492)">
          <circle cx="0" cy="0" r="22" fill="#ffffff" stroke="#000000" strokeWidth="3" />
          {isChanged ? (
            <circle cx="0" cy="0" r="12" fill="#f97316" />
          ) : (
            <polygon points="0,-8 7,-2 4,7 -4,7 -7,-2" fill="#000000" />
          )}
        </g>

        {/* 7. SKATEBOARD on Bottom Left */}
        <g transform="translate(144, 504)">
          <rect x="-35" y="-6" width="70" height="12" rx="6" fill={isChanged ? '#f97316' : '#3b82f6'} stroke="#1e293b" strokeWidth="2" />
          <circle cx="-20" cy="10" r="6" fill="#000000" />
          <circle cx="20" cy="10" r="6" fill="#000000" />
        </g>
      </svg>
    );
  }

  // City Scene
  return (
    <svg viewBox="0 0 800 600" className="w-full h-full">
      {/* Sky & Road */}
      <rect x="0" y="0" width="800" height="300" fill="#93c5fd" />
      <rect x="0" y="300" width="800" height="300" fill="#334155" />
      {/* Road Dashes */}
      <line x1="0" y1="450" x2="800" y2="450" stroke="#facc15" strokeWidth="8" strokeDasharray="40 30" />

      {/* 6. BRIDGE in Distance - Difference: Grey Stone vs Red Suspension Bridge */}
      <g transform="translate(400, 108)">
        <path d="M -160 80 Q 0 0 160 80" stroke={isChanged ? '#ef4444' : '#94a3b8'} strokeWidth={isChanged ? '10' : '6'} fill="none" />
        <line x1="-80" y1="45" x2="-80" y2="80" stroke={isChanged ? '#ef4444' : '#94a3b8'} strokeWidth="4" />
        <line x1="80" y1="45" x2="80" y2="80" stroke={isChanged ? '#ef4444' : '#94a3b8'} strokeWidth="4" />
        {isChanged && <line x1="0" y1="20" x2="0" y2="80" stroke="#ef4444" strokeWidth="4" />}
      </g>

      {/* 7. BUILDING on Right - Difference: Flat Roof vs Golden Clock Tower */}
      <g transform="translate(656, 132)">
        <rect x="-40" y="-80" width="80" height="160" fill="#0284c7" rx="4" />
        <rect x="-30" y="-70" width="16" height="16" fill="#fef08a" />
        <rect x="14" y="-70" width="16" height="16" fill="#fef08a" />
        <rect x="-30" y="-40" width="16" height="16" fill="#fef08a" />
        <rect x="14" y="-40" width="16" height="16" fill="#fef08a" />
        {isChanged && (
          <>
            <polygon points="-24,-80 0,-118 24,-80" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
            <circle cx="0" cy="-94" r="9" fill="#ffffff" stroke="#b45309" strokeWidth="2" />
          </>
        )}
      </g>

      {/* 3. TRAFFIC LIGHT in Center */}
      <g transform="translate(416, 210)">
        <rect x="-6" y="0" width="12" height="110" fill="#475569" />
        <rect x="-18" y="-65" width="36" height="75" rx="8" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
        <circle cx="0" cy="-45" r="8" fill={isChanged ? '#475569' : '#ef4444'} />
        <circle cx="0" cy="-25" r="8" fill="#eab308" opacity={0.3} />
        <circle cx="0" cy="-5" r="8" fill={isChanged ? '#22c55e' : '#475569'} />
      </g>

      {/* 1. SCHOOL BUS on Left Lane - Difference: Headlight & Roof Beacon ON */}
      <g transform="translate(256, 336)">
        <rect x="-80" y="-45" width="160" height="90" rx="14" fill="#eab308" stroke="#ca8a04" strokeWidth="4" />
        <rect x="-70" y="-35" width="35" height="30" rx="4" fill="#bae6fd" />
        <rect x="-20" y="-35" width="35" height="30" rx="4" fill="#bae6fd" />
        <rect x="30" y="-35" width="35" height="30" rx="4" fill="#bae6fd" />
        <circle cx="-50" cy="45" r="18" fill="#000000" />
        <circle cx="50" cy="45" r="18" fill="#000000" />
        {isChanged ? (
          <>
            <polygon points="82,12 135,-8 135,36" fill="#fef08a" opacity="0.55" />
            <circle cx="78" cy="20" r="10" fill="#fef08a" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="0" cy="-52" r="9" fill="#facc15" />
          </>
        ) : (
          <circle cx="78" cy="20" r="6" fill="#64748b" />
        )}
      </g>

      {/* 2. POLICE CAR on Right Lane */}
      <g transform="translate(592, 372)">
        <rect x="-60" y="-30" width="120" height="60" rx="12" fill="#ffffff" stroke="#1e293b" strokeWidth="4" />
        <rect x="-60" y="0" width="120" height="20" fill="#1e3a8a" />
        <circle cx="-35" cy="30" r="14" fill="#000000" />
        <circle cx="35" cy="30" r="14" fill="#000000" />
        {/* Siren: Red vs Glowing Blue */}
        <polygon points="-10,-32 10,-32 0,-46" fill={isChanged ? '#3b82f6' : '#ef4444'} />
        {isChanged && <circle cx="0" cy="-42" r="14" fill="#60a5fa" opacity="0.45" />}
      </g>

      {/* 4. SCOOTER on Sidewalk - Difference: Absent on Left, Green Scooter on Right */}
      {isChanged && (
        <g transform="translate(96, 444)">
          <line x1="0" y1="0" x2="0" y2="-45" stroke="#10b981" strokeWidth="6" />
          <line x1="-14" y1="-45" x2="14" y2="-45" stroke="#1e293b" strokeWidth="5" />
          <rect x="-26" y="0" width="52" height="9" rx="4" fill="#10b981" />
          <circle cx="-25" cy="9" r="8" fill="#000000" />
          <circle cx="25" cy="9" r="8" fill="#000000" />
        </g>
      )}

      {/* 5. STOP SIGN on Right Edge - Difference: Absent on Left, Red STOP Sign on Right */}
      {isChanged && (
        <g transform="translate(704, 252)">
          <rect x="-4" y="0" width="8" height="90" fill="#94a3b8" />
          <polygon
            points="0,-30 22,-22 30,0 22,22 0,30 -22,22 -30,0 -22,-22"
            fill="#ef4444"
            stroke="#ffffff"
            strokeWidth="3"
          />
          <text x="0" y="5" fill="#ffffff" fontSize="11" fontWeight="black" textAnchor="middle">
            STOP
          </text>
        </g>
      )}
    </svg>
  );
}
