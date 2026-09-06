/**
 * Curriculum definitions for Lego English Adventure.
 * Designed for a 7-year-old child: high visual recognition, minimal reading,
 * audio-first questions with English (en-US) & Turkish (tr-TR) support.
 */

export const CURRICULUM_LEVELS = [
  {
    id: 'level-1',
    number: 1,
    title: 'Colors & Shapes',
    titleTr: 'Renkler ve Şekiller',
    description: 'Find colorful Lego bricks and shapes!',
    themeColor: 'from-red-500 to-yellow-400',
    borderColor: 'border-red-600',
    icon: 'Palette',
    badge: '🧱 Master Builder',
    bricksReward: 4,
    items: [
      {
        id: 'c1',
        word: 'Red',
        translation: 'Kırmızı',
        phonetic: 'Red',
        category: 'Colors',
        icon: 'Square',
        colorHex: '#E52521',
        bgClass: 'bg-red-500 hover:bg-red-600 text-white',
        borderClass: 'border-red-700',
        studColor: '#ff5c59',
        hintSentence: 'Like a shiny red race car! 🏎️',
        hintSentenceTr: 'Kırmızı bir yarış arabası gibi!'
      },
      {
        id: 'c2',
        word: 'Blue',
        translation: 'Mavi',
        phonetic: 'Blu',
        category: 'Colors',
        icon: 'Square',
        colorHex: '#0055BF',
        bgClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        borderClass: 'border-blue-800',
        studColor: '#3b82f6',
        hintSentence: 'Like the deep blue sea! 🌊',
        hintSentenceTr: 'Derin mavi deniz gibi!'
      },
      {
        id: 'c3',
        word: 'Yellow',
        translation: 'Sarı',
        phonetic: 'Yel-lo',
        category: 'Colors',
        icon: 'Square',
        colorHex: '#FFD700',
        bgClass: 'bg-yellow-400 hover:bg-yellow-500 text-slate-900',
        borderClass: 'border-yellow-600',
        studColor: '#fde047',
        hintSentence: 'Like warm sunshine! ☀️',
        hintSentenceTr: 'Sıcak sarı güneş gibi!'
      },
      {
        id: 'c4',
        word: 'Green',
        translation: 'Yeşil',
        phonetic: 'Griin',
        category: 'Colors',
        icon: 'Square',
        colorHex: '#237841',
        bgClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        borderClass: 'border-emerald-800',
        studColor: '#34d399',
        hintSentence: 'Like the green Lego grass baseplate! 🌱',
        hintSentenceTr: 'Yeşil Lego zemin plakası gibi!'
      },
      {
        id: 'c5',
        word: 'Orange',
        translation: 'Turuncu',
        phonetic: 'O-rınç',
        category: 'Colors',
        icon: 'Square',
        colorHex: '#FF7F00',
        bgClass: 'bg-orange-500 hover:bg-orange-600 text-white',
        borderClass: 'border-orange-700',
        studColor: '#fb923c',
        hintSentence: 'Like a juicy sweet orange! 🍊',
        hintSentenceTr: 'Tatlı sulu bir portakal gibi!'
      },
      {
        id: 'c6',
        word: 'Circle',
        translation: 'Daire / Çember',
        phonetic: 'Sör-kıl',
        category: 'Shapes',
        icon: 'Circle',
        colorHex: '#8A2BE2',
        bgClass: 'bg-purple-600 hover:bg-purple-700 text-white',
        borderClass: 'border-purple-800',
        studColor: '#c084fc',
        hintSentence: 'Round and round like a wheel! ⚙️',
        hintSentenceTr: 'Tekerlek gibi yuvarlak!'
      },
      {
        id: 'c7',
        word: 'Square',
        translation: 'Kare',
        phonetic: 'Sk-ve-yır',
        category: 'Shapes',
        icon: 'Box',
        colorHex: '#0284C7',
        bgClass: 'bg-sky-500 hover:bg-sky-600 text-white',
        borderClass: 'border-sky-700',
        studColor: '#38bdf8',
        hintSentence: 'Four equal sides like a 2x2 brick! 🧱',
        hintSentenceTr: '4 eşit kenarı olan bir Lego tuğlası gibi!'
      },
      {
        id: 'c8',
        word: 'Triangle',
        translation: 'Üçgen',
        phonetic: 'Tray-en-gıl',
        category: 'Shapes',
        icon: 'Triangle',
        colorHex: '#EC4899',
        bgClass: 'bg-pink-500 hover:bg-pink-600 text-white',
        borderClass: 'border-pink-700',
        studColor: '#f472b6',
        hintSentence: 'Three corners like a Lego roof slope! 📐',
        hintSentenceTr: 'Çatı eğimi gibi üç köşeli!'
      },
      {
        id: 'c9',
        word: 'Star',
        translation: 'Yıldız',
        phonetic: 'Staar',
        category: 'Shapes',
        icon: 'Star',
        colorHex: '#EAB308',
        bgClass: 'bg-amber-400 hover:bg-amber-500 text-slate-900',
        borderClass: 'border-amber-600',
        studColor: '#fde047',
        hintSentence: 'Twinkling in the night sky! ⭐',
        hintSentenceTr: 'Gece gökyüzünde parlayan yıldız!'
      }
    ]
  },
  {
    id: 'level-2',
    number: 2,
    title: 'Animals',
    titleTr: 'Hayvanlar',
    description: 'Meet friendly safari & pet animal friends!',
    themeColor: 'from-emerald-500 to-teal-400',
    borderColor: 'border-emerald-600',
    icon: 'Cat',
    badge: '🦁 Safari Ranger',
    bricksReward: 5,
    items: [
      {
        id: 'a1',
        word: 'Dog',
        translation: 'Köpek',
        phonetic: 'Dog',
        category: 'Pets',
        icon: 'Dog',
        colorHex: '#D97706',
        bgClass: 'bg-amber-600 hover:bg-amber-700 text-white',
        borderClass: 'border-amber-800',
        studColor: '#f59e0b',
        hintSentence: 'Woof woof! Loves to play fetch! 🐶',
        hintSentenceTr: 'Hav hav! Top yakalamayı çok sever!'
      },
      {
        id: 'a2',
        word: 'Cat',
        translation: 'Kedi',
        phonetic: 'Ket',
        category: 'Pets',
        icon: 'Cat',
        colorHex: '#8B5CF6',
        bgClass: 'bg-violet-600 hover:bg-violet-700 text-white',
        borderClass: 'border-violet-800',
        studColor: '#a78bfa',
        hintSentence: 'Meow! Loves milk and warm naps! 🐱',
        hintSentenceTr: 'Miyav! Sütü ve uykuyu sever!'
      },
      {
        id: 'a3',
        word: 'Lion',
        translation: 'Aslan',
        phonetic: 'Lay-ın',
        category: 'Wild',
        icon: 'Crown',
        colorHex: '#EA580C',
        bgClass: 'bg-orange-600 hover:bg-orange-700 text-white',
        borderClass: 'border-orange-800',
        studColor: '#fb923c',
        hintSentence: 'The king of the jungle with a big roar! 🦁',
        hintSentenceTr: 'Ormanların güçlü kralı!'
      },
      {
        id: 'a4',
        word: 'Elephant',
        translation: 'Fil',
        phonetic: 'E-lı-fınt',
        category: 'Wild',
        icon: 'Shield',
        colorHex: '#475569',
        bgClass: 'bg-slate-600 hover:bg-slate-700 text-white',
        borderClass: 'border-slate-800',
        studColor: '#64748b',
        hintSentence: 'Has a long trunk and big ears! 🐘',
        hintSentenceTr: 'Uzun hortumu ve kocaman kulakları var!'
      },
      {
        id: 'a5',
        word: 'Monkey',
        translation: 'Maymun',
        phonetic: 'Man-ki',
        category: 'Wild',
        icon: 'Smile',
        colorHex: '#B45309',
        bgClass: 'bg-yellow-700 hover:bg-yellow-800 text-white',
        borderClass: 'border-yellow-900',
        studColor: '#d97706',
        hintSentence: 'Swings through trees and eats bananas! 🐵',
        hintSentenceTr: 'Ağaçlarda sallanır ve muz yer!'
      },
      {
        id: 'a6',
        word: 'Frog',
        translation: 'Kurbağa',
        phonetic: 'Frog',
        category: 'Water',
        icon: 'Zap',
        colorHex: '#16A34A',
        bgClass: 'bg-green-600 hover:bg-green-700 text-white',
        borderClass: 'border-green-800',
        studColor: '#4ade80',
        hintSentence: 'Ribbit ribbit! Jumps from lily pad to pad! 🐸',
        hintSentenceTr: 'Vrak vrak! Nilüfer yapraklarında zıplar!'
      },
      {
        id: 'a7',
        word: 'Bird',
        translation: 'Kuş',
        phonetic: 'Börd',
        category: 'Air',
        icon: 'Feather',
        colorHex: '#0284C7',
        bgClass: 'bg-sky-500 hover:bg-sky-600 text-white',
        borderClass: 'border-sky-700',
        studColor: '#38bdf8',
        hintSentence: 'Flaps its wings and flies high in the sky! 🐦',
        hintSentenceTr: 'Kanat çırpar ve gökyüzünde uçar!'
      },
      {
        id: 'a8',
        word: 'Fish',
        translation: 'Balık',
        phonetic: 'Fiş',
        category: 'Water',
        icon: 'Fish',
        colorHex: '#0D9488',
        bgClass: 'bg-teal-600 hover:bg-teal-700 text-white',
        borderClass: 'border-teal-800',
        studColor: '#2dd4bf',
        hintSentence: 'Swims in the clear blue water! 🐟',
        hintSentenceTr: 'Mavi sularda yüzer!'
      }
    ]
  },
  {
    id: 'level-3',
    number: 3,
    title: 'Vehicles',
    titleTr: 'Araçlar',
    description: 'Build fast cars, supersonic jets, and trains!',
    themeColor: 'from-blue-600 to-indigo-500',
    borderColor: 'border-blue-700',
    icon: 'Rocket',
    badge: '🚀 Chief Pilot',
    bricksReward: 6,
    items: [
      {
        id: 'v1',
        word: 'Car',
        translation: 'Araba',
        phonetic: 'Kaar',
        category: 'Vehicles',
        icon: 'Car',
        colorHex: '#DC2626',
        bgClass: 'bg-red-600 hover:bg-red-700 text-white',
        borderClass: 'border-red-800',
        studColor: '#f87171',
        hintSentence: 'Beep beep! Vroom on four wheels! 🚗',
        hintSentenceTr: 'Düt düt! 4 tekerlekli araba!'
      },
      {
        id: 'v2',
        word: 'Airplane',
        translation: 'Uçak',
        phonetic: 'Eyr-pleyn',
        category: 'Vehicles',
        icon: 'Plane',
        colorHex: '#2563EB',
        bgClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        borderClass: 'border-blue-800',
        studColor: '#60a5fa',
        hintSentence: 'Zooms above the white fluffy clouds! ✈️',
        hintSentenceTr: 'Bulutların üstünde hızla uçar!'
      },
      {
        id: 'v3',
        word: 'Train',
        translation: 'Tren',
        phonetic: 'Treyn',
        category: 'Vehicles',
        icon: 'Train',
        colorHex: '#4F46E5',
        bgClass: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        borderClass: 'border-indigo-800',
        studColor: '#818cf8',
        hintSentence: 'Choo-choo along the shiny tracks! 🚂',
        hintSentenceTr: 'Çuf çuf raylarda ilerler!'
      },
      {
        id: 'v4',
        word: 'Rocket',
        translation: 'Roket',
        phonetic: 'Ra-kıt',
        category: 'Space',
        icon: 'Rocket',
        colorHex: '#E11D48',
        bgClass: 'bg-rose-600 hover:bg-rose-700 text-white',
        borderClass: 'border-rose-800',
        studColor: '#fb7185',
        hintSentence: '3, 2, 1, Blast off into outer space! 🚀',
        hintSentenceTr: '3, 2, 1, Uzaya fırlatılan roket!'
      },
      {
        id: 'v5',
        word: 'Boat',
        translation: 'Gemi / Bot',
        phonetic: 'Bowt',
        category: 'Vehicles',
        icon: 'Ship',
        colorHex: '#0284C7',
        bgClass: 'bg-sky-600 hover:bg-sky-700 text-white',
        borderClass: 'border-sky-800',
        studColor: '#38bdf8',
        hintSentence: 'Floats on water and explores islands! ⛵',
        hintSentenceTr: 'Denizlerde yüzer ve adalara gider!'
      },
      {
        id: 'v6',
        word: 'Helicopter',
        translation: 'Helikopter',
        phonetic: 'He-li-kop-tır',
        category: 'Vehicles',
        icon: 'Compass',
        colorHex: '#059669',
        bgClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        borderClass: 'border-emerald-800',
        studColor: '#34d399',
        hintSentence: 'Spinning propeller blades lift it straight up! 🚁',
        hintSentenceTr: 'Pervanesi dönerek havaya yükselir!'
      },
      {
        id: 'v7',
        word: 'Bicycle',
        translation: 'Bisiklet',
        phonetic: 'Bay-sı-kıl',
        category: 'Vehicles',
        icon: 'Bike',
        colorHex: '#D97706',
        bgClass: 'bg-amber-600 hover:bg-amber-700 text-white',
        borderClass: 'border-amber-800',
        studColor: '#fbbf24',
        hintSentence: 'Push the pedals and ring the bell! 🚲',
        hintSentenceTr: 'Pedallara bas ve zili çal!'
      },
      {
        id: 'v8',
        word: 'Truck',
        translation: 'Kamyon',
        phonetic: 'Trak',
        category: 'Vehicles',
        icon: 'Truck',
        colorHex: '#EAB308',
        bgClass: 'bg-yellow-500 hover:bg-yellow-600 text-slate-900',
        borderClass: 'border-yellow-700',
        studColor: '#fde047',
        hintSentence: 'Carries heavy loads of Lego bricks! 🚛',
        hintSentenceTr: 'Ağır Lego tuğlalarını taşır!'
      }
    ]
  }
];

