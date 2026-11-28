/**
 * Extended Spiral Curriculum Levels (Bölüm 2, 4, 6, 10, 12, 13, 14)
 * Expanding the 7-day plan into a relaxed 14-Level progressive journey.
 */

function makeQ(id, emoji, promptEn, promptTrOrOptions, maybeOptions, isReview = false) {
  const hasTr = typeof promptTrOrOptions === 'string';
  const promptTr = hasTr ? promptTrOrOptions : '';
  const options = hasTr ? maybeOptions : promptTrOrOptions;

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
    promptTr,
    isReview: Boolean(isReview),
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
      { en: 'I have got', tr: 'Benim ... var', de: 'Ich habe', emoji: '🚲', exampleEn: 'I have got a red bike!', exampleTr: 'Benim kırmızı bir bisikletim var!' },
      { en: 'My / Your', tr: 'Benim / Senin', de: 'Mein / Dein', emoji: '🎒', exampleEn: 'This is my book. That is your bag!', exampleTr: 'Bu benim kitabım. Şu senin çantan!' },
      { en: 'This is', tr: 'Bu (yakın)', de: 'Das hier ist', emoji: '👇', exampleEn: 'This is my blue Lego box!', exampleTr: 'Bu benim mavi Lego kutum!' },
      { en: 'That is', tr: 'Şu (uzak)', de: 'Das dort ist', emoji: '👉', exampleEn: 'That is your green backpack!', exampleTr: 'Şu senin yeşil sırt çantan!' },
      { en: "Have you got...?", tr: "Senin ... var mı?", de: "Hast du...?", emoji: '❓', exampleEn: "Have you got a red bike?", exampleTr: "Senin kırmızı bisikletin var mı?" },
      { en: "My favorite toy", tr: "En sevdiğim oyuncak", de: "Mein Lieblingsspielzeug", emoji: '🧸', exampleEn: "My favorite toy is a Lego rocket!", exampleTr: "En sevdiğim oyuncak bir Lego roketi!" },
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
      makeQ('l2-q1', '🚲', 'I ___ a red bike!', '"Benim kırmızı bir bisikletim var" nasıl söylenir?', [
        ['a', 'I have got a red bike!', '🚲', true],
        ['b', 'I am a red bike!', '🔴', false],
        ['c', 'I don’t like bike!', '🤢', false],
      ]),
      makeQ('l2-q2', '🧱', 'The blue brick is in your hand (yakın):', 'Elindeki (yakın) mavi Lego kutusunu nasıl gösterirsin?', [
        ['a', 'This is my blue Lego box!', '👇', true],
        ['b', 'That is a moon!', '🌙', false],
        ['c', 'I am hungry!', '🍕', false],
      ]),
      makeQ('l2-q3', '🎒', 'Point to your friend’s backpack far away (uzak):', 'Uzaktaki arkadaşının çantasını göstererek ne dersin?', [
        ['a', 'That is your green backpack!', '👉', true],
        ['b', 'This is my banana!', '🍌', false],
        ['c', 'Can I have water?', '💧', false],
      ]),
      makeQ('l2-q4', '🃏', 'Have you got a cool book? 👍 (Yes!)', 'Güzel bir kitabın var mı? Evet demek için:', [
        ['a', 'Yes, I have!', '📘', true],
        ['b', 'No, it is raining!', '🌧️', false],
        ['c', 'I am hungry!', '🍕', false],
      ]),
      makeQ('l2-q5', '📘', 'Which word means "Benim"?', 'İngilizce "Benim" kelimesi hangisidir?', [
        ['a', 'My', '🙋', true],
        ['b', 'Your', '👉', false],
        ['c', 'That', '🧱', false],
      ]),
      makeQ('l2-q6', '🎒', 'Which word means "Senin"?', 'İngilizce "Senin" kelimesi hangisidir?', [
        ['a', 'Your', '👉', true],
        ['b', 'My', '🙋', false],
        ['c', 'This', '👇', false],
      ]),
      makeQ('l2-q7', '🚀', 'Point to a rocket far in the sky (uzak):', 'Gökyüzündeki (uzak) roketi nasıl gösterirsin?', [
        ['a', 'That is a rocket!', '🚀', true],
        ['b', 'This is my shoe!', '👟', false],
        ['c', 'I am hungry!', '🍕', false],
      ]),
      makeQ('l2-q8', '🍎', '🔄 Tekrar: How do you say "Elmaları severim"?', '🔄 Tekrar (Bölüm 1): "Elmaları severim" hangisidir?', [
        ['a', 'I like apples!', '🍎', true],
        ['b', 'I don’t like apples!', '🤢', false],
        ['c', 'That is your apple!', '👉', false],
      ], true),
      makeQ('l2-q9', '🥦', '🔄 Tekrar: How do you say "Brokoliyi sevmem"?', '🔄 Tekrar (Bölüm 1): "Brokoliyi sevmem" hangisidir?', [
        ['a', 'I don’t like broccoli!', '🥦', true],
        ['b', 'I like broccoli!', '😋', false],
        ['c', 'I have got broccoli!', '🚲', false],
      ], true),
      makeQ('l2-q10', '💧', '🔄 Tekrar: How do you politely ask for water?', '🔄 Tekrar (Bölüm 1): Kibarca nasıl su istersin?', [
        ['a', 'Can I have water, please?', '💧', true],
        ['b', 'I am hungry!', '🍕', false],
        ['c', 'This is my bike!', '🚲', false],
      ], true),
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
      { en: 'My turn / Your turn', tr: 'Benim sıram / Senin sıran', de: 'Ich bin dran / Du bist dran', emoji: '🎲', exampleEn: 'It is my turn! Now it is your turn!', exampleTr: 'Benim sıram! Şimdi senin sıran!' },
      { en: 'Wait for me!', tr: 'Beni bekle!', de: 'Warte auf mich!', emoji: '⏳', exampleEn: 'Wait for me! I am coming!', exampleTr: 'Beni bekle! Geliyorum!' },
      { en: 'Let’s play!', tr: 'Haydi oynayalım!', de: 'Lass uns spielen!', emoji: '🎮', exampleEn: 'Ready, steady, go! Let’s play!', exampleTr: 'Hazır, başla! Haydi oynayalım!' },
      { en: 'Good game!', tr: 'İyi oyundu!', de: 'Gutes Spiel!', emoji: '🤝', exampleEn: 'Good game! That was super fun!', exampleTr: 'İyi oyundu! Çok eğlenceliydi!' },
      { en: "Ready, steady, go!", tr: "Hazır, dikkat, başla!", de: "Auf die Plätze, fertig, los!", emoji: '🏁', exampleEn: "Ready, steady, go! Run to the tree!", exampleTr: "Hazır, dikkat, başla! Ağaca koş!" },
      { en: "Can I play too?", tr: "Ben de oynayabilir miyim?", de: "Darf ich mitspielen?", emoji: '🙋', exampleEn: "Excuse me, can I play too?", exampleTr: "Affedersiniz, ben de oynayabilir miyim?" },
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
      makeQ('l4-q1', '🎲', 'Now it is your friend’s turn! What do you say?', 'Şimdi arkadaşının sırası! "Senin sıran" nasıl dersin?', [
        ['a', 'It is your turn!', '👉', true],
        ['b', 'I am sleeping now!', '😴', false],
        ['c', 'Where is the milk?', '🥛', false],
      ]),
      makeQ('l4-q2', '🏃', 'Your friends run ahead. How do you say "Beni bekle!"?', 'Arkadaşların önden koşuyor. "Beni bekle!" nasıl dersin?', [
        ['a', 'Wait for me!', '⏳', true],
        ['b', 'Good night!', '🌙', false],
        ['c', 'I have got apples!', '🍎', false],
      ]),
      makeQ('l4-q3', '🎮', 'You want to play a game together! What do you say?', 'Arkadaşına "Haydi oynayalım!" demek için hangisini seçersin?', [
        ['a', 'Let’s play!', '🎮', true],
        ['b', 'I don’t like it!', '🤢', false],
        ['c', 'I can’t fly!', '🕊️', false],
      ]),
      makeQ('l4-q4', '🚦', 'How do you start a fun race?', 'Yarışı başlatmak için ne söylersin? (Hazır, başla!)', [
        ['a', 'Ready, steady, go!', '🏁', true],
        ['b', 'Good night!', '🌙', false],
        ['c', 'It is slow!', '🐢', false],
      ]),
      makeQ('l4-q5', '🎲', 'Now it is YOUR turn to roll the dice! What do you say?', 'Zar atma sırası sende! "Benim sıram" nasıl dersin?', [
        ['a', 'It is my turn!', '🙋', true],
        ['b', 'Wait for me!', '⏳', false],
        ['c', 'Quiet, please!', '🤫', false],
      ]),
      makeQ('l4-q6', '🤝', 'The game ends! How do you say "İyi oyundu!"?', 'Oyun bitti! Arkadaşına "İyi oyundu!" nasıl dersin?', [
        ['a', 'Good game!', '🤝', true],
        ['b', 'I am hungry!', '🍕', false],
        ['c', 'That is a bus!', '🚌', false],
      ]),
      makeQ('l4-q7', '🧱', 'Invite your friend to build Lego together:', 'Arkadaşını "Haydi birlikte oynayalım!" diye nasıl çağırırsın?', [
        ['a', 'Let’s play together!', '🧱', true],
        ['b', 'Play quiet!', '🤫', false],
        ['c', 'This is broccoli!', '🥦', false],
      ]),
      makeQ('l4-q8', '🐆', '🔄 Tekrar: How does a cheetah run?', '🔄 Tekrar (Bölüm 3): Çita nasıl koşar? (Hızlı)', [
        ['a', 'Fast!', '⚡', true],
        ['b', 'Slow!', '🐢', false],
        ['c', 'My turn!', '🎲', false],
      ], true),
      makeQ('l4-q9', '🕊️', '🔄 Tekrar: Complete "I ___ fly like a bird!"', '🔄 Tekrar (Bölüm 3): "Kuş gibi uçamam!" hangisidir?', [
        ['a', 'I can’t fly!', '🕊️', true],
        ['b', 'I can fly!', '✈️', false],
        ['c', 'Let’s play!', '🎮', false],
      ], true),
      makeQ('l4-q10', '🚲', '🔄 Tekrar: Point to your bike in front of you:', '🔄 Tekrar (Bölüm 2): Yakınındaki bisikletini nasıl gösterirsin?', [
        ['a', 'This is my bike!', '🚲', true],
        ['b', 'That is your moon!', '🌙', false],
        ['c', 'Wait for me!', '⏳', false],
      ], true),
    ],
  },
  {
    id: 'level-6',
    dayNumber: 7,
    shortLabel: 'Bölüm 6',
    badge: '🔍 Keşif & Varlık Bildirme',
    title: 'There Is / There Are & How Many?',
    desc: 'Resimlere ve odana bakıp kaç tane nesne olduğunu İngilizce anlatmayı öğren!',
    grammarFocus: 'There is a ... / There are ... / How many ... are there?',
    vocabFocus: [
      { en: 'There is', tr: 'Var (1 tane)', de: 'Es gibt (1)', emoji: '1️⃣', exampleEn: 'There is one big rocket on the desk!', exampleTr: 'Masanın üstünde 1 büyük roket var!' },
      { en: 'There are', tr: 'Var (birden çok)', de: 'Es gibt (viele)', emoji: '🔢', exampleEn: 'There are three yellow bricks in the box!', exampleTr: 'Kutuda 3 sarı tuğla var!' },
      { en: 'How many?', tr: 'Kaç tane?', de: 'Wie viele?', emoji: '❓', exampleEn: 'How many stars are there? Five stars!', exampleTr: 'Kaç tane yıldız var? Beş yıldız!' },
      { en: 'Look at', tr: '... bak!', de: 'Schau dir ... an!', emoji: '👀', exampleEn: 'Look! There is a cute fox!', exampleTr: 'Bak! Şirin bir tilki var!' },
      { en: "Twenty", tr: "Yirmi (20)", de: "Zwanzig", emoji: '🔟', exampleEn: "Eighteen, nineteen, twenty — wow!", exampleTr: "On sekiz, on dokuz, yirmi — vay!" },
      { en: "A lot of", tr: "Bir sürü", de: "Viele", emoji: '🧱', exampleEn: "There are a lot of bricks on the floor!", exampleTr: "Yerde bir sürü tuğla var!" },
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
      makeQ('l6-q1', '🚀', 'Only ONE rocket! Which sentence is right?', 'Sadece 1 tane roket var! Hangisi doğru?', [
        ['a', 'There is one rocket!', '🚀', true],
        ['b', 'There are one rocket!', '🔢', false],
        ['c', 'I am hungry!', '🍕', false],
      ]),
      makeQ('l6-q2', '🧱', 'FIVE yellow bricks! Which sentence is right?', '5 tane (birden çok) sarı tuğla var! Hangisi doğru?', [
        ['a', 'There are five bricks!', '🧱', true],
        ['b', 'There is five bricks!', '1️⃣', false],
        ['c', 'Wait for me!', '⏳', false],
      ]),
      makeQ('l6-q3', '⭐', 'You want to ask "Kaç tane yıldız var?":', '"Kaç tane yıldız var?" nasıl sorulur?', [
        ['a', 'How many stars are there?', '⭐', true],
        ['b', 'Touch your nose!', '👃', false],
        ['c', 'I can’t fly!', '🕊️', false],
      ]),
      makeQ('l6-q4', '🦊', 'ONE fox in the forest:', 'Ormanda 1 tane tilki var:', [
        ['a', 'There is a fox!', '🦊', true],
        ['b', 'There are a fox!', '🌲', false],
        ['c', 'Good game!', '🤝', false],
      ]),
      makeQ('l6-q5', '🍎', 'Complete: "There ___ three red apples." (3 elma)', 'Cümleyi tamamla (3 elma, birden çok):', [
        ['a', 'are', '🍎', true],
        ['b', 'is', '1️⃣', false],
        ['c', 'am', '🙋', false],
      ]),
      makeQ('l6-q6', '🐳', 'Complete: "There ___ one big whale." (1 balina)', 'Cümleyi tamamla (1 balina, tekil):', [
        ['a', 'is', '🐳', true],
        ['b', 'are', '🔢', false],
        ['c', 'my', '🙋', false],
      ]),
      makeQ('l6-q7', '🌈', 'You see a rainbow! Say "Gökkuşağına bak!":', '"Gökkuşağına bak!" nasıl söylenir?', [
        ['a', 'Look at the rainbow!', '🌈', true],
        ['b', 'Freeze!', '❄️', false],
        ['c', 'Let’s play!', '🎮', false],
      ]),
      makeQ('l6-q8', '🦘', '🔄 Tekrar: "I am jumping!" means:', '🔄 Tekrar (Bölüm 5): "I am jumping!" ne demektir?', [
        ['a', 'Zıplıyorum!', '🦘', true],
        ['b', 'Uyuyorum!', '😴', false],
        ['c', 'Açım!', '🍕', false],
      ], true),
      makeQ('l6-q9', '🤝', '🔄 Tekrar: Match ends! How do you say "İyi oyundu!"?', '🔄 Tekrar (Bölüm 4): Oyun bitince "İyi oyundu!" hangisi?', [
        ['a', 'Good game!', '🤝', true],
        ['b', 'There is a ball!', '⚽', false],
        ['c', 'I don’t like it!', '🤢', false],
      ], true),
      makeQ('l6-q10', '🍎', '🔄 Tekrar: How do you say "Elmaları severim"?', '🔄 Tekrar (Bölüm 1): "Elmaları severim" hangisi?', [
        ['a', 'I like apples!', '🍎', true],
        ['b', 'How many apples?', '🔢', false],
        ['c', 'I can’t fly!', '🕊️', false],
      ], true),
    ],
  },
  {
    id: 'level-10',
    dayNumber: 17,
    shortLabel: 'Bölüm 10',
    badge: '🕵️ Dedektif Soruları',
    title: 'Who, Where, What, When, Whose?',
    desc: 'Kayıp eşyaları ve gizemleri çözmek için 5 büyük soru kelimesini öğren!',
    grammarFocus: 'Who? / Where? / What? / When? / Whose?',
    vocabFocus: [
      { en: 'Who?', tr: 'Kim?', de: 'Wer?', emoji: '🦸', exampleEn: 'Who is behind the door? It is Dad!', exampleTr: 'Kapının arkasında kim var? Babam!' },
      { en: 'Where?', tr: 'Nerede?', de: 'Wo?', emoji: '📍', exampleEn: 'Where is my blue key? Under the book!', exampleTr: 'Mavi anahtarım nerede? Kitabın altında!' },
      { en: 'When?', tr: 'Ne zaman?', de: 'Wann?', emoji: '⏰', exampleEn: 'When do we play piano? At four o’clock!', exampleTr: 'Ne zaman piyano çalarız? Saat dörtte!' },
      { en: 'Whose?', tr: 'Kimin?', de: 'Wessen?', emoji: '🔑', exampleEn: 'Whose backpack is this? It is mine!', exampleTr: 'Bu kimin sırt çantası? Benim!' },
      { en: "What?", tr: "Ne?", de: "Was?", emoji: '🤔', exampleEn: "What is in the box? A toy car!", exampleTr: "Kutuda ne var? Bir oyuncak araba!" },
      { en: "Why?", tr: "Neden?", de: "Warum?", emoji: '💡', exampleEn: "Why is the sky blue?", exampleTr: "Gökyüzü neden mavi?" },
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
      makeQ('l10-q1', '📍', 'You lost your blue key. Ask "Mavi anahtarım NEREDE?":', '"Mavi anahtarım NEREDE?" nasıl sorulur?', [
        ['a', 'Where is my blue key?', '🔑', true],
        ['b', 'Who is my blue key?', '🦸', false],
        ['c', 'When is my blue key?', '⏰', false],
      ]),
      makeQ('l10-q2', '🦸', 'Someone knocks on the door! Ask "KİM var?":', 'Kapıda KİM olduğunu nasıl sorarsın?', [
        ['a', 'Who is at the door?', '🚪', true],
        ['b', 'Where is yellow?', '🟡', false],
        ['c', 'Whose is seven?', '7️⃣', false],
      ]),
      makeQ('l10-q3', '🎒', 'You find a backpack. Ask "Bu KİMİN sırt çantası?":', '"Bu KİMİN çantası?" diye nasıl sorarsın?', [
        ['a', 'Whose backpack is this?', '🎒', true],
        ['b', 'When backpack is this?', '⏰', false],
        ['c', 'How many backpack?', '🔢', false],
      ]),
      makeQ('l10-q4', '⏰', 'Ask "NE ZAMAN piyano çalarız?":', '"NE ZAMAN piyano çalarız?" sorusu hangisidir?', [
        ['a', 'When do we play piano?', '🎹', true],
        ['b', 'Who is piano?', '❓', false],
        ['c', 'Whose is piano?', '🔑', false],
      ]),
      makeQ('l10-q5', '🔑', 'Which word means "Kim?"', 'İngilizce "Kim?" anlamına gelen kelime hangisidir?', [
        ['a', 'Who?', '🦸', true],
        ['b', 'Where?', '📍', false],
        ['c', 'When?', '⏰', false],
      ]),
      makeQ('l10-q6', '⏰', 'Which word means "Ne zaman?"', 'İngilizce "Ne zaman?" anlamına gelen kelime hangisidir?', [
        ['a', 'When?', '⏰', true],
        ['b', 'Whose?', '🔑', false],
        ['c', 'Who?', '🦸', false],
      ]),
      makeQ('l10-q7', '🎒', 'Answer: "Whose book is this?" (Benim!)', '"Bu kimin kitabı?" sorusuna "Benim!" cevabı:', [
        ['a', 'It is my book!', '📘', true],
        ['b', 'At four o’clock!', '⏰', false],
        ['c', 'Under the bed!', '🛏️', false],
      ]),
      makeQ('l10-q8', '🪥', '🔄 Tekrar: "Brush my teeth" means:', '🔄 Tekrar (Bölüm 9): "Brush my teeth" ne demektir?', [
        ['a', 'Dişlerimi fırçalarım!', '🪥', true],
        ['b', 'Mutfağa giderim!', '🍳', false],
        ['c', 'Yüzerim!', '🏊', false],
      ], true),
      makeQ('l10-q9', '⛵', '🔄 Tekrar: Why does a toy duck float?', '🔄 Tekrar (Bölüm 8): Oyuncak ördek neden suda yüzer?', [
        ['a', 'Because it is light!', '⛵', true],
        ['b', 'Because it is heavy!', '🪨', false],
        ['c', 'Whose duck is it?', '🔑', false],
      ], true),
      makeQ('l10-q10', '📦', '🔄 Tekrar: "In the box" means:', '🔄 Tekrar (Bölüm 7): "In the box" ne demektir?', [
        ['a', 'Kutunun içinde!', '📦', true],
        ['b', 'Kutunun altında!', '⬇️', false],
        ['c', 'Saat sekizde!', '🕗', false],
      ], true),
    ],
  },
  {
    id: 'level-12',
    dayNumber: 19,
    shortLabel: 'Bölüm 12',
    badge: '🏆 Rekorlar Dünyası',
    title: 'The Fastest, The Biggest, The Tallest!',
    desc: 'Dünyadaki ve uzaydaki en büyük, en hızlı, en uzun rekorları İngilizce söyle!',
    grammarFocus: 'The + -est (The fastest / The biggest / The tallest / The smartest)',
    vocabFocus: [
      { en: 'The fastest', tr: 'En hızlı', de: 'Am schnellsten', emoji: '🐆', exampleEn: 'The cheetah is the fastest animal!', exampleTr: 'Çita en hızlı hayvandır!' },
      { en: 'The biggest', tr: 'En büyük', de: 'Am größten', emoji: '🐳', exampleEn: 'The blue whale is the biggest animal!', exampleTr: 'Mavi balina en büyük hayvandır!' },
      { en: 'The tallest', tr: 'En uzun', de: 'Am höchsten', emoji: '🦒', exampleEn: 'The giraffe is the tallest animal!', exampleTr: 'Zürafa en uzun hayvandır!' },
      { en: 'The smartest', tr: 'En akıllı', de: 'Am klügsten', emoji: '🧠', exampleEn: 'The owl is the smartest bird!', exampleTr: 'Baykuş en akıllı kuştur!' },
      { en: "The strongest", tr: "En güçlü", de: "Der Stärkste", emoji: '💪', exampleEn: "The elephant is the strongest animal!", exampleTr: "Fil en güçlü hayvandır!" },
      { en: "The best", tr: "En iyi", de: "Der Beste", emoji: '🏆', exampleEn: "You are the best friend ever!", exampleTr: "Sen dünyanın en iyi arkadaşısın!" },
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
      makeQ('l12-q1', '🐆', 'The cheetah runs faster than everyone! It is:', 'Çita herkesten hızlı koşar! Hangisi "en hızlı" demektir?', [
        ['a', 'The fastest!', '🐆', true],
        ['b', 'The slowest!', '🐢', false],
        ['c', 'The smallest!', '🐜', false],
      ]),
      makeQ('l12-q2', '🐳', 'The blue whale is larger than every animal. It is:', 'Mavi balina tüm hayvanlardan büyüktür. Hangisi "en büyük"?', [
        ['a', 'The biggest animal!', '🐳', true],
        ['b', 'The shortest animal!', '🐛', false],
        ['c', 'The quietest car!', '🚗', false],
      ]),
      makeQ('l12-q3', '🦒', 'With its super long neck, the giraffe is:', 'Çok uzun boynuyla zürafa hangisidir? (En uzun)', [
        ['a', 'The tallest animal!', '🦒', true],
        ['b', 'The heaviest rock!', '🪨', false],
        ['c', 'The coldest ice!', '❄️', false],
      ]),
      makeQ('l12-q4', '🪐', 'Jupiter is huge! It is ___ planet in space.', 'Jüpiter çok büyüktür! "En büyük gezegen" nasıl tamamlanır?', [
        ['a', 'the biggest', '🪐', true],
        ['b', 'bigger than', '📏', false],
        ['c', 'yesterday', '⏳', false],
      ]),
      makeQ('l12-q5', '🚀', 'A rocket flies faster than a bike and a car. It is:', 'Roket bisiklet ve arabadan hızlıdır. Hangisi doğru?', [
        ['a', 'The fastest!', '🚀', true],
        ['b', 'The slowest!', '🐌', false],
        ['c', 'The wettest!', '💧', false],
      ]),
      makeQ('l12-q6', '🦉', 'That clever owl knows everything! It is:', 'Akıllı baykuş her şeyi biliyor! "En akıllı" hangisidir?', [
        ['a', 'The smartest!', '🦉', true],
        ['b', 'Under the bed!', '🛏️', false],
        ['c', 'Eight o’clock!', '🕗', false],
      ]),
      makeQ('l12-q7', '🧱', 'You built the highest Lego tower! It is:', 'En uzun Lego kulesini yaptın! Hangisi doğru?', [
        ['a', 'The tallest Lego tower!', '🧱', true],
        ['b', 'The smallest apple!', '🍎', false],
        ['c', 'I don’t like it!', '🤢', false],
      ]),
      makeQ('l12-q8', '🦁', '🔄 Tekrar: Compare a lion and a cat: A lion is...', '🔄 Tekrar (Bölüm 11): "Aslan kediden daha güçlüdür" hangisi?', [
        ['a', 'Stronger than a cat!', '💪', true],
        ['b', 'Smaller than a mouse!', '🐭', false],
        ['c', 'Whose cat is it?', '🔑', false],
      ], true),
      makeQ('l12-q9', '📍', '🔄 Tekrar: You lost your key. Ask "Anahtarım nerede?":', '🔄 Tekrar (Bölüm 10): "Anahtarım nerede?" nasıl sorulur?', [
        ['a', 'Where is my key?', '🔑', true],
        ['b', 'Who is my key?', '🦸', false],
        ['c', 'The fastest key!', '🐆', false],
      ], true),
      makeQ('l12-q10', '🧱', '🔄 Tekrar: "There are five bricks!" means:', '🔄 Tekrar (Bölüm 6): "There are five bricks!" ne demektir?', [
        ['a', 'Beş tane tuğla var!', '🧱', true],
        ['b', 'Bir tane tuğla var!', '1️⃣', false],
        ['c', 'Tuğlalar ağır!', '🪨', false],
      ], true),
    ],
  },
  {
    id: 'level-13',
    dayNumber: 31,
    shortLabel: 'Bölüm 13',
    badge: '⏳ Zaman Makinesi (Dün)',
    title: 'Yesterday I Played / Went / Saw / Ate!',
    desc: 'Dün neler yaptığını anlatmak için düzenli (-ed) ve en popüler düzensiz geçmiş zaman fiilleri!',
    grammarFocus: 'Yesterday, I played / watched / went / saw / ate / had',
    vocabFocus: [
      { en: 'Played', tr: 'Oynadım', de: 'Spielte', emoji: '🏀', exampleEn: 'Yesterday, I played basketball with friends!', exampleTr: 'Dün arkadaşlarımla basketbol oynadım!' },
      { en: 'Went', tr: 'Gittim', de: 'Ging', emoji: '🚌', exampleEn: 'Yesterday, I went to school!', exampleTr: 'Dün okula gittim!' },
      { en: 'Saw', tr: 'Gördüm', de: 'Sah', emoji: '👀', exampleEn: 'I saw a giant lion at the zoo!', exampleTr: 'Hayvanat bahçesinde dev bir aslan gördüm!' },
      { en: 'Ate', tr: 'Yedim', de: 'Aß', emoji: '🍕', exampleEn: 'We ate hot pizza and had fun!', exampleTr: 'Sıcak pizza yedik ve çok eğlendik!' },
      { en: "Had fun", tr: "Eğlendim", de: "Hatte Spaß", emoji: '🥳', exampleEn: "We had fun at the park yesterday!", exampleTr: "Dün parkta çok eğlendik!" },
      { en: "Built", tr: "İnşa ettim", de: "Baute", emoji: '🧱', exampleEn: "Yesterday I built a Lego castle!", exampleTr: "Dün bir Lego kalesi yaptım!" },
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
      makeQ('l13-q1', '🏀', 'How do you say "Dün basketbol oynadım"?', '"Dün basketbol oynadım" İngilizce nasıl söylenir?', [
        ['a', 'Yesterday, I played basketball!', '🏀', true],
        ['b', 'Yesterday, I playing basketball!', '❌', false],
        ['c', 'Tomorrow, I played!', '🚀', false],
      ]),
      makeQ('l13-q2', '🚌', 'Yesterday I ___ to school! (Gittim)', '"Dün okula GİTTİM" demek için hangisini seçersin?', [
        ['a', 'went', '🚌', true],
        ['b', 'goed', '❌', false],
        ['c', 'ate', '🍕', false],
      ]),
      makeQ('l13-q3', '🦁', 'Yesterday I ___ a giant lion! (Gördüm)', '"Dün dev bir aslan GÖRDÜM" nasıl tamamlanır?', [
        ['a', 'saw', '🦁', true],
        ['b', 'seed', '🌱', false],
        ['c', 'went', '🚌', false],
      ]),
      makeQ('l13-q4', '🍕', 'Yesterday we ___ hot pizza! (Yedik)', '"Dün sıcak pizza YEDİK" nasıl tamamlanır?', [
        ['a', 'ate', '🍕', true],
        ['b', 'eated', '❌', false],
        ['c', 'saw', '👀', false],
      ]),
      makeQ('l13-q5', '🎹', 'Yesterday I ___ a song on my piano! (Çaldım)', '"Dün piyanoda şarkı ÇALDIM" hangisidir?', [
        ['a', 'played', '🎹', true],
        ['b', 'ate', '🍕', false],
        ['c', 'went', '🚌', false],
      ]),
      makeQ('l13-q6', '⏳', 'Which word means "Dün"?', 'Geçmiş zaman anlatırken kullandığımız "Dün" kelimesi hangisidir?', [
        ['a', 'Yesterday', '⏳', true],
        ['b', 'Tomorrow', '🚀', false],
        ['c', 'Eight o’clock', '🕗', false],
      ]),
      makeQ('l13-q7', '🌳', 'Say "Dün parka gittim":', '"Dün parka gittim" cümlesi hangisidir?', [
        ['a', 'Yesterday, I went to the park!', '🌳', true],
        ['b', 'Yesterday, I ate the park!', '🍕', false],
        ['c', 'Yesterday, I under the park!', '⬇️', false],
      ]),
      makeQ('l13-q8', '🐳', '🔄 Tekrar: "The blue whale is the biggest!" means:', '🔄 Tekrar (Bölüm 12): Bu cümle ne demektir?', [
        ['a', 'Mavi balina en büyüğüdür!', '🐳', true],
        ['b', 'Mavi balina en küçüğüdür!', '🐜', false],
        ['c', 'Dün balina yedim!', '🍕', false],
      ], true),
      makeQ('l13-q9', '🐆', '🔄 Tekrar: "A cheetah is faster than a turtle!" means:', '🔄 Tekrar (Bölüm 11): Bu cümle ne demektir?', [
        ['a', 'Çita kaplumbağadan daha hızlıdır!', '🐆', true],
        ['b', 'Kaplumbağa en hızlısıdır!', '🐢', false],
        ['c', 'Çita suyun altındadır!', '💧', false],
      ], true),
      makeQ('l13-q10', '🙏', '🔄 Tekrar: How do you politely ask for milk?', '🔄 Tekrar (Bölüm 1): Kibarca nasıl süt istersin?', [
        ['a', 'Can I have milk, please?', '🥛', true],
        ['b', 'I went milk!', '🚌', false],
        ['c', 'I saw broccoli!', '🥦', false],
      ], true),
    ],
  },
  {
    id: 'level-14',
    dayNumber: 32,
    shortLabel: 'Bölüm 14',
    badge: '🚀 Planlar & Hayaller (Yarın)',
    title: 'Tomorrow I Will / I Am Going To & I Want To Be!',
    desc: 'Hafta sonu planlarını, yeni projelerini ve büyük hayallerini İngilizce anlat!',
    grammarFocus: 'Tomorrow I will ... / I am going to ... / I want to be a ...',
    vocabFocus: [
      { en: 'I am going to', tr: '... yapacağım', de: 'Ich werde', emoji: '🧱', exampleEn: 'Tomorrow, I am going to build a spaceship!', exampleTr: 'Yarın bir uzay gemisi yapacağım!' },
      { en: 'Tomorrow I will', tr: 'Yarın ... yapacağım', de: 'Morgen werde ich', emoji: '📅', exampleEn: 'Tomorrow I will swim in the pool!', exampleTr: 'Yarın havuzda yüzeceğim!' },
      { en: 'I want to be', tr: '... olmak istiyorum', de: 'Ich möchte ... werden', emoji: '👩‍🚀', exampleEn: 'I want to be a brave astronaut!', exampleTr: 'Cesur bir astronot olmak istiyorum!' },
      { en: 'Next weekend', tr: 'Gelecek hafta sonu', de: 'Nächstes Wochenende', emoji: '🌟', exampleEn: 'Next weekend I will play basketball!', exampleTr: 'Gelecek hafta sonu basketbol oynayacağım!' },
      { en: "Astronaut", tr: "Astronot", de: "Astronaut", emoji: '👩‍🚀', exampleEn: "One day I will be an astronaut!", exampleTr: "Bir gün astronot olacağım!" },
      { en: "Next summer", tr: "Gelecek yaz", de: "Nächsten Sommer", emoji: '☀️', exampleEn: "Next summer we will swim in the sea!", exampleTr: "Gelecek yaz denizde yüzeceğiz!" },
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
      makeQ('l14-q1', '🚀', 'Tomorrow plan: "Yarın bir roket yapacağım!"', '"Yarın bir roket yapacağım" cümlesi hangisidir?', [
        ['a', 'Tomorrow, I am going to build a rocket!', '🚀', true],
        ['b', 'Tomorrow, I ate yesterday!', '❌', false],
        ['c', 'Tomorrow, under the bed!', '🛏️', false],
      ]),
      makeQ('l14-q2', '🏊', 'On Saturday, I ___ swim in the pool! (Yüzeceğim)', '"Cumartesi havuzda yüzeceğim" için hangisi gelir?', [
        ['a', 'will', '🏊', true],
        ['b', 'ate', '🍕', false],
        ['c', 'saw', '👀', false],
      ]),
      makeQ('l14-q3', '👩‍🚀', 'How do you say "Astronot olmak istiyorum"?', '"Astronot olmak istiyorum" İngilizce nasıl söylenir?', [
        ['a', 'I want to be an astronaut!', '👩‍🚀', true],
        ['b', 'I want to be yesterday!', '⏳', false],
        ['c', 'It is behind the door!', '🚪', false],
      ]),
      makeQ('l14-q4', '🔬', 'How do you say "Bilim insanı olmak istiyorum"?', '"Bilim insanı olmak istiyorum" hangisidir?', [
        ['a', 'I want to be a scientist!', '🔬', true],
        ['b', 'Wait for me, pizza!', '🍕', false],
        ['c', 'The whale is biggest!', '🐳', false],
      ]),
      makeQ('l14-q5', '📅', 'Which word means "Yarın"?', 'Gelecek planları anlatırken kullandığımız "Yarın" kelimesi hangisidir?', [
        ['a', 'Tomorrow', '🌅', true],
        ['b', 'Yesterday', '⏳', false],
        ['c', 'Under', '⬇️', false],
      ]),
      makeQ('l14-q6', '🌟', 'Which phrase means "Gelecek hafta sonu"?', '"Gelecek hafta sonu" hangisidir?', [
        ['a', 'Next weekend', '🌟', true],
        ['b', 'Yesterday morning', '⏳', false],
        ['c', 'In the kitchen', '🍳', false],
      ]),
      makeQ('l14-q7', '🚲', 'Complete: "I am going ___ ride my bike!"', 'Cümleyi tamamla: "Bisikletimi süreceğim!"', [
        ['a', 'to', '🚲', true],
        ['b', 'under', '⬇️', false],
        ['c', 'than', '⚖️', false],
      ]),
      makeQ('l14-q8', '🍕', '🔄 Tekrar: Yesterday I ___ hot pizza! (Yedim)', '🔄 Tekrar (Bölüm 13): "Dün sıcak pizza yedim" hangisidir?', [
        ['a', 'ate', '🍕', true],
        ['b', 'will', '🚀', false],
        ['c', 'am', '🙋', false],
      ], true),
      makeQ('l14-q9', '🚌', '🔄 Tekrar: Yesterday I ___ to school! (Gittim)', '🔄 Tekrar (Bölüm 13): "Dün okula gittim" nasıl tamamlanır?', [
        ['a', 'went', '🚌', true],
        ['b', 'going', '🏃', false],
        ['c', 'tomorrow', '🌅', false],
      ], true),
      makeQ('l14-q10', '👑', '🔄 Tekrar: "The giraffe is the tallest!" means:', '🔄 Tekrar (Bölüm 12): Bu cümle ne demektir?', [
        ['a', 'Zürafa en uzunudur!', '🦒', true],
        ['b', 'Zürafa en küçüğüdür!', '🐜', false],
        ['c', 'Zürafa yüzer!', '⛵', false],
      ], true),
    ],
  },
  {
    id: 'level-15',
    dayNumber: 33,
    shortLabel: 'Bölüm 15',
    badge: '🌟 Deniz’in Dünyası & Favorileri',
    title: 'Deniz’s World: Aachen, Spaghetti & Nirvana Hotel',
    desc: 'Deniz’in en sevdiği yemekler, Aachen’daki evi, tatil oteli ve Lego ustalıkları tam cümlelerle!',
    grammarFocus: 'My favorite ... is ... / We stay at ... / I live in ...',
    vocabFocus: [
      { en: 'Spaghetti', tr: 'Spagetti', de: 'Spaghetti', emoji: '🍝', exampleEn: 'Spaghetti bolognese is my favorite food!', exampleTr: 'Spagetti bolonez en sevdiğim yemektir!' },
      { en: 'Pudding', tr: 'Muhallebi / Puding', de: 'Pudding', emoji: '🍮', exampleEn: 'Baking fluffy cake and sweet pudding is fun!', exampleTr: 'Yumuşacık kek ve tatlı puding pişirmek çok eğlenceli!' },
      { en: 'Aachen', tr: 'Aachen', de: 'Aachen', emoji: '⛲', exampleEn: 'We live in Aachen!', exampleTr: 'Biz Aachen’da yaşıyoruz!' },
      { en: 'Hotel', tr: 'Otel', de: 'Hotel', emoji: '🏨', exampleEn: 'We love staying at Nirvana Cosmopolitan Hotel!', exampleTr: 'Nirvana Cosmopolitan Otelinde kalmayı çok severiz!' },
      { en: "My favorite", tr: "En sevdiğim", de: "Mein Liebling", emoji: '❤️', exampleEn: "My favorite food is spaghetti!", exampleTr: "En sevdiğim yemek spagetti!" },
      { en: "Holiday", tr: "Tatil", de: "Urlaub", emoji: '🏖️', exampleEn: "We go on holiday in summer!", exampleTr: "Yazın tatile gideriz!" },
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
      makeQ('l15-q1', '🍝', 'What is Deniz’s favorite food?', 'Deniz’in en sevdiği yemek hangisidir?', [
        ['a', 'Spaghetti Bolognese!', '🍝', true],
        ['b', 'Cold broccoli soup', '🥦', false],
        ['c', 'Dry bread', '🍞', false],
      ]),
      makeQ('l15-q2', '⛲', 'Which city does Deniz live in?', 'Deniz ailesiyle hangi şehirde yaşıyor?', [
        ['a', 'Aachen', '🇩🇪', true],
        ['b', 'The North Pole', '❄️', false],
        ['c', 'A desert island', '🏝️', false],
      ]),
      makeQ('l15-q3', '🏨', 'Which hotel in Turkey does Deniz love?', 'Deniz’in Türkiye’de tatilde sevdiği otel hangisi?', [
        ['a', 'Nirvana Cosmopolitan Hotel', '🏨', true],
        ['b', 'A snow cave', '⛄', false],
        ['c', 'A submarine station', '🚤', false],
      ]),
      makeQ('l15-q4', '🍮', 'What sweet treats do we bake together?', 'Birlikte pişirdiğimiz tatlılar neler?', [
        ['a', 'Fluffy cake and warm chocolate pudding!', '🎂', true],
        ['b', 'Salty pickles', '🥒', false],
        ['c', 'Hot chili peppers', '🌶️', false],
      ]),
      makeQ('l15-q5', '🥈', 'What swimming medal is Deniz practicing for?', 'Deniz yüzmede hangi madalya için çalışıyor?', [
        ['a', 'The Silver Medal (Silberabzeichen)!', '🥈', true],
        ['b', 'A paper cup', '🥤', false],
        ['c', 'A rubber duck', '🦆', false],
      ]),
      makeQ('l15-q6', '🏀', 'Which sport does Deniz play on Wednesday?', 'Deniz Çarşamba günleri hangi sporu yapıyor?', [
        ['a', 'Basketball!', '🏀', true],
        ['b', 'Ice hockey', '🏒', false],
        ['c', 'Sleeping in bed', '🛏️', false],
      ]),
      makeQ('l15-q7', '📺', 'Which science TV shows does Deniz love?', 'Deniz hangi bilim TV programlarını seviyor?', [
        ['a', 'Checker Tobi & Woozle Goozle!', '📺', true],
        ['b', 'Silent boring news', '📰', false],
        ['c', 'Traffic camera video', '🚦', false],
      ]),
      makeQ('l15-q8', '👩‍🚀', '🔄 Tekrar: "I want to be an astronaut!" means:', '🔄 Tekrar (Bölüm 14): Bu cümle ne demektir?', [
        ['a', 'Astronot olmak istiyorum!', '👩‍🚀', true],
        ['b', 'Dün uzaya gittim!', '⏳', false],
        ['c', 'Spagetti severim!', '🍝', false],
      ], true),
      makeQ('l15-q9', '👀', '🔄 Tekrar: Yesterday I ___ a lion! (Gördüm)', '🔄 Tekrar (Bölüm 13): "Dün bir aslan gördüm" hangisi?', [
        ['a', 'saw', '🦁', true],
        ['b', 'ate', '🍕', false],
        ['c', 'tomorrow', '🌅', false],
      ], true),
      makeQ('l15-q10', '😋', '🔄 Tekrar: Say "Spagetti severim!":', '🔄 Tekrar (Bölüm 1): "Spagetti severim!" hangisidir?', [
        ['a', 'I like spaghetti!', '🍝', true],
        ['b', 'I don’t like spaghetti!', '🤢', false],
        ['c', 'Under the table!', '🪑', false],
      ], true),
    ],
  },
  {
    id: 'level-16',
    dayNumber: 34,
    shortLabel: 'Bölüm 16',
    badge: '🧮 Babamla Bilim & Matematik Dehası',
    title: 'Science with Dad, Hospital & Math Wizard',
    desc: 'Baba Dr. Ege ile 5G sinyalleri, Anne Melis ile hastane, iki basamaklı toplama ve bilim sırları!',
    grammarFocus: 'Plus / Minus / Equal / How does it work? / Because ...',
    vocabFocus: [
      { en: 'Engineer', tr: 'Mühendis', de: 'Ingenieur', emoji: '📡', exampleEn: 'Dad Dr. Ege sends 5G signals into space!', exampleTr: 'Babam Dr. Ege uzaya 5G sinyalleri gönderen bir mühendistir!' },
      { en: 'Hospital', tr: 'Hastane', de: 'Krankenhaus', emoji: '🏥', exampleEn: 'Mom Melis helps patients at the hospital!', exampleTr: 'Annem Melis hastanede hastalara yardım eder!' },
      { en: 'Plus / Equal', tr: 'Artı / Eşittir', de: 'Plus / Gleich', emoji: '➕', exampleEn: 'Twenty plus fifteen equals thirty-five!', exampleTr: 'Yirmi artı on beş eşittir otuz beş!' },
      { en: 'Genius', tr: 'Dahi', de: 'Genie', emoji: '🧠', exampleEn: 'Deniz is a math wizard and genius!', exampleTr: 'Deniz bir matematik sihirbazı ve dahidir!' },
      { en: "Minus", tr: "Eksi", de: "Minus", emoji: '➖', exampleEn: "Ten minus four equals six!", exampleTr: "On eksi dört eşittir altı!" },
      { en: "Scientist", tr: "Bilim insanı", de: "Wissenschaftler", emoji: '🔬', exampleEn: "A scientist asks many questions!", exampleTr: "Bir bilim insanı çok soru sorar!" },
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
      makeQ('l16-q1', '📡', 'What is Dad Dr. Ege’s job?', 'Baba Dr. Ege’nin mesleği nedir?', [
        ['a', 'He is a 5G Engineer and Scientist!', '📡', true],
        ['b', 'He sells balloons in the circus', '🎈', false],
        ['c', 'He sleeps in an office chair', '💺', false],
      ]),
      makeQ('l16-q2', '🏥', 'Where does Mom Melis work as a doctor?', 'Anne Melis doktor olarak nerede çalışıyor?', [
        ['a', 'SAH Eschweiler Hospital!', '🏥', true],
        ['b', 'At a toy factory', '🧸', false],
        ['c', 'On a ferry boat', '⛴️', false],
      ]),
      makeQ('l16-q3', '🧮', 'Solve: Twenty plus fifteen equals... (20 + 15 = ?)', 'Matematik: 20 artı 15 eşittir kaç?', [
        ['a', 'Thirty-five! (35)', '3️⃣5️⃣', true],
        ['b', 'Ten! (10)', '🔟', false],
        ['c', 'One hundred! (100)', '💯', false],
      ]),
      makeQ('l16-q4', '🧮', 'Solve: Thirty-four plus sixteen equals... (34 + 16 = ?)', 'Matematik: 34 artı 16 eşittir kaç?', [
        ['a', 'Fifty! (50)', '5️⃣0️⃣', true],
        ['b', 'Eight! (8)', '8️⃣', false],
        ['c', 'Forty! (40)', '4️⃣0️⃣', false],
      ]),
      makeQ('l16-q5', '📡', 'How fast do 5G signals travel?', '5G sinyalleri ne kadar hızlı gider?', [
        ['a', 'At the speed of light!', '⚡', true],
        ['b', 'Slower than a snail', '🐌', false],
        ['c', 'They take three years', '⏳', false],
      ]),
      makeQ('l16-q6', '➕', 'Which word means "Artı (+)" in English?', 'İngilizce "Artı (+)" anlamına gelen kelime hangisidir?', [
        ['a', 'Plus!', '➕', true],
        ['b', 'Equal!', '🟰', false],
        ['c', 'Hospital!', '🏥', false],
      ]),
      makeQ('l16-q7', '🧠', 'Deniz speaks English and solves math! He is:', 'Deniz hem İngilizce konuşuyor hem matematik çözüyor! O bir:', [
        ['a', 'A brilliant Genius!', '🧠', true],
        ['b', 'A sleepy cat', '🐱', false],
        ['c', 'A broken pencil', '✏️', false],
      ]),
      makeQ('l16-q8', '🍝', '🔄 Tekrar: What is Deniz’s favorite food?', '🔄 Tekrar (Bölüm 15): Deniz’in en sevdiği yemek nedir?', [
        ['a', 'Spaghetti Bolognese!', '🍝', true],
        ['b', 'Cold broccoli soup', '🥦', false],
        ['c', 'Dry bread', '🍞', false],
      ], true),
      makeQ('l16-q9', '📅', '🔄 Tekrar: "Tomorrow, I will swim!" means:', '🔄 Tekrar (Bölüm 14): Bu cümle ne demektir?', [
        ['a', 'Yarın yüzeceğim!', '🏊', true],
        ['b', 'Dün yüzdüm!', '⏳', false],
        ['c', 'Yüzemem!', '❌', false],
      ], true),
      makeQ('l16-q10', '👑', 'You completed all 16 Levels! What do you say?', '16 bölümü de bitirdin! Şampiyon olarak ne dersin?', [
        ['a', 'I am the Ultimate English & Lego Champion!', '🏆', true],
        ['b', 'I forgot my name!', '❓', false],
        ['c', 'Game over forever!', '❌', false],
      ]),
    ],
  },
];
