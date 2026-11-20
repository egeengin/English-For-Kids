import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  CURRICULUM_LEVELS,
  LEGO_BUILD_MODELS,
  getMinifigureAccessories,
  LEO_ACCESSORIES,
} from '../src/data/curriculum.js';
import {
  DISCOVERY_STAGES,
  DAILY_EXPEDITION_DAYS,
  getWorksheetQuestions,
} from '../src/data/dailyMissionsData.js';
import { EXTRA_LEVELS } from '../src/data/extraLevelsData.js';
import { SCENES_DATA } from '../src/data/scenesData.js';
import { INITIAL_STATE, loadSavedState, saveState } from '../src/utils/storage.js';
import * as soundEffects from '../src/utils/soundEffects.js';
import * as gemini from '../src/utils/gemini.js';
import * as speech from '../src/utils/speech.js';
import * as speechRec from '../src/utils/speechRecognition.js';
import * as reviewTracker from '../src/utils/reviewTracker.js';
import * as dailyMemory from '../src/utils/dailyMemory.js';
import { saveGeminiApiKey } from '../src/utils/gemini.js';

function setupBrowserMocks() {
  const store = {};
  const createAudioNode = () => ({
    type: 'sine',
    frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}, value: 440 },
    gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}, value: 0.5 },
    connect() { return this; },
    start() {},
    stop() {},
  });

  class MockAudioContext {
    constructor() {
      this.currentTime = 0;
      this.sampleRate = 44100;
      this.state = 'running';
      this.destination = {};
    }
    resume() { return Promise.resolve(); }
    createOscillator() { return createAudioNode(); }
    createGain() { return createAudioNode(); }
    createBiquadFilter() {
      return { ...createAudioNode(), Q: { value: 1, setValueAtTime() {} } };
    }
    createBuffer(ch, len) {
      return { getChannelData: () => new Float32Array(len) };
    }
    createBufferSource() {
      return { buffer: null, connect() {}, start() {}, stop() {} };
    }
  }

  class MockSpeechRecognition {
    constructor() {
      this.lang = 'en-US';
      this.interimResults = false;
      this.maxAlternatives = 1;
      this.continuous = false;
    }
    start() {
      if (this.onstart) this.onstart();
      if (this.onresult) {
        this.onresult({
          results: [[{ transcript: 'hello world', confidence: 0.95 }]],
          resultIndex: 0,
        });
      }
      if (this.onend) this.onend();
    }
    stop() { if (this.onend) this.onend(); }
    abort() {}
  }

  const localStorageMock = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
  };
  globalThis.localStorage = localStorageMock;
  globalThis.window = {
    localStorage: localStorageMock,
    AudioContext: MockAudioContext,
    webkitAudioContext: MockAudioContext,
    SpeechRecognition: MockSpeechRecognition,
    speechSynthesis: {
      speaking: false,
      cancel() {},
      getVoices() { return [{ name: 'Samantha', lang: 'en-US' }]; },
      speak(utt) { if (utt && utt.onend) utt.onend(); },
    },
  };
  globalThis.SpeechSynthesisUtterance = class {
    constructor(text) { this.text = text; }
  };
  return store;
}

test('Data modules: curriculum, dailyMissionsData, extraLevelsData, scenesData', () => {
  assert.ok(CURRICULUM_LEVELS.length >= 3);
  for (const lvl of CURRICULUM_LEVELS) {
    assert.ok(lvl.id && lvl.title && Array.isArray(lvl.items) && lvl.items.length > 0);
  }
  assert.ok(LEGO_BUILD_MODELS.length >= 1);
  assert.ok(getMinifigureAccessories('Deniz').length >= 1);
  assert.ok(LEO_ACCESSORIES.length >= 1);

  assert.ok(DISCOVERY_STAGES.length >= 5);
  assert.ok(EXTRA_LEVELS.length >= 5);
  assert.ok(DAILY_EXPEDITION_DAYS.length >= 10);

  const stageWs = getWorksheetQuestions({ mode: 'stage', stageId: DISCOVERY_STAGES[0].id });
  assert.ok(stageWs.questions.length > 0);
  const dayWs = getWorksheetQuestions({ mode: 'day', dayId: DAILY_EXPEDITION_DAYS[0].id });
  assert.ok(dayWs.questions.length > 0);
  const fallbackWs = getWorksheetQuestions({ mode: 'day', dayId: 'nonexistent-day' });
  assert.ok(fallbackWs.questions.length > 0);

  assert.ok(SCENES_DATA.length >= 3);
  for (const sc of SCENES_DATA) {
    assert.ok(sc.id && sc.title && sc.differences.length === 7);
  }
});

