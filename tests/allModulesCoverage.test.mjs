import test from 'node:test';
import assert from 'node:assert/strict';

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
  const key = gemini.getEffectiveGeminiApiKey('test-key-123');
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
      apiKey: 'valid-key',
    });
    assert.equal(evalRes.isAccepted, true);

    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '{"replyEn":"Hi Deniz!","replyTr":"Merhaba!","replyDe":"Hallo!"}' }] } }],
      }),
    });
    const chatRes = await gemini.chatWithLeoGemini({ message: 'Hi Leo', apiKey: 'valid-key' });
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
