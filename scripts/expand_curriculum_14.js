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

function makeItem(id, word, translation, translationDe, syllables, phonicsSound, clue, emoji, category, icon, colorIdx) {
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
  };
}

const NEW_LEVELS = [
  {
    id: 'level-8',
    number: 8,
    title: 'Numbers 1 to 12',
    titleTr: '1’den 12’ye Sayılar',
    titleDe: 'Zahlen 1 bis 12',
    description: 'Count Lego bricks and master numbers from one to twelve!',
    themeColor: 'from-amber-500 to-orange-500',
    borderColor: 'border-amber-600',
    icon: 'Star',
    badge: '🔢 Counter',
    bricksReward: 5,
    items: [
      makeItem('num1', 'One', 'Bir', 'Eins', 'ONE', '/w/', 'First number when counting 1️⃣', '1️⃣', 'Numbers', 'Star', 0),
      makeItem('num2', 'Two', 'İki', 'Zwei', 'TWO', '/t/', 'Like a pair of eyes 👀', '2️⃣', 'Numbers', 'Star', 1),
      makeItem('num3', 'Three', 'Üç', 'Drei', 'THREE', '/θ/', 'Sides on a triangle 🔺', '3️⃣', 'Numbers', 'Triangle', 2),
      makeItem('num4', 'Four', 'Dört', 'Vier', 'FOUR', '/f/', 'Wheels on a family car 🚗', '4️⃣', 'Numbers', 'Square', 3),
      makeItem('num5', 'Five', 'Beş', 'Fünf', 'FIVE', '/f/', 'Fingers on one hand 🖐️', '5️⃣', 'Numbers', 'Star', 4),
      makeItem('num6', 'Six', 'Altı', 'Sechs', 'SIX', '/s/', 'Legs on a little ant 🐜', '6️⃣', 'Numbers', 'Box', 5),
      makeItem('num7', 'Seven', 'Yedi', 'Sieben', 'SEV • EN', '/s/', 'Days in one full week 📅', '7️⃣', 'Numbers', 'Sparkles', 6),
      makeItem('num8', 'Eight', 'Sekiz', 'Acht', 'EIGHT', '/eɪ/', 'Arms on an octopus 🐙', '8️⃣', 'Numbers', 'Circle', 7),
      makeItem('num9', 'Nine', 'Dokuz', 'Neun', 'NINE', '/n/', 'One less than ten ✨', '9️⃣', 'Numbers', 'Star', 8),
      makeItem('num10', 'Ten', 'On', 'Zehn', 'TEN', '/t/', 'All fingers on two hands 🙌', '🔟', 'Numbers', 'Crown', 9),
      makeItem('num11', 'Eleven', 'On bir', 'Elf', 'E • LEV • EN', '/ɪ/', 'One more than ten 🌟', '🕚', 'Numbers', 'Zap', 0),
      makeItem('num12', 'Twelve', 'On iki', 'Zwölf', 'TWELVE', '/t/', 'Hours on a clock face 🕛', '🕛', 'Numbers', 'Compass', 1),
    ],
  },
  {
    id: 'level-9',
    number: 9,
    title: 'Body & Face',
    titleTr: 'Vücut ve Yüz',
    titleDe: 'Körper & Gesicht',
    description: 'Learn every part of your body from head to toe!',
    themeColor: 'from-rose-500 to-pink-500',
    borderColor: 'border-rose-600',
    icon: 'Smile',
    badge: '🧠 Body Explorer',
    bricksReward: 5,
    items: [
      makeItem('b1', 'Head', 'Baş / Kafa', 'Kopf', 'HEAD', '/h/', 'Where you wear a hat 🧢', '🗣️', 'Body', 'Smile', 0),
      makeItem('b2', 'Hair', 'Saç', 'Haare', 'HAIR', '/h/', 'Grows on top of your head 💇', '💇', 'Body', 'Feather', 1),
      makeItem('b3', 'Eye', 'Göz', 'Auge', 'EYE', '/aɪ/', 'Helps you see colors 👁️', '👁️', 'Body', 'Circle', 2),
      makeItem('b4', 'Ear', 'Kulak', 'Ohr', 'EAR', '/ɪə/', 'Helps you hear music 👂', '👂', 'Body', 'Music', 3),
      makeItem('b5', 'Nose', 'Burun', 'Nase', 'NOSE', '/n/', 'Helps you smell flowers 👃', '👃', 'Body', 'Triangle', 4),
      makeItem('b6', 'Mouth', 'Ağız', 'Mund', 'MOUTH', '/m/', 'Used to speak and smile 👄', '👄', 'Body', 'Smile', 5),
      makeItem('b7', 'Hand', 'El', 'Hand', 'HAND', '/h/', 'Used to wave hello 👋', '✋', 'Body', 'Heart', 6),
      makeItem('b8', 'Arm', 'Kol', 'Arm', 'ARM', '/ɑː/', 'Connects shoulder and hand 💪', '💪', 'Body', 'Zap', 7),
      makeItem('b9', 'Leg', 'Bacak', 'Bein', 'LEG', '/l/', 'Helps you run and jump 🦵', '🦵', 'Body', 'Shield', 8),
      makeItem('b10', 'Foot', 'Ayak', 'Fuß', 'FOOT', '/f/', 'Goes inside your shoe 🦶', '🦶', 'Body', 'Box', 9),
      makeItem('b11', 'Finger', 'Parmak', 'Finger', 'FIN • GER', '/f/', 'Five on every hand ☝️', '☝️', 'Body', 'Sparkles', 0),
      makeItem('b12', 'Tooth', 'Diş', 'Zahn', 'TOOTH', '/t/', 'Brush it to stay shiny 🦷', '🦷', 'Body', 'Star', 1),
    ],
  },
  {
    id: 'level-10',
    number: 10,
    title: 'Clothes & Style',
    titleTr: 'Kıyafetler',
    titleDe: 'Kleidung',
    description: 'Dress up for sunny days, rainy walks, and winter snow!',
    themeColor: 'from-violet-500 to-purple-500',
    borderColor: 'border-violet-600',
    icon: 'Crown',
    badge: '👕 Stylist',
    bricksReward: 5,
    items: [
      makeItem('cl1', 'Shirt', 'Gömlek / Tişört', 'Hemd', 'SHIRT', '/ʃ/', 'Worn on your upper body 👕', '👕', 'Clothes', 'Shield', 0),
      makeItem('cl2', 'Pants', 'Pantolon', 'Hose', 'PANTS', '/p/', 'Covers both of your legs 👖', '👖', 'Clothes', 'Box', 1),
      makeItem('cl3', 'Dress', 'Elbise', 'Kleid', 'DRESS', '/d/', 'One-piece party outfit 👗', '👗', 'Clothes', 'Sparkles', 2),
      makeItem('cl4', 'Hat', 'Şapka', 'Hut', 'HAT', '/h/', 'Shades your head from sun 👒', '👒', 'Clothes', 'Crown', 3),
      makeItem('cl5', 'Shoe', 'Ayakkabı', 'Schuh', 'SHOE', '/ʃ/', 'Protects your feet outside 👟', '👟', 'Clothes', 'Box', 4),
      makeItem('cl6', 'Sock', 'Çorap', 'Socke', 'SOCK', '/s/', 'Keeps toes warm inside shoes 🧦', '🧦', 'Clothes', 'Heart', 5),
      makeItem('cl7', 'Coat', 'Mont / Kaban', 'Mantel', 'COAT', '/k/', 'Heavy layer for cold days 🧥', '🧥', 'Clothes', 'Shield', 6),
      makeItem('cl8', 'Jacket', 'Ceket', 'Jacke', 'JACK • ET', '/dʒ/', 'Zipped top for cool breezes 🧥', '🦺', 'Clothes', 'Shield', 7),
      makeItem('cl9', 'Glasses', 'Gözlük', 'Brille', 'GLASS • ES', '/g/', 'Helps eyes see super sharp 👓', '👓', 'Clothes', 'Circle', 8),
      makeItem('cl10', 'Scarf', 'Atkı', 'Schal', 'SCARF', '/s/', 'Wraps warmly around your neck 🧣', '🧣', 'Clothes', 'Feather', 9),
      makeItem('cl11', 'Glove', 'Eldiven', 'Handschuh', 'GLOVE', '/g/', 'Keeps hands warm in snow 🧤', '🧤', 'Clothes', 'Heart', 0),
      makeItem('cl12', 'Belt', 'Kemer', 'Gürtel', 'BELT', '/b/', 'Holds your pants in place 〰️', '🪢', 'Clothes', 'Box', 1),
    ],
  },
  {
    id: 'level-11',
    number: 11,
    title: 'Family & Friends',
    titleTr: 'Aile ve Arkadaşlar',
    titleDe: 'Familie & Freunde',
    description: 'Meet family members, helpers, and best friends!',
    themeColor: 'from-cyan-500 to-blue-500',
    borderColor: 'border-cyan-600',
    icon: 'Heart',
    badge: '👨‍👩‍👧 Team Player',
    bricksReward: 5,
    items: [
      makeItem('fm1', 'Mom', 'Anne', 'Mama', 'MOM', '/m/', 'Loves and cares for you at home 👩', '👩', 'Family', 'Heart', 0),
      makeItem('fm2', 'Dad', 'Baba', 'Papa', 'DAD', '/d/', 'Plays and builds with you 👨', '👨', 'Family', 'Shield', 1),
      makeItem('fm3', 'Baby', 'Bebek', 'Baby', 'BA • BY', '/b/', 'Tiny newest family member 👶', '👶', 'Family', 'Smile', 2),
      makeItem('fm4', 'Sister', 'Kız Kardeş', 'Schwester', 'SIS • TER', '/s/', 'A girl sibling in your family 👧', '👧', 'Family', 'Heart', 3),
      makeItem('fm5', 'Brother', 'Erkek Kardeş', 'Bruder', 'BROTH • ER', '/b/', 'A boy sibling in your family 👦', '👦', 'Family', 'Star', 4),
      makeItem('fm6', 'Grandma', 'Büyükanne', 'Oma', 'GRAND • MA', '/g/', 'Tells warm stories and bakes 👵', '👵', 'Family', 'Heart', 5),
      makeItem('fm7', 'Grandpa', 'Büyükbaba', 'Opa', 'GRAND • PA', '/g/', 'Wise and kind older hero 👴', '👴', 'Family', 'Crown', 6),
      makeItem('fm8', 'Friend', 'Arkadaş', 'Freund', 'FRIEND', '/f/', 'Shares games and laughs with you 🤝', '🤝', 'Family', 'Smile', 7),
      makeItem('fm9', 'Teacher', 'Öğretmen', 'Lehrer', 'TEACH • ER', '/t/', 'Helps you learn at school 👩‍🏫', '👩‍🏫', 'Family', 'BookOpen', 8),
      makeItem('fm10', 'Doctor', 'Doktor', 'Arzt', 'DOC • TOR', '/d/', 'Helps you feel healthy again 🩺', '🧑‍⚕️', 'Family', 'Shield', 9),
      makeItem('fm11', 'Boy', 'Erkek Çocuk', 'Junge', 'BOY', '/b/', 'A young male child 👦', '🧒', 'Family', 'Star', 0),
      makeItem('fm12', 'Girl', 'Kız Çocuk', 'Mädchen', 'GIRL', '/g/', 'A young female child 👧', '👧', 'Family', 'Sparkles', 1),
    ],
  },
  {
    id: 'level-12',
    number: 12,
    title: 'Feelings & Opposites',
    titleTr: 'Duygular ve Zıtlıklar',
    titleDe: 'Gefühle & Gegensätze',
    description: 'Express how you feel and compare big, small, hot, and cold!',
    themeColor: 'from-fuchsia-500 to-rose-500',
    borderColor: 'border-fuchsia-600',
    icon: 'Smile',
    badge: '😊 Heart Master',
    bricksReward: 5,
    items: [
      makeItem('fl1', 'Happy', 'Mutlu', 'Glücklich', 'HAP • PY', '/h/', 'Smiling bright with joy 😄', '😄', 'Feelings', 'Smile', 0),
      makeItem('fl2', 'Sad', 'Üzgün', 'Traurig', 'SAD', '/s/', 'Feeling down with a frown 😢', '😢', 'Feelings', 'Heart', 1),
      makeItem('fl3', 'Angry', 'Kızgın', 'Wütend', 'AN • GRY', '/æ/', 'When something feels unfair 😠', '😠', 'Feelings', 'Flame', 2),
      makeItem('fl4', 'Scared', 'Korkmuş', 'Ängstlich', 'SCARED', '/s/', 'Spooked by a loud thunder 😨', '😨', 'Feelings', 'Zap', 3),
      makeItem('fl5', 'Tired', 'Yorgun', 'Müde', 'TIRED', '/t/', 'Ready for bed and sleep 🥱', '🥱', 'Feelings', 'Box', 4),
      makeItem('fl6', 'Hungry', 'Aç', 'Hungrig', 'HUN • GRY', '/h/', 'Tummy is ready for lunch 😋', '😋', 'Feelings', 'Apple', 5),
      makeItem('fl7', 'Big', 'Büyük', 'Groß', 'BIG', '/b/', 'Huge like a giant elephant 🐘', '🐘', 'Opposites', 'Crown', 6),
      makeItem('fl8', 'Small', 'Küçük', 'Klein', 'SMALL', '/s/', 'Tiny like a little ladybug 🐞', '🐞', 'Opposites', 'Sparkles', 7),
      makeItem('fl9', 'Fast', 'Hızlı', 'Schnell', 'FAST', '/f/', 'Zooms quick like a cheetah ⚡', '🐆', 'Opposites', 'Rocket', 8),
      makeItem('fl10', 'Slow', 'Yavaş', 'Langsam', 'SLOW', '/s/', 'Takes its time like a snail 🐌', '🐌', 'Opposites', 'Compass', 9),
      makeItem('fl11', 'Hot', 'Sıcak', 'Heiß', 'HOT', '/h/', 'Warm like summer soup 🔥', '🔥', 'Opposites', 'Flame', 0),
      makeItem('fl12', 'Cold', 'Soğuk', 'Kalt', 'COLD', '/k/', 'Chilly like ice cream 🧊', '🧊', 'Opposites', 'Star', 1),
    ],
  },
  {
    id: 'level-13',
    number: 13,
    title: 'Space & Ocean',
    titleTr: 'Uzay ve Okyanus',
    titleDe: 'Weltraum & Ozean',
    description: 'Explore distant planets and dive deep with ocean creatures!',
    themeColor: 'from-indigo-600 to-cyan-500',
    borderColor: 'border-indigo-700',
    icon: 'Rocket',
    badge: '🌌 Galaxy Diver',
    bricksReward: 6,
    items: [
      makeItem('so1', 'Planet', 'Gezegen', 'Planet', 'PLAN • ET', '/p/', 'Round world orbiting a star 🪐', '🪐', 'Space', 'Circle', 0),
      makeItem('so2', 'Astronaut', 'Astronot', 'Astronaut', 'AS • TRO • NAUT', '/æ/', 'Explorer who flies to space 🧑‍🚀', '🧑‍🚀', 'Space', 'Rocket', 1),
      makeItem('so3', 'Galaxy', 'Galaksi', 'Galaxie', 'GAL • AX • Y', '/g/', 'Billions of stars spinning 🌌', '🌌', 'Space', 'Sparkles', 2),
      makeItem('so4', 'Comet', 'Kuyruklu Yıldız', 'Komet', 'COM • ET', '/k/', 'Icy space rock with a bright tail ☄️', '☄️', 'Space', 'Zap', 3),
      makeItem('so5', 'Telescope', 'Teleskop', 'Teleskop', 'TEL • E • SCOPE', '/t/', 'Looks far into the night sky 🔭', '🔭', 'Space', 'Compass', 4),
      makeItem('so6', 'Alien', 'Uzaylı', 'Alien', 'A • LI • EN', '/eɪ/', 'Friendly visitor from another star 👽', '👽', 'Space', 'Smile', 5),
      makeItem('so7', 'Whale', 'Balina', 'Wal', 'WHALE', '/w/', 'Biggest gentle giant in the sea 🐋', '🐋', 'Ocean', 'Ship', 6),
      makeItem('so8', 'Dolphin', 'Yunus', 'Delfin', 'DOL • PHIN', '/d/', 'Smart swimmer that leaps high 🐬', '🐬', 'Ocean', 'Fish', 7),
      makeItem('so9', 'Shark', 'Köpekbalığı', 'Hai', 'SHARK', '/ʃ/', 'Fast ocean hunter with fins 🦈', '🦈', 'Ocean', 'Fish', 8),
      makeItem('so10', 'Octopus', 'Ahtapot', 'Oktopus', 'OC • TO • PUS', '/ɒ/', 'Clever sea animal with 8 arms 🐙', '🐙', 'Ocean', 'Sparkles', 9),
      makeItem('so11', 'Crab', 'Yengeç', 'Krabbe', 'CRAB', '/k/', 'Walks sideways on sandy beaches 🦀', '🦀', 'Ocean', 'Shield', 0),
      makeItem('so12', 'Turtle', 'Kaplumbağa', 'Schildkröte', 'TUR • TLE', '/t/', 'Carries a strong shell home 🐢', '🐢', 'Ocean', 'Shield', 1),
    ],
  },
  {
    id: 'level-14',
    number: 14,
    title: 'Time, Days & Seasons',
    titleTr: 'Zaman ve Mevsimler',
    titleDe: 'Zeit & Jahreszeiten',
    description: 'Talk about morning, seasons, weekdays, and birthday parties!',
    themeColor: 'from-emerald-500 to-teal-500',
    borderColor: 'border-emerald-600',
    icon: 'Sun',
    badge: '⏰ Time Master',
    bricksReward: 6,
    items: [
      makeItem('tm1', 'Morning', 'Sabah', 'Morgen', 'MORN • ING', '/m/', 'When the sun rises for breakfast 🌅', '🌅', 'Time', 'Sun', 0),
      makeItem('tm2', 'Night', 'Gece', 'Nacht', 'NIGHT', '/n/', 'Dark sky full of stars 🌃', '🌃', 'Time', 'Star', 1),
      makeItem('tm3', 'Today', 'Bugün', 'Heute', 'TO • DAY', '/t/', 'Right now on this very day 📅', '📅', 'Time', 'Sparkles', 2),
      makeItem('tm4', 'Tomorrow', 'Yarın', 'Morgen', 'TO • MOR • ROW', '/t/', 'The day that comes next ⏭️', '🗓️', 'Time', 'Compass', 3),
      makeItem('tm5', 'Spring', 'İlkbahar', 'Frühling', 'SPRING', '/s/', 'Season when fresh flowers bloom 🌸', '🌸', 'Seasons', 'Sparkles', 4),
      makeItem('tm6', 'Summer', 'Yaz', 'Sommer', 'SUM • MER', '/s/', 'Warmest sunny beach season ☀️', '🏖️', 'Seasons', 'Sun', 5),
      makeItem('tm7', 'Autumn', 'Sonbahar', 'Herbst', 'AU • TUMN', '/ɔː/', 'Orange leaves falling from trees 🍂', '🍂', 'Seasons', 'Feather', 6),
      makeItem('tm8', 'Winter', 'Kış', 'Winter', 'WIN • TER', '/w/', 'Cold season for building snowmen ❄️', '⛄', 'Seasons', 'Star', 7),
      makeItem('tm9', 'Monday', 'Pazartesi', 'Montag', 'MON • DAY', '/m/', 'First school day of the week 🎒', '📚', 'Days', 'BookOpen', 8),
      makeItem('tm10', 'Friday', 'Cuma', 'Freitag', 'FRI • DAY', '/f/', 'Last school day before weekend 🎉', '🎈', 'Days', 'Smile', 9),
      makeItem('tm11', 'Birthday', 'Doğum Günü', 'Geburtstag', 'BIRTH • DAY', '/b/', 'Special day with cake and candles 🎂', '🎂', 'Events', 'Crown', 0),
      makeItem('tm12', 'Party', 'Parti', 'Party', 'PAR • TY', '/p/', 'Fun celebration with balloons 🥳', '🥳', 'Events', 'Music', 1),
    ],
  },
];

const ALL_LEVELS = [...EXISTING_LEVELS.slice(0, 7), ...NEW_LEVELS];

// Verify zero duplicates across all 14 levels
const seen = new Map();
for (const lvl of ALL_LEVELS) {
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
 * Tailored for early readers (7-year-old children learning reading in German and Turkish).
 * Features syllable breakdowns, visual emoji anchors, phonics initial sound hints,
 * educational trait clues, and bilingual DE/TR helpers.
 * 14 rich levels with 12 items each (168 distinct items with zero cross-level duplicates).
 */

export const CURRICULUM_LEVELS = ${JSON.stringify(ALL_LEVELS, null, 2)};

${modelsAndAccessories}`;

fs.writeFileSync('src/data/curriculum.js', updatedContent, 'utf8');
console.log(`Successfully updated src/data/curriculum.js with ${ALL_LEVELS.length} levels and ${seen.size} unique items!`);