test('Storage utils: loadSavedState and saveState handle defaults, valid JSON, and invalid JSON', () => {
  const store = setupBrowserMocks();
  const initial = loadSavedState();
  assert.equal(initial.stars, INITIAL_STATE.stars);

  saveState({ ...initial, stars: 42, lastTab: 'workshop' });
  const reloaded = loadSavedState();
  assert.equal(reloaded.stars, 42);
  assert.notEqual(reloaded.lastTab, 'workshop');

  saveGeminiApiKey('valid-test-key-1234567890');
  saveState({ ...reloaded, geminiApiKey: 'valid-test-key-1234567890' });
  assert.equal(JSON.parse(store[Object.keys(store).find((key) => key.includes('state'))]).geminiApiKey, undefined);

  store[Object.keys(store)[0]] = '{bad-json';
  const recovered = loadSavedState();
  assert.equal(recovered.stars, INITIAL_STATE.stars);
});

test('Sound effects: all sound helpers run cleanly muted and unmuted', () => {
  setupBrowserMocks();
  soundEffects.initAudioContext();
  for (const muted of [true, false]) {
    soundEffects.playLegoSnap(muted);
    soundEffects.playSuccessChime(muted);
    soundEffects.playGentleWobble(muted);
    soundEffects.playStarSparkle(muted);
    soundEffects.playFanfare(muted);
    soundEffects.playTap(muted);
    soundEffects.playRadioBeep(muted);
    soundEffects.playSnap(muted);
    soundEffects.playVictoryFanfare(muted);
    soundEffects.playSparkle(muted);
    soundEffects.playSuccess(muted);
    soundEffects.playWobble(muted);
  }
  soundEffects.startKidsSongBeat(false, 0, () => {});
  soundEffects.stopKidsSongBeat();
  soundEffects.startKidsSongBeat(true, 1, null);
  soundEffects.stopKidsSongBeat();
});

test('Gemini utils: offline responses, API key test, speech eval, and chat with mocked fetch', async () => {
  setupBrowserMocks();
  assert.equal(gemini.getEffectiveGeminiApiKey(), '');
  const key = gemini.getEffectiveGeminiApiKey('valid-test-key-123456789');
  assert.ok(typeof key === 'string' && key.length > 5);

  for (const prompt of ['hello', 'my name', 'pizza food', 'dino', 'blue color', 'basketball', 'random xyz']) {
    const reply = gemini.getOfflineLeoResponse(prompt, 'Deniz');
    assert.ok(reply && reply.replyEn);
  }

  const origFetch = globalThis.fetch;
  try {
    const shortTest = await gemini.testGeminiApiKey('short');
    assert.equal(shortTest.success, false);

    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '{"isAccepted":true,"stars":3,"feedbackEn":"Great!"}' }] } }],
      }),
    });
    const okKey = await gemini.testGeminiApiKey('valid-gemini-api-key-123');
    assert.equal(okKey.success, true);

    const evalRes = await gemini.evaluateChildSpeechWithGemini({
      targetPhrase: 'Hello',
      transcript: 'Hello',
      apiKey: 'valid-key-1234567890',
    });
    assert.equal(evalRes.isAccepted, true);

    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '{"replyEn":"Hi Deniz!","replyTr":"Merhaba!","replyDe":"Hallo!"}' }] } }],
      }),
    });
    const chatRes = await gemini.chatWithLeoGemini({ message: 'Hi Leo', apiKey: 'valid-key-1234567890' });
    assert.equal(chatRes.replyEn, 'Hi Deniz!');

    globalThis.fetch = async () => ({ ok: false, status: 500, json: async () => ({ error: { message: 'Server error' } }) });
    const failKey = await gemini.testGeminiApiKey('bad-gemini-api-key-123');
    assert.equal(failKey.success, false);
    const failChat = await gemini.chatWithLeoGemini({ message: 'Hi', apiKey: 'bad-key' });
    assert.ok(failChat.replyEn);
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('Speech & SpeechRecognition utils: TTS formatting, WAV header, hover, and listener', async () => {
  setupBrowserMocks();
  assert.equal(speech.cleanTextForTTS('Hello 🍎 & world!'), 'Hello world!');
  const wav = speech.audioDataToWavBlob(Buffer.from([0, 1, 2, 3]).toString('base64'), 'audio/pcm;rate=24000');
  assert.ok(wav && wav.size > 40);

  speech.unlockAudio();
  speech.stopSpeech();
  speech.prefetchSpeech(['Hello', 'Good morning']);
  speech.triggerHoverSpeech('Apple', { isMuted: false, pointerType: 'mouse' });
  speech.cancelHoverSpeech();
  speech.speakEnglish('Hello Deniz');
  speech.speakTurkish('Merhaba Deniz');
  speech.speakGerman('Hallo Deniz');
  speech.speakEncouragement('en');
  speech.speakDialoguePhrase('hello', 'Hello');
  speech.speakPhoneme('A');

  assert.equal(speechRec.isSpeechRecognitionSupported(), true);
  assert.equal(speechRec.normalizeText('Hello, World!'), 'hello world');
  assert.equal(speechRec.calculateSimilarity('cat', 'cat'), 1);
  assert.ok(speechRec.calculateSimilarity('cat', 'hat') > 0.5);

  let heard = '';
  const listener = speechRec.createSpeechListener({
    onResult: (res) => { heard = res?.transcript || ''; },
  });
  listener.start();
  assert.equal(heard, 'hello world');
  listener.stop();
  listener.abort();
});

