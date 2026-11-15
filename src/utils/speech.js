/**
 * Unified Gemini Studio TTS + Trilingual Fallback Audio Engine
 * Primary: Google Gemini Studio Neural TTS (gemini-3.8-flash-tts) with LRU cache & deduplication.
 * Fallback: Pre-rendered local audio (/audio/{en,de,tr}/) -> Browser Web Speech Synthesis.
 */
import { getEffectiveGeminiApiKey } from './gemini.js';

const GEMINI_TTS_MODEL = 'gemini-3.8-flash-tts';
const GEMINI_TTS_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent`;
const DEFAULT_VOICE_NAME = 'Kore';
const ALLOWED_VOICES = new Set(['Charon', 'Kore', 'Fenrir', 'Aoede', 'Puck']);
const MAX_TTS_CACHE_SIZE = 160;

const ttsCache = new Map();
const inFlightRequests = new Map();

let speechSeqToken = 0;
let activeAudio = null;
let activeObjectUrl = null;
let activeUtterance = null;
let webSpeechTimeout = null;
let voices = [];

// Pre-rendered local English audio dictionary mapping (used strictly for offline fallback)
const KNOWN_EN_WORDS = new Set([
  'red', 'blue', 'yellow', 'green', 'orange',
  'circle', 'square', 'triangle', 'star',
  'dog', 'cat', 'lion', 'elephant', 'monkey', 'frog', 'bird', 'fish',
  'car', 'airplane', 'train', 'rocket', 'boat', 'helicopter', 'bicycle', 'truck',
  'try_again', 'almost_there', 'you_can_do_it', 'awesome', 'great_job',
  'backpack', 'pencil', 'clock', 'apple', 'book', 'globe', 'scissors',
  'slide', 'swing', 'soccer_ball', 'balloon', 'kite', 'tree', 'skateboard',
  'school_bus', 'police_car', 'traffic_light', 'scooter', 'stop_sign', 'bridge', 'building',
  'good_morning', 'good_night', 'hello_leo', 'time_for_school', 'breakfast_time',
  'milk_and_bread', 'no_thank_you', 'yes_please', 'are_you_ready', 'lets_go',
  'how_are_you', 'i_am_happy', 'i_am_sleepy', 'what_is_your_name', 'my_name_is_leo',
  'lets_play', 'see_you_tomorrow', 'goodbye', 'welcome_to_school', 'teacher', 'friend', 'school',
  'deniz', 'hello_deniz', 'my_name_is_deniz', 'good_morning_deniz', 'goodbye_deniz',
  'good_morning_deniz_how_are_you', 'mom_breakfast_ready',
]);

// Mapping of Turkish translations to local fallback audio filenames
const TR_TRANSLATION_MAP = {
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
  'sırt çantası': 'backpack',
  'çanta': 'backpack',
  'kalem': 'pencil',
  'saat': 'clock',
  'elma': 'apple',
  'kitap': 'book',
  'küre': 'globe',
  'dünya küresi': 'globe',
  'makas': 'scissors',
  'kaydırak': 'slide',
  'salıncak': 'swing',
  'futbol topu': 'soccer_ball',
  'top': 'soccer_ball',
  'balon': 'balloon',
  'uçurtma': 'kite',
  'ağaç': 'tree',
  'kaykay': 'skateboard',
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
  'günaydın deniz! okul vakti!': 'good_morning_deniz',
  'günaydın deniz! bugün nasılsın?': 'good_morning_deniz_how_are_you',
  'günaydın canım! kahvaltı masada hazır!': 'mom_breakfast_ready',
  'güle güle deniz': 'goodbye_deniz',
  'güle güle deniz!': 'goodbye_deniz',
};

// Mapping of German translations to local fallback audio filenames
const DE_TRANSLATION_MAP = {
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
  'guten morgen, deniz! zeit für die schule!': 'good_morning_deniz',
  'guten morgen, deniz! wie geht es dir heute?': 'good_morning_deniz_how_are_you',
  'guten morgen, sonnenschein! das frühstück steht bereit!': 'mom_breakfast_ready',
  'tschüss deniz': 'goodbye_deniz',
  'tschüss deniz!': 'goodbye_deniz',
};

function loadVoices() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      voices = window.speechSynthesis.getVoices();
    } catch {
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
    } catch {
      // ignore
    }
  }
}

/**
 * Clean emojis and non-speech symbols while keeping letters, numbers, and natural punctuation.
 * Also expands snake_case keys (e.g. 'soccer_ball' -> 'soccer ball').
 */
export function cleanTextForTTS(rawText) {
  const str = String(rawText || '').trim();
  if (!str) return '';

  const withSpaces = /^[a-z0-9_]+$/i.test(str) && str.includes('_')
    ? str.replace(/_/g, ' ')
    : str;

  return withSpaces
    .replace(/[^\p{L}\p{N}\s.,!?'’":;-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1800);
}

/**
 * Convert Gemini base64 audio payload (already-framed RIFF WAV or raw PCM16) into a playable WAV Blob.
 */
export function audioDataToWavBlob(base64Data, mimeType = '') {
  const binaryStr = atob(base64Data);
  const totalBytes = binaryStr.length;

  const isAlreadyWav =
    totalBytes >= 44 &&
    binaryStr.slice(0, 4) === 'RIFF' &&
    binaryStr.slice(8, 12) === 'WAVE';

  if (isAlreadyWav) {
    const buffer = new ArrayBuffer(totalBytes);
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < totalBytes; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const view = new DataView(buffer);
    view.setUint32(4, totalBytes - 8, true);
    if (binaryStr.slice(36, 40) === 'data') {
      view.setUint32(40, totalBytes - 44, true);
    }
    return new Blob([buffer], { type: 'audio/wav' });
  }

  const rateMatch = String(mimeType || '').toLowerCase().match(/rate=(\d+)/);
  const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;

  const buffer = new ArrayBuffer(44 + totalBytes);
  const view = new DataView(buffer);
  const writeStr = (off, s) => {
    for (let i = 0; i < s.length; i++) {
      view.setUint8(off + i, s.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + totalBytes, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, totalBytes, true);

  const bytes = new Uint8Array(buffer, 44);
  for (let i = 0; i < totalBytes; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Synthesize natural neural studio speech via Gemini 3.8 Flash TTS with LRU memory caching & deduplication.
 */
export async function synthesizeGeminiSpeech(text, voiceName = DEFAULT_VOICE_NAME, timeoutMs = 5500) {
  const clean = cleanTextForTTS(text);
  if (!clean) throw new Error('EMPTY_TEXT');

  const apiKey = getEffectiveGeminiApiKey();
  if (!apiKey) throw new Error('MISSING_API_KEY');

  const voice = ALLOWED_VOICES.has(voiceName) ? voiceName : DEFAULT_VOICE_NAME;
  const cacheKey = `${voice}::${clean}`;

  if (ttsCache.has(cacheKey)) {
    const cached = ttsCache.get(cacheKey);
    // Refresh LRU order
    ttsCache.delete(cacheKey);
    ttsCache.set(cacheKey, cached);
    return cached;
  }

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const runPromise = (async () => {
    if (typeof fetch !== 'function') throw new Error('FETCH_UNAVAILABLE');
    const url = `${GEMINI_TTS_ENDPOINT}?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: clean }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    };

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timerId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined,
      });
    } finally {
      if (timerId) clearTimeout(timerId);
    }

    if (!res.ok) {
      throw new Error(`GEMINI_TTS_HTTP_${res.status}`);
    }

    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const audioPart = parts.find((p) => p.inlineData && p.inlineData.data);
    if (!audioPart) {
      throw new Error('NO_AUDIO_DATA');
    }

    const wavBlob = audioDataToWavBlob(audioPart.inlineData.data, audioPart.inlineData.mimeType);

    if (ttsCache.size >= MAX_TTS_CACHE_SIZE) {
      const oldestKey = ttsCache.keys().next().value;
      ttsCache.delete(oldestKey);
    }
    ttsCache.set(cacheKey, wavBlob);
    return wavBlob;
  })();

  inFlightRequests.set(cacheKey, runPromise);
  try {
    return await runPromise;
  } finally {
    inFlightRequests.delete(cacheKey);
  }
}

