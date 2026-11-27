import test from 'node:test';
import assert from 'node:assert/strict';

import { startAudioClipRecorder } from '../src/utils/audioRecorder.js';
import {
  getLocalDateKey,
  computeNextStreak,
  INITIAL_STATE,
  loadSavedState,
  saveState,
} from '../src/utils/storage.js';
import {
  getTodayKey,
  readDailyLogs,
  writeDailyLogs,
  logDailyActivity,
  shouldShowDailyRecall,
  markDailyRecallSeen,
  getDailyMemorySummary,
} from '../src/utils/dailyMemory.js';
import {
  recordMissedWord,
  recordMasteredWord,
  getReviewWords,
  getWeeklySummary,
} from '../src/utils/reviewTracker.js';
import {
  initAudioContext,
  playDiDit,
  playBoing,
  playGiggle,
  playSillyToot,
  playComicPop,
  startKidsSongBeat,
  stopKidsSongBeat,
} from '../src/utils/soundEffects.js';
import {
  LEO_COSTUMES,
  LEO_TICKLE_LINES,
  KID_JOKES,
  ISLAND_CRITTERS,
  SILLY_SENTENCE_PARTS,
  SILLY_VOICE_CHALLENGES,
  FUNNY_COMBO_CHEERS,
  FUNNY_OOPS_LINES,
  buildSillySentence,
  getNextCyclicIndex,
  getRandomSillyIndices,
  getFunnyLineByIndex,
} from '../src/data/funnyData.js';
import {
  isSpeechRecognitionSupported,
  createSpeechListener,
  calculateSimilarity,
  matchSpokenOption,
  evaluateKidPronunciation,
} from '../src/utils/speechRecognition.js';
import {
  getEffectiveGeminiApiKey,
  saveGeminiApiKey,
  clearGeminiApiKey,
  getOfflineLeoResponse,
  chatWithLeoGemini,
  testGeminiApiKey,
  evaluateChildSpeechWithGemini,
} from '../src/utils/gemini.js';
import {
  getAzureSpeechAsset,
  resetManifestCacheForTesting,
} from '../src/utils/azureSpeechManifest.js';
import {
  cleanTextForTTS,
  audioDataToWavBlob,
  resolveSequentialAssets,
  synthesizeGeminiSpeech,
  precacheSpeechLibrary,
  stopSpeech,
  prefetchSpeech,
  unlockAudio,
  triggerHoverSpeech,
  cancelHoverSpeech,
  speakEnglish,
  speakTurkish,
  speakGerman,
  speakEncouragement,
  speakDialoguePhrase,
  speakPhoneme,
  speakEnglishSequence,
} from '../src/utils/speech.js';

function saveGlobals(names) {
  const saved = new Map();
  for (const name of names) {
    saved.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
  }
  return () => {
    for (const [name, desc] of saved.entries()) {
      if (desc) {
        Object.defineProperty(globalThis, name, desc);
      } else {
        delete globalThis[name];
      }
    }
  };
}

function setGlobal(name, value) {
  Object.defineProperty(globalThis, name, {
    value,
    configurable: true,
    writable: true,
    enumerable: true,
  });
}

function makeMemoryStorage(throwOnSet = false) {
  const store = {};
  return {
    store,
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => {
      if (throwOnSet) throw new Error('QuotaExceededError');
      store[k] = String(v);
    },
    removeItem: (k) => {
      delete store[k];
    },
  };
}

function makeSamplePcmBase64(numSamples = 800, sampleRate = null) {
  if (!sampleRate) {
    const pcm = new Uint8Array(numSamples * 2);
    for (let i = 0; i < numSamples; i++) {
      const val = (i % 40) - 20;
      pcm[i * 2] = val & 0xff;
      pcm[i * 2 + 1] = (val >> 8) & 0xff;
    }
    let bin = '';
    for (const b of pcm) bin += String.fromCharCode(b);
    return btoa(bin);
  }
  const pcmLen = numSamples * 2;
  const buf = new ArrayBuffer(44 + pcmLen + 8);
  const view = new DataView(buf);
  const writeStr = (off, s) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + pcmLen, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, pcmLen, true);
  writeStr(44 + pcmLen, 'C2PAtest');
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