test('Voice-to-Answer matching: matchSpokenOption matches clear answers and rejects unrelated/ambiguous text', () => {
  const options = [
    { id: 'a', textEn: 'Two red bricks', isCorrect: false },
    { id: 'b', textEn: 'Three yellow bricks', isCorrect: true },
    { id: 'c', textEn: 'Four green bricks', isCorrect: false },
  ];

  const exact = speechRec.matchSpokenOption('three yellow bricks', options);
  assert.equal(exact?.id, 'b');

  const partial = speechRec.matchSpokenOption('yelov bricks', options);
  assert.equal(partial?.id, 'b');

  const unrelated = speechRec.matchSpokenOption('elephant banana spaceship', options);
  assert.equal(unrelated, null);

  const ambiguous = speechRec.matchSpokenOption('bricks', options);
  assert.equal(ambiguous, null);

  const customGetter = speechRec.matchSpokenOption(
    'apple please',
    [{ label: 'Can I have an apple, please?' }, { label: 'Blue shoe' }],
    (o) => o.label
  );
  assert.equal(customGetter?.label, 'Can I have an apple, please?');
});

test('Leo Missions & Hints: LEO_MISSIONS, offline mission steps, and Gemini fallback hints', async () => {
  setupBrowserMocks();
  assert.ok(Array.isArray(gemini.LEO_MISSIONS) && gemini.LEO_MISSIONS.length >= 4);
  for (const m of gemini.LEO_MISSIONS) {
    assert.ok(m.id && m.emoji && m.labelTr && m.stepsCount === 3);
    assert.ok(typeof m.starterEn === 'function' && m.starterEn('Deniz').includes('Deniz'));
    assert.ok(Array.isArray(m.starterHints) && m.starterHints.length === 2);
  }

  const pizzaStep0 = gemini.getOfflineLeoResponse('Hello Chef!', 'Deniz', 'pizza', 0);
  assert.ok(pizzaStep0.replyEn.includes('pizza'));
  assert.ok(Array.isArray(pizzaStep0.hints) && pizzaStep0.hints.length === 2);

  const freeReply = gemini.getOfflineLeoResponse('I like blue', 'Deniz', 'free', 0);
  assert.ok(freeReply.replyEn && Array.isArray(freeReply.hints) && freeReply.hints.length === 2);

  const origFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: '{"replyEn":"Cheese pizza coming up!","replyDe":"Käsepizza kommt!","replyTr":"Peynirli pizza geliyor!","hints":["Thank you! 🍕","Water, please! 💧"]}',
            }],
          },
        }],
      }),
    });
    const aiMissionRes = await gemini.chatWithLeoGemini({
      apiKey: 'valid-key-1234567890',
      message: 'Cheese pizza please',
      childName: 'Deniz',
      missionId: 'pizza',
      stepIndex: 1,
    });
    assert.equal(aiMissionRes.replyEn, 'Cheese pizza coming up!');
    assert.deepEqual(aiMissionRes.hints, ['Thank you! 🍕', 'Water, please! 💧']);
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('Review Tracker: phrase & word tracking with spaced-repetition priority sorting', () => {
  setupBrowserMocks();
  reviewTracker.recordMissedWord('Three yellow bricks', '🟡', '3 sarı parça', { phraseEn: 'Three yellow bricks' });
  reviewTracker.recordMissedWord('A burger and fries, please!', '🍔', 'Bir burger lütfen');
  reviewTracker.recordMissedWord('A burger and fries, please!', '🍔', 'Bir burger lütfen');
  reviewTracker.recordMasteredWord('It is sunny!', '☀️', 'Hava güneşli!');

  const review = reviewTracker.getReviewWords(5);
  assert.equal(review.length, 5);
  assert.equal(review[0].word, 'A burger and fries, please!');
  assert.equal(review[0].misses, 2);
  assert.equal(review[1].word, 'Three yellow bricks');
  assert.equal(review[1].phraseEn, 'Three yellow bricks');

  const summary = reviewTracker.getWeeklySummary();
  assert.equal(summary.practicedCount, 3);
  assert.ok(summary.masteredWords.some((w) => w.word === 'It is sunny!'));
  assert.ok(summary.trickyWords.some((w) => w.word === 'A burger and fries, please!'));
});

