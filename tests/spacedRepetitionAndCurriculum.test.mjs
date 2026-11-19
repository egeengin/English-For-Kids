import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { CURRICULUM_LEVELS } from '../src/data/curriculum.js';

test('Curriculum levels: 7 distinct levels, 12 items each, zero duplicates', () => {
  assert.equal(CURRICULUM_LEVELS.length, 7, 'Should have exactly 7 levels');

  const allWords = [];
  const allIds = new Set();
  const levelWordSets = [];

  for (let i = 0; i < CURRICULUM_LEVELS.length; i++) {
    const lvl = CURRICULUM_LEVELS[i];
    assert.equal(lvl.number, i + 1, `Level index ${i} should have number ${i + 1}`);
    assert.ok(lvl.items, `Level ${lvl.title} should have items`);
    assert.equal(lvl.items.length, 12, `Level ${lvl.title} should have exactly 12 items`);

    const thisLevelWords = new Set();

    for (const item of lvl.items) {
      assert.ok(item.id, 'Item must have an id');
      assert.ok(!allIds.has(item.id), `Duplicate ID found: ${item.id}`);
      allIds.add(item.id);

      assert.ok(item.word, 'Item must have a word');
      const normalizedWord = item.word.toLowerCase();
      assert.ok(!allWords.includes(normalizedWord), `Duplicate word across levels: ${item.word}`);
      allWords.push(normalizedWord);
      thisLevelWords.add(normalizedWord);

      // Verify educational enrichment fields
      assert.ok(item.phonicsLetter, `Item ${item.word} must have phonicsLetter`);
      assert.ok(item.phonicsSound, `Item ${item.word} must have phonicsSound`);
      assert.ok(item.clue, `Item ${item.word} must have an educational clue`);
      assert.ok(item.syllables, `Item ${item.word} must have syllables`);
      assert.ok(item.translation, `Item ${item.word} must have Turkish translation`);
      assert.ok(item.translationDe, `Item ${item.word} must have German translation`);
    }

    levelWordSets.push(thisLevelWords);
  }

  assert.equal(allWords.length, 84, 'Curriculum must contain 84 total unique words');

  // Verify pairwise that no two levels share any words
  for (let a = 0; a < levelWordSets.length; a++) {
    for (let b = a + 1; b < levelWordSets.length; b++) {
      for (const w of levelWordSets[a]) {
        assert.ok(!levelWordSets[b].has(w), `Word "${w}" is shared between level ${a + 1} and ${b + 1}`);
      }
    }
  }
});

test('Spaced Repetition Queue simulation: correct removes, wrong re-inserts 2 questions later', () => {
  // Simulate GameArena queue behavior
  const items = [
    { id: 'cat', word: 'Cat' },
    { id: 'dog', word: 'Dog' },
    { id: 'lion', word: 'Lion' },
    { id: 'tiger', word: 'Tiger' },
  ];

  let queue = [...items];
  const masteredIds = new Set();
  const reviewIds = new Set();
  const askedSequence = [];

  function answerQuestion(isCorrect) {
    const current = queue[0];
    askedSequence.push(current.id);

    if (isCorrect) {
      masteredIds.add(current.id);
      queue = queue.slice(1);
    } else {
      reviewIds.add(current.id);
      const remaining = queue.slice(1);
      if (remaining.length === 0) {
        queue = [current];
      } else {
        const insertIdx = Math.min(2, remaining.length);
        queue = [
          ...remaining.slice(0, insertIdx),
          current,
          ...remaining.slice(insertIdx),
        ];
      }
    }
  }

  // Turn 1: Target is Cat. Deniz gets it WRONG.
  answerQuestion(false);
  // queue had [dog, lion, tiger]. Cat should be re-inserted 2 questions later:
  // queue is now: [dog, lion, cat, tiger]
  assert.equal(queue[0].id, 'dog');
  assert.equal(queue[1].id, 'lion');
  assert.equal(queue[2].id, 'cat');
  assert.equal(queue[3].id, 'tiger');
  assert.ok(reviewIds.has('cat'));
  assert.equal(masteredIds.size, 0);

  // Turn 2: Target is Dog. Deniz gets it RIGHT.
  answerQuestion(true);
  // Dog is mastered, removed forever!
  assert.ok(masteredIds.has('dog'));
  assert.equal(queue[0].id, 'lion');
  assert.equal(queue[1].id, 'cat');
  assert.equal(queue[2].id, 'tiger');

  // Turn 3: Target is Lion. Deniz gets it RIGHT.
  answerQuestion(true);
  // Lion is mastered, removed forever!
  assert.ok(masteredIds.has('lion'));
  // Cat comes back as the next question!
  assert.equal(queue[0].id, 'cat');
  assert.equal(queue[1].id, 'tiger');

  // Turn 4: Target is Cat (review question!). Deniz gets it RIGHT this time!
  answerQuestion(true);
  assert.ok(masteredIds.has('cat'));
  assert.equal(queue.length, 1);
  assert.equal(queue[0].id, 'tiger');

  // Turn 5: Target is Tiger. Deniz gets it RIGHT!
  answerQuestion(true);
  assert.ok(masteredIds.has('tiger'));
  assert.equal(queue.length, 0, 'Queue should be empty when all items are mastered');

  // Check total sequence asked
  assert.deepEqual(askedSequence, ['cat', 'dog', 'lion', 'cat', 'tiger']);
  // Cat was asked, failed, returned after 2 questions (dog, lion), then mastered!
});

test('All 84 curriculum words exist in public audio manifest and have audio files', () => {
  const manifestPath = path.resolve('public/audio/manifest.json');
  assert.ok(existsSync(manifestPath), 'Manifest file must exist');

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

  for (const lvl of CURRICULUM_LEVELS) {
    for (const item of lvl.items) {
      const keyUpper = `en:${item.word}`;
      const keyLower = `en:${item.word.toLowerCase()}`;
      const assetPath = manifest[keyUpper] || manifest[keyLower];
      assert.ok(assetPath, `Audio manifest must contain audio for word "${item.word}"`);

      const fullM4a = path.resolve('public', `${assetPath}.m4a`);
      const fullWav = path.resolve('public', `${assetPath}.wav`);
      assert.ok(
        existsSync(fullM4a) || existsSync(fullWav),
        `Audio file for word "${item.word}" at ${assetPath} must exist on disk`
      );
    }
  }
});
