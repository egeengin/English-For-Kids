/**
 * Pure-English Adventure Island metadata & 4-step quest completion helpers.
 * Covers all 36 stops from DAILY_EXPEDITION_DAYS across 7 cozy biomes.
 * Every biome ends with a Review Pit-Stop; Stop 36 is the Grand Finale.
 */

export const ISLAND_BIOMES = [
  {
    id: 'beach',
    title: 'Sunny Beach',
    emoji: '🏖️',
    subtitle: 'First Words & Playtime',
    dayIds: ['day-1', 'level-2', 'day-2', 'level-4', 'pitstop-1'],
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
    dayIds: ['day-3', 'level-6', 'day-5', 'day-4', 'pitstop-2'],
    bgClass: 'from-emerald-100 via-teal-50 to-lime-50',
    borderClass: 'border-emerald-300',
    badgeClass: 'bg-emerald-600 text-white',
    trailStroke: '#10B981',
    nodeActiveClass: 'bg-emerald-500 border-emerald-700 text-white',
  },
  {
    id: 'village',
    title: 'Cozy Village',
    emoji: '🏡',
    subtitle: 'Family, Home, Weather & Clothes',
    dayIds: ['level-17', 'level-18', 'level-19', 'level-20', 'pitstop-3'],
    bgClass: 'from-rose-100 via-orange-50 to-yellow-50',
    borderClass: 'border-rose-300',
    badgeClass: 'bg-rose-500 text-white',
    trailStroke: '#FB7185',
    nodeActiveClass: 'bg-rose-500 border-rose-700 text-white',
  },
  {
    id: 'mountain',
    title: 'Starlight Mountain',
    emoji: '⛰️',
    subtitle: 'School, Questions & Super Heroes',
    dayIds: ['day-6', 'level-10', 'day-7', 'level-12', 'pitstop-4'],
    bgClass: 'from-amber-100 via-orange-50 to-yellow-50',
    borderClass: 'border-amber-300',
    badgeClass: 'bg-amber-500 text-slate-950',
    trailStroke: '#F59E0B',
    nodeActiveClass: 'bg-amber-400 border-amber-700 text-slate-950',
  },
  {
    id: 'harbor',
    title: 'Busy City Harbor',
    emoji: '🏙️',
    subtitle: 'Town, Travel, Health & Feelings',
    dayIds: ['level-21', 'level-22', 'level-23', 'level-24', 'pitstop-5'],
    bgClass: 'from-blue-100 via-sky-50 to-slate-50',
    borderClass: 'border-blue-300',
    badgeClass: 'bg-blue-600 text-white',
    trailStroke: '#3B82F6',
    nodeActiveClass: 'bg-blue-500 border-blue-700 text-white',
  },
  {
    id: 'safari',
    title: 'Wild Safari & Market',
    emoji: '🦁',
    subtitle: 'Calendar, Money, Nature & Hobbies',
    dayIds: ['level-25', 'level-26', 'level-27', 'level-28', 'pitstop-6'],
    bgClass: 'from-lime-100 via-yellow-50 to-orange-50',
    borderClass: 'border-lime-400',
    badgeClass: 'bg-lime-600 text-white',
    trailStroke: '#84CC16',
    nodeActiveClass: 'bg-lime-500 border-lime-700 text-white',
  },
  {
    id: 'citadel',
    title: 'Sky Citadel & Grand Finale',
    emoji: '🏰',
    subtitle: 'Time Travel, Stories & Fireworks',
    dayIds: ['level-13', 'level-14', 'level-15', 'level-16', 'level-29', 'pitstop-7'],
    bgClass: 'from-purple-100 via-indigo-50 to-pink-50',
    borderClass: 'border-purple-300',
    badgeClass: 'bg-purple-600 text-white',
    trailStroke: '#8B5CF6',
    nodeActiveClass: 'bg-purple-500 border-purple-700 text-white',
  },
];

