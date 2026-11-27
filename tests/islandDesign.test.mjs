import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { DAILY_EXPEDITION_DAYS } from '../src/data/dailyMissionsData.js';
import { VOCAB_BANK_500, VOCAB_CATEGORIES } from '../src/data/vocabularyBank500.js';
import { LEO_MISSIONS, getOfflineLeoResponse } from '../src/utils/gemini.js';
import { getStoryWorlds } from '../src/data/storyData.js';
import { cleanTextForTTS } from '../src/utils/speech.js';
import {
  LEO_TICKLE_LINES,
  KID_JOKES,
  ISLAND_CRITTERS,
  SILLY_SENTENCE_PARTS,
  SILLY_VOICE_CHALLENGES,
} from '../src/data/funnyData.js';
import {
  ISLAND_BIOMES,
  ISLAND_STOPS_BY_DAY_ID,
  getIslandStopMeta,
  getStepCompletionForDay,
  findCurrentActiveDayId,
  getSpokenPhrasesForDay,
  markQuestStepInProgress,
  markSpokenPhraseInProgress,
  claimQuestChestInProgress,
  getIslandOverallSummary,
} from '../src/data/islandMapData.js';
import { getWorksheetQuestions } from '../src/data/dailyMissionsData.js';
import { INITIAL_STATE, loadSavedState, saveState } from '../src/utils/storage.js';

test('Island Map: all 16 expedition days have English metadata and belong to 4 biomes', () => {
  assert.equal(ISLAND_BIOMES.length, 4);
  assert.equal(DAILY_EXPEDITION_DAYS.length, 16);

  const biomeDayIds = ISLAND_BIOMES.flatMap((b) => b.dayIds);
  assert.equal(biomeDayIds.length, 16);

  const seenStopNumbers = new Set();
  for (const day of DAILY_EXPEDITION_DAYS) {
    assert.ok(biomeDayIds.includes(day.id), `Missing ${day.id} from ISLAND_BIOMES`);
    const meta = ISLAND_STOPS_BY_DAY_ID[day.id];
    assert.ok(meta, `Missing ISLAND_STOPS_BY_DAY_ID entry for ${day.id}`);
    assert.ok(meta.titleEn && meta.taglineEn && meta.emoji);
    assert.equal(seenStopNumbers.has(meta.stopNumber), false, `Duplicate stopNumber ${meta.stopNumber}`);
    seenStopNumbers.add(meta.stopNumber);

    const resolved = getIslandStopMeta(day.id);
    assert.equal(resolved.titleEn, meta.titleEn);
  }
});

test('Island Map: getStepCompletionForDay transitions cleanly across learn -> song -> quiz -> speak', () => {
  const qs = [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }, { id: 'q4' }];

  const s0 = getStepCompletionForDay('day-1', {}, {}, qs);
  assert.equal(s0.completedSteps, 0);
  assert.equal(s0.starsEarned, 0);
  assert.equal(s0.nextStep, 'learn');

  const s1 = getStepCompletionForDay('day-1', { 'day-1': { learn: true } }, {}, qs);
  assert.equal(s1.completedSteps, 1);
  assert.equal(s1.starsEarned, 1);
  assert.equal(s1.nextStep, 'song');

  const s2 = getStepCompletionForDay('day-1', { 'day-1': { learn: true, song: true } }, {}, qs);
  assert.equal(s2.completedSteps, 2);
  assert.equal(s2.starsEarned, 1);
  assert.equal(s2.nextStep, 'quiz');

  const s3 = getStepCompletionForDay(
    'day-1',
    { 'day-1': { learn: true, song: true } },
    { q1: 'a', q2: 'b' },
    qs
  );
  assert.equal(s3.playDone, true);
  assert.equal(s3.completedSteps, 3);
  assert.equal(s3.starsEarned, 2);
  assert.equal(s3.nextStep, 'speak');

  const s4 = getStepCompletionForDay(
    'day-1',
    { 'day-1': { learn: true, song: true, quiz: true, speak: true } },
    {},
    qs
  );
  assert.equal(s4.completedSteps, 4);
  assert.equal(s4.starsEarned, 3);
});

test('Island Map: findCurrentActiveDayId returns first incomplete stop', () => {
  const questProgress = {
    'day-1': { learn: true, song: true, quiz: true, speak: true },
    'level-2': { learn: true },
  };
  const nextId = findCurrentActiveDayId(DAILY_EXPEDITION_DAYS, questProgress, {}, () => []);
  assert.equal(nextId, 'level-2');

  const allCompleteProgress = Object.fromEntries(
    DAILY_EXPEDITION_DAYS.map((d) => [d.id, { learn: true, song: true, quiz: true, speak: true }])
  );
  assert.equal(
    findCurrentActiveDayId(DAILY_EXPEDITION_DAYS, allCompleteProgress, {}, () => []),
    'day-1'
  );
  assert.equal(getIslandStopMeta('nonexistent-stop').titleEn, 'Island Quest');
});

