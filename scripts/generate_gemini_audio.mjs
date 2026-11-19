#!/usr/bin/env node

/**
 * Gemini Studio Neural AI Audio Generator for English Learning
 * Uses Google Gemini 3.8 Flash Neural TTS (Puck voice)
 * to generate ultra-realistic, expressive, human-like English audio clips.
 */

import { createHash } from 'node:crypto';
import dns from 'node:dns';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import process from 'node:process';

dns.setDefaultResultOrder('ipv4first');

import { CURRICULUM_LEVELS } from '../src/data/curriculum.js';
import { DAILY_EXPEDITION_DAYS, DISCOVERY_STAGES } from '../src/data/dailyMissionsData.js';
import { EXTRA_LEVELS } from '../src/data/extraLevelsData.js';
import { SCENES_DATA } from '../src/data/scenesData.js';
import { getStoryWorlds } from '../src/data/storyData.js';
import { VOCAB_BANK_500 } from '../src/data/vocabularyBank500.js';
import { DAY_LESSONS } from '../src/data/dailyLessonsData.js';
import { audioDataToWavBlob } from '../src/utils/speech.js';

const execFileAsync = promisify(execFile);

// Effective Gemini API Key loaded from environment or CLI argument
const DEFAULT_KEY = process.env.GEMINI_API_KEY || '';

const GEMINI_MODELS = [
  'gemini-3.1-flash-tts-preview',
  'gemini-3.8-flash-lite-tts',
  'gemini-3.8-flash-tts',
  'gemini-2.5-flash-preview-tts',
];
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Puck has an energetic, youthful, child-friendly human tone
const VOICE_NAME = process.env.GEMINI_VOICE_NAME || 'Puck';
const CHILD_NAME = process.env.SPEECH_CHILD_NAME || 'Deniz';
const OUTPUT_ROOT = 'public/audio/gemini/en';
const MANIFEST_PATH = 'public/audio/manifest.json';
const AZURE_COMPAT_MANIFEST_PATH = 'public/audio/azure/manifest.json';

function getApiKey() {
  const argKey = process.argv.find((a) => a.startsWith('--key='))?.split('=')[1];
  return (argKey || process.env.GEMINI_API_KEY || DEFAULT_KEY).trim();
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
    .trim()
    .slice(0, 1800);
}

function hashClip(text) {
  return createHash('sha256').update(`en\0${text}`).digest('hex').slice(0, 16);
}

function collectEnglishTexts() {
  const en = new Set();
  const add = (val) => {
    const cleaned = cleanText(val);
    if (cleaned && cleaned.length > 0) en.add(cleaned);
  };

  // 1. Curriculum Levels (Colors, Shapes, Animals, Vehicles)
  for (const lvl of CURRICULUM_LEVELS || []) {
    for (const it of lvl.items || []) {
      add(it.word);
      add(it.hintSentence);
    }
  }

  // 2. Extra Levels (Food, Nature, House, School, Verbs, Feelings, Numbers)
  for (const lvl of EXTRA_LEVELS || []) {
    for (const it of lvl.items || []) {
      add(it.word);
      add(it.hintSentence);
    }
  }

  // 3. 500+ Categorized Vocabulary Bank
  for (const it of VOCAB_BANK_500 || []) {
    add(it.word);
  }

  // 4. Daily Lessons & Chants
  for (const day of Object.values(DAY_LESSONS || {})) {
    for (const cl of day.chantLines || []) add(cl.en);
    for (const vc of day.visualCards || []) add(vc.en);
    for (const sp of day.sentencePatterns || []) {
      for (const opt of sp.options || []) add(opt.fullEn);
    }
  }

  // 5. Daily Missions & Discovery
  for (const day of DAILY_EXPEDITION_DAYS || []) {
    for (const q of day.questions || []) {
      add(q.promptEn);
      for (const opt of q.options || []) add(opt.textEn);
    }
  }
  for (const stg of DISCOVERY_STAGES || []) {
    for (const q of stg.questions || []) {
      add(q.promptEn);
      for (const opt of q.options || []) add(opt.textEn);
    }
  }

  // 6. Interactive Scenes
  for (const sc of Object.values(SCENES_DATA || {})) {
    for (const it of sc.items || []) {
      add(it.name);
      add(it.hint);
    }
  }

  // 7. Story Worlds
  for (const w of getStoryWorlds(CHILD_NAME) || []) {
    for (const ch of w.chapters || []) {
      add(ch.characterLine);
      for (const c of ch.choices || []) {
        add(c.text);
        if (c.characterReply) add(c.characterReply.text);
      }
      for (const p of ch.props || []) add(p.name);
      for (const sp of ch.spotDifferences || []) add(sp.speakText || sp.name);
    }
  }

  // 8. Phonics sounds & letters
  const phonemes = [
    'ah', 'buh', 'kuh', 'duh', 'eh', 'fff', 'guh', 'huh', 'ih', 'juh',
    'lll', 'mmm', 'nnn', 'aw', 'puh', 'kwuh', 'rrr', 'sss', 'tuh', 'uh',
    'vvv', 'wuh', 'ks', 'yuh', 'zzz'
  ];
  for (const p of phonemes) add(p);

  // 9. Phonics blend words
  const phonicsWords = [
    'cat', 'dog', 'sun', 'bus', 'pen', 'cup', 'fox', 'pig', 'hat', 'box', 'bug', 'van'
  ];
  for (const pw of phonicsWords) add(pw);

  // 10. Common kid encouragement and feedback phrases
  const common = [
    'Awesome!', 'Great job!', 'Try again!', 'Almost there!', 'You can do it!',
    'Awesome memory! You matched them all!', 'Great reading! You got it!',
    "Good try! Let's listen again.", 'Awesome! That is right!',
    'Level up! Great speaking!', 'Max level! Awesome!',
    'Hello Leo!', 'Time for school!', 'Breakfast time!',
    'Milk and bread, please!', 'No, thank you.', 'Yes, please!',
    'Are you ready?', "Yes, let's go!", 'How are you today?',
    'I am happy!', 'I am sleepy.', 'What is your name?',
    'My name is Leo!', "Yes, let's play!", 'See you tomorrow!',
    'Goodbye!', 'Welcome to school!', 'Teacher', 'Friend', 'School',
    'Hello Deniz!', 'My name is Deniz!',
    'Good morning, Deniz! Time for school!',
    'Good morning, Deniz! How are you today?',
    'Good morning, sunshine! Breakfast is ready on the table!',
    'Goodbye Deniz!'
  ];
  for (const c of common) add(c);

  return [...en].filter(Boolean);
}

