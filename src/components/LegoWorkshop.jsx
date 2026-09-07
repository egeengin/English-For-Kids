import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Rocket,
  Car,
  Castle,
  Lock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Hammer,
  Trophy,
  Layers,
  Flame,
  Gauge,
  Flag,
  RotateCcw,
} from 'lucide-react';
import LegoBrick from './LegoBrick';
import { LEGO_BUILD_MODELS, LEO_ACCESSORIES } from '../data/curriculum';
import {
  playLegoSnap,
  playStarSparkle,
  playFanfare,
  playGentleWobble,
  playTap,
} from '../utils/soundEffects';

export default function LegoWorkshop({
  unlockedStages,
  bricks,
  onUnlockStage,
  onNavigateToArena,
  isMuted,
  unlockedAccessories = ['cap'],
  equippedAccessory = 'cap',
  onUnlockAccessory,
  onEquipAccessory,
}) {
  const [selectedModelId, setSelectedModelId] = useState('rocket'); // 'rocket' | 'racecar' | 'castle' | 'minifigure'
  const [justBuiltStage, setJustBuiltStage] = useState(null);

  const isMinifigureTab = selectedModelId === 'minifigure';
  const currentModel = LEGO_BUILD_MODELS.find(m => m.id === selectedModelId) || LEGO_BUILD_MODELS[0];
  const modelUnlockedStages = unlockedStages[selectedModelId] || [];

  // Determine next stage to unlock
  const nextStage = currentModel.stages.find(s => !modelUnlockedStages.includes(s.stage));
  const isModelFullyBuilt = modelUnlockedStages.length === currentModel.stages.length;

  const handleBuildStage = (stage) => {
    if (bricks < stage.cost) {
      playGentleWobble(isMuted);
      return;
    }

    // Deduct bricks and unlock
    playLegoSnap(isMuted);
    playStarSparkle(isMuted);
    setJustBuiltStage(stage.stage);

    onUnlockStage(selectedModelId, stage.stage, stage.cost);

    // If this completed the model, trigger celebration!
    if (modelUnlockedStages.length + 1 === currentModel.stages.length) {
      playFanfare(isMuted);
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#FFD700', '#E52521', '#0055BF', '#237841', '#FF7F00'],
      });
    }

    setTimeout(() => {
      setJustBuiltStage(null);
    }, 800);
  };

  // Helper to render model assembly visuals
  const renderRocketVisual = () => {
    return (
      <div className="flex flex-col items-center justify-center py-6 relative">
        {/* Stage 5: Nose Cone & Space Antenna */}
        {modelUnlockedStages.includes(5) ? (
          <div className={`flex flex-col items-center ${justBuiltStage === 5 ? 'animate-brick-snap' : ''}`}>
            <div className="w-1.5 h-6 bg-slate-300 border border-slate-500 rounded-t-sm" />
            <div className="w-8 h-8 bg-red-600 rounded-t-full border-2 border-red-800 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="w-8 h-10 border-2 border-dashed border-white/40 rounded-t-full flex items-center justify-center text-white/30 text-xs font-bold">
            5
          </div>
        )}

        {/* Stage 4: Wing Fins */}
        <div className="relative flex items-center justify-center">
          {modelUnlockedStages.includes(4) && (
            <div className={`absolute -left-7 top-4 w-7 h-12 bg-yellow-400 border-2 border-yellow-600 rounded-l-2xl -skew-y-12 shadow-md ${justBuiltStage === 4 ? 'animate-brick-snap' : ''}`} />
          )}

          {/* Stage 3: Crew Cabin & Cockpit */}
          {modelUnlockedStages.includes(3) ? (
            <div className={`w-24 h-16 bg-blue-600 border-2 border-blue-800 rounded-xl flex items-center justify-center relative shadow-lg ${justBuiltStage === 3 ? 'animate-brick-snap' : ''}`}>
              {/* Cockpit Window */}
              <div className="w-12 h-9 bg-sky-300/80 border-2 border-sky-400 rounded-lg flex items-center justify-center">
                <span className="text-xs">👨‍🚀</span>
              </div>
              <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-blue-400" />
            </div>
          ) : (
            <div className="w-24 h-16 border-2 border-dashed border-white/40 rounded-xl flex items-center justify-center text-white/30 text-xs font-bold">
              Cockpit (3)
            </div>
          )}

          {modelUnlockedStages.includes(4) && (
            <div className={`absolute -right-7 top-4 w-7 h-12 bg-yellow-400 border-2 border-yellow-600 rounded-r-2xl skew-y-12 shadow-md ${justBuiltStage === 4 ? 'animate-brick-snap' : ''}`} />
          )}
        </div>

        {/* Stage 2: Fuel Tanks */}
        {modelUnlockedStages.includes(2) ? (
          <div className={`w-28 h-16 bg-white border-2 border-slate-300 rounded-md flex items-center justify-around px-2 shadow-md ${justBuiltStage === 2 ? 'animate-brick-snap' : ''}`}>
            <div className="w-6 h-12 bg-red-500 rounded border border-red-700 flex items-center justify-center text-white text-[10px] font-bold">
              USA
            </div>
            <div className="w-6 h-12 bg-blue-500 rounded border border-blue-700 flex items-center justify-center text-white text-[10px] font-bold">
              LEGO
            </div>
          </div>
        ) : (
          <div className="w-28 h-16 border-2 border-dashed border-white/40 rounded-md flex items-center justify-center text-white/30 text-xs font-bold my-1">
            Fuel Tank (2)
          </div>
        )}

        {/* Stage 1: Booster Engines */}
        {modelUnlockedStages.includes(1) ? (
          <div className={`flex flex-col items-center ${justBuiltStage === 1 ? 'animate-brick-snap' : ''}`}>
            <div className="flex gap-2">
              <div className="w-7 h-7 bg-slate-700 border-2 border-slate-900 rounded-b-lg shadow-inner" />
              <div className="w-7 h-7 bg-slate-700 border-2 border-slate-900 rounded-b-lg shadow-inner" />
            </div>
            {/* Thruster Flame */}
            <div className="flex gap-4 -mt-1">
              <Flame className="w-5 h-6 text-orange-400 fill-orange-400 animate-bounce" />
              <Flame className="w-5 h-6 text-orange-400 fill-orange-400 animate-bounce" />
            </div>
          </div>
        ) : (
          <div className="w-20 h-8 border-2 border-dashed border-white/40 rounded-b-lg flex items-center justify-center text-white/30 text-xs font-bold">
            Booster (1)
          </div>
        )}
      </div>
    );
  };

  const renderRaceCarVisual = () => {
    return (
      <div className="flex flex-col items-center justify-center py-6 relative">
        {/* Stage 5: Spoiler */}
        {modelUnlockedStages.includes(5) ? (
          <div className={`w-32 h-5 bg-yellow-400 border-2 border-yellow-600 rounded-t-md shadow-md flex items-center justify-center ${justBuiltStage === 5 ? 'animate-brick-snap' : ''}`}>
            <span className="text-[10px] font-black text-slate-900">#01 TURBO</span>
          </div>
        ) : (
          <div className="w-32 h-5 border-2 border-dashed border-white/40 rounded-t-md flex items-center justify-center text-white/30 text-[10px] font-bold">
            Spoiler (5)
          </div>
        )}

        {/* Stage 4: Cabin & Driver */}
        {modelUnlockedStages.includes(4) ? (
          <div className={`w-28 h-14 bg-sky-400/80 border-2 border-sky-600 rounded-t-2xl flex items-center justify-center relative shadow-inner ${justBuiltStage === 4 ? 'animate-brick-snap' : ''}`}>
            <span className="text-xl">🏎️</span>
            <div className="absolute top-1 left-2 w-2 h-2 rounded-full bg-white/60" />
          </div>
        ) : (
          <div className="w-28 h-14 border-2 border-dashed border-white/40 rounded-t-2xl flex items-center justify-center text-white/30 text-xs font-bold">
            Driver Cabin (4)
          </div>
        )}

        {/* Stage 3: Turbo Engine Block */}
        {modelUnlockedStages.includes(3) ? (
          <div className={`w-44 h-12 bg-red-600 border-2 border-red-800 rounded-lg flex items-center justify-between px-3 shadow-lg ${justBuiltStage === 3 ? 'animate-brick-snap' : ''}`}>
            <div className="w-7 h-6 bg-slate-800 border border-slate-900 rounded text-[9px] text-amber-300 font-bold flex items-center justify-center">
              V8
            </div>
            <div className="h-2 w-16 bg-yellow-400 rounded-full" />
            <Gauge className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="w-44 h-12 border-2 border-dashed border-white/40 rounded-lg flex items-center justify-center text-white/30 text-xs font-bold my-1">
            Engine Body (3)
          </div>
        )}

        {/* Stage 2 & 1: Chassis & Big Racing Wheels */}
        <div className="flex items-center justify-between w-48 -mt-2">
          {/* Wheel Left */}
          {modelUnlockedStages.includes(2) ? (
            <div className={`w-10 h-10 rounded-full bg-slate-900 border-3 border-slate-600 flex items-center justify-center shadow-lg ${justBuiltStage === 2 ? 'animate-brick-snap' : ''}`}>
              <div className="w-4 h-4 rounded-full bg-yellow-400 border border-yellow-600" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center text-white/30 text-[10px]">
              O
            </div>
          )}

          {/* Chassis Middle (Stage 1) */}
          {modelUnlockedStages.includes(1) ? (
            <div className={`flex-1 h-5 bg-slate-800 border-t-2 border-slate-700 mx-1 rounded-sm ${justBuiltStage === 1 ? 'animate-brick-snap' : ''}`} />
          ) : (
            <div className="flex-1 h-5 border-2 border-dashed border-white/40 mx-1 flex items-center justify-center text-white/30 text-[9px]">
              Chassis (1)
            </div>
          )}

          {/* Wheel Right */}
          {modelUnlockedStages.includes(2) ? (
            <div className={`w-10 h-10 rounded-full bg-slate-900 border-3 border-slate-600 flex items-center justify-center shadow-lg ${justBuiltStage === 2 ? 'animate-brick-snap' : ''}`}>
              <div className="w-4 h-4 rounded-full bg-yellow-400 border border-yellow-600" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center text-white/30 text-[10px]">
              O
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCastleVisual = () => {
    return (
      <div className="flex flex-col items-center justify-center py-6 relative">
        {/* Stage 5: Flagpole */}
        {modelUnlockedStages.includes(5) ? (
          <div className={`flex items-center -mb-1 ${justBuiltStage === 5 ? 'animate-brick-snap' : ''}`}>
            <div className="w-1 h-8 bg-amber-200" />
            <div className="w-8 h-5 bg-red-600 border border-red-800 rounded-r-md flex items-center justify-center shadow-md">
              <span className="text-[10px]">🦁</span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 border-2 border-dashed border-white/40 flex items-center justify-center text-white/30 text-[10px]">
            Flag (5)
          </div>
        )}

        {/* Stage 4: Battlements */}
        {modelUnlockedStages.includes(4) ? (
          <div className={`w-36 flex justify-between ${justBuiltStage === 4 ? 'animate-brick-snap' : ''}`}>
            <div className="w-8 h-4 bg-slate-400 border-2 border-slate-600 rounded-t-sm" />
            <div className="w-8 h-4 bg-slate-400 border-2 border-slate-600 rounded-t-sm" />
            <div className="w-8 h-4 bg-slate-400 border-2 border-slate-600 rounded-t-sm" />
          </div>
        ) : (
          <div className="w-36 h-4 border-2 border-dashed border-white/40 flex items-center justify-center text-white/30 text-[10px]">
            Battlements (4)
          </div>
        )}

        {/* Stage 3: Watchtowers */}
        <div className="flex items-end justify-between w-44">
          {modelUnlockedStages.includes(3) ? (
            <div className={`w-10 h-20 bg-slate-500 border-2 border-slate-700 rounded-t-md flex flex-col items-center pt-2 shadow-md ${justBuiltStage === 3 ? 'animate-brick-snap' : ''}`}>
              <div className="w-3 h-5 bg-slate-800 rounded-t-sm" />
            </div>
          ) : (
            <div className="w-10 h-20 border-2 border-dashed border-white/40 flex items-center justify-center text-white/30 text-xs">
              Tower
            </div>
          )}

          {/* Stage 2: Gatehouse */}
          {modelUnlockedStages.includes(2) ? (
            <div className={`w-20 h-16 bg-slate-600 border-2 border-slate-800 flex flex-col items-center justify-end pb-1 shadow-inner ${justBuiltStage === 2 ? 'animate-brick-snap' : ''}`}>
              {/* Drawbridge door */}
              <div className="w-8 h-10 bg-amber-800 border-2 border-amber-950 rounded-t-lg flex items-center justify-center">
                <div className="w-1 h-3 bg-amber-400 rounded-full" />
              </div>
            </div>
          ) : (
            <div className="w-20 h-16 border-2 border-dashed border-white/40 flex items-center justify-center text-white/30 text-xs">
              Gate (2)
            </div>
          )}

          {modelUnlockedStages.includes(3) ? (
            <div className={`w-10 h-20 bg-slate-500 border-2 border-slate-700 rounded-t-md flex flex-col items-center pt-2 shadow-md ${justBuiltStage === 3 ? 'animate-brick-snap' : ''}`}>
              <div className="w-3 h-5 bg-slate-800 rounded-t-sm" />
            </div>
          ) : (
            <div className="w-10 h-20 border-2 border-dashed border-white/40 flex items-center justify-center text-white/30 text-xs">
              Tower
            </div>
          )}
        </div>

        {/* Stage 1: Stone Foundation */}
        {modelUnlockedStages.includes(1) ? (
          <div className={`w-52 h-6 bg-slate-700 border-2 border-slate-900 rounded-sm shadow-lg ${justBuiltStage === 1 ? 'animate-brick-snap' : ''}`} />
        ) : (
          <div className="w-52 h-6 border-2 border-dashed border-white/40 flex items-center justify-center text-white/30 text-xs">
            Foundation (1)
          </div>
        )}
      </div>
    );
  };

  // Minifigure Leo Avatar Builder Visual
  const renderLeoMinifigureVisual = () => {
    const acc = LEO_ACCESSORIES.find(a => a.id === equippedAccessory);
    return (
      <div className="flex flex-col items-center justify-center py-4 relative select-none">
        {/* Head & Hat Container */}
        <div className="relative flex flex-col items-center">
          {/* Equipped Accessory Display */}
          <div className="text-5xl sm:text-6xl drop-shadow-lg -mb-4 z-20 animate-bounce">
            {acc?.icon || '🧢'}
          </div>

          {/* Lego Head */}
          <div className="w-18 h-16 bg-yellow-400 rounded-2xl border-4 border-yellow-600 relative flex items-center justify-center shadow-md">
            {/* Top stud */}
            <div className="absolute -top-2 w-6 h-2.5 bg-yellow-500 rounded-t-md border-t-2 border-x-2 border-yellow-600" />
            
            {/* Eyes */}
            <div className="flex items-center gap-5 mt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            </div>

            {/* Smile */}
            <div className="absolute bottom-2.5 w-6 h-2 border-b-3 border-slate-900 rounded-b-full" />

            {/* Sunglasses if equipped */}
            {equippedAccessory === 'sunglasses' && (
              <div className="absolute top-4 w-14 h-4 bg-slate-900 rounded-md border border-white/40 flex items-center justify-around px-1 z-10">
                <div className="w-4 h-3 bg-slate-800 rounded-xs" />
                <div className="w-4 h-3 bg-slate-800 rounded-xs" />
              </div>
            )}
          </div>
        </div>

        {/* Torso & Cape */}
        <div className="relative mt-1 flex items-center justify-center">
          {equippedAccessory === 'cape' && (
            <div className="absolute -inset-x-5 -top-2 -bottom-2 bg-red-600 rounded-b-2xl shadow-lg -z-10 animate-pulse" />
          )}

          <div className="w-22 h-18 bg-blue-600 rounded-t-lg border-4 border-blue-800 flex items-center justify-center relative shadow-md">
            <span className="text-xl text-yellow-300 font-black font-display">🧱</span>

            {/* Arms & Hands */}
            <div className="absolute -left-3 top-1 w-4 h-12 bg-blue-700 rounded-full rotate-12 flex items-end justify-center pb-1">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-yellow-500 bg-yellow-400" />
            </div>
            <div className="absolute -right-3 top-1 w-4 h-12 bg-blue-700 rounded-full -rotate-12 flex items-end justify-center pb-1">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-yellow-500 bg-yellow-400" />
            </div>
          </div>
        </div>

        {/* Hips & Legs */}
        <div className="w-20 flex flex-col items-center">
          <div className="w-20 h-3.5 bg-slate-800 border-x-2 border-slate-900" />
          <div className="flex gap-1">
            <div className="w-9 h-14 bg-red-600 border-2 border-red-800 rounded-b-md" />
            <div className="w-9 h-14 bg-red-600 border-2 border-red-800 rounded-b-md" />
          </div>
        </div>

        {/* Leo Name Badge */}
        <div className="mt-3 bg-yellow-400 text-slate-950 px-3.5 py-1 rounded-full font-display font-black text-xs shadow-md">
          Leo the Builder 👦
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-white/90 backdrop-blur-md rounded-2xl border-4 border-slate-800 p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 border-2 border-blue-400 text-white flex items-center justify-center shadow-md">
            <Hammer className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-slate-800">
              Lego Builder Workshop 🛠️
            </h2>
            <p className="text-xs text-slate-500 font-bold">
              Use bricks earned in quizzes to snap together awesome models!
            </p>
          </div>
        </div>

        {/* Available Brick Bank */}
        <div className="flex items-center gap-2 bg-blue-50 border-2 border-blue-300 rounded-2xl px-4 py-2">
          <span className="text-2xl">🧱</span>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-blue-800">Your Bricks</span>
            <span className="text-xl font-black font-mono text-blue-950 leading-none">{bricks} Available</span>
          </div>
        </div>
      </div>

      {/* Model Selector Tabs (Now 4 Tabs including Dress Up Leo!) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6">
        {LEGO_BUILD_MODELS.map((model) => {
          const isSelected = model.id === selectedModelId;
          const stagesBuilt = (unlockedStages[model.id] || []).length;
          const isComplete = stagesBuilt === model.stages.length;

          return (
            <button
              key={model.id}
              onClick={() => {
                playTap(isMuted);
                setSelectedModelId(model.id);
              }}
              className={`
                relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl font-display font-black text-xs sm:text-sm
                transition-all duration-100 border-3 border-b-6 cursor-pointer
                ${isSelected
                  ? 'bg-white text-slate-900 border-blue-600 scale-102 shadow-lg ring-2 ring-blue-400'
                  : 'bg-white/80 text-slate-600 hover:bg-white border-slate-300'}
              `}
            >
              <div className="text-2xl sm:text-3xl mb-1">
                {model.id === 'rocket' ? '🚀' : model.id === 'racecar' ? '🏎️' : '🏰'}
              </div>
              <span className="leading-tight text-center">{model.nameTr}</span>
              
              {/* Build Progress Indicator */}
              <div className="mt-2 w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${isComplete ? 'bg-amber-400' : 'bg-blue-600'} transition-all`}
                  style={{ width: `${(stagesBuilt / model.stages.length) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-mono">
                {stagesBuilt}/{model.stages.length} Built
              </span>

              {isComplete && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 border-2 border-yellow-600 rounded-full flex items-center justify-center shadow">
                  <Trophy className="w-3.5 h-3.5 text-slate-900" />
                </div>
              )}
            </button>
          );
        })}

        {/* Tab 4: Dress-Up Leo Studio */}
        <button
          onClick={() => {
            playTap(isMuted);
            setSelectedModelId('minifigure');
          }}
          className={`
            relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl font-display font-black text-xs sm:text-sm
            transition-all duration-100 border-3 border-b-6 cursor-pointer
            ${isMinifigureTab
              ? 'bg-white text-slate-900 border-yellow-500 scale-102 shadow-lg ring-2 ring-yellow-400'
              : 'bg-white/80 text-slate-600 hover:bg-white border-slate-300'}
          `}
        >
          <div className="text-2xl sm:text-3xl mb-1">👦</div>
          <span className="leading-tight text-center">Dress Up Leo</span>
          
          <div className="mt-2 w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 transition-all"
              style={{ width: `${(unlockedAccessories.length / LEO_ACCESSORIES.length) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">
            {unlockedAccessories.length}/{LEO_ACCESSORIES.length} Outfits
          </span>
        </button>
      </div>

      {/* Main Building Canvas Floor (Lego Baseplate) */}
      <div className="bg-slate-900 rounded-3xl border-4 border-slate-950 p-4 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Baseplate Studded Background */}
        <div className="absolute inset-0 lego-blue-baseplate opacity-40 pointer-events-none" />

        {/* Header inside Canvas */}
        <div className="relative z-10 flex items-center justify-between mb-4 pb-3 border-b border-white/20">
          <div>
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
              {isMinifigureTab ? 'Minifigure Studio' : currentModel.theme}
            </span>
            <h3 className="text-xl sm:text-3xl font-black font-display text-white">
              {isMinifigureTab ? 'Dress Up Leo 👦' : currentModel.name}
            </h3>
          </div>
          {isMinifigureTab ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 text-slate-950 rounded-xl font-display font-black text-xs sm:text-sm shadow-md">
              <Sparkles className="w-4 h-4" />
              <span>Customize Avatar</span>
            </div>
          ) : isModelFullyBuilt ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 text-slate-950 rounded-xl font-display font-black text-xs sm:text-sm shadow-md">
              <Trophy className="w-4 h-4" />
              <span>COMPLETED! 🏆</span>
            </div>
          ) : (
            <div className="text-xs sm:text-sm font-bold text-white/80">
              Stage {modelUnlockedStages.length + 1} of {currentModel.stages.length}
            </div>
          )}
        </div>

        {/* 3D Visual Assembly Preview */}
        <div className="relative z-10 min-h-[220px] flex items-center justify-center">
          {isMinifigureTab && renderLeoMinifigureVisual()}
          {!isMinifigureTab && selectedModelId === 'rocket' && renderRocketVisual()}
          {!isMinifigureTab && selectedModelId === 'racecar' && renderRaceCarVisual()}
          {!isMinifigureTab && selectedModelId === 'castle' && renderCastleVisual()}
        </div>

        {/* Controls: If Minifigure Tab, render Accessories Tray */}
        {isMinifigureTab ? (
          <div className="relative z-10 mt-6 pt-4 border-t border-white/20">
            <h4 className="text-sm font-black font-display text-yellow-300 uppercase tracking-wider mb-3 text-center sm:text-left">
              Choose Leo's Hats & Outfits:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {LEO_ACCESSORIES.map((acc) => {
                const isUnlocked = unlockedAccessories.includes(acc.id);
                const isEquipped = equippedAccessory === acc.id;

                return (
                  <div
                    key={acc.id}
                    className={`
                      bg-white/10 backdrop-blur-md rounded-2xl p-3 border-2 flex flex-col justify-between transition-all
                      ${isEquipped
                        ? 'border-yellow-400 bg-yellow-400/20 shadow-lg'
                        : isUnlocked
                        ? 'border-white/30 hover:bg-white/15'
                        : 'border-white/10 opacity-75'}
                    `}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl">{acc.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-display font-black text-white text-xs leading-tight">
                          {acc.name}
                        </span>
                        <span className="text-[10px] text-yellow-200/80 font-bold">
                          {acc.nameDe} • {acc.nameTr}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2">
                      {isEquipped ? (
                        <div className="w-full py-1.5 bg-yellow-400 text-slate-950 font-display font-black text-xs rounded-xl text-center shadow">
                          Wearing ⭐
                        </div>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => {
                            playLegoSnap(isMuted);
                            if (onEquipAccessory) onEquipAccessory(acc.id);
                          }}
                          className="w-full py-1.5 bg-white/20 hover:bg-white/30 text-white font-display font-black text-xs rounded-xl transition-all active:scale-95 cursor-pointer border border-white/30"
                        >
                          Wear This
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (bricks >= acc.cost) {
                              playLegoSnap(isMuted);
                              playStarSparkle(isMuted);
                              confetti({ particleCount: 35, spread: 50 });
                              if (onUnlockAccessory) onUnlockAccessory(acc.id, acc.cost);
                            } else {
                              playGentleWobble(isMuted);
                            }
                          }}
                          className={`w-full py-1.5 rounded-xl font-display font-black text-xs transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer ${
                            bricks >= acc.cost
                              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Unlock ({acc.cost} 🧱)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Normal Model Stage Controls */
        <div className="relative z-10 mt-6 pt-4 border-t border-white/20">
          {nextStage ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div>
                <span className="text-xs font-bold text-yellow-300 uppercase">
                  Next Brick Layer to Assemble:
                </span>
                <p className="text-lg font-black font-display text-white">
                  Stage {nextStage.stage}: {nextStage.titleTr} ({nextStage.title})
                </p>
                <p className="text-xs text-white/70">
                  Cost: <span className="font-bold text-yellow-300">{nextStage.cost} Bricks 🧱</span>
                </p>
              </div>

              {bricks >= nextStage.cost ? (
                <button
                  onClick={() => handleBuildStage(nextStage)}
                  className="w-full sm:w-auto px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-display font-black rounded-2xl border-2 border-b-6 border-yellow-600 active:border-b-2 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Snap Brick! 🧱</span>
                  <Sparkles className="w-5 h-5 text-red-600" />
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-rose-300 font-bold">
                    Need {nextStage.cost - bricks} more bricks!
                  </span>
                  <button
                    onClick={() => {
                      playTap(isMuted);
                      onNavigateToArena();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-display font-black rounded-xl border-2 border-b-4 border-red-700 active:border-b-2 active:translate-y-1 transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    <span>Play Quizzes 🎮</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Model Completed Celebration Box */
            <div className="bg-yellow-400/20 border-2 border-yellow-400 rounded-2xl p-4 text-center">
              <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
              <h4 className="text-xl font-black font-display text-yellow-300">
                MASTER BUILDER ACHIEVEMENT UNLOCKED! 🏆
              </h4>
              <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-md mx-auto">
                You successfully assembled all 5 stages of {currentModel.name}! Select another model above to keep building!
              </p>
            </div>
          )}
        </div>
        )}

      </div>

      {/* Collectible Brick Inventory Strip */}
      <div className="mt-6 bg-white/90 backdrop-blur-md rounded-2xl border-4 border-slate-800 p-4 shadow-xl">
        <h4 className="text-sm font-black font-display text-slate-800 mb-3 flex items-center gap-2">
          <span>🎒 Brick Backpack & Parts Collected:</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-500 rounded-lg border border-red-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              2x4
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Red Beams</div>
              <div className="text-[11px] font-mono text-slate-500">{Math.max(1, Math.floor(bricks / 2))} in stock</div>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg border border-blue-800 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              2x2
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Blue Cubes</div>
              <div className="text-[11px] font-mono text-slate-500">{Math.max(2, bricks)} in stock</div>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg border border-yellow-600 flex items-center justify-center text-slate-900 text-xs font-bold shadow-sm">
              ⚙️
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Speed Wheels</div>
              <div className="text-[11px] font-mono text-slate-500">4 unlocked</div>
            </div>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg border border-emerald-800 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              ⭐
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Gold Studs</div>
              <div className="text-[11px] font-mono text-slate-500">Unlimited</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
