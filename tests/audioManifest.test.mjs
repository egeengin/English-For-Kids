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

  // Check sample asset files exist on disk
  const sampleKeys = ['en:Red', 'en:Dog', 'en:Cat', 'en:red', 'en:dog'].filter((k) => manifest[k]);
  for (const k of sampleKeys.slice(0, 5)) {
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