/**
 * Stop any active audio or speech synthesis and invalidate in-flight TTS requests.
 */
export function stopSpeech() {
  speechSeqToken += 1;

  if (webSpeechTimeout) {
    clearTimeout(webSpeechTimeout);
    webSpeechTimeout = null;
  }

  if (activeAudio) {
    try {
      activeAudio.onended = null;
      activeAudio.onerror = null;
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {
      // ignore
    }
    activeAudio = null;
  }

  if (activeObjectUrl && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
    try {
      URL.revokeObjectURL(activeObjectUrl);
    } catch {
      // ignore
    }
    activeObjectUrl = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
    activeUtterance = null;
  }
}

/**
 * Pre-warm the Gemini TTS cache for upcoming questions, options, or vocabulary words.
 */
export function prefetchSpeech(texts = [], voiceName = DEFAULT_VOICE_NAME) {
  if (!Array.isArray(texts) || texts.length === 0) return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

  const unique = Array.from(
    new Set(texts.map((t) => cleanTextForTTS(t)).filter(Boolean))
  ).slice(0, 6);

  unique.forEach((clean) => {
    synthesizeGeminiSpeech(clean, voiceName).catch(() => {});
  });
}

function playLocalAudioFile(basePath, myToken, onEnd, onError) {
  if (myToken !== speechSeqToken || typeof Audio === 'undefined') {
    if (onError) onError();
    return;
  }

  const cleanPath = basePath.replace(/^\/+/, '');
  const baseUrl =
    typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL
      ? import.meta.env.BASE_URL
      : './';
  const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  const m4aUrl = `${prefix}${cleanPath}.m4a`;
  const wavUrl = `${prefix}${cleanPath}.wav`;

  const audio = new Audio(m4aUrl);
  audio.volume = 1.0;
  activeAudio = audio;

  let finished = false;

  const handleEnd = () => {
    if (!finished) {
      finished = true;
      if (activeAudio === audio) activeAudio = null;
      if (myToken === speechSeqToken && onEnd) onEnd();
    }
  };

  const tryWavFallback = () => {
    if (myToken !== speechSeqToken) return;
    try {
      const fallbackAudio = new Audio(wavUrl);
      fallbackAudio.volume = 1.0;
      activeAudio = fallbackAudio;

      fallbackAudio.onended = () => {
        if (!finished) {
          finished = true;
          if (activeAudio === fallbackAudio) activeAudio = null;
          if (myToken === speechSeqToken && onEnd) onEnd();
        }
      };
      fallbackAudio.onerror = () => {
        if (!finished) {
          finished = true;
          if (activeAudio === fallbackAudio) activeAudio = null;
          if (myToken === speechSeqToken && onError) onError();
        }
      };

      const p = fallbackAudio.play();
      if (p !== undefined) {
        p.catch(() => {
          if (!finished) {
            finished = true;
            if (activeAudio === fallbackAudio) activeAudio = null;
            if (myToken === speechSeqToken && onError) onError();
          }
        });
      }
    } catch {
      if (myToken === speechSeqToken && onError) onError();
    }
  };

  audio.onended = handleEnd;
  audio.onerror = tryWavFallback;

  const promise = audio.play();
  if (promise !== undefined) {
    promise.catch(tryWavFallback);
  }
}

function playWebSpeech(text, lang = 'en-US', myToken, onEnd) {
  if (myToken !== speechSeqToken || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (myToken === speechSeqToken && onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(text);
    activeUtterance = utterance;

    utterance.lang = lang;
    utterance.rate = 0.88;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;

    if (voices.length === 0) {
      voices = window.speechSynthesis.getVoices();
    }

    const preferredVoice = voices.find((v) => v.lang && v.lang.startsWith(lang.slice(0, 2)));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    let finished = false;
    const finish = () => {
      if (!finished) {
        finished = true;
        if (activeUtterance === utterance) activeUtterance = null;
        if (myToken === speechSeqToken && onEnd) onEnd();
      }
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    window.speechSynthesis.speak(utterance);

    webSpeechTimeout = setTimeout(() => {
      if (activeUtterance === utterance) {
        finish();
      }
    }, Math.max(3000, Math.min(8000, text.length * 110)));
  } catch {
    if (myToken === speechSeqToken && onEnd) onEnd();
  }
}

async function playBlobAudio(wavBlob, myToken, onEnd) {
  if (
    myToken !== speechSeqToken ||
    typeof Audio === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    throw new Error('AUDIO_UNAVAILABLE');
  }

  const objUrl = URL.createObjectURL(wavBlob);
  activeObjectUrl = objUrl;
  const audio = new Audio(objUrl);
  audio.volume = 1.0;
  activeAudio = audio;

  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanupUrl = () => {
      if (activeObjectUrl === objUrl) {
        try {
          URL.revokeObjectURL(objUrl);
        } catch {
          // ignore
        }
        activeObjectUrl = null;
      }
      if (activeAudio === audio) {
        activeAudio = null;
      }
    };

    audio.onended = () => {
      cleanupUrl();
      if (!settled) {
        settled = true;
        resolve();
      }
      if (myToken === speechSeqToken && onEnd) onEnd();
    };

    audio.onerror = () => {
      cleanupUrl();
      if (!settled) {
        settled = true;
        reject(new Error('AUDIO_ELEMENT_ERROR'));
      }
    };

    const p = audio.play();
    if (p !== undefined) {
      p.then(() => {
        if (!settled) {
          settled = true;
          resolve();
        }
      }).catch((err) => {
        cleanupUrl();
        if (!settled) {
          settled = true;
          reject(err);
        }
      });
    } else {
      settled = true;
      resolve();
    }
  });
}

async function speakWithGeminiOrFallback(
  rawText,
  { lang = 'en-US', voiceName = DEFAULT_VOICE_NAME, localFolder = 'en', localKey = null, onEnd } = {}
) {
  const clean = cleanTextForTTS(rawText);
  if (!clean) {
    if (onEnd) onEnd();
    return;
  }

  stopSpeech();
  const myToken = speechSeqToken;

  const canTryNetwork =
    typeof navigator === 'undefined' || navigator.onLine !== false;
  const notFileProtocol =
    typeof window === 'undefined' || !window.location || window.location.protocol !== 'file:';

  if (canTryNetwork && notFileProtocol) {
    try {
      const wavBlob = await synthesizeGeminiSpeech(clean, voiceName);
      if (myToken !== speechSeqToken) return;
      await playBlobAudio(wavBlob, myToken, onEnd);
      return;
    } catch {
      if (myToken !== speechSeqToken) return;
    }
  }

  if (localKey && KNOWN_EN_WORDS.has(localKey)) {
    playLocalAudioFile(`/audio/${localFolder}/${localKey}`, myToken, onEnd, () => {
      playWebSpeech(clean, lang, myToken, onEnd);
    });
    return;
  }

  playWebSpeech(clean, lang, myToken, onEnd);
}

/**
 * Pronounce an English word or sentence (en-US) via Gemini Studio TTS first.
 */
export function speakEnglish(text, onEnd) {
  const clean = cleanTextForTTS(text);
  if (!clean) {
    if (onEnd) onEnd();
    return;
  }

  const exactSnakeKey = clean.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const exactCompactKey = clean.toLowerCase().replace(/[^a-z0-9]/g, '');
  const localKey = KNOWN_EN_WORDS.has(exactSnakeKey)
    ? exactSnakeKey
    : KNOWN_EN_WORDS.has(exactCompactKey)
    ? exactCompactKey
    : null;

  speakWithGeminiOrFallback(clean, {
    lang: 'en-US',
    voiceName: DEFAULT_VOICE_NAME,
    localFolder: 'en',
    localKey,
    onEnd,
  });
}

/**
 * Pronounce Turkish translation (tr-TR) via Gemini Studio TTS first.
 */
export function speakTurkish(text, onEnd) {
  const clean = cleanTextForTTS(text);
  if (!clean) {
    if (onEnd) onEnd();
    return;
  }

  const normalized = clean.toLowerCase().trim();
  const mappedKey = TR_TRANSLATION_MAP[normalized];
  const localKey = mappedKey && KNOWN_EN_WORDS.has(mappedKey) ? mappedKey : null;

  speakWithGeminiOrFallback(clean, {
    lang: 'tr-TR',
    voiceName: DEFAULT_VOICE_NAME,
    localFolder: 'tr',
    localKey,
    onEnd,
  });
}

/**
 * Pronounce German translation (de-DE) via Gemini Studio TTS first.
 */
export function speakGerman(text, onEnd) {
  const clean = cleanTextForTTS(text);
  if (!clean) {
    if (onEnd) onEnd();
    return;
  }

  const normalized = clean.toLowerCase().trim();
  const mappedKey = DE_TRANSLATION_MAP[normalized];
  const localKey = mappedKey && KNOWN_EN_WORDS.has(mappedKey) ? mappedKey : null;

  speakWithGeminiOrFallback(clean, {
    lang: 'de-DE',
    voiceName: DEFAULT_VOICE_NAME,
    localFolder: 'de',
    localKey,
    onEnd,
  });
}

const ENCOURAGEMENT_PHRASES = {
  en: ['Awesome job!', 'Great job!', 'You can do it!', 'Almost there, try again!'],
  de: ['Super gemacht!', 'Toll!', 'Du schaffst das!', 'Fast geschafft, noch einmal!'],
};

/**
 * Spoken encouragement prompts via Gemini Studio TTS with local fallback.
 */
export function speakEncouragement(language = 'en', onEnd) {
  const folder = language === 'de' ? 'de' : 'en';
  const lang = language === 'de' ? 'de-DE' : 'en-US';
  const pool = ENCOURAGEMENT_PHRASES[folder];
  const idx = Math.floor(Math.random() * pool.length);
  const phrase = pool[idx];
  const fallbackKeys = ['awesome', 'great_job', 'you_can_do_it', 'almost_there'];

  speakWithGeminiOrFallback(phrase, {
    lang,
    voiceName: DEFAULT_VOICE_NAME,
    localFolder: folder,
    localKey: fallbackKeys[idx],
    onEnd,
  });
}

/**
 * Universal dialogue / scene audio player.
 * Always speaks the exact on-screen fallbackText via Gemini TTS first so no mismatched short key clip plays.
 */
export function speakDialoguePhrase(audioKey, fallbackText, lang = 'en', onEnd) {
  const expandedKey = (audioKey || '').replace(/_/g, ' ').trim();
  const spokenText = cleanTextForTTS(fallbackText || expandedKey);
  if (!spokenText) {
    if (onEnd) onEnd();
    return;
  }

  const speechLang = lang === 'de' ? 'de-DE' : lang === 'tr' ? 'tr-TR' : 'en-US';
  const folder = lang === 'de' ? 'de' : lang === 'tr' ? 'tr' : 'en';

  // Only allow offline static file fallback if spokenText genuinely corresponds to audioKey or KNOWN_EN_WORDS
  const snakeFromText = spokenText.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const cleanKey = (audioKey || '').toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
  const safeLocalKey = KNOWN_EN_WORDS.has(snakeFromText)
    ? snakeFromText
    : (!fallbackText || cleanTextForTTS(expandedKey).toLowerCase() === spokenText.toLowerCase()) &&
      KNOWN_EN_WORDS.has(cleanKey)
    ? cleanKey
    : null;

  speakWithGeminiOrFallback(spokenText, {
    lang: speechLang,
    voiceName: DEFAULT_VOICE_NAME,
    localFolder: folder,
    localKey: safeLocalKey,
    onEnd,
  });
}

/**
 * Phoneme sound player for early reader letter blending via Gemini Studio TTS first.
 */
export function speakPhoneme(letter, onEnd) {
  const phonemeSounds = {
    A: 'ah', B: 'buh', C: 'kuh', D: 'duh', E: 'eh',
    F: 'fff', G: 'guh', H: 'huh', I: 'ih', J: 'juh',
    K: 'kuh', L: 'lll', M: 'mmm', N: 'nnn', O: 'aw',
    P: 'puh', Q: 'kwuh', R: 'rrr', S: 'sss', T: 'tuh',
    U: 'uh', V: 'vvv', W: 'wuh', X: 'ks', Y: 'yuh', Z: 'zzz',
  };
  const char = (letter || '').toUpperCase().trim();
  const phoneticSound = phonemeSounds[char] || char;

  speakWithGeminiOrFallback(phoneticSound, {
    lang: 'en-US',
    voiceName: DEFAULT_VOICE_NAME,
    localFolder: 'en',
    localKey: null,
    onEnd,
  });
}
