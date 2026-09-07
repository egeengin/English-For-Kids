import React from 'react';
import { Star, Lock, CheckCircle2, Play, Sparkles, Award, Gift, ArrowRight, Compass } from 'lucide-react';
import { playSnap, playTap, playSparkle } from '../utils/soundEffects';

export const ADVENTURE_STAGES = [
  {
    id: 'stage-1',
    number: 1,
    title: 'Rainbow Harbor',
    tabTarget: 'arena',
    theme: 'Colors & Shapes',
    description: 'Learn bright colors & geometric Lego shapes!',
    emoji: '🌈',
    color: 'from-red-500 to-amber-500',
    borderColor: 'border-red-600',
    rewardBricks: 3,
  },
  {
    id: 'stage-2',
    number: 2,
    title: 'Phonics Sound Lab',
    tabTarget: 'phonics',
    theme: 'Letter-Sound Blending',
    description: 'Snap letter bricks together to build words!',
    emoji: '🔤',
    color: 'from-amber-500 to-yellow-400',
    borderColor: 'border-amber-600',
    rewardBricks: 4,
  },
  {
    id: 'stage-3',
    number: 3,
    title: 'Safari Sanctuary',
    tabTarget: 'differences',
    theme: 'Spot 7 Differences',
    description: 'Find differences and hear native English words!',
    emoji: '🦁',
    color: 'from-emerald-500 to-teal-500',
    borderColor: 'border-emerald-600',
    rewardBricks: 4,
  },
  {
    id: 'stage-4',
    number: 4,
    title: 'Brick Academy',
    tabTarget: 'story',
    theme: 'First Day of School',
    description: 'Interactive conversation story with voice talk!',
    emoji: '🏫',
    color: 'from-blue-600 to-indigo-600',
    borderColor: 'border-blue-700',
    rewardBricks: 5,
  },
  {
    id: 'stage-5',
    number: 5,
    title: 'Carnival Grounds',
    tabTarget: 'balloons',
    theme: 'Lego Balloon Pop',
    description: 'Listen and pop the floating vocabulary balloons!',
    emoji: '🎈',
    color: 'from-rose-500 to-pink-500',
    borderColor: 'border-rose-600',
    rewardBricks: 4,
  },
  {
    id: 'stage-6',
    number: 6,
    title: 'Lego Town Diorama',
    tabTarget: 'town',
    theme: 'Creative Sticker World',
    description: 'Place unlocked stickers and snap town photos!',
    emoji: '🏙️',
    color: 'from-purple-600 to-violet-600',
    borderColor: 'border-purple-700',
    rewardBricks: 3,
  },
  {
    id: 'stage-7',
    number: 7,
    title: 'Master Builder Citadel',
    tabTarget: 'workshop',
    theme: '3D Workshop & Graduation',
    description: 'Assemble 3D models and print your Diploma!',
    emoji: '🏆',
    color: 'from-yellow-400 to-amber-500',
    borderColor: 'border-yellow-600',
    rewardBricks: 6,
  },
];