test('audioRecorder: covers unsupported, rejected mic, happy recording, inactive, stop error, and empty chunks', async () => {
  const restore = saveGlobals(['navigator', 'MediaRecorder', 'URL']);
  try {
    setGlobal('navigator', {});
    setGlobal('MediaRecorder', undefined);
    assert.equal(await startAudioClipRecorder(), null);

    setGlobal('navigator', {
      mediaDevices: { getUserMedia: async () => { throw new Error('PermissionDenied'); } },
    });
    class DummyRecorder {
      start() {}
    }
    setGlobal('MediaRecorder', DummyRecorder);
    assert.equal(await startAudioClipRecorder(), null);

    let stoppedTracks = 0;
    const fakeStream = {
      getTracks: () => [{ stop: () => { stoppedTracks += 1; } }],
    };
    setGlobal('navigator', {
      mediaDevices: { getUserMedia: async () => fakeStream },
    });
    setGlobal('URL', {
      createObjectURL: (blob) => `blob:mock/${blob.size}`,
      revokeObjectURL: () => {},
    });

    class ActiveRecorder {
      constructor() {
        this.state = 'inactive';
        this.mimeType = 'audio/webm';
        this.ondataavailable = null;
        this.onstop = null;
      }
      start() {
        this.state = 'recording';
      }
      stop() {
        this.state = 'inactive';
        if (this.ondataavailable) this.ondataavailable({ data: new Blob(['abc'], { type: 'audio/webm' }) });
        if (this.onstop) this.onstop();
      }
    }
    setGlobal('MediaRecorder', ActiveRecorder);
    const rec1 = await startAudioClipRecorder();
    assert.ok(rec1);
    const url1 = await rec1.stopAndGetUrl();
    assert.equal(url1, 'blob:mock/3');
    assert.equal(stoppedTracks, 1);

    // Inactive branch with zero chunks -> null
    class InactiveRecorder {
      constructor() {
        this.state = 'inactive';
        this.ondataavailable = null;
      }
      start() {
        if (this.ondataavailable) this.ondataavailable({ data: { size: 0 } });
      }
    }
    setGlobal('MediaRecorder', InactiveRecorder);
    const rec2 = await startAudioClipRecorder();
    assert.equal(await rec2.stopAndGetUrl(), null);

    // recorder.stop throws branch -> null
    class ThrowingStopRecorder {
      constructor() {
        this.state = 'recording';
      }
      start() {}
      stop() {
        throw new Error('stop failed');
      }
    }
    setGlobal('MediaRecorder', ThrowingStopRecorder);
    const rec3 = await startAudioClipRecorder();
    assert.equal(await rec3.stopAndGetUrl(), null);
  } finally {
    restore();
  }
});

test('storage: covers local date formatting, streak transitions, tab sanitization, and save errors', () => {
  const restore = saveGlobals(['window', 'localStorage']);
  try {
    assert.equal(getLocalDateKey(new Date(2026, 0, 5, 23, 55, 0)), '2026-01-05');
    assert.equal(getLocalDateKey('2026-03-09T12:00:00Z').startsWith('2026-03-'), true);

    assert.equal(computeNextStreak(null, '2026-11-27', 3), 3);
    assert.equal(computeNextStreak('2026-11-27', '2026-11-27', 4), 4);
    assert.equal(computeNextStreak('2026-11-26', '2026-11-27', 4), 5);
    assert.equal(computeNextStreak('2026-11-24', '2026-11-27', 4), 1);
    assert.equal(computeNextStreak('2026-11-29', '2026-11-27', 4), 4);
    assert.equal(computeNextStreak('not-a-date', '2026-11-27', 0), 1);

    setGlobal('window', undefined);
    assert.deepEqual(loadSavedState(), INITIAL_STATE);
    saveState(INITIAL_STATE); // no-op when window is undefined

    const mem = makeMemoryStorage();
    setGlobal('localStorage', mem);
    setGlobal('window', { localStorage: mem });

    const today = getLocalDateKey();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = getLocalDateKey(yesterdayDate);
    const threeDaysAgoDate = new Date();
    threeDaysAgoDate.setDate(threeDaysAgoDate.getDate() - 3);
    const threeDaysAgo = getLocalDateKey(threeDaysAgoDate);

    mem.setItem(
      'lego_english_adventure_state_v1',
      JSON.stringify({ streak: 5, lastActiveDate: yesterday, lastTab: 'parent' })
    );
    const nextDay = loadSavedState();
    assert.equal(nextDay.streak, 6);
    assert.equal(nextDay.lastActiveDate, today);
    assert.equal(nextDay.lastTab, 'island');

    mem.setItem(
      'lego_english_adventure_state_v1',
      JSON.stringify({ streak: 8, lastActiveDate: threeDaysAgo, lastTab: 'daily' })
    );
    const brokenStreak = loadSavedState();
    assert.equal(brokenStreak.streak, 1);
    assert.equal(brokenStreak.lastTab, 'daily');

    for (const legacyTab of ['road', 'diorama', 'workshop', 'parent', 'unknown_tab']) {
      mem.setItem(
        'lego_english_adventure_state_v1',
        JSON.stringify({ lastTab: legacyTab })
      );
      assert.equal(loadSavedState().lastTab, 'island');
    }

    const throwingMem = makeMemoryStorage(true);
    setGlobal('localStorage', throwingMem);
    setGlobal('window', { localStorage: throwingMem });
    saveState({ ...INITIAL_STATE, stars: 10 }); // catches quota error cleanly
  } finally {
    restore();
  }
});

