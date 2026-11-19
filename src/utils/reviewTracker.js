// Lightweight localStorage tracker for tricky words & weekly parent summary

const STORAGE_KEY = 'deniz_review_words_v1';

const DEFAULT_FALLBACK_WORDS = [
  { word: 'Suitcase', emoji: '🧳', tr: 'Bavul', misses: 0, mastered: 0 },
  { word: 'Octopus', emoji: '🐙', tr: 'Ahtapot', misses: 0, mastered: 0 },
  { word: 'Umbrella', emoji: '☔', tr: 'Şemsiye', misses: 0, mastered: 0 },
  { word: 'Stethoscope', emoji: '🩺', tr: 'Stetoskop', misses: 0, mastered: 0 },
  { word: 'Under', emoji: '⬇️', tr: 'Altında', misses: 0, mastered: 0 },
  { word: 'Ferry', emoji: '⛴️', tr: 'Vapur', misses: 0, mastered: 0 },
  { word: 'Behind', emoji: '🌳', tr: 'Arkasında', misses: 0, mastered: 0 },
  { word: 'Treasure', emoji: '💰', tr: 'Hazine', misses: 0, mastered: 0 },
];

function readMap() {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeMap(data) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage quota errors
  }
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function getReviewIntervalMs(streak = 1) {
  if (streak >= 3) return 7 * ONE_DAY_MS;
  if (streak === 2) return 3 * ONE_DAY_MS;
  return ONE_DAY_MS;
}

export function recordMissedWord(word, emoji = '⭐', tr = '', meta = {}) {
  if (!word) return;
  const key = String(word).trim();
  if (!key) return;
  const now = Date.now();
  const map = readMap();
  const prev = map[key] || { word: key, emoji, tr, misses: 0, mastered: 0, streak: 0, lastSeen: 0 };
  map[key] = {
    ...prev,
    emoji: emoji || prev.emoji,
    tr: tr || prev.tr,
    phraseEn: meta?.phraseEn || prev.phraseEn || '',
    misses: (prev.misses || 0) + 1,
    streak: 0,
    nextReviewAt: now,
    lastSeen: now,
  };
  writeMap(map);
}

export function recordMasteredWord(word, emoji = '⭐', tr = '', meta = {}) {
  if (!word) return;
  const key = String(word).trim();
  if (!key) return;
  const now = Date.now();
  const map = readMap();
  const prev = map[key] || { word: key, emoji, tr, misses: 0, mastered: 0, streak: 0, lastSeen: 0 };
  const nextMisses = Math.max(0, (prev.misses || 0) - 1);
  const nextStreak = nextMisses === 0 ? (prev.streak || 0) + 1 : 0;
  map[key] = {
    ...prev,
    emoji: emoji || prev.emoji,
    tr: tr || prev.tr,
    phraseEn: meta?.phraseEn || prev.phraseEn || '',
    misses: nextMisses,
    mastered: (prev.mastered || 0) + 1,
    streak: nextStreak,
    nextReviewAt: nextMisses === 0 ? now + getReviewIntervalMs(nextStreak) : now,
    lastSeen: now,
  };
  writeMap(map);
}

export function getReviewWords(limit = 5) {
  const map = readMap();
  const now = Date.now();
  const allItems = Object.values(map);

  // Priority 1: Missed words (most misses first, then oldest seen)
  const tricky = allItems
    .filter((item) => (item.misses || 0) > 0)
    .sort((a, b) => {
      if ((b.misses || 0) !== (a.misses || 0)) {
        return (b.misses || 0) - (a.misses || 0);
      }
      return (a.lastSeen || 0) - (b.lastSeen || 0);
    });

  // Priority 2: Spaced-repetition due items (1d -> 3d -> 7d)
  const due = allItems
    .filter((item) => (item.misses || 0) === 0 && item.nextReviewAt && item.nextReviewAt <= now)
    .sort((a, b) => (a.nextReviewAt || 0) - (b.nextReviewAt || 0));

  const prioritized = [...tricky, ...due].slice(0, limit);
  if (prioritized.length >= limit) return prioritized;

  const existingKeys = new Set(prioritized.map((t) => t.word.toLowerCase()));
  const extras = DEFAULT_FALLBACK_WORDS.filter((d) => !existingKeys.has(d.word.toLowerCase()));
  return [...prioritized, ...extras].slice(0, limit);
}

export function getWeeklySummary() {
  const map = readMap();
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = Object.values(map).filter((item) => (item.lastSeen || 0) >= weekAgo);
  const mastered = recent.filter((i) => (i.mastered || 0) > 0 && (i.misses || 0) === 0);
  const tricky = recent.filter((i) => (i.misses || 0) > 0).sort((a, b) => b.misses - a.misses);
  return {
    practicedCount: recent.length,
    masteredWords: mastered.slice(0, 8),
    trickyWords: tricky.slice(0, 6),
  };
}
