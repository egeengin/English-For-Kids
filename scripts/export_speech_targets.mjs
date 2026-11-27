import { writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

import { CURRICULUM_LEVELS } from '../src/data/curriculum.js';
import { DAILY_EXPEDITION_DAYS, DISCOVERY_STAGES } from '../src/data/dailyMissionsData.js';
import { EXTRA_LEVELS } from '../src/data/extraLevelsData.js';
import { SCENES_DATA } from '../src/data/scenesData.js';
import { getStoryWorlds } from '../src/data/storyData.js';
import { VOCAB_BANK_500 } from '../src/data/vocabularyBank500.js';
import { DAY_LESSONS } from '../src/data/dailyLessonsData.js';
import { ISLAND_STOPS_BY_DAY_ID } from '../src/data/islandMapData.js';
import { LEO_MISSIONS } from '../src/utils/gemini.js';
import { cleanTextForTTS } from '../src/utils/speech.js';
import {
  LEO_TICKLE_LINES,
  KID_JOKES,
  ISLAND_CRITTERS,
  SILLY_SENTENCE_PARTS,
  SILLY_VOICE_CHALLENGES,
} from '../src/data/funnyData.js';

function cleanText(text) {
  return cleanTextForTTS(text);
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

// 3. Vocab bank 500 (Balloon Pop words, clues, and repeat phrases)
for (const it of VOCAB_BANK_500 || []) {
  add(it.word);
  if (it.questionEn) add(it.questionEn);
  if (it.repeatPhrase) {
    add(it.repeatPhrase);
    add(`Great job! ${it.repeatPhrase}`);
  }
}

// 4. Daily Lessons
for (const day of Object.values(DAY_LESSONS || {})) {
  for (const cl of day.chantLines || []) add(cl.en);
  for (const vc of day.visualCards || []) add(vc.en);
  for (const sp of day.patterns || []) {
    for (const opt of sp.options || []) add(opt.fullEn);
  }
}

// 5. Daily Missions
for (const day of DAILY_EXPEDITION_DAYS || []) {
  for (const v of day.vocabFocus || []) {
    add(v.en);
    if (v.exampleEn) add(v.exampleEn);
  }
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

// 12. Adventure Island stops & Leo greetings/celebrations
for (const stop of Object.values(ISLAND_STOPS_BY_DAY_ID || {})) {
  add(stop.titleEn);
  add(String(stop.taglineEn || '').replace(/&/g, ' and '));
  add(`Hi Deniz! Ready for Stop ${stop.stopNumber}: ${stop.titleEn}?`);
  add(`Woohoo, Deniz! Stop ${stop.stopNumber} is complete!`);
  add(`Amazing job Deniz! You finished Stop ${stop.stopNumber}!`);
}
for (const n of [1, 2, 3]) {
  add(`Great going, Deniz! Just ${n} more to open the chest!`);
}
add('Awesome job Deniz! You opened the treasure chest!');
add('Welcome to Arcade Pier, Deniz! Pick a game to win stars!');
add('Listen to all 4 phrases, or tap Say It to echo me!');
add('Your turn, Deniz! Listen and say this aloud!');
add('Superstar Deniz! You spoke every phrase!');
add('Great speaking!');

// 13. Walkie-Talkie Leo Missions
for (const m of LEO_MISSIONS || []) {
  if (typeof m.starterEn === 'function') add(m.starterEn('Deniz'));
  for (const h of m.starterHints || []) add(h);
  for (const sp of m.stepPrompts || []) {
    add(sp.en);
    for (const h of sp.hints || []) add(h);
  }
}

// 14. QuickSpeakGame
try {
  const qsCode = readFileSync('src/components/QuickSpeakGame.jsx', 'utf8');
  for (const match of qsCode.matchAll(/phrase:\s*'([^']+)'/g)) {
    add(match[1]);
  }
} catch {
  // ignore
}

// 15. ListenColorGame
for (const prompt of [
  'Color the car red!',
  'Color the elephant blue!',
  'Color the umbrella yellow!',
  'Color the dinosaur green!',
  'Color the backpack purple!',
  'Red',
  'Blue',
  'Yellow',
  'Green',
  'Purple',
  'Awesome! red Car!',
  'Awesome! blue Elephant!',
  'Awesome! yellow Umbrella!',
  'Awesome! green Dinosaur!',
  'Awesome! purple Backpack!',
]) {
  add(prompt);
}

// 16. PutItThereGame
for (const prompt of [
  'Put the soccer ball UNDER the table!',
  'Put the orange cat ON the sofa!',
  'Put the teddy bear IN the box!',
  'Put the puppy BEHIND the tree!',
  'Put the shoes UNDER the chair!',
  'Great! On the sofa!',
  'Great! Under the table!',
  'Great! In the box!',
  'Great! Behind the tree!',
  'Great! Under the chair!',
]) {
  add(prompt);
}

// 17. StickerCollection
try {
  const scCode = readFileSync('src/components/StickerCollection.jsx', 'utf8');
  const startIdx = scCode.indexOf('const STICKER_BADGES = [');
  const endIdx = scCode.indexOf('export default function StickerCollection');
  if (startIdx !== -1 && endIdx !== -1) {
    const badgesCode = scCode.slice(startIdx, endIdx).replace('const STICKER_BADGES =', 'return');
    const badges = new Function(badgesCode)();
    for (const b of badges || []) {
      for (const line of b.powerLines || []) add(line);
      add(`Earn ${b.cost} bricks to unlock ${b.title}!`);
      add(`Max level! Awesome ${b.title}!`);
    }
  }
} catch {
  // ignore
}

// 18. RhymingPairsGame & SoundDetectiveGame
try {
  const rpCode = readFileSync('src/components/RhymingPairsGame.jsx', 'utf8');
  for (const match of rpCode.matchAll(/left:\s*\{\s*word:\s*'([^']+)'[^}]*\},\s*right:\s*\{\s*word:\s*'([^']+)'/g)) {
    add(match[1]);
    add(match[2]);
    add(`${match[1]} and ${match[2]} rhyme!`);
  }
  const sdCode = readFileSync('src/components/SoundDetectiveGame.jsx', 'utf8');
  for (const match of sdCode.matchAll(/word:\s*'([^']+)'/g)) {
    add(match[1]);
  }
} catch {
  // ignore
}

// 19. Silly Island, Jokes, Critters, Tickles & Sentence Lab
for (const line of LEO_TICKLE_LINES || []) add(line);
for (const joke of KID_JOKES || []) {
  add(joke.setup);
  add(joke.punchline);
}
for (const critter of ISLAND_CRITTERS || []) add(critter.line);
for (const group of Object.values(SILLY_SENTENCE_PARTS || {})) {
  for (const part of group || []) add(part.text);
}
for (const vc of SILLY_VOICE_CHALLENGES || []) add(vc.prompt);
add('Mix crazy bricks to build a funny English sentence!');

// 20. Carrier phrases used by resolveSequentialAssets
for (const carrier of [
  'Find',
  'Find the',
  'I am asking for',
  'I am asking:',
  'Not there!',
  'That word does not fit. I am asking for',
  'That is',
  'Good try! Find',
  'Not this one. I am asking for',
]) {
  add(carrier);
}

const all = [...en].map((t) => ({ text: t, hash: hashClip(t) }));
console.log('Total unique English speech texts:', all.length);
await writeFile('scripts/speech_targets.json', `${JSON.stringify(all, null, 2)}\n`);
console.log('Saved to scripts/speech_targets.json');