test('MiniBooksReader: Holiday at Nirvana and all books have audio assets and do not auto-advance', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');

  const readerCode = fs.readFileSync('src/components/MiniBooksReader.jsx', 'utf8');
  assert.ok(readerCode.includes('nirvana_hotel_book'), 'Holiday at Nirvana book must exist');
  assert.ok(readerCode.includes('Holiday at Nirvana Cosmopolitan'), 'Holiday at Nirvana title must exist');

  // Verify finishReading does NOT auto-advance page
  const finishReadingMatch = readerCode.match(/const finishReading = \(\) => {([\s\S]*?)};/);
  assert.ok(finishReadingMatch, 'finishReading must be defined');
  assert.ok(
    !finishReadingMatch[1].includes('setPageIdx'),
    'finishReading must not automatically turn pages; users must continue via the button'
  );

  // Verify navigation button handler exists
  assert.ok(readerCode.includes('handleNextPage'), 'handleNextPage must exist for button-driven progression');

  // Parse getMiniBooks
  const startIdx = readerCode.indexOf('function getMiniBooks');
  const endIdx = readerCode.indexOf('export default function MiniBooksReader');
  const fnCode = readerCode.slice(startIdx, endIdx);
  const getMiniBooksFn = new Function(fnCode + "; return getMiniBooks('Deniz');")();
  assert.equal(getMiniBooksFn.length, 13, 'There should be 13 mini-books');

  const nirvanaBook = getMiniBooksFn.find((b) => b.id === 'nirvana_hotel_book');
  assert.ok(nirvanaBook, 'Nirvana book must exist in getMiniBooks');
  assert.equal(nirvanaBook.pages.length, 4, 'Nirvana book must have 4 pages');

  const manifest = JSON.parse(fs.readFileSync('public/audio/manifest.json', 'utf8'));

  // Verify Nirvana pages exist in manifest and on disk
  for (const page of nirvanaBook.pages) {
    const key = `en:${page.text}`;
    const asset = manifest[key] || manifest[key.toLowerCase()];
    assert.ok(asset, `Manifest must contain Nirvana page: "${page.text}"`);
    const filePath = path.join('public', `${asset}.m4a`);
    assert.ok(fs.existsSync(filePath), `Audio file must exist on disk: ${filePath}`);
    const stat = fs.statSync(filePath);
    assert.ok(stat.size > 1000, `Audio file must be non-empty (>1KB): ${filePath}`);
  }

  // Verify option hover sound is configured for selections
  assert.ok(
    readerCode.includes('triggerHoverSpeech') && readerCode.includes('onPointerEnter'),
    'MiniBooksReader must sound the answer selections on stay/hover'
  );

  const quizGameCode = fs.readFileSync('src/components/QuestionQuizGame.jsx', 'utf8');
  assert.ok(
    quizGameCode.includes('triggerHoverSpeech') && quizGameCode.includes('onPointerEnter'),
    'QuestionQuizGame must sound the answer selections on stay/hover'
  );

  // Verify wrong answer uses playDiDit and directs to other options without long speech
  assert.ok(readerCode.includes('playDiDit'), 'MiniBooksReader must use playDiDit on wrong answer');
  assert.ok(!readerCode.includes('I am asking:'), 'MiniBooksReader must not speak long "I am asking" on wrong answer');
  assert.ok(readerCode.includes('wrongOptions.has'), 'MiniBooksReader must track wrongOptions to direct to others');

  assert.ok(quizGameCode.includes('playDiDit'), 'QuestionQuizGame must use playDiDit on wrong answer');
  assert.ok(!quizGameCode.includes('I am asking:'), 'QuestionQuizGame must not speak long "I am asking" on wrong answer');
  assert.ok(quizGameCode.includes('wrongOptions.has'), 'QuestionQuizGame must track wrongOptions to direct to others');

  // Verify daily study examples are open by default
  const dailySingCode = fs.readFileSync('src/components/DailySingLearn.jsx', 'utf8');
  assert.ok(
    dailySingCode.includes('const [showExamples, setShowExamples] = useState(true);'),
    'DailySingLearn must have showExamples initialized to true so examples are open by default'
  );
});

