// Extended Sing-Along Chants, Visual Mini-Lessons & Pattern Builders for Stops 5, 10-15, 20-30, 35-36
export const EXTENDED_DAY_LESSONS = {
  'pitstop-1': {
    songTitle: "If You're Happy! Beach Review Song 🏖️",
    songSubtitleTr: 'Önce YouTube şarkısını izle, sonra Leo ile ilk 4 durağı tekrar et!',
    youtubeClip: {
      videoId: 'l4WNrvVjiTw',
      title: "If You're Happy! Beach Review Song (Super Simple Songs)",
      start: 5,
      end: 55,
    },
    chantLines: [
      { emoji: '🙏', en: 'Can I have water, please? Thank you!', tr: 'Su alabilir miyim lütfen? Teşekkürler!' },
      { emoji: '🚲', en: 'I have got a fast red bike!', tr: 'Hızlı kırmızı bir bisikletim var!' },
      { emoji: '🦘', en: 'Yes, I can jump very high!', tr: 'Evet, çok yükseğe zıplayabilirim!' },
      { emoji: '🏁', en: 'Ready, steady, go! Good game!', tr: 'Hazır, dikkat, başla! Güzel oyundu!' },
    ],
    visualCards: [
      { emoji: '🙏✨', animClass: 'hover:scale-110', badge: 'POLITE', badgeColor: 'bg-emerald-600 text-white', en: 'Please and thank you!', tr: 'Her zaman nazik ol!', de: 'Bitte und danke!' },
      { emoji: '🚲🎯', animClass: 'hover:translate-x-2', badge: 'HAVE GOT', badgeColor: 'bg-sky-600 text-white', en: 'I have got my favorite toys!', tr: 'Oyuncaklarım var!', de: 'Ich habe meine Spielzeuge!' },
      { emoji: '🤝🏆', animClass: 'hover:-translate-y-1', badge: 'GOOD GAME', badgeColor: 'bg-amber-500 text-slate-950', en: 'High five! That was a good game!', tr: 'Çak bir beşlik! Güzel oyundu!', de: 'Gutes Spiel!' },
    ],
    patterns: [
      {
        id: 'ps1-p1',
        titleTr: 'Plaj Tekrar Kalıbı',
        templateBefore: 'I have got',
        templateAfter: 'and I love it!',
        options: [
          { emoji: '🚲', word: 'a red bike', fullEn: 'I have got a red bike and I love it!', tr: 'Kırmızı bisikletim var ve çok seviyorum!', de: 'Ich habe ein rotes Fahrrad!' },
          { emoji: '🧱', word: 'blue Lego', fullEn: 'I have got blue Lego and I love it!', tr: 'Mavi Legom var ve çok seviyorum!', de: 'Ich habe blaues Lego!' },
          { emoji: '🏀', word: 'a basketball', fullEn: 'I have got a basketball and I love it!', tr: 'Basketbol topum var ve çok seviyorum!', de: 'Ich habe einen Basketball!' },
          { emoji: '📘', word: 'a story book', fullEn: 'I have got a story book and I love it!', tr: 'Hikaye kitabım var ve çok seviyorum!', de: 'Ich habe ein Geschichtenbuch!' },
        ],
      },
      {
        id: 'ps1-p2',
        titleTr: 'Nezaket ve Oyun',
        templateBefore: 'Ready, steady, go!',
        templateAfter: '',
        options: [
          { emoji: '🎮', word: 'It is your turn!', fullEn: 'Ready, steady, go! It is your turn!', tr: 'Hazır, başla! Senin sıran!', de: 'Du bist dran!' },
          { emoji: '🤝', word: 'Good game!', fullEn: 'Ready, steady, go! Good game!', tr: 'Hazır, başla! Güzel oyundu!', de: 'Gutes Spiel!' },
          { emoji: '⏳', word: 'Wait for me!', fullEn: 'Ready, steady, go! Wait for me!', tr: 'Hazır, başla! Beni bekle!', de: 'Warte auf mich!' },
          { emoji: '💪', word: 'Yes, I can!', fullEn: 'Ready, steady, go! Yes, I can!', tr: 'Hazır, başla! Evet yapabilirim!', de: 'Ja, ich kann!' },
        ],
      },
    ],
  },

  'pitstop-2': {
    songTitle: 'Head Shoulders Knees And Toes! Woods Review 🌲',
    songSubtitleTr: 'Önce YouTube şarkısını izle, sonra ormanda öğrendiklerimizi kutla!',
    youtubeClip: {
      videoId: 'RuqvGiZi0qg',
      title: 'Head Shoulders Knees And Toes (Super Simple Songs)',
      start: 5,
      end: 50,
    },
    chantLines: [
      { emoji: '💃', en: 'I am clapping and dancing now!', tr: 'Şimdi alkışlıyor ve dans ediyorum!' },
      { emoji: '🔢', en: 'There are twenty stars in the forest!', tr: 'Ormanda yirmi yıldız var!' },
      { emoji: '🌳', en: 'The fox sits under the tall tree!', tr: 'Tilki uzun ağacın altında oturuyor!' },
      { emoji: '⛵', en: 'Why does the wood float? Because it is light!', tr: 'Tahta neden yüzer? Çünkü hafiftir!' },
    ],
    visualCards: [
      { emoji: '🏃💨', animClass: 'hover:scale-110', badge: '-ING NOW', badgeColor: 'bg-emerald-600 text-white', en: 'I am clapping and jumping!', tr: 'Şu an alkışlıyor ve zıplıyorum!', de: 'Ich klatsche und springe!' },
      { emoji: '🌉📦', animClass: 'hover:translate-y-1', badge: 'IN / ON / UNDER', badgeColor: 'bg-indigo-600 text-white', en: 'Next to the tree and under the bridge!', tr: 'Ağacın yanında ve köprünün altında!', de: 'Neben dem Baum!' },
      { emoji: '🪨⛵', animClass: 'hover:animate-wobble', badge: 'WHY? BECAUSE!', badgeColor: 'bg-amber-500 text-slate-950', en: 'Why does it sink? Because it is heavy!', tr: 'Neden batar? Çünkü ağırdır!', de: 'Weil es schwer ist!' },
    ],
    patterns: [
      {
        id: 'ps2-p1',
        titleTr: 'Say ve Yerini Bul',
        templateBefore: 'There are twenty frogs',
        templateAfter: '!',
        options: [
          { emoji: '🌳', word: 'next to the tree', fullEn: 'There are twenty frogs next to the tree!', tr: 'Ağacın yanında yirmi kurbağa var!', de: 'Es gibt zwanzig Frösche neben dem Baum!' },
          { emoji: '🌉', word: 'under the bridge', fullEn: 'There are twenty frogs under the bridge!', tr: 'Köprünün altında yirmi kurbağa var!', de: 'Unter der Brücke!' },
          { emoji: '📦', word: 'in the box', fullEn: 'There are twenty frogs in the box!', tr: 'Kutunun içinde yirmi kurbağa var!', de: 'In der Kiste!' },
          { emoji: '🪨', word: 'on the rock', fullEn: 'There are twenty frogs on the rock!', tr: 'Kayanın üstünde yirmi kurbağa var!', de: 'Auf dem Felsen!' },
        ],
      },
      {
        id: 'ps2-p2',
        titleTr: 'Bilim Açıklaması',
        templateBefore: 'It floats because',
        templateAfter: '!',
        options: [
          { emoji: '🪶', word: 'it is light', fullEn: 'It floats because it is light!', tr: 'Yüzer çünkü hafiftir!', de: 'Weil es leicht ist!' },
          { emoji: '🪵', word: 'it is wood', fullEn: 'It floats because it is wood!', tr: 'Yüzer çünkü tahtadır!', de: 'Weil es Holz ist!' },
          { emoji: '⛵', word: 'it has air', fullEn: 'It floats because it has air!', tr: 'Yüzer çünkü içinde hava vardır!', de: 'Weil Luft darin ist!' },
          { emoji: '🦆', word: 'it is a toy duck', fullEn: 'It floats because it is a toy duck!', tr: 'Yüzer çünkü o bir oyuncak ördek!', de: 'Es ist eine Spielzeugente!' },
        ],
      },
    ],
  },

  'level-17': {
    songTitle: 'The People In My Family! 👨‍👩‍👧‍👦',
    songSubtitleTr: 'Aile üyelerini ve He is / She is / They are kalıplarını şarkıyla öğren!',
    youtubeClip: {
      videoId: 'yDua9ms9_eg',
      title: 'The People In My Family (Super Simple Songs)',
      start: 8,
      end: 55,
    },
    chantLines: [
      { emoji: '👵', en: 'My grandma and grandpa love warm stories!', tr: 'Büyükannem ve büyükbabam hikayeleri sever!' },
      { emoji: '😂', en: 'He tells funny jokes! He is funny!', tr: 'Komik şakalar yapıyor! O çok komik!' },
      { emoji: '💛', en: 'She helps everyone! She is kind!', tr: 'Herkese yardım ediyor! O çok iyi kalpli!' },
      { emoji: '🤝', en: 'My parents and cousins are helpful!', tr: 'Annem babam ve kuzenlerim yardımsever!' },
    ],
    visualCards: [
      { emoji: '👦😄', animClass: 'hover:scale-110', badge: 'HE IS', badgeColor: 'bg-blue-600 text-white', en: 'He is my funny grandpa!', tr: 'Erkekler için: He is...', de: 'Er ist mein lustiger Opa!' },
      { emoji: '👧💛', animClass: 'hover:scale-110', badge: 'SHE IS', badgeColor: 'bg-pink-600 text-white', en: 'She is my kind sister!', tr: 'Kadın/kız için: She is...', de: 'Sie ist meine liebe Schwester!' },
      { emoji: '👨‍👩‍👧‍👦🤝', animClass: 'hover:-translate-y-1', badge: 'THEY ARE', badgeColor: 'bg-emerald-600 text-white', en: 'They are always helpful!', tr: 'Birden fazla kişi için: They are...', de: 'Sie sind immer hilfsbereit!' },
    ],
    patterns: [
      {
        id: 'l17-p1',
        titleTr: 'Aileni Tanıtma Kalıbı',
        templateBefore: 'My family is great! He is',
        templateAfter: '!',
        options: [
          { emoji: '😂', word: 'very funny', fullEn: 'My family is great! He is very funny!', tr: 'Ailem harika! O çok komik!', de: 'Er ist sehr lustig!' },
          { emoji: '🛠️', word: 'an engineer', fullEn: 'My family is great! He is an engineer!', tr: 'Ailem harika! O bir mühendis!', de: 'Er ist Ingenieur!' },
          { emoji: '🤝', word: 'super helpful', fullEn: 'My family is great! He is super helpful!', tr: 'Ailem harika! O çok yardımsever!', de: 'Er ist hilfsbereit!' },
          { emoji: '🏀', word: 'fast at basketball', fullEn: 'My family is great! He is fast at basketball!', tr: 'Ailem harika! Basketbolda hızlı!', de: 'Er ist schnell im Basketball!' },
        ],
      },
      {
        id: 'l17-p2',
        titleTr: 'She Is / They Are Kalıbı',
        templateBefore: 'I love my family!',
        templateAfter: '',
        options: [
          { emoji: '👵', word: 'She is my kind grandma!', fullEn: 'I love my family! She is my kind grandma!', tr: 'O benim iyi kalpli büyükannem!', de: 'Sie ist meine liebe Oma!' },
          { emoji: '🙋', word: 'They are my cool cousins!', fullEn: 'I love my family! They are my cool cousins!', tr: 'Onlar benim harika kuzenlerim!', de: 'Sie sind meine coolen Cousins!' },
          { emoji: '👨‍👩‍👦', word: 'They are always helpful!', fullEn: 'I love my family! They are always helpful!', tr: 'Onlar her zaman yardımsever!', de: 'Sie sind immer hilfsbereit!' },
          { emoji: '👧', word: 'She is my best friend!', fullEn: 'I love my family! She is my best friend!', tr: 'O benim en iyi arkadaşım!', de: 'Sie ist meine beste Freundin!' },
        ],
      },
    ],
  },

  'level-18': {
    songTitle: 'Rooms Around The House Song! 🏡',
    songSubtitleTr: 'Önce evin odaları şarkısını izle, sonra Leo ile cümleleri söyle!',
    youtubeClip: {
      videoId: '2sClBxucyf8',
      title: 'In The Kitchen: Rooms Around The House (Noodle & Pals)',
      start: 8,
      end: 55,
    },
    chantLines: [
      { emoji: '🛋️', en: 'We watch cartoons in the living room!', tr: 'Oturma odasında çizgi film izleriz!' },
      { emoji: '🛏️', en: 'My Lego shelf is in the bedroom!', tr: 'Lego rafım yatak odasında!' },
      { emoji: '🛁', en: 'Wash your hands in the bathroom!', tr: 'Ellerini banyoda yıka!' },
      { emoji: '🌷', en: 'Let’s kick the soccer ball in the garden!', tr: 'Bahçede futbol oynayalım!' },
    ],
    visualCards: [
      { emoji: '🛏️✨', animClass: 'hover:scale-110', badge: 'BEDROOM', badgeColor: 'bg-indigo-600 text-white', en: 'Where are you? In my bedroom!', tr: 'Yatak odamdayım!', de: 'Im Schlafzimmer!' },
      { emoji: '🍳🍝', animClass: 'hover:translate-x-1', badge: 'KITCHEN', badgeColor: 'bg-amber-500 text-slate-950', en: 'Dad cooks spaghetti in the kitchen!', tr: 'Baba mutfakta spagetti pişiriyor!', de: 'Papa kocht in der Küche!' },
      { emoji: '🪜🪴', animClass: 'hover:-translate-y-1', badge: 'UPSTAIRS', badgeColor: 'bg-emerald-600 text-white', en: 'Go up the stairs to the sunny balcony!', tr: 'Merdivenlerden güneşli balkona çık!', de: 'Die Treppe hoch zum Balkon!' },
    ],
    patterns: [
      {
        id: 'l18-p1',
        titleTr: 'Hangi Odadasın?',
        templateBefore: 'Look! I am in the',
        templateAfter: '!',
        options: [
          { emoji: '🛋️', word: 'living room', fullEn: 'Look! I am in the living room!', tr: 'Bak! Oturma odasındayım!', de: 'Ich bin im Wohnzimmer!' },
          { emoji: '🛏️', word: 'bedroom', fullEn: 'Look! I am in the bedroom!', tr: 'Bak! Yatak odasındayım!', de: 'Ich bin im Schlafzimmer!' },
          { emoji: '🛁', word: 'bathroom', fullEn: 'Look! I am in the bathroom!', tr: 'Bak! Banyodayım!', de: 'Ich bin im Badezimmer!' },
          { emoji: '🌷', word: 'garden', fullEn: 'Look! I am in the garden!', tr: 'Bak! Bahçedeyim!', de: 'Ich bin im Garten!' },
        ],
      },
      {
        id: 'l18-p2',
        titleTr: 'Evde Neler Var?',
        templateBefore: 'There are flowers on the',
        templateAfter: '!',
        options: [
          { emoji: '🪴', word: 'balcony', fullEn: 'There are flowers on the balcony!', tr: 'Balkonda çiçekler var!', de: 'Auf dem Balkon sind Blumen!' },
          { emoji: '🪵', word: 'living room table', fullEn: 'There are flowers on the living room table!', tr: 'Oturma odası masasında çiçekler var!', de: 'Auf dem Wohnzimmertisch!' },
          { emoji: '🪟', word: 'kitchen window', fullEn: 'There are flowers on the kitchen window!', tr: 'Mutfak penceresinde çiçekler var!', de: 'Am Küchenfenster!' },
          { emoji: '🌷', word: 'sunny garden wall', fullEn: 'There are flowers on the sunny garden wall!', tr: 'Güneşli bahçe duvarında çiçekler var!', de: 'An der Gartenmauer!' },
        ],
      },
    ],
  },

  'level-19': {
    songTitle: 'Sun, Rain, Wind & Snow Weather Song! 🌦️',
    songSubtitleTr: 'Hava durumunu ve 4 mevsimi şarkıyla söyle!',
    youtubeClip: {
      videoId: 'tfAB4BXSHOA',
      title: 'Weather Song: Sun, Rain, Wind, and Snow (The Singing Walrus)',
      start: 8,
      end: 55,
    },
    chantLines: [
      { emoji: '🌤️', en: 'Look out the window! How is the weather?', tr: 'Pencereden bak! Hava nasıl?' },
      { emoji: '💨', en: 'Windy leaves blow round and round!', tr: 'Rüzgarlı yapraklar dönüp duruyor!' },
      { emoji: '🌈', en: 'Spot the bright rainbow after the rain!', tr: 'Yağmurdan sonra parlak gökkuşağını gör!' },
      { emoji: '⛄', en: 'Summer is sunny, winter brings snow!', tr: 'Yaz güneşlidir, kış kar getirir!' },
    ],
    visualCards: [
      { emoji: '💨☁️', animClass: 'hover:translate-x-2', badge: 'WEATHER', badgeColor: 'bg-sky-600 text-white', en: 'It is windy and cloudy today!', tr: 'Bugün hava rüzgarlı ve bulutlu!', de: 'Es ist windig und wolkig!' },
      { emoji: '🌸☀️', animClass: 'hover:scale-110', badge: 'SPRING & SUMMER', badgeColor: 'bg-amber-500 text-slate-950', en: 'Spring flowers and hot summer sun!', tr: 'Bahar çiçekleri ve sıcak yaz güneşi!', de: 'Frühling und Sommer!' },
      { emoji: '🍂⛄', animClass: 'hover:animate-wobble', badge: 'AUTUMN & WINTER', badgeColor: 'bg-indigo-600 text-white', en: 'Red leaves in autumn, snowmen in winter!', tr: 'Sonbaharda kırmızı yapraklar, kışın kardan adam!', de: 'Herbst und Winter!' },
    ],
    patterns: [
      {
        id: 'l19-p1',
        titleTr: 'Hava Raporu Ver',
        templateBefore: 'Today outside, it is',
        templateAfter: '!',
        options: [
          { emoji: '💨', word: 'windy and cool', fullEn: 'Today outside, it is windy and cool!', tr: 'Bugün dışarısı rüzgarlı ve serin!', de: 'Es ist windig und kühl!' },
          { emoji: '☁️', word: 'cloudy', fullEn: 'Today outside, it is cloudy!', tr: 'Bugün dışarısı bulutlu!', de: 'Es ist wolkig!' },
          { emoji: '🌈', word: 'sunny with a rainbow', fullEn: 'Today outside, it is sunny with a rainbow!', tr: 'Güneşli ve gökkuşağı var!', de: 'Sonnig mit einem Regenbogen!' },
          { emoji: '⛄', word: 'snowy', fullEn: 'Today outside, it is snowy!', tr: 'Bugün dışarısı karlı!', de: 'Es schneit!' },
        ],
      },
      {
        id: 'l19-p2',
        titleTr: 'Mevsimleri Anlat',
        templateBefore: 'My favorite season is',
        templateAfter: '!',
        options: [
          { emoji: '☀️', word: 'sunny summer', fullEn: 'My favorite season is sunny summer!', tr: 'En sevdiğim mevsim güneşli yaz!', de: 'Mein Lieblingsjahreszeit ist Sommer!' },
          { emoji: '🌸', word: 'colorful spring', fullEn: 'My favorite season is colorful spring!', tr: 'En sevdiğim mevsim renkli ilkbahar!', de: 'Der bunte Frühling!' },
          { emoji: '🍂', word: 'golden autumn', fullEn: 'My favorite season is golden autumn!', tr: 'En sevdiğim mevsim altın sonbahar!', de: 'Der goldene Herbst!' },
          { emoji: '⛄', word: 'snowy winter', fullEn: 'My favorite season is snowy winter!', tr: 'En sevdiğim mevsim karlı kış!', de: 'Der verschneite Winter!' },
        ],
      },
    ],
  },

  'level-20': {
    songTitle: 'Put On Your Shoes! Get Dressed Song 🧥',
    songSubtitleTr: 'Kıyafet şarkısını dinle, hava durumuna uygun giyinmeyi öğren!',
    youtubeClip: {
      videoId: '-jBfb33_KHU',
      title: 'Put On Your Shoes Clothing Song (Super Simple Songs)',
      start: 8,
      end: 55,
    },
    chantLines: [
      { emoji: '🧥', en: 'Put on your warm jacket and scarf!', tr: 'Sıcak montunu ve atkını giy!' },
      { emoji: '👟', en: 'Lace up your fast basketball sneakers!', tr: 'Hızlı basketbol ayakkabılarını bağla!' },
      { emoji: '🥾', en: 'Raincoat and boots keep puddles away!', tr: 'Yağmurluk ve çizme su birikintilerinden korur!' },
      { emoji: '🛌', en: 'Cozy pajamas when it is time for sleep!', tr: 'Uyku zamanında rahat pijamalar!' },
    ],
    visualCards: [
      { emoji: '👕😎', animClass: 'hover:scale-110', badge: 'I AM WEARING', badgeColor: 'bg-blue-600 text-white', en: 'I am wearing a cool Lego shirt!', tr: 'Havalı bir Lego tişörtü giyiyorum!', de: 'Ich trage ein Lego-T-Shirt!' },
      { emoji: '🕶️🧢', animClass: 'hover:-translate-y-1', badge: 'SUNNY GEAR', badgeColor: 'bg-amber-500 text-slate-950', en: 'Put on sunglasses and a sunny cap!', tr: 'Güneş gözlüğü ve şapka tak!', de: 'Sonnenbrille und Kappe aufsetzen!' },
      { emoji: '🥾☂️', animClass: 'hover:animate-wobble', badge: 'RAINY GEAR', badgeColor: 'bg-cyan-600 text-white', en: 'Wear a raincoat and rubber boots!', tr: 'Yağmurluk ve lastik çizme giy!', de: 'Regenmantel und Gummistiefel tragen!' },
    ],
    patterns: [
      {
        id: 'l20-p1',
        titleTr: 'Bugün Ne Giyiyorsun?',
        templateBefore: 'Look! I am wearing',
        templateAfter: '!',
        options: [
          { emoji: '👟', word: 'blue sneakers', fullEn: 'Look! I am wearing blue sneakers!', tr: 'Bak! Mavi spor ayakkabı giyiyorum!', de: 'Ich trage blaue Turnschuhe!' },
          { emoji: '🧥', word: 'a warm jacket', fullEn: 'Look! I am wearing a warm jacket!', tr: 'Bak! Sıcak bir mont giyiyorum!', de: 'Ich trage eine warme Jacke!' },
          { emoji: '🕶️', word: 'my sunglasses', fullEn: 'Look! I am wearing my sunglasses!', tr: 'Bak! Güneş gözlüğümü takıyorum!', de: 'Ich trage meine Sonnenbrille!' },
          { emoji: '🛌', word: 'star pajamas', fullEn: 'Look! I am wearing star pajamas!', tr: 'Bak! Yıldızlı pijama giyiyorum!', de: 'Ich trage einen Sternen-Schlafanzug!' },
        ],
      },
      {
        id: 'l20-p2',
        titleTr: 'Dışarı Çıkma Hazırlığı',
        templateBefore: 'Hurry up! Put on your',
        templateAfter: '!',
        options: [
          { emoji: '🥾', word: 'raincoat and boots', fullEn: 'Hurry up! Put on your raincoat and boots!', tr: 'Acele et! Yağmurluğunu ve çizmeni giy!', de: 'Zieh deinen Regenmantel und Stiefel an!' },
          { emoji: '🧣', word: 'winter scarf', fullEn: 'Hurry up! Put on your winter scarf!', tr: 'Acele et! Kış atkını tak!', de: 'Zieh deinen Winterschal an!' },
          { emoji: '🧢', word: 'explorer cap', fullEn: 'Hurry up! Put on your explorer cap!', tr: 'Acele et! Kaşif şapkanı tak!', de: 'Setz deine Entdeckerkappe auf!' },
          { emoji: '👟', word: 'fast sneakers', fullEn: 'Hurry up! Put on your fast sneakers!', tr: 'Acele et! Hızlı spor ayakkabılarını giy!', de: 'Zieh deine Turnschuhe an!' },
        ],
      },
    ],
  },

  'pitstop-3': {
    songTitle: "How's The Weather? Village Review Song! 🏡",
    songSubtitleTr: 'Önce köy tekrar şarkısını dinle, sonra aile, ev, hava ve kıyafetleri birleştir!',
    youtubeClip: {
      videoId: 'rD6FRDd9Hew',
      title: "How's The Weather? Village Review Song (Super Simple Songs)",
      start: 5,
      end: 50,
    },
    chantLines: [
      { emoji: '👴', en: 'Grandpa is reading in the living room!', tr: 'Büyükbaba oturma odasında kitap okuyor!' },
      { emoji: '☂️', en: 'It is rainy! Take your raincoat and umbrella!', tr: 'Yağmur yağıyor! Yağmurluğunu ve şemsiyeni al!' },
      { emoji: '👒', en: 'She is wearing a bright yellow hat!', tr: 'Parlak sarı bir şapka takıyor!' },
      { emoji: '🌸', en: 'We love our sunny spring garden!', tr: 'Güneşli bahar bahçemizi çok severiz!' },
    ],
    visualCards: [
      { emoji: '🏡👨‍👩‍👧‍👦', animClass: 'hover:scale-110', badge: 'FAMILY & HOME', badgeColor: 'bg-emerald-600 text-white', en: 'My kind family lives together!', tr: 'İyi kalpli ailem birlikte yaşıyor!', de: 'Meine liebe Familie lebt zusammen!' },
      { emoji: '🌦️🧥', animClass: 'hover:translate-x-2', badge: 'DRESS RIGHT', badgeColor: 'bg-sky-600 text-white', en: 'Wear a warm winter coat when it snows!', tr: 'Kar yağarken sıcak kışlık mont giy!', de: 'Trage einen warmen Wintermantel!' },
      { emoji: '🌈💐', animClass: 'hover:-translate-y-1', badge: 'SEASONS', badgeColor: 'bg-amber-500 text-slate-950', en: 'Flowers bloom on sunny spring days!', tr: 'Güneşli bahar günlerinde çiçekler açar!', de: 'Im Frühling blühen Blumen!' },
    ],
    patterns: [
      {
        id: 'ps3-p1',
        titleTr: 'Evde Kim Nerede?',
        templateBefore: 'My grandpa is',
        templateAfter: '!',
        options: [
          { emoji: '🛋️', word: 'in the living room', fullEn: 'My grandpa is in the living room!', tr: 'Büyükbabam oturma odasında!', de: 'Mein Opa ist im Wohnzimmer!' },
          { emoji: '🌷', word: 'watering the garden', fullEn: 'My grandpa is watering the garden!', tr: 'Büyükbabam bahçeyi suluyor!', de: 'Mein Opa gießt den Garten!' },
          { emoji: '🪴', word: 'smiling on the balcony', fullEn: 'My grandpa is smiling on the balcony!', tr: 'Büyükbabam balkonda gülümsüyor!', de: 'Auf dem Balkon!' },
          { emoji: '😂', word: 'so funny and kind', fullEn: 'My grandpa is so funny and kind!', tr: 'Büyükbabam çok komik ve iyi kalpli!', de: 'So lustig und nett!' },
        ],
      },
      {
        id: 'ps3-p2',
        titleTr: 'Kıyafet ve Hava Birleşimi',
        templateBefore: 'It is chilly today, so she is wearing',
        templateAfter: '!',
        options: [
          { emoji: '🧥', word: 'a warm winter coat', fullEn: 'It is chilly today, so she is wearing a warm winter coat!', tr: 'Bugün hava serin, o yüzden sıcak kışlık mont giyiyor!', de: 'Sie trägt einen Wintermantel!' },
          { emoji: '🧣', word: 'a cozy red scarf', fullEn: 'It is chilly today, so she is wearing a cozy red scarf!', tr: 'Bugün serin, o yüzden kırmızı atkı takıyor!', de: 'Sie trägt einen roten Schal!' },
          { emoji: '🥾', word: 'raincoat and boots', fullEn: 'It is chilly today, so she is wearing raincoat and boots!', tr: 'Bugün yağmurluk ve çizme giyiyor!', de: 'Regenmantel und Stiefel!' },
          { emoji: '🧢', word: 'a wool hat', fullEn: 'It is chilly today, so she is wearing a wool hat!', tr: 'Bugün yün şapka takıyor!', de: 'Sie trägt eine Wollmütze!' },
        ],
      },
    ],
  },

  'pitstop-4': {
    songTitle: 'What Time Is It? Mountain Review Song! ⏰🏔️',
    songSubtitleTr: 'Önce saat ve soru şarkısını izle, sonra Leo ile dağ zirvesini fethet!',
    youtubeClip: {
      videoId: 'hqnc_PcvoB0',
      title: 'What Time Is It? Telling Time Song (Maple Leaf Learning)',
      start: 5,
      end: 50,
    },
    chantLines: [
      { emoji: '⏰', en: 'Tick tock! What time is it? Eight o’clock!', tr: 'Tik tak! Saat kaç? Saat sekiz!' },
      { emoji: '🕵️', en: 'Detective asks who, what, where, and when!', tr: 'Dedektif kim, ne, nerede ve ne zaman diye sorar!' },
      { emoji: '🏎️', en: 'A race car is faster than a slow bike!', tr: 'Yarış arabası yavaş bisikletten daha hızlıdır!' },
      { emoji: '🏔️', en: 'Look! Everest is the tallest mountain!', tr: 'Bak! Everest en yüksek dağdır!' },
    ],
    visualCards: [
      { emoji: '⏰🕗', animClass: 'hover:scale-110', badge: 'CLOCK', badgeColor: 'bg-sky-600 text-white', en: 'What time is it? It is seven o’clock!', tr: 'Saat kaç? Saat yedi!', de: 'Wie spät ist es? Sieben Uhr!' },
      { emoji: '🐆🐢', animClass: 'hover:translate-x-2', badge: 'FASTER THAN', badgeColor: 'bg-amber-500 text-slate-950', en: 'Faster than a bike, stronger than before!', tr: 'Bisikletten daha hızlı, eskisinden güçlü!', de: 'Schneller und stärker!' },
      { emoji: '🏆🧠', animClass: 'hover:-translate-y-1', badge: 'THE BEST', badgeColor: 'bg-purple-600 text-white', en: 'You are the smartest detective!', tr: 'En zeki dedektif sensin!', de: 'Der klügste Detektiv!' },
    ],
    patterns: [
      {
        id: 'ps4-p1',
        titleTr: 'Dağ Zirvesi Karşılaştırma',
        templateBefore: 'My rocket is',
        templateAfter: '!',
        options: [
          { emoji: '🏎️', word: 'faster than a car', fullEn: 'My rocket is faster than a car!', tr: 'Roketim arabadan daha hızlı!', de: 'Schneller als ein Auto!' },
          { emoji: '🦒', word: 'taller than a giraffe', fullEn: 'My rocket is taller than a giraffe!', tr: 'Roketim zürafadan daha uzun!', de: 'Höher als eine Giraffe!' },
          { emoji: '🐋', word: 'bigger than a whale', fullEn: 'My rocket is bigger than a whale!', tr: 'Roketim balinadan daha büyük!', de: 'Größer als ein Wal!' },
          { emoji: '🏆', word: 'the fastest of all', fullEn: 'My rocket is the fastest of all!', tr: 'Roketim hepsinden en hızlısı!', de: 'Die schnellste von allen!' },
        ],
      },
      {
        id: 'ps4-p2',
        titleTr: '5N1K Dedektif Soruları',
        templateBefore: 'Ask a detective question:',
        templateAfter: '',
        options: [
          { emoji: '🕵️', word: 'Who, What, Where?', fullEn: 'Ask a detective question: Who, What, Where?', tr: 'Kim, Ne, Nerede?', de: 'Wer, Was, Wo?' },
          { emoji: '⏰', word: 'What time is it?', fullEn: 'Ask a detective question: What time is it?', tr: 'Saat kaç?', de: 'Wie spät ist es?' },
          { emoji: '📅', word: 'When is basketball?', fullEn: 'Ask a detective question: When is basketball?', tr: 'Basketbol ne zaman?', de: 'Wann ist Basketball?' },
          { emoji: '🎒', word: 'Whose backpack is this?', fullEn: 'Ask a detective question: Whose backpack is this?', tr: 'Bu kimin çantası?', de: 'Wessen Rucksack ist das?' },
        ],
      },
    ],
  },

  'level-21': {
    songTitle: 'Where Are You Going? Town Places Song 🏙️',
    songSubtitleTr: 'Şehir mekanlarını ve yön tariflerini YouTube şarkısıyla öğren!',
    youtubeClip: {
      videoId: 'OkfROvtrDl8',
      title: 'Where Are You Going? Places Song (English Tree)',
      start: 8,
      end: 55,
    },
    chantLines: [
      { emoji: '📚', en: 'Walk straight ahead to the library!', tr: 'Kütüphaneye doğru dümdüz yürü!' },
      { emoji: '🥐', en: 'Turn left at the warm sweet bakery!', tr: 'Sıcak tatlı fırının oradan sola dön!' },
      { emoji: '🚒', en: 'Turn right to see the red fire station!', tr: 'Kırmızı itfaiyeyi görmek için sağa dön!' },
      { emoji: '🗺️', en: 'Look at the map — we know the way!', tr: 'Haritaya bak — yolu biliyoruz!' },
    ],
    visualCards: [
      { emoji: '⬆️⬅️➡️', animClass: 'hover:scale-110', badge: 'DIRECTIONS', badgeColor: 'bg-blue-600 text-white', en: 'Go straight, turn left, or turn right!', tr: 'Dümdüz git, sola dön veya sağa dön!', de: 'Geradeaus, links, rechts!' },
      { emoji: '📚🥐', animClass: 'hover:translate-x-1', badge: 'PLACES', badgeColor: 'bg-amber-500 text-slate-950', en: 'Borrow books at the library, bread at the bakery!', tr: 'Kütüphaneden kitap, fırından ekmek!', de: 'Bibliothek und Bäckerei!' },
      { emoji: '🚒🚨', animClass: 'hover:-translate-y-1', badge: 'FIRE STATION', badgeColor: 'bg-rose-600 text-white', en: 'Big red trucks shine at the fire station!', tr: 'Kırmızı kamyonlar itfaiyede parlar!', de: 'Bei der Feuerwehrwache!' },
    ],
    patterns: [
      {
        id: 'l21-p1',
        titleTr: 'Yön Tarif Etme',
        templateBefore: 'To find the park, please',
        templateAfter: '!',
        options: [
          { emoji: '⬆️', word: 'go straight ahead', fullEn: 'To find the park, please go straight ahead!', tr: 'Parkı bulmak için dümdüz git!', de: 'Geh geradeaus!' },
          { emoji: '⬅️', word: 'turn left', fullEn: 'To find the park, please turn left!', tr: 'Parkı bulmak için sola dön!', de: 'Bieg links ab!' },
          { emoji: '➡️', word: 'turn right', fullEn: 'To find the park, please turn right!', tr: 'Parkı bulmak için sağa dön!', de: 'Bieg rechts ab!' },
          { emoji: '🗺️', word: 'cross the corner', fullEn: 'To find the park, please cross the corner!', tr: 'Parkı bulmak için köşeyi geç!', de: 'Überquere die Ecke!' },
        ],
      },
      {
        id: 'l21-p2',
        titleTr: 'Nereye Gidiyorsun?',
        templateBefore: 'I am going to the',
        templateAfter: '!',
        options: [
          { emoji: '📚', word: 'library for books', fullEn: 'I am going to the library for books!', tr: 'Kitaplar için kütüphaneye gidiyorum!', de: 'Ich gehe in die Bibliothek!' },
          { emoji: '🥐', word: 'bakery for croissants', fullEn: 'I am going to the bakery for croissants!', tr: 'Kruvasan için fırına gidiyorum!', de: 'Ich gehe zur Bäckerei!' },
          { emoji: '🚒', word: 'fire station tour', fullEn: 'I am going to the fire station tour!', tr: 'İtfaiye turuna gidiyorum!', de: 'Zur Feuerwehrwache!' },
          { emoji: '🛒', word: 'supermarket with Mom', fullEn: 'I am going to the supermarket with Mom!', tr: 'Annemle süpermarkete gidiyorum!', de: 'Mit Mama in den Supermarkt!' },
        ],
      },
    ],
  },

  'level-22': {
    songTitle: 'Transportation Song! Bus, Train & Airplane 🚆✈️',
    songSubtitleTr: 'Ulaşım şarkısını izle, okula ve tatile nasıl gittiğimizi söyle!',
    youtubeClip: {
      videoId: 'Ut-HbauKzDw',
      title: 'Transportation Song (The Singing Walrus)',
      start: 8,
      end: 55,
    },
    chantLines: [
      { emoji: '🚌', en: 'Beep beep! I go to school by bus!', tr: 'Bip bip! Okula otobüsle giderim!' },
      { emoji: '🚆', en: 'Choo choo! Zoom across towns by train!', tr: 'Çuf çuf! Şehirler arası trenle hızlan!' },
      { emoji: '✈️', en: 'Soar high over clouds by airplane!', tr: 'Uçakla bulutların üstünden süzül!' },
      { emoji: '🚶', en: 'Sunny day! Let’s walk to the park on foot!', tr: 'Güneşli gün! Parka yürüyerek gidelim!' },
    ],
    visualCards: [
      { emoji: '🚌🚲', animClass: 'hover:translate-x-2', badge: 'BY BUS / BIKE', badgeColor: 'bg-sky-600 text-white', en: 'Go to school by bicycle or by bus!', tr: 'Okula bisikletle veya otobüsle git!', de: 'Mit dem Bus oder Fahrrad!' },
      { emoji: '🚇🚆', animClass: 'hover:scale-110', badge: 'TRAINS', badgeColor: 'bg-emerald-600 text-white', en: 'Ride the underground subway or fast train!', tr: 'Metroya ya da hızlı trene bin!', de: 'Mit der U-Bahn oder dem Zug!' },
      { emoji: '✈️🚶', animClass: 'hover:-translate-y-1', badge: 'FLY OR WALK', badgeColor: 'bg-amber-500 text-slate-950', en: 'Travel by airplane, walk nearby on foot!', tr: 'Uçakla seyahat et, yakına yürüyerek git!', de: 'Mit dem Flugzeug oder zu Fuß!' },
    ],
    patterns: [
      {
        id: 'l22-p1',
        titleTr: 'Nasıl Gidersin?',
        templateBefore: 'I love traveling',
        templateAfter: '!',
        options: [
          { emoji: '🚌', word: 'by school bus', fullEn: 'I love traveling by school bus!', tr: 'Okul otobüsüyle gitmeyi severim!', de: 'Mit dem Schulbus!' },
          { emoji: '🚆', word: 'by fast train', fullEn: 'I love traveling by fast train!', tr: 'Hızlı trenle yolculuğu severim!', de: 'Mit dem Schnellzug!' },
          { emoji: '✈️', word: 'by airplane', fullEn: 'I love traveling by airplane!', tr: 'Uçakla uçmayı severim!', de: 'Mit dem Flugzeug!' },
          { emoji: '🚲', word: 'by bicycle', fullEn: 'I love traveling by bicycle!', tr: 'Bisikletle gezmeyi severim!', de: 'Mit dem Fahrrad!' },
        ],
      },
      {
        id: 'l22-p2',
        titleTr: 'Şehir İçi Ulaşım',
        templateBefore: 'Today we go there',
        templateAfter: '!',
        options: [
          { emoji: '🚶', word: 'on foot', fullEn: 'Today we go there on foot!', tr: 'Bugün oraya yürüyerek gideriz!', de: 'Heute gehen wir zu Fuß!' },
          { emoji: '🚇', word: 'on the subway', fullEn: 'Today we go there on the subway!', tr: 'Bugün oraya metroyla gideriz!', de: 'Heute fahren wir mit der U-Bahn!' },
          { emoji: '⛵', word: 'by yellow boat', fullEn: 'Today we go there by yellow boat!', tr: 'Bugün oraya sarı tekneyle gideriz!', de: 'Mit dem gelben Boot!' },
          { emoji: '🚗', word: 'in Dad’s car', fullEn: 'Today we go there in Dad’s car!', tr: 'Bugün oraya babamın arabasıyla gideriz!', de: 'Mit Papas Auto!' },
        ],
      },
    ],
  },

  'level-23': {
    songTitle: 'Doctor Doctor! Healthy Body Song 🩺🌟',
    songSubtitleTr: 'Önce Doktor şarkısını izle, sonra sağlıklı yaşam cümlelerini öğren!',
    youtubeClip: {
      videoId: '0W0zEJ9uR2U',
      title: 'Doctor Doctor Song (Super Simple Songs)',
      start: 8,
      end: 55,
    },
    chantLines: [
      { emoji: '🩺', en: 'Knock knock, doctor! What is the matter?', tr: 'Tık tık doktor! Neyin var?' },
      { emoji: '🤕', en: 'I have a tiny headache, doctor please help!', tr: 'Biraz baş ağrım var, doktor yardım et!' },
      { emoji: '💧', en: 'Drink fresh water and eat healthy food!', tr: 'Taze su iç ve sağlıklı yemekler ye!' },
      { emoji: '🌟', en: 'Rest well tonight and feel better soon!', tr: 'Bu gece iyi dinlen ve çabuk iyileş!' },
    ],
    visualCards: [
      { emoji: '🩺💖', animClass: 'hover:scale-110', badge: 'CHECKUP', badgeColor: 'bg-rose-600 text-white', en: 'What is the matter? Feel better soon!', tr: 'Neyin var? Geçmiş olsun!', de: 'Was fehlt dir? Gute Besserung!' },
      { emoji: '🤕🤢', animClass: 'hover:animate-wobble', badge: 'ACHES', badgeColor: 'bg-amber-500 text-slate-950', en: 'Headache or tummy ache? Take a rest!', tr: 'Baş ağrısı mı karın ağrısı mı? Dinlen!', de: 'Kopf- oder Bauchschmerzen?' },
      { emoji: '🥗💧', animClass: 'hover:-translate-y-1', badge: 'HEALTHY HABITS', badgeColor: 'bg-emerald-600 text-white', en: 'Healthy food and water keep us strong!', tr: 'Sağlıklı yiyecek ve su bizi güçlü tutar!', de: 'Gesundes Essen und Wasser!' },
    ],
    patterns: [
      {
        id: 'l23-p1',
        titleTr: 'Sağlıklı Kalma Tavsiyesi',
        templateBefore: 'To feel strong and healthy,',
        templateAfter: '!',
        options: [
          { emoji: '💧', word: 'drink clean water', fullEn: 'To feel strong and healthy, drink clean water!', tr: 'Güçlü ve sağlıklı kalmak için temiz su iç!', de: 'Trink sauberes Wasser!' },
          { emoji: '🥗', word: 'eat fresh fruit', fullEn: 'To feel strong and healthy, eat fresh fruit!', tr: 'Güçlü ve sağlıklı kalmak için taze meyve ye!', de: 'Iss frisches Obst!' },
          { emoji: '😴', word: 'sleep and rest', fullEn: 'To feel strong and healthy, sleep and rest!', tr: 'Güçlü ve sağlıklı kalmak için uyu ve dinlen!', de: 'Schlaf und ruh dich aus!' },
          { emoji: '🪥', word: 'brush your teeth', fullEn: 'To feel strong and healthy, brush your teeth!', tr: 'Dişlerini fırçala!', de: 'Putz deine Zähne!' },
        ],
      },
      {
        id: 'l23-p2',
        titleTr: 'Doktorda Konuşma',
        templateBefore: 'Doctor, help!',
        templateAfter: '',
        options: [
          { emoji: '🤕', word: 'I have got a headache!', fullEn: 'Doctor, help! I have got a headache!', tr: 'Doktor yardım et! Başım ağrıyor!', de: 'Ich habe Kopfschmerzen!' },
          { emoji: '🤢', word: 'I have got a tummy ache!', fullEn: 'Doctor, help! I have got a tummy ache!', tr: 'Doktor yardım et! Karnım ağrıyor!', de: 'Ich habe Bauchschmerzen!' },
          { emoji: '🌟', word: 'Thank you, I feel better!', fullEn: 'Doctor, help! Thank you, I feel better!', tr: 'Teşekkürler, daha iyi hissediyorum!', de: 'Danke, mir geht es besser!' },
          { emoji: '🥛', word: 'I need warm tea and rest!', fullEn: 'Doctor, help! I need warm tea and rest!', tr: 'Ilık çaya ve dinlenmeye ihtiyacım var!', de: 'Ich brauche Tee und Ruhe!' },
        ],
      },
    ],
  },

  'level-24': {
    songTitle: 'Feelings & Big Emotions Song! 🤩🦁😌',
    songSubtitleTr: 'Duygu şarkısını dinle, heyecanını, gururunu ve cesaretini İngilizce anlat!',
    youtubeClip: {
      videoId: 'KivttwaXQZ4',
      title: 'Feelings & Emotions Song (The Singing Walrus)',
      start: 8,
      end: 55,
    },
    chantLines: [
      { emoji: '🤩', en: 'I am excited! Adventure starts now!', tr: 'Çok heyecanlıyım! Macera şimdi başlıyor!' },
      { emoji: '🏆', en: 'Look what I built! I feel so proud!', tr: 'Neler yaptığıma bak! Çok gururluyum!' },
      { emoji: '🦁', en: 'Try something new — be brave and curious!', tr: 'Yeni bir şey dene — cesur ve meraklı ol!' },
      { emoji: '😌', en: 'Take one slow breath and feel peaceful calm!', tr: 'Yavaşça bir nefes al ve sakinleş!' },
    ],
    visualCards: [
      { emoji: '🤩🏆', animClass: 'hover:scale-110', badge: 'HAPPY VIBES', badgeColor: 'bg-amber-500 text-slate-950', en: 'I feel excited and proud!', tr: 'Heyecanlı ve gururlu hissediyorum!', de: 'Ich bin aufgeregt und stolz!' },
      { emoji: '🦁🔎', animClass: 'hover:-translate-y-1', badge: 'BRAVE & CURIOUS', badgeColor: 'bg-orange-600 text-white', en: 'Be a brave, curious science explorer!', tr: 'Cesur ve meraklı bir bilim kaşifi ol!', de: 'Sei mutig und neugierig!' },
      { emoji: '😮😌', animClass: 'hover:animate-wobble', badge: 'CALM MIND', badgeColor: 'bg-teal-600 text-white', en: 'Surprised at first, then calm and focused!', tr: 'Önce şaşkın, sonra sakin ve odaklı!', de: 'Überrascht und dann ruhig!' },
    ],
    patterns: [
      {
        id: 'l24-p1',
        titleTr: 'Nasıl Hissediyorsun?',
        templateBefore: 'Today my heart feels',
        templateAfter: '!',
        options: [
          { emoji: '🤩', word: 'super excited', fullEn: 'Today my heart feels super excited!', tr: 'Bugün kendimi çok heyecanlı hissediyorum!', de: 'Total aufgeregt!' },
          { emoji: '🏆', word: 'so proud', fullEn: 'Today my heart feels so proud!', tr: 'Bugün kendimi çok gururlu hissediyorum!', de: 'So stolz!' },
          { emoji: '🦁', word: 'strong and brave', fullEn: 'Today my heart feels strong and brave!', tr: 'Bugün güçlü ve cesur hissediyorum!', de: 'Stark und mutig!' },
          { emoji: '😌', word: 'peaceful and calm', fullEn: 'Today my heart feels peaceful and calm!', tr: 'Bugün huzurlu ve sakin hissediyorum!', de: 'Ruhig und gelassen!' },
        ],
      },
      {
        id: 'l24-p2',
        titleTr: 'Duygularımızı Anlatalım',
        templateBefore: 'When I learn new words,',
        templateAfter: '!',
        options: [
          { emoji: '🔎', word: 'I am curious to explore', fullEn: 'When I learn new words, I am curious to explore!', tr: 'Keşfetmeye çok meraklıyım!', de: 'Ich bin neugierig!' },
          { emoji: '😮', word: 'I am surprised how fast I read', fullEn: 'When I learn new words, I am surprised how fast I read!', tr: 'Ne kadar hızlı okuduğuma şaşırdım!', de: 'Ich bin überrascht!' },
          { emoji: '🌟', word: 'I feel like a champion', fullEn: 'When I learn new words, I feel like a champion!', tr: 'Kendimi şampiyon gibi hissediyorum!', de: 'Wie ein Champion!' },
          { emoji: '🤗', word: 'I share my joy with Leo', fullEn: 'When I learn new words, I share my joy with Leo!', tr: 'Sevincimi Leo ile paylaşırım!', de: 'Ich teile meine Freude!' },
        ],
      },
    ],
  },

  'pitstop-5': {
    songTitle: 'Driving In My Car! Harbor Review Song ⛵🏙️',
    songSubtitleTr: 'Önce liman şarkısını dinle, şehir, araçlar, doktor ve duyguları kutla!',
    youtubeClip: {
      videoId: 'BdrZWu2dZ4c',
      title: 'Driving In My Car Harbor Review Song (Super Simple Songs)',
      start: 5,
      end: 50,
    },
    chantLines: [
      { emoji: '🥐', en: 'Turn left and smell the warm bakery!', tr: 'Sola dön ve sıcak fırının kokusunu al!' },
      { emoji: '🚆', en: 'We feel excited riding by fast train!', tr: 'Hızlı trene bindiğimiz için heyecanlıyız!' },
      { emoji: '🥗', en: 'Drink water, eat fruit, and stay healthy!', tr: 'Su iç, meyve ye ve sağlıklı kal!' },
      { emoji: '⛵', en: 'Sail across the harbor — proud explorer!', tr: 'Limandan yelken aç — gururlu kaşif!' },
    ],
    visualCards: [
      { emoji: '🏙️🚆', animClass: 'hover:translate-x-2', badge: 'TOWN & TRAVEL', badgeColor: 'bg-blue-600 text-white', en: 'Turn right at the library and ride the train!', tr: 'Kütüphaneden sağa dön ve trene bin!', de: 'Rechts abbiegen und Zug fahren!' },
      { emoji: '🩺💛', animClass: 'hover:scale-110', badge: 'BODY & HEART', badgeColor: 'bg-rose-600 text-white', en: 'Stay healthy, feel brave, and calm your mind!', tr: 'Sağlıklı kal, cesur ol ve sakinleş!', de: 'Bleib gesund und mutig!' },
      { emoji: '🧭🏆', animClass: 'hover:-translate-y-1', badge: '25 STOPS!', badgeColor: 'bg-amber-500 text-slate-950', en: 'Twenty-five stops done! Proud explorer!', tr: 'Yirmi beş durak tamamlandı! Gururlu kaşif!', de: 'Fünfundzwanzig Stationen geschafft!' },
    ],
    patterns: [
      {
        id: 'ps5-p1',
        titleTr: 'Şehir Turu Cümlesi',
        templateBefore: 'Turn right and go straight to',
        templateAfter: '!',
        options: [
          { emoji: '📚', word: 'the sunny library', fullEn: 'Turn right and go straight to the sunny library!', tr: 'Sağa dön ve güneşli kütüphaneye düz git!', de: 'Zur sonnigen Bibliothek!' },
          { emoji: '🥐', word: 'the village bakery', fullEn: 'Turn right and go straight to the village bakery!', tr: 'Sağa dön ve fırına düz git!', de: 'Zur Bäckerei!' },
          { emoji: '⛵', word: 'the harbor boats', fullEn: 'Turn right and go straight to the harbor boats!', tr: 'Sağa dön ve liman teknelerine git!', de: 'Zu den Hafenbooten!' },
          { emoji: '🚒', word: 'the big fire station', fullEn: 'Turn right and go straight to the big fire station!', tr: 'Sağa dön ve büyük itfaiyeye git!', de: 'Zur Feuerwehrwache!' },
        ],
      },
      {
        id: 'ps5-p2',
        titleTr: 'Harbor Durak Kutlaması',
        templateBefore: 'I take a deep breath and',
        templateAfter: '!',
        options: [
          { emoji: '😌', word: 'feel calm and ready', fullEn: 'I take a deep breath and feel calm and ready!', tr: 'Derin nefes alır, sakin ve hazır hissederim!', de: 'Fühle mich ruhig und bereit!' },
          { emoji: '🏆', word: 'feel proud of my English', fullEn: 'I take a deep breath and feel proud of my English!', tr: 'İngilizcemle gurur duyarım!', de: 'Stolz auf mein Englisch!' },
          { emoji: '🥗', word: 'keep my body healthy', fullEn: 'I take a deep breath and keep my body healthy!', tr: 'Vücudumu sağlıklı tutarım!', de: 'Halte meinen Körper gesund!' },
          { emoji: '🧭', word: 'explore the city by train', fullEn: 'I take a deep breath and explore the city by train!', tr: 'Şehri trenle keşfederim!', de: 'Mit dem Zug die Stadt erkunden!' },
        ],
      },
    ],
  },

  'level-25': {
    songTitle: 'Days of the Week & Birthday Song! 📅🎂',
    songSubtitleTr: 'Haftanın günlerini şarkıyla ezberle, doğum günü cümlelerini kur!',
    youtubeClip: {
      videoId: 'mXMofxtDPUQ',
      title: 'Days of the Week Song (The Singing Walrus)',
      start: 8,
      end: 55,
    },
    chantLines: [
      { emoji: '🎒', en: 'Monday, Tuesday, Wednesday — off to school!', tr: 'Pazartesi, Salı, Çarşamba — haydi okula!' },
      { emoji: '🥳', en: 'Thursday and Friday — almost the weekend!', tr: 'Perşembe ve Cuma — neredeyse hafta sonu!' },
      { emoji: '🎉', en: 'Saturday and Sunday are days to play!', tr: 'Cumartesi ve Pazar oyun günleridir!' },
      { emoji: '🎂', en: 'Happy birthday, Deniz! Blow out the candles!', tr: 'Doğum günün kutlu olsun Deniz! Mumları üfle!' },
    ],
    visualCards: [
      { emoji: '📅🏫', animClass: 'hover:scale-110', badge: 'WEEKDAYS', badgeColor: 'bg-blue-600 text-white', en: 'School from Monday to Friday!', tr: 'Pazartesiden Cumaya okul!', de: 'Montag bis Freitag Schule!' },
      { emoji: '🎉🕹️', animClass: 'hover:-translate-y-1', badge: 'WEEKEND', badgeColor: 'bg-emerald-600 text-white', en: 'Basketball and Lego on Saturday and Sunday!', tr: 'Cumartesi Pazar basketbol ve Lego!', de: 'Am Wochenende spielen!' },
      { emoji: '🎂🗓️', animClass: 'hover:animate-wobble', badge: 'MONTHS', badgeColor: 'bg-pink-600 text-white', en: 'Twelve happy months from January to December!', tr: 'Ocaktan Aralığa on iki mutlu ay!', de: 'Zwölf Monate im Jahr!' },
    ],
    patterns: [
      {
        id: 'l25-p1',
        titleTr: 'Günleri Söyleyelim',
        templateBefore: 'What day is today? Today is',
        templateAfter: '!',
        options: [
          { emoji: '🎒', word: 'sunny Monday', fullEn: 'What day is today? Today is sunny Monday!', tr: 'Bugün günlerden güneşli Pazartesi!', de: 'Heute ist Montag!' },
          { emoji: '🏀', word: 'basketball Wednesday', fullEn: 'What day is today? Today is basketball Wednesday!', tr: 'Bugün basketbol Çarşambası!', de: 'Heute ist Mittwoch!' },
          { emoji: '🎉', word: 'fun Saturday', fullEn: 'What day is today? Today is fun Saturday!', tr: 'Bugün eğlenceli Cumartesi!', de: 'Heute ist Samstag!' },
          { emoji: '🎂', word: 'my birthday Sunday', fullEn: 'What day is today? Today is my birthday Sunday!', tr: 'Bugün doğum günüm Pazar!', de: 'Heute ist mein Geburtstagssonntag!' },
        ],
      },
      {
        id: 'l25-p2',
        titleTr: 'Kutlama Kalıbı',
        templateBefore: 'Happy birthday!',
        templateAfter: '',
        options: [
          { emoji: '🎂', word: 'Cut the birthday cake!', fullEn: 'Happy birthday! Cut the birthday cake!', tr: 'Doğum günü pastasını kes!', de: 'Schneide den Kuchen an!' },
          { emoji: '🎁', word: 'Here is a Lego present!', fullEn: 'Happy birthday! Here is a Lego present!', tr: 'İşte bir Lego hediyesi!', de: 'Hier ist ein Geschenk!' },
          { emoji: '🥳', word: 'Let’s cheer and celebrate!', fullEn: 'Happy birthday! Let’s cheer and celebrate!', tr: 'Haydi alkışlayıp kutlayalım!', de: 'Lass uns feiern!' },
          { emoji: '🗓️', word: 'Twelve months of smiles!', fullEn: 'Happy birthday! Twelve months of smiles!', tr: 'Gülümsemelerle dolu on iki ay!', de: 'Zwölf Monate voller Lächeln!' },
        ],
      },
    ],
  },

  'level-26': {
    songTitle: 'How Much Is This? Market & Money Song! 🪙🛍️',
    songSubtitleTr: 'Alışveriş şarkısını dinle, İngilizce fiyat sormayı ve ödeme yapmayı öğren!',
    youtubeClip: {
      videoId: 'kd8o_DTCs6o',
      title: 'How Much Is This? Buy Things Song (English Singsing)',
      start: 8,
      end: 55,
    },
    chantLines: [
      { emoji: '🏷️', en: 'Excuse me, how much is it please?', tr: 'Affedersiniz, fiyatı ne kadar lütfen?' },
      { emoji: '💶', en: 'Only five euros for the yellow boat!', tr: 'Sarı tekne sadece beş euro!' },
      { emoji: '🙌', en: 'Count the coins and say: Here you are!', tr: 'Paraları say ve de ki: Buyurun!' },
      { emoji: '🛍️', en: 'Stickers are cheap, big rockets are expensive!', tr: 'Çıkartmalar ucuz, büyük roketler pahalı!' },
    ],
    visualCards: [
      { emoji: '🏷️💶', animClass: 'hover:scale-110', badge: 'ASK PRICE', badgeColor: 'bg-amber-500 text-slate-950', en: 'How much is it? Five euros!', tr: 'Ne kadar? Beş euro!', de: 'Wie viel kostet es? Fünf Euro!' },
      { emoji: '🙌🪙', animClass: 'hover:translate-x-1', badge: 'POLITE PAY', badgeColor: 'bg-emerald-600 text-white', en: 'Here you are! shiny gold coins!', tr: 'Buyurun! Parlak madeni paralar!', de: 'Bitte schön! Münzen!' },
      { emoji: '💎🍓', animClass: 'hover:animate-wobble', badge: 'CHEAP vs EXPENSIVE', badgeColor: 'bg-purple-600 text-white', en: 'Compare cheap apples and expensive spaceships!', tr: 'Ucuz elma ile pahalı uzay gemisini kıyasla!', de: 'Günstig gegen teuer!' },
    ],
    patterns: [
      {
        id: 'l26-p1',
        titleTr: 'Fiyat Sorma Kalıbı',
        templateBefore: 'Excuse me! How much is',
        templateAfter: '?',
        options: [
          { emoji: '🧱', word: 'this Lego car', fullEn: 'Excuse me! How much is this Lego car?', tr: 'Affedersiniz! Bu Lego araba ne kadar?', de: 'Wie viel kostet dieses Lego-Auto?' },
          { emoji: '🥐', word: 'the warm croissant', fullEn: 'Excuse me! How much is the warm croissant?', tr: 'Sıcak kruvasan ne kadar?', de: 'Wie viel kostet das Croissant?' },
          { emoji: '🍎', word: 'the bag of apples', fullEn: 'Excuse me! How much is the bag of apples?', tr: 'Elma poşeti ne kadar?', de: 'Wie viel kostet die Tüte Äpfel?' },
          { emoji: '📘', word: 'that space book', fullEn: 'Excuse me! How much is that space book?', tr: 'Şu uzay kitabı ne kadar?', de: 'Wie viel kostet das Weltraumbuch?' },
        ],
      },
      {
        id: 'l26-p2',
        titleTr: 'Dükkanda Ödeme',
        templateBefore: 'It is five euros!',
        templateAfter: '',
        options: [
          { emoji: '🙌', word: 'Here you are, thank you!', fullEn: 'It is five euros! Here you are, thank you!', tr: 'Beş euro! Buyurun, teşekkürler!', de: 'Bitte schön, danke!' },
          { emoji: '👜', word: 'Put it in my shopping bag!', fullEn: 'It is five euros! Put it in my shopping bag!', tr: 'Alışveriş çantama koyun lütfen!', de: 'In meine Einkaufstasche!' },
          { emoji: '🪙', word: 'I have got gold coins!', fullEn: 'It is five euros! I have got gold coins!', tr: 'Altın bozuk paralarım var!', de: 'Ich habe Goldmünzen!' },
          { emoji: '🛍️', word: 'Wow, that is very cheap!', fullEn: 'It is five euros! Wow, that is very cheap!', tr: 'Vay canına, çok ucuz!', de: 'Wow, das ist günstig!' },
        ],
      },
    ],
  },

  'level-27': {
    songTitle: 'Animal Habitats & Nature Song! 🌍🌴🌊',
    songSubtitleTr: 'Önce doğa şarkısını izle, sonra hayvanların yaşadığı yerleri anlat!',
    youtubeClip: {
      videoId: 'byvf7jwdvOI',
      title: 'Habitats Song (Hopscotch Songs)',
      start: 8,
      end: 55,
    },
    chantLines: [
      { emoji: '🌴', en: 'Colorful monkeys swing in the tall jungle!', tr: 'Renkli maymunlar uzun ormanda sallanır!' },
      { emoji: '🌊', en: 'Dolphins leap out of the deep blue ocean!', tr: 'Yunuslar derin mavi okyanustan sıçrar!' },
      { emoji: '🏜️', en: 'Camels walk safely across the sunny desert!', tr: 'Develer güneşli çölde güvenle yürür!' },
      { emoji: '🌱', en: 'Plant a green tree and protect nature!', tr: 'Yeşil bir ağaç dik ve doğayı koru!' },
    ],
    visualCards: [
      { emoji: '🌴🌊', animClass: 'hover:scale-110', badge: 'JUNGLE & OCEAN', badgeColor: 'bg-emerald-600 text-white', en: 'Monkeys in the jungle, whales in the ocean!', tr: 'Maymunlar ormanda, balinalar okyanusta!', de: 'Dschungel und Ozean!' },
      { emoji: '🏜️🐻‍❄️', animClass: 'hover:translate-x-2', badge: 'HOT & ICY', badgeColor: 'bg-amber-500 text-slate-950', en: 'Hot sandy desert and freezing Arctic snow!', tr: 'Sıcak kumlu çöl ve buzlu Arktik!', de: 'Wüste und Arktis!' },
      { emoji: '🌋🌱', animClass: 'hover:-translate-y-1', badge: 'PLANET EARTH', badgeColor: 'bg-sky-600 text-white', en: 'Study volcanoes and protect nature!', tr: 'Yanardağları incele ve doğayı koru!', de: 'Natur schützen!' },
    ],
    patterns: [
      {
        id: 'l27-p1',
        titleTr: 'Hayvanlar Nerede Yaşar?',
        templateBefore: 'Look! That wild animal lives',
        templateAfter: '!',
        options: [
          { emoji: '🌴', word: 'in the green jungle', fullEn: 'Look! That wild animal lives in the green jungle!', tr: 'Bak! O hayvan yeşil ormanda yaşıyor!', de: 'Im grünen Dschungel!' },
          { emoji: '🌊', word: 'in the deep ocean', fullEn: 'Look! That wild animal lives in the deep ocean!', tr: 'Bak! O hayvan derin okyanusta yaşıyor!', de: 'Im tiefen Ozean!' },
          { emoji: '🏜️', word: 'in the sandy desert', fullEn: 'Look! That wild animal lives in the sandy desert!', tr: 'Bak! O hayvan kumlu çölde yaşıyor!', de: 'In der Wüste!' },
          { emoji: '🐻‍❄️', word: 'in the icy Arctic', fullEn: 'Look! That wild animal lives in the icy Arctic!', tr: 'Bak! O hayvan buzlu kutupta yaşıyor!', de: 'In der eisigen Arktis!' },
        ],
      },
      {
        id: 'l27-p2',
        titleTr: 'Doğayı Koruma Sözü',
        templateBefore: 'We can protect nature! Let’s',
        templateAfter: '!',
        options: [
          { emoji: '🌱', word: 'plant happy green trees', fullEn: 'We can protect nature! Let’s plant happy green trees!', tr: 'Haydi mutlu yeşil ağaçlar dikelim!', de: 'Pflanzen wir Bäume!' },
          { emoji: '🌊', word: 'keep our oceans clean', fullEn: 'We can protect nature! Let’s keep our oceans clean!', tr: 'Haydi okyanuslarımızı temiz tutalım!', de: 'Halten wir die Ozeane sauber!' },
          { emoji: '♻️', word: 'recycle plastic and paper', fullEn: 'We can protect nature! Let’s recycle plastic and paper!', tr: 'Plastiği ve kağıdı geri dönüştürelim!', de: 'Plastik recyceln!' },
          { emoji: '🦉', word: 'help every forest animal', fullEn: 'We can protect nature! Let’s help every forest animal!', tr: 'Her orman hayvanına yardım edelim!', de: 'Jedem Waldtier helfen!' },
        ],
      },
    ],
  },

  'level-28': {
    songTitle: 'What Do You Like To Do? Hobbies Song! 🏀🎹',
    songSubtitleTr: 'Önce hobi şarkısını izle, sevdiğin aktiviteleri "always / sometimes" ile anlat!',
    youtubeClip: {
      videoId: 'tYNap8gVNK4',
      title: 'What Do You Like To Do? Hobbies Song (Maple Leaf Learning)',
      start: 8,
      end: 55,
    },
    chantLines: [
      { emoji: '💯', en: 'I always practice piano with big energy!', tr: 'Her zaman büyük enerjiyle piyano çalışırım!' },
      { emoji: '🌗', en: 'I sometimes play chess with Dad at home!', tr: 'Bazen evde babamla satranç oynarım!' },
      { emoji: '🚫', en: 'I never quit when a puzzle is tricky!', tr: 'Zor bir bulmacada asla vazgeçmem!' },
      { emoji: '🏀', en: 'Pass the basketball — awesome teamwork!', tr: 'Basketbol pası ver — harika takım çalışması!' },
    ],
    visualCards: [
      { emoji: '💯🌗🚫', animClass: 'hover:scale-110', badge: 'HOW OFTEN?', badgeColor: 'bg-purple-600 text-white', en: 'Always 100%, Sometimes 50%, Never 0%!', tr: 'Her zaman, bazen, asla!', de: 'Immer, manchmal, nie!' },
      { emoji: '♟️🎹', animClass: 'hover:-translate-y-1', badge: 'MIND & MUSIC', badgeColor: 'bg-indigo-600 text-white', en: 'Play chess and practice piano melodies!', tr: 'Satranç oyna ve piyano melodileri çal!', de: 'Schach und Klavier!' },
      { emoji: '🏀🏊', animClass: 'hover:translate-x-1', badge: 'TEAMWORK', badgeColor: 'bg-orange-600 text-white', en: 'Swimming and basketball teamwork rock!', tr: 'Yüzme ve basketbol takım çalışması harika!', de: 'Schwimmen und Teamwork!' },
    ],
    patterns: [
      {
        id: 'l28-p1',
        titleTr: 'Ne Sıklıkla Yaparsın?',
        templateBefore: 'After school, I',
        templateAfter: '!',
        options: [
          { emoji: '💯', word: 'always build Lego', fullEn: 'After school, I always build Lego!', tr: 'Okuldan sonra her zaman Lego yaparım!', de: 'Ich baue immer Lego!' },
          { emoji: '🌗', word: 'sometimes play chess', fullEn: 'After school, I sometimes play chess!', tr: 'Okuldan sonra bazen satranç oynarım!', de: 'Manchmal spiele ich Schach!' },
          { emoji: '🎹', word: 'practice the piano', fullEn: 'After school, I practice the piano!', tr: 'Okuldan sonra piyano çalışırım!', de: 'Ich übe Klavier!' },
          { emoji: '🏀', word: 'love basketball teamwork', fullEn: 'After school, I love basketball teamwork!', tr: 'Okuldan sonra basketbol takım oyununu severim!', de: 'Basketball-Teamwork!' },
        ],
      },
      {
        id: 'l28-p2',
        titleTr: 'Güzel Alışkanlıklar',
        templateBefore: 'A kind champion',
        templateAfter: '!',
        options: [
          { emoji: '🚫', word: 'never gives up', fullEn: 'A kind champion never gives up!', tr: 'İyi bir şampiyon asla pes etmez!', de: 'Gibt niemals auf!' },
          { emoji: '🤝', word: 'always helps teammates', fullEn: 'A kind champion always helps teammates!', tr: 'Her zaman takım arkadaşlarına yardım eder!', de: 'Hilft immer dem Team!' },
          { emoji: '📚', word: 'reads stories every week', fullEn: 'A kind champion reads stories every week!', tr: 'Her hafta hikayeler okur!', de: 'Liest jede Woche Geschichten!' },
          { emoji: '🏊', word: 'swims strong in summer', fullEn: 'A kind champion swims strong in summer!', tr: 'Yazın güçlüce yüzer!', de: 'Schwimmt im Sommer!' },
        ],
      },
    ],
  },

  'pitstop-6': {
    songTitle: 'Months of the Year! Safari Review Song 🦁📅',
    songSubtitleTr: 'Önce aylar şarkısını izle, takvim, para, doğa ve hobileri birleştir!',
    youtubeClip: {
      videoId: 'Fe9bnYRzFvk',
      title: 'Months of the Year Safari Review Song (The Singing Walrus)',
      start: 8,
      end: 55,
    },
    chantLines: [
      { emoji: '🧭', en: 'Sunny weekend adventures start on Saturday!', tr: 'Güneşli hafta sonu maceraları Cumartesi başlar!' },
      { emoji: '💶', en: 'Ten euros for a cool gift! Here you are!', tr: 'Harika bir hediye on euro! Buyurun!' },
      { emoji: '🌲', en: 'Keep safe green forests and clean oceans!', tr: 'Güvenli yeşil ormanları ve temiz okyanusları koru!' },
      { emoji: '🌟', en: 'Practice with joy — I always try my best!', tr: 'Neşeyle çalış — her zaman en iyisini denerim!' },
    ],
    visualCards: [
      { emoji: '🎁💶', animClass: 'hover:scale-110', badge: 'PARTY & SHOP', badgeColor: 'bg-pink-600 text-white', en: 'Buy a birthday present with ten euros!', tr: 'On euro ile doğum günü hediyesi al!', de: 'Ein Geburtstagsgeschenk kaufen!' },
      { emoji: '🌲🌊', animClass: 'hover:translate-x-2', badge: 'SAVE EARTH', badgeColor: 'bg-emerald-600 text-white', en: 'Protect green forests and save our oceans!', tr: 'Ormanları koru ve okyanusları kurtar!', de: 'Wälder und Ozeane schützen!' },
      { emoji: '🌟🏀', animClass: 'hover:-translate-y-1', badge: 'ALWAYS TRY', badgeColor: 'bg-amber-500 text-slate-950', en: 'I always try my best at games and English!', tr: 'Oyunlarda ve İngilizcede hep denerim!', de: 'Ich gebe immer mein Bestes!' },
    ],
    patterns: [
      {
        id: 'ps6-p1',
        titleTr: 'Safari Tekrar Cümlesi',
        templateBefore: 'On the weekend, I buy a gift and',
        templateAfter: '!',
        options: [
          { emoji: '🎂', word: 'say happy birthday', fullEn: 'On the weekend, I buy a gift and say happy birthday!', tr: 'Hafta sonu hediye alıp doğum gününü kutlarım!', de: 'Alles Gute zum Geburtstag sagen!' },
          { emoji: '🙌', word: 'say here you are', fullEn: 'On the weekend, I buy a gift and say here you are!', tr: 'Hafta sonu hediye alır ve buyurun derim!', de: 'Bitte schön sagen!' },
          { emoji: '🌊', word: 'learn about oceans', fullEn: 'On the weekend, I buy a gift and learn about oceans!', tr: 'Okyanuslar hakkında öğrenirim!', de: 'Über Ozeane lernen!' },
          { emoji: '🏀', word: 'play with teamwork', fullEn: 'On the weekend, I buy a gift and play with teamwork!', tr: 'Takım oyunuyla oynarım!', de: 'Im Team spielen!' },
        ],
      },
      {
        id: 'ps6-p2',
        titleTr: 'Doğa ve Sıklık Sözü',
        templateBefore: 'As a Safari Scout, I',
        templateAfter: '!',
        options: [
          { emoji: '🌟', word: 'always try my best', fullEn: 'As a Safari Scout, I always try my best!', tr: 'Safari İzcisi olarak her zaman elimden gelenin en iyisini yaparım!', de: 'Ich gebe immer mein Bestes!' },
          { emoji: '🌲', word: 'help save our forests', fullEn: 'As a Safari Scout, I help save our forests!', tr: 'Ormanlarımızı korumaya yardım ederim!', de: 'Helfe die Wälder zu schützen!' },
          { emoji: '🌊', word: 'help save our oceans', fullEn: 'As a Safari Scout, I help save our oceans!', tr: 'Okyanuslarımızı kurtarmaya yardım ederim!', de: 'Die Ozeane retten!' },
          { emoji: '🪙', word: 'count my coins carefully', fullEn: 'As a Safari Scout, I count my coins carefully!', tr: 'Paralarımı dikkatlice sayarım!', de: 'Meine Münzen zählen!' },
        ],
      },
    ],
  },

  'level-29': {
    songTitle: 'Sequencing Song: First, Next, Then, Finally! 📖',
    songSubtitleTr: 'Hikaye sırası şarkısını izle, olayları sırayla anlatmayı öğren!',
    youtubeClip: {
      videoId: 'zW3YZdPmCnM',
      title: 'Sequencing Song: First, Next, Then, Finally (Scratch Garden)',
      start: 8,
      end: 55,
    },
    chantLines: [
      { emoji: '✨', en: 'Once upon a time, a brave explorer set sail!', tr: 'Bir zamanlar cesur bir kaşif yelken açtı!' },
      { emoji: '1️⃣', en: 'First pack the map, next board the boat!', tr: 'Önce haritayı paketle, sonra tekneye bin!' },
      { emoji: '⚡', en: 'Then suddenly a friendly dolphin jumped!', tr: 'Sonra birdenbire dost bir yunus zıpladı!' },
      { emoji: '🏁', en: 'Finally we cheered — what a great day!', tr: 'Sonunda alkışladık — ne harika bir gün!' },
    ],
    visualCards: [
      { emoji: '1️⃣2️⃣', animClass: 'hover:scale-110', badge: 'ORDER WORDS', badgeColor: 'bg-purple-600 text-white', en: 'First, Next, Then, and Finally!', tr: 'İlk olarak, sonra, ardından ve nihayet!', de: 'Zuerst, dann, schließlich!' },
      { emoji: '✨⚡', animClass: 'hover:animate-wobble', badge: 'STORY MAGIC', badgeColor: 'bg-amber-500 text-slate-950', en: 'Once upon a time... Suddenly!', tr: 'Bir varmış bir yokmuş... Birdenbire!', de: 'Es war einmal... Plötzlich!' },
      { emoji: '🥳📖', animClass: 'hover:-translate-y-1', badge: 'HAPPY ENDING', badgeColor: 'bg-emerald-600 text-white', en: 'Finally everyone smiled — what a great day!', tr: 'Sonunda herkes gülümsedi — ne harika bir gün!', de: 'Was für ein toller Tag!' },
    ],
    patterns: [
      {
        id: 'l29-p1',
        titleTr: 'Hikaye Adımı Kur',
        templateBefore: 'Tell my morning story:',
        templateAfter: '',
        options: [
          { emoji: '1️⃣', word: 'First, I woke up early!', fullEn: 'Tell my morning story: First, I woke up early!', tr: 'İlk olarak erken uyandım!', de: 'Zuerst wachte ich früh auf!' },
          { emoji: '2️⃣', word: 'Next, I ate warm pancakes!', fullEn: 'Tell my morning story: Next, I ate warm pancakes!', tr: 'Sonra sıcak pankek yedim!', de: 'Als Nächstes aß ich Pfannkuchen!' },
          { emoji: '⚡', word: 'Suddenly, Leo knocked on my door!', fullEn: 'Tell my morning story: Suddenly, Leo knocked on my door!', tr: 'Birdenbire Leo kapımı çaldı!', de: 'Plötzlich klopfte Leo!' },
          { emoji: '🏁', word: 'Finally, we built a giant rocket!', fullEn: 'Tell my morning story: Finally, we built a giant rocket!', tr: 'Sonunda dev bir roket yaptık!', de: 'Schließlich bauten wir eine Rakete!' },
        ],
      },
      {
        id: 'l29-p2',
        titleTr: 'Harika Bir Final',
        templateBefore: 'Once upon a time, Deniz traveled far, and finally',
        templateAfter: '!',
        options: [
          { emoji: '🥳', word: 'what a great day it was', fullEn: 'Once upon a time, Deniz traveled far, and finally what a great day it was!', tr: 'Ve sonunda ne harika bir gündü!', de: 'Was für ein toller Tag!' },
          { emoji: '🏆', word: 'everyone cheered loudly', fullEn: 'Once upon a time, Deniz traveled far, and finally everyone cheered loudly!', tr: 'Ve sonunda herkes coşkuyla alkışladı!', de: 'Alle jubelten laut!' },
          { emoji: '🗝️', word: 'opened the star treasure chest', fullEn: 'Once upon a time, Deniz traveled far, and finally opened the star treasure chest!', tr: 'Yıldız hazine sandığını açtı!', de: 'Öffnete die Schatztruhe!' },
          { emoji: '🌟', word: 'spoke English like a pro', fullEn: 'Once upon a time, Deniz traveled far, and finally spoke English like a pro!', tr: 'Bir usta gibi İngilizce konuştu!', de: 'Sprach Englisch wie ein Profi!' },
        ],
      },
    ],
  },

  'pitstop-7': {
    songTitle: 'Party Freeze Dance! Grand Finale Celebration 🎆🏆',
    songSubtitleTr: '36 duraklık büyük şampiyonluk kutlaması! Önce dans şarkısı, sonra final konseri!',
    youtubeClip: {
      videoId: '2UcZWXvgMZE',
      title: 'Party Freeze Dance Finale Celebration (The Kiboomers)',
      start: 8,
      end: 60,
    },
    chantLines: [
      { emoji: '🎆', en: 'Look at the sky! Watch the bright fireworks!', tr: 'Gökyüzüne bak! Parlak havai fişekleri izle!' },
      { emoji: '🙌', en: 'Thirty-six island stops complete! I did it!', tr: 'Otuz altı ada durağı tamamlandı! Başardım!' },
      { emoji: '🏆', en: 'My name is Deniz and I am an English champion!', tr: 'Benim adım Deniz ve ben bir İngilizce şampiyonuyum!' },
      { emoji: '🚀', en: 'I love learning — see you on the next adventure!', tr: 'Öğrenmeyi seviyorum — sonraki macerada görüşürüz!' },
    ],
    visualCards: [
      { emoji: '🎆✨', animClass: 'hover:scale-125', badge: 'FIREWORKS!', badgeColor: 'bg-pink-600 text-white', en: 'Boom, sparkle, shine — watch the fireworks!', tr: 'Patla, parla — havai fişekleri izle!', de: 'Schau dir das Feuerwerk an!' },
      { emoji: '🏆🎙️', animClass: 'hover:-translate-y-2', badge: 'CHAMPION', badgeColor: 'bg-amber-500 text-slate-950', en: 'I can read, listen, and speak English with Leo!', tr: 'Leo ile İngilizce okuyup konuşabiliyorum!', de: 'Ich kann Englisch sprechen!' },
      { emoji: '🌍🚀', animClass: 'hover:scale-110', badge: 'SUPER EXPLORER', badgeColor: 'bg-purple-600 text-white', en: 'Yesterday, today, and tomorrow — I did it!', tr: 'Dün, bugün ve yarın — başardım!', de: 'Ich habe es geschafft!' },
    ],
    patterns: [
      {
        id: 'ps7-p1',
        titleTr: 'Şampiyonluk Konuşması',
        templateBefore: 'Hooray!',
        templateAfter: '',
        options: [
          { emoji: '🏆', word: 'I am an English champion!', fullEn: 'Hooray! I am an English champion!', tr: 'Yaşasın! Ben bir İngilizce şampiyonuyum!', de: 'Ich bin ein Englisch-Champion!' },
          { emoji: '🎆', word: 'Watch the golden fireworks!', fullEn: 'Hooray! Watch the golden fireworks!', tr: 'Altın havai fişekleri izle!', de: 'Schau dir das Feuerwerk an!' },
          { emoji: '🙌', word: 'All thirty-six stops done! I did it!', fullEn: 'Hooray! All thirty-six stops done! I did it!', tr: 'Tüm 36 durak bitti! Başardım!', de: 'Ich habe es geschafft!' },
          { emoji: '🎙️', word: 'I can speak English proudly!', fullEn: 'Hooray! I can speak English proudly!', tr: 'Gururla İngilizce konuşabiliyorum!', de: 'Ich spreche stolz Englisch!' },
        ],
      },
      {
        id: 'ps7-p2',
        titleTr: 'Büyük Final Dileği',
        templateBefore: 'I love learning! Next time',
        templateAfter: '!',
        options: [
          { emoji: '🚀', word: 'we will explore the stars', fullEn: 'I love learning! Next time we will explore the stars!', tr: 'Öğrenmeyi seviyorum! Bir dahakine yıldızları keşfedeceğiz!', de: 'Wir werden die Sterne erkunden!' },
          { emoji: '📚', word: 'I will read big chapter books', fullEn: 'I love learning! Next time I will read big chapter books!', tr: 'Büyük bölüm kitapları okuyacağım!', de: 'Ich werde dicke Bücher lesen!' },
          { emoji: '🔬', word: 'Dad and I will do science labs', fullEn: 'I love learning! Next time Dad and I will do science labs!', tr: 'Babamla bilim deneyleri yapacağız!', de: 'Wir machen Experimente!' },
          { emoji: '🦁', word: 'Leo and I will cheer together', fullEn: 'I love learning! Next time Leo and I will cheer together!', tr: 'Leo ile birlikte kutlayacağız!', de: 'Leo und ich jubeln zusammen!' },
        ],
      },
    ],
  },
};