export default function AdventureRoad({
  onSelectStage,
  onOpenCertificate,
  roadProgress = {},
  childName = 'Deniz',
  childAge = 7,
  isMuted = false,
}) {
  const handleStageClick = (stage, isUnlocked) => {
    if (!isUnlocked) {
      if (!isMuted) playTap();
      return;
    }
    if (!isMuted) playSnap();
    if (stage.id === 'stage-7' && onOpenCertificate) {
      onSelectStage(stage.tabTarget);
    } else {
      onSelectStage(stage.tabTarget);
    }
  };

  return (
    <div className="w-full max-w-4xl px-4 py-6 flex flex-col items-center animate-fade-in">
      
      {/* Adventure Island Map Header */}
      <div className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 shadow-xl border-4 border-blue-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border-2 border-white/30">
            🗺️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest bg-yellow-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                Lego Island Quest
              </span>
              <span className="text-xs text-blue-200">7 Stages</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight mt-1">
              {childName}'s Adventure Road 🧱
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-semibold">
              Follow the stepping stones to learn, speak, and become a Master Builder!
            </p>
          </div>
        </div>

        {/* Certificate Quick Badge */}
        <button
          onClick={() => {
            if (!isMuted) playSparkle();
            if (onOpenCertificate) onOpenCertificate();
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-2xl font-display font-black text-xs sm:text-sm shadow-lg transition transform active:scale-95 cursor-pointer"
        >
          <Award className="w-5 h-5 text-amber-900" />
          <span>View Diploma 📜</span>
        </button>
      </div>

      {/* Stepping-Stone Road Pathway */}
      <div className="w-full relative flex flex-col items-center py-4">
        
        {/* Animated Dashed Road Path Line */}
        <div className="absolute top-10 bottom-10 w-3 bg-gradient-to-b from-amber-400 via-emerald-400 to-yellow-400 rounded-full shadow-inner opacity-80" />

        {/* Road Stage Nodes */}
        <div className="w-full space-y-8 sm:space-y-12 relative z-10">
          {ADVENTURE_STAGES.map((stage, idx) => {
            // Stage is unlocked if it's stage-1 or previous stage has been touched
            const isCompleted = (roadProgress[stage.id] || 0) > 0;
            const prevStageId = idx > 0 ? ADVENTURE_STAGES[idx - 1].id : null;
            const isUnlocked = idx === 0 || isCompleted || (prevStageId && roadProgress[prevStageId] !== undefined);
            const stars = roadProgress[stage.id] || (idx === 0 ? 3 : 0);

            // Alternating zigzag layout: left, center, right
            const alignClass = idx % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse';

            return (
              <div
                key={stage.id}
                className={`flex flex-col items-center justify-center gap-4 ${alignClass}`}
              >
                
                {/* Stage Step Stepping Stone Card */}
                <div
                  onClick={() => handleStageClick(stage, isUnlocked)}
                  className={`w-full sm:w-80 rounded-3xl p-5 shadow-xl border-4 transition-all duration-300 relative cursor-pointer group ${
                    isUnlocked
                      ? 'bg-white hover:scale-105 active:scale-95 ' + stage.borderColor
                      : 'bg-slate-100 border-slate-300 opacity-75 cursor-not-allowed'
                  }`}
                >
                  {/* Lego Studs on Top of Card */}
                  <div className="absolute -top-3 left-6 flex gap-2">
                    <div className="w-4 h-2 bg-amber-500 rounded-t-sm" />
                    <div className="w-4 h-2 bg-amber-500 rounded-t-sm" />
                  </div>

                  {/* Stage Number Badge & Emoji */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${stage.color} text-white flex items-center justify-center text-2xl shadow-md`}>
                        {stage.emoji}
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          STAGE {stage.number}
                        </span>
                        <h3 className="text-base sm:text-lg font-display font-black text-slate-900 leading-tight">
                          {stage.title}
                        </h3>
                      </div>
                    </div>

                    {/* Lock or Checkmark */}
                    {isUnlocked ? (
                      isCompleted ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-black text-xs animate-pulse">
                          GO!
                        </div>
                      )
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center">
                        <Lock className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 font-semibold mb-3">
                    {stage.description}
                  </p>

                  {/* Star Rating & Action Button */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-4 h-4 ${
                            starIdx <= stars
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-xs font-black text-blue-600 group-hover:text-blue-700">
                      <span>{isUnlocked ? 'Play Now' : 'Locked'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                </div>

                {/* Milestone Chest / Reward Tag */}
                {idx === 3 && (
                  <div className="bg-yellow-100 border-2 border-yellow-400 text-yellow-900 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs font-black shadow-md animate-bounce">
                    <Gift className="w-5 h-5 text-amber-600" />
                    <span>Halftime Mystery Chest Unlocked! 🎁</span>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