export const ISLAND_STOPS_BY_DAY_ID = {
  'day-1': { stopNumber: 1, biomeId: 'beach', emoji: '🍔', titleEn: 'Likes and Magic Words', taglineEn: 'Order snacks & say please!' },
  'level-2': { stopNumber: 2, biomeId: 'beach', emoji: '🚲', titleEn: 'My World and Toys', taglineEn: 'Talk about things you have!' },
  'day-2': { stopNumber: 3, biomeId: 'beach', emoji: '🐆', titleEn: 'I Can Do It!', taglineEn: 'Fast, slow, loud & quiet!' },
  'level-4': { stopNumber: 4, biomeId: 'beach', emoji: '🎮', titleEn: 'Game Time Talk', taglineEn: 'My turn, your turn & let’s play!' },
  'pitstop-1': { stopNumber: 5, biomeId: 'beach', emoji: '🏁', titleEn: 'Beach Pit-Stop Review', taglineEn: 'Remember stops 1 to 4!', isPitStop: true, pitStopNumber: 1 },
  'day-3': { stopNumber: 6, biomeId: 'woods', emoji: '❄️', titleEn: 'Move & Freeze!', taglineEn: 'Jump, run, dance & freeze!' },
  'level-6': { stopNumber: 7, biomeId: 'woods', emoji: '🔍', titleEn: 'Count and Spot It', taglineEn: 'There is, there are & how many?' },
  'day-5': { stopNumber: 8, biomeId: 'woods', emoji: '⚡', titleEn: 'Hide and Seek', taglineEn: 'In, on, under & behind!' },
  'day-4': { stopNumber: 9, biomeId: 'woods', emoji: '⛵', titleEn: 'Sink or Float Lab', taglineEn: 'Ask why & answer because!' },
  'pitstop-2': { stopNumber: 10, biomeId: 'woods', emoji: '🏁', titleEn: 'Woods Pit-Stop Review', taglineEn: 'Remember stops 6 to 9!', isPitStop: true, pitStopNumber: 2 },
  'level-17': { stopNumber: 11, biomeId: 'village', emoji: '👨‍👩‍👧‍👦', titleEn: 'My Family and Friends', taglineEn: 'He is, she is & they are!' },
  'level-18': { stopNumber: 12, biomeId: 'village', emoji: '🏠', titleEn: 'Around My House', taglineEn: 'Bedroom, kitchen & garden!' },
  'level-19': { stopNumber: 13, biomeId: 'village', emoji: '🌦️', titleEn: 'Weather and Seasons', taglineEn: 'Sunny, rainy, windy & snowy!' },
  'level-20': { stopNumber: 14, biomeId: 'village', emoji: '🧥', titleEn: 'Get Dressed!', taglineEn: 'Jackets, sneakers & raincoats!' },
  'pitstop-3': { stopNumber: 15, biomeId: 'village', emoji: '🏁', titleEn: 'Village Pit-Stop Review', taglineEn: 'Remember stops 11 to 14!', isPitStop: true, pitStopNumber: 3 },
  'day-6': { stopNumber: 16, biomeId: 'mountain', emoji: '⏰', titleEn: 'School Morning Clock', taglineEn: 'Wake up, pack up & tell time!' },
  'level-10': { stopNumber: 17, biomeId: 'mountain', emoji: '🕵️', titleEn: 'Question Detective', taglineEn: 'Who, where, what & when?' },
  'day-7': { stopNumber: 18, biomeId: 'mountain', emoji: '👑', titleEn: 'Compare and Story Time', taglineEn: 'Faster, bigger & stronger!' },
  'level-12': { stopNumber: 19, biomeId: 'mountain', emoji: '🏆', titleEn: 'World Records', taglineEn: 'The fastest, biggest & tallest!' },
  'pitstop-4': { stopNumber: 20, biomeId: 'mountain', emoji: '🏁', titleEn: 'Mountain Pit-Stop Review', taglineEn: 'Remember stops 16 to 19!', isPitStop: true, pitStopNumber: 4 },
  'level-21': { stopNumber: 21, biomeId: 'harbor', emoji: '🗺️', titleEn: 'My Town and Directions', taglineEn: 'Turn left, turn right & go straight!' },
  'level-22': { stopNumber: 22, biomeId: 'harbor', emoji: '🚆', titleEn: 'How Do We Go?', taglineEn: 'By bus, by train & on foot!' },
  'level-23': { stopNumber: 23, biomeId: 'harbor', emoji: '🩺', titleEn: 'Healthy Body and Doctor', taglineEn: 'Drink water & feel better!' },
  'level-24': { stopNumber: 24, biomeId: 'harbor', emoji: '🤩', titleEn: 'Feelings and Emotions', taglineEn: 'Excited, proud, brave & calm!' },
  'pitstop-5': { stopNumber: 25, biomeId: 'harbor', emoji: '🏁', titleEn: 'Harbor Pit-Stop Review', taglineEn: 'Remember stops 21 to 24!', isPitStop: true, pitStopNumber: 5 },
  'level-25': { stopNumber: 26, biomeId: 'safari', emoji: '📅', titleEn: 'Days and Birthdays', taglineEn: 'Monday to Sunday & party time!' },
  'level-26': { stopNumber: 27, biomeId: 'safari', emoji: '🪙', titleEn: 'At the Market', taglineEn: 'How much is it? Here you are!' },
  'level-27': { stopNumber: 28, biomeId: 'safari', emoji: '🌴', titleEn: 'Animal Habitats', taglineEn: 'Jungle, ocean, desert & Arctic!' },
  'level-28': { stopNumber: 29, biomeId: 'safari', emoji: '🏀', titleEn: 'Sports and Hobbies', taglineEn: 'Always, sometimes & never!' },
  'pitstop-6': { stopNumber: 30, biomeId: 'safari', emoji: '🏁', titleEn: 'Safari Pit-Stop Review', taglineEn: 'Remember stops 26 to 29!', isPitStop: true, pitStopNumber: 6 },
  'level-13': { stopNumber: 31, biomeId: 'citadel', emoji: '⏳', titleEn: 'Yesterday Time Machine', taglineEn: 'I played, went, saw & ate!' },
  'level-14': { stopNumber: 32, biomeId: 'citadel', emoji: '🚀', titleEn: 'Tomorrow Dreams', taglineEn: 'What I will do & want to be!' },
  'level-15': { stopNumber: 33, biomeId: 'citadel', emoji: '🍝', titleEn: 'Deniz’s World', taglineEn: 'Aachen, spaghetti & sunny holidays!' },
  'level-16': { stopNumber: 34, biomeId: 'citadel', emoji: '🧮', titleEn: 'Science and Math Wizard', taglineEn: 'Dad’s lab, hospital & big numbers!' },
  'level-29': { stopNumber: 35, biomeId: 'citadel', emoji: '📖', titleEn: 'Storyteller’s Bridge', taglineEn: 'First, next, then & finally!' },
  'pitstop-7': { stopNumber: 36, biomeId: 'citadel', emoji: '🎆', titleEn: 'Grand Finale Party', taglineEn: 'Fireworks for an English champion!', isPitStop: true, pitStopNumber: 7, isGrandFinale: true },
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
      isPitStop: Boolean(meta.isPitStop),
      isGrandFinale: Boolean(meta.isGrandFinale),
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
