/**
 * High-Reliability Audio Pronunciation Engine for Kids English Learning.
 * 
 * Uses bundled high-definition studio voices (Samantha for English, Yelda for Turkish)
 * served directly from /audio/en/ and /audio/tr/ for 100% instant, guaranteed playback
 * without reliance on browser TTS support, network connections, or CORS.
 * 
 * Dynamic parent-added words fallback gracefully to Web Speech API.
 */

let activeAudio = null;
let activeUtterance = null;
let voices = [];

// Pre-rendered local English audio dictionary mapping
const KNOWN_EN_WORDS = new Set([
  'red', 'blue', 'yellow', 'green', 'orange',
  'circle', 'square', 'triangle', 'star',
  'dog', 'cat', 'lion', 'elephant', 'monkey', 'frog', 'bird', 'fish',
  'car', 'airplane', 'train', 'rocket', 'boat', 'helicopter', 'bicycle', 'truck',
  'try_again', 'almost_there', 'you_can_do_it', 'awesome', 'great_job',
]);

// Mapping of Turkish translations to audio filenames
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
 * Automatically plays high-definition voice recording (e.g. "Red") or dynamic TTS
 */
export function speakEnglish(text, onEnd) {
  if (!text) {
    if (onEnd) onEnd();
    return;
  }

  const cleanKey = text.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');

  if (KNOWN_EN_WORDS.has(cleanKey)) {
    // Play real high-definition Samantha English voice!
    playLocalAudioFile(`/audio/en/${cleanKey}`, onEnd, () => {
      // If local file load somehow fails, fallback to Web Speech
      playWebSpeech(text, 'en-US', onEnd);
    });
  } else {
    // Dynamic word added by parents
    playWebSpeech(text, 'en-US', onEnd);
  }
}

/**
 * Pronounce Turkish translation (tr-TR)
 * Automatically plays high-definition Yelda voice recording (e.g. "Kırmızı") or dynamic TTS
 */
export function speakTurkish(text, onEnd) {
  if (!text) {
    if (onEnd) onEnd();
    return;
  }

  const normalized = text.toLowerCase().trim();
  const fileKey = TR_TRANSLATION_MAP[normalized] || normalized.replace(/[^a-z0-9_]/g, '');

  if (KNOWN_EN_WORDS.has(fileKey)) {
    // Play real high-definition Yelda Turkish voice!
    playLocalAudioFile(`/audio/tr/${fileKey}`, onEnd, () => {
      playWebSpeech(text, 'tr-TR', onEnd);
    });
  } else {
    playWebSpeech(text, 'tr-TR', onEnd);
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

export function speakEncouragement(onEnd) {
  const chosenKey = ENCOURAGEMENT_KEYS[Math.floor(Math.random() * ENCOURAGEMENT_KEYS.length)];
  playLocalAudioFile(`/audio/en/${chosenKey}`, onEnd, () => {
    if (onEnd) onEnd();
  });
}
