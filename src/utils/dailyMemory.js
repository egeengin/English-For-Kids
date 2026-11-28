// Daily Activity Memory & Recall Layer for Lego English Adventure

const STORAGE_KEY = 'lego_english_daily_activity_logs_v1';
const RECALL_SEEN_KEY = 'lego_english_daily_recall_last_seen_date_v1';

export function getTodayKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateKeyNoon(dateKey) {
  const match = typeof dateKey === 'string' && dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const parsed = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function diffCalendarDays(earlierKey, laterKey) {
  const d1 = parseDateKeyNoon(earlierKey);
  const d2 = parseDateKeyNoon(laterKey);
  if (!d1 || !d2) return 0;
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

export function readDailyLogs() {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function writeDailyLogs(logs) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    // Keep only up to 60 days of activity
    const keys = Object.keys(logs).sort();
    const trimmed = {};
    const keepKeys = keys.slice(-60);
    for (const k of keepKeys) {
      trimmed[k] = logs[k];
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore quota errors
  }
}

export function logDailyActivity({
  stars = 0,
  bricks = 0,
  word = null,
  words = null,
  bookTitle = null,
  missionTitle = null,
  gameName = null,
  questionAnswered = false,
  detail = null,
}) {
  const todayKey = getTodayKey();
  const logs = readDailyLogs();
  const current = logs[todayKey] || {
    date: todayKey,
    stars: 0,
    bricks: 0,
    questionsCount: 0,
    words: [], // [{ word: 'Apple', emoji: '🍎', tr: 'Elma' }]
    booksRead: [], // ['Holiday at Nirvana Cosmopolitan']
    missions: [], // ['Day 1 Şarkı']
    games: [], // ['Mini Books', 'Sound Detective']
    events: [], // [{ time: '15:40', type: 'book'|'mission'|'game'|'word'|'quiz', label: '...', stars, bricks }]
    lastTimestamp: Date.now(),
  };
  if (!Array.isArray(current.events)) current.events = [];

  if (stars > 0) current.stars += stars;
  if (bricks > 0) current.bricks += bricks;
  if (questionAnswered) current.questionsCount += 1;

  // Track single word
  if (word) {
    const wordStr = typeof word === 'string' ? word.trim() : word.word?.trim();
    if (wordStr) {
      const existingIdx = current.words.findIndex(
        (w) => (typeof w === 'string' ? w : w.word).toLowerCase() === wordStr.toLowerCase()
      );
      const wordObj =
        typeof word === 'object' && word.word
          ? { word: word.word, emoji: word.emoji || '⭐', tr: word.tr || '' }
          : { word: wordStr, emoji: '⭐', tr: '' };

      if (existingIdx >= 0) {
        current.words[existingIdx] = { ...current.words[existingIdx], ...wordObj };
      } else {
        current.words.push(wordObj);
      }
    }
  }

  // Track multiple words
  if (Array.isArray(words)) {
    for (const w of words) {
      const wordStr = typeof w === 'string' ? w.trim() : w.word?.trim();
      if (!wordStr) continue;
      const existingIdx = current.words.findIndex(
        (item) => (typeof item === 'string' ? item : item.word).toLowerCase() === wordStr.toLowerCase()
      );
      const wordObj =
        typeof w === 'object' && w.word
          ? { word: w.word, emoji: w.emoji || '⭐', tr: w.tr || '' }
          : { word: wordStr, emoji: '⭐', tr: '' };

      if (existingIdx >= 0) {
        current.words[existingIdx] = { ...current.words[existingIdx], ...wordObj };
      } else {
        current.words.push(wordObj);
      }
    }
  }

  // Track book read
  if (bookTitle && typeof bookTitle === 'string') {
    const title = bookTitle.trim();
    if (title && !current.booksRead.includes(title)) {
      current.booksRead.push(title);
    }
  }

  // Track mission
  if (missionTitle && typeof missionTitle === 'string') {
    const m = missionTitle.trim();
    if (m && !current.missions.includes(m)) {
      current.missions.push(m);
    }
  }

  // Track game
  if (gameName && typeof gameName === 'string') {
    const g = gameName.trim();
    if (g && !current.games.includes(g)) {
      current.games.push(g);
    }
  }

  // Append timestamped timeline event for detailed parent log
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  let eventType = 'quiz';
  let eventLabel = detail || '';
  if (bookTitle) {
    eventType = 'book';
    eventLabel = eventLabel || `📖 Kitap: ${bookTitle.trim()}`;
  } else if (missionTitle) {
    eventType = 'mission';
    eventLabel = eventLabel || `🗺️ Görev: ${missionTitle.trim()}`;
  } else if (gameName) {
    eventType = 'game';
    eventLabel = eventLabel || `🎮 Oyun: ${gameName.trim()}`;
  } else if (word) {
    eventType = 'word';
    const wLabel = typeof word === 'string' ? word.trim() : `${word.emoji || '⭐'} ${word.word}`;
    eventLabel = eventLabel || `🔤 Kelime: ${wLabel}`;
  } else if (questionAnswered) {
    eventType = 'quiz';
    eventLabel = eventLabel || '🎯 Soru cevaplandı';
  } else if (stars > 0 || bricks > 0) {
    eventLabel = eventLabel || '⭐ Ödül kazanıldı';
  }

  if (eventLabel) {
    current.events.push({
      time: timeStr,
      type: eventType,
      label: eventLabel,
      stars: stars > 0 ? stars : 0,
      bricks: bricks > 0 ? bricks : 0,
    });
    if (current.events.length > 60) {
      current.events = current.events.slice(-60);
    }
  }

  current.lastTimestamp = Date.now();
  logs[todayKey] = current;
  writeDailyLogs(logs);
  return current;
}

export function shouldShowDailyRecall() {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    const lastSeen = window.localStorage.getItem(RECALL_SEEN_KEY);
    const today = getTodayKey();
    return lastSeen !== today;
  } catch {
    return false;
  }
}

export function markDailyRecallSeen() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(RECALL_SEEN_KEY, getTodayKey());
  } catch {
    // Ignore quota errors
  }
}