test('dailyMemory: covers logs trimming, multi-word logging, recall modal state, yesterday vs older summary, and fallback', () => {
  const restore = saveGlobals(['window', 'localStorage']);
  try {
    setGlobal('window', undefined);
    assert.deepEqual(readDailyLogs(), {});
    assert.equal(shouldShowDailyRecall(), false);

    const mem = makeMemoryStorage();
    setGlobal('localStorage', mem);
    setGlobal('window', { localStorage: mem });

    // Corrupt JSON fallback
    mem.setItem('lego_english_daily_activity_logs_v1', '{bad');
    assert.deepEqual(readDailyLogs(), {});

    // No history & no fallback
    const emptySummary = getDailyMemorySummary({ childName: 'Deniz', streak: 2 });
    assert.equal(emptySummary.hasPreviousActivity, false);
    assert.equal(emptySummary.todayStats, null);

    // Fallback mastered words
    const fallbackSummary = getDailyMemorySummary({
      childName: 'Deniz',
      streak: 3,
      fallbackMasteredWords: ['Apple', { word: 'Cat' }],
    });
    assert.equal(fallbackSummary.hasPreviousActivity, true);
    assert.equal(fallbackSummary.recapStats.words.length, 2);

    // 65-day trimming
    const manyLogs = {};
    for (let i = 1; i <= 65; i++) {
      const k = `2025-01-${String(i).padStart(2, '0')}`;
      manyLogs[k] = { stars: i };
    }
    writeDailyLogs(manyLogs);
    assert.equal(Object.keys(readDailyLogs()).length, 60);

    // Log today's activity with array of words, duplicates, book, mission, game
    const log1 = logDailyActivity({
      stars: 4,
      bricks: 2,
      word: { word: 'Apple', emoji: '🍎', tr: 'Elma' },
      words: ['Rocket', { word: 'apple', emoji: '🍏', tr: 'Elma' }, '   ', { word: '   ' }],
      bookTitle: 'Holiday at Nirvana Cosmopolitan',
      missionTitle: 'Stop 1',
      gameName: 'Balloon Pop',
      questionAnswered: true,
    });
    assert.equal(log1.stars, 4);
    assert.equal(log1.words.length, 2);
    assert.equal(log1.games.length, 1);

    // Yesterday entry -> isYesterday: true
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yKey = getTodayKey(yesterdayDate);
    const curLogs = readDailyLogs();
    curLogs[yKey] = {
      stars: 6,
      bricks: 3,
      questionsCount: 5,
      words: [{ word: 'Star', emoji: '⭐' }],
      booksRead: ['Holiday at Nirvana Cosmopolitan'],
      missions: ['Stop 1'],
      games: ['Quick Speak'],
    };
    writeDailyLogs(curLogs);
    const yesterdaySummary = getDailyMemorySummary({ childName: 'Deniz', streak: 4 });
    assert.equal(yesterdaySummary.recapStats.isYesterday, true);
    assert.ok(yesterdaySummary.spokenGreetingEn.includes('yesterday'));
    assert.ok(yesterdaySummary.summarySentenceTr.includes('Dün'));
    assert.equal(yesterdaySummary.todayStats.stars, 4);

    // Older entry (3 days ago) -> isYesterday: false
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 3);
    const oldKey = getTodayKey(oldDate);
    writeDailyLogs({
      [oldKey]: { stars: 3, bricks: 1, questionsCount: 2, words: ['Dog'], booksRead: [] },
    });
    const oldSummary = getDailyMemorySummary({ childName: 'Deniz', streak: 1 });
    assert.equal(oldSummary.recapStats.isYesterday, false);
    assert.ok(oldSummary.spokenGreetingEn.includes('last time'));

    // Recall seen key
    assert.equal(shouldShowDailyRecall(), true);
    markDailyRecallSeen();
    assert.equal(shouldShowDailyRecall(), false);
  } finally {
    restore();
  }
});

