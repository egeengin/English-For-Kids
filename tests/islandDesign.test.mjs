import test from 'node:test';
import assert from 'node:assert/strict';

import { DAILY_EXPEDITION_DAYS } from '../src/data/dailyMissionsData.js';
import {
  ISLAND_BIOMES,
  ISLAND_STOPS_BY_DAY_ID,
  getIslandStopMeta,
  getStepCompletionForDay,
  findCurrentActiveDayId,
} from '../src/data/islandMapData.js';
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
