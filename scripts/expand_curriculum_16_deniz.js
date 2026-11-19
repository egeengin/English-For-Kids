import fs from 'node:fs';
import { CURRICULUM_LEVELS as EXISTING_LEVELS } from '../src/data/curriculum.js';

const COLOR_PALETTE = [
  ['#E52521', 'bg-red-500 hover:bg-red-600 text-white', 'border-red-700', '#ff5c59'],
  ['#0055BF', 'bg-blue-600 hover:bg-blue-700 text-white', 'border-blue-800', '#3b82f6'],
  ['#237841', 'bg-emerald-600 hover:bg-emerald-700 text-white', 'border-emerald-800', '#34d399'],
  ['#EA580C', 'bg-orange-600 hover:bg-orange-700 text-white', 'border-orange-800', '#fb923c'],
  ['#9333EA', 'bg-purple-600 hover:bg-purple-700 text-white', 'border-purple-800', '#c084fc'],
  ['#0284C7', 'bg-sky-600 hover:bg-sky-700 text-white', 'border-sky-800', '#38bdf8'],
  ['#D97706', 'bg-amber-600 hover:bg-amber-700 text-white', 'border-amber-800', '#fbbf24'],
  ['#EC4899', 'bg-pink-500 hover:bg-pink-600 text-white', 'border-pink-700', '#f472b6'],
  ['#16A34A', 'bg-green-600 hover:bg-green-700 text-white', 'border-green-800', '#4ade80'],
  ['#475569', 'bg-slate-600 hover:bg-slate-700 text-white', 'border-slate-800', '#94a3b8'],
];

function makeItem(id, word, translation, translationDe, syllables, phonicsSound, clue, emoji, category, icon, colorIdx, dadPrompt) {
  const [colorHex, bgClass, borderClass, studColor] = COLOR_PALETTE[colorIdx % COLOR_PALETTE.length];
  return {
    id,
    word,
    translation,
    translationDe,
    phonetic: word,
    phoneticDe: word,
    syllables,
    phonicsLetter: word[0].toUpperCase(),
    phonicsSound,
    clue,
    emoji,
    category,
    icon,
    colorHex,
    bgClass,
    borderClass,
    studColor,
    hintSentence: `${clue} ${emoji}`,
    hintSentenceTr: `${translation}! ${emoji}`,
    hintSentenceDe: `${translationDe}! ${emoji}`,
    dadPrompt: dadPrompt || `Dad, what is your favorite thing about ${word}? 💭`,
  };
}

// 1. Enrich existing Level 11 (Family & Friends) with Deniz's family names
const baseLevels = JSON.parse(JSON.stringify(EXISTING_LEVELS));
const familyLvl = baseLevels.find(l => l.id === 'level-11');
if (familyLvl) {
  familyLvl.items = familyLvl.items.map(item => {
    if (item.word === 'Mom') {
      item.translation = 'Anne (Melis)';
      item.clue = 'Mom Melis is an anesthesia doctor at SAH Eschweiler! 👩‍⚕️';
      item.dadPrompt = 'Mom Melis, how did you help patients today? 🩺';
    } else if (item.word === 'Dad') {
      item.translation = 'Baba (Ege)';
      item.clue = 'Dad Ege is a 5G engineer with a doctorate PhD! 👨‍🔬';
      item.dadPrompt = 'Dad Ege, tell me how 5G satellites send signals from space! 🛰️';
    } else if (item.word === 'Grandma') {
      item.translation = 'Büyükanne (Nevin & Serpil)';
      item.clue = 'Grandma Nevin and Grandma Serpil give the sweetest hugs! 👵';
      item.dadPrompt = 'Dad, when can we visit Grandma Nevin and Grandma Serpil? 🏡';
    } else if (item.word === 'Grandpa') {
      item.translation = 'Dede (Ahmet)';
      item.clue = 'Grandpa Ahmet is full of fun stories and smiles! 👴';
      item.dadPrompt = "Dad, what was Grandpa Ahmet's coolest adventure? 📖";
    } else if (item.word === 'Teacher') {
      item.translation = 'Öğretmen (Frau Schwarz)';
      item.clue = 'Teacher Frau Schwarz teaches class 1b at GGS Laurensberg! 👩‍🏫';
      item.dadPrompt = 'Dad, guess what Frau Schwarz taught us today at GGS Laurensberg! 🎒';
    } else if (item.word === 'Friend') {
      item.translation = 'Arkadaş (Ojas, Elias, Julius, Vukasin, Liam)';
      item.clue = 'Best buddies Ojas, Elias, Julius, Vukasin, and Liam! 🤝';
      item.dadPrompt = 'Dad, can Ojas, Elias, Julius, Vukasin, and Liam come over to build Lego? 🧱';
    }
    return item;
  });
}

