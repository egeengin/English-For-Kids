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
const key = process.env.AZURE_SPEECH_KEY;
const region = process.env.AZURE_SPEECH_REGION || 'westeurope';
const outputRoot = process.env.AZURE_SPEECH_OUTPUT_DIR || 'public/audio/azure';
const manifestPath = path.join(outputRoot, 'manifest.json');

const languageConfig = {
  en: { locale: 'en-US', voice: process.env.AZURE_SPEECH_VOICE_EN || 'en-US-JennyNeural' },
  tr: { locale: 'tr-TR', voice: process.env.AZURE_SPEECH_VOICE_TR || 'tr-TR-EmelNeural' },
  de: { locale: 'de-DE', voice: process.env.AZURE_SPEECH_VOICE_DE || 'de-DE-AmalaNeural' },
};

if (!languageConfig[language]) {
  throw new Error(`Unsupported language "${language}". Use en, tr, or de.`);
}
if (!key) {
  throw new Error('AZURE_SPEECH_KEY is required. Set it in the shell environment, never in source control.');
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

function escapeXml(text) {
  return text.replace(/[<>&'"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  }[character]));
}

async function synthesize(text) {
  const { locale, voice } = languageConfig[language];
  const response = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ssml+xml',
        'Ocp-Apim-Subscription-Key': key,
        'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
        'User-Agent': 'english-for-kids-audio-generator',
      },
      body: `<speak version="1.0" xml:lang="${locale}" xmlns="http://www.w3.org/2001/10/synthesis"><voice name="${voice}">${escapeXml(text)}</voice></speak>`,
    }
  );
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Azure TTS ${response.status}: ${details.slice(0, 300)}`);
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

console.log(`Azure Speech: ${language}, ${texts.length} unique clips`);
for (let index = 0; index < texts.length; index += 1) {
  const text = texts[index];
  const hash = hashClip(text);
  const filePath = path.join(languageDirectory, `${hash}.wav`);
  const manifestKey = `${language}:${text}`;
  try {
    await readFile(filePath);
  } catch {
    await writeFile(filePath, await synthesize(text));
  }
  manifest[manifestKey] = `audio/azure/${language}/${hash}`;
  if ((index + 1) % 25 === 0 || index === texts.length - 1) {
    console.log(`${index + 1}/${texts.length}`);
  }
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Manifest written to ${manifestPath}`);