test('reviewTracker: covers spaced repetition intervals, miss decrement, priority sorting, and weekly summary', () => {
  const restore = saveGlobals(['window', 'localStorage']);
  try {
    const mem = makeMemoryStorage();
    setGlobal('localStorage', mem);
    setGlobal('window', { localStorage: mem });

    // Corrupt storage recovery
    mem.setItem('deniz_review_words_v1', 'invalid-json');
    assert.equal(getReviewWords(5).length, 5);

    recordMasteredWord('');
    recordMissedWord('   ');

    // Streak 1 -> 2 -> 3 spaced repetition intervals
    recordMasteredWord('Rocket', '🚀', 'Roket', { phraseEn: 'A red rocket!' });
    let stored = JSON.parse(mem.getItem('deniz_review_words_v1'));
    assert.equal(stored.Rocket.streak, 1);

    recordMasteredWord('Rocket');
    recordMasteredWord('Rocket');
    stored = JSON.parse(mem.getItem('deniz_review_words_v1'));
    assert.equal(stored.Rocket.streak, 3);
    assert.ok(stored.Rocket.nextReviewAt - stored.Rocket.lastSeen >= 6 * 24 * 60 * 60 * 1000);

    // Misses + decrement on mastery
    recordMissedWord('Umbrella', '☔', 'Şemsiye');
    recordMissedWord('Umbrella');
    recordMasteredWord('Umbrella');
    stored = JSON.parse(mem.getItem('deniz_review_words_v1'));
    assert.equal(stored.Umbrella.misses, 1);
    assert.equal(stored.Umbrella.streak, 0);

    // Old item excluded from weekly summary + due item included in review list
    stored.DueWord = {
      word: 'DueWord',
      emoji: '🎈',
      tr: 'Balon',
      misses: 0,
      mastered: 2,
      streak: 1,
      nextReviewAt: Date.now() - 5000,
      lastSeen: Date.now() - 10 * 24 * 60 * 60 * 1000,
    };
    mem.setItem('deniz_review_words_v1', JSON.stringify(stored));

    const dueList = getReviewWords(3);
    assert.equal(dueList[0].word, 'Umbrella');
    assert.ok(dueList.some((i) => i.word === 'DueWord'));

    const weekly = getWeeklySummary();
    assert.ok(weekly.masteredWords.some((i) => i.word === 'Rocket'));
    assert.ok(weekly.trickyWords.some((i) => i.word === 'Umbrella'));
    assert.equal(weekly.masteredWords.some((i) => i.word === 'DueWord'), false);
  } finally {
    restore();
  }
});

test('soundEffects: covers playDiDit, suspended AudioContext resume, and beat steps', async () => {
  const restore = saveGlobals(['window']);
  try {
    let resumeCount = 0;
    let oscStartCount = 0;
    const mkNode = () => ({
      type: 'sine',
      frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} },
      gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} },
      connect() { return this; },
      start() { oscStartCount += 1; },
      stop() {},
    });
    class MockSuspendedAudioContext {
      constructor() {
        this.state = 'suspended';
        this.currentTime = 1;
        this.sampleRate = 44100;
        this.destination = {};
      }
      resume() {
        resumeCount += 1;
        this.state = 'running';
      }
      createOscillator() { return mkNode(); }
      createGain() { return mkNode(); }
      createBiquadFilter() { return { ...mkNode(), Q: { setValueAtTime() {} } }; }
      createBuffer(ch, len) { return { getChannelData: () => new Float32Array(len) }; }
      createBufferSource() { return { buffer: null, connect() {}, start() {}, stop() {} }; }
    }

    setGlobal('window', { AudioContext: MockSuspendedAudioContext });
    const ctx = initAudioContext();
    assert.ok(ctx);
    assert.ok(resumeCount >= 1);

    playDiDit(true);
    const beforeDiDit = oscStartCount;
    playDiDit(false);
    assert.equal(oscStartCount - beforeDiDit, 2);

    for (const sfxFn of [playBoing, playGiggle, playSillyToot, playComicPop]) {
      sfxFn(true);
    }
    const beforeFunny = oscStartCount;
    playBoing(false);
    playGiggle(false);
    playSillyToot(false);
    playComicPop(false);
    assert.equal(oscStartCount - beforeFunny, 8);

    const steps = [];
    startKidsSongBeat(false, 2, (s) => steps.push(s));
    await new Promise((r) => setTimeout(r, 1000));
    stopKidsSongBeat();
    assert.ok(steps.includes(0));
    assert.ok(steps.length >= 2);
  } finally {
    stopKidsSongBeat();
    restore();
  }
});