// 2. Add dadPrompt defaults to all existing levels if missing
for (const lvl of baseLevels) {
  for (const item of lvl.items) {
    if (!item.dadPrompt) {
      if (item.word === 'Spaghetti' || item.category === 'Food') {
        item.dadPrompt = `Dad, can we make ${item.word} together tonight? 🍝`;
      } else if (item.word === 'Swim' || item.category === 'Actions') {
        item.dadPrompt = `Dad, watch how fast I can ${item.word.toLowerCase()}! 🏊`;
      } else {
        item.dadPrompt = `Dad, what is something super cool about ${item.word}? 💡`;
      }
    }
  }
}

// 3. New Level 15: Deniz’s World & Favorites
const level15 = {
  id: 'level-15',
  number: 15,
  title: 'Deniz’s World & Favorites',
  titleTr: 'Deniz’in Dünyası ve Favorileri',
  titleDe: 'Deniz’ Welt & Favoriten',
  description: 'Spaghetti Bolognese, GGS Laurensberg, Aachen, Lego sets, and weekend hobbies!',
  themeColor: 'from-amber-500 via-red-500 to-pink-500',
  borderColor: 'border-red-600',
  icon: 'Heart',
  badge: '🌟 Deniz VIP',
  bricksReward: 6,
  items: [
    makeItem('dz1', 'Spaghetti', 'Spagetti Bolognese', 'Spaghetti', 'SPA • GHET • TI', '/s/', "Deniz's absolute #1 favorite food! 🍝", '🍝', 'Favorites', 'Apple', 0, "Dad, can you make delicious Spaghetti Bolognese tonight? 🍝"),
    makeItem('dz2', 'Pudding', 'Muhallebi / Puding', 'Pudding', 'PUD • DING', '/p/', 'Sweet pudding Deniz bakes with Mom & Dad 🍮', '🍮', 'Favorites', 'Star', 1, "Dad, can we bake sweet pudding together after dinner? 🍮"),
    makeItem('dz3', 'Cake', 'Pasta / Kek', 'Kuchen', 'CAKE', '/k/', 'Baking tasty chocolate cake together at home 🎂', '🎂', 'Favorites', 'Sparkles', 2, "Dad, can we bake a huge cake for our family this weekend? 🎂"),
    makeItem('dz4', 'Swimming', 'Yüzme Kursu', 'Schwimmen', 'SWIM • MING', '/s/', 'Sunday swim practice aiming for the Silver Medal! 🥈', '🏊', 'Sports', 'Shield', 3, "Dad, will you time my speed for the Silver Medal on Sunday? ⏱️"),
    makeItem('dz5', 'Basketball', 'Basketbol', 'Basketball', 'BAS • KET • BALL', '/b/', 'Shooting hoops at Wednesday basketball course! 🏀', '🏀', 'Sports', 'Circle', 4, "Dad, want to shoot three-point baskets with me after Wednesday practice? 🏀"),
    makeItem('dz6', 'Piano', 'Piyano', 'Klavier', 'PI • AN • O', '/p/', 'Monday piano melodies with teacher Jeremias 🎹', '🎹', 'Music', 'Music', 5, "Dad, want to hear the new song I practiced with Jeremias? 🎹"),
    makeItem('dz7', 'Lego', 'Lego Setleri', 'Lego', 'LE • GO', '/l/', 'Master builder Deniz finishing giant sets 🧱', '🧱', 'Hobbies', 'Box', 6, "Dad, which giant Lego set should we build together this weekend? 🧱"),
    makeItem('dz8', 'School', 'Okul (GGS Laurensberg)', 'Schule', 'SCHOOL', '/s/', 'Class 1b at GGS Laurensberg with Frau Schwarz 🏫', '🏫', 'Places', 'BookOpen', 7, "Dad, guess what cool things we discovered today at GGS Laurensberg! 🎒"),
    makeItem('dz9', 'Aachen', 'Aachen Şehri', 'Aachen', 'AA • CHEN', '/ɑː/', 'Deniz’s hometown at Schlossparkstr. 🏰', '🏰', 'Places', 'Sun', 8, "Dad, can we ride our bikes through Schlosspark today? 🚲"),
    makeItem('dz10', 'Hotel', 'Otel Tatili', 'Hotel', 'HO • TEL', '/h/', 'Holiday luxury at Nirvana Cosmopolitan hotel 🏨', '🏨', 'Travel', 'Star', 9, "Dad, when are we going back to Nirvana Cosmopolitan hotel? 🏖️"),
    makeItem('dz11', 'Turkey', 'Türkiye Tatili', 'Türkei', 'TUR • KEY', '/t/', 'Sunny holidays visiting family and beach fun 🇹🇷', '🇹🇷', 'Travel', 'Heart', 0, "Dad, what is your favorite seaside beach in Turkey? 🌊"),
    makeItem('dz12', 'Show', 'TV Programı', 'Sendung', 'SHOW', '/ʃ/', 'Watching Checker Tobi and Woozle Goozle on TV 📺', '📺', 'Media', 'Sparkles', 1, "Dad, have you ever seen how funny Checker Tobi and Woozle Goozle are? 📺"),
  ],
};

