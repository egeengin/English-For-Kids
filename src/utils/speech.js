/**
 * Multi-Tier Resilient Audio Engine for Kids English Learning.
 * 
 * Tier 1: Real human-like educational TTS audio stream (reliable across all devices & OS).
 * Tier 2: Web Speech Synthesis API (en-US & tr-TR) with voice discovery.
 * Tier 3: Procedural Web Audio formant chime synthesizer (100% offline fallback).
 */

let activeAudio = null;
let activeUtterance = null; // Prevent Chrome GC bug
let voices = [];
let audioUnlocked = false;

// Preload voices
function loadVoices() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      voices = window.speechSynthesis.getVoices();
    } catch (e) {
      console.warn('Voice loading warning:', e);
    }
  }
}

if (typeof window !== 'undefined') {
  if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

/**
 * Unlock audio context & gesture permissions on first interaction
 */
export function unlockAudio() {
  audioUnlocked = true;
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
 * Stop any playing audio or speech
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
 * Play audio stream using HTML5 Audio with timeout fallback
 */
function playOnlineAudioStream(url, onEnd, onError) {
  stopSpeech();

  try {
    const audio = new Audio(url);
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

    const handleError = (err) => {
      if (!finished) {
        finished = true;
        activeAudio = null;
        if (onError) onError(err);
      }
    };

    audio.onended = handleEnd;
    audio.onerror = handleError;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        handleError(err);
      });
    }

    // Safety timeout: if audio doesn't finish within 4s, clear active
    setTimeout(() => {
      if (activeAudio === audio) {
        handleEnd();
      }
    }, 4000);
  } catch (err) {
    if (onError) onError(err);
  }
}

/**
 * Play using Web Speech Synthesis API
 */
function playWebSpeech(text, lang = 'en-US', onEnd, onError) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onError) onError(new Error('SpeechSynthesis not supported'));
    return;
  }

  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(text);
    activeUtterance = utterance; // Prevent garbage collection mid-speech

    utterance.lang = lang;
    utterance.rate = 0.85; // Slightly slower for kid comprehension
    utterance.pitch = 1.08;
    utterance.volume = 1.0;

    if (voices.length === 0) {
      voices = window.speechSynthesis.getVoices();
    }

    const preferredVoice = voices.find(v => v.lang.startsWith(lang.slice(0, 2)));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    let completed = false;

    utterance.onend = () => {
      if (!completed) {
        completed = true;
        activeUtterance = null;
        if (onEnd) onEnd();
      }
    };

    utterance.onerror = (err) => {
      if (!completed) {
        completed = true;
        activeUtterance = null;
        if (onError) onError(err);
      }
    };

    window.speechSynthesis.speak(utterance);

    // Timeout fallback if speech synthesis stalls
    setTimeout(() => {
      if (activeUtterance === utterance) {
        window.speechSynthesis.cancel();
        if (!completed) {
          completed = true;
          activeUtterance = null;
          if (onEnd) onEnd();
        }
      }
    }, 3500);
  } catch (err) {
    if (onError) onError(err);
  }
}

/**
 * Web Audio API Acoustic Speech Chime (Tier 3 100% offline fallback)
 */
function playAcousticSpeechTone(text, onEnd) {
  if (typeof window === 'undefined') {
    if (onEnd) onEnd();
    return;
  }

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      if (onEnd) onEnd();
      return;
    }

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Friendly 2-tone melodic voice synthesizer
    const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.25);
    });

    setTimeout(() => {
      if (onEnd) onEnd();
    }, 500);
  } catch (e) {
    if (onEnd) onEnd();
  }
}

/**
 * Pronounce an English word (en-US) with multi-tier fallback
 */
export function speakEnglish(text, onEnd) {
  if (!text) {
    if (onEnd) onEnd();
    return;
  }

  const cleanText = text.trim();
  const onlineTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(cleanText)}`;

  // Try Online TTS Stream first (crystal-clear human quality, works everywhere)
  playOnlineAudioStream(
    onlineTtsUrl,
    onEnd,
    () => {
      // Fallback 1: Web Speech Synthesis API
      playWebSpeech(
        cleanText,
        'en-US',
        onEnd,
        () => {
          // Fallback 2: Web Audio Acoustic Melodic Voice
          playAcousticSpeechTone(cleanText, onEnd);
        }
      );
    }
  );
}

/**
 * Pronounce Turkish translation (tr-TR) with multi-tier fallback
 */
export function speakTurkish(text, onEnd) {
  if (!text) {
    if (onEnd) onEnd();
    return;
  }

  const cleanText = text.trim();
  const onlineTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=tr&q=${encodeURIComponent(cleanText)}`;

  playOnlineAudioStream(
    onlineTtsUrl,
    onEnd,
    () => {
      playWebSpeech(
        cleanText,
        'tr-TR',
        onEnd,
        () => {
          playAcousticSpeechTone(cleanText, onEnd);
        }
      );
    }
  );
}

/**
 * Positive encouraging prompts
 */
const ENCOURAGING_PROMPTS = [
  'Try again!',
  'Almost there!',
  'You can do it!',
  'Keep going!',
  'Good try!',
];

export function speakEncouragement(onEnd) {
  const prompt = ENCOURAGING_PROMPTS[Math.floor(Math.random() * ENCOURAGING_PROMPTS.length)];
  speakEnglish(prompt, onEnd);
}
