/**
 * Enhanced Web Speech Synthesis utility with en-US and tr-TR fallback resilience.
 * Unlocks browser audio context on user gesture and provides positive encouragement.
 */

let voices = [];
let audioUnlocked = false;

function loadVoices() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    voices = window.speechSynthesis.getVoices();
  }
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

/**
 * Unlock SpeechSynthesis and AudioContext on first user interaction gesture.
 */
export function unlockAudio() {
  if (typeof window === 'undefined') return;
  audioUnlocked = true;
  loadVoices();
  
  // Warm up speech synthesis with a silent or empty utterance
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const warmup = new SpeechSynthesisUtterance('');
      warmup.volume = 0;
      window.speechSynthesis.speak(warmup);
    } catch (e) {
      console.warn('SpeechSynthesis warmup ignored:', e);
    }
  }
}

/**
 * Find the best available voice with safe fallback
 */
function getBestVoice(targetLocale) {
  if (!voices || voices.length === 0) {
    loadVoices();
  }
  
  if (targetLocale === 'en-US') {
    // Look for child-friendly or standard English voices
    const enVoice = voices.find(v => 
      v.lang === 'en-US' && (v.name.includes('Samantha') || v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Daniel'))
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    return enVoice;
  }

  if (targetLocale === 'tr-TR') {
    // Look for Turkish voices
    const trVoice = voices.find(v => v.lang === 'tr-TR' || v.lang.startsWith('tr'))
      || voices.find(v => v.name.toLowerCase().includes('turkish') || v.name.toLowerCase().includes('yelda'));
    return trVoice;
  }

  return null;
}

/**
 * Speak an English word or phrase (en-US)
 */
export function speakEnglish(text, onEnd) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85; // Calibrated for young kid comprehension
    utterance.pitch = 1.08; // Cheerful, friendly pitch

    const voice = getBestVoice('en-US');
    if (voice) {
      utterance.voice = voice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('speakEnglish error:', err);
    if (onEnd) onEnd();
  }
}

/**
 * Speak Turkish translation (tr-TR)
 */
export function speakTurkish(text, onEnd) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';
    utterance.rate = 0.90;
    utterance.pitch = 1.0;

    const voice = getBestVoice('tr-TR');
    if (voice) {
      utterance.voice = voice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('speakTurkish error:', err);
    if (onEnd) onEnd();
  }
}

/**
 * Positive encouraging prompts for gentle retry psychology
 */
const ENCOURAGING_PROMPTS = [
  'Try again!',
  'Almost there!',
  'You can do it!',
  'Keep going!',
  'Good try, tap another brick!',
];

export function speakEncouragement(onEnd) {
  const prompt = ENCOURAGING_PROMPTS[Math.floor(Math.random() * ENCOURAGING_PROMPTS.length)];
  speakEnglish(prompt, onEnd);
}

/**
 * Stop any ongoing speech
 */
export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
