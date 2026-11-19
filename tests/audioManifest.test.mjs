import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import {
  getAzureSpeechManifestKey,
  getAzureSpeechAsset,
  normalizeSpeechLanguage,
  resetManifestCacheForTesting,
} from '../src/utils/azureSpeechManifest.js';
import { resolveSequentialAssets } from '../src/utils/speech.js';
import { CURRICULUM_LEVELS } from '../src/data/curriculum.js';
import { EXTRA_LEVELS } from '../src/data/extraLevelsData.js';
import { VOCAB_BANK_500 } from '../src/data/vocabularyBank500.js';

test('Azure Speech / Audio Manifest keys and normalization', () => {
  assert.equal(normalizeSpeechLanguage('en-US'), 'en');
  assert.equal(normalizeSpeechLanguage('tr-TR'), 'tr');
  assert.equal(normalizeSpeechLanguage('de-DE'), 'de');
  assert.equal(getAzureSpeechManifestKey('Dog', 'en-US'), 'en:Dog');
  assert.equal(getAzureSpeechManifestKey('Kedi', 'tr'), 'tr:Kedi');
  assert.equal(getAzureSpeechManifestKey('Hund', 'de'), 'de:Hund');
});

test('Pre-rendered Audio Manifest contains core vocabulary and files exist on disk', async () => {
  const manifestPath = path.resolve('public/audio/manifest.json');
  assert.ok(existsSync(manifestPath), 'public/audio/manifest.json should exist');

  const raw = readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(raw);
  assert.ok(Object.keys(manifest).length > 100, 'Manifest should contain at least 100 clips');

  // Verify core words exist in manifest
  assert.ok(manifest['en:red'] || manifest['en:Red'], 'Red should be in manifest');
  assert.ok(manifest['en:dog'] || manifest['en:Dog'], 'Dog should be in manifest');
  assert.ok(manifest['en:cat'] || manifest['en:Cat'], 'Cat should be in manifest');

  // Verify gentle wrong-answer feedback clips exist in manifest
  assert.ok(
    manifest['en:Not this one. I am asking for Dog.'] || manifest['en:not this one. i am asking for dog.'],
    'Feedback "Not this one. I am asking for Dog." should be in manifest'
  );
  assert.ok(
    manifest['en:That is Cat. I am asking for Dog.'] || manifest['en:that is cat. i am asking for dog.'],
    'Feedback "That is Cat. I am asking for Dog." should be in manifest'
  );
  assert.ok(
    manifest['en:Good try! Find Dog.'] || manifest['en:good try! find dog.'],
    'Feedback "Good try! Find Dog." should be in manifest'
  );

  // Check sample asset files exist on disk
  const sampleKeys = [
    'en:Red',
    'en:Dog',
    'en:Cat',
    'en:Not this one. I am asking for Dog.',
    'en:That is Cat. I am asking for Dog.',
    'en:Good try! Find Dog.',
  ].filter((k) => manifest[k]);
  for (const k of sampleKeys) {
    const assetPath = manifest[k];
    const fullM4a = path.resolve('public', `${assetPath}.m4a`);
    const fullWav = path.resolve('public', `${assetPath}.wav`);
    assert.ok(
      existsSync(fullM4a) || existsSync(fullWav),
      `Audio file for ${k} at ${assetPath} should exist on disk`
    );
  }
});

test('getAzureSpeechAsset resolves assets via mocked fetch', async () => {
  resetManifestCacheForTesting();
  const sampleManifest = {
    'en:apple': 'audio/clips/en/apple123',
    'en:Banana': 'audio/clips/en/banana456',
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    return {
      ok: true,
      json: async () => sampleManifest,
    };
  };

  try {
    const appleAsset = await getAzureSpeechAsset('apple', 'en');
    assert.equal(appleAsset, 'audio/clips/en/apple123');

    // Case-insensitive lookup
    const bananaAsset = await getAzureSpeechAsset('banana', 'en');
    assert.equal(bananaAsset, 'audio/clips/en/banana456');

    const nonExistent = await getAzureSpeechAsset('spaceship_not_found', 'en');
    assert.equal(nonExistent, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('resolveSequentialAssets resolves direct, compound, and carrier phrases', async () => {
  resetManifestCacheForTesting();
  const sampleManifest = {
    'en:not this one. i am asking for dog.': 'audio/gemini/en/not_this_one_i_am_asking_for_dog',
    'en:that is': 'audio/gemini/en/that_is',
    'en:i am asking for': 'audio/gemini/en/i_am_asking_for',
    'en:dog': 'audio/gemini/en/dog',
    'en:cat': 'audio/gemini/en/cat',
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => sampleManifest,
  });

  try {
    // 1. Direct match
    const direct = await resolveSequentialAssets('Not this one. I am asking for Dog.', 'en');
    assert.deepEqual(direct, ['audio/gemini/en/not_this_one_i_am_asking_for_dog']);

    // 2. Carrier decomposed match: "That is Cat. I am asking for Dog."
    const decomposed = await resolveSequentialAssets('That is Cat. I am asking for Dog.', 'en');
    assert.ok(decomposed && decomposed.length >= 2, 'Should decompose into sequential parts');
    assert.ok(decomposed.includes('audio/gemini/en/dog'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
