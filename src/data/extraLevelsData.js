/**
 * Extended Spiral Curriculum Levels (Bölüm 2, 4, 6, 10, 12, 13, 14)
 * Expanding the 7-day plan into a relaxed 14-Level progressive journey.
 */

function makeQ(id, emoji, promptEn, options) {
  let hash = 0;
  const str = String(id || '');
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  const shift = options.length > 0 ? Math.abs(hash) % options.length : 0;
  const rotated = shift === 0 ? options : options.slice(shift).concat(options.slice(0, shift));

  return {
    id,
    characterEmoji: emoji,
    promptEn,
    options: rotated.map(([, textEn, optEmoji, isCorrect], idx) => ({
      id: ['a', 'b', 'c'][idx] || String(idx),
      textEn,
      emoji: optEmoji,
      isCorrect: Boolean(isCorrect),
    })),
  };
}

export const EXTRA_LEVELS = [
  {
    id: 'level-2',
    dayNumber: 2,
    shortLabel: 'Bölüm 2',
    badge: '🚲 Benim Dünyam & Sahiplik',
    title: 'I Have Got / My / Your & This Is / That Is',
    desc: 'Oyuncaklarını, okul eşyalarını ve sahip olduklarını tam cümleyle anlatmayı öğren!',
    grammarFocus: 'I have got ... / My ... / Your ... / This is ... / That is ...',
    vocabFocus: [
      { en: 'I have got', tr: 'Benim ... var', de: 'Ich habe', emoji: '🚲' },
      { en: 'My / Your', tr: 'Benim / Senin', de: 'Mein / Dein', emoji: '🎒' },
      { en: 'This is', tr: 'Bu (yakın)', de: 'Das hier ist', emoji: '👇' },
      { en: 'That is', tr: 'Şu (uzak)', de: 'Das dort ist', emoji: '👉' },
    ],
    tvRecommendation: {
      title: 'Yes, I Have! Toys & School Song',
      channel: 'Super Simple Songs',
      duration: '38 sn',
      topicTr: 'Sahip olduğun eşyaları ve oyuncakları anlatan kısa şarkı.',
      searchQuery: 'Super Simple Songs I have got toys',
    },
    items: [
      {
        id: 'l2-i1',
        time: '5 dk Oyun',
        title: 'Bu Benim, Şu Senin Oyunu 🎒',
        category: 'game',
        desc: 'Odadaki eşyaları gösterip "This is my book! That is your cup!" diyerek yakın-uzak pratiği yapın.',
        phrasesEn: ['This is my book!', 'That is your cup!', 'I have got a red bike!'],
      },
    ],
    questions: [
      makeQ('l2-q1', '🚲', 'You want to say you own a red bicycle. Which sentence is right?', [
        ['a', 'I have got a red bike!', '🚲', true],
        ['b', 'I am a red bike!', '🔴', false],
        ['c', 'Yesterday bike blue!', '🌙', false],
      ]),
      makeQ('l2-q2', '🧱', 'You are holding a blue Lego brick in your hand. What do you say?', [
        ['a', 'This is my blue brick!', '🧱', true],
        ['b', 'Those are green apples!', '🍏', false],
        ['c', 'He has got five cats!', '🐱', false],
      ]),
      makeQ('l2-q3', '🎒', 'Point to your friend’s backpack across the room:', [
        ['a', 'That is your backpack!', '👉', true],
        ['b', 'This is my banana!', '🍌', false],
        ['c', 'I can swim fast!', '🏊', false],
      ]),
      makeQ('l2-q4', '🃏', 'Mom asks: "Have you got a Pikachu card?" You say YES:', [
        ['a', 'Yes, I have!', '⚡', true],
        ['b', 'No, it is raining!', '🌧️', false],
        ['c', 'Thank you, please!', '🙏', false],
      ]),
      makeQ('l2-q5', '🏀', 'Your brother owns an orange basketball. Complete: "He ___ an orange ball."', [
        ['a', 'has got', '🏀', true],
        ['b', 'am', '🙋', false],
        ['c', 'under', '⬇️', false],
      ]),
      makeQ('l2-q6', '📘', 'Which word means "Benim" (belonging to me)?', [
        ['a', 'My', '🙋', true],
        ['b', 'Your', '👉', false],
        ['c', 'Under', '📦', false],
      ]),
      makeQ('l2-q7', '🚀', 'Look far up in the sky at a rocket! What do you say?', [
        ['a', 'That is a fast rocket!', '🚀', true],
        ['b', 'This is my shoe!', '👟', false],
        ['c', 'I am hungry!', '🍕', false],
      ]),
      makeQ('l2-q8', '🎹', 'Complete: "I have ___ a cool piano at home."', [
        ['a', 'got', '🎹', true],
        ['b', 'fly', '🦅', false],
        ['c', 'cold', '❄️', false],
      ]),
      makeQ('l2-q9', '👟', 'Point to TWO shoes right next to you:', [
        ['a', 'These are my shoes!', '👟', true],
        ['b', 'This is one hat!', '🧢', false],
        ['c', 'That is a moon!', '🌙', false],
      ]),
      makeQ('l2-q10', '⭐', 'Which sentence uses YOUR correctly?', [
        ['a', 'Your drawing is awesome!', '🎨', true],
        ['b', 'Your am seven years old!', '7️⃣', false],
        ['c', 'I like youring pizza!', '🍕', false],
      ]),
    ],
  },
  {
    id: 'level-4',
    dayNumber: 4,
    shortLabel: 'Bölüm 4',
    badge: '🎮 Oyun & Arkadaşlık Dili',
    title: 'Game Talk: My Turn, Wait for Me, Let’s Play!',
    desc: 'Arkadaşlarınla oyun oynarken sıra alma, bekleme ve nazikçe kural koyma kalıpları!',
    grammarFocus: 'It is my turn / Wait for me / Let’s ... / Good game!',
    vocabFocus: [
      { en: 'My turn / Your turn', tr: 'Benim sıram / Senin sıran', de: 'Ich bin dran / Du bist dran', emoji: '🎲' },
      { en: 'Wait for me!', tr: 'Beni bekle!', de: 'Warte auf mich!', emoji: '⏳' },
      { en: 'Let’s play!', tr: 'Haydi oynayalım!', de: 'Lass uns spielen!', emoji: '🎮' },
      { en: 'Good game!', tr: 'İyi oyundu!', de: 'Gutes Spiel!', emoji: '🤝' },
    ],
    tvRecommendation: {
      title: 'Action & Play Together Song',
      channel: 'The Singing Walrus',
      duration: '38 sn',
      topicTr: 'Birlikte oyun oynama ve hareket etme şarkısı.',
      searchQuery: 'The Singing Walrus Action Song',
    },
    items: [
      {
        id: 'l4-i1',
        time: '5 dk Oyun',
        title: 'Zar & Sıra Oyunu 🎲',
        category: 'game',
        desc: 'Kutu oyunu veya basket atarken her atışta "It is my turn! Now it is your turn!" deyin.',
        phrasesEn: ['It is my turn!', 'Ready, steady, go!', 'Good game!'],
      },
    ],
    questions: [
      makeQ('l4-q1', '🎲', 'You finished rolling the dice. Now it is your friend’s turn!', [
        ['a', 'It is your turn!', '👉', true],
        ['b', 'I am sleeping now!', '😴', false],
        ['c', 'Where is the milk?', '🥛', false],
      ]),
      makeQ('l4-q2', '🏃', 'Your friends are running ahead and you want them to stop for you:', [
        ['a', 'Wait for me, please!', '⏳', true],
        ['b', 'Good night everyone!', '🌙', false],
        ['c', 'I have got three apples!', '🍎', false],
      ]),
      makeQ('l4-q3', '🧱', 'You want to invite your friend to build Lego together:', [
        ['a', 'Let’s build together!', '🧱', true],
        ['b', 'It is raining outside!', '🌧️', false],
        ['c', 'The whale is blue!', '🐳', false],
      ]),
      makeQ('l4-q4', '🚦', 'How do you start a fun race with your friends?', [
        ['a', 'Ready, steady, go!', '🏁', true],
        ['b', 'Yesterday I ate cake!', '🎂', false],
        ['c', 'Whose hat is this?', '🧢', false],
      ]),
      makeQ('l4-q5', '❓', 'You hear a new English word and want to know what it is:', [
        ['a', 'What does that mean?', '🤔', true],
        ['b', 'I am the biggest!', '🐘', false],
        ['c', 'It is eight o’clock!', '⏰', false],
      ]),
      makeQ('l4-q6', '🤝', 'The basketball match ends. What is polite to say?', [
        ['a', 'Good game! High five!', '🙌', true],
        ['b', 'Touch your nose!', '👃', false],
        ['c', 'Sink in the water!', '💧', false],
      ]),
      makeQ('l4-q7', '🛑', 'Someone pushes too hard in a game. How do you set a clear boundary?', [
        ['a', 'Stop! I don’t like that!', '✋', true],
        ['b', 'Yes, I can fly!', '🦅', false],
        ['c', 'I want broccoli ice cream!', '🥦', false],
      ]),
      makeQ('l4-q8', '💡', 'Your friend suggests building a bridge. You love the plan!', [
        ['a', 'That is a good idea!', '💡', true],
        ['b', 'It is cold snow!', '❄️', false],
        ['c', 'Two plus two is four!', '4️⃣', false],
      ]),
      makeQ('l4-q9', '⚖️', 'Everyone gets the exact same number of cards. That is:', [
        ['a', 'Fair!', '⚖️', true],
        ['b', 'Heavy!', '🪨', false],
        ['c', 'Sleepy!', '😴', false],
      ]),
      makeQ('l4-q10', '🤷', 'Your friend asks a tricky question and you are not sure:', [
        ['a', 'I don’t know!', '🤷', true],
        ['b', 'Here is your banana!', '🍌', false],
        ['c', 'Freeze like ice!', '🧊', false],
      ]),
    ],
  },
  {
    id: 'level-6',
    dayNumber: 6,
    shortLabel: 'Bölüm 6',
    badge: '🔍 Keşif & Varlık Bildirme',
    title: 'There Is / There Are & How Many?',
    desc: 'Resimlere ve odana bakıp kaç tane nesne olduğunu İngilizce anlatmayı öğren!',
    grammarFocus: 'There is a ... / There are ... / How many ... are there?',
    vocabFocus: [
      { en: 'There is', tr: 'Var (1 tane)', de: 'Es gibt (1)', emoji: '1️⃣' },
      { en: 'There are', tr: 'Var (birden çok)', de: 'Es gibt (viele)', emoji: '🔢' },
      { en: 'How many?', tr: 'Kaç tane?', de: 'Wie viele?', emoji: '❓' },
      { en: 'Look at', tr: '... bak!', de: 'Schau dir ... an!', emoji: '👀' },
    ],
    tvRecommendation: {
      title: 'How Many & There Are Counting Song',
      channel: 'Busy Beavers',
      duration: '38 sn',
      topicTr: 'Etraftaki nesneleri sayıp "There is / There are" ile anlatma.',
      searchQuery: 'There is There are kids English song',
    },
    items: [
      {
        id: 'l6-i1',
        time: '5 dk Oyun',
        title: 'Oda Dedektifi 🔍',
        category: 'game',
        desc: 'Masaya birkaç kalem ve bir kitap koyun. Deniz "There is one book! There are three pens!" desin.',
        phrasesEn: ['There is one book!', 'There are three pens!', 'How many are there?'],
      },
    ],
    questions: [
      makeQ('l6-q1', '🚀', 'There is only ONE rocket on the table. Which sentence is right?', [
        ['a', 'There is one rocket!', '🚀', true],
        ['b', 'There are one rocket!', '🔢', false],
        ['c', 'I are a rocket!', '🙋', false],
      ]),
      makeQ('l6-q2', '🧱', 'You count 5 yellow bricks in the box. Choose the right sentence:', [
        ['a', 'There are five bricks!', '🧱', true],
        ['b', 'There is five bricks!', '1️⃣', false],
        ['c', 'It am five bricks!', '❓', false],
      ]),
      makeQ('l6-q3', '🔢', 'You want to count the stars in the sky. What do you ask?', [
        ['a', 'How many stars are there?', '⭐', true],
        ['b', 'Who is your pizza?', '🍕', false],
        ['c', 'Can I swim yesterday?', '🏊', false],
      ]),
      makeQ('l6-q4', '🦊', 'Look! One clever fox is in the forest:', [
        ['a', 'There is a fox in the forest!', '🦊', true],
        ['b', 'There are a fox!', '🌲', false],
        ['c', 'Wait for me, forest!', '⏳', false],
      ]),
      makeQ('l6-q5', '🍎', 'Complete: "There ___ three red apples on the plate."', [
        ['a', 'are', '🍎', true],
        ['b', 'is', '1️⃣', false],
        ['c', 'am', '🙋', false],
      ]),
      makeQ('l6-q6', '🐳', 'Complete: "There ___ a big whale in the ocean."', [
        ['a', 'is', '🐳', true],
        ['b', 'are', '🔢', false],
        ['c', 'were', '⏳', false],
      ]),
      makeQ('l6-q7', '👀', 'You see a huge rainbow and want Mom to see it too!', [
        ['a', 'Look at the rainbow!', '🌈', true],
        ['b', 'Brush your teeth!', '🪥', false],
        ['c', 'Because it is heavy!', '🪨', false],
      ]),
      makeQ('l6-q8', '🎈', 'There are 4 balloons and 2 pop. How many balloons are there now?', [
        ['a', 'There are two balloons!', '🎈🎈', true],
        ['b', 'There is six balloons!', '6️⃣', false],
        ['c', 'There are ten cakes!', '🎂', false],
      ]),
      makeQ('l6-q9', '📚', 'Which question asks for a NUMBER?', [
        ['a', 'How many books are there?', '📚', true],
        ['b', 'Where is my shoe?', '👟', false],
        ['c', 'Who is singing?', '🎤', false],
      ]),
      makeQ('l6-q10', '🏰', 'Choose the correct plural sentence:', [
        ['a', 'There are two towers on the castle!', '🏰', true],
        ['b', 'There is two towers on the castle!', '🧱', false],
        ['c', 'There am two towers!', '❌', false],
      ]),
    ],
  },
  {
    id: 'level-10',
    dayNumber: 10,
    shortLabel: 'Bölüm 10',
    badge: '🕵️ Dedektif Soruları',
    title: 'Who, Where, What, When, Whose?',
    desc: 'Kayıp eşyaları ve gizemleri çözmek için 5 büyük soru kelimesini öğren!',
    grammarFocus: 'Who? / Where? / What? / When? / Whose?',
    vocabFocus: [
      { en: 'Who?', tr: 'Kim?', de: 'Wer?', emoji: '🦸' },
      { en: 'Where?', tr: 'Nerede?', de: 'Wo?', emoji: '📍' },
      { en: 'When?', tr: 'Ne zaman?', de: 'Wann?', emoji: '⏰' },
      { en: 'Whose?', tr: 'Kimin?', de: 'Wessen?', emoji: '🔑' },
    ],
    tvRecommendation: {
      title: 'WH Questions Detective Song',
      channel: 'Super Simple Songs',
      duration: '38 sn',
      topicTr: 'Who, Where, What, When sorularını günlük sahnelerle öğreten şarkı.',
      searchQuery: 'Who Where What When kids English song',
    },
    items: [
      {
        id: 'l10-i1',
        time: '5 dk Oyun',
        title: 'Kayıp Anahtar Dedektifi 🔑',
        category: 'game',
        desc: 'Bir oyuncağı saklayın ve "Where is it? Whose toy is it?" sorularıyla ipucu vererek bulun.',
        phrasesEn: ['Where is the key?', 'Who has the ball?', 'Whose book is this?'],
      },
    ],
    questions: [
      makeQ('l10-q1', '📍', 'You lost your blue bike. Which question do you ask?', [
        ['a', 'Where is my blue bike?', '🚲', true],
        ['b', 'Who is my blue bike?', '🦸', false],
        ['c', 'When is my blue bike?', '⏰', false],
      ]),
      makeQ('l10-q2', '🦸', 'Someone knocks on the door! What do you ask?', [
        ['a', 'Who is at the door?', '🚪', true],
        ['b', 'Where is yellow?', '🟡', false],
        ['c', 'Whose is seven?', '7️⃣', false],
      ]),
      makeQ('l10-q3', '🎒', 'You find a red backpack on the bench. You want to find the owner:', [
        ['a', 'Whose backpack is this?', '🎒', true],
        ['b', 'When backpack is this?', '⏰', false],
        ['c', 'How many backpack?', '🔢', false],
      ]),
      makeQ('l10-q4', '⏰', 'You want to know the time of your basketball practice:', [
        ['a', 'When is basketball?', '🏀', true],
        ['b', 'Who is basketball?', '❓', false],
        ['c', 'Whose is basketball?', '🔑', false],
      ]),
      makeQ('l10-q5', '🎁', 'There is a mystery box! You want to know what is inside:', [
        ['a', 'What is in the box?', '📦', true],
        ['b', 'Who is the box?', '🦸', false],
        ['c', 'When is the box?', '⏰', false],
      ]),
      makeQ('l10-q6', '🔑', 'Answer the question: "Where is Pikachu?"', [
        ['a', 'He is under the bed!', '🛏️', true],
        ['b', 'He is my best friend!', '🤝', false],
        ['c', 'At five o’clock!', '⏰', false],
      ]),
      makeQ('l10-q7', '🎹', 'Answer the question: "Who is playing the piano?"', [
        ['a', 'Deniz is playing the piano!', '🎹', true],
        ['b', 'In the kitchen!', '🍳', false],
        ['c', 'Three red apples!', '🍎', false],
      ]),
      makeQ('l10-q8', '📚', 'Answer the question: "Whose book is this?"', [
        ['a', 'It is my sister’s book!', '📘', true],
        ['b', 'It is raining outside!', '🌧️', false],
        ['c', 'Because it is light!', '🎈', false],
      ]),
      makeQ('l10-q9', '🏫', 'Answer the question: "When do we go to school?"', [
        ['a', 'In the morning!', '☀️', true],
        ['b', 'Under the table!', '🪑', false],
        ['c', 'A green frog!', '🐸', false],
      ]),
      makeQ('l10-q10', '🕵️', 'Which word asks about a PERSON?', [
        ['a', 'Who', '👤', true],
        ['b', 'Where', '🗺️', false],
        ['c', 'When', '⏰', false],
      ]),
    ],
  },
  {
    id: 'level-12',
    dayNumber: 12,
    shortLabel: 'Bölüm 12',
    badge: '🏆 Rekorlar Dünyası',
    title: 'The Fastest, The Biggest, The Tallest!',
    desc: 'Dünyadaki ve uzaydaki en büyük, en hızlı, en uzun rekorları İngilizce söyle!',
    grammarFocus: 'The + -est (The fastest / The biggest / The tallest / The smartest)',
    vocabFocus: [
      { en: 'The fastest', tr: 'En hızlı', de: 'Am schnellsten', emoji: '🐆' },
      { en: 'The biggest', tr: 'En büyük', de: 'Am größten', emoji: '🐳' },
      { en: 'The tallest', tr: 'En uzun', de: 'Am höchsten', emoji: '🦒' },
      { en: 'The smartest', tr: 'En akıllı', de: 'Am klügsten', emoji: '🧠' },
    ],
    tvRecommendation: {
      title: 'Superlatives & Animal Records Song',
      channel: 'Super Simple Songs',
      duration: '38 sn',
      topicTr: 'Hayvanların hız ve boyut rekorlarını anlatan şarkı.',
      searchQuery: 'Superlatives kids English song biggest fastest',
    },
    items: [
      {
        id: 'l12-i1',
        time: '5 dk Oyun',
        title: 'Doğa Rekorları Yarışması 🏆',
        category: 'game',
        desc: '3 oyuncak veya hayvan seçin: "Which one is the biggest? Which one is the fastest?" sorusunu cevaplayın.',
        phrasesEn: ['The cheetah is the fastest!', 'The whale is the biggest!'],
      },
    ],
    questions: [
      makeQ('l12-q1', '🐆', 'No land animal runs faster than a cheetah. The cheetah is:', [
        ['a', 'The fastest!', '🐆', true],
        ['b', 'The slowest!', '🐢', false],
        ['c', 'The smallest!', '🐜', false],
      ]),
      makeQ('l12-q2', '🐳', 'The blue whale is larger than every other animal. It is:', [
        ['a', 'The biggest animal!', '🐳', true],
        ['b', 'The shortest animal!', '🐛', false],
        ['c', 'The quietest car!', '🚗', false],
      ]),
      makeQ('l12-q3', '🦒', 'With its super long neck, the giraffe is:', [
        ['a', 'The tallest animal!', '🦒', true],
        ['b', 'The heaviest rock!', '🪨', false],
        ['c', 'The coldest ice!', '❄️', false],
      ]),
      makeQ('l12-q4', '🪐', 'Jupiter is huge! It is ___ planet in our solar system.', [
        ['a', 'the biggest', '🪐', true],
        ['b', 'bigger than', '📏', false],
        ['c', 'yesterday', '⏳', false],
      ]),
      makeQ('l12-q5', '🐜', 'An ant is tiny compared to a cat and an elephant. The ant is:', [
        ['a', 'The smallest!', '🐜', true],
        ['b', 'The tallest!', '🦒', false],
        ['c', 'The loudest!', '🔊', false],
      ]),
      makeQ('l12-q6', '🚀', 'A rocket flies much faster than a bike and a car. The rocket is:', [
        ['a', 'The fastest!', '🚀', true],
        ['b', 'The slowest!', '🐌', false],
        ['c', 'The wettest!', '💧', false],
      ]),
      makeQ('l12-q7', '🧠', 'Complete: "That clever owl is ___ bird in the story!"', [
        ['a', 'the smartest', '🦉', true],
        ['b', 'under the bed', '🛏️', false],
        ['c', 'five o’clock', '⏰', false],
      ]),
      makeQ('l12-q8', '🏔️', 'Mount Everest is higher than every other mountain. It is:', [
        ['a', 'The highest mountain!', '🏔️', true],
        ['b', 'The smallest toy!', '🧸', false],
        ['c', 'The coldest soup!', '🥣', false],
      ]),
      makeQ('l12-q9', '🔊', 'Which word means "en gürültülü / en sesli"?', [
        ['a', 'The loudest', '🔊', true],
        ['b', 'The quietest', '🤫', false],
        ['c', 'The lightest', '🪶', false],
      ]),
      makeQ('l12-q10', '🏆', 'Which sentence uses THE -EST correctly?', [
        ['a', 'This is the tallest Lego tower!', '🧱', true],
        ['b', 'This is tallest than tower!', '❌', false],
        ['c', 'I am the faster than car!', '🚗', false],
      ]),
    ],
  },
  {
    id: 'level-13',
    dayNumber: 13,
    shortLabel: 'Bölüm 13',
    badge: '⏳ Zaman Makinesi (Dün)',
    title: 'Yesterday I Played / Went / Saw / Ate!',
    desc: 'Dün neler yaptığını anlatmak için düzenli (-ed) ve en popüler düzensiz geçmiş zaman fiilleri!',
    grammarFocus: 'Yesterday, I played / watched / went / saw / ate / had',
    vocabFocus: [
      { en: 'Played', tr: 'Oynadım', de: 'Spielte', emoji: '🏀' },
      { en: 'Went', tr: 'Gittim', de: 'Ging', emoji: '🚌' },
      { en: 'Saw', tr: 'Gördüm', de: 'Sah', emoji: '👀' },
      { en: 'Ate', tr: 'Yedim', de: 'Aß', emoji: '🍕' },
    ],
    tvRecommendation: {
      title: 'Yesterday Adventures Song',
      channel: 'Super Simple Songs',
      duration: '38 sn',
      topicTr: 'Dün yapılan aktiviteleri anlatan eğlenceli şarkı.',
      searchQuery: 'Simple past yesterday kids English song',
    },
    items: [
      {
        id: 'l13-i1',
        time: '5 dk Sohbet',
        title: 'Akşam Zaman Makinesi ⏳',
        category: 'mission',
        desc: 'Akşam yemeğinde dün yaptığınız 3 şeyi söyleyin: "Yesterday I went to school, I played, and I ate pizza!"',
        phrasesEn: ['Yesterday I played!', 'I went to the park!', 'I saw a cool bird!'],
      },
    ],
    questions: [
      makeQ('l13-q1', '🏀', 'How do you say you played basketball YESTERDAY?', [
        ['a', 'Yesterday, I played basketball!', '🏀', true],
        ['b', 'Yesterday, I playing basketball!', '❌', false],
        ['c', 'Tomorrow, I played!', '🚀', false],
      ]),
      makeQ('l13-q2', '🚌', 'What is the past form of GO ("Yesterday I ___ to the park")?', [
        ['a', 'went', '🚌', true],
        ['b', 'goed', '❌', false],
        ['c', 'going', '🏃', false],
      ]),
      makeQ('l13-q3', '🦁', 'What is the past form of SEE ("Yesterday I ___ a lion")?', [
        ['a', 'saw', '🦁', true],
        ['b', 'seed', '🌱', false],
        ['c', 'seeing', '👀', false],
      ]),
      makeQ('l13-q4', '🍕', 'What is the past form of EAT ("Yesterday I ___ hot pizza")?', [
        ['a', 'ate', '🍕', true],
        ['b', 'eated', '❌', false],
        ['c', 'eating', '😋', false],
      ]),
      makeQ('l13-q5', '📺', 'Complete: "Last night, we ___ a fun science show."', [
        ['a', 'watched', '📺', true],
        ['b', 'watching', '👀', false],
        ['c', 'will watch', '🚀', false],
      ]),
      makeQ('l13-q6', '🧱', 'What is the past form of BUILD ("Yesterday I ___ a castle")?', [
        ['a', 'built', '🏰', true],
        ['b', 'builded', '❌', false],
        ['c', 'building', '🧱', false],
      ]),
      makeQ('l13-q7', '🎉', 'Complete: "Yesterday we ___ a great time at the park!"', [
        ['a', 'had', '🎉', true],
        ['b', 'haved', '❌', false],
        ['c', 'has', '❓', false],
      ]),
      makeQ('l13-q8', '🚶', 'Complete: "Yesterday morning I ___ to school with Dad."', [
        ['a', 'walked', '🚶', true],
        ['b', 'walking', '🏃', false],
        ['c', 'walks', '❌', false],
      ]),
      makeQ('l13-q9', '⏳', 'Which word tells us the action happened in the PAST?', [
        ['a', 'Yesterday', '⏳', true],
        ['b', 'Tomorrow', '🚀', false],
        ['c', 'Next week', '📅', false],
      ]),
      makeQ('l13-q10', '🎹', 'Choose the correct past sentence:', [
        ['a', 'Yesterday I played a song on my piano!', '🎹', true],
        ['b', 'Yesterday I play piano tomorrow!', '❌', false],
        ['c', 'Yesterday I am jumping!', '🐸', false],
      ]),
    ],
  },
  {
    id: 'level-14',
    dayNumber: 14,
    shortLabel: 'Bölüm 14',
    badge: '🚀 Planlar & Hayaller (Yarın)',
    title: 'Tomorrow I Will / I Am Going To & I Want To Be!',
    desc: 'Hafta sonu planlarını, yeni projelerini ve büyük hayallerini İngilizce anlat!',
    grammarFocus: 'Tomorrow I will ... / I am going to ... / I want to be a ...',
    vocabFocus: [
      { en: 'I am going to', tr: '... yapacağım', de: 'Ich werde', emoji: '🧱' },
      { en: 'Tomorrow I will', tr: 'Yarın ... yapacağım', de: 'Morgen werde ich', emoji: '📅' },
      { en: 'I want to be', tr: '... olmak istiyorum', de: 'Ich möchte ... werden', emoji: '👩‍🚀' },
      { en: 'Next weekend', tr: 'Gelecek hafta sonu', de: 'Nächstes Wochenende', emoji: '🌟' },
    ],
    tvRecommendation: {
      title: 'Future Dreams & Plans Song',
      channel: 'Super Simple Songs',
      duration: '38 sn',
      topicTr: 'Yarınki planları ve büyüyünce olmak istediklerimizi anlatan şarkı.',
      searchQuery: 'What do you want to be kids English song',
    },
    items: [
      {
        id: 'l14-i1',
        time: '5 dk Hayal',
        title: 'Yarınki Büyük Projem 🚀',
        category: 'mission',
        desc: 'Deniz yarın yapmak istediği bir şeyi söylesin: "Tomorrow, I am going to build a spaceship!"',
        phrasesEn: ['Tomorrow, I am going to build...', 'I want to be a scientist!'],
      },
    ],
    questions: [
      makeQ('l14-q1', '🧱', 'You have a plan for tomorrow. Which sentence is right?', [
        ['a', 'Tomorrow, I am going to build a rocket!', '🚀', true],
        ['b', 'Tomorrow, I built yesterday!', '❌', false],
        ['c', 'Tomorrow, I under the table!', '🪑', false],
      ]),
      makeQ('l14-q2', '🏊', 'Complete your weekend plan: "On Saturday, I ___ swim!"', [
        ['a', 'will', '🏊', true],
        ['b', 'ate', '🍕', false],
        ['c', 'saw', '👀', false],
      ]),
      makeQ('l14-q3', '👩‍🚀', 'You dream of flying to Mars! What do you say?', [
        ['a', 'I want to be an astronaut!', '👩‍🚀', true],
        ['b', 'I want to be yesterday!', '⏳', false],
        ['c', 'It is behind the door!', '🚪', false],
      ]),
      makeQ('l14-q4', '🔬', 'You love science experiments like Checker Tobi! What do you say?', [
        ['a', 'I want to be a scientist!', '🔬', true],
        ['b', 'Wait for me, pizza!', '🍕', false],
        ['c', 'The whale is biggest!', '🐳', false],
      ]),
      makeQ('l14-q5', '🎹', 'Complete: "Next week, I am going to ___ a new piano song."', [
        ['a', 'play', '🎹', true],
        ['b', 'played', '⏳', false],
        ['c', 'playing', '❌', false],
      ]),
      makeQ('l14-q6', '📅', 'Which word tells us the action will happen in the FUTURE?', [
        ['a', 'Tomorrow', '🌅', true],
        ['b', 'Yesterday', '⏳', false],
        ['c', 'Last night', '🌙', false],
      ]),
      makeQ('l14-q7', '🚲', 'Complete: "I am going ___ ride my bike in the park."', [
        ['a', 'to', '🚲', true],
        ['b', 'under', '⬇️', false],
        ['c', 'than', '⚖️', false],
      ]),
      makeQ('l14-q8', '🏀', 'Your friend asks: "What will you do after school?"', [
        ['a', 'I will play basketball!', '🏀', true],
        ['b', 'Yesterday I ate an apple!', '🍎', false],
        ['c', 'Whose shoe is this?', '👟', false],
      ]),
      makeQ('l14-q9', '🌟', 'Complete: "We ___ going to read a cool story tonight!"', [
        ['a', 'are', '📖', true],
        ['b', 'is', '1️⃣', false],
        ['c', 'am', '🙋', false],
      ]),
      makeQ('l14-q10', '🏆', 'You finished all 14 Levels of Deniz’s English World! What do you say?', [
        ['a', 'I am an English Champion!', '👑', true],
        ['b', 'I don’t know anything!', '🤷', false],
        ['c', 'Goodbye forever!', '👋', false],
      ]),
    ],
  },
  {
    id: 'level-15',
    dayNumber: 15,
    shortLabel: 'Bölüm 15',
    badge: '🌟 Deniz’in Dünyası & Favorileri',
    title: 'Deniz’s World: Aachen, Spaghetti & Nirvana Hotel',
    desc: 'Deniz’in en sevdiği yemekler, Aachen’daki evi, tatil oteli ve Lego ustalıkları tam cümlelerle!',
    grammarFocus: 'My favorite ... is ... / We stay at ... / I live in ...',
    vocabFocus: [
      { en: 'Spaghetti', tr: 'Spagetti', de: 'Spaghetti', emoji: '🍝' },
      { en: 'Pudding', tr: 'Muhallebi', de: 'Pudding', emoji: '🍮' },
      { en: 'Aachen', tr: 'Aachen', de: 'Aachen', emoji: '⛲' },
      { en: 'Hotel', tr: 'Otel', de: 'Hotel', emoji: '🏨' },
      { en: 'Swimming', tr: 'Yüzme', de: 'Schwimmen', emoji: '🏊' },
    ],
    tvRecommendation: {
      title: 'Checker Tobi & Woozle Goozle Science',
      channel: 'KiKA / TOGGO',
      duration: '10 dk',
      topicTr: 'Deniz’in en sevdiği TV programlarıyla merak ve keşif dolu İngilizce pratik.',
      searchQuery: 'Checker Tobi Woozle Goozle science fun kids',
    },
    items: [
      {
        id: 'l15-i1',
        time: '5 dk Sohbet',
        title: 'En Sevdiğim Şeyler 🍝🌟',
        category: 'mission',
        desc: 'Deniz en sevdiği yemeği ve tatil otelini tam cümleyle söylesin: "My favorite food is spaghetti bolognese!"',
        phrasesEn: ['My favorite food is spaghetti bolognese!', 'I love staying at Nirvana Cosmopolitan!'],
      },
    ],
    questions: [
      makeQ('l15-q1', '🍝', 'What is Deniz’s #1 absolute favorite food in the world?', [
        ['a', 'Spaghetti Bolognese!', '🍝', true],
        ['b', 'Cold broccoli soup', '🥦', false],
        ['c', 'Dry bread', '🍞', false],
      ]),
      makeQ('l15-q2', '⛲', 'In which beautiful German city does Deniz live with his family?', [
        ['a', 'Aachen', '🇩🇪', true],
        ['b', 'The North Pole', '❄️', false],
        ['c', 'A desert island', '🏝️', false],
      ]),
      makeQ('l15-q3', '🏨', 'Which hotel in Turkey does Deniz love staying at for sunny holidays?', [
        ['a', 'Nirvana Cosmopolitan Hotel', '🏨', true],
        ['b', 'A snow cave', '⛄', false],
        ['c', 'A submarine station', '🚤', false],
      ]),
      makeQ('l15-q4', '🍮', 'What sweet treats do Deniz, Mom Melis, and Dad Ege bake together?', [
        ['a', 'Fluffy cake and warm chocolate pudding!', '🎂', true],
        ['b', 'Salty pickles', '🥒', false],
        ['c', 'Hot chili peppers', '🌶️', false],
      ]),
      makeQ('l15-q5', '🧱', 'Deniz has finished giant Lego sets worth thousands of euros! What is he?', [
        ['a', 'A real Lego Master Builder!', '🏆', true],
        ['b', 'A sleepy turtle', '🐢', false],
        ['c', 'A pirate who dislikes bricks', '🏴‍☠️', false],
      ]),
      makeQ('l15-q6', '🥈', 'What shiny swimming medal is Deniz working hard to achieve on Sundays?', [
        ['a', 'The Silver Medal (Silberabzeichen)!', '🥈', true],
        ['b', 'A paper cup', '🥤', false],
        ['c', 'A rubber duck', '🦆', false],
      ]),
      makeQ('l15-q7', '🎹', 'Every Monday, Deniz plays piano melodies with his teacher. Who is he?', [
        ['a', 'Teacher Jeremias!', '🎹', true],
        ['b', 'A noisy alarm clock', '⏰', false],
        ['c', 'A dinosaur', '🦖', false],
      ]),
      makeQ('l15-q8', '🏀', 'On Wednesday afternoon, Deniz puts on his sneakers for which sport?', [
        ['a', 'Basketball!', '🏀', true],
        ['b', 'Ice hockey', '🏒', false],
        ['c', 'Sleeping in bed', '🛏️', false],
      ]),
      makeQ('l15-q9', '📺', 'Which curious TV shows does Deniz love watching for science mysteries?', [
        ['a', 'Checker Tobi & Woozle Goozle!', '📺', true],
        ['b', 'Silent boring news', '📰', false],
        ['c', 'Traffic camera video', '🚦', false],
      ]),
      makeQ('l15-q10', '👦', 'Who are Deniz’s school friends at GGS Laurensberg in Class 1b?', [
        ['a', 'Ojas, Elias, Julius, Vukasin, and Liam!', '👦', true],
        ['b', 'Ten wild lions', '🦁', false],
        ['c', 'Only dancing robots', '🤖', false],
      ]),
    ],
  },
  {
    id: 'level-16',
    dayNumber: 16,
    shortLabel: 'Bölüm 16',
    badge: '🧮 Babamla Bilim & Matematik Dehası',
    title: 'Science with Dad, Hospital & Math Wizard',
    desc: 'Baba Dr. Ege ile 5G sinyalleri, Anne Melis ile hastane, iki basamaklı toplama ve bilim sırları!',
    grammarFocus: 'Plus / Minus / Equal / How does it work? / Because ...',
    vocabFocus: [
      { en: 'Engineer', tr: 'Mühendis', de: 'Ingenieur', emoji: '📡' },
      { en: 'Scientist', tr: 'Bilim İnsanı', de: 'Wissenschaftler', emoji: '🔬' },
      { en: 'Hospital', tr: 'Hastane', de: 'Krankenhaus', emoji: '🏥' },
      { en: 'Plus / Minus', tr: 'Artı / Eksi', de: 'Plus / Minus', emoji: '➕' },
      { en: 'Equal', tr: 'Eşittir', de: 'Gleich', emoji: '🟰' },
      { en: 'Genius', tr: 'Dahi', de: 'Genie', emoji: '🧠' },
    ],
    tvRecommendation: {
      title: 'SciShow Kids: How Do Satellites & Signals Work?',
      channel: 'SciShow Kids',
      duration: '5 dk',
      topicTr: 'Babası Ege’nin 5G ve uydu mühendisliğiyle birebir örtüşen görsel çocuk bilimi.',
      searchQuery: 'SciShow Kids How do satellites and signals work',
    },
    items: [
      {
        id: 'l16-i1',
        time: '5 dk Bilim',
        title: 'Baba Dr. Ege ile 5G Deneyi 📡💡',
        category: 'science',
        desc: '5G sinyallerinin nasıl ışık hızında hareket ettiğini ve iki basamaklı toplama bilmecelerini çöz!',
        phrasesEn: ['Dad Dr. Ege is a 5G engineer!', 'Twenty plus fifteen equals thirty-five!'],
      },
    ],
    questions: [
      makeQ('l16-q1', '📡', 'What is Dad Dr. Ege’s job at E-Space after finishing his PhD doctorate?', [
        ['a', 'He is a 5G Engineer and Scientist!', '📡', true],
        ['b', 'He sells balloons in the circus', '🎈', false],
        ['c', 'He sleeps in an office chair', '💺', false],
      ]),
      makeQ('l16-q2', '🏥', 'Where does Mom Melis work as an anesthesiology resident doctor?', [
        ['a', 'SAH Eschweiler Hospital!', '🏥', true],
        ['b', 'At a toy factory', '🧸', false],
        ['c', 'On a ferry boat in Istanbul', '⛴️', false],
      ]),
      makeQ('l16-q3', '🩺', 'How does Mom Dr. Melis help patients before an operation?', [
        ['a', 'She helps them sleep safely without pain!', '❤️', true],
        ['b', 'She gives them five toy cars', '🚗', false],
        ['c', 'She asks them to run a race', '🏃', false],
      ]),
      makeQ('l16-q4', '🧮', 'Math Wizard Deniz! Solve: Twenty plus fifteen equals... (20 + 15 = ?)', [
        ['a', 'Thirty-five! (35)', '3️⃣5️⃣', true],
        ['b', 'Ten! (10)', '🔟', false],
        ['c', 'One hundred! (100)', '💯', false],
      ]),
      makeQ('l16-q5', '🧮', 'Math Wizard Deniz! Solve: Thirty-four plus sixteen equals... (34 + 16 = ?)', [
        ['a', 'Fifty! (50)', '5️⃣0️⃣', true],
        ['b', 'Eight! (8)', '8️⃣', false],
        ['c', 'Forty! (40)', '4️⃣0️⃣', false],
      ]),
      makeQ('l16-q6', '📡', 'How fast do Dad’s 5G signals travel through the air to satellites?', [
        ['a', 'At the speed of light!', '⚡', true],
        ['b', 'Slower than a snail', '🐌', false],
        ['c', 'They take three years', '⏳', false],
      ]),
      makeQ('l16-q7', '👩‍🏫', 'Who is Deniz’s wonderful teacher in Class 1b at GGS Laurensberg?', [
        ['a', 'Frau Schwarz!', '👩‍🏫', true],
        ['b', 'Captain Hook', '🏴‍☠️', false],
        ['c', 'Woozle Goozle', '🐾', false],
      ]),
      makeQ('l16-q8', '👵', 'Who are Deniz’s beloved grandmas and grandpa?', [
        ['a', 'Grandma Nevin, Grandma Serpil, and Grandpa Ahmet!', '❤️', true],
        ['b', 'Three Lego wizards from Mars', '🧙‍♂️', false],
        ['c', 'Goldfish in the pond', '🐟', false],
      ]),
      makeQ('l16-q9', '🧠', 'Deniz can read, write, calculate two-digit math, and speak English! What is he?', [
        ['a', 'A brilliant Genius!', '🧠', true],
        ['b', 'A sleepy cat', '🐱', false],
        ['c', 'A broken pencil', '✏️', false],
      ]),
      makeQ('l16-q10', '👑', 'You completed the entire 16-Level Curriculum of Deniz’s English World!', [
        ['a', 'I am the Ultimate English & Lego Champion!', '🏆', true],
        ['b', 'I forgot my name!', '❓', false],
        ['c', 'Game over forever!', '❌', false],
      ]),
    ],
  },
];
