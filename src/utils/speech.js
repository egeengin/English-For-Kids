/**
 * Unified Gemini Studio TTS + Trilingual Fallback Audio Engine
 * Primary: Google Gemini Studio Neural TTS (gemini-3.8-flash-tts) with LRU cache & deduplication.
 * Fallback: Pre-rendered local audio (/audio/{en,de,tr}/) -> Browser Web Speech Synthesis.
 */
import { getEffectiveGeminiApiKey } from './gemini.js';

const GEMINI_TTS_MODELS = [
  'gemini-2.5-flash-preview-tts',
  'gemini-3.8-flash-tts',
  'gemini-3.8-flash-lite-tts',
];
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_VOICE_NAME = 'Kore';
const ALLOWED_VOICES = new Set(['Charon', 'Kore', 'Fenrir', 'Aoede', 'Puck']);
const MAX_TTS_CACHE_SIZE = 160;
const MODEL_COOLDOWN_MS = 10 * 60 * 1000;
const RPM_COOLDOWN_MS = 20 * 1000;
const TTS_IDB_NAME = 'lego_gemini_tts_idb_v2';
const TTS_IDB_STORE = 'wav_cache';

const ttsCache = new Map();
const inFlightRequests = new Map();
const modelCooldownUntil = new Map();
let ttsIdbPromise = null;

let speechSeqToken = 0;
let sharedAudioPlayer = null;
let sharedAudioUnlocked = false;
let unlockListenersAttached = false;
let preloadedStreamAudio = null;
let activeAudio = null;
let activeObjectUrl = null;
let activeUtterance = null;
let webSpeechTimeout = null;
let voices = [];

// Minimal 1-sample silent PCM WAV (8kHz, 16-bit mono) to bless sharedAudioPlayer on user gesture
const SILENT_WAV_BYTES = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 38, 0, 0, 0,
  0x57, 0x41, 0x56, 0x45, 0x66, 0x6d, 0x74, 0x20,
  16, 0, 0, 0, 1, 0, 1, 0,
  0x40, 0x1f, 0, 0, 0x80, 0x3e, 0, 0,
  2, 0, 16, 0, 0x64, 0x61, 0x74, 0x61,
  2, 0, 0, 0, 0, 0,
]);

function ensureUnlockedAudioPlayer() {
  if (typeof Audio === 'undefined') return null;
  if (!sharedAudioPlayer) {
    sharedAudioPlayer = new Audio();
    sharedAudioPlayer.preload = 'auto';
    sharedAudioPlayer.referrerPolicy = 'no-referrer';
    if (typeof sharedAudioPlayer.setAttribute === 'function') {
      sharedAudioPlayer.setAttribute('playsinline', '');
    }
  }
  return sharedAudioPlayer;
}

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

function detachUnlockListeners() {
  if (!unlockListenersAttached || typeof window === 'undefined' || typeof window.removeEventListener !== 'function') {
    return;
  }
  unlockListenersAttached = false;
  window.removeEventListener('pointerdown', handleGestureUnlock, true);
  window.removeEventListener('touchstart', handleGestureUnlock, true);
  window.removeEventListener('keydown', handleGestureUnlock, true);
}

function handleGestureUnlock() {
  unlockAudio();
}

function attachUnlockListeners() {
  if (
    unlockListenersAttached ||
    sharedAudioUnlocked ||
    typeof window === 'undefined' ||
    typeof window.addEventListener !== 'function'
  ) {
    return;
  }
  unlockListenersAttached = true;
  window.addEventListener('pointerdown', handleGestureUnlock, { capture: true, passive: true });
  window.addEventListener('touchstart', handleGestureUnlock, { capture: true, passive: true });
  window.addEventListener('keydown', handleGestureUnlock, { capture: true, passive: true });
}

attachUnlockListeners();

