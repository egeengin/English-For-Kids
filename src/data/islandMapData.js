/**
 * Pure-English Adventure Island metadata & 4-step quest completion helpers.
 * Covers all 16 stops from DAILY_EXPEDITION_DAYS across 4 cozy biomes.
 */

export const ISLAND_BIOMES = [
  {
    id: 'beach',
    title: 'Sunny Beach',
    emoji: '🏖️',
    subtitle: 'First Words & Playtime',
    dayIds: ['day-1', 'level-2', 'day-2', 'level-4'],
    bgClass: 'from-sky-100 via-cyan-50 to-amber-50',
    borderClass: 'border-sky-300',
    badgeClass: 'bg-sky-500 text-white',
    trailStroke: '#38BDF8',
    nodeActiveClass: 'bg-sky-500 border-sky-700 text-white',
  },
  {
    id: 'woods',
    title: 'Whispering Woods',
    emoji: '🌲',
    subtitle: 'Actions, Places & Science',
    dayIds: ['day-3', 'level-6', 'day-5', 'day-4'],
    bgClass: 'from-emerald-100 via-teal-50 to-lime-50',
    borderClass: 'border-emerald-300',
    badgeClass: 'bg-emerald-600 text-white',
    trailStroke: '#10B981',
    nodeActiveClass: 'bg-emerald-500 border-emerald-700 text-white',
  },
  {
    id: 'mountain',
    title: 'Starlight Mountain',
    emoji: '⛰️',
    subtitle: 'School, Questions & Super Heroes',
    dayIds: ['day-6', 'level-10', 'day-7', 'level-12'],
    bgClass: 'from-amber-100 via-orange-50 to-yellow-50',
    borderClass: 'border-amber-300',
    badgeClass: 'bg-amber-500 text-slate-950',
    trailStroke: '#F59E0B',
    nodeActiveClass: 'bg-amber-400 border-amber-700 text-slate-950',
  },
  {
    id: 'citadel',
    title: 'Sky Citadel',
    emoji: '🏰',
    subtitle: 'Time Travel & Deniz’s World',
    dayIds: ['level-13', 'level-14', 'level-15', 'level-16'],
    bgClass: 'from-purple-100 via-indigo-50 to-pink-50',
    borderClass: 'border-purple-300',
    badgeClass: 'bg-purple-600 text-white',
    trailStroke: '#8B5CF6',
    nodeActiveClass: 'bg-purple-500 border-purple-700 text-white',
  },
];

export const ISLAND_STOPS_BY_DAY_ID = {
  'day-1': {
    stopNumber: 1,
    biomeId: 'beach',
    emoji: '🍔',
    titleEn: 'Likes and Magic Words',
    taglineEn: 'Order snacks & say please!',
  },
  'level-2': {
    stopNumber: 2,
    biomeId: 'beach',
    emoji: '🚲',
    titleEn: 'My World and Toys',
    taglineEn: 'Talk about things you have!',
  },
  'day-2': {
    stopNumber: 3,
    biomeId: 'beach',
    emoji: '🐆',
    titleEn: 'I Can Do It!',
    taglineEn: 'Fast, slow, loud & quiet!',
  },
  'level-4': {
    stopNumber: 4,
    biomeId: 'beach',
    emoji: '🎮',
    titleEn: 'Game Time Talk',
    taglineEn: 'My turn, your turn & let’s play!',
  },
  'day-3': {
    stopNumber: 5,
    biomeId: 'woods',
    emoji: '❄️',
    titleEn: 'Move & Freeze!',
    taglineEn: 'Jump, run, dance & freeze!',
  },
  'level-6': {
    stopNumber: 6,
    biomeId: 'woods',
    emoji: '🔍',
    titleEn: 'Count and Spot It',
    taglineEn: 'There is, there are & how many?',
  },
  'day-5': {
    stopNumber: 7,
    biomeId: 'woods',
    emoji: '⚡',
    titleEn: 'Hide and Seek',
    taglineEn: 'In, on, under & behind!',
  },
  'day-4': {
    stopNumber: 8,
    biomeId: 'woods',
    emoji: '⛵',
    titleEn: 'Sink or Float Lab',
    taglineEn: 'Ask why & answer because!',
  },
  'day-6': {
    stopNumber: 9,
    biomeId: 'mountain',
    emoji: '⏰',
    titleEn: 'School Morning Clock',
    taglineEn: 'Wake up, pack up & tell time!',
  },
  'level-10': {
    stopNumber: 10,
    biomeId: 'mountain',
    emoji: '🕵️',
    titleEn: 'Question Detective',
    taglineEn: 'Who, where, what & when?',
  },
  'day-7': {
    stopNumber: 11,
    biomeId: 'mountain',
    emoji: '👑',
    titleEn: 'Compare and Story Time',
    taglineEn: 'Faster, bigger & stronger!',
  },
  'level-12': {
    stopNumber: 12,
    biomeId: 'mountain',
    emoji: '🏆',
    titleEn: 'World Records',
    taglineEn: 'The fastest, biggest & tallest!',
  },
  'level-13': {
    stopNumber: 13,
    biomeId: 'citadel',
    emoji: '⏳',
    titleEn: 'Yesterday Time Machine',
    taglineEn: 'I played, went, saw & ate!',
  },
  'level-14': {
    stopNumber: 14,
    biomeId: 'citadel',
    emoji: '🚀',
    titleEn: 'Tomorrow Dreams',
    taglineEn: 'What I will do & want to be!',
  },
  'level-15': {
    stopNumber: 15,
    biomeId: 'citadel',
    emoji: '🍝',
    titleEn: 'Deniz’s World',
    taglineEn: 'Aachen, spaghetti & sunny holidays!',
  },
  'level-16': {
    stopNumber: 16,
    biomeId: 'citadel',
    emoji: '🧮',
    titleEn: 'Science and Math Wizard',
    taglineEn: 'Dad’s lab, hospital & big numbers!',
  },
};

