/**
 * Extended Progressive Curriculum Levels (Stops 5, 10-15, 20-30, 35-36)
 * Aligns with Cambridge Young Learners (Starters -> Movers -> Early Flyers)
 * with periodic Biome Review Pit-Stops and a Grand Finale Island Party!
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

export const EXTENDED_ISLAND_LEVELS = [
  // ================= STOP 5: BEACH PIT-STOP (Reviews Stops 1-4) =================
  {
    id: 'pitstop-1',
    dayNumber: 5,
    isPitStop: true,
    shortLabel: 'Pit-Stop 1',
    badge: '🏁 Sunny Beach Tekrar Durağı',
    title: 'Beach Pit-Stop: Food, Toys, Can & Friends',
    desc: 'İlk 4 durakta öğrendiklerini şarkı ve mini yarışmayla pekiştir!',
    grammarFocus: 'Review: I like / I have got / I can / My turn / Polite requests',
    vocabFocus: [
      { en: 'Please & Thank you', tr: 'Lütfen ve Teşekkürler', de: 'Bitte und Danke', emoji: '🙏', exampleEn: 'Water, please! Thank you!', exampleTr: 'Su lütfen! Teşekkürler!' },
      { en: 'I have got a toy', tr: 'Bir oyuncağım var', de: 'Ich habe ein Spielzeug', emoji: '🧸', exampleEn: 'I have got a fast toy car!', exampleTr: 'Hızlı bir oyuncak arabam var!' },
      { en: 'This is mine', tr: 'Bu benimki', de: 'Das gehört mir', emoji: '🎒', exampleEn: 'This is my blue backpack!', exampleTr: 'Bu benim mavi sırt çantam!' },
      { en: 'Yes, I can!', tr: 'Evet, yapabilirim!', de: 'Ja, ich kann!', emoji: '💪', exampleEn: 'Can you jump high? Yes, I can!', exampleTr: 'Yükseğe zıplayabilir misin? Evet!' },
      { en: 'Good game!', tr: 'Güzel oyundu!', de: 'Gutes Spiel!', emoji: '🤝', exampleEn: 'High five! That was a good game!', exampleTr: 'Çak bir beşlik! Güzel oyundu!' },
      { en: 'Ready, steady, go!', tr: 'Hazır, dikkat, başla!', de: 'Auf die Plätze, fertig, los!', emoji: '🏁', exampleEn: 'Ready, steady, go! Let’s run!', exampleTr: 'Hazır, dikkat, başla! Koşalım!' },
    ],
    tvRecommendation: {
      title: "If You're Happy! Beach Celebration (Super Simple Songs)",
      channel: 'Super Simple Songs',
      duration: '45 sn',
      topicTr: 'İlk adanın tüm kelimelerini kutlayan neşeli şarkı.',
      searchQuery: 'Super Simple Songs If Youre Happy',
    },
    items: [
      {
        id: 'ps1-i1',
        time: '5 dk Tekrar',
        title: 'Plaj Çantası Hızlı Tur 🏖️',
        category: 'game',
        desc: 'Odadan 3 nesne seç: "This is my book! I like apples! I can jump!"',
        phrasesEn: ['This is my book!', 'I like apples!', 'Good game!'],
      },
    ],
    questions: [
      makeQ('ps1-q1', '🍎', 'Which sentence politely asks for juice?', 'Kibarca meyve suyu istemek için hangisi doğru?', [
        ['a', 'Can I have juice, please?', '🧃', true],
        ['b', 'I can’t fly fast!', '🕊️', false],
        ['c', 'That is a giant whale!', '🐋', false],
      ], true),
      makeQ('ps1-q2', '🚲', 'You want to say: Benim kırmızı bir bisikletim var!', '"Benim kırmızı bisikletim var" nasıl dersin?', [
        ['a', 'I have got a red bike!', '🚲', true],
        ['b', 'It is your turn now!', '🎲', false],
        ['c', 'Touch your toes!', '🦶', false],
      ], true),
      makeQ('ps1-q3', '🐆', 'Can a turtle run fast? 🐢', 'Kaplumbağa hızlı koşabilir mi?', [
        ['a', 'No, it is slow!', '🐢', true],
        ['b', 'Yes, it flies!', '✈️', false],
        ['c', 'I like chocolate pudding!', '🍮', false],
      ], true),
      makeQ('ps1-q4', '🎮', 'A basketball match finishes. What is polite to say?', 'Maç bitince arkadaşına ne söylersin?', [
        ['a', 'Good game! High five!', '🤝', true],
        ['b', 'Wait for broccoli!', '🥦', false],
        ['c', 'Where is the kitchen?', '🍳', false],
      ], true),
      makeQ('ps1-q5', '👇', 'A brick is in your hand. A ball is across the park. Complete: ___ is my brick.', 'Elindeki tuğla için hangisini söylersin?', [
        ['a', 'This is my brick!', '👇', true],
        ['b', 'That is yesterday!', '⏳', false],
        ['c', 'He is in the hospital!', '🏥', false],
      ], true),
      makeQ('ps1-q6', '🥦', 'If you really dislike a snack, you say:', 'Bir yiyeceği sevmediğini nasıl söylersin?', [
        ['a', 'I don’t like it!', '🙅', true],
        ['b', 'Let’s play basketball!', '🏀', false],
        ['c', 'It is eight o’clock!', '🕗', false],
      ], true),
      makeQ('ps1-q7', '🎹', 'Can you play piano loudly? 🎹🔊', 'Piyanoyu yüksek sesle çalabiliyor musun?', [
        ['a', 'Yes, I can play loud!', '🔊', true],
        ['b', 'Wait for me, shoes!', '👟', false],
        ['c', 'My desk is hungry!', '🪵', false],
      ], true),
      makeQ('ps1-q8', '🏃', 'Your friend walks ahead of you. What do you shout?', 'Arkadaşın önden gidiyor, ne seslenirsin?', [
        ['a', 'Wait for me!', '⏳', true],
        ['b', 'Thank you, pizza!', '🍕', false],
        ['c', 'That is an elephant!', '🐘', false],
      ], true),
      makeQ('ps1-q9', '🙏', 'Someone gives you an apple. You say:', 'Biri sana elma verince ne dersin?', [
        ['a', 'Thank you!', '🙏', true],
        ['b', 'Don’t move!', '❄️', false],
        ['c', 'I can’t see!', '👀', false],
      ], true),
      makeQ('ps1-q10', '🏁', 'Before starting a race, kids shout:', 'Yarış başlarken ne bağırılır?', [
        ['a', 'Ready, steady, go!', '🏁', true],
        ['b', 'I have got apples!', '🍎', false],
        ['c', 'That is quiet!', '🤫', false],
      ], true),
    ],
  },

  // ================= STOP 10: WOODS PIT-STOP (Reviews Stops 6-9) =================
  {
    id: 'pitstop-2',
    dayNumber: 10,
    isPitStop: true,
    shortLabel: 'Pit-Stop 2',
    badge: '🏁 Whispering Woods Tekrar Durağı',
    title: 'Woods Pit-Stop: Actions, Counting & Science',
    desc: 'Orman durağında hareketleri, saymayı, yer edatlarını ve neden-sonucu pekiştir!',
    grammarFocus: 'Review: Present Continuous (-ing), There is/are, Prepositions, Why/Because',
    vocabFocus: [
      { en: 'Clap & Dance', tr: 'Alkışla ve Dans Et', de: 'Klatschen & Tanzen', emoji: '💃', exampleEn: 'I am clapping and dancing!', exampleTr: 'Alkışlıyorum ve dans ediyorum!' },
      { en: 'There are twenty', tr: 'Yirmi tane var', de: 'Es gibt zwanzig', emoji: '🔢', exampleEn: 'There are twenty stars in the sky!', exampleTr: 'Gökyüzünde yirmi yıldız var!' },
      { en: 'Under the bridge', tr: 'Köprünün altında', de: 'Unter der Brücke', emoji: '🌉', exampleEn: 'The little boat is under the bridge!', exampleTr: 'Küçük tekne köprünün altında!' },
      { en: 'Next to the tree', tr: 'Ağacın yanında', de: 'Neben dem Baum', emoji: '🌳', exampleEn: 'The fox is hiding next to the tree!', exampleTr: 'Tilki ağacın yanında saklanıyor!' },
      { en: 'Sink or Float?', tr: 'Batar mı Yüzer mi?', de: 'Sinken oder schwimmen?', emoji: '⛵', exampleEn: 'Does a wooden boat float?', exampleTr: 'Tahta tekne yüzer mi?' },
      { en: 'Why? Because...', tr: 'Neden? Çünkü...', de: 'Warum? Weil...', emoji: '💡', exampleEn: 'Why does it sink? Because it is heavy!', exampleTr: 'Neden batar? Çünkü ağır!' },
    ],
    tvRecommendation: {
      title: 'Head Shoulders Knees And Toes (Super Simple Songs)',
      channel: 'Super Simple Songs',
      duration: '45 sn',
      topicTr: 'Orman bölümündeki vücut ve hareket kelimeleri şarkısı.',
      searchQuery: 'Super Simple Songs Head Shoulders Knees And Toes',
    },
    items: [
      {
        id: 'ps2-i1',
        time: '5 dk Oyun',
        title: 'Don ve Bul Oyunu ❄️🔍',
        category: 'game',
        desc: 'Zıpla, sonra don ve etraftaki şeyleri say: "There are three books next to the sofa!"',
        phrasesEn: ['I am jumping!', 'There are three books!', 'Because it is light!'],
      },
    ],
    questions: [
      makeQ('ps2-q1', '🏃', 'Someone asks "What are you doing right now?" while you run:', 'Koşarken "Ne yapıyorsun?" sorusuna nasıl cevap verirsin?', [
        ['a', 'I am running fast!', '🏃', true],
        ['b', 'Yesterday I ate pizza!', '🍕', false],
        ['c', 'Wait for my bike!', '🚲', false],
      ], true),
      makeQ('ps2-q2', '🧸', 'You look at ONE red teddy bear on the bed:', 'Yatakta TEK bir kırmızı oyuncak ayı varsa:', [
        ['a', 'There is one teddy bear!', '🧸', true],
        ['b', 'There are one teddy bear!', '🐘', false],
        ['c', 'Touch your winter shoes!', '❄️', false],
      ], true),
      makeQ('ps2-q3', '📦', 'The puppy is hiding INSIDE the cardboard box. Where is it?', 'Köpekçik kutunun İÇİNDEYSE nerededir?', [
        ['a', 'It is in the box!', '📦', true],
        ['b', 'It is floating on Mars!', '🚀', false],
        ['c', 'I don’t like broccoli!', '🥦', false],
      ], true),
      makeQ('ps2-q4', '🪨', 'Why does a big metal anchor sink in water?', 'Büyük demir çapa suda neden batar?', [
        ['a', 'Because it is very heavy!', '🪨', true],
        ['b', 'Because it is a yellow duck!', '🦆', false],
        ['c', 'There are twelve bananas!', '🍌', false],
      ], true),
      makeQ('ps2-q5', '🎲', 'You ask about quantity: "How many Lego bricks are there?"', '"Kaç tane var?" sorusuna hangi cevap uygundur?', [
        ['a', 'There are fifteen bricks!', '🧱', true],
        ['b', 'It is under the chair!', '🪑', false],
        ['c', 'Clap your hands now!', '👏', false],
      ], true),
      makeQ('ps2-q6', '🛋️', 'Your cat sleeps right BESIDE the lamp. Which word fits?', 'Kedi lambanın YANINDA uyuyorsa:', [
        ['a', 'Next to the lamp!', '🛋️', true],
        ['b', 'Between the moon!', '🌙', false],
        ['c', 'Running behind heavy!', '🏃', false],
      ], true),
      makeQ('ps2-q7', '⛵', 'A light leaf drops onto a pond. What happens?', 'Hafif bir yaprak gölete düşerse ne olur?', [
        ['a', 'It floats on the water!', '🍃', true],
        ['b', 'It eats spaghetti!', '🍝', false],
        ['c', 'It jumps with toes!', '🦶', false],
      ], true),
      makeQ('ps2-q8', '❄️', 'In the Freeze Dance game, when the music stops:', 'Müzik durduğunda ne denir?', [
        ['a', 'Freeze! Don’t move!', '❄️', true],
        ['b', 'Count two thousand!', '🔢', false],
        ['c', 'Put on winter boots!', '🥾', false],
      ], true),
      makeQ('ps2-q9', '🔢', 'Which number comes right after nineteen (19)?', '19’dan hemen sonra hangi sayı gelir?', [
        ['a', 'Twenty!', '2️⃣0️⃣', true],
        ['b', 'Twelve!', '1️⃣2️⃣', false],
        ['c', 'Eight!', '8️⃣', false],
      ], true),
      makeQ('ps2-q10', '👃', '"Touch your nose!" tells you to:', '"Touch your nose!" komutu ne yapmanı söyler?', [
        ['a', 'Point to or touch your nose!', '👃', true],
        ['b', 'Run behind a sofa!', '🏃', false],
        ['c', 'Draw a big rocket!', '🚀', false],
      ], true),
    ],
  },

  // ================= STOP 11: MY FAMILY & FRIENDS =================
  {
    id: 'level-17',
    dayNumber: 11,
    shortLabel: 'Stop 11',
    badge: '👨‍👩‍👧‍👦 Ailem ve Arkadaşlarım',
    title: 'My Family & Best Friends',
    desc: 'Aile üyelerini ve arkadaşlarını "He is / She is / They are" kalıplarıyla tanıt!',
    grammarFocus: 'He is ... / She is ... / They are ... / Adjective descriptions',
    vocabFocus: [
      { en: 'Grandma & Grandpa', tr: 'Büyükanne ve Büyükbaba', de: 'Oma & Opa', emoji: '👵', exampleEn: 'My grandma and grandpa love stories!', exampleTr: 'Büyükannem ve büyükbabam hikayeleri sever!' },
      { en: 'Brother & Sister', tr: 'Erkek & Kız Kardeş', de: 'Bruder & Schwester', emoji: '🧒', exampleEn: 'Does your brother like Lego?', exampleTr: 'Kardeşin Lego sever mi?' },
      { en: 'Cousin', tr: 'Kuzen', de: 'Cousin / Cousine', emoji: '🙋', exampleEn: 'My cousin and I play soccer together!', exampleTr: 'Kuzenimle birlikte futbol oynarız!' },
      { en: 'She is kind', tr: 'O çok nazik / iyi kalpli', de: 'Sie ist nett', emoji: '💛', exampleEn: 'She is a very kind friend!', exampleTr: 'O çok iyi kalpli bir arkadaş!' },
      { en: 'He is funny', tr: 'O çok komik / eğlenceli', de: 'Er ist lustig', emoji: '😂', exampleEn: 'He tells jokes! He is funny!', exampleTr: 'Şakalar yapıyor! O çok komik!' },
      { en: 'They are helpful', tr: 'Onlar çok yardımsever', de: 'Sie sind hilfsbereit', emoji: '🤝', exampleEn: 'My parents are always helpful!', exampleTr: 'Anne babam her zaman yardımseverdir!' },
    ],
    tvRecommendation: {
      title: 'The People In My Family (Super Simple Songs)',
      channel: 'Super Simple Songs',
      duration: '47 sn',
      topicTr: 'Aile bireylerini öğreten neşeli İngilizce şarkı.',
      searchQuery: 'Super Simple Songs The People In My Family',
    },
    items: [
      {
        id: 'l17-i1',
        time: '5 dk Aile Albümü',
        title: 'Fotoğraftan Aileni Tanıt 📸👨‍👩‍👦',
        category: 'talk',
        desc: 'Bir aile fotoğrafına bakıp anlat: "He is my dad. He is helpful and funny!"',
        phrasesEn: ['He is funny!', 'She is kind!', 'They are my grandparents!'],
      },
    ],
    questions: [
      makeQ('l17-q1', '👵', 'Your mom’s or dad’s mother is your:', 'Annenin veya babanın annesi kimdir?', [
        ['a', 'Grandma!', '👵', true],
        ['b', 'Uncle’s shoe!', '👟', false],
        ['c', 'Bedroom lamp!', '🛏️', false],
      ]),
      makeQ('l17-q2', '😂', 'Leo makes everyone laugh with silly jokes. Complete: He is ___!', 'Herkesi güldüren biri için hangisi doğrudur?', [
        ['a', 'He is funny!', '😂', true],
        ['b', 'She is heavy!', '🪨', false],
        ['c', 'They is hungry!', '🍕', false],
      ]),
      makeQ('l17-q3', '🙋', 'Your aunt’s child is your:', 'Teyzenin veya amcanın çocuğu senin neyin olur?', [
        ['a', 'My cousin!', '🙋', true],
        ['b', 'My pencil!', '✏️', false],
        ['c', 'My kitchen!', '🍳', false],
      ]),
      makeQ('l17-q4', '💛', 'You talk about your kind friend Maya. Choose the right word:', 'Kız arkadaşın Maya’dan bahsederken hangisini kullanırsın?', [
        ['a', 'She is kind!', '💛', true],
        ['b', 'He is kind!', '👦', false],
        ['c', 'It are kind!', '🤖', false],
      ]),
      makeQ('l17-q5', '👨‍👩‍👦', 'You talk about Mom AND Dad together (two people):', 'Anne ve babadan birlikte bahsederken hangisi kullanılır?', [
        ['a', 'They are helpful!', '🤝', true],
        ['b', 'She is banana!', '🍌', false],
        ['c', 'He are tall!', '🦒', false],
      ]),
      makeQ('l17-q6', '👴', 'Who is Grandpa?', '"Grandpa" kimdir?', [
        ['a', 'Grandfather (Büyükbaba)', '👴', true],
        ['b', 'Little spider', '🕷️', false],
        ['c', 'School bus', '🚌', false],
      ]),
      makeQ('l17-q7', '🤝', 'A friend shares toys and helps you clean up. That friend is:', 'Oyuncaklarını paylaşan ve yardım eden arkadaş nasıldır?', [
        ['a', 'Kind and helpful!', '🤝', true],
        ['b', 'Rainy and snowy!', '❄️', false],
        ['c', 'Under the sofa!', '🛋️', false],
      ]),
      makeQ('l17-q8', '👦', 'Complete: This is my dad. ___ is an engineer!', 'Babandan bahsederken boşluğa ne gelir?', [
        ['a', 'He is an engineer!', '👷', true],
        ['b', 'She is an engineer!', '👩', false],
        ['c', 'They is an engineer!', '👥', false],
      ]),
      makeQ('l17-q9', '💬', '🔄 Tekrar: How do you ask "Top nerede?"', '🔄 Tekrar: "Top nerede?" sorusu hangisidir?', [
        ['a', 'Where is the ball?', '⚽', true],
        ['b', 'Who are apples?', '🍎', false],
        ['c', 'Can I fly?', '✈️', false],
      ], true),
      makeQ('l17-q10', '🎮', '🔄 Tekrar: Say "Şimdi senin sıran!" in English:', '🔄 Tekrar: "Senin sıran" nasıl söylenir?', [
        ['a', 'It is your turn!', '🎲', true],
        ['b', 'It is sinking!', '⚓', false],
        ['c', 'My cousin is twelve!', '1️⃣2️⃣', false],
      ], true),
    ],
  },

  // ================= STOP 12: AROUND MY HOUSE =================
  {
    id: 'level-18',
    dayNumber: 12,
    shortLabel: 'Stop 12',
    badge: '🏡 Evimizin Odaları',
    title: 'Around My House & Furniture',
    desc: 'Evin odalarını ve eşyaların nerede olduğunu kolayca anlatmayı öğren!',
    grammarFocus: 'Rooms of the house + Where are you? I am in the...',
    vocabFocus: [
      { en: 'Living room', tr: 'Oturma odası', de: 'Wohnzimmer', emoji: '🛋️', exampleEn: 'We play board games in the living room!', exampleTr: 'Oturma odasında kutu oyunu oynarız!' },
      { en: 'Bedroom', tr: 'Yatak odası', de: 'Schlafzimmer', emoji: '🛏️', exampleEn: 'My Lego shelf is in my bedroom!', exampleTr: 'Lego rafım yatak odamda!' },
      { en: 'Bathroom', tr: 'Banyo', de: 'Badezimmer', emoji: '🛁', exampleEn: 'I wash my hands in the bathroom!', exampleTr: 'Ellerimi banyoda yıkarım!' },
      { en: 'Garden', tr: 'Bahçe', de: 'Garten', emoji: '🌷', exampleEn: 'We play soccer in the sunny garden!', exampleTr: 'Güneşli bahçede futbol oynarız!' },
      { en: 'Stairs', tr: 'Merdiven', de: 'Treppe', emoji: '🪜', exampleEn: 'Walk carefully up the stairs!', exampleTr: 'Merdivenlerden dikkatlice çık!' },
      { en: 'Balcony', tr: 'Balkon', de: 'Balkon', emoji: '🪴', exampleEn: 'There are red flowers on the balcony!', exampleTr: 'Balkonda kırmızı çiçekler var!' },
    ],
    tvRecommendation: {
      title: 'In The Kitchen: Rooms Around The House (Noodle & Pals)',
      channel: 'Noodle & Pals',
      duration: '47 sn',
      topicTr: 'Mutfak, yatak odası, banyo ve oturma odası kelimeleri şarkısı.',
      searchQuery: 'Noodle and Pals In The Kitchen Rooms Around The House',
    },
    items: [
      {
        id: 'l18-i1',
        time: '5 dk Ev Turu',
        title: 'Evde Oda Avı 🏠🏃',
        category: 'game',
        desc: 'Odaya adım at ve İngilizce söyle: "I am in the kitchen! There is a fridge!"',
        phrasesEn: ['I am in the bedroom!', 'Look at the garden!', 'Where is the bathroom?'],
      },
    ],
    questions: [
      makeQ('l18-q1', '🛏️', 'Where do you sleep at night on your pillow?', 'Gece yatağında uyuduğun oda hangisidir?', [
        ['a', 'In the bedroom!', '🛏️', true],
        ['b', 'In the fire station!', '🚒', false],
        ['c', 'In the ocean!', '🌊', false],
      ]),
      makeQ('l18-q2', '🛁', 'You need to wash your hands with soap and take a shower. Go to the:', 'Ellerini yıkamak ve duş almak için nereye gidersin?', [
        ['a', 'The bathroom!', '🛁', true],
        ['b', 'The backyard tree!', '🌳', false],
        ['c', 'The garage wheel!', '🛞', false],
      ]),
      makeQ('l18-q3', '🛋️', 'The family watches a movie together on the big sofa. They are in the:', 'Ailenin büyük koltukta oturduğu oda neresidir?', [
        ['a', 'The living room!', '🛋️', true],
        ['b', 'The refrigerator!', '🧊', false],
        ['c', 'The airplane!', '✈️', false],
      ]),
      makeQ('l18-q4', '🌷', 'Where do green trees and colorful flowers grow outside the house?', 'Evin dışındaki yeşil ağaçlı ve çiçekli alan neresidir?', [
        ['a', 'In the garden!', '🌷', true],
        ['b', 'On the blanket!', '🛌', false],
        ['c', 'Inside the toaster!', '🍞', false],
      ]),
      makeQ('l18-q5', '🍳', 'Dad is cooking warm spaghetti bolognese. Which room is he in?', 'Baba spagetti pişiriyorsa hangi odadadır?', [
        ['a', 'In the kitchen!', '🍳', true],
        ['b', 'On the balcony ice!', '🧊', false],
        ['c', 'Behind the umbrella!', '☂️', false],
      ]),
      makeQ('l18-q6', '🪜', 'To go from the downstairs hall to the upstairs bedroom, you climb the:', 'Üst kata çıkmak için neyi çıkarsın?', [
        ['a', 'The stairs!', '🪜', true],
        ['b', 'The sandwiches!', '🥪', false],
        ['c', 'The planets!', '🪐', false],
      ]),
      makeQ('l18-q7', '🪴', 'Look! You step outside from an upstairs window onto the:', 'Üst kattan dışarı açılan çiçekli küçük alan hangisidir?', [
        ['a', 'The balcony!', '🪴', true],
        ['b', 'The swimming pool shark!', '🦈', false],
        ['c', 'The yellow pencil!', '✏️', false],
      ]),
      makeQ('l18-q8', '🗺️', 'Dad calls: "Deniz, where are you?" You are reading in bed:', 'Yatakta kitap okurken "Neredesin?" sorusuna ne dersin?', [
        ['a', 'I am in my bedroom!', '🛏️', true],
        ['b', 'Because it is sunny!', '☀️', false],
        ['c', 'Tomorrow I danced!', '💃', false],
      ]),
      makeQ('l18-q9', '👵', '🔄 Tekrar: Who is funny and tells great stories? Your...', '🔄 Tekrar (Bölüm 11): Aileden biri:', [
        ['a', 'My grandpa!', '👴', true],
        ['b', 'My staircase!', '🪜', false],
        ['c', 'My broccoli!', '🥦', false],
      ], true),
      makeQ('l18-q10', '📦', '🔄 Tekrar: There are three books ___ the table.', '🔄 Tekrar: Masanın ÜZERİNDE nasıl söylenir?', [
        ['a', 'On the table!', '🪵', true],
        ['b', 'Funny the table!', '😂', false],
        ['c', 'Fast the table!', '⚡', false],
      ], true),
    ],
  },

  // ================= STOP 13: WEATHER & FOUR SEASONS =================
  {
    id: 'level-19',
    dayNumber: 13,
    shortLabel: 'Stop 13',
    badge: '🌦️ Hava Durumu & Mevsimler',
    title: 'Weather & The Four Seasons',
    desc: 'Hava durumunu sormayı ve dört mevsimi canlı örneklerle öğren!',
    grammarFocus: 'How is the weather? / It is sunny, rainy, windy, snowy / Seasons',
    vocabFocus: [
      { en: 'How is the weather?', tr: 'Hava nasıl?', de: 'Wie ist das Wetter?', emoji: '🌤️', exampleEn: 'Look outside! How is the weather today?', exampleTr: 'Dışarı bak! Bugün hava nasıl?' },
      { en: 'Windy & Cloudy', tr: 'Rüzgarlı ve Bulutlu', de: 'Windig & Bewölkt', emoji: '💨', exampleEn: 'It is windy and cloudy today!', exampleTr: 'Bugün hava rüzgarlı ve bulutlu!' },
      { en: 'Rainbow', tr: 'Gökkuşağı', de: 'Regenbogen', emoji: '🌈', exampleEn: 'Look! A bright rainbow after the rain!', exampleTr: 'Bak! Yağmurdan sonra parlak bir gökkuşağı!' },
      { en: 'Spring & Summer', tr: 'İlkbahar ve Yaz', de: 'Frühling & Sommer', emoji: '☀️', exampleEn: 'We swim in the sea in hot summer!', exampleTr: 'Sıcak yazın denizde yüzeriz!' },
      { en: 'Autumn', tr: 'Sonbahar', de: 'Herbst', emoji: '🍂', exampleEn: 'Orange leaves fall in autumn!', exampleTr: 'Sonbaharda turuncu yapraklar dökülür!' },
      { en: 'Winter', tr: 'Kış', de: 'Winter', emoji: '⛄', exampleEn: 'We build a snowman in cold winter!', exampleTr: 'Soğuk kışta kardan adam yaparız!' },
    ],
    tvRecommendation: {
      title: 'Weather Song: Sun, Rain, Wind & Snow (The Singing Walrus)',
      channel: 'The Singing Walrus',
      duration: '47 sn',
      topicTr: 'Güneş, yağmur, rüzgar ve kar hava durumlarını öğreten şarkı.',
      searchQuery: 'The Singing Walrus Weather Song for kids',
    },
    items: [
      {
        id: 'l19-i1',
        time: '5 dk Pencere Raporu',
        title: 'Hava Durumu Spikeri 🎙️🌦️',
        category: 'mission',
        desc: 'Pencereye bakıp spiker ol: "Hello! Today it is sunny and warm!"',
        phrasesEn: ['How is the weather?', 'It is windy today!', 'Look at the rainbow!'],
      },
    ],
    questions: [
      makeQ('l19-q1', '🌬️', 'Trees are bending and kites fly high in the sky. It is:', 'Ağaçlar sallanıyor ve uçurtmalar uçuyorsa hava nasıldır?', [
        ['a', 'It is windy!', '💨', true],
        ['b', 'It is spaghetti!', '🍝', false],
        ['c', 'It is twelve years old!', '🎂', false],
      ]),
      makeQ('l19-q2', '🌈', 'Sunshine meets falling rain drops and paints seven colors:', 'Yağmur ve güneş birleşince gökyüzünde ne çıkar?', [
        ['a', 'A colorful rainbow!', '🌈', true],
        ['b', 'A heavy stone!', '🪨', false],
        ['c', 'A kitchen sink!', '🚰', false],
      ]),
      makeQ('l19-q3', '🍂', 'Orange and brown leaves fall down from trees during:', 'Yaprakların sararıp döküldüğü mevsim hangisidir?', [
        ['a', 'Autumn!', '🍂', true],
        ['b', 'Hospital!', '🏥', false],
        ['c', 'Bedroom!', '🛏️', false],
      ]),
      makeQ('l19-q4', '⛄', 'Which season has cold snow and snowmen?', 'Kardan adam yaptığımız soğuk mevsim hangisidir?', [
        ['a', 'Winter!', '⛄', true],
        ['b', 'Summer!', '🏖️', false],
        ['c', 'Cousin!', '🙋', false],
      ]),
      makeQ('l19-q5', '🌸', 'After winter ends, new flowers bloom in:', 'Kıştan sonra çiçeklerin açtığı mevsim hangisidir?', [
        ['a', 'Spring!', '🌸', true],
        ['b', 'Clouds!', '☁️', false],
        ['c', 'Stairs!', '🪜', false],
      ]),
      makeQ('l19-q6', '🏖️', 'School closes for long sunny beach holidays in:', 'Sıcak tatil yaptığımız yaz mevsimi hangisidir?', [
        ['a', 'Summer!', '☀️', true],
        ['b', 'Snowman!', '⛄', false],
        ['c', 'Tuesday kitchen!', '🍳', false],
      ]),
      makeQ('l19-q7', '☁️', 'The sky is full of grey clouds. No sun is shining. It is:', 'Gökyüzü bulutlarla kaplıysa hava nasıldır?', [
        ['a', 'It is cloudy!', '☁️', true],
        ['b', 'It is floating!', '⛵', false],
        ['c', 'It is yummy pizza!', '🍕', false],
      ]),
      makeQ('l19-q8', '🌤️', 'How do you ask your friend about the weather?', '"Bugün hava nasıl?" diye nasıl sorarsın?', [
        ['a', 'How is the weather today?', '🌤️', true],
        ['b', 'Whose broccoli is it?', '🥦', false],
        ['c', 'When did we swim?', '🏊', false],
      ]),
      makeQ('l19-q9', '🛁', '🔄 Tekrar: Where is the bathtub and mirror?', '🔄 Tekrar (Bölüm 12): Küvet hangi odadadır?', [
        ['a', 'In the bathroom!', '🛁', true],
        ['b', 'In the rainbow!', '🌈', false],
        ['c', 'In the cheetah!', '🐆', false],
      ], true),
      makeQ('l19-q10', '😂', '🔄 Tekrar: Complete: My sister makes me laugh! ___ is funny!', '🔄 Tekrar (Bölüm 11): Kız kardeşin için:', [
        ['a', 'She is funny!', '😂', true],
        ['b', 'He are funny!', '👦', false],
        ['c', 'It does snowy!', '❄️', false],
      ], true),
    ],
  },

  // ================= STOP 14: GET DRESSED! CLOTHES =================
  {
    id: 'level-20',
    dayNumber: 14,
    shortLabel: 'Stop 14',
    badge: '🧥 Kıyafetler & Giyinme',
    title: 'Get Dressed! What Are You Wearing?',
    desc: 'Hava durumuna göre kıyafet seçmeyi ve "I am wearing..." kalıbını öğren!',
    grammarFocus: 'Put on your ... / I am wearing a ... / Clothes by weather',
    vocabFocus: [
      { en: 'I am wearing', tr: 'Şu an ... giyiyorum', de: 'Ich trage gerade', emoji: '👕', exampleEn: 'I am wearing a red Lego t-shirt!', exampleTr: 'Kırmızı bir Lego tişörtü giyiyorum!' },
      { en: 'Jacket & Scarf', tr: 'Mont ve Atkı', de: 'Jacke & Schal', emoji: '🧥', exampleEn: 'Put on your warm jacket and scarf!', exampleTr: 'Sıcak montunu ve atkını giy!' },
      { en: 'Sneakers', tr: 'Spor Ayakkabı', de: 'Turnschuhe', emoji: '👟', exampleEn: 'I wear sneakers for basketball!', exampleTr: 'Basketbol için spor ayakkabı giyerim!' },
      { en: 'Raincoat & Boots', tr: 'Yağmurluk ve Çizme', de: 'Regenmantel & Stiefel', emoji: '🥾', exampleEn: 'Wear your raincoat on rainy days!', exampleTr: 'Yağmurlu günlerde yağmurluğunu giy!' },
      { en: 'Sunglasses & Cap', tr: 'Güneş Gözlüğü ve Şapka', de: 'Sonnenbrille & Kappe', emoji: '🕶️', exampleEn: 'Put on sunglasses when it is sunny!', exampleTr: 'Hava güneşliyken güneş gözlüğü tak!' },
      { en: 'Pajamas', tr: 'Pijama', de: 'Schlafanzug', emoji: '🛌', exampleEn: 'I put on cozy pajamas at bedtime!', exampleTr: 'Uyku saatinde rahat pijamamı giyerim!' },
    ],
    tvRecommendation: {
      title: 'Put On Your Shoes (Super Simple Songs)',
      channel: 'Super Simple Songs',
      duration: '47 sn',
      topicTr: 'Mont, şapka, atkı ve ayakkabı giymeyi öğreten eğlenceli şarkı.',
      searchQuery: 'Super Simple Songs Put On Your Shoes',
    },
    items: [
      {
        id: 'l20-i1',
        time: '5 dk Defile',
        title: 'Hava Durumuna Göre Giyin! 🧥🕶️',
        category: 'game',
        desc: 'Ebeveyn "It is snowy!" der, çocuk doğru kıyafeti söyleyip taklidini yapar: "I am wearing a scarf!"',
        phrasesEn: ['Put on your jacket!', 'I am wearing sneakers!', 'It is sunny, wear sunglasses!'],
      },
    ],
    questions: [
      makeQ('l20-q1', '🌧️', 'It is pouring rain outside! What should you put on?', 'Dışarıda sağanak yağmur var! Ne giymelisin?', [
        ['a', 'A raincoat and rubber boots!', '🥾', true],
        ['b', 'Pajamas and a pillow!', '🛌', false],
        ['c', 'Chocolate pudding!', '🍮', false],
      ]),
      makeQ('l20-q2', '☀️', 'The sun is very bright at the beach. Protect your eyes with:', 'Plajda güneşten gözlerini neyle korursun?', [
        ['a', 'Sunglasses and a cap!', '🕶️', true],
        ['b', 'Winter snow boots!', '🥾', false],
        ['c', 'A kitchen spoon!', '🥄', false],
      ]),
      makeQ('l20-q3', '🏀', 'Deniz is running onto the basketball court. On his feet he wears:', 'Basketbol sahasında ayaklarına ne giyersin?', [
        ['a', 'Cool sneakers!', '👟', true],
        ['b', 'A raincoat hat!', '👒', false],
        ['c', 'A garden bench!', '🪑', false],
      ]),
      makeQ('l20-q4', '🧣', 'It is freezing snowy winter! Wrap something warm around your neck:', 'Soğuk kışta boynuna ne sararsın?', [
        ['a', 'A warm scarf!', '🧣', true],
        ['b', 'A floating boat!', '⛵', false],
        ['c', 'Red spaghetti!', '🍝', false],
      ]),
      makeQ('l20-q5', '🛌', 'Before going to sleep in your bedroom, you change into:', 'Yatmadan önce üzerine ne giyersin?', [
        ['a', 'Cozy pajamas!', '🛌', true],
        ['b', 'A fire station helmet!', '🚒', false],
        ['c', 'Heavy snow skates!', '⛸️', false],
      ]),
      makeQ('l20-q6', '👕', 'Leo asks: "What are you wearing today?" Choose the full sentence:', '"Bugün ne giyiyorsun?" sorusuna tam cümle:', [
        ['a', 'I am wearing a blue jacket!', '🧥', true],
        ['b', 'I am sleeping a sneaker!', '👟', false],
        ['c', 'Because my hat floats!', '🎩', false],
      ]),
      makeQ('l20-q7', '🧥', 'Mom says: "___ your coat! We are going out!"', 'Anne "Montunu giy!" demek için hangi ifadeyi kullanır?', [
        ['a', 'Put on your coat!', '🧥', true],
        ['b', 'Touch your stairs!', '🪜', false],
        ['c', 'Eat your sunglasses!', '🕶️', false],
      ]),
      makeQ('l20-q8', '🧢', 'Which item goes on your head?', 'Başımıza hangisini takarız?', [
        ['a', 'A baseball cap!', '🧢', true],
        ['b', 'Basketball shoes!', '👟', false],
        ['c', 'Living room sofa!', '🛋️', false],
      ]),
      makeQ('l20-q9', '🍂', '🔄 Tekrar: Which season comes right after summer when leaves fall?', '🔄 Tekrar (Bölüm 13): Yazdan sonra yaprakların döküldüğü mevsim:', [
        ['a', 'Autumn!', '🍂', true],
        ['b', 'Pajamas!', '🛌', false],
        ['c', 'Wednesday!', '📅', false],
      ], true),
      makeQ('l20-q10', '🛋️', '🔄 Tekrar: We watch TV on the sofa in the...', '🔄 Tekrar (Bölüm 12): Koltuk hangi odada olur?', [
        ['a', 'Living room!', '🛋️', true],
        ['b', 'Rainbow garden!', '🌈', false],
        ['c', 'Raincoat!', '🧥', false],
      ], true),
    ],
  },

  // ================= STOP 15: VILLAGE PIT-STOP (Reviews Stops 11-14) =================
  {
    id: 'pitstop-3',
    dayNumber: 15,
    isPitStop: true,
    shortLabel: 'Pit-Stop 3',
    badge: '🏁 Cozy Village Tekrar Durağı',
    title: 'Village Pit-Stop: Family, House, Weather & Clothes',
    desc: 'Aile, ev odaları, hava durumu ve kıyafetler köyün büyük yarışında birleşiyor!',
    grammarFocus: 'Review: Family + Rooms + Seasons + Clothes (He/She is wearing...)',
    vocabFocus: [
      { en: 'In the living room', tr: 'Oturma odasında', de: 'Im Wohnzimmer', emoji: '🛋️', exampleEn: 'Grandpa is reading in the living room!', exampleTr: 'Büyükbaba oturma odasında kitap okuyor!' },
      { en: 'She is wearing a hat', tr: 'O şapka giyiyor', de: 'Sie trägt einen Hut', emoji: '👒', exampleEn: 'She is wearing a yellow sun hat!', exampleTr: 'Sarı bir güneş şapkası takıyor!' },
      { en: 'Sunny spring day', tr: 'Güneşli bahar günü', de: 'Sonniger Frühlingstag', emoji: '🌸', exampleEn: 'What a bright sunny spring day!', exampleTr: 'Ne güzel güneşli bir bahar günü!' },
      { en: 'Raincoat and umbrella', tr: 'Yağmurluk ve şemsiye', de: 'Regenmantel und Schirm', emoji: '☂️', exampleEn: 'Take your raincoat and umbrella!', exampleTr: 'Yağmurluğunu ve şemsiyeni al!' },
      { en: 'My kind family', tr: 'İyi kalpli ailem', de: 'Meine liebe Familie', emoji: '👨‍👩‍👧‍👦', exampleEn: 'I love my kind and funny family!', exampleTr: 'İyi kalpli ve komik ailemi seviyorum!' },
      { en: 'Warm winter coat', tr: 'Sıcak kışlık mont', de: 'Warmer Wintermantel', emoji: '🧥', exampleEn: 'Wear a warm winter coat outside!', exampleTr: 'Dışarıda sıcak kışlık mont giy!' },
    ],
    tvRecommendation: {
      title: "How's The Weather? Village Review Song (Super Simple Songs)",
      channel: 'Super Simple Songs',
      duration: '45 sn',
      topicTr: 'Hava durumu ve kıyafet seçimi köy tekrar şarkısı.',
      searchQuery: 'Super Simple Songs Hows The Weather',
    },
    items: [
      {
        id: 'ps3-i1',
        time: '5 dk Köy Oyunu',
        title: 'Kim Nerede Ne Giyiyor? 👨‍👩‍👧‍👦🧥',
        category: 'talk',
        desc: 'Bir cümlede 3 bilgi birleştir: "My brother is in the garden. He is wearing sneakers!"',
        phrasesEn: ['Grandpa is in the living room!', 'It is rainy, take an umbrella!', 'She is wearing a red scarf!'],
      },
    ],
    questions: [
      makeQ('ps3-q1', '👴', 'Grandpa is sitting on the sofa. Where is he?', 'Büyükbaba koltukta oturuyorsa nerededir?', [
        ['a', 'He is in the living room!', '🛋️', true],
        ['b', 'She is in pajamas winter!', '❄️', false],
        ['c', 'They floats on rainbow!', '🌈', false],
      ], true),
      makeQ('ps3-q2', '☔', 'Look outside: big grey clouds and rain! What does Dad say?', 'Yağmurlu havada dışarı çıkarken baba ne der?', [
        ['a', 'Put on your raincoat and boots!', '🥾', true],
        ['b', 'Put on your swim goggles!', '🥽', false],
        ['c', 'Touch your stairs!', '🪜', false],
      ], true),
      makeQ('ps3-q3', '🌸', 'Which two seasons are usually WARM or HOT?', 'Genellikle ılık veya sıcak olan iki mevsim hangisidir?', [
        ['a', 'Spring and Summer!', '☀️', true],
        ['b', 'Bathroom and Bedroom!', '🛏️', false],
        ['c', 'Monday and Broccoli!', '🥦', false],
      ], true),
      makeQ('ps3-q4', '😂', 'Your cousin shares snacks and makes you laugh. Complete: ___ is kind and funny!', 'Kuzenin (erkek) için doğru cümle:', [
        ['a', 'He is kind and funny!', '😂', true],
        ['b', 'It are shoes!', '👟', false],
        ['c', 'They is balcony!', '🪴', false],
      ], true),
      makeQ('ps3-q5', '😴', 'Time for bed! Where do you go, and what do you wear?', 'Uyku vakti! Nereye gider ve ne giyersin?', [
        ['a', 'Bedroom and cozy pajamas!', '🛌', true],
        ['b', 'Garden and winter scarf!', '🧣', false],
        ['c', 'Kitchen and sunglasses!', '🕶️', false],
      ], true),
      makeQ('ps3-q6', '🌈', 'When can you spot a colorful rainbow in the sky?', 'Gökyüzünde ne zaman gökkuşağı görürsün?', [
        ['a', 'When sun shines after rain!', '🌈', true],
        ['b', 'Inside the bathtub soap!', '🛁', false],
        ['c', 'Under my backpack!', '🎒', false],
      ], true),
      makeQ('ps3-q7', '🍂', 'How is the weather in windy autumn?', 'Rüzgarlı sonbaharda hava nasıl tarif edilir?', [
        ['a', 'Windy and cool with falling leaves!', '🍂', true],
        ['b', 'Super loud basketball cake!', '🎂', false],
        ['c', 'Helpful bedroom stairs!', '🪜', false],
      ], true),
      makeQ('ps3-q8', '👧', 'Your sister wears a blue dress. Complete: ___ is wearing blue.', 'Kız kardeşinden bahsederken hangisi doğru?', [
        ['a', 'She is wearing a blue dress!', '👗', true],
        ['b', 'He is wearing a blue dress!', '👦', false],
        ['c', 'They is wearing blue!', '👥', false],
      ], true),
      makeQ('ps3-q9', '🪴', 'Flowers grow outside on the porch or upstairs...', 'Üst katta çiçeklerin durduğu açık alan:', [
        ['a', 'On the balcony!', '🪴', true],
        ['b', 'In the broccoli!', '🥦', false],
        ['c', 'Under the scarf!', '🧣', false],
      ], true),
      makeQ('ps3-q10', '⛄', 'What kind of clothes do you need in snowy winter?', 'Karlı kışta ne tür kıyafet gerekir?', [
        ['a', 'Warm coat, scarf, and boots!', '🧥', true],
        ['b', 'Flip-flops and swim shorts!', '🏖️', false],
        ['c', 'Kitchen forks and spoons!', '🥄', false],
      ], true),
    ],
  },

  // ================= STOP 20: MOUNTAIN PIT-STOP (Reviews Stops 16-19) =================
  {
    id: 'pitstop-4',
    dayNumber: 20,
    isPitStop: true,
    shortLabel: 'Pit-Stop 4',
    badge: '🏁 Starlight Mountain Tekrar Durağı',
    title: 'Mountain Pit-Stop: Time, Questions & Champions',
    desc: 'Saatler, 5N1K dedektif soruları ve süper karşılaştırmalarla dağın zirvesine çık!',
    grammarFocus: 'Review: Telling Time + Wh-Questions + Comparatives & Superlatives',
    vocabFocus: [
      { en: 'What time is it?', tr: 'Saat kaç?', de: 'Wie spät ist es?', emoji: '⏰', exampleEn: 'Look at the clock! What time is it?', exampleTr: 'Saate bak! Saat kaç?' },
      { en: 'Who, What, Where?', tr: 'Kim, Ne, Nerede?', de: 'Wer, Was, Wo?', emoji: '🕵️', exampleEn: 'Ask who, what, and where like a detective!', exampleTr: 'Dedektif gibi kim, ne ve nerede diye sor!' },
      { en: 'Faster than a bike', tr: 'Bisikletten daha hızlı', de: 'Schneller als ein Fahrrad', emoji: '🏎️', exampleEn: 'A race car is faster than a bike!', exampleTr: 'Yarış arabası bisikletten daha hızlıdır!' },
      { en: 'Stronger than before', tr: 'Eskisinden daha güçlü', de: 'Stärker als vorher', emoji: '💪', exampleEn: 'Practice makes your English stronger!', exampleTr: 'Pratik İngilizceni daha güçlü yapar!' },
      { en: 'The tallest mountain', tr: 'En yüksek dağ', de: 'Der höchste Berg', emoji: '🏔️', exampleEn: 'Everest is the tallest mountain!', exampleTr: 'Everest en yüksek dağdır!' },
      { en: 'The smartest detective', tr: 'En zeki dedektif', de: 'Der klügste Detektiv', emoji: '🧠', exampleEn: 'You are the smartest detective on the island!', exampleTr: 'Adadaki en zeki dedektif sensin!' },
    ],
    tvRecommendation: {
      title: 'What Time Is It? Telling Time Song (Maple Leaf Learning)',
      channel: 'Maple Leaf Learning',
      duration: '45 sn',
      topicTr: 'Saatleri ve dağ bölümü tekrarını pekiştiren şarkı.',
      searchQuery: 'Maple Leaf Learning What Time Is It Song',
    },
    items: [
      {
        id: 'ps4-i1',
        time: '5 dk Zirve Yarışı',
        title: 'Dedektif Saat & Karşılaştırma ⏰🏔️',
        category: 'game',
        desc: 'Saat söyle ve iki şeyi kıyasla: "It is eight o’clock! My rocket is faster than a bus!"',
        phrasesEn: ['What time is it?', 'A plane is faster than a bike!', 'The blue whale is the biggest!'],
      },
    ],
    questions: [
      makeQ('ps4-q1', '⏰', 'The clock shows 7:00 in the morning. How do you answer "What time is it?"', 'Saat tam 7:00 ise nasıl söylersin?', [
        ['a', 'It is seven o’clock!', '⏰', true],
        ['b', 'It is the giraffe fastest!', '🦒', false],
        ['c', 'Because I brush cheese!', '🧀', false],
      ], true),
      makeQ('ps4-q2', '🕵️', 'Which question word asks about a PERSON ("Who is my teacher?")?', 'Bir KİŞİ hakkında soru sorarken hangi kelimeyi kullanırız?', [
        ['a', 'Who?', '🙋', true],
        ['b', 'Where?', '🗺️', false],
        ['c', 'Stronger?', '💪', false],
      ], true),
      makeQ('ps4-q3', '🐆', 'Compare a cheetah (110 km/h) and a turtle (1 km/h):', 'Çita ile kaplumbağayı karşılaştır:', [
        ['a', 'A cheetah is faster than a turtle!', '🐆', true],
        ['b', 'A cheetah is the tallest tree!', '🌳', false],
        ['c', 'When is your turtle heavier?', '⚖️', false],
      ], true),
      makeQ('ps4-q4', '🐋', 'Among ALL animals in the ocean, the blue whale is #1 in size:', 'Denizdeki TÜM hayvanlar arasında en büyük olan için:', [
        ['a', 'The blue whale is the biggest!', '🐋', true],
        ['b', 'The blue whale is smaller than ants!', '🐜', false],
        ['c', 'Whose whale is o’clock?', '⏰', false],
      ], true),
      makeQ('ps4-q5', '🎒', 'You find a lost pencil on the floor and ask who owns it:', 'Kime ait olduğunu sormak için hangi soru kelimesi kullanılır?', [
        ['a', 'Whose pencil is this?', '✏️', true],
        ['b', 'When pencil is bigger?', '⏳', false],
        ['c', 'Faster pencil is where?', '⚡', false],
      ], true),
      makeQ('ps4-q6', '🦒', 'Compare heights: A giraffe is ___ than a rabbit!', '"Zürafa tavşandan daha uzundur" nasıl tamamlanır?', [
        ['a', 'Taller than a rabbit!', '🦒', true],
        ['b', 'Slowest than a rabbit!', '🐢', false],
        ['c', 'Winter than a rabbit!', '⛄', false],
      ], true),
      makeQ('ps4-q7', '🪥', 'First thing every school morning, you go to the bathroom and:', 'Sabah uyanınca banyoda ne yaparsın?', [
        ['a', 'Brush my teeth!', '🪥', true],
        ['b', 'Climb the smartest mountain!', '🏔️', false],
        ['c', 'Float on a sandwich!', '🥪', false],
      ], true),
      makeQ('ps4-q8', '📅', 'You want to know the TIME or DAY of your birthday party. Ask:', 'Zamanı sormak için hangi soru kelimesini kullanırsın?', [
        ['a', 'When is the party?', '🎉', true],
        ['b', 'Who is the scarf?', '🧣', false],
        ['c', 'Biggest is the pizza?', '🍕', false],
      ], true),
      makeQ('ps4-q9', '🏆', 'Every other tower fell down; yours reached the sky! Your tower is:', 'Tüm kuleler içindeki en yüksek kule:', [
        ['a', 'The tallest tower!', '🏆', true],
        ['b', 'Tasted under tower!', '🍝', false],
        ['c', 'Yesterday clock!', '⏰', false],
      ], true),
      makeQ('ps4-q10', '🗺️', '🔄 Tekrar: Where is the piano? Complete detective question:', '🔄 Tekrar: Yer sormak için hangi kelimeyle başlarız?', [
        ['a', 'Where is the piano?', '🎹', true],
        ['b', 'Whose is jumping?', '🦘', false],
        ['c', 'Because is sunny!', '☀️', false],
      ], true),
    ],
  },

  // ================= STOP 21: MY TOWN & DIRECTIONS =================
  {
    id: 'level-21',
    dayNumber: 21,
    shortLabel: 'Stop 21',
    badge: '🏙️ Şehrim & Yön Bulma',
    title: 'My Town, Places & Directions',
    desc: 'Şehirdeki mekanları ve sağa-sola yön tarif etmeyi öğren!',
    grammarFocus: 'Where are you going? / Turn left, turn right, go straight ahead',
    vocabFocus: [
      { en: 'Library', tr: 'Kütüphane', de: 'Bibliothek', emoji: '📚', exampleEn: 'I borrow comic books at the library!', exampleTr: 'Kütüphaneden çizgi roman ödünç alırım!' },
      { en: 'Bakery', tr: 'Fırın / Pastane', de: 'Bäckerei', emoji: '🥐', exampleEn: 'The bakery smells like warm bread!', exampleTr: 'Fırın sıcacık ekmek kokuyor!' },
      { en: 'Fire station', tr: 'İtfaiye', de: 'Feuerwehrwache', emoji: '🚒', exampleEn: 'Red trucks wait at the fire station!', exampleTr: 'Kırmızı araçlar itfaiyede bekler!' },
      { en: 'Turn left', tr: 'Sola dön', de: 'Links abbiegen', emoji: '⬅️', exampleEn: 'Turn left at the green park!', exampleTr: 'Yeşil parkın oradan sola dön!' },
      { en: 'Turn right', tr: 'Sağa dön', de: 'Rechts abbiegen', emoji: '➡️', exampleEn: 'Turn right to find the toy shop!', exampleTr: 'Oyuncakçıyı bulmak için sağa dön!' },
      { en: 'Go straight', tr: 'Dümdüz git', de: 'Geradeaus gehen', emoji: '⬆️', exampleEn: 'Go straight ahead to school!', exampleTr: 'Okula ulaşmak için dümdüz git!' },
    ],
    tvRecommendation: {
      title: 'Where Are You Going? Places Song (English Tree)',
      channel: 'English Tree TV',
      duration: '47 sn',
      topicTr: 'Okul, park, fırın ve kütüphane gibi şehir mekanlarını anlatan şarkı.',
      searchQuery: 'English Tree Where Are You Going Places Song',
    },
    items: [
      {
        id: 'l21-i1',
        time: '5 dk Robot Yön Oyunu',
        title: 'İnsan Robotu Yönlendir! 🤖⬅️➡️',
        category: 'game',
        desc: 'Evin içinde robot ol! Yön verin: "Go straight! Turn left! Turn right at the sofa!"',
        phrasesEn: ['Go straight ahead!', 'Turn left!', 'I am going to the bakery!'],
      },
    ],
    questions: [
      makeQ('l21-q1', '🥐', 'Where can you buy fresh bread, croissants, and muffins?', 'Taze ekmek ve kruvasan nereden alınır?', [
        ['a', 'At the bakery!', '🥐', true],
        ['b', 'At the fire hydrant!', '🚒', false],
        ['c', 'In the desert cactus!', '🌵', false],
      ]),
      makeQ('l21-q2', '📚', 'Where do you go to read and borrow lots of quiet books?', 'Sessizce kitap okuyup ödünç aldığın yer neresidir?', [
        ['a', 'At the library!', '📚', true],
        ['b', 'At the soccer net!', '⚽', false],
        ['c', 'On the airplane wing!', '✈️', false],
      ]),
      makeQ('l21-q3', '🚒', 'Bright red trucks with sirens and ladders park at the:', 'Kırmızı itfaiye arabaları nerede bekler?', [
        ['a', 'The fire station!', '🚒', true],
        ['b', 'The ice cream spoon!', '🍦', false],
        ['c', 'The bathroom mirror!', '🛁', false],
      ]),
      makeQ('l21-q4', '⬅️', 'Look at the arrow pointing to the LEFT side:', 'Sola dönmek için hangi komutu verirsin?', [
        ['a', 'Turn left!', '⬅️', true],
        ['b', 'Turn winter!', '⛄', false],
        ['c', 'Jump banana!', '🍌', false],
      ]),
      makeQ('l21-q5', '⬆️', 'Do not turn left and do not turn right! Walk forward:', 'Sağa ya da sola dönmeden ileri yürümek için:', [
        ['a', 'Go straight ahead!', '⬆️', true],
        ['b', 'Hide under the rug!', '🛋️', false],
        ['c', 'Eat pizza backwards!', '🍕', false],
      ]),
      makeQ('l21-q6', '➡️', 'The toy store is on the right corner! Tell your driver:', 'Sağa dönmesini söylemek için:', [
        ['a', 'Turn right!', '➡️', true],
        ['b', 'Go hospital yesterday!', '🏥', false],
        ['c', 'Stand on your ear!', '👂', false],
      ]),
      makeQ('l21-q7', '🏙️', 'Someone asks: "Where are you going?" You walk toward the park:', '"Parka gidiyorum" nasıl söylenir?', [
        ['a', 'I am going to the park!', '🌳', true],
        ['b', 'I am wearing a library!', '📚', false],
        ['c', 'My bakery is faster!', '🥐', false],
      ]),
      makeQ('l21-q8', '🛒', 'Where do families buy vegetables, fruit, and milk for home?', 'Yiyecek ve süt aldığımız yer neresidir?', [
        ['a', 'At the supermarket!', '🛒', true],
        ['b', 'In the cloud rainbow!', '🌈', false],
        ['c', 'Under the piano keys!', '🎹', false],
      ]),
      makeQ('l21-q9', '⏰', '🔄 Tekrar: The bakery opens at 8:00 AM! That is:', '🔄 Tekrar: Saat 8:00 nasıl söylenir?', [
        ['a', 'Eight o’clock!', '🕗', true],
        ['b', 'Eight scarf!', '🧣', false],
        ['c', 'Eight stairs!', '🪜', false],
      ], true),
      makeQ('l21-q10', '🧥', '🔄 Tekrar: Put on your jacket before walking to school!', '🔄 Tekrar: "Montunu giy" komutu ne demek?', [
        ['a', 'Wear your jacket!', '🧥', true],
        ['b', 'Drop your bike!', '🚲', false],
        ['c', 'Bake a book!', '📚', false],
      ], true),
    ],
  },

  // ================= STOP 22: HOW DO WE GO? VEHICLES =================
  {
    id: 'level-22',
    dayNumber: 22,
    shortLabel: 'Stop 22',
    badge: '🚆 Ulaşım & Araçlar',
    title: 'How Do We Go? By Bus, Train & Plane',
    desc: 'Okula, tatile veya şehre hangi araçla nasıl gittiğimizi İngilizce anlat!',
    grammarFocus: 'How do you go to...? / By bus, by train, by plane, on foot',
    vocabFocus: [
      { en: 'By bus', tr: 'Otobüsle', de: 'Mit dem Bus', emoji: '🚌', exampleEn: 'I go to school by yellow bus!', exampleTr: 'Okula sarı otobüsle giderim!' },
      { en: 'By train', tr: 'Trenle', de: 'Mit dem Zug', emoji: '🚆', exampleEn: 'We travel between cities by fast train!', exampleTr: 'Şehirler arasında hızlı trenle yolculuk ederiz!' },
      { en: 'By airplane', tr: 'Uçakla', de: 'Mit dem Flugzeug', emoji: '✈️', exampleEn: 'We fly to Antalya by airplane!', exampleTr: 'Antalya’ya uçakla uçarız!' },
      { en: 'By bicycle', tr: 'Bisikletle', de: 'Mit dem Fahrrad', emoji: '🚲', exampleEn: 'I ride by bicycle in the park!', exampleTr: 'Parkta bisikletle gezerim!' },
      { en: 'Subway', tr: 'Metro', de: 'U-Bahn', emoji: '🚇', exampleEn: 'The subway zooms under the city!', exampleTr: 'Metro şehrin altından hızla gider!' },
      { en: 'On foot', tr: 'Yürüyerek', de: 'Zu Fuß', emoji: '🚶', exampleEn: 'The bakery is close, so we go on foot!', exampleTr: 'Fırın yakın, bu yüzden yürüyerek gideriz!' },
    ],
    tvRecommendation: {
      title: 'Transportation Song (The Singing Walrus)',
      channel: 'The Singing Walrus',
      duration: '47 sn',
      topicTr: 'Araba, tren, tekne ve uçak ulaşım kelimelerini öğreten şarkı.',
      searchQuery: 'The Singing Walrus Transportation Song',
    },
    items: [
      {
        id: 'l22-i1',
        time: '5 dk Seyahat Oyunu',
        title: 'Nasıl Gidelim? 🚆✈️🚶',
        category: 'talk',
        desc: 'Hedefi seç ("school", "Aachen", "Antalya") ve ulaşımı söyle: "By train!" / "On foot!"',
        phrasesEn: ['I go to school on foot!', 'We travel by fast train!', 'Fly high by airplane!'],
      },
    ],
    questions: [
      makeQ('l22-q1', '✈️', 'To fly high above the clouds on holiday to Turkey, you travel:', 'Bulutların üstünden uçarak tatile nasıl gidersin?', [
        ['a', 'By airplane!', '✈️', true],
        ['b', 'By submarine fork!', '🍴', false],
        ['c', 'By kitchen chair!', '🪑', false],
      ]),
      makeQ('l22-q2', '🚆', 'Long silver carriages zooming smoothly on iron tracks:', 'Rayların üzerinde hızla giden araç hangisidir?', [
        ['a', 'A fast train!', '🚆', true],
        ['b', 'A sleeping snowman!', '⛄', false],
        ['c', 'A broccoli boat!', '🥦', false],
      ]),
      makeQ('l22-q3', '🚶', 'The park is just around the corner, so you walk with no car:', 'Yürüyerek gitmek İngilizcede nasıl söylenir?', [
        ['a', 'On foot!', '🚶', true],
        ['b', 'By rocket pillow!', '🚀', false],
        ['c', 'On banana helmet!', '🍌', false],
      ]),
      makeQ('l22-q4', '🚇', 'Which train runs deep in tunnels UNDER the busy city streets?', 'Şehrin altındaki tünellerde giden tren hangisidir?', [
        ['a', 'The subway!', '🚇', true],
        ['b', 'The balcony flower!', '🪴', false],
        ['c', 'The fire ladder!', '🪜', false],
      ]),
      makeQ('l22-q5', '🚌', 'Lots of kids ride together to school on four big wheels:', 'Çocukları okula taşıyan büyük araç hangisidir?', [
        ['a', 'By school bus!', '🚌', true],
        ['b', 'By bathtub soap!', '🛁', false],
        ['c', 'By tall giraffe!', '🦒', false],
      ]),
      makeQ('l22-q6', '🚲', 'You pedal two wheels while wearing a helmet:', 'Kask takıp pedal çevirdiğin araç hangisidir?', [
        ['a', 'By bicycle!', '🚲', true],
        ['b', 'By raincoat!', '🧥', false],
        ['c', 'By library!', '📚', false],
      ]),
      makeQ('l22-q7', '⛵', 'How do people cross a lake or sail from an island dock?', 'Gölü veya denizi geçmek için hangi araç kullanılır?', [
        ['a', 'By boat or ship!', '⛵', true],
        ['b', 'By yellow pencil!', '✏️', false],
        ['c', 'By warm bedroom!', '🛏️', false],
      ]),
      makeQ('l22-q8', '❓', 'Complete the question: "___ do you go to school?" — "By bus!"', '"Okula nasıl gidersin?" sorusunun ilk kelimesi nedir?', [
        ['a', 'How do you go to school?', '🚌', true],
        ['b', 'Whose do you bus?', '❓', false],
        ['c', 'Heavier do you go?', '🪨', false],
      ]),
      makeQ('l22-q9', '⬅️', '🔄 Tekrar: Tell the bus driver to turn to the left:', '🔄 Tekrar (Bölüm 21): "Sola dön" nasıl söylenir?', [
        ['a', 'Turn left!', '⬅️', true],
        ['b', 'On foot airplane!', '✈️', false],
        ['c', 'Go sunny!', '☀️', false],
      ], true),
      makeQ('l22-q10', '📚', '🔄 Tekrar: Which town building is full of books to borrow?', '🔄 Tekrar (Bölüm 21): Kitap dolu mekan hangisidir?', [
        ['a', 'The library!', '📚', true],
        ['b', 'The bakery bus!', '🚌', false],
        ['c', 'The sneeze!', '🤧', false],
      ], true),
    ],
  },

  // ================= STOP 23: HEALTHY BODY & DOCTOR =================
  {
    id: 'level-23',
    dayNumber: 23,
    shortLabel: 'Stop 23',
    badge: '🩺 Sağlıklı Vücut & Doktor',
    title: 'Healthy Body & Doctor Checkup',
    desc: 'Doktorda kendini anlatmayı ve sağlıklı kalma cümlelerini öğren!',
    grammarFocus: 'What is the matter? / I have got a ... / Drink water & rest!',
    vocabFocus: [
      { en: 'What is the matter?', tr: 'Neyin var / Sorun ne?', de: 'Was fehlt dir?', emoji: '🩺', exampleEn: 'Doctor Leo asks: What is the matter?', exampleTr: 'Doktor Leo sorar: Neyin var?' },
      { en: 'Headache', tr: 'Baş ağrısı', de: 'Kopfschmerzen', emoji: '🤕', exampleEn: 'I have got a little headache!', exampleTr: 'Biraz baş ağrım var!' },
      { en: 'Tummy ache', tr: 'Karın ağrısı', de: 'Bauchschmerzen', emoji: '🤢', exampleEn: 'Too much candy gave me a tummy ache!', exampleTr: 'Çok şeker karın ağrısı yaptı!' },
      { en: 'Drink water', tr: 'Su iç', de: 'Wasser trinken', emoji: '💧', exampleEn: 'Drink plenty of water to stay strong!', exampleTr: 'Güçlü kalmak için bol su iç!' },
      { en: 'Healthy food', tr: 'Sağlıklı yiyecek', de: 'Gesundes Essen', emoji: '🥗', exampleEn: 'Apples and carrots are healthy food!', exampleTr: 'Elma ve havuç sağlıklı yiyeceklerdir!' },
      { en: 'Feel better!', tr: 'Geçmiş olsun / Daha iyi hisset!', de: 'Gute Besserung!', emoji: '🌟', exampleEn: 'Rest in bed and feel better soon!', exampleTr: 'Yatakta dinlen ve çabuk iyileş!' },
    ],
    tvRecommendation: {
      title: 'Doctor Doctor Song (Super Simple Songs)',
      channel: 'Super Simple Songs',
      duration: '47 sn',
      topicTr: 'Doktor muayenesi ve "Feel better soon" kalıplarını öğreten şarkı.',
      searchQuery: 'Super Simple Songs Doctor Doctor Song',
    },
    items: [
      {
        id: 'l23-i1',
        time: '5 dk Doktor Oyunu',
        title: 'Doktor Leo Muayenehanesi 🩺🧸',
        category: 'talk',
        desc: 'Bir oyuncağı muayene et! "What is the matter? Drink water and feel better soon!"',
        phrasesEn: ['What is the matter?', 'Drink water and rest!', 'Feel better soon!'],
      },
    ],
    questions: [
      makeQ('l23-q1', '🩺', 'Mom is a caring doctor! She smiles and gently asks you:', 'Doktor muayeneye başlarken "Neyin var?" diye nasıl sorar?', [
        ['a', 'What is the matter?', '🩺', true],
        ['b', 'How much is the rocket?', '🚀', false],
        ['c', 'Turn left at the train!', '🚆', false],
      ]),
      makeQ('l23-q2', '🤕', 'Your head hurts after loud noise. How do you explain?', 'Başın ağrıdığında doktora ne dersin?', [
        ['a', 'I have got a headache!', '🤕', true],
        ['b', 'I have got a bakery!', '🥐', false],
        ['c', 'I am wearing stairs!', '🪜', false],
      ]),
      makeQ('l23-q3', '🤢', 'You ate ten cupcakes and your belly hurts! You have got a:', 'Karnın ağrıdığında neyin var demektir?', [
        ['a', 'A tummy ache!', '🤢', true],
        ['b', 'A windy scarf!', '🧣', false],
        ['c', 'A fast bicycle!', '🚲', false],
      ]),
      makeQ('l23-q4', '🥗', 'Which choice is HEALTHY food that gives you superhero energy?', 'Sağlıklı yiyecek grubu hangisidir?', [
        ['a', 'Fresh fruit and vegetables!', '🥗', true],
        ['b', 'Only ice cream all day!', '🍨', false],
        ['c', 'Plastic Lego wheels!', '🧱', false],
      ]),
      makeQ('l23-q5', '💧', 'What is the best drink to keep your body hydrated and healthy?', 'Vücudumuz için en sağlıklı içecek hangisidir?', [
        ['a', 'Clean water!', '💧', true],
        ['b', 'Salty sea sand!', '🏖️', false],
        ['c', 'Yellow paint!', '🎨', false],
      ]),
      makeQ('l23-q6', '🌟', 'Your friend stays home with a cold. What warm message do you send?', 'Hasta arkadaşına "Geçmiş olsun!" nasıl dersin?', [
        ['a', 'Feel better soon!', '🌟', true],
        ['b', 'Wait for broccoli!', '🥦', false],
        ['c', 'That is a whale!', '🐋', false],
      ]),
      makeQ('l23-q7', '😴', 'When you feel tired and sick, the doctor says: Get good ___!', 'Yorgunken veya hastayken ne yapmalıyız?', [
        ['a', 'Sleep and rest!', '😴', true],
        ['b', 'Run on the subway!', '🚇', false],
        ['c', 'Shout all night!', '📢', false],
      ]),
      makeQ('l23-q8', '🦷', 'How do you keep your teeth shiny and healthy every day?', 'Dişlerimizi sağlıklı tutmak için ne yaparız?', [
        ['a', 'Brush my teeth morning and night!', '🪥', true],
        ['b', 'Eat candy on the sofa!', '🍬', false],
        ['c', 'Put sneakers on my nose!', '👟', false],
      ]),
      makeQ('l23-q9', '🚆', '🔄 Tekrar: How did we visit Grandma’s city?', '🔄 Tekrar (Bölüm 22): Trenle seyahat nasıl söylenir?', [
        ['a', 'We went by train!', '🚆', true],
        ['b', 'We went by headache!', '🤕', false],
        ['c', 'We went on bakery!', '🥐', false],
      ], true),
      makeQ('l23-q10', '🚒', '🔄 Tekrar: Where do firefighters keep the red rescue truck?', '🔄 Tekrar (Bölüm 21): İtfaiye binası:', [
        ['a', 'At the fire station!', '🚒', true],
        ['b', 'Inside the tummy ache!', '🤢', false],
        ['c', 'On the rainbow!', '🌈', false],
      ], true),
    ],
  },

  // ================= STOP 24: FEELINGS & BIG EMOTIONS =================
  {
    id: 'level-24',
    dayNumber: 24,
    shortLabel: 'Stop 24',
    badge: '💛 Duygularımız',
    title: 'Feelings & Big Kid Emotions',
    desc: 'Mutlu, heyecanlı, gururlu, cesur ve sakin duyguları ifade etmeyi öğren!',
    grammarFocus: 'How do you feel? / I feel excited, proud, brave, calm',
    vocabFocus: [
      { en: 'Excited', tr: 'Heyecanlı', de: 'Aufgeregt', emoji: '🤩', exampleEn: 'I am excited for my birthday party!', exampleTr: 'Doğum günü partim için heyecanlıyım!' },
      { en: 'Proud', tr: 'Gururlu', de: 'Stolz', emoji: '🏆', exampleEn: 'I feel proud when I speak English!', exampleTr: 'İngilizce konuşunca gururlu hissediyorum!' },
      { en: 'Surprised', tr: 'Şaşkın', de: 'Überrascht', emoji: '😮', exampleEn: 'I was surprised by the magic trick!', exampleTr: 'Sihir numarasına çok şaşırdım!' },
      { en: 'Brave', tr: 'Cesur', de: 'Mutig', emoji: '🦁', exampleEn: 'Be brave like a friendly lion!', exampleTr: 'Dost canlısı bir aslan gibi cesur ol!' },
      { en: 'Calm', tr: 'Sakin', de: 'Ruhig', emoji: '😌', exampleEn: 'Take a deep breath and feel calm!', exampleTr: 'Derin bir nefes al ve sakinleş!' },
      { en: 'Curious', tr: 'Meraklı', de: 'Neugierig', emoji: '🔎', exampleEn: 'Checker Tobi is curious about science!', exampleTr: 'Checker Tobi bilime karşı çok meraklı!' },
    ],
    tvRecommendation: {
      title: 'Feelings & Emotions Song (The Singing Walrus)',
      channel: 'The Singing Walrus',
      duration: '47 sn',
      topicTr: 'Duyguları neşeli hareketlerle öğreten İngilizce şarkı.',
      searchQuery: 'The Singing Walrus Feelings Song',
    },
    items: [
      {
        id: 'l24-i1',
        time: '5 dk Yüz İfadesi Oyunu',
        title: 'Duygu Aynası Oyunu 🤩🦁😌',
        category: 'game',
        desc: 'Sırayla yüz ifadesi yapın ve tahmin edin: "You look surprised! Wait—you feel proud!"',
        phrasesEn: ['I feel excited!', 'I feel proud!', 'Take a breath and stay calm!'],
      },
    ],
    questions: [
      makeQ('l24-q1', '🤩', 'Tomorrow is your holiday at Nirvana Hotel! How do you feel?', 'Tatil ya da parti öncesi kendini nasıl hissedersin?', [
        ['a', 'I feel super excited!', '🤩', true],
        ['b', 'I feel like a staircase!', '🪜', false],
        ['c', 'I feel Tuesday!', '📅', false],
      ]),
      makeQ('l24-q2', '🏆', 'You built a huge Lego castle all by yourself! What emotion is that?', 'Büyük bir işi kendin başardığında ne hissedersin?', [
        ['a', 'I feel proud!', '🏆', true],
        ['b', 'I feel rainy cloud!', '☁️', false],
        ['c', 'I feel tummy ache!', '🤢', false],
      ]),
      makeQ('l24-q3', '😌', 'Before a piano concert, take three slow breaths to feel:', 'Konser öncesi derin nefes alınca nasıl hissedersin?', [
        ['a', 'Calm and ready!', '😌', true],
        ['b', 'Windy and snowy!', '❄️', false],
        ['c', 'Fast and sideways!', '🦀', false],
      ]),
      makeQ('l24-q4', '🦁', 'Trying something brand new even when it looks tricky means you are:', 'Yeni ve zor bir şeyi cesurca denediğinde nesindir?', [
        ['a', 'Brave!', '🦁', true],
        ['b', 'Library!', '📚', false],
        ['c', 'Spaghetti!', '🍝', false],
      ]),
      makeQ('l24-q5', '😮', 'A giant cake jumps out of the box when nobody expects it! Everyone is:', 'Beklenmedik bir sürprizde ne oluruz?', [
        ['a', 'Surprised!', '😮', true],
        ['b', 'By bus!', '🚌', false],
        ['c', 'Sink!', '🪨', false],
      ]),
      makeQ('l24-q6', '🔎', 'You ask "Why does it float? How do planes fly?" You are very:', 'Sürekli "Neden, nasıl?" diye soran kişi nasıldır?', [
        ['a', 'Curious!', '🔎', true],
        ['b', 'Pajamas!', '🛌', false],
        ['c', 'Sneakers!', '👟', false],
      ]),
      makeQ('l24-q7', '💬', 'Leo smiles and asks: "How do you feel today, Deniz?"', '"Bugün nasıl hissediyorsun?" sorusuna hangisi güzel bir cevaptır?', [
        ['a', 'I feel happy and brave!', '😄', true],
        ['b', 'I have got a fire station!', '🚒', false],
        ['c', 'Turn right at the apple!', '➡️', false],
      ]),
      makeQ('l24-q8', '🤗', 'Your friend looks sad because they dropped an ice cream. What do you do?', 'Dondurması düşüp üzülen arkadaşına ne dersin?', [
        ['a', 'Don’t worry! Let’s share mine!', '🤗', true],
        ['b', 'It is eight o’clock scarf!', '🧣', false],
        ['c', 'Go straight helicopter!', '🚁', false],
      ]),
      makeQ('l24-q9', '🩺', '🔄 Tekrar: Mom asks as a doctor: "___ is the matter?"', '🔄 Tekrar (Bölüm 23): Doktorun ilk sorusu:', [
        ['a', 'What is the matter?', '🩺', true],
        ['b', 'Surprised is the matter?', '😮', false],
        ['c', 'Bakery is the matter?', '🥐', false],
      ], true),
      makeQ('l24-q10', '💧', '🔄 Tekrar: Which drink keeps you healthy after basketball?', '🔄 Tekrar (Bölüm 23): Basketboldan sonra en sağlıklı içecek:', [
        ['a', 'Fresh water!', '💧', true],
        ['b', 'Proud airplane!', '✈️', false],
        ['c', 'Windy boots!', '🥾', false],
      ], true),
    ],
  },

  // ================= STOP 25: HARBOR PIT-STOP (Reviews Stops 21-24) =================
  {
    id: 'pitstop-5',
    dayNumber: 25,
    isPitStop: true,
    shortLabel: 'Pit-Stop 5',
    badge: '🏁 City Harbor Tekrar Durağı',
    title: 'Harbor Pit-Stop: Town, Travel, Health & Feelings',
    desc: 'Şehir mekanları, ulaşım, sağlık ve duyguları limandaki büyük kutlamayla pekiştir!',
    grammarFocus: 'Review: Town Directions + Vehicles + Doctor/Healthy + Emotions',
    vocabFocus: [
      { en: 'Go to the bakery', tr: 'Fırına git', de: 'Zur Bäckerei gehen', emoji: '🥐', exampleEn: 'Go straight and turn left to the bakery!', exampleTr: 'Düz git ve fırın için sola dön!' },
      { en: 'Travel by train', tr: 'Trenle yolculuk et', de: 'Mit dem Zug reisen', emoji: '🚆', exampleEn: 'We feel excited to travel by train!', exampleTr: 'Trenle yolculuk edeceğimiz için heyecanlıyız!' },
      { en: 'Stay healthy', tr: 'Sağlıklı kal', de: 'Gesund bleiben', emoji: '🥗', exampleEn: 'Eat fruit and sleep well to stay healthy!', exampleTr: 'Sağlıklı kalmak için meyve ye ve iyi uyu!' },
      { en: 'I feel calm', tr: 'Sakin hissediyorum', de: 'Ich bin ruhig', emoji: '😌', exampleEn: 'Listen to the sea waves and feel calm!', exampleTr: 'Deniz dalgalarını dinle ve sakinleş!' },
      { en: 'Proud explorer', tr: 'Gururlu kaşif', de: 'Stolzer Entdecker', emoji: '🧭', exampleEn: 'I am a proud English explorer!', exampleTr: 'Ben gururlu bir İngilizce kaşifiyim!' },
      { en: 'Across the harbor', tr: 'Limanın karşısına', de: 'Über den Hafen', emoji: '⛵', exampleEn: 'Let’s sail across the sunny harbor!', exampleTr: 'Güneşli limanın karşısına yelken açalım!' },
    ],
    tvRecommendation: {
      title: 'Driving In My Car Harbor Review Song (Super Simple Songs)',
      channel: 'Super Simple Songs',
      duration: '45 sn',
      topicTr: 'Şehir turu ve araçları kutlayan liman tekrar şarkısı.',
      searchQuery: 'Super Simple Songs Driving In My Car',
    },
    items: [
      {
        id: 'ps5-i1',
        time: '5 dk Şehir Hikayesi',
        title: 'Liman Turu Anlatımı 🏙️⛵',
        category: 'talk',
        desc: '3 cümle kur: "I go to the library by bike. After that I eat healthy fruit. I feel proud!"',
        phrasesEn: ['Turn right at the library!', 'We go by bus!', 'I feel proud and calm!'],
      },
    ],
    questions: [
      makeQ('ps5-q1', '➡️', 'To reach the library, the map says: Go straight, then turn RIGHT!', 'Yol tarifi sağa dön diyorsa hangi cümle doğrudur?', [
        ['a', 'Go straight, then turn right!', '➡️', true],
        ['b', 'Eat left at the tummy ache!', '🤢', false],
        ['c', 'Freeze by submarine!', '❄️', false],
      ], true),
      makeQ('ps5-q2', '✈️', 'Which vehicle flies high in the sky between countries?', 'Ülkeler arasında gökyüzünden giden araç:', [
        ['a', 'An airplane!', '✈️', true],
        ['b', 'A subway sandwich!', '🥪', false],
        ['c', 'A cozy pillow!', '🛌', false],
      ], true),
      makeQ('ps5-q3', '🤕', 'Your head hurts. What do you tell the kind doctor?', 'Başın ağrıdığında doktora ne dersin?', [
        ['a', 'I have got a headache!', '🤕', true],
        ['b', 'I have got a fire station!', '🚒', false],
        ['c', 'It is surprised o’clock!', '😮', false],
      ], true),
      makeQ('ps5-q4', '🏆', 'You finished 25 whole stops of English! How does Leo feel about you?', '25 durağı tamamladığında nasıl hissedilir?', [
        ['a', 'Super proud and excited!', '🏆', true],
        ['b', 'Windy and sick!', '🤧', false],
        ['c', 'Under the sofa!', '🛋️', false],
      ], true),
      makeQ('ps5-q5', '📚', 'Where should you go if you want five new story books?', 'Beş yeni hikaye kitabı için nereye gidersin?', [
        ['a', 'To the library!', '📚', true],
        ['b', 'To the sneezing desert!', '🏜️', false],
        ['c', 'To the puddle boots!', '🥾', false],
      ], true),
      makeQ('ps5-q6', '🚶', 'Your friend lives two houses away. How do you visit them?', 'İki ev ötedeki arkadaşına nasıl gidersin?', [
        ['a', 'I walk there on foot!', '🚶', true],
        ['b', 'I fly by rocket ship!', '🚀', false],
        ['c', 'I feel toothpaste!', '🪥', false],
      ], true),
      makeQ('ps5-q7', '🥗', 'What helps you recover fast and stay strong?', 'Çabuk iyileşip güçlü kalmana ne yardım eder?', [
        ['a', 'Healthy food, water, and rest!', '🥗', true],
        ['b', 'Jumping on stairs in rain!', '🪜', false],
        ['c', 'Eating twelve broccolis cold!', '🥦', false],
      ], true),
      makeQ('ps5-q8', '🦁', 'When a kid speaks loudly in English for the first time, they are:', 'Yeni bir şeyi cesurca deneyen çocuk:', [
        ['a', 'Very brave!', '🦁', true],
        ['b', 'Very bakery!', '🥐', false],
        ['c', 'Very balcony!', '🪴', false],
      ], true),
      makeQ('ps5-q9', '🚇', 'Which fast city ride goes underground beneath streets?', 'Yer altında giden hızlı şehir treni:', [
        ['a', 'The subway!', '🚇', true],
        ['b', 'The rainbow!', '🌈', false],
        ['c', 'The scarf!', '🧣', false],
      ], true),
      makeQ('ps5-q10', '😌', 'Deep breathing helps noisy classrooms become:', 'Derin nefes gürültülü bir ortamı nasıl yapar?', [
        ['a', 'Quiet and calm!', '😌', true],
        ['b', 'Loud and tummy ache!', '🤢', false],
        ['c', 'Bigger than snow!', '⛄', false],
      ], true),
    ],
  },

  // ================= STOP 26: DAYS, MONTHS & BIRTHDAYS =================
  {
    id: 'level-25',
    dayNumber: 26,
    shortLabel: 'Stop 26',
    badge: '📅 Günler, Aylar & Doğum Günü',
    title: 'Days, Months & Birthday Party',
    desc: 'Haftanın günlerini, ayları ve doğum günü davetini İngilizce söylemeyi öğren!',
    grammarFocus: 'Days of the week (Monday–Sunday) / Birthday months & celebrations',
    vocabFocus: [
      { en: 'Monday to Friday', tr: 'Pazartesiden Cumaya', de: 'Montag bis Freitag', emoji: '🎒', exampleEn: 'I go to school from Monday to Friday!', exampleTr: 'Pazartesiden cumaya okula giderim!' },
      { en: 'Saturday & Sunday', tr: 'Cumartesi ve Pazar', de: 'Samstag und Sonntag', emoji: '🎉', exampleEn: 'Saturday and Sunday are the fun weekend!', exampleTr: 'Cumartesi ve Pazar eğlenceli hafta sonudur!' },
      { en: 'What day is today?', tr: 'Bugün günlerden ne?', de: 'Welcher Tag ist heute?', emoji: '📅', exampleEn: 'Look at the calendar! What day is today?', exampleTr: 'Takvime bak! Bugün günlerden ne?' },
      { en: 'Birthday cake', tr: 'Doğum günü pastası', de: 'Geburtstagskuchen', emoji: '🎂', exampleEn: 'Make a wish and blow out the cake candles!', exampleTr: 'Bir dilek tut ve pasta mumlarını üfle!' },
      { en: 'Happy birthday!', tr: 'Doğum günün kutlu olsun!', de: 'Alles Gute zum Geburtstag!', emoji: '🥳', exampleEn: 'Happy birthday, Deniz! Here is a gift!', exampleTr: 'Doğum günün kutlu olsun Deniz! İşte hediyen!' },
      { en: 'January to December', tr: 'Ocaktan Aralığa', de: 'Januar bis Dezember', emoji: '🗓️', exampleEn: 'There are twelve months in a year!', exampleTr: 'Bir yılda on iki ay vardır!' },
    ],
    tvRecommendation: {
      title: 'Days of the Week Song (The Singing Walrus)',
      channel: 'The Singing Walrus',
      duration: '47 sn',
      topicTr: 'Haftanın yedi gününü eğlenceli ritimle öğreten şarkı.',
      searchQuery: 'The Singing Walrus Days of the Week Song',
    },
    items: [
      {
        id: 'l25-i1',
        time: '5 dk Takvim Oyunu',
        title: 'Hafta Sonu mu Okul Günü mü? 📅🎂',
        category: 'talk',
        desc: 'Günleri sırayla söyleyip işaret edin: "Today is Saturday! No school today!"',
        phrasesEn: ['Today is Saturday!', 'My birthday is in summer!', 'Happy birthday, friend!'],
      },
    ],
    questions: [
      makeQ('l25-q1', '📅', 'Which two days are the SCHOOL-FREE weekend days?', 'Okul olmayan iki hafta sonu günü hangisidir?', [
        ['a', 'Saturday and Sunday!', '🎉', true],
        ['b', 'Monday and Tuesday!', '📚', false],
        ['c', 'Kitchen and Bakery!', '🥐', false],
      ]),
      makeQ('l25-q2', '🎒', 'Which day is the VERY FIRST school day after Sunday?', 'Pazardan hemen sonraki ilk okul günü hangisidir?', [
        ['a', 'Monday!', '🎒', true],
        ['b', 'December cake!', '🎂', false],
        ['c', 'Subway boat!', '🚇', false],
      ]),
      makeQ('l25-q3', '🎂', 'Your friend turns 7 years old today! What do you sing and say?', 'Doğum günü olan arkadaşına ne söylersin?', [
        ['a', 'Happy birthday!', '🥳', true],
        ['b', 'I have a headache!', '🤕', false],
        ['c', 'Turn left at winter!', '⬅️', false],
      ]),
      makeQ('l25-q4', '🗓️', 'Which is the VERY FIRST month of a brand new year (Month #1)?', 'Yeni yılın birinci ayı hangisidir?', [
        ['a', 'January!', '🗓️', true],
        ['b', 'Friday!', '🎒', false],
        ['c', 'Raincoat!', '🧥', false],
      ]),
      makeQ('l25-q5', '❄️', 'Which month is the LAST month of the year (Month #12)?', 'Yılın en son 12. ayı hangisidir?', [
        ['a', 'December!', '❄️', true],
        ['b', 'Monday!', '📅', false],
        ['c', 'Thursday!', '📝', false],
      ]),
      makeQ('l25-q6', '🤔', 'If today is Wednesday, what day comes TOMORROW?', 'Bugün Çarşambaysa yarın hangi gündür?', [
        ['a', 'Thursday!', '📅', true],
        ['b', 'Sunday!', '🎉', false],
        ['c', 'August!', '☀️', false],
      ]),
      makeQ('l25-q7', '🕯️', 'Count the seven candles on top of the sweet chocolate:', 'Üzerinde mumlar olan doğum günü pastası:', [
        ['a', 'Birthday cake!', '🎂', true],
        ['b', 'Library stairs!', '🪜', false],
        ['c', 'Subway train!', '🚇', false],
      ]),
      makeQ('l25-q8', '❓', 'How do you ask your teacher which day it is today?', '"Bugün günlerden ne?" diye nasıl sorarsın?', [
        ['a', 'What day is today?', '📅', true],
        ['b', 'Whose cake is rainy?', '🎂', false],
        ['c', 'Why is January taller?', '🦒', false],
      ]),
      makeQ('l25-q9', '🏆', '🔄 Tekrar: Your birthday party makes you feel super excited and...', '🔄 Tekrar (Bölüm 24): Harika duygular:', [
        ['a', 'Happy and proud!', '🏆', true],
        ['b', 'Heavy and broken!', '🪨', false],
        ['c', 'Windy and hungry!', '💨', false],
      ], true),
      makeQ('l25-q10', '✈️', '🔄 Tekrar: Grandma flies from Istanbul to Aachen:', '🔄 Tekrar (Bölüm 22): Uçakla gelmek:', [
        ['a', 'By airplane!', '✈️', true],
        ['b', 'By scarf!', '🧣', false],
        ['c', 'By calendar!', '📅', false],
      ], true),
    ],
  },

  // ================= STOP 27: AT THE MARKET & MONEY =================
  {
    id: 'level-26',
    dayNumber: 27,
    shortLabel: 'Stop 27',
    badge: '🪙 Pazarda & Alışveriş',
    title: 'At the Market: How Much Is It?',
    desc: 'Alışverişte fiyat sormayı, para/bozukluk saymayı ve nazikçe satın almayı öğren!',
    grammarFocus: 'How much is it? / It is five euros / Here you are!',
    vocabFocus: [
      { en: 'How much is it?', tr: 'Fiyatı ne kadar?', de: 'Wie viel kostet das?', emoji: '🏷️', exampleEn: 'Excuse me, how much is this comic book?', exampleTr: 'Affedersiniz, bu çizgi roman ne kadar?' },
      { en: 'Five euros', tr: 'Beş euro', de: 'Fünf Euro', emoji: '💶', exampleEn: 'The blue Lego car is five euros!', exampleTr: 'Mavi Lego araba beş euro!' },
      { en: 'Here you are!', tr: 'Buyurun!', de: 'Bitte schön!', emoji: '🙌', exampleEn: 'Here you are! One fresh apple!', exampleTr: 'Buyurun! Bir taze elma!' },
      { en: 'Coins & Wallet', tr: 'Bozuk para ve cüzdan', de: 'Münzen & Geldbeutel', emoji: '🪙', exampleEn: 'I count shiny gold coins in my wallet!', exampleTr: 'Cüzdanımdaki parlak bozuk paraları sayarım!' },
      { en: 'Cheap & Expensive', tr: 'Ucuz ve Pahalı', de: 'Günstig & Teuer', emoji: '🛍️', exampleEn: 'Stickers are cheap, bikes are expensive!', exampleTr: 'Çıkartmalar ucuzdur, bisikletler pahalıdır!' },
      { en: 'Shopping bag', tr: 'Alışveriş çantası', de: 'Einkaufstasche', emoji: '👜', exampleEn: 'Put the bananas into our shopping bag!', exampleTr: 'Muzları alışveriş çantamıza koy!' },
    ],
    tvRecommendation: {
      title: 'How Much Is This? Shopping Song (English Singsing)',
      channel: 'English Singsing',
      duration: '47 sn',
      topicTr: 'Fiyat sorma ve mağazada kibarca alışveriş diyaloğu şarkısı.',
      searchQuery: 'English Singsing How much is this Buy things',
    },
    items: [
      {
        id: 'l26-i1',
        time: '6 dk Dükkan Oyunu',
        title: 'Evde Lego Market Aç! 🛍️🪙',
        category: 'game',
        desc: 'Oyuncaklara fiyat etiketi koyun ve oynayın: "How much is it?" — "Three euros! Here you are!"',
        phrasesEn: ['How much is it?', 'It is four euros!', 'Here you are! Thank you!'],
      },
    ],
    questions: [
      makeQ('l26-q1', '🏷️', 'You pick up a cool Lego minifigure in a shop and ask the price:', 'Oyuncakçıda fiyat sormak için ne söylersin?', [
        ['a', 'How much is it?', '🏷️', true],
        ['b', 'How fast is Tuesday?', '📅', false],
        ['c', 'Who is tummy ache?', '🤢', false],
      ]),
      makeQ('l26-q2', '💶', 'The shopkeeper checks the sticker and answers the price:', 'Satıcı fiyatı söylediğinde hangi cümle doğrudur?', [
        ['a', 'It is five euros!', '💶', true],
        ['b', 'It is sunny shoes!', '👟', false],
        ['c', 'She is calendar!', '📅', false],
      ]),
      makeQ('l26-q3', '🙌', 'You hand over the coins politely. What do you say?', 'Parayı veya bir eşyayı uzatırken "Buyurun!" nasıl denir?', [
        ['a', 'Here you are!', '🙌', true],
        ['b', 'Freeze in winter!', '❄️', false],
        ['c', 'Wait for broccoli!', '🥦', false],
      ]),
      makeQ('l26-q4', '🛍️', 'A small pencil costs 1 euro (not a lot of money). The pencil is:', 'Fiyatı uygun ve ucuz bir şey için hangi kelime kullanılır?', [
        ['a', 'Cheap!', '🪙', true],
        ['b', 'Subway!', '🚇', false],
        ['c', 'Proud!', '🏆', false],
      ]),
      makeQ('l26-q5', '🚀', 'A huge spaceship costs 500 euros! Wow, it is very:', 'Fiyatı çok yüksek bir şey için ne denir?', [
        ['a', 'Expensive!', '💎', true],
        ['b', 'Delicious!', '🍕', false],
        ['c', 'Windy!', '💨', false],
      ]),
      makeQ('l26-q6', '🪙', 'Round metal pieces used for buying snacks are called:', 'Yuvarlak madeni paralara ne denir?', [
        ['a', 'Coins!', '🪙', true],
        ['b', 'Cousins!', '🙋', false],
        ['c', 'Rainbows!', '🌈', false],
      ]),
      makeQ('l26-q7', '👜', 'Where do you carry your fruit home from the market?', 'Aldığın meyveleri neyin içinde eve taşırsın?', [
        ['a', 'In a shopping bag!', '👜', true],
        ['b', 'On top of stairs!', '🪜', false],
        ['c', 'Inside a headache!', '🤕', false],
      ]),
      makeQ('l26-q8', '🙏', 'Shopkeeper: "Here are your strawberries!" You answer politely:', 'Satıcı çilekleri verince kibarca ne dersin?', [
        ['a', 'Thank you very much!', '🙏', true],
        ['b', 'Put on pajamas now!', '🛌', false],
        ['c', 'They are January!', '🗓️', false],
      ]),
      makeQ('l26-q9', '🥐', '🔄 Tekrar: Where can you buy fresh bread for 2 euros?', '🔄 Tekrar (Bölüm 21): Taze ekmek nereden alınır?', [
        ['a', 'At the bakery!', '🥐', true],
        ['b', 'At the ocean!', '🌊', false],
        ['c', 'At the weekend!', '🎉', false],
      ], true),
      makeQ('l26-q10', '🎂', '🔄 Tekrar: We buy candles at the shop for my:', '🔄 Tekrar (Bölüm 26): Mumları ne için alırız?', [
        ['a', 'Birthday cake!', '🎂', true],
        ['b', 'Fire station!', '🚒', false],
        ['c', 'Tummy ache!', '🤢', false],
      ], true),
    ],
  },

  // ================= STOP 28: ANIMAL HABITATS & NATURE =================
  {
    id: 'level-27',
    dayNumber: 28,
    shortLabel: 'Stop 28',
    badge: '🌍 Doğa & Hayvan Yaşam Alanları',
    title: 'Animal Habitats & Nature Explorers',
    desc: 'Orman, çöl, okyanus ve kutuplarda hangi hayvanların yaşadığını keşfet!',
    grammarFocus: 'Where does ... live? / It lives in the jungle, desert, ocean, arctic',
    vocabFocus: [
      { en: 'Jungle', tr: 'Tropikal Orman', de: 'Dschungel', emoji: '🌴', exampleEn: 'Monkeys swing high in the green jungle!', exampleTr: 'Maymunlar yeşil ormanda yükseğe sallanır!' },
      { en: 'Ocean', tr: 'Okyanus', de: 'Ozean', emoji: '🌊', exampleEn: 'Dolphins and whales swim in the deep ocean!', exampleTr: 'Yunuslar ve balinalar derin okyanusta yüzer!' },
      { en: 'Desert', tr: 'Çöl', de: 'Wüste', emoji: '🏜️', exampleEn: 'Camels walk across the sunny hot desert!', exampleTr: 'Develer sıcak güneşli çölde yürür!' },
      { en: 'Arctic snow', tr: 'Kutup karı / Buzul', de: 'Arktis', emoji: '🐻‍❄️', exampleEn: 'Polar bears live in the icy Arctic!', exampleTr: 'Kutup ayıları buzlu Arktikte yaşar!' },
      { en: 'Volcano', tr: 'Yanardağ', de: 'Vulkan', emoji: '🌋', exampleEn: 'Science kids love studying mountain volcanoes!', exampleTr: 'Bilim sever çocuklar dağ yanardağlarını inceler!' },
      { en: 'Protect nature', tr: 'Doğayı koru', de: 'Natur schützen', emoji: '🌱', exampleEn: 'Plant trees and keep rivers clean to protect nature!', exampleTr: 'Doğayı korumak için ağaç dik ve nehirleri temiz tut!' },
    ],
    tvRecommendation: {
      title: 'Habitats Song (Hopscotch Songs)',
      channel: 'Hopscotch',
      duration: '47 sn',
      topicTr: 'Çöl, orman, okyanus ve kutup yaşam alanlarını öğreten doğa şarkısı.',
      searchQuery: 'Hopscotch Animal Habitats Song',
    },
    items: [
      {
        id: 'l27-i1',
        time: '5 dk Doğa Quiz',
        title: 'Bu Hayvan Nerede Yaşar? 🌴🌊🏜️',
        category: 'talk',
        desc: 'Bir hayvan söyleyin ("penguin", "camel", "whale"), çocuk yaşam alanını söylesin: "It lives in the ocean!"',
        phrasesEn: ['Whales live in the ocean!', 'Camels live in the desert!', 'Protect green nature!'],
      },
    ],
    questions: [
      makeQ('l27-q1', '🐋', 'Where do blue whales, sharks, and colorful coral fish live?', 'Balina, köpekbalığı ve deniz canlıları nerede yaşar?', [
        ['a', 'In the deep ocean!', '🌊', true],
        ['b', 'In the dry desert!', '🏜️', false],
        ['c', 'In the shopping bag!', '👜', false],
      ]),
      makeQ('l27-q2', '🐒', 'Monkeys, parrots, and frogs love tall rainy trees in the:', 'Maymun ve papağanların yaşadığı sık ağaçlı yer neresidir?', [
        ['a', 'In the jungle!', '🌴', true],
        ['b', 'On Arctic icebergs!', '🧊', false],
        ['c', 'Inside a wallet!', '🪙', false],
      ]),
      makeQ('l27-q3', '🐪', 'It is super dry and sandy with spiky cactus plants. Camels live in the:', 'Kumlarla kaplı kuru çölde develer yaşar. Hangisi doğru?', [
        ['a', 'In the desert!', '🏜️', true],
        ['b', 'In the bathroom!', '🛁', false],
        ['c', 'On Monday bakery!', '🥐', false],
      ]),
      makeQ('l27-q4', '🐻‍❄️', 'White polar bears swim near icebergs in the freezing:', 'Kutup ayıları nerede yaşar?', [
        ['a', 'In the icy Arctic!', '❄️', true],
        ['b', 'Inside the bakery!', '🥐', false],
        ['c', 'Under a pizza!', '🍕', false],
      ]),
      makeQ('l27-q5', '🌱', 'Throw trash into recycling bins and plant trees so we can:', 'Geri dönüşüm yapıp ağaç dikerek ne yapmış oluruz?', [
        ['a', 'Protect our green nature!', '🌱', true],
        ['b', 'Melt all the whales!', '🐋', false],
        ['c', 'Wear wet scarves!', '🧣', false],
      ]),
      makeQ('l27-q6', '🌋', 'Which famous mountain bursts with hot glowing lava inside?', 'İçinde sıcak lav bulunan dağ hangisidir?', [
        ['a', 'A volcano!', '🌋', true],
        ['b', 'A weekend!', '📅', false],
        ['c', 'A coin wallet!', '🪙', false],
      ]),
      makeQ('l27-q7', '🦁', 'Where do lions live? Finish the full sentence cleanly:', 'Aslanların nerede yaşadığını tam cümleyle söyle:', [
        ['a', 'Lions live in sunny grasslands!', '🦁', true],
        ['b', 'Lions live by euro coins!', '💶', false],
        ['c', 'Lions live headache stairs!', '🪜', false],
      ]),
      makeQ('l27-q8', '❓', 'Checker Tobi asks: "___ does a penguin live?"', '"Penguen nerede yaşar?" sorusunun başı nedir?', [
        ['a', 'Where does a penguin live?', '🐧', true],
        ['b', 'How much does a penguin sneeze?', '🤧', false],
        ['c', 'Whose desert is Tuesday?', '🏜️', false],
      ]),
      makeQ('l27-q9', '🪙', '🔄 Tekrar: You buy a nature magazine. Ask the price:', '🔄 Tekrar (Bölüm 27): Fiyatı nasıl sorarsın?', [
        ['a', 'How much is it?', '🏷️', true],
        ['b', 'Where is it jungle?', '🌴', false],
        ['c', 'Wait for desert!', '🏜️', false],
      ], true),
      makeQ('l27-q10', '🔬', '🔄 Tekrar: Why can a wooden log float down a forest river?', '🔄 Tekrar: Neden yüzer?', [
        ['a', 'Because wood floats on water!', '🪵', true],
        ['b', 'Because lions are calendar!', '📅', false],
        ['c', 'Because winter is expensive!', '💎', false],
      ], true),
    ],
  },

  // ================= STOP 29: SPORTS, MUSIC & HOBBIES =================
  {
    id: 'level-28',
    dayNumber: 29,
    shortLabel: 'Stop 29',
    badge: '🏀 Spor, Müzik & Hobiler',
    title: 'Hobbies: Always, Sometimes & Never',
    desc: 'Basketbol, piyano, satranç ve yüzme hobilerini sıklık zarflarıyla anlat!',
    grammarFocus: 'I love playing... / always, sometimes, never + Free-time hobbies',
    vocabFocus: [
      { en: 'Always', tr: 'Her zaman', de: 'Immer', emoji: '💯', exampleEn: 'I always brush my teeth before bed!', exampleTr: 'Yatmadan önce her zaman dişlerimi fırçalarım!' },
      { en: 'Sometimes', tr: 'Bazen', de: 'Manchmal', emoji: '🌗', exampleEn: 'I sometimes play chess with Dad!', exampleTr: 'Bazen babamla satranç oynarım!' },
      { en: 'Never', tr: 'Asla / Hiç', de: 'Niemals', emoji: '🚫', exampleEn: 'I never push my friends in games!', exampleTr: 'Oyunlarda arkadaşlarımı asla itmem!' },
      { en: 'Play chess', tr: 'Satranç oynamak', de: 'Schach spielen', emoji: '♟️', exampleEn: 'Think carefully when you play chess!', exampleTr: 'Satranç oynarken dikkatlice düşün!' },
      { en: 'Practice piano', tr: 'Piyano çalışmak', de: 'Klavier üben', emoji: '🎹', exampleEn: 'I love practicing music on the piano!', exampleTr: 'Piyanoda müzik çalışmayı seviyorum!' },
      { en: 'Teamwork', tr: 'Takım çalışması', de: 'Teamarbeit', emoji: '🏀', exampleEn: 'Passing the ball shows great teamwork!', exampleTr: 'Pas vermek harika takım çalışması gösterir!' },
    ],
    tvRecommendation: {
      title: 'What Do You Like To Do? Hobbies Song (Maple Leaf Learning)',
      channel: 'Maple Leaf Learning',
      duration: '47 sn',
      topicTr: 'Boş zaman hobilerini ve "I like to..." kalıbını öğreten şarkı.',
      searchQuery: 'Maple Leaf Learning What Do You Like To Do Hobbies Song',
    },
    items: [
      {
        id: 'l28-i1',
        time: '5 dk Hobi Sohbeti',
        title: 'Her Zaman mı, Bazen mi? 💯🌗',
        category: 'talk',
        desc: 'Kendi haftandan örnekler ver: "I always play Lego! I sometimes go swimming!"',
        phrasesEn: ['I always build Lego!', 'I sometimes play chess!', 'Teamwork wins games!'],
      },
    ],
    questions: [
      makeQ('l28-q1', '💯', 'Every single day without missing one! Which frequency word fits 100%?', 'Her gün (%100) yapılan işler için hangisi kullanılır?', [
        ['a', 'Always!', '💯', true],
        ['b', 'Never!', '🚫', false],
        ['c', 'Expensive!', '💎', false],
      ]),
      makeQ('l28-q2', '🚫', 'Zero times ever (0%) — you would not touch fire:', 'Hiçbir zaman (%0) anlamındaki kelime hangisidir?', [
        ['a', 'Never!', '🚫', true],
        ['b', 'Always!', '💯', false],
        ['c', 'Saturday!', '🎉', false],
      ]),
      makeQ('l28-q3', '🌗', 'Maybe two days a week (not always, not never):', 'Bazı günler (%50) anlamındaki kelime hangisidir?', [
        ['a', 'Sometimes!', '🌗', true],
        ['b', 'Volcano!', '🌋', false],
        ['c', 'Pajamas!', '🛌', false],
      ]),
      makeQ('l28-q4', '♟️', 'Deniz moves a white knight on a black-and-white board! He loves to:', 'Siyah-beyaz kareli tahtada oynanan akıl oyunu hangisidir?', [
        ['a', 'Play chess!', '♟️', true],
        ['b', 'Sail deserts!', '🏜️', false],
        ['c', 'Wash euros!', '💶', false],
      ]),
      makeQ('l28-q5', '🏀', 'Passing the basketball to help your teammate score is:', 'Takım arkadaşına pas verip birlikte başarmak nedir?', [
        ['a', 'Awesome teamwork!', '🏀', true],
        ['b', 'A loud headache!', '🤕', false],
        ['c', 'A rainy calendar!', '📅', false],
      ]),
      makeQ('l28-q6', '🎹', 'Which hobby uses black and white keys to play melodies?', 'Siyah ve beyaz tuşlarla yapılan müzik hobisi:', [
        ['a', 'Practicing the piano!', '🎹', true],
        ['b', 'Climbing Arctic sand!', '🏖️', false],
        ['c', 'Buying broccoli boots!', '🥦', false],
      ]),
      makeQ('l28-q7', '🎨', 'Leo asks: "What do you like to do in your free time?"', '"Boş zamanında ne yapmayı seversin?" sorusuna cevap:', [
        ['a', 'I love drawing rockets and reading!', '🎨', true],
        ['b', 'Turn left at the bathroom!', '⬅️', false],
        ['c', 'Because it is December coins!', '🪙', false],
      ]),
      makeQ('l28-q8', '🏊', 'Which sport happens in clean blue pool water?', 'Havuzda yapılan spor hangisidir?', [
        ['a', 'Swimming!', '🏊', true],
        ['b', 'Skateboarding volcano!', '🌋', false],
        ['c', 'Bakery scarf!', '🧣', false],
      ]),
      makeQ('l28-q9', '🌊', '🔄 Tekrar: Swimming dolphins live out in the:', '🔄 Tekrar (Bölüm 28): Yunuslar nerede yaşar?', [
        ['a', 'In the ocean!', '🌊', true],
        ['b', 'In a wallet!', '🪙', false],
        ['c', 'In chess!', '♟️', false],
      ], true),
      makeQ('l28-q10', '🎉', '🔄 Tekrar: Which days do you play hobbies all day?', '🔄 Tekrar (Bölüm 26): Okulsuz hafta sonu günleri:', [
        ['a', 'Saturday and Sunday!', '🎉', true],
        ['b', 'Desert and Bakery!', '🥐', false],
        ['c', 'Headache and Scarf!', '🤕', false],
      ], true),
    ],
  },

  // ================= STOP 30: SAFARI PIT-STOP (Reviews Stops 26-29) =================
  {
    id: 'pitstop-6',
    dayNumber: 30,
    isPitStop: true,
    shortLabel: 'Pit-Stop 6',
    badge: '🏁 Safari & Market Tekrar Durağı',
    title: 'Safari Pit-Stop: Calendar, Money, Nature & Hobbies',
    desc: 'Günler, alışveriş, doğa yaşam alanları ve hobileri Safari durağında birleştir!',
    grammarFocus: 'Review: Calendar/Birthdays + Shopping + Animal Habitats + Hobbies/Frequency',
    vocabFocus: [
      { en: 'Weekend adventures', tr: 'Hafta sonu maceraları', de: 'Wochenend-Abenteuer', emoji: '🧭', exampleEn: 'On Saturdays we go on weekend adventures!', exampleTr: 'Cumartesileri hafta sonu maceralarına çıkarız!' },
      { en: 'Ten euros please', tr: 'On euro lütfen', de: 'Zehn Euro bitte', emoji: '💶', exampleEn: 'The big soccer ball is ten euros, please!', exampleTr: 'Büyük futbol topu on euro lütfen!' },
      { en: 'Safe green forests', tr: 'Güvenli yeşil ormanlar', de: 'Sichere grüne Wälder', emoji: '🌲', exampleEn: 'Animals need safe green forests to live!', exampleTr: 'Hayvanların yaşamak için güvenli ormanlara ihtiyacı var!' },
      { en: 'I always try', tr: 'Her zaman denerim', de: 'Ich versuche es immer', emoji: '🌟', exampleEn: 'I always try my best in English!', exampleTr: 'İngilizcede her zaman elimden gelenin en iyisini yaparım!' },
      { en: 'Birthday present', tr: 'Doğum günü hediyesi', de: 'Geburtstagsgeschenk', emoji: '🎁', exampleEn: 'I bought a cool Lego birthday present!', exampleTr: 'Harika bir Lego doğum günü hediyesi aldım!' },
      { en: 'Save our oceans', tr: 'Okyanuslarımızı koruyalım', de: 'Schützt unsere Ozeane', emoji: '🌊', exampleEn: 'Let’s keep plastic out and save our oceans!', exampleTr: 'Plastiği dışarıda tutup okyanuslarımızı koruyalım!' },
    ],
    tvRecommendation: {
      title: 'Months of the Year Safari Review Song (The Singing Walrus)',
      channel: 'The Singing Walrus',
      duration: '47 sn',
      topicTr: 'Yılın aylarını ve safari bölümünü kutlayan tekrar şarkısı.',
      searchQuery: 'The Singing Walrus Months of the Year Song',
    },
    items: [
      {
        id: 'ps6-i1',
        time: '5 dk Safari Buluşması',
        title: 'Doğum Günü Hediyesi Al! 🎁🪙🌴',
        category: 'talk',
        desc: 'Takvim, fiyat ve doğayı birleştir: "Today is Sunday! How much is this polar bear toy? Five euros!"',
        phrasesEn: ['Today is Saturday!', 'How much is the gift?', 'Polar bears live in the Arctic!'],
      },
    ],
    questions: [
      makeQ('ps6-q1', '🎁', 'You buy a Lego box for your friend’s party. You ask the clerk:', 'Hediye alırken fiyatını nasıl sorarsın?', [
        ['a', 'How much is this Lego box?', '🏷️', true],
        ['b', 'Where is December headache?', '🤒', false],
        ['c', 'Why do coins swim?', '🪙', false],
      ], true),
      makeQ('ps6-q2', '🌴', 'Where do colorful parrots and monkeys swing in trees?', 'Papağanlar ve maymunlar nerede yaşar?', [
        ['a', 'In the jungle!', '🌴', true],
        ['b', 'In a shopping bag!', '👜', false],
        ['c', 'On chess keys!', '♟️', false],
      ], true),
      makeQ('ps6-q3', '💯', 'When you play piano EVERY afternoon without skipping, you ___ practice!', 'Her gün aksatmadan çalışıyorsan:', [
        ['a', 'Always practice!', '💯', true],
        ['b', 'Never practice!', '🚫', false],
        ['c', 'Expensive practice!', '💎', false],
      ], true),
      makeQ('ps6-q4', '🎂', 'A friend hands you a gift bag on your birthday. You smile and say:', 'Hediye alınca ne dersin?', [
        ['a', 'Thank you! I am so excited!', '🥳', true],
        ['b', 'I never brush teeth!', '🪥', false],
        ['c', 'Turn left to Arctic!', '⬅️', false],
      ], true),
      makeQ('ps6-q5', '🏜️', 'Which habitat has lots of hot sand, camels, and very little rain?', 'Az yağmur alan kumlu sıcak yaşam alanı:', [
        ['a', 'The desert!', '🏜️', true],
        ['b', 'The library!', '📚', false],
        ['c', 'The bathroom!', '🛁', false],
      ], true),
      makeQ('ps6-q6', '🏀', 'Passing the ball so everyone gets a turn to shoot shows:', 'Oyunda paslaşıp birlikte kazanmaya ne denir?', [
        ['a', 'Great teamwork!', '🏀', true],
        ['b', 'Heavy volcano!', '🌋', false],
        ['c', 'Yesterday scarf!', '🧣', false],
      ], true),
      makeQ('ps6-q7', '🪙', 'A sticker costs 1 euro, not 100 euros. So the sticker is:', 'Çok ucuz olan bir şey için:', [
        ['a', 'Very cheap!', '🪙', true],
        ['b', 'Very Arctic!', '🐻‍❄️', false],
        ['c', 'Very sleepy!', '😴', false],
      ], true),
      makeQ('ps6-q8', '📅', 'Friday finished! Which weekend day comes right next?', 'Cumadan hemen sonra hangi hafta sonu günü gelir?', [
        ['a', 'Saturday!', '🎉', true],
        ['b', 'Monday!', '🎒', false],
        ['c', 'Wednesday!', '📅', false],
      ], true),
      makeQ('ps6-q9', '🌱', 'Why should people plant trees and recycle plastic bottles?', 'İnsanlar neden ağaç dikip geri dönüşüm yapmalı?', [
        ['a', 'To protect nature and animals!', '🌱', true],
        ['b', 'To climb a subway stairs!', '🪜', false],
        ['c', 'To buy headache pudding!', '🍮', false],
      ], true),
      makeQ('ps6-q10', '🙌', 'You pay 5 euros at the counter and hand over your coins:', 'Parayı uzatırken ne söylersin?', [
        ['a', 'Here you are!', '🙌', true],
        ['b', 'What day is winter?', '⛄', false],
        ['c', 'He are brave!', '🦁', false],
      ], true),
    ],
  },

  // ================= STOP 35: STORYTELLER'S BRIDGE =================
  {
    id: 'level-29',
    dayNumber: 35,
    shortLabel: 'Stop 35',
    badge: '📖 Hikaye Anlatıcısı Köprüsü',
    title: 'Storyteller’s Bridge: First, Next, Then, Finally!',
    desc: 'Kendi İngilizce hikayeni sırayla ve heyecanlı bağlaçlarla anlatmayı öğren!',
    grammarFocus: 'Story Sequencing: First, Next, Then, Finally / Suddenly / What a great day!',
    vocabFocus: [
      { en: 'Once upon a time', tr: 'Bir varmış bir yokmuş', de: 'Es war einmal', emoji: '✨', exampleEn: 'Once upon a time, a brave boy built a rocket!', exampleTr: 'Bir zamanlar cesur bir çocuk roket yaptı!' },
      { en: 'First', tr: 'İlk olarak', de: 'Zuerst', emoji: '1️⃣', exampleEn: 'First, we packed our blue backpacks!', exampleTr: 'İlk olarak mavi çantalarımızı hazırladık!' },
      { en: 'Next & Then', tr: 'Sonra ve Ardından', de: 'Als Nächstes & Dann', emoji: '2️⃣', exampleEn: 'Next we found a map, then we crossed the bridge!', exampleTr: 'Sonra bir harita bulduk, ardından köprüyü geçtik!' },
      { en: 'Suddenly', tr: 'Aniden / Birdenbire', de: 'Plötzlich', emoji: '⚡', exampleEn: 'Suddenly, a friendly dolphin jumped!', exampleTr: 'Birdenbire dost canlısı bir yunus zıpladı!' },
      { en: 'Finally', tr: 'Sonunda / Nihayet', de: 'Schließlich', emoji: '🏁', exampleEn: 'Finally, we found the golden star chest!', exampleTr: 'Sonunda altın yıldız sandığını bulduk!' },
      { en: 'What a great day!', tr: 'Ne harika bir gün!', de: 'Was für ein toller Tag!', emoji: '🥳', exampleEn: 'We laughed together — what a great day!', exampleTr: 'Birlikte güldük — ne harika bir gün!' },
    ],
    tvRecommendation: {
      title: 'Sequencing: First, Next, Then, Finally (Scratch Garden)',
      channel: 'Scratch Garden',
      duration: '47 sn',
      topicTr: 'Olayları sırayla anlatmayı ("First, Next, Then, Finally") öğreten eğlenceli şarkı.',
      searchQuery: 'Scratch Garden Sequencing First Next Then Finally',
    },
    items: [
      {
        id: 'l29-i1',
        time: '6 dk Hikaye Kurma',
        title: '4 Adımlı Mini Macera Anlat! 📖✨',
        category: 'mission',
        desc: 'Dünkü bir olayını sırayla anlat: "First I woke up. Next I played basketball. Finally I ate spaghetti!"',
        phrasesEn: ['First, I built a Lego car!', 'Suddenly, it zoomed fast!', 'Finally, everyone cheered!'],
      },
    ],
    questions: [
      makeQ('l29-q1', '1️⃣', 'How do you begin Step #1 when telling a story in order?', 'Hikayenin ilk adımını başlatırken hangi kelime gelir?', [
        ['a', 'First!', '1️⃣', true],
        ['b', 'Finally!', '🏁', false],
        ['c', 'Expensive!', '💎', false],
      ]),
      makeQ('l29-q2', '🏁', 'Which word tells everyone the story reached its happy ENDING?', 'Hikayenin son adımını hangi kelime anlatır?', [
        ['a', 'Finally!', '🏁', true],
        ['b', 'First!', '1️⃣', false],
        ['c', 'Headache!', '🤕', false],
      ]),
      makeQ('l29-q3', '✨', 'A fairy tale or adventure often opens with classic magic words:', 'Masal başlangıcı hangi kalıpla başlar?', [
        ['a', 'Once upon a time!', '✨', true],
        ['b', 'Five euros, please!', '💶', false],
        ['c', 'Touch your knees!', '🦵', false],
      ]),
      makeQ('l29-q4', '⚡', 'Everything is quiet, and then BANG — a surprise happens fast! Which word fits?', 'Her şey sakinken birdenbire olan sürpriz için:', [
        ['a', 'Suddenly!', '⚡', true],
        ['b', 'Yesterday stairs!', '🪜', false],
        ['c', 'Bathroom scarf!', '🧣', false],
      ]),
      makeQ('l29-q5', '2️⃣', 'Put these three words in order: 1. First, 2. ___, 3. Finally.', 'Sıralamada 2. adıma hangisi gelir?', [
        ['a', 'Next or Then!', '2️⃣', true],
        ['b', 'Once upon!', '✨', false],
        ['c', 'Broccoli!', '🥦', false],
      ]),
      makeQ('l29-q6', '🥳', 'At the end of an amazing sunny picnic with friends, you smile and say:', 'Harika bir günün sonunda ne dersin?', [
        ['a', 'What a great day!', '🥳', true],
        ['b', 'What day is bakery?', '🥐', false],
        ['c', 'Where floats Monday?', '⛵', false],
      ]),
      makeQ('l29-q7', '🚀', 'Read this mini story: "First we built a rocket. ___ we flew to Mars!"', 'İlk cümleden sonra devamı hangisi olabilir?', [
        ['a', 'Then we flew to Mars!', '🚀', true],
        ['b', 'First it is Tuesday coat!', '🧥', false],
        ['c', 'How much is Mars?', '🏷️', false],
      ]),
      makeQ('l29-q8', '🦁', 'In stories, what kind of hero faces dragons without giving up?', 'Hikayelerde pes etmeyen kahraman nasıldır?', [
        ['a', 'Brave and clever!', '🦁', true],
        ['b', 'Tummy ache and rainy!', '🌧️', false],
        ['c', 'Cheap and stairs!', '🪜', false],
      ]),
      makeQ('l29-q9', '⏳', '🔄 Tekrar: Stories usually happen in the past: "Yesterday I ___ a rocket!"', '🔄 Tekrar (Bölüm 31): Geçmiş zamanda "gördüm" nasıl söylenir?', [
        ['a', 'Yesterday I saw a rocket!', '👀', true],
        ['b', 'Tomorrow I saw a rocket!', '🗓️', false],
        ['c', 'Today I wears rocket!', '🚀', false],
      ], true),
      makeQ('l29-q10', '🔭', '🔄 Tekrar: How many planets orbit our Sun in space?', '🔄 Tekrar (Bölüm 34): Güneş sisteminde kaç gezegen vardır?', [
        ['a', 'Eight planets!', '🪐', true],
        ['b', 'Two croissants!', '🥐', false],
        ['c', 'Twenty scarves!', '🧣', false],
      ], true),
    ],
  },

  // ================= STOP 36: GRAND FINALE CELEBRATION (+ FIREWORKS!) =================
  {
    id: 'pitstop-7',
    dayNumber: 36,
    isPitStop: true,
    isGrandFinale: true,
    shortLabel: 'Grand Finale',
    badge: '🎆 Büyük Final Kutlaması!',
    title: 'Grand Finale: Island Champion Fireworks Party!',
    desc: 'Tüm adayı fetheden Deniz için dev İngilizce şampiyonluk partisi ve havai fişek kutlaması!',
    grammarFocus: 'Master Celebration: Past, Present, Future, Science, Stories & Polite Real Talk',
    vocabFocus: [
      { en: 'I am an English champion!', tr: 'Ben bir İngilizce şampiyonuyum!', de: 'Ich bin ein Englisch-Champion!', emoji: '🏆', exampleEn: 'Look at all my stars — I am an English champion!', exampleTr: 'Tüm yıldızlarıma bak — ben bir İngilizce şampiyonuyum!' },
      { en: 'I did it!', tr: 'Başardım!', de: 'Ich habe es geschafft!', emoji: '🙌', exampleEn: 'Woohoo! Thirty-six stops finished! I did it!', exampleTr: 'Yaşasın! Otuz altı durak bitti! Başardım!' },
      { en: 'Watch the fireworks!', tr: 'Havai fişekleri izle!', de: 'Schau dir das Feuerwerk an!', emoji: '🎆', exampleEn: 'Gold, blue, and pink — watch the fireworks!', exampleTr: 'Altın, mavi ve pembe — havai fişekleri izle!' },
      { en: 'I can speak English', tr: 'İngilizce konuşabiliyorum', de: 'Ich kann Englisch sprechen', emoji: '🎙️', exampleEn: 'I can read books and speak English with Leo!', exampleTr: 'Kitap okuyabiliyorum ve Leo ile İngilizce konuşabiliyorum!' },
      { en: 'I love learning!', tr: 'Öğrenmeyi seviyorum!', de: 'Ich liebe es zu lernen!', emoji: '🌟', exampleEn: 'Science, stories, and games — I love learning!', exampleTr: 'Bilim, hikayeler ve oyunlar — öğrenmeyi seviyorum!' },
      { en: 'See you on the next adventure!', tr: 'Sonraki macerada görüşürüz!', de: 'Bis zum nächsten Abenteuer!', emoji: '🚀', exampleEn: 'Way to go, Deniz! See you on the next adventure!', exampleTr: 'Harika iş Deniz! Sonraki macerada görüşürüz!' },
    ],
    tvRecommendation: {
      title: 'Party Freeze Dance Finale Celebration (The Kiboomers)',
      channel: 'The Kiboomers',
      duration: '52 sn',
      topicTr: '36. durak büyük finali dans ve kutlama şarkısı.',
      searchQuery: 'The Kiboomers Party Freeze Dance Song',
    },
    items: [
      {
        id: 'ps7-i1',
        time: '10 dk Büyük Final',
        title: 'Şampiyonluk Konuşması & Havai Fişek! 🎆🏆',
        category: 'mission',
        desc: 'Deniz geçmiş, şimdiki ve gelecek zamanla kendini tanıtsın: "My name is Deniz. I live in Aachen. Yesterday I played basketball. Tomorrow I will build rockets!"',
        phrasesEn: ['I am an English champion!', 'Watch the fireworks!', 'I did it!'],
      },
    ],
    questions: [
      makeQ('ps7-q1', '🎆', 'You reached Stop 36 at the top of Sky Citadel! Shout together:', '36. durak büyük finale ulaşınca hep birlikte ne bağırırız?', [
        ['a', 'I did it! Watch the fireworks!', '🎆', true],
        ['b', 'Wait for broccoli stairs!', '🥦', false],
        ['c', 'I have got a headache coat!', '🤕', false],
      ], true),
      makeQ('ps7-q2', '⏳', 'Talk about YESTERDAY: "Yesterday I ___ to the science museum with Dad!"', 'Dün müzeye GİTTİM demek için doğru geçmiş zaman hangisi?', [
        ['a', 'Yesterday I went to the museum!', '🏛️', true],
        ['b', 'Yesterday I going snow!', '❄️', false],
        ['c', 'Yesterday I tomorrow cake!', '🎂', false],
      ], true),
      makeQ('ps7-q3', '🚀', 'Talk about your FUTURE dream: "Tomorrow I ___ build a moon rocket!"', 'Gelecek zaman için "Yarın yapacağım" nasıl kurulur?', [
        ['a', 'Tomorrow I will build a rocket!', '🚀', true],
        ['b', 'Tomorrow I ate spaghetti!', '🍝', false],
        ['c', 'Tomorrow I am under sofa!', '🛋️', false],
      ], true),
      makeQ('ps7-q4', '🌍', 'Put a story in clean order: First, ___, Then, Finally!', 'Hikaye sıralamasını tamamla:', [
        ['a', 'Next!', '2️⃣', true],
        ['b', 'Expensive!', '💎', false],
        ['c', 'Tummy!', '🤢', false],
      ], true),
      makeQ('ps7-q5', '🪙', 'At a toy store in London, you want to know a Lego set’s price. Ask:', 'İngilterede oyuncak fiyatını kibarca nasıl sorarsın?', [
        ['a', 'Excuse me, how much is this, please?', '🏷️', true],
        ['b', 'Where do whales wear scarves?', '🐋', false],
        ['c', 'Freeze on Thursday!', '📅', false],
      ], true),
      makeQ('ps7-q6', '🩺', 'At the doctor’s office, how do you wish someone quick healing?', 'Birine "Çabuk iyileş / Geçmiş olsun" nasıl dersin?', [
        ['a', 'Feel better soon!', '🌟', true],
        ['b', 'Turn right at December!', '➡️', false],
        ['c', 'That is a volcano bus!', '🚌', false],
      ], true),
      makeQ('ps7-q7', '🦕', 'Science & Comparison: Which animal is THE BIGGEST on Earth?', 'Dünyadaki EN BÜYÜK hayvan hangisidir?', [
        ['a', 'The blue whale is the biggest!', '🐋', true],
        ['b', 'The mouse is the tallest building!', '🐭', false],
        ['c', 'Raincoats are the fastest planets!', '🪐', false],
      ], true),
      makeQ('ps7-q8', '⛈️', 'Why should you wear a raincoat when dark clouds pour rain?', 'Neden yağmurluk giyeriz?', [
        ['a', 'Because it is rainy outside!', '🌧️', true],
        ['b', 'Because Monday is desert!', '🏜️', false],
        ['c', 'Because pianos float!', '🎹', false],
      ], true),
      makeQ('ps7-q9', '🙏', 'Polite superstar check: Ask for an apple and thank the helper:', 'Kibarca elma isteyip teşekkür et:', [
        ['a', 'Can I have an apple, please? Thank you!', '🍎', true],
        ['b', 'Give apple faster volcano!', '🌋', false],
        ['c', 'My cousin is twelve stairs!', '🪜', false],
      ], true),
      makeQ('ps7-q10', '🏆', 'Look back at everything you learned! How do you feel right now?', 'Tüm adayı bitiren bir İngilizce şampiyonu nasıl hisseder?', [
        ['a', 'Proud, brave, and ready for more!', '🏆', true],
        ['b', 'Never hungry bakery shoes!', '👟', false],
        ['c', 'Sleeping under twenty planets!', '🪐', false],
      ], true),
    ],
  },
];