export function unlockAudio() {
  loadVoices();
  const player = ensureUnlockedAudioPlayer();
  if (
    !sharedAudioUnlocked &&
    player &&
    player.paused &&
    !activeAudio &&
    typeof Blob !== 'undefined' &&
    typeof URL !== 'undefined' &&
    typeof URL.createObjectURL === 'function'
  ) {
    try {
      const silentUrl = URL.createObjectURL(new Blob([SILENT_WAV_BYTES], { type: 'audio/wav' }));
      const revokeSilent = () => {
        try {
          URL.revokeObjectURL(silentUrl);
        } catch {
          // ignore
        }
      };
      player.onended = null;
      player.onerror = null;
      player.src = silentUrl;
      const playPromise = player.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            sharedAudioUnlocked = true;
            detachUnlockListeners();
            revokeSilent();
          })
          .catch(() => {
            revokeSilent();
          });
      } else {
        sharedAudioUnlocked = true;
        detachUnlockListeners();
        revokeSilent();
      }
    } catch {
      // ignore
    }
  }
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
    .replace(/!+\s+(?=[\p{L}\p{N}])/gu, ', ')
    .trim()
    .slice(0, 1800);
}

function findAsciiTagOffset(bytes, tag) {
  const codes = Array.from(tag, (ch) => ch.charCodeAt(0));
  const limit = bytes.length - codes.length;
  for (let i = 0; i <= limit; i++) {
    let matched = true;
    for (let j = 0; j < codes.length; j++) {
      if (bytes[i + j] !== codes[j]) {
        matched = false;
        break;
      }
    }
    if (matched) return i;
  }
  return -1;
}

/**
 * Convert Gemini base64 audio payload (RIFF WAV or raw PCM16) into a clean, click-free WAV Blob,
 * stripping non-audio trailing chunks (such as C2PA metadata) and applying gentle fade-in/out ramps.
 */