export function getIslandStopMeta(dayId) {
  return (
    ISLAND_STOPS_BY_DAY_ID[dayId] || {
      stopNumber: 1,
      biomeId: 'beach',
      emoji: '🏝️',
      titleEn: 'Island Quest',
      taglineEn: 'Listen, sing, play & speak!',
    }
  );
}

/**
 * Computes 4-step quest completion for a single island stop.
 */
export function getStepCompletionForDay(
  dayId,
  questProgress = {},
  dailyQuizAnswers = {},
  dayQuestions = []
) {
  const entry = questProgress?.[dayId] || {};
  const learnDone = Boolean(entry.learn);
  const singDone = Boolean(entry.song);

  const totalQs = Array.isArray(dayQuestions) ? dayQuestions.length : 0;
  const answeredCount = totalQs
    ? dayQuestions.filter((q) => Boolean(dailyQuizAnswers?.[q.id])).length
    : 0;
  const playDone = Boolean(entry.quiz) || (totalQs > 0 && answeredCount >= Math.ceil(totalQs / 2));
  const speakDone = Boolean(entry.speak);
  const chestClaimed = Boolean(entry.chestClaimed);

  const completedSteps = [learnDone, singDone, playDone, speakDone].filter(Boolean).length;
  let starsEarned = 0;
  if (completedSteps >= 1) starsEarned = 1;
  if (completedSteps >= 3) starsEarned = 2;
  if (completedSteps === 4) starsEarned = 3;

  let nextStep = 'learn';
  if (!learnDone) nextStep = 'learn';
  else if (!singDone) nextStep = 'song';
  else if (!playDone) nextStep = 'quiz';
  else if (!speakDone) nextStep = 'speak';
  else nextStep = 'learn';

  return {
    learnDone,
    singDone,
    playDone,
    speakDone,
    chestClaimed,
    completedSteps,
    starsEarned,
    nextStep,
    answeredCount,
    totalQs,
  };
}

/**
 * Finds the first stop on the island that still has unfinished steps.
 */
export function findCurrentActiveDayId(
  days = [],
  questProgress = {},
  dailyQuizAnswers = {},
  getQuestionsForDay = () => []
) {
  for (const day of days) {
    const questions = getQuestionsForDay(day.id) || [];
    const status = getStepCompletionForDay(day.id, questProgress, dailyQuizAnswers, questions);
    if (status.completedSteps < 4) {
      return day.id;
    }
  }
  return days[0]?.id || 'day-1';
}

export function getSpokenPhrasesForDay(questProgress = {}, dayId) {
  const map = questProgress?.[dayId]?.spokenPhrases;
  return map && typeof map === 'object' ? { ...map } : {};
}

export function markQuestStepInProgress(questProgress = {}, dayId, stepKey) {
  if (!dayId || !stepKey) return questProgress;
  const existing = questProgress || {};
  const dayEntry = existing[dayId] || {};
  if (dayEntry[stepKey]) return existing;
  return {
    ...existing,
    [dayId]: {
      ...dayEntry,
      [stepKey]: true,
    },
  };
}

export function markSpokenPhraseInProgress(questProgress = {}, dayId, phrase) {
  const clean = typeof phrase === 'string' ? phrase.trim() : '';
  if (!dayId || !clean) return questProgress;
  const existing = questProgress || {};
  const dayEntry = existing[dayId] || {};
  const spoken = dayEntry.spokenPhrases || {};
  if (spoken[clean]) return existing;
  return {
    ...existing,
    [dayId]: {
      ...dayEntry,
      spokenPhrases: {
        ...spoken,
        [clean]: true,
      },
    },
  };
}

export function claimQuestChestInProgress(questProgress = {}, dayId) {
  if (!dayId) return { questProgress, newlyClaimed: false };
  const existing = questProgress || {};
  const dayEntry = existing[dayId] || {};
  if (dayEntry.chestClaimed) {
    return { questProgress: existing, newlyClaimed: false };
  }
  return {
    newlyClaimed: true,
    questProgress: {
      ...existing,
      [dayId]: {
        ...dayEntry,
        chestClaimed: true,
      },
    },
  };
}

export function getIslandOverallSummary(
  days = [],
  questProgress = {},
  dailyQuizAnswers = {},
  getQuestionsForDay = () => []
) {
  const stops = days.map((day) => {
    const meta = getIslandStopMeta(day.id);
    const completion = getStepCompletionForDay(
      day.id,
      questProgress,
      dailyQuizAnswers,
      getQuestionsForDay(day.id) || []
    );
    return {
      dayId: day.id,
      stopNumber: meta.stopNumber,
      titleEn: meta.titleEn,
      emoji: meta.emoji,
      biomeId: meta.biomeId,
      ...completion,
    };
  });

  const totalStops = stops.length;
  const completedStops = stops.filter((s) => s.completedSteps === 4).length;
  const totalStars = stops.reduce((sum, s) => sum + s.starsEarned, 0);

  return {
    totalStops,
    completedStops,
    totalStars,
    maxStars: totalStops * 3,
    stops,
  };
}
