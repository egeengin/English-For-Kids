/**
 * High-Reliability Trilingual Audio Engine (English en-US, German de-DE, Turkish tr-TR)
 * Designed for early readers (7-year-olds learning reading/writing).
 */

let activeAudio = null;
let activeUtterance = null;
let voices = [];

// Pre-rendered local English audio dictionary mapping
const KNOWN_EN_WORDS = new Set([
  // Original curriculum
  'red', 'blue', 'yellow', 'green', 'orange',
  'circle', 'square', 'triangle', 'star',
  'dog', 'cat', 'lion', 'elephant', 'monkey', 'frog', 'bird', 'fish',
  'car', 'airplane', 'train', 'rocket', 'boat', 'helicopter', 'bicycle', 'truck',
  'try_again', 'almost_there', 'you_can_do_it', 'awesome', 'great_job',

  // Classroom scene objects
  'backpack', 'pencil', 'clock', 'apple', 'book', 'globe', 'scissors',

  // Playground scene objects
  'slide', 'swing', 'soccer_ball', 'balloon', 'kite', 'tree', 'skateboard',

  // City scene objects
  'school_bus', 'police_car', 'traffic_light', 'scooter', 'stop_sign', 'bridge', 'building',

  // Conversational story phrases
  'good_morning', 'good_night', 'hello_leo', 'time_for_school', 'breakfast_time',
  'milk_and_bread', 'no_thank_you', 'yes_please', 'are_you_ready', 'lets_go',
  'how_are_you', 'i_am_happy', 'i_am_sleepy', 'what_is_your_name', 'my_name_is_leo',
  'lets_play', 'see_you_tomorrow', 'goodbye', 'welcome_to_school', 'teacher', 'friend', 'school',
  'deniz', 'hello_deniz', 'my_name_is_deniz', 'good_morning_deniz', 'goodbye_deniz',
]);

// Mapping of Turkish translations to audio filenames
const TR_TRANSLATION_MAP = {
  // Original curriculum
  'kırmızı': 'red',
  'mavi': 'blue',
  'sarı': 'yellow',
  'yeşil': 'green',
  'turuncu': 'orange',
  'daire': 'circle',
  'daire / çember': 'circle',
  'çember': 'circle',
  'kare': 'square',
  'üçgen': 'triangle',
  'yıldız': 'star',
  'köpek': 'dog',
  'kedi': 'cat',
  'aslan': 'lion',
  'fil': 'elephant',
  'maymun': 'monkey',
  'kurbağa': 'frog',
  'kuş': 'bird',
  'balık': 'fish',
  'araba': 'car',
  'uçak': 'airplane',
  'tren': 'train',
  'roket': 'rocket',
  'gemi': 'boat',
  'gemi / bot': 'boat',
  'bot': 'boat',
  'helikopter': 'helicopter',
  'bisiklet': 'bicycle',
  'kamyon': 'truck',

  // Classroom
  'sırt çantası': 'backpack',
  'çanta': 'backpack',
  'kalem': 'pencil',
  'saat': 'clock',
  'elma': 'apple',
  'kitap': 'book',
  'küre': 'globe',
  'dünya küresi': 'globe',
  'makas': 'scissors',

  // Playground
  'kaydırak': 'slide',
  'salıncak': 'swing',
  'futbol topu': 'soccer_ball',
  'top': 'soccer_ball',
  'balon': 'balloon',
  'uçurtma': 'kite',
  'ağaç': 'tree',
  'kaykay': 'skateboard',

  // City
  'okul servisi': 'school_bus',
  'okul otobüsü': 'school_bus',
  'polis arabası': 'police_car',
  'trafik ışığı': 'traffic_light',
  'skuter': 'scooter',
  'scooter': 'scooter',
  'dur tabelası': 'stop_sign',
  'dur': 'stop_sign',
  'köprü': 'bridge',
  'bina': 'building',

  // Story phrases
  'günaydın': 'good_morning',
  'günaydın!': 'good_morning',
  'iyi geceler': 'good_night',
  'iyi geceler!': 'good_night',
  'merhaba leo': 'hello_leo',
  'merhaba leo!': 'hello_leo',
  'okul vakti': 'time_for_school',
  'kahvaltı vakti': 'breakfast_time',
  'süt ve ekmek, lütfen': 'milk_and_bread',
  'süt ve ekmek, lütfen!': 'milk_and_bread',
  'hayır, teşekkürler': 'no_thank_you',
  'evet, lütfen': 'yes_please',
  'hazır mısın?': 'are_you_ready',
  'evet, gidelim!': 'lets_go',
  'bugün nasılsın?': 'how_are_you',
  'ben mutluyum': 'i_am_happy',
  'ben mutluyum!': 'i_am_happy',
  'uykum var': 'i_am_sleepy',
  'adın ne?': 'what_is_your_name',
  'benim adım leo': 'my_name_is_leo',
  'benim adım leo!': 'my_name_is_leo',
  'evet, hadi oynayalım!': 'lets_play',
  'yarın görüşürüz': 'see_you_tomorrow',
  'yarın görüşürüz!': 'see_you_tomorrow',
  'hoşça kal': 'goodbye',
  'hoşça kal!': 'goodbye',
  'okula hoş geldin': 'welcome_to_school',
  'öğretmen': 'teacher',
  'arkadaş': 'friend',
  'okul': 'school',
  'deniz': 'deniz',
  'merhaba deniz': 'hello_deniz',
  'merhaba deniz!': 'hello_deniz',
  'benim adım deniz': 'my_name_is_deniz',
  'benim adım deniz!': 'my_name_is_deniz',
  'günaydın deniz': 'good_morning_deniz',
  'günaydın deniz!': 'good_morning_deniz',
  'güle güle deniz': 'goodbye_deniz',
  'güle güle deniz!': 'goodbye_deniz',
};