test('speechRecognition: covers unsupported mic, full listener events, phonetic map, matching ties, and Gemini fallback', async () => {
  const restore = saveGlobals(['window', 'fetch']);
  try {
    setGlobal('window', undefined);
    assert.equal(isSpeechRecognitionSupported(), false);
    let unsupportedErr = null;
    assert.equal(createSpeechListener({ onError: (m) => { unsupportedErr = m; } }), null);
    assert.ok(unsupportedErr);

    let lastInstance = null;
    class ControlledRecognition {
      constructor() {
        lastInstance = this;
      }
      start() { this.onstart?.(); }
      stop() { this.onend?.(); }
      abort() {}
    }
    setGlobal('window', { webkitSpeechRecognition: ControlledRecognition });
    assert.equal(isSpeechRecognitionSupported(), true);

    const events = [];
    const listener = createSpeechListener({
      onStart: () => events.push('start'),
      onInterim: (t) => events.push(`interim:${t}`),
      onFinal: (t) => events.push(`final:${t}`),
      onError: (msg, code) => events.push(`err:${code}:${msg}`),
      onEnd: () => events.push('end'),
    });
    listener.start();
    // Interim followed by end recovery (no isFinal packet)
    lastInstance.onresult({
      resultIndex: 0,
      results: [{ 0: { transcript: 'blue car' }, isFinal: false }],
    });
    lastInstance.onerror({ error: 'not-allowed' });
    lastInstance.onerror({ error: 'no-speech' });
    lastInstance.onerror({ error: 'network' });
    lastInstance.stop();
    listener.abort();
    assert.ok(events.includes('interim:blue car'));
    assert.ok(events.includes('final:blue car'));
    assert.ok(events.some((e) => e.startsWith('err:not-allowed')));
    assert.ok(events.some((e) => e.startsWith('err:no-speech')));

    assert.equal(calculateSimilarity('', 'apple'), 0);
    assert.equal(calculateSimilarity('apple', 'apple'), 1);
    assert.ok(calculateSimilarity('apple pie', 'apple') >= 0.75);
    assert.ok(calculateSimilarity('cat', 'bat') > 0.6);

    // Phonetic map matching
    const opts = [{ textEn: 'Red' }, { textEn: 'Blue' }, { textEn: 'Good Morning' }];
    assert.equal(matchSpokenOption('ret', opts)?.textEn, 'Red');
    assert.equal(matchSpokenOption('blu', opts)?.textEn, 'Blue');
    assert.equal(matchSpokenOption('gud mornin', opts)?.textEn, 'Good Morning');
    assert.equal(matchSpokenOption('', opts), null);
    // Ambiguous near tie returns null
    assert.equal(matchSpokenOption('cat', [{ textEn: 'cat one' }, { textEn: 'cat two' }]), null);

    // Pronunciation evaluation paths
    const emptyEval = await evaluateKidPronunciation({ targetPhrase: 'Hello', transcript: '' });
    assert.equal(emptyEval.isAccepted, false);

    const exactEval = await evaluateKidPronunciation({ targetPhrase: 'Good morning', transcript: 'good morning!' });
    assert.equal(exactEval.isAccepted, true);
    assert.equal(exactEval.stars, 3);

    const phoneticEval = await evaluateKidPronunciation({ targetPhrase: 'My name is Deniz', transcript: 'mein nem ist denis' });
    assert.equal(phoneticEval.isAccepted, true);

    const nameEval = await evaluateKidPronunciation({ targetPhrase: 'Hi Deniz!', transcript: 'deniz', childName: 'Deniz' });
    assert.equal(nameEval.isAccepted, true);

    // Mock Gemini fallback accept
    setGlobal('fetch', async () => ({
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{ text: '{"isAccepted":true,"stars":2,"feedbackEn":"Nice!","feedbackDe":"Gut!","feedbackTr":"Harika!"}' }],
          },
        }],
      }),
    }));
    const geminiAccepted = await evaluateKidPronunciation({
      targetPhrase: 'Elephant',
      transcript: 'fant',
      geminiApiKey: 'AIzaSyFakeTestKeyWithLengthMoreThan20',
    });
    assert.equal(geminiAccepted.isAccepted, true);
    assert.equal(geminiAccepted.source, 'gemini');

    // Mock Gemini failure fallback to gentle retry
    setGlobal('fetch', async () => { throw new Error('offline'); });
    const offlineFallback = await evaluateKidPronunciation({
      targetPhrase: 'Elephant',
      transcript: 'xyz',
      geminiApiKey: 'AIzaSyFakeTestKeyWithLengthMoreThan20',
    });
    assert.equal(offlineFallback.isAccepted, false);
  } finally {
    restore();
  }
});

