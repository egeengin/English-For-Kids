import { writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

import { CURRICULUM_LEVELS } from '../src/data/curriculum.js';
import { DAILY_EXPEDITION_DAYS, DISCOVERY_STAGES } from '../src/data/dailyMissionsData.js';
import { EXTRA_LEVELS } from '../src/data/extraLevelsData.js';
import { SCENES_DATA } from '../src/data/scenesData.js';
import { getStoryWorlds } from '../src/data/storyData.js';
import { VOCAB_BANK_500 } from '../src/data/vocabularyBank500.js';
import { DAY_LESSONS } from '../src/data/dailyLessonsData.js';

function cleanText(text) {
  const value = String(text || '').trim();
  if (!value) return '';
  const withSpaces = /^[a-z0-9_]+$/i.test(value) && value.includes('_')
    ? value.replace(/_/g, ' ')
    : value;
  return withSpaces
    .replace(/[^\p{L}\p{N}\s.,!?\x27’":;-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1800);
}

function hashClip(text) {
  return createHash('sha256').update(`en\0${text}`).digest('hex').slice(0, 16);
}

const en = new Set();
const add = (val) => {
  const cleaned = cleanText(val);
  if (cleaned && cleaned.length > 0) en.add(cleaned);
};

// 1. Curriculum Levels
for (const lvl of CURRICULUM_LEVELS || []) {
  for (const it of lvl.items || []) {
    add(it.word);
    add(it.hintSentence);
    add(it.dadPrompt);
  }
}

// 2. Extra Levels
for (const lvl of EXTRA_LEVELS || []) {
  for (const it of lvl.items || []) {
    add(it.word);
    add(it.hintSentence);
  }
}

// 3. Vocab bank 500
for (const it of VOCAB_BANK_500 || []) {
  add(it.word);
}

// 4. Daily Lessons
for (const day of Object.values(DAY_LESSONS || {})) {
  for (const cl of day.chantLines || []) add(cl.en);
  for (const vc of day.visualCards || []) add(vc.en);
  for (const sp of day.sentencePatterns || []) {
    for (const opt of sp.options || []) add(opt.fullEn);
  }
}

// 5. Daily Missions
for (const day of DAILY_EXPEDITION_DAYS || []) {
  for (const q of day.questions || []) {
    add(q.promptEn);
    for (const opt of q.options || []) add(opt.textEn);
  }
}
for (const stg of DISCOVERY_STAGES || []) {
  add(stg.introSpeechEn);
  for (const q of stg.questions || []) {
    add(q.promptEn);
    for (const opt of q.options || []) add(opt.textEn);
  }
}

// 6. Scenes
for (const sc of Object.values(SCENES_DATA || {})) {
  for (const d of sc.differences || []) {
    add(d.audioKey || d.targetWord);
    add(d.targetWord);
    add(d.sentence);
  }
}

// 7. Story Worlds
for (const w of getStoryWorlds('Deniz') || []) {
  for (const ch of w.chapters || []) {
    add(ch.characterLine);
    for (const c of ch.choices || []) {
      add(c.text);
      if (c.reply) add(c.reply.text);
    }
    for (const p of ch.sceneBackdrop?.props || []) {
      add(p.name);
      add(`Find the ${p.name}!`);
      add(`Great job! ${p.name}!`);
    }
    if (ch.sentenceBuilder?.words) {
      add(ch.sentenceBuilder.words.join(' '));
      for (const word of ch.sentenceBuilder.words) {
        add(word.replace(/[^a-zA-Z]/g, ''));
      }
    }
  }
}

// 8. Phonics
const phonemes = [
  'ah', 'buh', 'kuh', 'duh', 'eh', 'fff', 'guh', 'huh', 'ih', 'juh',
  'lll', 'mmm', 'nnn', 'aw', 'puh', 'kwuh', 'rrr', 'sss', 'tuh', 'uh',
  'vvv', 'wuh', 'ks', 'yuh', 'zzz'
];
for (const p of phonemes) add(p);

// 9. Phonics words
const phonicsWords = [
  'cat', 'dog', 'sun', 'bus', 'pen', 'cup', 'fox', 'pig', 'hat', 'box', 'bug', 'van'
];
for (const pw of phonicsWords) add(pw);

// 10. Common
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
  'Awesome speaking!', 'Almost there, try again!', 'Great!',
  'Good morning, Deniz! Time for school!',
  'Good morning, Deniz! How are you today?',
  'Good morning, sunshine! Breakfast is ready on the table!',
  'Goodbye Deniz!'
];
for (const c of common) add(c);

// 10b. QuestionQuizGame
try {
  const qqCode = readFileSync('src/components/QuestionQuizGame.jsx', 'utf8');
  const startIdx = qqCode.indexOf('const QUESTION_BANK = [');
  const endIdx = qqCode.indexOf('export default function QuestionQuizGame');
  if (startIdx !== -1 && endIdx !== -1) {
    const bankCode = qqCode.slice(startIdx, endIdx).replace('const QUESTION_BANK =', 'return');
    const bank = new Function(bankCode)();
    for (const item of bank || []) {
      add(item.q);
      add(item.word);
      for (const opt of item.options || []) {
        const cleanOpt = String(opt.text || '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
        add(cleanOpt);
      }
    }
  }
} catch {
  // ignore
}

// 11. Mini Books
import { readFileSync } from 'node:fs';
try {
  const mbCode = readFileSync('src/components/MiniBooksReader.jsx', 'utf8');
  const startIdx = mbCode.indexOf('function getMiniBooks');
  const endIdx = mbCode.indexOf('export default function MiniBooksReader');
  if (startIdx !== -1 && endIdx !== -1) {
    const fnCode = mbCode.slice(startIdx, endIdx);
    const getMiniBooksFn = new Function(fnCode + "; return getMiniBooks('Deniz');")();
    for (const b of getMiniBooksFn || []) {
      for (const p of b.pages || []) add(p.text);
      add(b.question);
      for (const opt of b.options || []) {
        add(opt.text);
        const cleanOpt = opt.text.replace(/[^\p{L}\p{N}\s]/gu, '').trim();
        if (cleanOpt) {
          add(cleanOpt);
          add(`That is ${cleanOpt}. I am asking: ${b.question}`);
        }
      }
    }
  }
} catch {
  // ignore
}

const all = [...en].map((t) => ({ text: t, hash: hashClip(t) }));
console.log('Total unique English speech texts:', all.length);
await writeFile('scripts/speech_targets.json', `${JSON.stringify(all, null, 2)}\n`);
console.log('Saved to scripts/speech_targets.json');
