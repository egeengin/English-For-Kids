import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { getStoryWorlds } from '../src/data/storyData.js';
import { VOCAB_BANK_500, VOCAB_CATEGORIES, getPhonicsWordsFromBank } from '../src/data/vocabularyBank500.js';
import {
  recordMissedWord,
  recordMasteredWord,
  getReviewWords,
  getWeeklySummary,
} from '../src/utils/reviewTracker.js';
import { evaluateKidPronunciation } from '../src/utils/speechRecognition.js';

const ROOT = process.cwd();

test('Story Worlds: all 10 worlds and 41 chapters have valid assets, hotspots, choices, and sentence builders', () => {
  const worlds = getStoryWorlds('Deniz');
  assert.equal(worlds.length, 10, 'Expected 10 story worlds');

  const worldIds = new Set();
  let totalChapters = 0;
  let totalHotspots = 0;

  for (const world of worlds) {
    assert.ok(world.id && world.title && world.emoji, `World missing metadata: ${world.id}`);
    assert.equal(worldIds.has(world.id), false, `Duplicate world id: ${world.id}`);
    worldIds.add(world.id);
    assert.ok(world.chapters.length > 0, `World ${world.id} has no chapters`);

    for (const chap of world.chapters) {
      totalChapters++;
      const imgRel = chap.sceneBackdrop?.sceneImage;
      assert.ok(imgRel, `Chapter ${chap.id} missing sceneImage`);
      const imgPath = path.join(ROOT, 'public', imgRel);
      assert.ok(fs.existsSync(imgPath), `Missing image asset: ${imgPath}`);

      const spots = chap.sceneBackdrop?.hotspots || [];
      assert.ok(spots.length >= 9, `Chapter ${chap.id} has only ${spots.length} hotspots (expected >= 9)`);
      for (const s of spots) {
        totalHotspots++;
        assert.ok(s.id && s.name && s.emoji, `Invalid hotspot in ${chap.id}`);
        assert.ok(s.x >= 0 && s.x <= 100 && s.y >= 0 && s.y <= 100, `Out-of-bounds hotspot in ${chap.id}: ${s.id}`);
        assert.equal((s.speakText || s.name).includes('&'), false, `Hotspot contains raw &: ${s.name}`);
      }

      assert.equal((chap.characterLine || '').includes('&'), false, `characterLine contains &: ${chap.id}`);
      assert.ok(chap.choices.length >= 2, `Chapter ${chap.id} needs >= 2 choices`);
      assert.ok(chap.choices.some((c) => c.isCorrect), `Chapter ${chap.id} has no correct choice`);

      const sb = chap.sentenceBuilder;
      assert.ok(sb && Array.isArray(sb.target) && Array.isArray(sb.options), `Missing sentenceBuilder in ${chap.id}`);
      for (const word of sb.target) {
        assert.ok(sb.options.includes(word), `sentenceBuilder word "${word}" missing from options in ${chap.id}`);
      }
    }
  }

  assert.equal(totalChapters, 41);
  assert.ok(totalHotspots >= 500, `Expected >= 500 hotspots, got ${totalHotspots}`);
});

test('SVG illustrations in public/images are well-formed 16:9 SVGs', () => {
  const dir = path.join(ROOT, 'public', 'images');
  const svgs = fs.readdirSync(dir).filter((f) => f.endsWith('.svg'));
  assert.ok(svgs.length >= 14, `Expected >= 14 SVG scenes, got ${svgs.length}`);
  for (const file of svgs) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    assert.ok(content.includes('<svg') && content.includes('</svg>'), `Malformed SVG: ${file}`);
    assert.ok(content.includes('viewBox="0 0 1600 900"'), `SVG missing 16:9 viewBox: ${file}`);
  }
});

test('Vocabulary Bank: 500+ unique entries and valid Phonics subset', () => {
  assert.ok(VOCAB_CATEGORIES.length >= 10);
  assert.ok(VOCAB_BANK_500.length >= 500, `Expected >= 500 words, got ${VOCAB_BANK_500.length}`);

  const seen = new Set();
  for (const item of VOCAB_BANK_500) {
    assert.ok(item.id && item.word && item.emoji && item.tr && item.de && item.category);
    assert.equal(seen.has(item.upper), false, `Duplicate vocab word: ${item.word}`);
    seen.add(item.upper);
  }

  const phonics = getPhonicsWordsFromBank();
  assert.ok(phonics.length > 200);
  for (const p of phonics) {
    assert.match(p.word, /^[A-Z]{3,8}$/);
  }
});

test('Review Tracker: records missed/mastered words and generates weekly summary', () => {
  const store = {};
  globalThis.window = {
    localStorage: {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => {
        store[k] = String(v);
      },
    },
  };

  recordMissedWord('Octopus', '🐙', 'Ahtapot');
  recordMissedWord('Octopus', '🐙', 'Ahtapot');
  recordMissedWord('Suitcase', '🧳', 'Bavul');
  recordMasteredWord('Dolphin', '🐬', 'Yunus');

  const review = getReviewWords(8);
  assert.equal(review.length, 8);
  assert.equal(review[0].word, 'Octopus');
  assert.equal(review[0].misses, 2);

  recordMasteredWord('Suitcase', '🧳', 'Bavul');
  const summary = getWeeklySummary();
  assert.equal(summary.practicedCount, 3);
  assert.ok(summary.masteredWords.some((w) => w.word === 'Dolphin'));
  assert.ok(summary.masteredWords.some((w) => w.word === 'Suitcase'));
  assert.ok(summary.trickyWords.some((w) => w.word === 'Octopus'));

  delete globalThis.window;
});

test('Speech Evaluation: accepts exact/keyword matches and rejects unrelated transcripts', async () => {
  const origFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('offline'); };
  try {
    const exact = await evaluateKidPronunciation({
      targetPhrase: 'A burger and fries, please!',
      transcript: 'A burger and fries please',
    });
    assert.equal(exact.isAccepted, true);
    assert.ok(exact.stars >= 2);

    const partial = await evaluateKidPronunciation({
      targetPhrase: 'Where is the pool?',
      transcript: 'where is pool',
    });
    assert.equal(partial.isAccepted, true);

    const wrong = await evaluateKidPronunciation({
      targetPhrase: 'Where is the pool?',
      transcript: 'banana elephant',
    });
    assert.equal(wrong.isAccepted, false);

    const empty = await evaluateKidPronunciation({
      targetPhrase: 'Hello!',
      transcript: '',
    });
    assert.equal(empty.isAccepted, false);
  } finally {
    globalThis.fetch = origFetch;
  }
});
