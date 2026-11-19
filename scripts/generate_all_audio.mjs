#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import process from 'node:process';

import { CURRICULUM_LEVELS } from '../src/data/curriculum.js';
import { DAILY_EXPEDITION_DAYS, DISCOVERY_STAGES } from '../src/data/dailyMissionsData.js';
import { EXTRA_LEVELS } from '../src/data/extraLevelsData.js';
import { SCENES_DATA } from '../src/data/scenesData.js';
import { getStoryWorlds } from '../src/data/storyData.js';
import { VOCAB_BANK_500 } from '../src/data/vocabularyBank500.js';
import { DAY_LESSONS } from '../src/data/dailyLessonsData.js';

const execFileAsync = promisify(execFile);

const VOICES = {
  en: process.env.SPEECH_VOICE_EN || 'Samantha',
  tr: process.env.SPEECH_VOICE_TR || 'Yelda',
  de: process.env.SPEECH_VOICE_DE || 'Anna',
};

const CONCURRENCY = Number.parseInt(process.env.SPEECH_CONCURRENCY || '10', 10);
const CHILD_NAME = process.env.SPEECH_CHILD_NAME || 'Deniz';
const CLIPS_ROOT = 'public/audio/clips';
const MANIFEST_PATH = 'public/audio/manifest.json';
const AZURE_COMPAT_MANIFEST_PATH = 'public/audio/azure/manifest.json';

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

function hashClip(lang, text) {
  return createHash('sha256').update(`${lang}\0${text}`).digest('hex').slice(0, 16);
}

function collectAllTexts() {
  const en = new Set();
  const tr = new Set();
  const de = new Set();

  const add = (langSet, val) => {
    const cleaned = cleanText(val);
    if (cleaned && cleaned.length > 0) langSet.add(cleaned);
  };

  // Curriculum levels
  for (const lvl of CURRICULUM_LEVELS || []) {
    for (const it of lvl.items || []) {
      add(en, it.word); add(tr, it.translation); add(de, it.translationDe);
      add(en, it.hintSentence); add(tr, it.hintSentenceTr); add(de, it.hintSentenceDe);
    }
  }

  // Extra levels
  for (const lvl of EXTRA_LEVELS || []) {
    for (const it of lvl.items || []) {
      add(en, it.word); add(tr, it.translation); add(de, it.translationDe);
      add(en, it.hintSentence); add(tr, it.hintSentenceTr); add(de, it.hintSentenceDe);
    }
  }

  // Vocab bank
  for (const it of VOCAB_BANK_500 || []) {
    add(en, it.word); add(tr, it.tr); add(de, it.de);
  }

  // Daily lessons
  for (const day of Object.values(DAY_LESSONS || {})) {
    for (const cl of day.chantLines || []) { add(en, cl.en); add(tr, cl.tr); }
    for (const vc of day.visualCards || []) { add(en, vc.en); add(tr, vc.tr); add(de, vc.de); }
    for (const sp of day.sentencePatterns || []) {
      for (const opt of sp.options || []) { add(en, opt.fullEn); }
    }
  }

  // Daily missions & discovery
  for (const day of DAILY_EXPEDITION_DAYS || []) {
    for (const q of day.questions || []) {
      add(en, q.promptEn); add(tr, q.promptTr);
      for (const opt of q.options || []) { add(en, opt.textEn); add(tr, opt.textTr); }
    }
  }
  for (const stg of DISCOVERY_STAGES || []) {
    for (const q of stg.questions || []) {
      add(en, q.promptEn); add(tr, q.promptTr);
      for (const opt of q.options || []) { add(en, opt.textEn); add(tr, opt.textTr); }
    }
  }

  // Scenes
  for (const sc of Object.values(SCENES_DATA || {})) {
    for (const it of sc.items || []) {
      add(en, it.name); add(tr, it.nameTr); add(de, it.nameDe);
      add(en, it.hint); add(tr, it.hintTr); add(de, it.hintDe);
    }
  }

  // Stories
  for (const w of getStoryWorlds(CHILD_NAME) || []) {
    for (const ch of w.chapters || []) {
      add(en, ch.characterLine); add(tr, ch.characterLineTr); add(de, ch.characterLineDe);
      for (const c of ch.choices || []) {
        add(en, c.text); add(tr, c.textTr); add(de, c.textDe);
        if (c.characterReply) {
          add(en, c.characterReply.text); add(tr, c.characterReply.textTr); add(de, c.characterReply.textDe);
        }
      }
      for (const p of ch.props || []) { add(en, p.name); add(tr, p.nameTr); add(de, p.nameDe); }
      for (const sp of ch.spotDifferences || []) {
        add(en, sp.speakText || sp.name); add(tr, sp.nameTr); add(de, sp.nameDe);
      }
    }
  }

  // Phonics
  const phonemes = [
    'ah', 'buh', 'kuh', 'duh', 'eh', 'fff', 'guh', 'huh', 'ih', 'juh',
    'lll', 'mmm', 'nnn', 'aw', 'puh', 'kwuh', 'rrr', 'sss', 'tuh', 'uh',
    'vvv', 'wuh', 'ks', 'yuh', 'zzz'
  ];
  for (const p of phonemes) add(en, p);

  // Common feedback & motivation phrases
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
  for (const c of common) add(en, c);

  return { en: [...en], tr: [...tr], de: [...de] };
}