test('Island Map: pure progression helpers and summary behave immutably and prevent double-claim', () => {
  const s0 = {};
  const s1 = markQuestStepInProgress(s0, 'day-1', 'learn');
  assert.equal(s1['day-1'].learn, true);
  assert.equal(s0['day-1'], undefined);
  assert.equal(markQuestStepInProgress(s1, 'day-1', 'learn'), s1);
  assert.equal(markQuestStepInProgress(s1, '', 'learn'), s1);

  const s2 = markSpokenPhraseInProgress(s1, 'day-1', '  Hello Leo!  ');
  assert.deepEqual(getSpokenPhrasesForDay(s2, 'day-1'), { 'Hello Leo!': true });
  assert.equal(markSpokenPhraseInProgress(s2, 'day-1', 'Hello Leo!'), s2);
  assert.equal(markSpokenPhraseInProgress(s2, 'day-1', '   '), s2);

  const claim1 = claimQuestChestInProgress(s2, 'day-1');
  assert.equal(claim1.newlyClaimed, true);
  assert.equal(claim1.questProgress['day-1'].chestClaimed, true);
  const claim2 = claimQuestChestInProgress(claim1.questProgress, 'day-1');
  assert.equal(claim2.newlyClaimed, false);

  const badClaim = claimQuestChestInProgress(s2, '');
  assert.equal(badClaim.newlyClaimed, false);

  const summary = getIslandOverallSummary(
    DAILY_EXPEDITION_DAYS,
    { 'day-1': { learn: true, song: true, quiz: true, speak: true } },
    {},
    (dayId) => getWorksheetQuestions({ mode: 'day', dayId })?.questions || []
  );
  assert.equal(summary.totalStops, 16);
  assert.equal(summary.maxStars, 48);
  assert.equal(summary.completedStops, 1);
  assert.equal(summary.totalStars, 3);
  assert.equal(getWorksheetQuestions({ mode: 'stage', stageId: 'nonexistent' }).questions.length, 10);
});

test('Storage: defaults lastTab to island and persists questProgress', () => {
  const store = {};
  globalThis.localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => {
      store[k] = String(v);
    },
  };
  globalThis.window = { localStorage: globalThis.localStorage };

  assert.equal(INITIAL_STATE.lastTab, 'island');
  const fresh = loadSavedState();
  assert.equal(fresh.lastTab, 'island');

  saveState({
    ...fresh,
    questProgress: { 'day-1': { learn: true, song: true } },
  });
  const reloaded = loadSavedState();
  assert.equal(reloaded.questProgress['day-1'].learn, true);
  assert.equal(reloaded.questProgress['day-1'].song, true);
});

test('Full English immersion: categories, Leo missions, and core kid UI avoid Turkish labels', () => {
  for (const cat of VOCAB_CATEGORIES) {
    assert.ok(cat.labelEn && cat.labelEn.trim().length > 0, `Missing labelEn on category ${cat.id}`);
  }
  for (const mission of LEO_MISSIONS) {
    assert.ok(mission.labelEn && mission.labelEn.trim().length > 0, `Missing labelEn on mission ${mission.id}`);
  }

  const kidFiles = [
    'src/components/AdventureIsland.jsx',
    'src/components/ArcadeHub.jsx',
    'src/components/Navbar.jsx',
    'src/components/AudioMemoryGame.jsx',
    'src/components/SoundDetectiveGame.jsx',
    'src/components/SmartReviewGame.jsx',
    'src/components/ListenColorGame.jsx',
    'src/components/PutItThereGame.jsx',
    'src/components/RhymingPairsGame.jsx',
    'src/components/QuestionQuizGame.jsx',
    'src/components/MiniBooksReader.jsx',
    'src/components/PhonicsBuilder.jsx',
    'src/components/StickerCollection.jsx',
    'src/components/SceneExplorer.jsx',
    'src/components/BalloonPopGame.jsx',
    'src/components/QuickSpeakGame.jsx',
    'src/components/LevelDiscoveryGame.jsx',
    'src/components/DailyRecallModal.jsx',
    'src/components/WalkieTalkieModal.jsx',
    'src/components/ErrorBoundary.jsx',
    'src/components/SillySentenceGame.jsx',
    'src/data/funnyData.js',
    'src/utils/useVoiceQuizAnswer.js',
  ];

  const leakedTurkishUi = /\b(Dinle|Dinliyorum|Tekrar|Doğru|Yanlış|Sonraki|Önceki|Harika|Süper|Kapat|Kelime|Fark|Evrimleştir|Kaydımı)\b/;
  for (const file of kidFiles) {
    const content = fs.readFileSync(file, 'utf8');
    assert.equal(leakedTurkishUi.test(content), false, `Found leaked Turkish UI label in ${file}`);
  }
});

