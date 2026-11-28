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
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5 max-w-full">
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

  if (sceneId === 'zoo') {
    return (
      <svg viewBox="0 0 800 600" className="w-full h-full">
        <rect x="0" y="0" width="800" height="320" fill="#bae6fd" />
        <rect x="0" y="320" width="800" height="280" fill="#86efac" />
        {/* 1. SUN (14%, 15%) */}
        <g transform="translate(112, 90)">
          <circle cx="0" cy="0" r="42" fill="#fde047" stroke="#f59e0b" strokeWidth="4" />
          {isChanged ? (
            <>
              <rect x="-24" y="-12" width="20" height="14" rx="4" fill="#0f172a" />
              <rect x="4" y="-12" width="20" height="14" rx="4" fill="#0f172a" />
              <line x1="-4" y1="-6" x2="4" y2="-6" stroke="#0f172a" strokeWidth="4" />
            </>
          ) : (
            <>
              <circle cx="-12" cy="-6" r="4" fill="#0f172a" />
              <circle cx="12" cy="-6" r="4" fill="#0f172a" />
            </>
          )}
          <path d="M -12 12 Q 0 22 12 12" stroke="#0f172a" strokeWidth="3" fill="none" />
        </g>

        {/* Tree & 5. MONKEY (42%, 24%) */}
        <rect x="305" y="180" width="32" height="160" fill="#78350f" />
        <circle cx="321" cy="145" r="78" fill="#22c55e" stroke="#15803d" strokeWidth="5" />
        <g transform="translate(336, 144)">
          <circle cx="0" cy="0" r="22" fill="#92400e" />
          <circle cx="0" cy="4" r="14" fill="#fde68a" />
          <circle cx="-6" cy="-2" r="3" fill="#000" />
          <circle cx="6" cy="-2" r="3" fill="#000" />
          {isChanged && <path d="M 22 -8 Q 38 6 26 24" stroke="#facc15" strokeWidth="8" fill="none" strokeLinecap="round" />}
        </g>

        {/* 3. GIRAFFE (74%, 34%) */}
        <g transform="translate(592, 204)">
          <rect x="-14" y="0" width="24" height="150" rx="10" fill="#facc15" stroke="#ca8a04" strokeWidth="3" />
          <ellipse cx="0" cy="150" rx="42" ry="26" fill="#facc15" stroke="#ca8a04" strokeWidth="3" />
          <circle cx="0" cy="-12" r="22" fill="#facc15" stroke="#ca8a04" strokeWidth="3" />
          <circle cx="-4" cy="40" r="7" fill={isChanged ? '#ef4444' : '#78350f'} />
          <circle cx="4" cy="80" r="8" fill={isChanged ? '#ef4444' : '#78350f'} />
          <circle cx="-12" cy="148" r="9" fill={isChanged ? '#ef4444' : '#78350f'} />
          <circle cx="15" cy="152" r="8" fill={isChanged ? '#ef4444' : '#78350f'} />
        </g>

        {/* 2. LION (25%, 58%) */}
        <g transform="translate(200, 348)">
          <circle cx="0" cy="0" r="44" fill="#d97706" />
          <circle cx="0" cy="0" r="30" fill="#fbbf24" />
          <circle cx="-10" cy="-6" r="4" fill="#000" />
          <circle cx="10" cy="-6" r="4" fill="#000" />
          <polygon points="-5,2 5,2 0,9" fill="#78350f" />
          {isChanged && <polygon points="-20,-34 -10,-54 0,-38 10,-54 20,-34" fill="#fde047" stroke="#b45309" strokeWidth="3" />}
        </g>

        {/* 4. ELEPHANT (52%, 62%) */}
        <g transform="translate(416, 372)">
          <ellipse cx="0" cy="10" rx="56" ry="42" fill="#94a3b8" stroke="#475569" strokeWidth="4" />
          <circle cx="-38" cy="-10" r="32" fill="#94a3b8" stroke="#475569" strokeWidth="4" />
          <path d="M -62 -5 Q -85 20 -68 42" stroke="#64748b" strokeWidth="12" fill="none" strokeLinecap="round" />
          {isChanged && (
            <>
              <path d="M -68 42 Q -95 10 -110 -10" stroke="#38bdf8" strokeWidth="6" strokeDasharray="6 4" fill="none" />
              <circle cx="-112" cy="-14" r="8" fill="#38bdf8" />
            </>
          )}
        </g>

        {/* 6. POND & FISH (68%, 82%) */}
        <ellipse cx="544" cy="492" rx="95" ry="42" fill="#38bdf8" stroke="#0284c7" strokeWidth="4" />
        {isChanged && (
          <g transform="translate(544, 480)">
            <ellipse cx="0" cy="0" rx="22" ry="13" fill="#f97316" stroke="#c2410c" strokeWidth="2" />
            <polygon points="18,0 32,-10 32,10" fill="#f97316" />
          </g>
        )}

        {/* 7. SAFARI JEEP (14%, 80%) */}
        <g transform="translate(112, 480)">
          <rect x="-56" y="-28" width="112" height="52" rx="10" fill={isChanged ? '#ef4444' : '#16a34a'} stroke="#1e293b" strokeWidth="4" />
          <rect x="-36" y="-50" width="60" height="24" rx="4" fill="#bae6fd" stroke="#1e293b" strokeWidth="3" />
          <circle cx="-32" cy="24" r="16" fill="#0f172a" />
          <circle cx="32" cy="24" r="16" fill="#0f172a" />
        </g>
      </svg>
    );
  }

  if (sceneId === 'space') {
    return (
      <svg viewBox="0 0 800 600" className="w-full h-full">
        <rect x="0" y="0" width="800" height="600" fill="#0f172a" />
        <circle cx="90" cy="90" r="3" fill="#fff" />
        <circle cx="480" cy="70" r="3" fill="#fff" />
        <circle cx="710" cy="310" r="3" fill="#fff" />
        <circle cx="290" cy="490" r="3" fill="#fff" />

        {/* 1. PLANET (20%, 24%) */}
        <g transform="translate(160, 144)">
          <circle cx="0" cy="0" r="46" fill={isChanged ? '#a855f7' : '#3b82f6'} />
          {isChanged && <ellipse cx="0" cy="0" rx="76" ry="18" fill="none" stroke="#facc15" strokeWidth="8" transform="rotate(-18)" />}
        </g>

        {/* 5. UFO (34%, 18%) */}
        <g transform="translate(272, 108)">
          {isChanged && <polygon points="-24,14 24,14 48,95 -48,95" fill="#fef08a" opacity="0.45" />}
          <ellipse cx="0" cy="0" rx="44" ry="16" fill="#22c55e" stroke="#15803d" strokeWidth="3" />
          <path d="M -22 -4 Q 0 -32 22 -4 Z" fill="#bae6fd" />
        </g>

        {/* 4. MOON (82%, 18%) */}
        <g transform="translate(656, 108)">
          {isChanged ? (
            <path d="M -10 -38 A 38 38 0 1 0 28 24 A 28 28 0 1 1 -10 -38 Z" fill="#fde047" />
          ) : (
            <circle cx="0" cy="0" r="38" fill="#fde047" />
          )}
        </g>

        {/* 2. ROCKET (50%, 48%) */}
        <g transform="translate(400, 288)">
          {isChanged && <polygon points="-26,65 0,145 26,65" fill="#f97316" stroke="#fde047" strokeWidth="4" />}
          <polygon points="-40,20 -66,68 -36,56" fill="#ef4444" />
          <polygon points="40,20 66,68 36,56" fill="#ef4444" />
          <path d="M 0 -85 Q 46 -20 40 65 L -40 65 Q -46 -20 0 -85 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="4" />
          <circle cx="0" cy="-10" r="20" fill="#38bdf8" stroke="#0284c7" strokeWidth="4" />
        </g>

        {/* 3. ASTRONAUT (76%, 56%) */}
        <g transform="translate(608, 336)">
          <rect x="-24" y="10" width="48" height="54" rx="14" fill="#f8fafc" />
          <circle cx="0" cy="-14" r="26" fill="#f8fafc" />
          <rect x="-16" y="-24" width="32" height="20" rx="8" fill="#38bdf8" />
          {isChanged && (
            <>
              <line x1="28" y1="30" x2="28" y2="-40" stroke="#e2e8f0" strokeWidth="4" />
              <rect x="28" y="-40" width="36" height="24" fill="#ec4899" rx="3" />
            </>
          )}
        </g>

        {/* 6. SHOOTING STAR (16%, 68%) */}
        <g transform="translate(128, 408)">
          {isChanged && <line x1="-60" y1="-25" x2="0" y2="0" stroke="#fde047" strokeWidth="6" strokeLinecap="round" />}
          <text x="0" y="12" fontSize={isChanged ? '46' : '28'} textAnchor="middle">⭐</text>
        </g>

        {/* 7. SPACE ROBOT (64%, 78%) */}
        <g transform="translate(512, 468)">
          <rect x="-32" y="-28" width="64" height="56" rx="10" fill="#94a3b8" stroke="#e2e8f0" strokeWidth="3" />
          <rect x="-22" y="-66" width="44" height="34" rx="8" fill="#cbd5e1" />
          <circle cx="-8" cy="-50" r="4" fill="#0f172a" />
          <circle cx="8" cy="-50" r="4" fill="#0f172a" />
          {isChanged && <text x="0" y="10" fontSize="28" textAnchor="middle">❤️</text>}
        </g>
      </svg>
    );
  }

  if (sceneId === 'beach') {
    return (
      <svg viewBox="0 0 800 600" className="w-full h-full">
        <rect x="0" y="0" width="800" height="230" fill="#bae6fd" />
        <rect x="0" y="230" width="800" height="140" fill="#0ea5e9" />
        <rect x="0" y="370" width="800" height="230" fill="#fde68a" />

        {/* 5. SEAGULLS (36%, 18%) */}
        <path d="M 250 110 Q 268 92 286 110 Q 304 92 322 110" stroke="#1e293b" strokeWidth="4" fill="none" />
        {isChanged && <path d="M 310 78 Q 324 62 338 78 Q 352 62 366 78" stroke="#1e293b" strokeWidth="4" fill="none" />}

        {/* 4. SAILBOAT (76%, 36%) */}
        <g transform="translate(608, 216)">
          <polygon points="-50,20 50,20 35,48 -35,48" fill="#b45309" />
          <polygon points="0,-55 0,18 44,18" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
          {isChanged && <text x="16" y="10" fontSize="22" textAnchor="middle">⭐</text>}
        </g>

        {/* 1. UMBRELLA (22%, 52%) */}
        <g transform="translate(176, 312)">
          <line x1="0" y1="-40" x2="0" y2="110" stroke="#78350f" strokeWidth="8" />
          <path d="M -82 0 Q 0 -86 82 0 Z" fill={isChanged ? '#3b82f6' : '#ef4444'} stroke="#1e293b" strokeWidth="3" />
          <path d="M -32 0 Q 0 -86 32 0 Z" fill={isChanged ? '#facc15' : '#ffffff'} />
        </g>

        {/* 7. BEACH BALL (38%, 66%) */}
        <g transform="translate(304, 396)">
          <circle cx="0" cy="0" r="28" fill={isChanged ? '#a855f7' : '#ef4444'} stroke="#1e293b" strokeWidth="3" />
          <path d="M -20 -18 Q 0 0 -20 18" stroke="#facc15" strokeWidth="8" fill="none" />
        </g>

        {/* 2. SANDCASTLE (50%, 74%) */}
        <g transform="translate(400, 444)">
          <rect x="-52" y="-20" width="104" height="58" fill="#f59e0b" stroke="#b45309" strokeWidth="3" />
          <rect x="-20" y="-54" width="40" height="40" fill="#fbbf24" stroke="#b45309" strokeWidth="3" />
          {isChanged && (
            <>
              <line x1="0" y1="-54" x2="0" y2="-92" stroke="#78350f" strokeWidth="4" />
              <polygon points="0,-92 30,-80 0,-68" fill="#ef4444" />
            </>
          )}
        </g>

        {/* 6. ICE CREAM (16%, 82%) */}
        <g transform="translate(128, 492)">
          <polygon points="-20,0 20,0 0,48" fill="#d97706" />
          <circle cx="0" cy="-12" r="20" fill="#f472b6" />
          {isChanged && <circle cx="0" cy="-36" r="18" fill="#38bdf8" />}
        </g>

        {/* 3. CRAB (74%, 82%) */}
        <g transform="translate(592, 492)">
          <ellipse cx="0" cy="8" rx="28" ry="18" fill="#ef4444" />
          <circle cx="-10" cy="-8" r="5" fill="#000" />
          <circle cx="10" cy="-8" r="5" fill="#000" />
          {isChanged && <rect x="-18" y="-30" width="36" height="16" rx="4" fill="#3b82f6" />}
        </g>
      </svg>
    );
  }

  if (sceneId === 'bakery') {
    return (
      <svg viewBox="0 0 800 600" className="w-full h-full">
        <rect x="0" y="0" width="800" height="360" fill="#fff1f2" />
        <rect x="0" y="360" width="800" height="240" fill="#fde68a" />

        {/* 5. SIGN (18%, 22%) */}
        <g transform="translate(144, 132)">
          <rect x="-54" y="-26" width="108" height="52" rx="10" fill={isChanged ? '#ec4899' : '#10b981'} stroke="#1e293b" strokeWidth="4" />
          <text x="0" y="8" fill="#ffffff" fontSize="22" fontWeight="bold" textAnchor="middle">
            {isChanged ? 'YUM!' : 'OPEN'}
          </text>
        </g>

        {/* 6. TEAPOT (82%, 26%) */}
        <g transform="translate(656, 156)">
          <circle cx="0" cy="10" r="30" fill={isChanged ? '#ef4444' : '#3b82f6'} stroke="#1e293b" strokeWidth="3" />
          <circle cx="0" cy="-22" r="8" fill={isChanged ? '#ef4444' : '#3b82f6'} />
          {isChanged && <path d="M -8 -40 Q 0 -55 -6 -70 M 8 -40 Q 16 -55 10 -70" stroke="#94a3b8" strokeWidth="4" fill="none" />}
        </g>

        {/* 4. BAKER (50%, 28%) */}
        <g transform="translate(400, 168)">
          <circle cx="0" cy="0" r="32" fill="#fed7aa" stroke="#9a3412" strokeWidth="3" />
          <rect x="-26" y="-56" width="52" height="34" rx="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
          <circle cx="-10" cy="-4" r="3.5" fill="#000" />
          <circle cx="10" cy="-4" r="3.5" fill="#000" />
          <path d="M -8 12 Q 0 18 8 12" stroke="#000" strokeWidth="3" fill="none" />
          {isChanged && <line x1="42" y1="45" x2="72" y2="-15" stroke="#92400e" strokeWidth="8" strokeLinecap="round" />}
        </g>

        {/* 1. CAKE (50%, 56%) */}
        <g transform="translate(400, 336)">
          <rect x="-60" y="-20" width="120" height="65" rx="10" fill={isChanged ? '#78350f' : '#ffffff'} stroke="#f472b6" strokeWidth="5" />
          {isChanged && (
            <>
              <rect x="-30" y="-48" width="10" height="28" fill="#facc15" />
              <rect x="-5" y="-48" width="10" height="28" fill="#38bdf8" />
              <rect x="20" y="-48" width="10" height="28" fill="#22c55e" />
            </>
          )}
        </g>

        {/* 2. CROISSANT (22%, 62%) */}
        <g transform="translate(176, 372)">
          <ellipse cx="0" cy="0" rx="44" ry="22" fill="#f59e0b" stroke="#b45309" strokeWidth="3" />
          {isChanged && <circle cx="0" cy="-22" r="14" fill="#ef4444" />}
        </g>

        {/* 3. CUPCAKE (76%, 60%) */}
        <g transform="translate(608, 360)">
          <polygon points="-24,10 24,10 18,44 -18,44" fill="#d97706" />
          <circle cx="0" cy="-4" r="28" fill={isChanged ? '#3b82f6' : '#f472b6'} />
          {isChanged && <circle cx="0" cy="-34" r="9" fill="#ef4444" />}
        </g>

        {/* 7. COOKIE (36%, 82%) */}
        <g transform="translate(288, 492)">
          <circle cx="0" cy="0" r="32" fill="#d97706" stroke="#92400e" strokeWidth="3" />
          {isChanged && (
            <>
              <circle cx="-12" cy="-10" r="5" fill="#451a03" />
              <circle cx="10" cy="-6" r="5" fill="#451a03" />
              <circle cx="-4" cy="12" r="5" fill="#451a03" />
            </>
          )}
        </g>
      </svg>
    );
  }

  if (sceneId === 'pirate') {
    return (
      <svg viewBox="0 0 800 600" className="w-full h-full">
        <rect x="0" y="0" width="800" height="420" fill="#bae6fd" />
        <rect x="0" y="420" width="800" height="180" fill="#0284c7" />
        {/* Ship Mast & Deck */}
        <line x1="400" y1="40" x2="400" y2="380" stroke="#78350f" strokeWidth="14" />
        <polygon points="140,340 660,340 600,450 200,450" fill="#92400e" stroke="#451a03" strokeWidth="5" />

        {/* 1. FLAG (50%, 12%) */}
        <g transform="translate(400, 72)">
          <rect x="4" y="-32" width="96" height="54" fill={isChanged ? '#ef4444' : '#0f172a'} rx="4" />
          <text x="52" y="4" fontSize="24" textAnchor="middle">{isChanged ? '⭐' : '☠️'}</text>
        </g>

        {/* 2. PARROT (28%, 38%) */}
        <g transform="translate(224, 228)">
          <ellipse cx="0" cy="0" rx="22" ry="30" fill={isChanged ? '#ef4444' : '#22c55e'} />
          <circle cx="0" cy="-24" r="16" fill={isChanged ? '#ef4444' : '#22c55e'} />
          <polygon points="12,-24 28,-18 12,-12" fill="#facc15" />
        </g>

        {/* 7. TELESCOPE (74%, 34%) */}
        {isChanged && (
          <g transform="translate(592, 204)">
            <line x1="-28" y1="16" x2="28" y2="-16" stroke="#facc15" strokeWidth="14" strokeLinecap="round" />
            <line x1="0" y1="0" x2="0" y2="60" stroke="#78350f" strokeWidth="5" />
          </g>
        )}

        {/* 5. SHIP WHEEL (50%, 52%) */}
        <g transform="translate(400, 312)">
          <circle cx="0" cy="0" r="34" fill="none" stroke="#78350f" strokeWidth="8" />
          <circle cx="0" cy="0" r="14" fill={isChanged ? '#38bdf8' : '#b45309'} />
        </g>

        {/* 3. TREASURE CHEST (68%, 68%) */}
        <g transform="translate(544, 408)">
          <rect x="-42" y="-12" width="84" height="48" rx="6" fill="#b45309" stroke="#451a03" strokeWidth="4" />
          {isChanged ? (
            <>
              <rect x="-42" y="-36" width="84" height="20" rx="6" fill="#78350f" />
              <circle cx="-16" cy="-12" r="10" fill="#fde047" />
              <circle cx="4" cy="-14" r="10" fill="#fde047" />
              <circle cx="22" cy="-11" r="10" fill="#fde047" />
            </>
          ) : (
            <rect x="-42" y="-20" width="84" height="16" rx="6" fill="#78350f" stroke="#451a03" strokeWidth="3" />
          )}
        </g>

        {/* 4. ANCHOR (18%, 72%) */}
        <g transform="translate(144, 432)">
          <line x1="0" y1="-28" x2="0" y2="28" stroke={isChanged ? '#facc15' : '#64748b'} strokeWidth="8" />
          <path d="M -26 8 Q 0 42 26 8" stroke={isChanged ? '#facc15' : '#64748b'} strokeWidth="8" fill="none" />
        </g>

        {/* 6. WHALE (84%, 80%) */}
        {isChanged && (
          <g transform="translate(672, 480)">
            <ellipse cx="0" cy="10" rx="46" ry="26" fill="#3b82f6" />
            <path d="M 0 -16 Q -12 -46 -26 -38 M 0 -16 Q 12 -46 26 -38" stroke="#bae6fd" strokeWidth="5" fill="none" />
          </g>
        )}
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