test('gemini: covers key persistence, legacy migration, all offline Leo branches, and chat/test API paths', async () => {
  const restore = saveGlobals(['window', 'localStorage', 'fetch']);
  try {
    const mem = makeMemoryStorage();
    setGlobal('localStorage', mem);
    setGlobal('window', { localStorage: mem });

    assert.equal(saveGeminiApiKey('short'), false);
    assert.equal(saveGeminiApiKey('AIzaSyValidTestKey_1234567890'), true);
    assert.equal(getEffectiveGeminiApiKey(), 'AIzaSyValidTestKey_1234567890');
    clearGeminiApiKey();
    assert.equal(saveGeminiApiKey(''), true);

    // Legacy key migration
    mem.setItem('gemini_api_key', 'AIzaSyLegacyTestKey_1234567890');
    assert.equal(getEffectiveGeminiApiKey(), 'AIzaSyLegacyTestKey_1234567890');
    clearGeminiApiKey();
    mem.removeItem('gemini_api_key');

    // Offline Leo branches
    assert.equal(getOfflineLeoResponse('cheese', 'Deniz', 'pizza', 1).source, 'offline');
    for (const prompt of ['', 'hello leo', 'my favorite color is blue', 'what is your name', 'how are you', 'fast car', 'space rocket', 'my dog', 'i am hungry pizza', 'random sentence']) {
      const r = getOfflineLeoResponse(prompt, 'Deniz', 'free', 0);
      assert.ok(r.replyEn && r.hints.length === 2);
    }

    // testGeminiApiKey paths
    assert.equal((await testGeminiApiKey('tiny')).success, false);
    setGlobal('fetch', async () => ({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: 'OK' }] } }] }),
    }));
    assert.equal((await testGeminiApiKey('AIzaSyValidTestKey_1234567890')).success, true);

    setGlobal('fetch', async () => ({
      ok: false,
      status: 403,
      json: async () => ({ error: { message: 'Forbidden' } }),
    }));
    assert.equal((await testGeminiApiKey('AIzaSyValidTestKey_1234567890')).success, false);

    // chatWithLeoGemini valid + HTTP error fallback
    setGlobal('fetch', async () => ({
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{ text: '{"replyEn":"Let us build a red rocket!","replyDe":"Bau!","replyTr":"Hadi!","hints":["Red rocket!","Go!"]}' }],
          },
        }],
      }),
    }));
    const chatRes = await chatWithLeoGemini({
      apiKey: 'AIzaSyValidTestKey_1234567890',
      message: 'Let us build!',
      missionId: 'rocket',
      stepIndex: 0,
    });
    assert.equal(chatRes.source, 'gemini');
    assert.equal(chatRes.replyEn, 'Let us build a red rocket!');

    setGlobal('fetch', async () => ({ ok: false, status: 500 }));
    const errChat = await chatWithLeoGemini({
      apiKey: 'AIzaSyValidTestKey_1234567890',
      message: 'pizza',
      missionId: 'free',
    });
    assert.equal(errChat.source, 'offline');

    assert.equal(await evaluateChildSpeechWithGemini({ apiKey: '', targetPhrase: 'hi', transcript: 'hi' }), null);
  } finally {
    restore();
  }
});