async function synthesizeGemini(apiKey, text, voice) {
  const promptText = `Say: ${text}`;
  const payload = {
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  };

  let lastErr = null;
  for (const model of GEMINI_MODELS) {
    const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.status === 429) {
        lastErr = new Error('RATE_LIMITED_429');
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        lastErr = new Error(`HTTP ${response.status}: ${errText.slice(0, 150)}`);
        continue;
      }

      const data = await response.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const audioPart = parts.find((p) => p.inlineData && p.inlineData.data);
      if (!audioPart) {
        lastErr = new Error('NO_AUDIO_PART');
        continue;
      }

      const wavBlob = audioDataToWavBlob(audioPart.inlineData.data, audioPart.inlineData.mimeType);
      const buffer = Buffer.from(await wavBlob.arrayBuffer());
      return buffer;
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error('FAILED_TO_SYNTHESIZE');
}

async function main() {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error('❌ Error: GEMINI_API_KEY is required.');
    process.exit(1);
  }

  console.log(`🎙️ Gemini Neural Audio Generator (Voice: ${VOICE_NAME})`);
  console.log('--- Collecting English speech texts ---');
  const texts = collectEnglishTexts();
  console.log(`Found ${texts.length} unique English texts.`);

  await mkdir(OUTPUT_ROOT, { recursive: true });
  await mkdir(path.dirname(AZURE_COMPAT_MANIFEST_PATH), { recursive: true });

  let manifest = {};
  if (existsSync(MANIFEST_PATH)) {
    try {
      manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
    } catch {
      manifest = {};
    }
  }

  const tasks = [];
  for (const text of texts) {
    const hash = hashClip(text);
    const wavPath = path.join(OUTPUT_ROOT, `${hash}.wav`);
    const m4aPath = path.join(OUTPUT_ROOT, `${hash}.m4a`);
    const manifestKey = `en:${text}`;
    const lowerKey = `en:${text.toLowerCase()}`;
    const assetPath = `audio/gemini/en/${hash}`;

    // Always ensure manifest maps to this Gemini clip
    manifest[manifestKey] = assetPath;
    manifest[lowerKey] = assetPath;

    if (!existsSync(wavPath) || !existsSync(m4aPath)) {
      tasks.push({ text, hash, wavPath, m4aPath });
    }
  }

  console.log(`Synthesis needed for ${tasks.length} clips (${texts.length - tasks.length} already exist)...`);

  let completed = 0;
  for (let i = 0; i < tasks.length; i += 1) {
    const task = tasks[i];
    let attempts = 0;
    let success = false;

    while (attempts < 3 && !success) {
      attempts += 1;
      try {
        const wavBuffer = await synthesizeGemini(apiKey, task.text, VOICE_NAME);
        await writeFile(task.wavPath, wavBuffer);

        // Convert to AAC m4a for ultra-compact, high-speed playback
        try {
          await execFileAsync('afconvert', [
            '-f', 'm4af',
            '-d', 'aac',
            task.wavPath,
            task.m4aPath,
          ]);
        } catch {
          // If afconvert fails, wav is already available
        }

        success = true;
        completed += 1;
        console.log(`[${completed}/${tasks.length}] Gemini synthesized: "${task.text}"`);

        if (completed % 10 === 0 || completed === tasks.length) {
          // Save manifest incrementally
          const json = `${JSON.stringify(manifest, null, 2)}\n`;
          await writeFile(MANIFEST_PATH, json);
          await writeFile(AZURE_COMPAT_MANIFEST_PATH, json);
        }

        // Small delay between calls to respect rate limits
        await new Promise((r) => setTimeout(r, 650));
      } catch (err) {
        console.warn(`Attempt ${attempts} failed for "${task.text}":`, err.message);
        if (err.message.includes('429') || err.message.includes('RATE_LIMITED')) {
          console.log('Cooldown for 10s due to rate limit...');
          await new Promise((r) => setTimeout(r, 10000));
        } else {
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    }
  }

  const finalJson = `${JSON.stringify(manifest, null, 2)}\n`;
  await writeFile(MANIFEST_PATH, finalJson);
  await writeFile(AZURE_COMPAT_MANIFEST_PATH, finalJson);

  console.log(`\n🎉 Gemini Audio generation complete!`);
  console.log(`Saved ${completed} new clips to ${OUTPUT_ROOT}.`);
  console.log(`Manifest updated at ${MANIFEST_PATH}.`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
