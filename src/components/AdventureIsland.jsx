import React, { useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  Star,
  Check,
  Gift,
  BookOpen,
  Gamepad2,
  Radio,
  Sparkles,
} from 'lucide-react';
import LeoBuddy from './LeoBuddy';
import { DAILY_EXPEDITION_DAYS, getWorksheetQuestions } from '../data/dailyMissionsData';
import {
  ISLAND_BIOMES,
  getIslandStopMeta,
  getStepCompletionForDay,
  findCurrentActiveDayId,
  getIslandOverallSummary,
} from '../data/islandMapData';
import { getDailyMemorySummary } from '../utils/dailyMemory';
import {
  speakEnglish,
  unlockAudio,
  triggerHoverSpeech,
  cancelHoverSpeech,
} from '../utils/speech';
import { playTap, playVictoryFanfare } from '../utils/soundEffects';

const STEP_LABELS = [
  { key: 'learnDone', step: 'learn', label: '1. Learn', emoji: '🎓' },
  { key: 'singDone', step: 'song', label: '2. Sing', emoji: '🎵' },
  { key: 'playDone', step: 'quiz', label: '3. Play', emoji: '🎮' },
  { key: 'speakDone', step: 'speak', label: '4. Speak', emoji: '🎙️' },
];

const CTA_BY_STEP = {
  learn: "Start Today's Quest",
  song: 'Continue: Sing the Song!',
  quiz: 'Continue: Play & Quiz!',
  speak: 'Continue: Speak with Leo!',
};

