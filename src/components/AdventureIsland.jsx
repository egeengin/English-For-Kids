import React, { useMemo, useState, useRef, useEffect } from 'react';
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
  Volume2,
  ArrowRight,
  Smile,
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
  LEO_COSTUMES,
  KID_JOKES,
  ISLAND_CRITTERS,
  getNextCyclicIndex,
} from '../data/funnyData';
import {
  speakEnglish,
  unlockAudio,
  triggerHoverSpeech,
  cancelHoverSpeech,
  prefetchSpeech,
} from '../utils/speech';
import {
  playTap,
  playBoing,
  playGiggle,
  playSillyToot,
  playComicPop,
} from '../utils/soundEffects';
import { launchFireworksShow } from '../utils/fireworks';

const STEP_LABELS = [
  { key: 'learnDone', step: 'learn', label: '1. Learn', emoji: '🎓' },
  { key: 'singDone', step: 'song', label: '2. Sing', emoji: '🎵' },
  { key: 'playDone', step: 'quiz', label: '3. Play', emoji: '🎮' },
  { key: 'speakDone', step: 'speak', label: '4. Speak', emoji: '🎙️' },
];

function playComedySfx(sfx, isMuted) {
  if (sfx === 'boing') playBoing(isMuted);
  else if (sfx === 'giggle') playGiggle(isMuted);
  else if (sfx === 'toot') playSillyToot(isMuted);
  else playComicPop(isMuted);
}