// Mapping of German translations to audio filenames
const DE_TRANSLATION_MAP = {
  // Original curriculum
  'rot': 'red',
  'blau': 'blue',
  'gelb': 'yellow',
  'grün': 'green',
  'orange': 'orange',
  'kreis': 'circle',
  'quadrat': 'square',
  'dreieck': 'triangle',
  'stern': 'star',
  'hund': 'dog',
  'katze': 'cat',
  'löwe': 'lion',
  'elefant': 'elephant',
  'affe': 'monkey',
  'frosch': 'frog',
  'vogel': 'bird',
  'fisch': 'fish',
  'auto': 'car',
  'flugzeug': 'airplane',
  'zug': 'train',
  'rakete': 'rocket',
  'boot': 'boat',
  'hubschrauber': 'helicopter',
  'fahrrad': 'bicycle',
  'lastwagen': 'truck',
  'lkw': 'truck',

  // Classroom
  'rucksack': 'backpack',
  'der rucksack': 'backpack',
  'bleistift': 'pencil',
  'der bleistift': 'pencil',
  'uhr': 'clock',
  'die uhr': 'clock',
  'apfel': 'apple',
  'der apfel': 'apple',
  'buch': 'book',
  'das buch': 'book',
  'globus': 'globe',
  'der globus': 'globe',
  'schere': 'scissors',
  'die schere': 'scissors',

  // Playground
  'rutsche': 'slide',
  'die rutsche': 'slide',
  'schaukel': 'swing',
  'die schaukel': 'swing',
  'fußball': 'soccer_ball',
  'der fußball': 'soccer_ball',
  'luftballon': 'balloon',
  'der luftballon': 'balloon',
  'ballon': 'balloon',
  'drachen': 'kite',
  'der drachen': 'kite',
  'baum': 'tree',
  'der baum': 'tree',
  'skateboard': 'skateboard',
  'das skateboard': 'skateboard',

  // City
  'schulbus': 'school_bus',
  'der schulbus': 'school_bus',
  'polizeiauto': 'police_car',
  'das polizeiauto': 'police_car',
  'ampel': 'traffic_light',
  'die ampel': 'traffic_light',
  'roller': 'scooter',
  'der roller': 'scooter',
  'stoppschild': 'stop_sign',
  'das stoppschild': 'stop_sign',
  'brücke': 'bridge',
  'die brücke': 'bridge',
  'gebäude': 'building',
  'das gebäude': 'building',

  // Story phrases
  'guten morgen': 'good_morning',
  'guten morgen!': 'good_morning',
  'gute nacht': 'good_night',
  'gute nacht!': 'good_night',
  'hallo leo': 'hello_leo',
  'hallo leo!': 'hello_leo',
  'zeit für die schule': 'time_for_school',
  'frühstückszeit': 'breakfast_time',
  'milch und brot, bitte': 'milk_and_bread',
  'milch und brot, bitte!': 'milk_and_bread',
  'nein, danke': 'no_thank_you',
  'ja, bitte': 'yes_please',
  'bist du bereit?': 'are_you_ready',
  "ja, los geht's!": 'lets_go',
  'wie geht es dir heute?': 'how_are_you',
  'ich bin glücklich': 'i_am_happy',
  'ich bin glücklich!': 'i_am_happy',
  'ich bin müde': 'i_am_sleepy',
  'wie heißt du?': 'what_is_your_name',
  'ich heiße leo': 'my_name_is_leo',
  'ich heiße leo!': 'my_name_is_leo',
  'ja, lass uns spielen!': 'lets_play',
  'bis morgen': 'see_you_tomorrow',
  'bis morgen!': 'see_you_tomorrow',
  'tschüss': 'goodbye',
  'tschüss!': 'goodbye',
  'willkommen in der schule': 'welcome_to_school',
  'lehrerin': 'teacher',
  'die lehrerin': 'teacher',
  'freund': 'friend',
  'der freund': 'friend',
  'schule': 'school',
  'die schule': 'school',
  'deniz': 'deniz',
  'hallo deniz': 'hello_deniz',
  'hallo deniz!': 'hello_deniz',
  'ich heiße deniz': 'my_name_is_deniz',
  'ich heiße deniz!': 'my_name_is_deniz',
  'guten morgen deniz': 'good_morning_deniz',
  'guten morgen deniz!': 'good_morning_deniz',
  'tschüss deniz': 'goodbye_deniz',
  'tschüss deniz!': 'goodbye_deniz',
};

