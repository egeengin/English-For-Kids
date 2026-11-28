import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, CheckCircle2, Sparkles, ArrowRight, Paintbrush } from 'lucide-react';
import { speakEnglish, stopSpeech, unlockAudio } from '../utils/speech';
import { playSnap, playStarSparkle, playGentleWobble, playTap, playVictoryFanfare } from '../utils/soundEffects';

const PALETTE = [
  { id: 'pink', name: 'Pink', hex: '#f472b6', ring: 'ring-pink-300', bg: 'bg-pink-400' },
  { id: 'red', name: 'Red', hex: '#ef4444', ring: 'ring-red-300', bg: 'bg-red-500' },
  { id: 'orange', name: 'Orange', hex: '#f97316', ring: 'ring-orange-300', bg: 'bg-orange-500' },
  { id: 'yellow', name: 'Yellow', hex: '#facc15', ring: 'ring-yellow-300', bg: 'bg-yellow-400' },
  { id: 'green', name: 'Green', hex: '#22c55e', ring: 'ring-green-300', bg: 'bg-emerald-500' },
  { id: 'blue', name: 'Blue', hex: '#3b82f6', ring: 'ring-blue-300', bg: 'bg-blue-500' },
  { id: 'purple', name: 'Purple', hex: '#a855f7', ring: 'ring-purple-300', bg: 'bg-purple-500' },
];

const COLOR_HEX = Object.fromEntries(PALETTE.map((c) => [c.id, c.hex]));

const COLORING_SCENES = [
  {
    id: 'clown',
    title: 'Happy Clown',
    emoji: '🤡',
    steps: [
      { partId: 'face', partLabel: 'Face', targetColor: 'pink', prompt: 'Color the face pink!' },
      { partId: 'nose', partLabel: 'Nose', targetColor: 'red', prompt: 'Color the nose red!' },
      { partId: 'hat', partLabel: 'Hat', targetColor: 'blue', prompt: 'Color the hat blue!' },
      { partId: 'bowtie', partLabel: 'Bow Tie', targetColor: 'yellow', prompt: 'Color the bow tie yellow!' },
    ],
  },
  {
    id: 'rocket',
    title: 'Space Rocket',
    emoji: '🚀',
    steps: [
      { partId: 'body', partLabel: 'Rocket Body', targetColor: 'blue', prompt: 'Color the rocket body blue!' },
      { partId: 'window', partLabel: 'Window', targetColor: 'yellow', prompt: 'Color the window yellow!' },
      { partId: 'wings', partLabel: 'Wings', targetColor: 'red', prompt: 'Color the wings red!' },
      { partId: 'flame', partLabel: 'Flame', targetColor: 'orange', prompt: 'Color the flame orange!' },
    ],
  },
  {
    id: 'house',
    title: 'Cozy House',
    emoji: '🏠',
    steps: [
      { partId: 'roof', partLabel: 'Roof', targetColor: 'red', prompt: 'Color the roof red!' },
      { partId: 'walls', partLabel: 'Walls', targetColor: 'yellow', prompt: 'Color the walls yellow!' },
      { partId: 'door', partLabel: 'Door', targetColor: 'green', prompt: 'Color the door green!' },
      { partId: 'sun', partLabel: 'Sun', targetColor: 'orange', prompt: 'Color the sun orange!' },
    ],
  },
  {
    id: 'robot',
    title: 'Friendly Robot',
    emoji: '🤖',
    steps: [
      { partId: 'head', partLabel: 'Head', targetColor: 'purple', prompt: 'Color the head purple!' },
      { partId: 'body', partLabel: 'Body', targetColor: 'blue', prompt: 'Color the body blue!' },
      { partId: 'heart', partLabel: 'Heart', targetColor: 'red', prompt: 'Color the heart red!' },
      { partId: 'boots', partLabel: 'Boots', targetColor: 'green', prompt: 'Color the boots green!' },
    ],
  },
];