test('speech + azureSpeechManifest: covers TTS cleaning, WAV construction, sequential assets, Gemini TTS cache/429, and playback fallbacks', async () => {
  const restore = saveGlobals([
    'window',
    'localStorage',
    'fetch',
    'Audio',
    'URL',
    'SpeechSynthesisUtterance',
    'navigator',
  ]);

  try {
    const mem = makeMemoryStorage();
    setGlobal('localStorage', mem);
    setGlobal('navigator', { onLine: true });
    setGlobal('URL', {
      createObjectURL: () => 'blob:wav-url',
      revokeObjectURL: () => {},
    });
    setGlobal('SpeechSynthesisUtterance', class {
      constructor(text) {
        this.text = text;
        this.onend = null;
      }
    });

    const speechWindow = {
      localStorage: mem,
      location: { protocol: 'https:' },
      speechSynthesis: {
        cancel() {},
        resume() {},
        getVoices() {
          return [
            { name: 'Albert', lang: 'en-US', localService: true },
            { name: 'Samantha', lang: 'en-US', localService: false },
            { name: 'Anna', lang: 'de-DE', localService: true },
            { name: 'Yelda', lang: 'tr-TR', localService: true },
          ];
        },
        speak(utt) {
          setTimeout(() => utt?.onend?.(), 5);
        },
      },
      addEventListener() {},
      removeEventListener() {},
    };
    setGlobal('window', speechWindow);

    // 1. azureSpeechManifest primary + fallback
    resetManifestCacheForTesting();
    const mockManifest = {
      'en:Red': '/audio/gemini/en/red',
      'en:Cat': '/audio/gemini/en/cat',
      'en:Dog': '/audio/gemini/en/dog',
      'en:Find': '/audio/gemini/en/find',
      'en:That is': '/audio/gemini/en/that_is',
      'en:I am asking for': '/audio/gemini/en/i_am_asking_for',
      'tr:Elma': '/audio/gemini/tr/elma',
    };
    setGlobal('fetch', async (url) => {
      if (String(url).includes('audio/manifest.json')) return { ok: false, status: 404 };
      if (String(url).includes('audio/azure/manifest.json')) return { ok: true, json: async () => mockManifest };
      return { ok: false, status: 404 };
    });

    assert.equal(await getAzureSpeechAsset('Red', 'en'), '/audio/gemini/en/red');
    assert.equal(await getAzureSpeechAsset('RED!', 'en'), '/audio/gemini/en/red');

    // 2. cleanTextForTTS & audioDataToWavBlob
    assert.equal(cleanTextForTTS(''), '');
    assert.equal(cleanTextForTTS('soccer_ball'), 'soccer ball');
    assert.equal(cleanTextForTTS('a'.repeat(2000)).length, 1800);

    const rawWav = audioDataToWavBlob(makeSamplePcmBase64(400), 'audio/pcm;rate=16000');
    assert.equal(rawWav.type, 'audio/wav');
    assert.equal(rawWav.size, 44 + 800);

    const strippedWav = audioDataToWavBlob(makeSamplePcmBase64(200, 22050), 'audio/wav');
    assert.equal(strippedWav.size, 44 + 400);

    // 3. resolveSequentialAssets
    assert.deepEqual(await resolveSequentialAssets('Red', 'en-US'), ['/audio/gemini/en/red']);
    assert.deepEqual(await resolveSequentialAssets('Red. Cat.', 'en-US'), ['/audio/gemini/en/red', '/audio/gemini/en/cat']);
    assert.deepEqual(
      await resolveSequentialAssets('That is Cat. I am asking for Dog.', 'en-US'),
      ['/audio/gemini/en/that_is', '/audio/gemini/en/cat', '/audio/gemini/en/i_am_asking_for', '/audio/gemini/en/dog']
    );
    assert.deepEqual(
      await resolveSequentialAssets('Find Red', 'en-US'),
      ['/audio/gemini/en/find', '/audio/gemini/en/red']
    );
    assert.equal(await resolveSequentialAssets('Totally unmapped sentence xyz', 'en-US'), null);

    // 4. synthesizeGeminiSpeech & precacheSpeechLibrary
    await assert.rejects(() => synthesizeGeminiSpeech('   '), /EMPTY_TEXT/);
    clearGeminiApiKey();
    await assert.rejects(() => synthesizeGeminiSpeech('Hello world'), /MISSING_API_KEY/);

    saveGeminiApiKey('AIzaSyValidTtsKey_1234567890');
    let ttsFetchCount = 0;
    const pcmPayload = makeSamplePcmBase64(120);
    setGlobal('fetch', async (url) => {
      if (String(url).includes('audio/')) return { ok: true, json: async () => mockManifest };
      ttsFetchCount += 1;
      if (String(url).includes('tts')) {
        return {
          ok: true,
          json: async () => ({
            candidates: [{ content: { parts: [{ inlineData: { data: pcmPayload, mimeType: 'audio/pcm;rate=24000' } }] } }],
          }),
        };
      }
      return { ok: false, status: 404 };
    });

    const b1 = await synthesizeGeminiSpeech('Unique Tts Phrase One', 'Puck');
    const b2 = await synthesizeGeminiSpeech('Unique Tts Phrase One', 'Puck');
    assert.equal(b1, b2);
    assert.equal(ttsFetchCount, 1);

    // 429 quota handling in precacheSpeechLibrary
    setGlobal('fetch', async () => ({
      ok: false,
      status: 429,
      text: async () => 'per day limit',
    }));
    const progressEvents = [];
    const batchRes = await precacheSpeechLibrary(['Quota Probe Uncached One', 'Quota Probe Uncached Two'], {
      onProgress: (p) => progressEvents.push(p),
    });
    assert.equal(batchRes.stoppedReason, 'GEMINI_TTS_QUOTA_EXHAUSTED');
    assert.equal(progressEvents.length, 1);

    // 5. Audio playback + hover speech + speaking wrappers
    class MockAudio {
      constructor(src = '') {
        this.src = src;
        this.paused = true;
        this.volume = 1;
        this.playbackRate = 1;
        this.onended = null;
        this.onerror = null;
        this.onplaying = null;
      }
      setAttribute() {}
      pause() { this.paused = true; }
      load() {}
      play() {
        this.paused = false;
        setTimeout(() => {
          this.onplaying?.();
          this.onended?.();
        }, 5);
        return Promise.resolve();
      }
    }
    setGlobal('Audio', MockAudio);

    unlockAudio();
    prefetchSpeech(['red']);
    triggerHoverSpeech('', { isMuted: false });
    triggerHoverSpeech('Red', { isMuted: true });
    triggerHoverSpeech('Red', { pointerType: 'touch' });
    triggerHoverSpeech('Red', { pointerType: 'mouse', delayMs: 20 });
    cancelHoverSpeech();

    await new Promise((resolve) => speakEnglish('Red', resolve));
    await new Promise((resolve) => speakTurkish('Elma', resolve));
    await new Promise((resolve) => speakGerman('Rot', resolve));
    await new Promise((resolve) => speakDialoguePhrase('school_bus', 'School bus', 'en', resolve));
    await new Promise((resolve) => speakPhoneme('A', resolve));
    await new Promise((resolve) => speakEncouragement('de', resolve));

    // Trigger local fallback chain: missing asset -> Google TTS error -> Web Speech fallback
    class FailingAudio extends MockAudio {
      play() {
        setTimeout(() => this.onerror?.(), 2);
        return Promise.resolve();
      }
    }
    setGlobal('Audio', FailingAudio);
    setGlobal('fetch', async () => ({ ok: false, status: 500 }));
    await new Promise((resolve) => speakEnglish('Unmapped Offline Phrase', resolve));

    // Sequential speech playback + empty array + interruption
    await new Promise((resolve) => speakEnglishSequence([], resolve));
    setGlobal('Audio', MockAudio);
    await new Promise((resolve) => speakEnglishSequence(['Red', 'Cat'], resolve));
    speakEnglishSequence(['Red', 'Cat'], () => {});
    stopSpeech();

    // Autoplay NotAllowedError on .m4a should end cleanly WITHOUT .wav fallback or speechSynthesis stutter
    let webSpeechCalls = 0;
    speechWindow.speechSynthesis.speak = () => {
      webSpeechCalls += 1;
    };
    const requestedSrcs = [];
    class AutoplayBlockedAudio extends MockAudio {
      play() {
        requestedSrcs.push(this.src);
        const err = new Error('play() blocked by autoplay policy');
        err.name = 'NotAllowedError';
        return Promise.reject(err);
      }
    }
    setGlobal('Audio', AutoplayBlockedAudio);
    await new Promise((resolve) => speakEnglish('Red', resolve));
    assert.equal(webSpeechCalls, 0);
    assert.equal(requestedSrcs.some((s) => s.endsWith('.wav')), false);
  } finally {
    stopSpeech();
    clearGeminiApiKey();
    resetManifestCacheForTesting();
    restore();
  }
});