export function audioDataToWavBlob(base64Data, mimeType = '') {
  const binaryStr = atob(base64Data);
  const totalBytes = binaryStr.length;
  const rawBytes = new Uint8Array(totalBytes);
  for (let i = 0; i < totalBytes; i++) {
    rawBytes[i] = binaryStr.charCodeAt(i);
  }
  const rawView = new DataView(rawBytes.buffer);
  const readTag = (off) =>
    String.fromCharCode(rawBytes[off], rawBytes[off + 1], rawBytes[off + 2], rawBytes[off + 3]);

  const rateMatch = String(mimeType || '').toLowerCase().match(/rate=(\d+)/);
  let sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;

  let pcmSlice = rawBytes;
  const isAlreadyWav =
    totalBytes >= 44 &&
    readTag(0) === 'RIFF' &&
    readTag(8) === 'WAVE';

  if (isAlreadyWav) {
    let offset = 12;
    let dataOffset = 44;
    let dataByteLen = Math.max(0, totalBytes - 44);

    while (offset + 8 <= totalBytes) {
      const chunkId = readTag(offset);
      const chunkSize = rawView.getUint32(offset + 4, true);

      if (chunkId === 'fmt ' && offset + 8 + 16 <= totalBytes) {
        const parsedRate = rawView.getUint32(offset + 8 + 4, true);
        if (parsedRate > 0) sampleRate = parsedRate;
      } else if (chunkId === 'data') {
        dataOffset = offset + 8;
        const maxAvail = Math.max(0, totalBytes - dataOffset);
        dataByteLen = chunkSize > 0 && chunkSize <= maxAvail ? chunkSize : maxAvail;
        break;
      }

      offset += 8 + chunkSize + (chunkSize % 2);
    }

    pcmSlice = rawBytes.subarray(dataOffset, dataOffset + dataByteLen);
  }

  // Defensive strip if any C2PA/JUMBF trailer appears inside extracted PCM bytes
  const c2paIdx = findAsciiTagOffset(pcmSlice, 'C2PA');
  const jumbIdx = findAsciiTagOffset(pcmSlice, 'jumb');
  let truncateAt = pcmSlice.length;
  if (c2paIdx >= 0) truncateAt = Math.min(truncateAt, c2paIdx);
  if (jumbIdx >= 0) truncateAt = Math.min(truncateAt, jumbIdx);
  if (truncateAt < pcmSlice.length) {
    pcmSlice = pcmSlice.subarray(0, truncateAt);
  }

  const pcmByteLen = pcmSlice.length & ~1;
  const buffer = new ArrayBuffer(44 + pcmByteLen);
  const view = new DataView(buffer);
  const writeStr = (off, s) => {
    for (let i = 0; i < s.length; i++) {
      view.setUint8(off + i, s.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + pcmByteLen, true);
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
  view.setUint32(40, pcmByteLen, true);

  const outBytes = new Uint8Array(buffer, 44);
  outBytes.set(pcmSlice.subarray(0, pcmByteLen));

  // Smooth 15ms fade-in and 35ms fade-out to prevent start/end clicks or pops
  const totalSamples = pcmByteLen / 2;
  const fadeInSamples = Math.min(Math.floor(sampleRate * 0.015), Math.floor(totalSamples / 4));
  const fadeOutSamples = Math.min(Math.floor(sampleRate * 0.035), Math.floor(totalSamples / 4));

  for (let i = 0; i < fadeInSamples; i++) {
    const off = 44 + i * 2;
    const s = view.getInt16(off, true);
    view.setInt16(off, Math.round(s * (i / fadeInSamples)), true);
  }
  for (let i = 0; i < fadeOutSamples; i++) {
    const sampleIdx = totalSamples - 1 - i;
    const off = 44 + sampleIdx * 2;
    const s = view.getInt16(off, true);
    view.setInt16(off, Math.round(s * (i / fadeOutSamples)), true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

let didPurgeLegacyIdb = false;

function openTtsIdb() {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  if (!didPurgeLegacyIdb) {
    didPurgeLegacyIdb = true;
    try {
      indexedDB.deleteDatabase('lego_gemini_tts_idb_v1');
    } catch {
      // Ignore legacy IDB cleanup failures
    }
  }
  if (ttsIdbPromise) return ttsIdbPromise;

  ttsIdbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(TTS_IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(TTS_IDB_STORE)) {
          db.createObjectStore(TTS_IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return ttsIdbPromise;
}

async function getCachedWavFromIdb(cacheKey) {
  try {
    const db = await openTtsIdb();
    if (!db) return null;
    return await new Promise((resolve) => {
      const tx = db.transaction(TTS_IDB_STORE, 'readonly');
      const req = tx.objectStore(TTS_IDB_STORE).get(cacheKey);
      req.onsuccess = () => {
        const buf = req.result;
        resolve(buf ? new Blob([buf], { type: 'audio/wav' }) : null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function saveCachedWavToIdb(cacheKey, wavBlob) {
  try {
    const db = await openTtsIdb();
    if (!db || !wavBlob) return;
    const arrayBuf = await wavBlob.arrayBuffer();
    const tx = db.transaction(TTS_IDB_STORE, 'readwrite');
    tx.objectStore(TTS_IDB_STORE).put(arrayBuf, cacheKey);
  } catch {
    // Ignore IDB storage failures
  }
}

/**
 * Synthesize natural neural studio speech via multi-model Gemini TTS with IDB & LRU caching.
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
    const idbBlob = await getCachedWavFromIdb(cacheKey);
    if (idbBlob) {
      ttsCache.set(cacheKey, idbBlob);
      return idbBlob;
    }

    if (typeof fetch !== 'function') throw new Error('FETCH_UNAVAILABLE');

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

    const now = Date.now();
    let lastError = new Error('NO_AVAILABLE_TTS_MODEL');

    for (const model of GEMINI_TTS_MODELS) {
      const cooldownUntil = modelCooldownUntil.get(model) || 0;
      if (cooldownUntil > now) continue;

      const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timerId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller ? controller.signal : undefined,
        });
        if (timerId) clearTimeout(timerId);

        if (res.status === 429 || res.status === 503) {
          let cooldownMs = MODEL_COOLDOWN_MS;
          if (res.status === 429) {
            try {
              const errBody = await res.text();
              const lower = errBody.toLowerCase();
              const isDailyExhausted =
                lower.includes('per day') || lower.includes('perday');
              cooldownMs = isDailyExhausted ? MODEL_COOLDOWN_MS : RPM_COOLDOWN_MS;
            } catch {
              cooldownMs = RPM_COOLDOWN_MS;
            }
          }
          modelCooldownUntil.set(model, Date.now() + cooldownMs);
          lastError = new Error(`GEMINI_TTS_HTTP_${res.status}`);
          continue;
        }

        if (!res.ok) {
          lastError = new Error(`GEMINI_TTS_HTTP_${res.status}`);
          continue;
        }

        const data = await res.json();
        const parts = data?.candidates?.[0]?.content?.parts || [];
        const audioPart = parts.find((p) => p.inlineData && p.inlineData.data);
        if (!audioPart) {
          lastError = new Error('NO_AUDIO_DATA');
          continue;
        }

        const wavBlob = audioDataToWavBlob(audioPart.inlineData.data, audioPart.inlineData.mimeType);

        if (ttsCache.size >= MAX_TTS_CACHE_SIZE) {
          const oldestKey = ttsCache.keys().next().value;
          ttsCache.delete(oldestKey);
        }
        ttsCache.set(cacheKey, wavBlob);
        saveCachedWavToIdb(cacheKey, wavBlob);
        return wavBlob;
      } catch (err) {
        if (timerId) clearTimeout(timerId);
        lastError = err;
      }
    }

    throw lastError;
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

  if (preloadedStreamAudio) {
    try {
      preloadedStreamAudio.onended = null;
      preloadedStreamAudio.onerror = null;
      preloadedStreamAudio.onplaying = null;
      preloadedStreamAudio.oncanplaythrough = null;
      preloadedStreamAudio.pause();
    } catch {
      // ignore
    }
    preloadedStreamAudio = null;
  }

  if (sharedAudioPlayer) {
    try {
      sharedAudioPlayer.onended = null;
      sharedAudioPlayer.onerror = null;
      sharedAudioPlayer.onplaying = null;
      sharedAudioPlayer.oncanplaythrough = null;
      sharedAudioPlayer.pause();
    } catch {
      // ignore
    }
  }

  if (activeAudio && activeAudio !== sharedAudioPlayer) {
    try {
      activeAudio.onended = null;
      activeAudio.onerror = null;
      activeAudio.onplaying = null;
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {
      // ignore
    }
  }
  activeAudio = null;

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
 * Background prefetching is disabled to conserve per-model Gemini TTS daily quota.
 */
export function prefetchSpeech() {
  // No-op
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

const NOVELTY_VOICE_REGEX = /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|wobble|fred|good news|jester|organ|superstar|trinoids|whisper|zarvox|ralph|kathy|junior|grandma|grandpa|rocko|reed|sandy|shelley|eddy|flo|espeak|compact)\b/i;

function selectBestWebSpeechVoice(voiceList, lang) {
  const prefix = String(lang || 'en-US').toLowerCase().slice(0, 2);
  const matching = (voiceList || []).filter(
    (v) => v.lang && v.lang.toLowerCase().startsWith(prefix)
  );
  if (matching.length === 0) return null;

  const scoreVoice = (v) => {
    const name = (v.name || '').toLowerCase();
    const vLang = (v.lang || '').toLowerCase();
    let score = 0;

    // Ban distorted macOS novelty voices like Albert
    if (NOVELTY_VOICE_REGEX.test(name)) score -= 1000;

    if (name.includes('google') || name.includes('natural') || name.includes('neural') || name.includes('online')) {
      score += 100;
    }
    if (name.includes('siri') || name.includes('premium') || name.includes('enhanced')) {
      score += 80;
    }
    if (prefix === 'en' && /\b(samantha|ava|allison|alex|karen|daniel|moira|tessa)\b/i.test(name)) {
      score += 55;
    }
    if (prefix === 'de' && /\b(anna|katja|helena|petra|yannick|markus)\b/i.test(name)) {
      score += 55;
    }
    if (prefix === 'tr' && /\b(yelda|cem|emel|filiz)\b/i.test(name)) {
      score += 55;
    }
    if (vLang === lang.toLowerCase()) score += 10;
    if (!v.localService) score += 15;
    return score;
  };

  return matching
    .slice()
    .sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
}

function playWebSpeech(text, lang = 'en-US', myToken, onEnd, rate = 0.9) {
  if (myToken !== speechSeqToken || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (myToken === speechSeqToken && onEnd) onEnd();
    return;
  }

  try {
    if (voices.length === 0) {
      voices = window.speechSynthesis.getVoices();
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    // Brief 40ms gap after cancel() avoids synchronous Chromium/WebKit audio buffer glitches
    webSpeechTimeout = setTimeout(() => {
      if (myToken !== speechSeqToken) return;

      try {
        const utterance = new SpeechSynthesisUtterance(text);
        activeUtterance = utterance;

        utterance.lang = lang;
        utterance.rate = rate;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        if (voices.length === 0) {
          voices = window.speechSynthesis.getVoices();
        }

        const preferredVoice = selectBestWebSpeechVoice(voices, lang);
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
    }, 40);
  } catch {
    if (myToken === speechSeqToken && onEnd) onEnd();
  }
}

function getGoogleTtsLangCode(lang) {
  const normalized = String(lang || 'en-US').trim();
  const lower = normalized.toLowerCase();
  if (lower === 'en-us' || lower.startsWith('en')) return 'en-US';
  if (lower === 'de-de' || lower.startsWith('de')) return 'de';
  if (lower === 'tr-tr' || lower.startsWith('tr')) return 'tr';
  return normalized || 'en-US';
}

function buildGoogleTtsUrl(chunkText, tl) {
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunkText)}&tl=${encodeURIComponent(tl)}&client=tw-ob`;
}

function chunkTextForTTS(text, maxLen = 180) {
  const input = String(text || '').trim().replace(/\s+/g, ' ');
  if (!input) return [];
  if (input.length <= maxLen) return [input];

  const chunks = [];
  let remaining = input;
  while (remaining.length > maxLen) {
    const slice = remaining.slice(0, maxLen + 1);
    let splitAt = -1;
    for (const sep of ['. ', '! ', '? ', '; ', ': ', ', ']) {
      const idx = slice.lastIndexOf(sep);
      if (idx >= Math.floor(maxLen * 0.4) && idx + 1 > splitAt) {
        splitAt = idx + 1;
      }
    }
    if (splitAt <= 0) {
      const spaceIdx = slice.lastIndexOf(' ');
      if (spaceIdx > 0) splitAt = spaceIdx;
    }
    if (splitAt <= 0) splitAt = maxLen;

    const piece = remaining.slice(0, splitAt).trim();
    if (piece) chunks.push(piece);
    remaining = remaining.slice(splitAt).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

async function playGoogleNaturalStream(text, lang, myToken, onEnd, rate = 1.0) {
  const player = ensureUnlockedAudioPlayer();
  if (myToken !== speechSeqToken || !player) {
    throw new Error('AUDIO_UNAVAILABLE');
  }

  const tl = getGoogleTtsLangCode(lang);
  const chunks = chunkTextForTTS(text, 180);
  if (chunks.length === 0) {
    if (onEnd) onEnd();
    return;
  }

  return new Promise((resolve, reject) => {
    let settled = false;

    const clearPlayerHandlers = () => {
      if (myToken !== speechSeqToken) return;
      player.onended = null;
      player.onerror = null;
      player.onplaying = null;
      player.oncanplaythrough = null;
      if (activeAudio === player) {
        activeAudio = null;
      }
    };

    const playChunk = (idx) => {
      if (myToken !== speechSeqToken) return;
      const chunkUrl = buildGoogleTtsUrl(chunks[idx], tl);

      player.onended = null;
      player.onerror = null;
      player.onplaying = null;
      player.oncanplaythrough = null;
      player.referrerPolicy = 'no-referrer';
      player.volume = 1.0;
      player.playbackRate = typeof rate === 'number' ? rate : 1.0;
      player.src = chunkUrl;
      activeAudio = player;
      activeObjectUrl = null;

      player.onplaying = () => {
        if (myToken !== speechSeqToken) return;
        if (!settled) {
          settled = true;
          resolve();
        }
        if (idx + 1 < chunks.length) {
          if (preloadedStreamAudio) {
            try {
              preloadedStreamAudio.pause();
            } catch {
              // ignore
            }
          }
          const preloader = new Audio();
          preloader.preload = 'auto';
          preloader.referrerPolicy = 'no-referrer';
          preloader.src = buildGoogleTtsUrl(chunks[idx + 1], tl);
          try {
            preloader.load();
          } catch {
            // ignore
          }
          preloadedStreamAudio = preloader;
        }
      };

      player.onended = () => {
        if (myToken !== speechSeqToken) return;
        if (idx + 1 < chunks.length) {
          if (!settled) {
            settled = true;
            resolve();
          }
          playChunk(idx + 1);
          return;
        }
        clearPlayerHandlers();
        if (!settled) {
          settled = true;
          resolve();
        }
        if (onEnd) onEnd();
      };

      player.onerror = () => {
        if (myToken !== speechSeqToken) return;
        clearPlayerHandlers();
        if (!settled) {
          settled = true;
          reject(new Error('GOOGLE_TTS_STREAM_ERROR'));
          return;
        }
        if (onEnd) onEnd();
      };

      const p = player.play();
      if (p !== undefined) {
        p.catch((err) => {
          if (myToken !== speechSeqToken) return;
          clearPlayerHandlers();
          if (!settled) {
            settled = true;
            reject(err);
            return;
          }
          if (onEnd) onEnd();
        });
      }
    };

    playChunk(0);
  });
}

async function playBlobAudio(wavBlob, myToken, onEnd, rate = 1.0) {
  const audio = ensureUnlockedAudioPlayer();
  if (
    myToken !== speechSeqToken ||
    !audio ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    throw new Error('AUDIO_UNAVAILABLE');
  }

  const objUrl = URL.createObjectURL(wavBlob);
  activeObjectUrl = objUrl;
  audio.onended = null;
  audio.onerror = null;
  audio.onplaying = null;
  audio.oncanplaythrough = null;
  audio.referrerPolicy = 'no-referrer';
  audio.volume = 1.0;
  audio.playbackRate = typeof rate === 'number' ? rate : 1.0;
  audio.src = objUrl;
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
      if (myToken === speechSeqToken) {
        audio.onended = null;
        audio.onerror = null;
        if (activeAudio === audio) {
          activeAudio = null;
        }
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
  { lang = 'en-US', voiceName = DEFAULT_VOICE_NAME, localFolder = 'en', localKey = null, onEnd, rate } = {}
) {
  const clean = cleanTextForTTS(rawText);
  if (!clean) {
    if (onEnd) onEnd();
    return;
  }

  stopSpeech();
  const myToken = speechSeqToken;
  const blobRate = typeof rate === 'number' ? rate : 1.0;
  const webRate = typeof rate === 'number' ? rate : 0.9;

  const canTryNetwork =
    typeof navigator === 'undefined' || navigator.onLine !== false;
  const notFileProtocol =
    typeof window === 'undefined' || !window.location || window.location.protocol !== 'file:';

  if (canTryNetwork && notFileProtocol) {
    try {
      const wavBlob = await synthesizeGeminiSpeech(clean, voiceName);
      if (myToken !== speechSeqToken) return;
      await playBlobAudio(wavBlob, myToken, onEnd, blobRate);
      return;
    } catch {
      if (myToken !== speechSeqToken) return;
    }

    try {
      await playGoogleNaturalStream(clean, lang, myToken, onEnd, blobRate);
      return;
    } catch {
      if (myToken !== speechSeqToken) return;
    }
  }

  if (localKey && KNOWN_EN_WORDS.has(localKey)) {
    playLocalAudioFile(`/audio/${localFolder}/${localKey}`, myToken, onEnd, () => {
      playWebSpeech(clean, lang, myToken, onEnd, webRate);
    });
    return;
  }

  playWebSpeech(clean, lang, myToken, onEnd, webRate);
}

/**
 * Pronounce an English word or sentence (en-US) via Gemini Studio TTS first.
 */
export function speakEnglish(text, onEnd, options = {}) {
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
    rate: options?.rate,
  });
}

/**
 * Pronounce Turkish translation (tr-TR) via Gemini Studio TTS first.
 */
export function speakTurkish(text, onEnd, options = {}) {
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
    rate: options?.rate,
  });
}

/**
 * Pronounce German translation (de-DE) via Gemini Studio TTS first.
 */
export function speakGerman(text, onEnd, options = {}) {
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
    rate: options?.rate,
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