export default function AdventureIsland({
  childName = 'Deniz',
  selectedDayId = 'day-1',
  questProgress = {},
  dailyQuizAnswers = {},
  leoCostume = 'cap',
  onChangeCostume,
  onLaunchQuest,
  onClaimChest,
  onNavigateTab,
  onOpenWalkieTalkie,
  isMuted = false,
}) {
  const [jokeIdx, setJokeIdx] = useState(0);
  const [showPunchline, setShowPunchline] = useState(false);
  const [activeCritterId, setActiveCritterId] = useState(null);
  const critterTimerRef = useRef(null);
  const fireworksCleanupRef = useRef(null);

  useEffect(() => {
    return () => {
      if (critterTimerRef.current) clearTimeout(critterTimerRef.current);
      if (fireworksCleanupRef.current) fireworksCleanupRef.current();
    };
  }, []);

  const activeJoke = KID_JOKES[jokeIdx % KID_JOKES.length];
  const activeCritter = ISLAND_CRITTERS.find((c) => c.id === activeCritterId) || null;
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
  const [biomeChoice, setBiomeChoice] = useState(null);
  const selectedBiomeId =
    biomeChoice && biomeChoice.forHeroBiome === heroMeta.biomeId
      ? biomeChoice.id
      : heroMeta.biomeId || 'beach';
  const activeBiome = ISLAND_BIOMES.find((b) => b.id === selectedBiomeId) || ISLAND_BIOMES[0];
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
    if (fireworksCleanupRef.current) fireworksCleanupRef.current();
    fireworksCleanupRef.current = launchFireworksShow({
      grand: Boolean(heroMeta.isGrandFinale || heroMeta.isPitStop),
      isMuted,
    });
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

  useEffect(() => {
    if (isMuted) return;
    prefetchSpeech([
      ...DAILY_EXPEDITION_DAYS.map((d) => getIslandStopMeta(d.id).titleEn),
      heroGreeting,
      activeJoke.setup,
      activeJoke.punchline,
      ...ISLAND_CRITTERS.map((c) => c.line),
    ]);
  }, [isMuted, heroGreeting, activeJoke.setup, activeJoke.punchline]);

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-7 space-y-6 flex-1 island-pop-in">
      {/* HERO: Simple, Friendly Island Welcome + 1 Big Play Button */}
      <section
        aria-label="Today's 10-Minute Adventure"
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-100 via-yellow-50 to-sky-100 border-4 border-amber-300 shadow-lg p-5 sm:p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Leo + Hat Dress-Up */}
          <div className="space-y-3.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-display font-black text-xs uppercase tracking-wide shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                {childName}’s Island Home
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 border border-amber-300 text-amber-900 font-display font-black text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                {totalIslandStars} Stars
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-100/90 border border-sky-300 text-sky-900 font-display font-black text-xs">
                🎯 Today: {todayStars >= 5 ? `${todayStars} ⭐ Done!` : `${todayStars} / 5 ⭐`}
              </span>
            </div>

            <LeoBuddy
              mood={heroCompletion.completedSteps === 4 ? 'cheering' : 'waving'}
              size="lg"
              costume={leoCostume}
              speechBubble={heroGreeting}
              isMuted={isMuted}
            />

            {/* Leo Hat Dress-Up Strip */}
            {onChangeCostume && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 mr-1">
                  🎩 Leo’s Hat:
                </span>
                {LEO_COSTUMES.map((hat) => {
                  const activeHat = leoCostume === hat.id;
                  return (
                    <button
                      key={hat.id}
                      type="button"
                      onClick={() => {
                        unlockAudio();
                        playComicPop(isMuted);
                        onChangeCostume(hat.id);
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-display font-black border-2 transition cursor-pointer ${
                        activeHat
                          ? 'bg-slate-900 text-white border-slate-950 scale-105 shadow-xs'
                          : 'bg-white/85 hover:bg-white text-slate-800 border-amber-200'
                      }`}
                    >
                      <span>{hat.emoji}</span>
                      <span>{hat.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: 1 Clear Adventure Card */}
          <div className="lg:w-80 flex flex-col items-stretch gap-3.5 bg-white/95 rounded-3xl p-5 border-2 border-amber-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center text-4xl flex-shrink-0">
                {heroMeta.emoji}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black uppercase tracking-wider text-sky-700">
                  Next Adventure • #{heroMeta.stopNumber}
                </div>
                <div className="font-display font-black text-xl text-slate-900 leading-tight">
                  {heroMeta.titleEn}
                </div>
              </div>
            </div>

            {/* Simple Visual 4-Icon Progress Dots */}
            <div className="flex items-center justify-between gap-2 bg-slate-50 rounded-2xl px-3 py-2 border border-slate-200">
              {STEP_LABELS.map((item) => {
                const done = heroCompletion[item.key];
                const isNext = !done && heroCompletion.nextStep === item.step;
                return (
                  <div
                    key={item.step}
                    title={item.label}
                    className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-xl text-sm font-black transition ${
                      done
                        ? 'bg-emerald-500 text-white'
                        : isNext
                        ? 'bg-blue-100 text-blue-900 ring-2 ring-blue-400'
                        : 'text-slate-400'
                    }`}
                  >
                    <span>{item.emoji}</span>
                    {done && <Check className="w-3.5 h-3.5" />}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                playTap(isMuted);
                unlockAudio();
                onLaunchQuest(heroDayId, heroCompletion.nextStep);
              }}
              className="w-full py-4 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-black text-lg shadow-md border-b-4 border-emerald-700 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>{heroCompletion.completedSteps > 0 && heroCompletion.completedSteps < 4 ? 'Continue!' : "Let's Play!"}</span>
            </button>

            {heroCompletion.completedSteps === 4 && !heroCompletion.chestClaimed && (
              <button
                type="button"
                onClick={handleOpenChest}
                className="w-full py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-black text-base border-2 border-amber-600 shadow-sm flex items-center justify-center gap-2 cursor-pointer animate-bounce"
              >
                <Gift className="w-5 h-5" />
                <span>Open Gift! (+5 ⭐)</span>
              </button>
            )}

            {heroCompletion.completedSteps === 4 && nextStopDay && (
              <button
                type="button"
                onClick={() => {
                  playTap(isMuted);
                  unlockAudio();
                  onLaunchQuest(nextStopDay.id, 'learn');
                }}
                className="w-full py-2.5 px-4 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-display font-black text-sm border-2 border-sky-300 flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <span>Go to Next Stop →</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* VISUAL WORLD MAP: Pick 1 Land at a time -> See 5 Big Stepping Stones */}
      <section aria-label="Adventure Island Map" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900">
            🗺️ Pick a Land to Explore
          </h2>
          <span className="text-xs font-black text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
            {islandSummary.completedStops} / {islandSummary.totalStops} Stops Done
          </span>
        </div>

        {/* 7 Colorful Land Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {ISLAND_BIOMES.map((biome) => {
            const isSelected = biome.id === activeBiome.id;
            const hasCurrentHero = biome.dayIds.includes(heroDayId);
            const doneInBiome = biome.dayIds.filter(
              (id) =>
                getStepCompletionForDay(id, questProgress, dailyQuizAnswers, questionsByDayId[id] || [])
                  .completedSteps === 4
            ).length;
            return (
              <button
                key={biome.id}
                type="button"
                onClick={() => {
                  playTap(isMuted);
                  unlockAudio();
                  setBiomeChoice({ forHeroBiome: heroMeta.biomeId, id: biome.id });
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border-2 font-display font-black text-xs sm:text-sm whitespace-nowrap cursor-pointer transition flex-shrink-0 ${
                  isSelected
                    ? `${biome.badgeClass} border-slate-900 shadow-md scale-[1.03]`
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                <span className="text-xl leading-none">{biome.emoji}</span>
                <span>{biome.title.split(' ').slice(0, 2).join(' ')}</span>
                {hasCurrentHero && <span title="You are here!">🦁</span>}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {doneInBiome}/{biome.dayIds.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Biome Stepping Stones (Only 5-6 big, clear cards!) */}
        <div
          className={`rounded-3xl bg-gradient-to-br ${activeBiome.bgClass} border-3 ${activeBiome.borderClass} p-4 sm:p-6 shadow-sm space-y-4`}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{activeBiome.emoji}</span>
              <div>
                <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 leading-tight">
                  {activeBiome.title}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-slate-600">{activeBiome.subtitle}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-black ${activeBiome.badgeClass}`}>
              Tap a circle to play!
            </span>
          </div>

          <div className="relative py-2">
            <svg
              viewBox="0 0 500 80"
              className="hidden sm:block absolute inset-x-6 top-8 h-16 w-[calc(100%-3rem)] pointer-events-none"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M 15 45 Q 115 10, 180 45 T 340 45 T 485 35"
                fill="none"
                stroke={activeBiome.trailStroke}
                strokeWidth="6"
                strokeDasharray="10 8"
                strokeLinecap="round"
                opacity="0.55"
              />
            </svg>

            <div
              className={`relative grid grid-cols-2 gap-3 ${
                activeBiome.dayIds.length >= 6 ? 'sm:grid-cols-3 lg:grid-cols-6' : 'sm:grid-cols-5'
              }`}
            >
              {activeBiome.dayIds.map((dayId, idx) => {
                const meta = getIslandStopMeta(dayId);
                const comp = getStepCompletionForDay(
                  dayId,
                  questProgress,
                  dailyQuizAnswers,
                  questionsByDayId[dayId] || []
                );
                const isCurrent = dayId === heroDayId;
                const offsetClass = idx % 2 === 1 ? 'sm:translate-y-2' : '';
                const isPitStop = Boolean(meta.isPitStop);
                const isFinale = Boolean(meta.isGrandFinale);

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
                    className={`group flex flex-col items-center text-center gap-2 p-3 rounded-3xl border-2 transition cursor-pointer shadow-xs ${offsetClass} ${
                      isFinale
                        ? 'bg-gradient-to-b from-amber-100 via-pink-50 to-purple-100 hover:from-amber-200 border-amber-400 ring-2 ring-pink-300/70'
                        : isPitStop
                        ? 'bg-gradient-to-b from-amber-50 to-yellow-100 hover:to-yellow-200 border-amber-400'
                        : 'bg-white/90 hover:bg-white border-white hover:border-slate-300'
                    } ${
                      isCurrent
                        ? '!border-blue-500 ring-4 ring-blue-300/60 shadow-md'
                        : comp.completedSteps === 4
                        ? '!border-emerald-400'
                        : ''
                    }`}
                  >
                    <div className="relative">
                      <div
                        className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-3xl shadow-sm transition-transform group-hover:scale-105 ${
                          comp.completedSteps === 4
                            ? 'bg-emerald-500 border-emerald-700 text-white'
                            : isCurrent
                            ? activeBiome.nodeActiveClass
                            : isFinale
                            ? 'bg-gradient-to-br from-amber-400 to-pink-500 border-amber-700 text-white'
                            : isPitStop
                            ? 'bg-amber-300 border-amber-600 text-slate-950'
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
                          className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-400 border border-amber-600 text-xs font-black text-slate-950"
                        >
                          🦁
                        </span>
                      )}
                    </div>

                    <div className="font-display font-black text-xs sm:text-sm text-slate-900 leading-tight line-clamp-2">
                      {meta.titleEn}
                    </div>

                    <div className="flex items-center gap-0.5" aria-label={`${comp.starsEarned} of 3 stars`}>
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
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

        {/* Grand Finale Fireworks Showcase Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white p-4 sm:p-5 border-4 border-amber-400 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl flex-shrink-0 shadow-md">
              🎆
            </div>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg text-white">
                {islandSummary.completedStops === islandSummary.totalStops
                  ? `🏆 Island Champion! All ${islandSummary.totalStops} Stops Complete!`
                  : `Fireworks Party (${islandSummary.completedStops}/${islandSummary.totalStops} Stops)`}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              unlockAudio();
              if (fireworksCleanupRef.current) fireworksCleanupRef.current();
              fireworksCleanupRef.current = launchFireworksShow({ grand: true, isMuted });
              if (!isMuted) speakEnglish('Watch the fireworks!');
            }}
            className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-black text-sm shadow-md border-b-4 border-amber-600 cursor-pointer transition active:scale-95 flex-shrink-0"
          >
            🎆 Fireworks!
          </button>
        </div>
      </section>

      {/* COZY ISLAND DOCKS: Story Cove, Arcade Pier, Silly Sentence Lab, Talk to Leo */}
      <section aria-label="Island Docks" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => {
            playTap(isMuted);
            onNavigateTab('story');
          }}
          className="rounded-3xl bg-white hover:bg-purple-50 border-3 border-purple-200 hover:border-purple-400 p-4 text-left shadow-sm flex items-center gap-3.5 cursor-pointer transition"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="font-display font-black text-base text-slate-900">📖 Story Cove</div>
            <div className="text-xs font-bold text-slate-500">
              10 interactive worlds &amp; books
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            playTap(isMuted);
            onNavigateTab('games');
          }}
          className="rounded-3xl bg-white hover:bg-rose-50 border-3 border-rose-200 hover:border-rose-400 p-4 text-left shadow-sm flex items-center gap-3.5 cursor-pointer transition"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <div className="font-display font-black text-base text-slate-900">🕹️ Arcade Pier</div>
            <div className="text-xs font-bold text-slate-500">
              Balloons, phonics &amp; quizzes
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            playBoing(isMuted);
            onNavigateTab('balloons');
          }}
          className="rounded-3xl bg-white hover:bg-amber-50 border-3 border-amber-300 hover:border-amber-500 p-4 text-left shadow-sm flex items-center gap-3.5 cursor-pointer transition"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
            🎈
          </div>
          <div>
            <div className="font-display font-black text-base text-slate-900">Balloon Pop</div>
            <div className="text-xs font-bold text-slate-500">
              Listen &amp; pop the balloons!
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            playTap(isMuted);
            onOpenWalkieTalkie();
          }}
          className="rounded-3xl bg-gradient-to-r from-amber-300 to-yellow-300 hover:from-amber-400 hover:to-yellow-400 border-3 border-amber-500 p-4 text-left shadow-sm flex items-center gap-3.5 cursor-pointer transition"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-300 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <div className="font-display font-black text-base text-slate-950">🎙️ Talk to Leo</div>
            <div className="text-xs font-bold text-amber-950/80">
              Walkie-talkie voice chat!
            </div>
          </div>
        </button>
      </section>

      {/* SILLY ISLAND COMEDY CORNER: Joke Machine + Clickable Goofy Critters */}
      <section aria-label="Silly Comedy Corner" className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-2">
        {/* Leo's Joke Box */}
        <div className="rounded-3xl bg-gradient-to-br from-yellow-50 via-white to-amber-50 border-3 border-amber-300 p-5 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-display font-black text-base text-slate-900">
              <Smile className="w-5 h-5 text-amber-600" />
              <span>🤣 Leo’s Joke Box</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black">
              Joke #{(jokeIdx % KID_JOKES.length) + 1}
            </span>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-4xl leading-none flex-shrink-0">{activeJoke.emoji}</span>
            <div className="space-y-2 flex-1">
              <p className="font-display font-black text-base sm:text-lg text-slate-900 leading-snug">
                {activeJoke.setup}
              </p>
              {showPunchline && (
                <p className="font-display font-black text-base sm:text-lg text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-3.5 py-2 animate-fadeIn">
                  😂 {activeJoke.punchline}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                unlockAudio();
                playTap(isMuted);
                if (!isMuted) speakEnglish(activeJoke.setup);
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Hear Joke</span>
            </button>

            {!showPunchline ? (
              <button
                type="button"
                onClick={() => {
                  unlockAudio();
                  playComedySfx(activeJoke.sfx, isMuted);
                  setShowPunchline(true);
                  try {
                    confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
                  } catch {
                    // ignore
                  }
                  if (!isMuted) speakEnglish(activeJoke.punchline);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-black text-xs border border-amber-500 cursor-pointer"
              >
                🤣 Reveal Punchline!
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  unlockAudio();
                  playTap(isMuted);
                  const next = getNextCyclicIndex(jokeIdx, KID_JOKES.length);
                  setJokeIdx(next);
                  setShowPunchline(false);
                  if (!isMuted) speakEnglish(KID_JOKES[next].setup);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-display font-black text-xs inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Next Joke</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Clickable Island Critters */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-sky-50 border-3 border-emerald-300 p-5 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-2">
            <div className="font-display font-black text-base text-slate-900">
              🦀 Silly Island Critters (Tap one!)
            </div>
            <span className="text-xs font-bold text-emerald-700">Funny sounds!</span>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {ISLAND_CRITTERS.map((critter) => {
              const isSelected = activeCritterId === critter.id;
              return (
                <button
                  key={critter.id}
                  type="button"
                  onClick={() => {
                    unlockAudio();
                    playComedySfx(critter.sfx, isMuted);
                    setActiveCritterId(critter.id);
                    if (critterTimerRef.current) clearTimeout(critterTimerRef.current);
                    critterTimerRef.current = setTimeout(() => setActiveCritterId(null), 3200);
                    if (!isMuted) speakEnglish(critter.line);
                  }}
                  className={`rounded-2xl p-3 border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                    isSelected
                      ? 'bg-amber-100 border-amber-400 animate-silly-jiggle shadow-sm'
                      : 'bg-white hover:bg-emerald-50 border-emerald-200'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl leading-none">{critter.emoji}</span>
                  <span className="text-[11px] font-display font-black text-slate-700 truncate w-full text-center">
                    {critter.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl bg-white border border-emerald-200 px-3.5 py-2.5 min-h-[44px] flex items-center text-xs sm:text-sm font-display font-black text-slate-800">
            {activeCritter
              ? `${activeCritter.emoji} ${activeCritter.name}: “${activeCritter.line}”`
              : 'Tap Captain Pinch, Frog, Duck, or Mini Alien for a goofy surprise!'}
          </div>
        </div>
      </section>
    </div>
  );
}