test('funnyData: covers silly sentence builder, cyclic indices, costumes, jokes, critters, and lines', () => {
  assert.ok(LEO_COSTUMES.length >= 6);
  assert.ok(LEO_TICKLE_LINES.length >= 6);
  assert.ok(KID_JOKES.length >= 10);
  assert.ok(ISLAND_CRITTERS.length >= 4);
  assert.ok(SILLY_VOICE_CHALLENGES.length >= 5);
  assert.ok(FUNNY_COMBO_CHEERS.length >= 5);
  assert.ok(FUNNY_OOPS_LINES.length >= 4);

  const built = buildSillySentence({ s: 1, v: 2, o: 3, p: 4 });
  assert.equal(built.parts.length, 4);
  assert.equal(built.fullText, built.parts.join(' '));
  assert.ok(built.emojis.length > 0);

  const zeroRng = getRandomSillyIndices(() => 0);
  assert.deepEqual(zeroRng, { s: 0, v: 0, o: 0, p: 0 });

  assert.equal(getNextCyclicIndex(0, 5), 1);
  assert.equal(getNextCyclicIndex(4, 5), 0);
  assert.equal(getNextCyclicIndex(0, 0), 0);

  assert.equal(getFunnyLineByIndex(['a', 'b'], 3), 'b');
  assert.equal(getFunnyLineByIndex([], 1), '');
  assert.equal(SILLY_SENTENCE_PARTS.subjects.length, 6);
});