// 4. New Level 16: Learn with Dad & Math Wizard
const level16 = {
  id: 'level-16',
  number: 16,
  title: 'Learn with Dad & Math Wizard',
  titleTr: 'Babamla Öğreniyorum & Matematik Sihirbazı',
  titleDe: 'Mit Papa lernen & Mathe-Zauberer',
  description: '5G engineering, science questions, double-digit math, and Silver Medals!',
  themeColor: 'from-blue-600 via-indigo-600 to-purple-600',
  borderColor: 'border-blue-700',
  icon: 'Zap',
  badge: '🧠 Genius Math Wizard',
  bricksReward: 6,
  items: [
    makeItem('sc1', 'Engineer', 'Mühendis (Baba Ege)', 'Ingenieur', 'EN • GI • NEER', '/e/', 'Like Dad Ege designing fast 5G satellites 🛰️', '🛰️', 'STEM', 'Rocket', 0, "Dad Ege, how do your 5G satellites send signals from space? 📡"),
    makeItem('sc2', 'Scientist', 'Bilim İnsanı / Doktor', 'Wissenschaftler', 'SCI • EN • TIST', '/s/', 'Mom Melis caring for people & Dad Ege’s PhD 👨‍🔬', '👨‍🔬', 'STEM', 'Sparkles', 1, "Dad, what was your favorite part of finishing your PhD doctorate? 🎓"),
    makeItem('sc3', 'Hospital', 'Hastane (SAH Eschweiler)', 'Krankenhaus', 'HOS • PI • TAL', '/h/', 'Where Mom Melis helps patients stay safe and heal 🏥', '🏥', 'Places', 'Shield', 2, "Mom Melis, what is the most exciting medical machine at SAH Eschweiler? 🩺"),
    makeItem('sc4', 'Plus', 'Artı / Toplama', 'Plus', 'PLUS', '/p/', 'Adding two-digit numbers like a math wizard ➕', '➕', 'Math', 'Star', 3, "Dad, give me two big two-digit numbers to add in my head right now! 🧮"),
    makeItem('sc5', 'Minus', 'Eksi / Çıkarma', 'Minus', 'MI • NUS', '/m/', 'Taking away numbers in clever math puzzles ➖', '➖', 'Math', 'Box', 4, "Dad, test me with a tricky subtraction challenge! 💡"),
    makeItem('sc6', 'Equal', 'Eşittir', 'Gleich', 'E • QUAL', '/iː/', 'When both sides of math balance perfectly 🟰', '🟰', 'Math', 'Square', 5, "Dad, how do balance scales show that two things are equal? ⚖️"),
    makeItem('sc7', 'Solve', 'Çözmek', 'Lösen', 'SOLVE', '/s/', 'Cracking math puzzles and building challenges 💡', '💡', 'Mind', 'Zap', 6, "Dad, can you give me a super hard riddle to solve? 🧩"),
    makeItem('sc8', 'Signal', '5G Sinyali', 'Signal', 'SIG • NAL', '/s/', 'Invisible waves connecting phones across the world 📶', '📶', 'Tech', 'Zap', 7, "Dad, how fast do 5G waves travel between phones and antennas? ⚡"),
    makeItem('sc9', 'Medal', 'Gümüş Madalya', 'Medaille', 'MED • AL', '/m/', 'Deniz’s shiny Silver swimming medal goal! 🥈', '🥈', 'Sports', 'Crown', 8, "Dad, watch my swimming flip turn on Sunday for the Silver Medal! 🏊"),
    makeItem('sc10', 'Question', 'Soru Sormak', 'Frage', 'QUES • TION', '/k/', 'Asking Dad Ege and Mom Melis cool facts ❓', '❓', 'Mind', 'BookOpen', 9, "Dad, what is something super cool about the universe I don't know yet? 🌌"),
    makeItem('sc11', 'Answer', 'Cevap', 'Antwort', 'AN • SWER', '/ɑː/', 'Finding the true solution and winning gold stars ⭐', '⭐', 'Mind', 'Star', 0, "Dad, did I get the right answer on this tricky question? 🎯"),
    makeItem('sc12', 'Genius', 'Dahi / Akıllı', 'Genie', 'GE • NIUS', '/dʒ/', 'Super smart Lego master builder Deniz 🌟', '🌟', 'Mind', 'Crown', 1, "Dad, are engineers and doctors real-life superheroes? 🦸"),
  ],
};