export default function ListenColorGame({ onRewardEarned, isMuted = false }) {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [coloredParts, setColoredParts] = useState({});
  const [feedback, setFeedback] = useState('');
  const [wobblePart, setWobblePart] = useState(null);
  const [score, setScore] = useState(0);
  const timerRef = useRef(null);

  const scene = COLORING_SCENES[sceneIdx % COLORING_SCENES.length];
  const isSceneComplete = stepIdx >= scene.steps.length;
  const activeStep = !isSceneComplete ? scene.steps[stepIdx] : null;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      stopSpeech();
    };
  }, []);

  const speakPrompt = useCallback(() => {
    if (!isMuted && activeStep) {
      speakEnglish(activeStep.prompt);
    }
  }, [isMuted, activeStep]);

  useEffect(() => {
    if (!activeStep) return undefined;
    const t = setTimeout(speakPrompt, 280);
    return () => clearTimeout(t);
  }, [sceneIdx, stepIdx, activeStep, speakPrompt]);

  const handlePartClick = (partId) => {
    if (isSceneComplete || !activeStep) return;
    unlockAudio();

    if (!selectedColor) {
      playGentleWobble(isMuted);
      setFeedback('Pick a paint color first! 🎨');
      if (!isMuted) speakEnglish('Pick a paint color first!');
      return;
    }

    playSnap(isMuted);

    const isRightPart = partId === activeStep.partId;
    const isRightColor = selectedColor === activeStep.targetColor;

    if (isRightPart && isRightColor) {
      playStarSparkle(isMuted);
      setColoredParts((prev) => ({ ...prev, [partId]: selectedColor }));
      setFeedback(`Awesome! ${selectedColor} ${activeStep.partLabel}! ✨`);
      setScore((s) => s + 1);
      if (onRewardEarned) onRewardEarned({ stars: 1, bricks: 1 });

      const nextStep = stepIdx + 1;
      if (nextStep >= scene.steps.length) {
        playVictoryFanfare(isMuted);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        if (onRewardEarned) onRewardEarned({ stars: 3, bricks: 1 });
        if (!isMuted) speakEnglish(`Hooray! You colored the ${scene.title}!`);
      } else if (!isMuted) {
        speakEnglish(`Great! ${selectedColor} ${activeStep.partLabel}!`);
      }
      setStepIdx(nextStep);
    } else {
      playGentleWobble(isMuted);
      setWobblePart(partId);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setWobblePart(null), 600);

      if (!isRightColor && isRightPart) {
        setFeedback(`Oops! Try ${activeStep.targetColor} paint!`);
      } else {
        setFeedback(`Oops! Find the ${activeStep.partLabel.toLowerCase()}!`);
      }
      if (!isMuted) speakEnglish(`Try again! ${activeStep.prompt}`);
    }
  };

  const handleNextScene = () => {
    playTap(isMuted);
    stopSpeech();
    setSceneIdx((i) => i + 1);
    setStepIdx(0);
    setColoredParts({});
    setSelectedColor(null);
    setFeedback('');
  };

  const handleSelectScene = (idx) => {
    playTap(isMuted);
    stopSpeech();
    setSceneIdx(idx);
    setStepIdx(0);
    setColoredParts({});
    setSelectedColor(null);
    setFeedback('');
  };

  const fillFor = (partId) => COLOR_HEX[coloredParts[partId]] || '#ffffff';

  return (
    <div className="w-full max-w-4xl mx-auto px-3 py-4">
      <div className="bg-white rounded-3xl shadow-xl border-4 border-pink-200 p-4 sm:p-6 space-y-5">
        {/* Header & Scene Tabs */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-2">
            <span>🎨</span>
            <span>Listen &amp; Color</span>
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {COLORING_SCENES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectScene(idx)}
                className={`px-3 py-1.5 rounded-2xl font-display font-black text-xs sm:text-sm border-2 cursor-pointer transition flex items-center gap-1.5 ${
                  idx === sceneIdx % COLORING_SCENES.length
                    ? 'bg-pink-500 text-white border-pink-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-pink-50'
                }`}
              >
                <span>{s.emoji}</span>
                <span className="hidden sm:inline">{s.title}</span>
              </button>
            ))}
            <span className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 font-black text-xs sm:text-sm border border-amber-300">
              ⭐ {score}
            </span>
          </div>
        </div>

        {/* Instruction Prompt Banner */}
        {activeStep ? (
          <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={() => {
                  playTap(isMuted);
                  unlockAudio();
                  speakPrompt();
                }}
                className="w-14 h-14 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 flex items-center justify-center shadow-md cursor-pointer transition active:scale-95 flex-shrink-0"
                title="Listen"
              >
                <Volume2 className="w-7 h-7" />
              </button>
              <div className="text-left">
                <div className="text-xs font-black uppercase tracking-wider text-yellow-300">
                  Step {stepIdx + 1} of {scene.steps.length} • Pick a paint &amp; tap!
                </div>
                <div className="font-display font-black text-xl sm:text-2xl text-white">
                  {activeStep.prompt}
                </div>
              </div>
            </div>

            {feedback && (
              <span className="px-3.5 py-1.5 rounded-full bg-white/15 text-amber-200 font-display font-black text-xs sm:text-sm">
                {feedback}
              </span>
            )}
          </div>
        ) : (
          <div className="bg-emerald-100 border-3 border-emerald-400 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
              <div>
                <div className="font-display font-black text-xl text-emerald-950 flex items-center gap-1.5">
                  <span>Beautiful {scene.title}!</span>
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-emerald-800">
                  You colored every part! (+3 Bonus ⭐)
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleNextScene}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-sm sm:text-base shadow-md flex items-center gap-2 cursor-pointer transition active:scale-95"
            >
              <span>Next Drawing</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Workspace: Paint Palette + Interactive Coloring SVG */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-5 items-center">
          {/* Paint Palette */}
          <div className="bg-amber-50/80 border-3 border-amber-200 rounded-3xl p-3.5 space-y-2.5">
            <div className="font-display font-black text-xs uppercase tracking-wider text-amber-900 flex items-center justify-center gap-1.5">
              <Paintbrush className="w-4 h-4" />
              <span>Paint Box</span>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-2 gap-2">
              {PALETTE.map((c) => {
                const isActive = selectedColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      playTap(isMuted);
                      unlockAudio();
                      setSelectedColor(c.id);
                      setFeedback('');
                      if (!isMuted) speakEnglish(c.name);
                    }}
                    className={`p-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                      isActive
                        ? `bg-white border-slate-900 ring-4 ${c.ring} scale-105 shadow-md`
                        : 'bg-white/80 hover:bg-white border-amber-200'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full border-2 border-white shadow-inner ${c.bg}`} />
                    <span className="font-display font-black text-[11px] text-slate-800">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive SVG Coloring Canvas */}
          <div className="bg-gradient-to-b from-sky-50 to-white border-4 border-slate-200 rounded-3xl p-4 flex items-center justify-center shadow-inner">
            <svg
              viewBox="0 0 400 320"
              className="w-full max-w-md h-auto select-none"
              role="img"
              aria-label={scene.title}
            >
              {scene.id === 'clown' && (
                <g>
                  {/* Hat */}
                  <g
                    onClick={() => handlePartClick('hat')}
                    className={`cursor-pointer transition-opacity hover:opacity-90 ${wobblePart === 'hat' ? 'animate-wobble' : ''}`}
                  >
                    <polygon
                      points="135,95 200,18 265,95"
                      fill={fillFor('hat')}
                      stroke="#1e293b"
                      strokeWidth="5"
                      strokeLinejoin="round"
                    />
                    <rect
                      x="115"
                      y="90"
                      width="170"
                      height="18"
                      rx="9"
                      fill={fillFor('hat')}
                      stroke="#1e293b"
                      strokeWidth="5"
                    />
                    <circle cx="200" cy="18" r="11" fill="#fde047" stroke="#1e293b" strokeWidth="4" />
                  </g>

                  {/* Face */}
                  <circle
                    cx="200"
                    cy="170"
                    r="72"
                    fill={fillFor('face')}
                    stroke="#1e293b"
                    strokeWidth="5"
                    onClick={() => handlePartClick('face')}
                    className={`cursor-pointer hover:opacity-90 ${wobblePart === 'face' ? 'animate-wobble' : ''}`}
                  />

                  {/* Eyes & Smile (non-blocking) */}
                  <circle cx="174" cy="152" r="9" fill="#1e293b" className="pointer-events-none" />
                  <circle cx="226" cy="152" r="9" fill="#1e293b" className="pointer-events-none" />
                  <circle cx="172" cy="149" r="3" fill="#ffffff" className="pointer-events-none" />
                  <circle cx="224" cy="149" r="3" fill="#ffffff" className="pointer-events-none" />
                  <path
                    d="M 168 194 Q 200 222 232 194"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="5"
                    strokeLinecap="round"
                    className="pointer-events-none"
                  />

                  {/* Nose */}
                  <circle
                    cx="200"
                    cy="174"
                    r="18"
                    fill={fillFor('nose')}
                    stroke="#1e293b"
                    strokeWidth="5"
                    onClick={() => handlePartClick('nose')}
                    className={`cursor-pointer hover:opacity-90 ${wobblePart === 'nose' ? 'animate-wobble' : ''}`}
                  />

                  {/* Bow Tie */}
                  <g
                    onClick={() => handlePartClick('bowtie')}
                    className={`cursor-pointer hover:opacity-90 ${wobblePart === 'bowtie' ? 'animate-wobble' : ''}`}
                  >
                    <polygon points="145,250 200,272 145,294" fill={fillFor('bowtie')} stroke="#1e293b" strokeWidth="5" strokeLinejoin="round" />
                    <polygon points="255,250 200,272 255,294" fill={fillFor('bowtie')} stroke="#1e293b" strokeWidth="5" strokeLinejoin="round" />
                    <circle cx="200" cy="272" r="12" fill={fillFor('bowtie')} stroke="#1e293b" strokeWidth="5" />
                  </g>
                </g>
              )}

              {scene.id === 'rocket' && (
                <g>
                  {/* Flame */}
                  <path
                    d="M 172 230 Q 200 310 228 230 Z"
                    fill={fillFor('flame')}
                    stroke="#1e293b"
                    strokeWidth="5"
                    strokeLinejoin="round"
                    onClick={() => handlePartClick('flame')}
                    className={`cursor-pointer hover:opacity-90 ${wobblePart === 'flame' ? 'animate-wobble' : ''}`}
                  />

                  {/* Wings */}
                  <g
                    onClick={() => handlePartClick('wings')}
                    className={`cursor-pointer hover:opacity-90 ${wobblePart === 'wings' ? 'animate-wobble' : ''}`}
                  >
                    <polygon points="150,175 100,235 155,225" fill={fillFor('wings')} stroke="#1e293b" strokeWidth="5" strokeLinejoin="round" />
                    <polygon points="250,175 300,235 245,225" fill={fillFor('wings')} stroke="#1e293b" strokeWidth="5" strokeLinejoin="round" />
                  </g>

                  {/* Rocket Body */}
                  <path
                    d="M 200 24 Q 255 95 250 230 L 150 230 Q 145 95 200 24 Z"
                    fill={fillFor('body')}
                    stroke="#1e293b"
                    strokeWidth="5"
                    strokeLinejoin="round"
                    onClick={() => handlePartClick('body')}
                    className={`cursor-pointer hover:opacity-90 ${wobblePart === 'body' ? 'animate-wobble' : ''}`}
                  />

                  {/* Window */}
                  <circle
                    cx="200"
                    cy="130"
                    r="28"
                    fill={fillFor('window')}
                    stroke="#1e293b"
                    strokeWidth="5"
                    onClick={() => handlePartClick('window')}
                    className={`cursor-pointer hover:opacity-90 ${wobblePart === 'window' ? 'animate-wobble' : ''}`}
                  />
                </g>
              )}

              {scene.id === 'house' && (
                <g>
                  {/* Sun */}
                  <circle
                    cx="330"
                    cy="56"
                    r="30"
                    fill={fillFor('sun')}
                    stroke="#1e293b"
                    strokeWidth="5"
                    onClick={() => handlePartClick('sun')}
                    className={`cursor-pointer hover:opacity-90 ${wobblePart === 'sun' ? 'animate-wobble' : ''}`}
                  />

                  {/* Roof */}
                  <polygon
                    points="85,145 200,52 315,145"
                    fill={fillFor('roof')}
                    stroke="#1e293b"
                    strokeWidth="5"
                    strokeLinejoin="round"
                    onClick={() => handlePartClick('roof')}
                    className={`cursor-pointer hover:opacity-90 ${wobblePart === 'roof' ? 'animate-wobble' : ''}`}
                  />

                  {/* Walls */}
                  <rect
                    x="105"
                    y="145"
                    width="190"
                    height="145"
                    rx="6"
                    fill={fillFor('walls')}
                    stroke="#1e293b"
                    strokeWidth="5"
                    onClick={() => handlePartClick('walls')}
                    className={`cursor-pointer hover:opacity-90 ${wobblePart === 'walls' ? 'animate-wobble' : ''}`}
                  />

                  {/* Door */}
                  <rect
                    x="172"
                    y="200"
                    width="56"
                    height="90"
                    rx="8"
                    fill={fillFor('door')}
                    stroke="#1e293b"
                    strokeWidth="5"
                    onClick={() => handlePartClick('door')}
                    className={`cursor-pointer hover:opacity-90 ${wobblePart === 'door' ? 'animate-wobble' : ''}`}
                  />
                  <circle cx="216" cy="248" r="4" fill="#1e293b" className="pointer-events-none" />
                </g>
              )}

              {scene.id === 'robot' && (
                <g>
                  {/* Antenna */}
                  <line x1="200" y1="28" x2="200" y2="52" stroke="#1e293b" strokeWidth="5" />
                  <circle cx="200" cy="22" r="9" fill="#fde047" stroke="#1e293b" strokeWidth="4" />

                  {/* Head */}
                  <rect
                    x="145"
                    y="52"
                    width="110"
                    height="78"
                    rx="18"
                    fill={fillFor('head')}
                    stroke="#1e293b"
                    strokeWidth="5"
                    onClick={() => handlePartClick('head')}
                    className={`cursor-pointer hover:opacity-90 ${wobblePart === 'head' ? 'animate-wobble' : ''}`}
                  />
                  <circle cx="176" cy="86" r="9" fill="#1e293b" className="pointer-events-none" />
                  <circle cx="224" cy="86" r="9" fill="#1e293b" className="pointer-events-none" />
                  <line x1="178" y1="112" x2="222" y2="112" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" className="pointer-events-none" />

                  {/* Body */}
                  <rect
                    x="130"
                    y="140"
                    width="140"
                    height="105"
                    rx="18"
                    fill={fillFor('body')}
                    stroke="#1e293b"
                    strokeWidth="5"
                    onClick={() => handlePartClick('body')}
                    className={`cursor-pointer hover:opacity-90 ${wobblePart === 'body' ? 'animate-wobble' : ''}`}
                  />

                  {/* Heart */}
                  <path
                    d="M 200 218 C 165 194, 165 166, 186 166 C 194 166, 200 174, 200 174 C 200 174, 206 166, 214 166 C 235 166, 235 194, 200 218 Z"
                    fill={fillFor('heart')}
                    stroke="#1e293b"
                    strokeWidth="4.5"
                    onClick={() => handlePartClick('heart')}
                    className={`cursor-pointer hover:opacity-90 ${wobblePart === 'heart' ? 'animate-wobble' : ''}`}
                  />

                  {/* Boots */}
                  <g
                    onClick={() => handlePartClick('boots')}
                    className={`cursor-pointer hover:opacity-90 ${wobblePart === 'boots' ? 'animate-wobble' : ''}`}
                  >
                    <rect x="142" y="254" width="44" height="36" rx="10" fill={fillFor('boots')} stroke="#1e293b" strokeWidth="5" />
                    <rect x="214" y="254" width="44" height="36" rx="10" fill={fillFor('boots')} stroke="#1e293b" strokeWidth="5" />
                  </g>
                </g>
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