// Initial starter models for the Lego Virtual Builder
export const LEGO_BUILD_MODELS = [
  {
    id: 'rocket',
    name: 'Cosmic Star Explorer',
    nameTr: 'Uzay Roketi',
    icon: 'Rocket',
    theme: 'Space Adventure',
    requiredBricks: 10,
    color: '#E52521',
    stages: [
      {
        stage: 1,
        title: 'Booster Engine',
        titleTr: 'Ateşleme Motoru',
        cost: 2,
        unlocked: false,
        visual: 'thruster'
      },
      {
        stage: 2,
        title: 'Fuel Tanks',
        titleTr: 'Yakıt Tankı',
        cost: 2,
        unlocked: false,
        visual: 'fuel_tank'
      },
      {
        stage: 3,
        title: 'Crew Cabin & Cockpit',
        titleTr: 'Pilot Kabini',
        cost: 2,
        unlocked: false,
        visual: 'cockpit'
      },
      {
        stage: 4,
        title: 'Aerodynamic Wing Fins',
        titleTr: 'Roket Kanatları',
        cost: 2,
        unlocked: false,
        visual: 'wings'
      },
      {
        stage: 5,
        title: 'Space Antenna & Nose Cone',
        titleTr: 'Uzay Anteni & Burun',
        cost: 2,
        unlocked: false,
        visual: 'nose_cone'
      }
    ]
  },
  {
    id: 'racecar',
    name: 'Thunder Turbo Racer',
    nameTr: 'Hızlı Yarış Arabası',
    icon: 'Car',
    theme: 'Speed Champions',
    requiredBricks: 10,
    color: '#0055BF',
    stages: [
      {
        stage: 1,
        title: 'Steel Base Chassis',
        titleTr: 'Şasi Tabanı',
        cost: 2,
        unlocked: false,
        visual: 'chassis'
      },
      {
        stage: 2,
        title: 'High-Grip Racing Tires',
        titleTr: 'Büyük Yarış Lastikleri',
        cost: 2,
        unlocked: false,
        visual: 'wheels'
      },
      {
        stage: 3,
        title: 'V8 Turbo Engine Block',
        titleTr: 'Turbo Motor',
        cost: 2,
        unlocked: false,
        visual: 'engine'
      },
      {
        stage: 4,
        title: 'Driver Seat & Steering Wheel',
        titleTr: 'Sürücü Koltuğu & Direksiyon',
        cost: 2,
        unlocked: false,
        visual: 'interior'
      },
      {
        stage: 5,
        title: 'Aerodynamic Rear Spoiler & Gold Trophy',
        titleTr: 'Arka Rüzgarlık & Kupa',
        cost: 2,
        unlocked: false,
        visual: 'spoiler'
      }
    ]
  },
  {
    id: 'castle',
    name: 'Lion Knight Fortress',
    nameTr: 'Aslan Şövalye Kalesi',
    icon: 'Castle',
    theme: 'Medieval Kingdom',
    requiredBricks: 10,
    color: '#237841',
    stages: [
      {
        stage: 1,
        title: 'Moat & Stone Foundation',
        titleTr: 'Taş Temel & Hendek',
        cost: 2,
        unlocked: false,
        visual: 'foundation'
      },
      {
        stage: 2,
        title: 'Heavy Drawbridge Gate',
        titleTr: 'Kale Kapısı & Asma Köprü',
        cost: 2,
        unlocked: false,
        visual: 'gate'
      },
      {
        stage: 3,
        title: 'Twin Watchtowers',
        titleTr: 'İkiz Gözetleme Kuleleri',
        cost: 2,
        unlocked: false,
        visual: 'towers'
      },
      {
        stage: 4,
        title: 'Stone Battlements',
        titleTr: 'Kale Siperleri',
        cost: 2,
        unlocked: false,
        visual: 'battlements'
      },
      {
        stage: 5,
        title: 'Royal Crown Flagpole',
        titleTr: 'Krallık Bayrağı',
        cost: 2,
        unlocked: false,
        visual: 'flag'
      }
    ]
  }
];