const ALL_16_LEVELS = [...baseLevels, level15, level16];

// Verify 0 duplicates across all 16 levels
const seen = new Map();
for (const lvl of ALL_16_LEVELS) {
  for (const item of lvl.items) {
    const key = item.word.toLowerCase();
    if (seen.has(key)) {
      throw new Error(`Duplicate word found: ${item.word} in ${seen.get(key)} and ${lvl.title}`);
    }
    seen.set(key, lvl.title);
  }
}

const currentFile = fs.readFileSync('src/data/curriculum.js', 'utf8');
const legoBuildModelsIndex = currentFile.indexOf('export const LEGO_BUILD_MODELS');
if (legoBuildModelsIndex === -1) {
  throw new Error('Could not find LEGO_BUILD_MODELS in curriculum.js');
}
const modelsAndAccessories = currentFile.slice(legoBuildModelsIndex);

const updatedContent = `/**
 * Curriculum definitions for Lego English Adventure.
 * Personalized for Deniz (7 years old, Aachen, GGS Laurensberg 1b).
 * Featuring family (Mom Melis, Dad Ege, Grandmas Nevin & Serpil, Grandpa Ahmet),
 * friends (Ojas, Elias, Julius, Vukasin, Liam), teachers (Frau Schwarz, Jeremias),
 * favorite foods (Spaghetti Bolognese, pudding), hobbies (Lego Master, Silver Medal swimming, basketball, piano).
 * 16 rich levels with 12 items each (192 distinct items with zero cross-level duplicates).
 */

export const CURRICULUM_LEVELS = ${JSON.stringify(ALL_16_LEVELS, null, 2)};

${modelsAndAccessories}`;

fs.writeFileSync('src/data/curriculum.js', updatedContent, 'utf8');
console.log(`Successfully updated src/data/curriculum.js with ${ALL_16_LEVELS.length} levels and ${seen.size} unique items!`);
