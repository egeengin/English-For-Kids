/**
 * Kid-Friendly Speech Recognition & Interactive Pronunciation Evaluator
 * Supports real-time microphone listening, gentle phonetic forgiving for 7-year-olds
 * with German/Turkish native language backgrounds, and Gemini AI fallback!
 */

import { evaluateChildSpeechWithGemini } from './gemini.js';

/**
 * Check if browser supports Web Speech Recognition API
 */
export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Common German & Turkish phonetic variations for early English learners
 */
const PHONETIC_MAP = {
  // Greetings & Conversational
  'gud': 'good',
  'gut': 'good',
  'guten': 'good',
  'mornin': 'morning',
  'morgen': 'morning',
  'nayt': 'night',
  'nacht': 'night',
  'helo': 'hello',
  'hallo': 'hello',
  'merhaba': 'hello',
  'may': 'my',
  'mein': 'my',
  'nem': 'name',
  'neym': 'name',
  'name': 'name',
  'iz': 'is',
  'ist': 'is',
  'denis': 'deniz',
  'deniz': 'deniz',
  'plis': 'please',
  'bitte': 'please',
  'lütfen': 'please',
  'tenk': 'thank',
  'tenks': 'thanks',
  'danke': 'thank',
  'teşekkür': 'thank',
  'yu': 'you',
  'du': 'you',
  'bay': 'bye',
  'tschüss': 'goodbye',
  'güle': 'goodbye',

  // Colors
  'ret': 'red',
  'rot': 'red',
  'kırmızı': 'red',
  'blu': 'blue',
  'blau': 'blue',
  'mavi': 'blue',
  'yelov': 'yellow',
  'gelb': 'yellow',
  'sarı': 'yellow',
  'grin': 'green',
  'grün': 'green',
  'yeşil': 'green',
  'oranc': 'orange',
  'turuncu': 'orange',

  // Animals & Transport
  'dok': 'dog',
  'hund': 'dog',
  'köpek': 'dog',
  'ket': 'cat',
  'katze': 'cat',
  'kedi': 'cat',
  'kar': 'car',
  'auto': 'car',
  'araba': 'car',
  'treyn': 'train',
  'zug': 'train',
  'tren': 'train',
  'apıl': 'apple',
  'apfel': 'apple',
  'elma': 'apple',
};

/**
 * Clean & normalize a spoken or expected string
 */