/**
 * Returns structured summary of previous activity and today's activity
 * so that when the user enters each day, they are reminded of what they achieved!
 */
export function getDailyMemorySummary({
  childName = 'Deniz',
  streak = 1,
  fallbackMasteredWords = [],
} = {}) {
  const logs = readDailyLogs();
  const todayKey = getTodayKey();
  const todayActivity = logs[todayKey] || null;

  // Find previous active days sorted latest first
  const pastDates = Object.keys(logs)
    .filter((k) => k < todayKey)
    .sort()
    .reverse();

  let previousActivity = null;
  let previousDate = null;

  if (pastDates.length > 0) {
    previousDate = pastDates[0];
    previousActivity = logs[previousDate];
  }

  // If no previous date recorded in logs but user already has progress (e.g. from existing state)
  const hasPreviousActivity = Boolean(
    previousActivity &&
      ((previousActivity.words && previousActivity.words.length > 0) ||
        (previousActivity.booksRead && previousActivity.booksRead.length > 0) ||
        previousActivity.stars > 0 ||
        previousActivity.questionsCount > 0)
  );

  let recapStats = null;
  let isYesterday = false;

  if (hasPreviousActivity) {
    const diffDays = diffCalendarDays(previousDate, todayKey);
    isYesterday = diffDays === 1;

    recapStats = {
      date: previousDate,
      isYesterday,
      stars: previousActivity.stars || 0,
      bricks: previousActivity.bricks || 0,
      questionsCount: previousActivity.questionsCount || 0,
      words: Array.isArray(previousActivity.words) ? previousActivity.words : [],
      booksRead: Array.isArray(previousActivity.booksRead) ? previousActivity.booksRead : [],
      missions: Array.isArray(previousActivity.missions) ? previousActivity.missions : [],
      games: Array.isArray(previousActivity.games) ? previousActivity.games : [],
    };
  } else if (Array.isArray(fallbackMasteredWords) && fallbackMasteredWords.length > 0) {
    // Graceful fallback from mastered words in state
    recapStats = {
      date: 'Önceki Çalışma',
      isYesterday: false,
      stars: 10,
      bricks: 4,
      questionsCount: fallbackMasteredWords.length,
      words: fallbackMasteredWords.slice(0, 6).map((w) => ({
        word: typeof w === 'string' ? w : w.word || 'Word',
        emoji: '⭐',
        tr: '',
      })),
      booksRead: ['Holiday at Nirvana Cosmopolitan'],
      missions: ['Günlük Görev'],
      games: ['Mini Kitaplar'],
    };
  }

  // Spoken English Greeting for Leo
  let spokenGreetingEn = `Welcome back, ${childName}! `;
  if (recapStats) {
    const timeWord = recapStats.isYesterday ? 'yesterday' : 'last time';
    const bookPhrase =
      recapStats.booksRead.length > 0
        ? `You read ${recapStats.booksRead[0]}, `
        : '';
    const wordPhrase =
      recapStats.words.length > 0
        ? `practiced ${recapStats.words.length} English words, `
        : '';
    const starPhrase =
      recapStats.stars > 0 ? `and earned ${recapStats.stars} stars! ` : '';

    spokenGreetingEn += `Great job ${timeWord}! ${bookPhrase}${wordPhrase}${starPhrase}You are on a ${streak}-day streak! Let's build and learn today!`;
  } else {
    spokenGreetingEn += `You are on a ${streak}-day streak! I am excited to learn with you today! Let's read mini-books, practice new words, and build awesome Lego models!`;
  }

  // Turkish description
  let summarySentenceTr = '';
  if (recapStats) {
    const timeLabel = recapStats.isYesterday ? 'Dün' : 'En son çalışmanda';
    const parts = [];
    if (recapStats.booksRead.length > 0) {
      parts.push(`"${recapStats.booksRead[0]}" kitabını okudun`);
    }
    if (recapStats.words.length > 0) {
      parts.push(`${recapStats.words.length} kelime çalıştın`);
    }
    if (recapStats.stars > 0) {
      parts.push(`${recapStats.stars} yıldız kazandın`);
    }
    summarySentenceTr = `${timeLabel} ${parts.join(', ')}. Harika bir ilerleme!`;
  } else {
    summarySentenceTr = `Bugün seninle harika yeni kelimeler öğreneceğiz ve yıldızlar toplayacağız!`;
  }

  return {
    todayKey,
    hasPreviousActivity: Boolean(recapStats),
    recapStats,
    todayStats: todayActivity
      ? {
          stars: todayActivity.stars || 0,
          bricks: todayActivity.bricks || 0,
          questionsCount: todayActivity.questionsCount || 0,
          words: todayActivity.words || [],
          booksRead: todayActivity.booksRead || [],
          missions: todayActivity.missions || [],
          games: todayActivity.games || [],
        }
      : null,
    spokenGreetingEn,
    summarySentenceTr,
    streak,
  };
}