// Safe voice loading for dynamic custom words
function loadVoices() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      voices = window.speechSynthesis.getVoices();
    } catch (e) {
      // ignore
    }
  }
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

export function unlockAudio() {
  loadVoices();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.resume();
    } catch (e) {
      // ignore
    }
  }
}

/**
 * Stop any current audio or speech
 */
export function stopSpeech() {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch (e) {
      // ignore
    }
    activeAudio = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
    activeUtterance = null;
  }
}

/**
 * Helper to play a local audio file with .m4a -> .wav fallback
 */
function playLocalAudioFile(basePath, onEnd, onError) {
  stopSpeech();

  const m4aUrl = `${basePath}.m4a`;
  const wavUrl = `${basePath}.wav`;

  const audio = new Audio(m4aUrl);
  audio.volume = 1.0;
  activeAudio = audio;

  let finished = false;

  const handleEnd = () => {
    if (!finished) {
      finished = true;
      activeAudio = null;
      if (onEnd) onEnd();
    }
  };

  const tryWavFallback = () => {
    try {
      const fallbackAudio = new Audio(wavUrl);
      fallbackAudio.volume = 1.0;
      activeAudio = fallbackAudio;

      fallbackAudio.onended = handleEnd;
      fallbackAudio.onerror = () => {
        if (!finished) {
          finished = true;
          activeAudio = null;
          if (onError) onError();
        }
      };

      const p = fallbackAudio.play();
      if (p !== undefined) {
        p.catch(() => {
          if (!finished) {
            finished = true;
            activeAudio = null;
            if (onError) onError();
          }
        });
      }
    } catch (e) {
      if (onError) onError();
    }
  };

  audio.onended = handleEnd;
  audio.onerror = tryWavFallback;

  const promise = audio.play();
  if (promise !== undefined) {
    promise.catch(() => {
      tryWavFallback();
    });
  }
}

/**
 * Fallback to Web Speech Synthesis for custom parent-added words
 */
function playWebSpeech(text, lang = 'en-US', onEnd) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(text);
    activeUtterance = utterance;

    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.pitch = 1.08;
    utterance.volume = 1.0;

    if (voices.length === 0) {
      voices = window.speechSynthesis.getVoices();
    }

    const preferredVoice = voices.find(v => v.lang.startsWith(lang.slice(0, 2)));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    let finished = false;
    utterance.onend = () => {
      if (!finished) {
        finished = true;
        activeUtterance = null;
        if (onEnd) onEnd();
      }
    };
    utterance.onerror = () => {
      if (!finished) {
        finished = true;
        activeUtterance = null;
        if (onEnd) onEnd();
      }
    };

    window.speechSynthesis.speak(utterance);

    setTimeout(() => {
      if (activeUtterance === utterance) {
        if (!finished) {
          finished = true;
          activeUtterance = null;
          if (onEnd) onEnd();
        }
      }
    }, 3000);
  } catch (e) {
    if (onEnd) onEnd();
  }
}

