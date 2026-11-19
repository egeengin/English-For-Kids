#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { CURRICULUM_LEVELS } from '../src/data/curriculum.js';
import { DAILY_EXPEDITION_DAYS, DISCOVERY_STAGES } from '../src/data/dailyMissionsData.js';
import { EXTRA_LEVELS } from '../src/data/extraLevelsData.js';
import { SCENES_DATA } from '../src/data/scenesData.js';
import { getStoryWorlds } from '../src/data/storyData.js';

const language = (process.argv[2] || 'en').toLowerCase();
const childName = process.env.SPEECH_CHILD_NAME || 'Deniz';
const key = process.env.ELEVENLABS_API_KEY;
const outputRoot = process.env.ELEVENLABS_OUTPUT_DIR || 'public/audio/elevenlabs';
const manifestPath = path.join(outputRoot, 'manifest.json');
const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
const delayMs = Number.parseInt(process.env.ELEVENLABS_DELAY_MS || '1100', 10);
const maxChars = Number.parseInt(process.env.ELEVENLABS_MAX_CHARS || '0', 10);

const languageConfig = {
  en: { voice: process.env.ELEVENLABS_VOICE_ID_EN || 'EXAVITQu4vr4xnSDxMaL' },
  tr: { voice: process.env.ELEVENLABS_VOICE_ID_TR || 'EXAVITQu4vr4xnSDxMaL' },
  de: { voice: process.env.ELEVENLABS_VOICE_ID_DE || 'EXAVITQu4vr4xnSDxMaL' },
};

if (!languageConfig[language]) {
  throw new Error(`Unsupported language "${language}". Use en, tr, or de.`);
}
if (!key) {
  throw new Error('ELEVENLABS_API_KEY is required. Set it in the shell environment, never in source control.');
}

function cleanText(text) {
  const value = String(text || '').trim();
  if (!value) return '';
  const withSpaces = /^[a-z0-9_]+$/i.test(value) && value.includes('_')
    ? value.replace(/_/g, ' ')
    : value;
  return withSpaces
    .replace(/[^\p{L}\p{N}\s.,!?'’":;-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .replace(/!+\s+(?=[\p{L}\p{N}])/gu, ', ')
    .trim()
    .slice(0, 1800);
}

function keyBelongsToLanguage(keyName, targetLanguage) {
  const key = String(keyName || '').toLowerCase();
  if (targetLanguage === 'en') {
    return !key.endsWith('tr') && !key.endsWith('de') &&
      !key.includes('helper') && key !== 'translation' && !key.includes('translation');
  }
  if (targetLanguage === 'tr') {
    return key === 'translation' || key.includes('tr');
  }
  return key.includes('de');
}

function collectSpeechTexts(value, keyName = '') {
  if (typeof value === 'string') {
    return keyBelongsToLanguage(keyName, language) && value.trim().length > 1
      ? [cleanText(value)]
      : [];
  }
  if (Array.isArray(value)) return value.flatMap((item) => collectSpeechTexts(item, keyName));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([childKey, childValue]) =>
      collectSpeechTexts(childValue, childKey)
    );
  }
  return [];
}

function hashClip(text) {
  return createHash('sha256').update(`${language}\0${text}`).digest('hex').slice(0, 20);
}

async function synthesize(text) {
  const { voice } = languageConfig[language];
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': key,
        'User-Agent': 'english-for-kids-audio-generator',
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.75,
          style: 0.25,
          use_speaker_boost: true,
        },
      }),
    }
  );
  if (!response.ok) {
    const details = await response.text();
    const error = new Error(`ElevenLabs TTS ${response.status}: ${details.slice(0, 300)}`);
    error.status = response.status;
    throw error;
  }
  return Buffer.from(await response.arrayBuffer());
}

const sourceData = [
  CURRICULUM_LEVELS,
  getStoryWorlds(childName),
  DAILY_EXPEDITION_DAYS,
  DISCOVERY_STAGES,
  EXTRA_LEVELS,
  SCENES_DATA,
];
const texts = [...new Set(sourceData.flatMap((value) => collectSpeechTexts(value)).filter(Boolean))];
const languageDirectory = path.join(outputRoot, language);
await mkdir(languageDirectory, { recursive: true });

let manifest = {};
try {
  manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
} catch {
  // A new manifest is expected on the first run.
}

const selectedTexts = maxChars > 0
  ? texts.reduce((items, text) => {
    const nextChars = items.total + text.length;
    if (nextChars > maxChars) return items;
    items.total = nextChars;
    items.values.push(text);
    return items;
  }, { total: 0, values: [] }).values
  : texts;

console.log(`ElevenLabs: ${language}, ${selectedTexts.length} unique clips`);
for (let index = 0; index < selectedTexts.length; index += 1) {
  const text = selectedTexts[index];
  const hash = hashClip(text);
  const filePath = path.join(languageDirectory, `${hash}.mp3`);
  const manifestKey = `${language}:${text}`;
  try {
    await readFile(filePath);
  } catch {
    try {
      await writeFile(filePath, await synthesize(text));
    } catch (error) {
      console.error(`Stopped at ${index + 1}/${selectedTexts.length}: ${error.message}`);
      if ([401, 402, 403, 429].includes(error.status)) break;
      throw error;
    }
    if (delayMs > 0 && index < selectedTexts.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  manifest[manifestKey] = `audio/elevenlabs/${language}/${hash}`;
  if ((index + 1) % 25 === 0 || index === selectedTexts.length - 1) {
    console.log(`${index + 1}/${selectedTexts.length}`);
  }
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Manifest written to ${manifestPath}`);