export function normalizeText(text = '') {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?!'"🧱⭐🎈🎉]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate Levenshtein similarity ratio between two strings (0.0 to 1.0)
 */
export function calculateSimilarity(s1, s2) {
  const a = normalizeText(s1);
  const b = normalizeText(s2);

  if (a === b) return 1.0;
  if (!a || !b) return 0.0;

  // Direct substring or inclusion match
  if (a.includes(b) || b.includes(a)) {
    const minLen = Math.min(a.length, b.length);
    const maxLen = Math.max(a.length, b.length);
    return Math.max(0.75, minLen / maxLen);
  }

  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const distance = matrix[b.length][a.length];
  const maxLen = Math.max(a.length, b.length);
  return Math.max(0, 1.0 - distance / maxLen);
}

/**
 * Initialize and start browser SpeechRecognition
 */
export function createSpeechListener({
  lang = 'en-US',
  onResult,
  onInterim,
  onFinal,
  onError,
  onEnd,
  onStart,
}) {
  if (!isSpeechRecognitionSupported()) {
    onError && onError('Speech recognition is not supported in this browser. Please try Chrome or Safari.');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = lang;
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 3;

  let lastRecognizedText = '';
  let hasEmittedFinal = false;

  recognition.onstart = () => {
    hasEmittedFinal = false;
    lastRecognizedText = '';
    onStart && onStart();
  };

  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    const currentText = (finalTranscript || interimTranscript).trim();
    if (currentText) {
      lastRecognizedText = currentText;
    }

    if (finalTranscript) {
      hasEmittedFinal = true;
      onFinal && onFinal(finalTranscript.trim());
      onResult && onResult({
        transcript: finalTranscript.trim(),
        isFinal: true,
      });
    } else if (interimTranscript) {
      onInterim && onInterim(interimTranscript.trim());
      onResult && onResult({
        transcript: interimTranscript.trim(),
        isFinal: false,
      });
    }
  };

  recognition.onerror = (event) => {
    console.warn('Speech recognition error event:', event.error);
    let msg = 'Could not hear speech clearly. Please try again!';
    if (event.error === 'not-allowed' || event.error === 'permission-denied') {
      msg = 'Microphone permission was not granted. Please allow microphone access.';
    } else if (event.error === 'no-speech') {
      msg = 'No speech detected. Speak clearly into the microphone!';
    }
    onError && onError(msg, event.error);
  };

  recognition.onend = () => {
    // If recognition stopped without an explicit isFinal, recover last recognized text
    if (!hasEmittedFinal && lastRecognizedText) {
      hasEmittedFinal = true;
      onFinal && onFinal(lastRecognizedText);
      onResult && onResult({
        transcript: lastRecognizedText,
        isFinal: true,
      });
    }
    onEnd && onEnd();
  };

  return {
    start: () => {
      try {
        recognition.start();
      } catch (err) {
        console.warn('Recognition start caught error:', err);
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch (err) {
        console.warn('Recognition stop caught error:', err);
      }
    },
    abort: () => {
      try {
        recognition.abort();
      } catch (err) {}
    }
  };
}

/**
 * High-Level Pronunciation Evaluation:
 * Combines Kid-Tuned Local Phonetic Matcher with Gemini AI fallback
 */
export async function evaluateKidPronunciation({
  targetPhrase,
  transcript,
  childName = 'Deniz',
  childAge = 7,
  geminiApiKey = '',
}) {
  const normTarget = normalizeText(targetPhrase);
  const normTranscript = normalizeText(transcript);

  if (!normTranscript) {
    return {
      isAccepted: false,
      stars: 1,
      feedbackEn: 'Say something out loud! You can do it!',
      feedbackDe: 'Sag etwas laut! Du schaffst das!',
      feedbackTr: 'Yüksek sesle bir şey söyle! Yapabilirsin!',
      source: 'local',
    };
  }

  // Check 1: Exact or direct substring match
  if (normTarget === normTranscript || normTranscript.includes(normTarget)) {
    return {
      isAccepted: true,
      stars: 3,
      feedbackEn: `Spot on, ${childName}! Perfect English! 🌟`,
      feedbackDe: `Perfekt, ${childName}! Ausgezeichnetes Englisch! 🌟`,
      feedbackTr: `Harika, ${childName}! Mükemmel İngilizce! 🌟`,
      source: 'local',
    };
  }

  // Check 2: Word Token Overlap & Phonetic Mapping
  const targetTokens = normTarget.split(' ');
  const spokenTokens = normTranscript.split(' ');

  let matchedTokensCount = 0;
  for (const token of targetTokens) {
    // Check direct word match or phonetic variation
    const phoneticAlt = PHONETIC_MAP[token] || token;
    const isTokenFound = spokenTokens.some(spoken => {
      const normSpoken = PHONETIC_MAP[spoken] || spoken;
      return normSpoken === phoneticAlt || calculateSimilarity(normSpoken, phoneticAlt) >= 0.75;
    });

    if (isTokenFound) {
      matchedTokensCount += 1;
    }
  }

  const tokenRatio = matchedTokensCount / targetTokens.length;
  const rawSimilarity = calculateSimilarity(normTarget, normTranscript);

  // If local evaluation is confident:
  if (tokenRatio >= 0.7 || rawSimilarity >= 0.7) {
    return {
      isAccepted: true,
      stars: tokenRatio === 1 || rawSimilarity >= 0.85 ? 3 : 2,
      feedbackEn: `Great job, ${childName}! That sounded wonderful! 🎉`,
      feedbackDe: `Toll gemacht, ${childName}! Das klang wunderbar! 🎉`,
      feedbackTr: `Aferin ${childName}! Çok güzel konuştun! 🎉`,
      source: 'local',
    };
  }

  // Check 3: If child's native name matches expected (e.g. "My name is Deniz" / "Deniz")
  if (normTarget.includes(childName.toLowerCase()) && normTranscript.includes(childName.toLowerCase())) {
    return {
      isAccepted: true,
      stars: 2,
      feedbackEn: `Good introduction, ${childName}! 👦`,
      feedbackDe: `Schöne Vorstellung, ${childName}! 👦`,
      feedbackTr: `Güzel tanışma, ${childName}! 👦`,
      source: 'local',
    };
  }

  // Check 4: Gemini AI Integration Fallback!
  // If the child was not recognized by local heuristics and parent provided a Gemini API Key:
  if (geminiApiKey && geminiApiKey.trim()) {
    try {
      const geminiResult = await evaluateChildSpeechWithGemini({
        apiKey: geminiApiKey,
        targetPhrase,
        transcript,
        childName,
        childAge,
      });

      if (geminiResult) {
        return geminiResult;
      }
    } catch (err) {
      console.warn('Gemini evaluation fallback error:', err);
    }
  }

  // Check 5: Friendly guidance if attempt was too far off
  return {
    isAccepted: false,
    stars: 1,
    feedbackEn: `Good try, ${childName}! Say: "${targetPhrase}"`,
    feedbackDe: `Guter Versuch, ${childName}! Sag: "${targetPhrase}"`,
    feedbackTr: `İyi deneme, ${childName}! Şöyle söyle: "${targetPhrase}"`,
    source: 'local',
  };
}