/**
 * Pronounce an English word (en-US)
 */
export function speakEnglish(text, onEnd) {
  if (!text) {
    if (onEnd) onEnd();
    return;
  }

  const cleanKey = text.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');

  if (KNOWN_EN_WORDS.has(cleanKey)) {
    playLocalAudioFile(`/audio/en/${cleanKey}`, onEnd, () => {
      playWebSpeech(text, 'en-US', onEnd);
    });
  } else {
    playWebSpeech(text, 'en-US', onEnd);
  }
}

/**
 * Pronounce Turkish translation (tr-TR)
 */
export function speakTurkish(text, onEnd) {
  if (!text) {
    if (onEnd) onEnd();
    return;
  }

  const normalized = text.toLowerCase().trim();
  const fileKey = TR_TRANSLATION_MAP[normalized] || normalized.replace(/[^a-z0-9_]/g, '');

  if (KNOWN_EN_WORDS.has(fileKey)) {
    playLocalAudioFile(`/audio/tr/${fileKey}`, onEnd, () => {
      playWebSpeech(text, 'tr-TR', onEnd);
    });
  } else {
    playWebSpeech(text, 'tr-TR', onEnd);
  }
}

/**
 * Pronounce German translation (de-DE)
 */
export function speakGerman(text, onEnd) {
  if (!text) {
    if (onEnd) onEnd();
    return;
  }

  const normalized = text.toLowerCase().trim();
  const fileKey = DE_TRANSLATION_MAP[normalized] || normalized.replace(/[^a-z0-9_]/g, '');

  if (KNOWN_EN_WORDS.has(fileKey)) {
    playLocalAudioFile(`/audio/de/${fileKey}`, onEnd, () => {
      playWebSpeech(text, 'de-DE', onEnd);
    });
  } else {
    playWebSpeech(text, 'de-DE', onEnd);
  }
}

/**
 * Spoken encouragement prompts using real audio
 */
const ENCOURAGEMENT_KEYS = [
  'try_again',
  'almost_there',
  'you_can_do_it',
  'awesome',
  'great_job',
];

export function speakEncouragement(language = 'en', onEnd) {
  const chosenKey = ENCOURAGEMENT_KEYS[Math.floor(Math.random() * ENCOURAGEMENT_KEYS.length)];
  const folder = language === 'de' ? 'de' : 'en';
  playLocalAudioFile(`/audio/${folder}/${chosenKey}`, onEnd, () => {
    if (onEnd) onEnd();
  });
}

/**
 * Universal dialogue / scene audio player
 */
export function speakDialoguePhrase(audioKey, fallbackText, lang = 'en', onEnd) {
  const cleanKey = (audioKey || '').toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
  const folder = lang === 'de' ? 'de' : lang === 'tr' ? 'tr' : 'en';
  const speechLang = lang === 'de' ? 'de-DE' : lang === 'tr' ? 'tr-TR' : 'en-US';

  if (KNOWN_EN_WORDS.has(cleanKey)) {
    playLocalAudioFile(`/audio/${folder}/${cleanKey}`, onEnd, () => {
      playWebSpeech(fallbackText || cleanKey, speechLang, onEnd);
    });
  } else {
    playWebSpeech(fallbackText || cleanKey, speechLang, onEnd);
  }
}

/**
 * Phoneme sound player for early reader letter blending
 */
export function speakPhoneme(letter, onEnd) {
  const phonemeSounds = {
    A: 'ah', B: 'buh', C: 'kuh', D: 'duh', E: 'eh',
    F: 'fff', G: 'guh', H: 'huh', I: 'ih', J: 'juh',
    K: 'kuh', L: 'lll', M: 'mmm', N: 'nnn', O: 'aw',
    P: 'puh', Q: 'kwuh', R: 'rrr', S: 'sss', T: 'tuh',
    U: 'uh', V: 'vvv', W: 'wuh', X: 'ks', Y: 'yuh', Z: 'zzz'
  };
  const char = (letter || '').toUpperCase().trim();
  const phoneticSound = phonemeSounds[char] || char;
  playWebSpeech(phoneticSound, 'en-US', onEnd);
}