test('Daily Activity Memory & Recall on daily entry', () => {
  setupBrowserMocks();

  const todayKey = dailyMemory.getTodayKey();
  assert.match(todayKey, /^\d{4}-\d{2}-\d{2}$/, 'Today key must be ISO YYYY-MM-DD');

  // Should show daily recall on first visit of the day
  assert.equal(dailyMemory.shouldShowDailyRecall(), true, 'Should show recall before marked seen');

  // Log activity
  dailyMemory.logDailyActivity({
    stars: 8,
    bricks: 4,
    bookTitle: 'Holiday at Nirvana Cosmopolitan',
    word: { word: 'Swimming Pool', emoji: '🏊‍♂️', tr: 'Yüzme Havuzu' },
    missionTitle: 'Day 1 Şarkı',
    questionAnswered: true,
  });

  const logs = dailyMemory.readDailyLogs();
  assert.ok(logs[todayKey], 'Today log must exist');
  assert.equal(logs[todayKey].stars, 8);
  assert.equal(logs[todayKey].bricks, 4);
  assert.equal(logs[todayKey].questionsCount, 1);
  assert.ok(logs[todayKey].booksRead.includes('Holiday at Nirvana Cosmopolitan'));
  assert.equal(logs[todayKey].words[0].word, 'Swimming Pool');

  // Mark as seen for today
  dailyMemory.markDailyRecallSeen();
  assert.equal(dailyMemory.shouldShowDailyRecall(), false, 'Should not show recall after marked seen');

  // Summary generation
  const summary = dailyMemory.getDailyMemorySummary({
    childName: 'Deniz',
    streak: 3,
  });
  assert.ok(summary.spokenGreetingEn.includes('Deniz'), 'Spoken greeting must include child name');
  assert.ok(summary.spokenGreetingEn.includes('3-day streak') || summary.spokenGreetingEn.includes('streak'), 'Spoken greeting must mention streak');

  // Verify previous day recap
  const pastLogs = dailyMemory.readDailyLogs();
  pastLogs['2026-11-19'] = {
    date: '2026-11-19',
    stars: 12,
    bricks: 6,
    questionsCount: 5,
    words: [{ word: 'Hotel', emoji: '🏨', tr: 'Otel' }],
    booksRead: ['Holiday at Nirvana Cosmopolitan'],
    missions: ['Day 1 Quiz'],
    games: ['Mini Books'],
    lastTimestamp: Date.now() - 86400000,
  };
  dailyMemory.writeDailyLogs(pastLogs);

  const pastSummary = dailyMemory.getDailyMemorySummary({
    childName: 'Deniz',
    streak: 4,
  });
  assert.equal(pastSummary.hasPreviousActivity, true, 'Must identify previous day activity');
  assert.equal(pastSummary.recapStats.stars, 12, 'Must recall previous stars');
  assert.ok(pastSummary.summarySentenceTr.includes('Holiday at Nirvana Cosmopolitan'), 'Turkish summary must mention past book');
  assert.ok(pastSummary.spokenGreetingEn.includes('Holiday at Nirvana Cosmopolitan'), 'Spoken greeting must mention past book');

  // Verify DailyRecallModal component file exists and includes key sections
  const modalCode = fs.readFileSync('src/components/DailyRecallModal.jsx', 'utf8');
  assert.ok(modalCode.includes('Leo\'nun Günlük Notu') || modalCode.includes('Leo'), 'DailyRecallModal must show Leo note');
  assert.ok(modalCode.includes('spokenGreetingEn'), 'DailyRecallModal must play spoken greeting');
  assert.ok(modalCode.includes('recapStats'), 'DailyRecallModal must handle recap stats');

  // Verify App.jsx wires DailyRecallModal and Navbar memory button
  const appCode = fs.readFileSync('src/App.jsx', 'utf8');
  assert.ok(appCode.includes('DailyRecallModal'), 'App.jsx must import and use DailyRecallModal');
  assert.ok(appCode.includes('isDailyRecallOpen'), 'App.jsx must manage isDailyRecallOpen state');
  assert.ok(appCode.includes('onOpenDailyRecall'), 'App.jsx must pass onOpenDailyRecall to Navbar');
});