export default function AdventureIsland({
  childName = 'Deniz',
  selectedDayId = 'day-1',
  questProgress = {},
  dailyQuizAnswers = {},
  onLaunchQuest,
  onClaimChest,
  onNavigateTab,
  onOpenWalkieTalkie,
  isMuted = false,
}) {
  const questionsByDayId = useMemo(() => {
    const map = {};
    for (const day of DAILY_EXPEDITION_DAYS) {
      map[day.id] = getWorksheetQuestions({ mode: 'day', dayId: day.id })?.questions || [];
    }
    return map;
  }, []);

  const recommendedDayId = useMemo(
    () =>
      findCurrentActiveDayId(
        DAILY_EXPEDITION_DAYS,
        questProgress,
        dailyQuizAnswers,
        (dayId) => questionsByDayId[dayId] || []
      ),
    [questProgress, dailyQuizAnswers, questionsByDayId]
  );

  // Focus on selectedDayId if it still has unfinished steps; otherwise point Deniz to the next uncompleted stop
  const heroDayId = useMemo(() => {
    const selStatus = getStepCompletionForDay(
      selectedDayId,
      questProgress,
      dailyQuizAnswers,
      questionsByDayId[selectedDayId] || []
    );
    if (selectedDayId && selStatus.completedSteps < 4) {
      return selectedDayId;
    }
    return recommendedDayId;
  }, [selectedDayId, questProgress, dailyQuizAnswers, questionsByDayId, recommendedDayId]);

  const heroMeta = getIslandStopMeta(heroDayId);
  const heroCompletion = getStepCompletionForDay(
    heroDayId,
    questProgress,
    dailyQuizAnswers,
    questionsByDayId[heroDayId] || []
  );

  const islandSummary = useMemo(
    () =>
      getIslandOverallSummary(
        DAILY_EXPEDITION_DAYS,
        questProgress,
        dailyQuizAnswers,
        (dayId) => questionsByDayId[dayId] || []
      ),
    [questProgress, dailyQuizAnswers, questionsByDayId]
  );

  const totalIslandStars = islandSummary.totalStars;
  const todayStars = getDailyMemorySummary({ childName })?.todayStats?.stars || 0;

  const heroStopIndex = DAILY_EXPEDITION_DAYS.findIndex((d) => d.id === heroDayId);
  const nextStopDay =
    heroStopIndex >= 0 && heroStopIndex < DAILY_EXPEDITION_DAYS.length - 1
      ? DAILY_EXPEDITION_DAYS[heroStopIndex + 1]
      : null;

  const handleOpenChest = () => {
    unlockAudio();
    playVictoryFanfare(isMuted);
    try {
      confetti({ particleCount: 95, spread: 80, origin: { y: 0.55 } });
    } catch {
      // Ignore in non-DOM tests
    }
    if (!isMuted) {
      speakEnglish(`Awesome job ${childName}! You opened the treasure chest!`);
    }
    if (onClaimChest) {
      onClaimChest(heroDayId);
    }
  };

  const heroGreeting =
    heroCompletion.completedSteps === 4
      ? `Woohoo, ${childName}! Stop ${heroMeta.stopNumber} is complete!`
      : heroCompletion.completedSteps === 0
      ? `Hi ${childName}! Ready for Stop ${heroMeta.stopNumber}: ${heroMeta.titleEn}?`
      : `Great going, ${childName}! Just ${4 - heroCompletion.completedSteps} more to open the chest!`;

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-7 space-y-6 flex-1 island-pop-in">
      {/* HERO: Today's 10-Minute Adventure Banner */}
      <section
        aria-label="Today's 10-Minute Adventure"
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-100 via-yellow-50 to-sky-100 border-4 border-amber-300 shadow-lg p-5 sm:p-7"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Leo + Greeting + Today's Stop */}
          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-display font-black text-xs uppercase tracking-wide shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                Today’s 10-Minute Adventure
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 border border-amber-300 text-amber-900 font-display font-black text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                {totalIslandStars} / {islandSummary.maxStars} Island Stars
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-900 font-display font-black text-xs">
                🗺️ {islandSummary.completedStops} / {islandSummary.totalStops} Stops
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-100/90 border border-sky-300 text-sky-900 font-display font-black text-xs">
                🎯 {todayStars >= 5 ? `Today: ${todayStars} ⭐ Goal Done!` : `Today: ${todayStars} / 5 ⭐`}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <LeoBuddy
                mood={heroCompletion.completedSteps === 4 ? 'cheering' : 'waving'}
                size="lg"
                speechBubble={heroGreeting}
                isMuted={isMuted}
              />
            </div>

            {/* 4 Stepping Stones Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {STEP_LABELS.map((item) => {
                const done = heroCompletion[item.key];
                const isNext = !done && heroCompletion.nextStep === item.step;
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => {
                      playTap(isMuted);
                      unlockAudio();
                      onLaunchQuest(heroDayId, item.step);
                    }}
                    className={`rounded-2xl px-3.5 py-2.5 border-2 text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                      done
                        ? 'bg-emerald-500 text-white border-emerald-700 shadow-xs'
                        : isNext
                        ? 'bg-white text-slate-900 border-blue-500 ring-4 ring-blue-300/60 shadow-sm'
                        : 'bg-white/80 hover:bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2 font-display font-black text-xs sm:text-sm">
                      <span className="text-lg">{item.emoji}</span>
                      <span>{item.label}</span>
                    </span>
                    {done && <Check className="w-4 h-4 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Big Primary CTA + Treasure Chest */}
          <div className="lg:w-72 flex flex-col items-stretch gap-3 bg-white/90 rounded-3xl p-4 sm:p-5 border-2 border-amber-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center text-3xl flex-shrink-0">
                {heroMeta.emoji}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-black uppercase tracking-wider text-sky-700">
                  Stop {heroMeta.stopNumber} of 16
                </div>
                <div className="font-display font-black text-lg text-slate-900 leading-tight">
                  {heroMeta.titleEn}
                </div>
                <div className="text-xs font-bold text-slate-500">{heroMeta.taglineEn}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playTap(isMuted);
                unlockAudio();
                onLaunchQuest(heroDayId, heroCompletion.nextStep);
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-black text-base shadow-md border-b-4 border-emerald-700 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{CTA_BY_STEP[heroCompletion.nextStep]}</span>
            </button>

            {heroCompletion.completedSteps === 4 && !heroCompletion.chestClaimed ? (
              <button
                type="button"
                onClick={handleOpenChest}
                className="w-full py-2.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-black text-sm border-2 border-amber-600 shadow-sm flex items-center justify-center gap-2 cursor-pointer animate-bounce"
              >
                <Gift className="w-4 h-4" />
                <span>Open Treasure (+5 ⭐)</span>
              </button>
            ) : (
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
                <span className="inline-flex items-center gap-1">
                  <Gift className="w-4 h-4 text-amber-500" />
                  Daily Chest
                </span>
                <span className="font-black text-amber-700">
                  {heroCompletion.chestClaimed
                    ? 'Claimed! ✓'
                    : `${heroCompletion.completedSteps}/4 Steps`}
                </span>
              </div>
            )}

            {heroCompletion.completedSteps === 4 && nextStopDay && (
              <button
                type="button"
                onClick={() => {
                  playTap(isMuted);
                  unlockAudio();
                  onLaunchQuest(nextStopDay.id, 'learn');
                }}
                className="w-full py-2 px-4 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-display font-black text-xs border-2 border-sky-300 flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <span>Next Island Stop →</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* WINDING ISLAND PATH: 4 Cozy Biomes, 16 Stepping Stones */}
      <section aria-label="Adventure Island Map" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900">
            🗺️ Explore the Island Path
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-500">
            Hover any stop to hear it, click to jump right in!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {ISLAND_BIOMES.map((biome) => (
            <div
              key={biome.id}
              className={`rounded-3xl bg-gradient-to-br ${biome.bgClass} border-3 ${biome.borderClass} p-4 sm:p-5 shadow-sm space-y-4`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{biome.emoji}</span>
                  <div>
                    <h3 className="font-display font-black text-lg text-slate-900 leading-tight">
                      {biome.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-600">{biome.subtitle}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${biome.badgeClass}`}>
                  4 Stops
                </span>
              </div>

              {/* Winding SVG Path behind 4 stepping-stone nodes */}
              <div className="relative py-2">
                <svg
                  viewBox="0 0 400 80"
                  className="hidden sm:block absolute inset-x-6 top-7 h-16 w-[calc(100%-3rem)] pointer-events-none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M 15 45 Q 95 10, 145 45 T 275 45 T 385 35"
                    fill="none"
                    stroke={biome.trailStroke}
                    strokeWidth="6"
                    strokeDasharray="10 8"
                    strokeLinecap="round"
                    opacity="0.55"
                  />
                </svg>

                <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {biome.dayIds.map((dayId, idx) => {
                    const meta = getIslandStopMeta(dayId);
                    const comp = getStepCompletionForDay(
                      dayId,
                      questProgress,
                      dailyQuizAnswers,
                      questionsByDayId[dayId] || []
                    );
                    const isCurrent = dayId === heroDayId;
                    const offsetClass = idx % 2 === 1 ? 'sm:translate-y-3' : '';

                    return (
                      <button
                        key={dayId}
                        type="button"
                        onPointerEnter={(e) =>
                          triggerHoverSpeech(meta.titleEn, { isMuted, pointerType: e.pointerType })
                        }
                        onPointerLeave={cancelHoverSpeech}
                        onClick={() => {
                          cancelHoverSpeech();
                          playTap(isMuted);
                          unlockAudio();
                          onLaunchQuest(dayId, comp.nextStep);
                        }}
                        className={`group flex flex-col items-center text-center gap-1.5 p-2.5 rounded-2xl bg-white/85 hover:bg-white border-2 transition cursor-pointer shadow-xs ${offsetClass} ${
                          isCurrent
                            ? 'border-blue-500 ring-4 ring-blue-300/60 shadow-md'
                            : comp.completedSteps === 4
                            ? 'border-emerald-400'
                            : 'border-white/90 hover:border-slate-300'
                        }`}
                      >
                        <div className="relative">
                          <div
                            className={`w-14 h-14 rounded-full border-4 flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-105 ${
                              comp.completedSteps === 4
                                ? 'bg-emerald-500 border-emerald-700 text-white'
                                : isCurrent
                                ? biome.nodeActiveClass
                                : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          >
                            {meta.emoji}
                          </div>
                          <span className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-slate-900 text-white font-display font-black text-[11px] flex items-center justify-center border-2 border-white">
                            {meta.stopNumber}
                          </span>
                          {isCurrent && (
                            <span
                              title="You are here!"
                              className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-400 border border-amber-600 text-[10px] font-black text-slate-950"
                            >
                              🦁
                            </span>
                          )}
                        </div>

                        <div className="font-display font-black text-xs text-slate-900 leading-tight line-clamp-2">
                          {meta.titleEn}
                        </div>

                        {/* 3-Star Progress Dots */}
                        <div className="flex items-center gap-0.5" aria-label={`${comp.starsEarned} of 3 stars`}>
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= comp.starsEarned
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COZY ISLAND DOCKS: Story Cove, Arcade Pier, Talk to Leo */}
      <section aria-label="Island Docks" className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
        <button
          type="button"
          onClick={() => {
            playTap(isMuted);
            onNavigateTab('story');
          }}
          className="rounded-3xl bg-white hover:bg-purple-50 border-3 border-purple-200 hover:border-purple-400 p-5 text-left shadow-sm flex items-center gap-4 cursor-pointer transition"
        >
          <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <div className="font-display font-black text-lg text-slate-900">📖 Story Cove</div>
            <div className="text-xs sm:text-sm font-bold text-slate-500">
              10 interactive worlds &amp; 13 mini-books
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            playTap(isMuted);
            onNavigateTab('games');
          }}
          className="rounded-3xl bg-white hover:bg-rose-50 border-3 border-rose-200 hover:border-rose-400 p-5 text-left shadow-sm flex items-center gap-4 cursor-pointer transition"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Gamepad2 className="w-7 h-7" />
          </div>
          <div>
            <div className="font-display font-black text-lg text-slate-900">🕹️ Arcade Pier</div>
            <div className="text-xs sm:text-sm font-bold text-slate-500">
              Balloons, phonics, voice &amp; hero cards
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            playTap(isMuted);
            onOpenWalkieTalkie();
          }}
          className="rounded-3xl bg-gradient-to-r from-amber-300 to-yellow-300 hover:from-amber-400 hover:to-yellow-400 border-3 border-amber-500 p-5 text-left shadow-sm flex items-center gap-4 cursor-pointer transition"
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-300 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Radio className="w-7 h-7" />
          </div>
          <div>
            <div className="font-display font-black text-lg text-slate-950">🎙️ Talk to Leo</div>
            <div className="text-xs sm:text-sm font-bold text-amber-950/80">
              Play walkie-talkie &amp; practice speaking!
            </div>
          </div>
        </button>
      </section>
    </div>
  );
}