test('Code quality & accessibility integrity: no invalid nested buttons, dead animation classes, or missing audio cleanup', () => {
  const componentFiles = fs.readdirSync('src/components').filter((f) => f.endsWith('.jsx'));
  for (const file of componentFiles) {
    const content = fs.readFileSync(`src/components/${file}`, 'utf8');
    assert.equal(content.includes('animate-fade-in'), false, `Invalid class animate-fade-in in ${file}`);
    assert.equal(content.includes('animate-scale-up'), false, `Invalid class animate-scale-up in ${file}`);
  }

  for (const quizFile of ['src/components/MiniBooksReader.jsx', 'src/components/QuestionQuizGame.jsx', 'src/components/DailyMissionHub.jsx']) {
    const content = fs.readFileSync(quizFile, 'utf8');
    assert.equal(content.includes('<span\n                          role="button"'), false, `Nested span role=button in ${quizFile}`);
    assert.equal(content.includes('role="button"\n                    tabIndex={-1}'), false, `Nested role=button in ${quizFile}`);
  }

  const appContent = fs.readFileSync('src/App.jsx', 'utf8');
  assert.ok(appContent.includes('stopSpeech()'), 'App.jsx must stop speech on navigation/modal close');

  for (const gameFile of [
    'src/components/AudioMemoryGame.jsx',
    'src/components/SoundDetectiveGame.jsx',
    'src/components/SmartReviewGame.jsx',
    'src/components/ListenColorGame.jsx',
    'src/components/PutItThereGame.jsx',
    'src/components/RhymingPairsGame.jsx',
    'src/components/QuestionQuizGame.jsx',
    'src/components/SceneExplorer.jsx',
    'src/components/SillySentenceGame.jsx',
  ]) {
    const content = fs.readFileSync(gameFile, 'utf8');
    assert.ok(content.includes('stopSpeech()'), `${gameFile} must call stopSpeech() on unmount`);
  }
});