async function synthesizeText(lang, text, filePath) {
  const voice = VOICES[lang];
  try {
    await execFileAsync('say', [
      '-v', voice,
      '--file-format=m4af',
      '--data-format=aac',
      '-o', filePath,
      text,
    ]);
  } catch (error) {
    console.error(`Failed to synthesize [${lang}] "${text}":`, error.message);
  }
}

async function main() {
  console.log('--- Collecting all application speech texts ---');
  const allTexts = collectAllTexts();
  console.log(`Found: EN=${allTexts.en.length}, TR=${allTexts.tr.length}, DE=${allTexts.de.length}`);

  // Create output folders
  await mkdir(path.join(CLIPS_ROOT, 'en'), { recursive: true });
  await mkdir(path.join(CLIPS_ROOT, 'tr'), { recursive: true });
  await mkdir(path.join(CLIPS_ROOT, 'de'), { recursive: true });
  await mkdir(path.dirname(AZURE_COMPAT_MANIFEST_PATH), { recursive: true });

  let manifest = {};
  if (existsSync(MANIFEST_PATH)) {
    try {
      manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
    } catch {
      manifest = {};
    }
  }

  // Legacy mappings for existing 80 words in public/audio/{en,tr,de}
  const legacyWords = [
    'red', 'blue', 'yellow', 'green', 'orange', 'circle', 'square', 'triangle', 'star',
    'dog', 'cat', 'lion', 'elephant', 'monkey', 'frog', 'bird', 'fish', 'car', 'airplane',
    'train', 'rocket', 'boat', 'helicopter', 'bicycle', 'truck', 'try_again', 'almost_there',
    'you_can_do_it', 'awesome', 'great_job', 'backpack', 'pencil', 'clock', 'apple', 'book',
    'globe', 'scissors', 'slide', 'swing', 'soccer_ball', 'balloon', 'kite', 'tree', 'skateboard',
    'school_bus', 'police_car', 'traffic_light', 'scooter', 'stop_sign', 'bridge', 'building',
    'good_morning', 'good_night', 'hello_leo', 'time_for_school', 'breakfast_time',
    'milk_and_bread', 'no_thank_you', 'yes_please', 'are_you_ready', 'lets_go', 'how_are_you',
    'i_am_happy', 'i_am_sleepy', 'what_is_your_name', 'my_name_is_leo', 'lets_play',
    'see_you_tomorrow', 'goodbye', 'welcome_to_school', 'teacher', 'friend', 'school', 'deniz',
    'hello_deniz', 'my_name_is_deniz', 'good_morning_deniz', 'good_morning_deniz_how_are_you',
    'mom_breakfast_ready', 'goodbye_deniz'
  ];

  for (const w of legacyWords) {
    const formatted = w.replace(/_/g, ' ');
    if (existsSync(`public/audio/en/${w}.m4a`)) {
      manifest[`en:${formatted}`] = `audio/en/${w}`;
      manifest[`en:${formatted.toLowerCase()}`] = `audio/en/${w}`;
      manifest[`en:${w}`] = `audio/en/${w}`;
    }
    if (existsSync(`public/audio/tr/${w}.m4a`)) {
      manifest[`tr:${w}`] = `audio/tr/${w}`;
    }
    if (existsSync(`public/audio/de/${w}.m4a`)) {
      manifest[`de:${w}`] = `audio/de/${w}`;
    }
  }

  // Queue synthesis tasks
  const tasks = [];
  for (const lang of ['en', 'tr', 'de']) {
    for (const text of allTexts[lang]) {
      const manifestKey = `${lang}:${text}`;
      const lowerManifestKey = `${lang}:${text.toLowerCase()}`;
      if (manifest[manifestKey] && existsSync(`public/${manifest[manifestKey]}.m4a`)) {
        continue;
      }
      const hash = hashClip(lang, text);
      const filePath = path.join(CLIPS_ROOT, lang, `${hash}.m4a`);
      const assetPath = `audio/clips/${lang}/${hash}`;
      manifest[manifestKey] = assetPath;
      manifest[lowerManifestKey] = assetPath;

      if (!existsSync(filePath)) {
        tasks.push({ lang, text, filePath });
      }
    }
  }

  console.log(`Synthesis needed for ${tasks.length} clips (using ${CONCURRENCY} parallel workers)...`);

  let completed = 0;
  let taskIdx = 0;
  const startTime = Date.now();

  async function worker() {
    while (taskIdx < tasks.length) {
      const current = tasks[taskIdx++];
      await synthesizeText(current.lang, current.text, current.filePath);
      completed += 1;
      if (completed % 50 === 0 || completed === tasks.length) {
        const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
        const rate = (completed / (elapsedSec || 1)).toFixed(1);
        console.log(`Progress: ${completed}/${tasks.length} (${rate} clips/s, ${elapsedSec}s elapsed)`);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  // Write manifests
  const manifestJson = `${JSON.stringify(manifest, null, 2)}\n`;
  await writeFile(MANIFEST_PATH, manifestJson);
  await writeFile(AZURE_COMPAT_MANIFEST_PATH, manifestJson);

  console.log(`\n🎉 Success! Audio generation complete.`);
  console.log(`Manifest written to ${MANIFEST_PATH} with ${Object.keys(manifest).length} entries.`);
  console.log(`Azure compatibility manifest written to ${AZURE_COMPAT_MANIFEST_PATH}.`);
}

main().catch((err) => {
  console.error('Fatal error in audio generation:', err);
  process.exit(1);
});