test('Audio integrity: zero broken manifest entries and 100% pre-generated coverage across Island, Missions, and Arcade', () => {
  const manifest = JSON.parse(fs.readFileSync('public/audio/manifest.json', 'utf8'));
  const lowerMap = new Map();
  const noPunctMap = new Map();
  const diskExistsCache = new Map();

  for (const [k, asset] of Object.entries(manifest)) {
    const m4aPath = path.join('public', `${asset}.m4a`);
    const exists = diskExistsCache.has(m4aPath)
      ? diskExistsCache.get(m4aPath)
      : fs.existsSync(m4aPath);
    diskExistsCache.set(m4aPath, exists);
    assert.ok(exists, `Broken audio manifest entry: ${k} -> ${m4aPath}`);

    const lk = k.replace(/[’‘]/g, "'").replace(/[“”]/g, '"').toLowerCase();
    lowerMap.set(lk, asset);
    const noPunct = lk.replace(/[.,!?:;]+$/g, '');
    if (!noPunctMap.has(noPunct)) noPunctMap.set(noPunct, asset);
  }

  const assertHasAudio = (phrase, context) => {
    const clean = cleanTextForTTS(phrase);
    if (!clean) return;
    const lk = `en:${clean}`.replace(/[’‘]/g, "'").replace(/[“”]/g, '"').toLowerCase();
    const asset =
      manifest[`en:${clean}`] ||
      lowerMap.get(lk) ||
      noPunctMap.get(lk.replace(/[.,!?:;]+$/g, ''));
    assert.ok(asset, `Missing pre-generated audio for [${context}]: "${clean}"`);
  };

  for (const stop of Object.values(ISLAND_STOPS_BY_DAY_ID)) {
    assertHasAudio(stop.titleEn, 'Island Stop Title');
    assertHasAudio(`Hi Deniz! Ready for Stop ${stop.stopNumber}: ${stop.titleEn}?`, 'Island Greeting');
  }
  assertHasAudio('Awesome job Deniz! You opened the treasure chest!', 'Island Chest');

  for (const mission of LEO_MISSIONS) {
    assertHasAudio(mission.starterEn('Deniz'), `Leo Mission ${mission.id}`);
    for (const sp of mission.stepPrompts || []) {
      assertHasAudio(sp.en, `Leo Mission ${mission.id} step`);
    }
  }

  for (const entry of VOCAB_BANK_500) {
    assertHasAudio(entry.word, 'Vocab Word');
    assertHasAudio(entry.questionEn, 'Balloon Pop Clue');
  }

  for (const phrase of [
    'Color the car red!',
    'Put the soccer ball UNDER the table!',
    'A burger and fries, please!',
    'Where is the pool?',
    'Mix crazy bricks to build a funny English sentence!',
  ]) {
    assertHasAudio(phrase, 'Mini-game Prompt');
  }

  for (const line of LEO_TICKLE_LINES) assertHasAudio(line, 'Leo Tickle');
  for (const joke of KID_JOKES) {
    assertHasAudio(joke.setup, `Joke ${joke.id} setup`);
    assertHasAudio(joke.punchline, `Joke ${joke.id} punchline`);
  }
  for (const critter of ISLAND_CRITTERS) assertHasAudio(critter.line, `Critter ${critter.id}`);
  for (const group of Object.values(SILLY_SENTENCE_PARTS)) {
    for (const part of group) assertHasAudio(part.text, 'Silly Sentence Part');
  }
  for (const vc of SILLY_VOICE_CHALLENGES) assertHasAudio(vc.prompt, `Voice Challenge ${vc.id}`);

  // StoryAdventure: dialogue, clickable words, choices, characterReply, hotspots, props
  for (const w of getStoryWorlds('Deniz')) {
    for (const ch of w.chapters || []) {
      assertHasAudio(ch.characterLine, `Story ${ch.id} line`);
      for (const rawWord of String(ch.characterLine || '').split(' ')) {
        const cleanWord = rawWord.toLowerCase().replace(/[^a-z]/g, '');
        if (cleanWord) assertHasAudio(cleanWord, `Story ${ch.id} word`);
      }
      for (const c of ch.choices || []) {
        assertHasAudio(c.text, `Story ${ch.id} choice`);
        if (c.characterReply) assertHasAudio(c.characterReply.text, `Story ${ch.id} reply`);
      }
      for (const spot of ch.sceneBackdrop?.hotspots || []) {
        assertHasAudio(spot.speakText || spot.name, `Story ${ch.id} hotspot`);
        assertHasAudio(`Find the ${spot.name}!`, `Story ${ch.id} find hotspot`);
        assertHasAudio(`Great job! ${spot.name}!`, `Story ${ch.id} found hotspot`);
      }
      for (const prop of ch.sceneBackdrop?.props || []) {
        assertHasAudio(prop.name, `Story ${ch.id} prop`);
      }
    }
  }

  // MiniBooksReader: pages, clickable words, questions, options
  const mbCode = fs.readFileSync('src/components/MiniBooksReader.jsx', 'utf8');
  const mbStart = mbCode.indexOf('function getMiniBooks');
  const mbEnd = mbCode.indexOf('export default function MiniBooksReader');
  const books = new Function(`${mbCode.slice(mbStart, mbEnd)}; return getMiniBooks('Deniz');`)();
  for (const b of books) {
    for (const p of b.pages || []) {
      assertHasAudio(p.text, `Book ${b.id} page`);
      for (const rawWord of String(p.text || '').split(' ')) {
        const cleanWord = rawWord.replace(/[^a-zA-Z']/g, '');
        if (cleanWord) assertHasAudio(cleanWord, `Book ${b.id} word`);
      }
    }
    assertHasAudio(b.question, `Book ${b.id} question`);
    for (const opt of b.options || []) {
      const cleanOpt = String(opt.text || '').replace(/[^\p{L}\p{N}\s']/gu, '').replace(/\s+/g, ' ').trim();
      if (cleanOpt) assertHasAudio(cleanOpt, `Book ${b.id} option`);
    }
  }

  // DailySingLearn 64 Sandbox sentences
  for (const subj of ['I', 'My friend', 'The fox', 'Dad']) {
    for (const act of ['can swim', 'have got a rocket', 'played basketball', 'is faster than a car']) {
      for (const extra of ['every day', 'in the park', 'at 8 o’clock', 'tomorrow']) {
        assertHasAudio(`${subj} ${act} ${extra}!`, 'SingLearn Sandbox');
      }
    }
  }

  // Offline Leo replies & hints
  for (const msg of ['', 'hello', 'color', 'name', 'how are you', 'car', 'rocket', 'cat', 'pizza', 'lego']) {
    for (const stepIdx of [0, 1, 2]) {
      const res = getOfflineLeoResponse(msg, 'Deniz', 'free', stepIdx);
      assertHasAudio(res.replyEn, `Offline Leo ${msg || 'empty'}`);
      for (const h of res.hints || []) assertHasAudio(h, `Offline Leo hint`);
    }
  }

  // Letters A-Z & essential carriers
  for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    assertHasAudio(ch, `Letter ${ch}`);
  }
  assertHasAudio('Great!', 'Carrier Great');
});
