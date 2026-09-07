/**
 * Gemini AI Integration for Lego English Adventure.
 * Evaluates early reader / kid pronunciation and provides gentle, encouraging feedback
 * for German and Turkish speaking children.
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Test a Gemini API key with a fast verification ping
 */
export async function testGeminiApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
    return { success: false, message: 'Please enter a valid Gemini API key.' };
  }

  const cleanKey = apiKey.trim();
  const url = `${GEMINI_API_URL}?key=${cleanKey}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: 'Hello! Respond with "OK" if you are ready to help a 7-year-old learn English.' }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 10,
          temperature: 0.1,
        }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData?.error?.message || `HTTP ${response.status}: Failed to authenticate with Gemini.`;
      return { success: false, message: errorMsg };
    }

    const data = await response.json();
    if (data.candidates && data.candidates.length > 0) {
      return { success: true, message: 'Gemini AI connection verified successfully! 🚀' };
    }

    return { success: false, message: 'Gemini responded without candidates.' };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { success: false, message: 'Connection timed out. Please check your internet.' };
    }
    return { success: false, message: err.message || 'Network error connecting to Gemini.' };
  }
}

/**
 * Evaluate child's speech attempt with Gemini AI
 */
export async function evaluateChildSpeechWithGemini({
  apiKey,
  targetPhrase,
  transcript,
  childName = 'Deniz',
  childAge = 7,
}) {
  if (!apiKey) {
    return null;
  }

  const url = `${GEMINI_API_URL}?key=${apiKey.trim()}`;

  const systemPrompt = `You are a warm, kind, and enthusiastic English tutor for a ${childAge}-year-old child named ${childName} whose native languages are German and Turkish.
The child is learning English.
The expected English phrase is: "${targetPhrase}".
The speech recognition transcribed what the child said as: "${transcript}".

Your task:
1. Determine if the child's attempt is acceptable ("isAccepted": true/false).
   Be lenient and gentle: If the child got the main word right (e.g. "morning" for "good morning", or phonetic variation like "gud" or minor accent), mark isAccepted: true.
2. Provide a score from 1 to 3 stars (1 = good try, 2 = great effort, 3 = perfect).
3. Provide a warm, short 1-sentence encouraging feedback in English.
4. Provide a 1-sentence supportive translation in German (tipDe) and Turkish (tipTr).

Respond strictly in valid JSON format:
{
  "isAccepted": boolean,
  "stars": number,
  "feedbackEn": string,
  "feedbackDe": string,
  "feedbackTr": string
}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemPrompt }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: 250,
          temperature: 0.3,
        }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('Gemini API call failed with status:', response.status);
      return null;
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText);
    return {
      isAccepted: Boolean(parsed.isAccepted),
      stars: Math.min(3, Math.max(1, Number(parsed.stars) || 2)),
      feedbackEn: parsed.feedbackEn || `Great effort, ${childName}!`,
      feedbackDe: parsed.feedbackDe || 'Gut gemacht!',
      feedbackTr: parsed.feedbackTr || 'Harika deneme!',
      source: 'gemini',
    };
  } catch (err) {
    console.warn('Gemini evaluation failed or timed out:', err);
    return null;
  }
}

/**
 * Smart offline dialog response generator for Leo the Lego Builder
 */
export function getOfflineLeoResponse(message, childName = 'Deniz') {
  const text = (message || '').toLowerCase().trim();

  if (!text) {
    return {
      replyEn: `Hi ${childName}! Press the button to talk to me!`,
      replyDe: `Hallo ${childName}! Drücke den Knopf, um mit mir zu sprechen!`,
      replyTr: `Merhaba ${childName}! Benimle konuşmak için düğmeye bas!`,
      source: 'offline',
    };
  }

  if (text.includes('hello') || text.includes('hi') || text.includes('hey') || text.includes('merhaba') || text.includes('hallo')) {
    return {
      replyEn: `Hello ${childName}! Are you ready to build something cool?`,
      replyDe: `Hallo ${childName}! Bist du bereit, etwas Cooles zu bauen?`,
      replyTr: `Merhaba ${childName}! Havalı bir şey inşa etmeye hazır mısın?`,
      source: 'offline',
    };
  }

  if (text.includes('color') || text.includes('renk') || text.includes('farbe') || text.includes('red') || text.includes('blue')) {
    return {
      replyEn: `My favorite color is bright red! What is your favorite color?`,
      replyDe: `Meine Lieblingsfarbe ist leuchtendes Rot! Was ist deine?`,
      replyTr: `Benim en sevdiğim renk parlak kırmızı! Seninki ne?`,
      source: 'offline',
    };
  }

  if (text.includes('name') || text.includes('who are you') || text.includes('adın') || text.includes('wer bist du')) {
    return {
      replyEn: `I am Leo the Lego Builder! And you are ${childName}!`,
      replyDe: `Ich bin Leo der Lego-Baumeister! Und du bist ${childName}!`,
      replyTr: `Ben Lego Ustası Leo! Sen de ${childName}'sin!`,
      source: 'offline',
    };
  }

  if (text.includes('how are you') || text.includes('nasılsın') || text.includes('wie geht')) {
    return {
      replyEn: `I am super happy and clicking with bricks! How are you?`,
      replyDe: `Mir geht es super und ich baue gerne! Wie geht es dir?`,
      replyTr: `Bugün çok mutluyum ve tuğlalarla oynuyorum! Sen nasılsın?`,
      source: 'offline',
    };
  }

  if (text.includes('car') || text.includes('araba') || text.includes('auto')) {
    return {
      replyEn: `Vroom! Race cars are super fast! Let's build one!`,
      replyDe: `Brumm! Rennautos sind super schnell! Lass uns eins bauen!`,
      replyTr: `Vınn! Yarış arabaları çok hızlı! Hadi bir tane yapalım!`,
      source: 'offline',
    };
  }

  if (text.includes('rocket') || text.includes('space') || text.includes('roket') || text.includes('rakete')) {
    return {
      replyEn: `3, 2, 1... Blast off! Let's fly our rocket to Mars!`,
      replyDe: `3, 2, 1... Abflug! Lass uns zum Mars fliegen!`,
      replyTr: `3, 2, 1... Fırlatma! Roketimizle Mars'a uçalım!`,
      source: 'offline',
    };
  }

  if (text.includes('cat') || text.includes('dog') || text.includes('kedi') || text.includes('köpek') || text.includes('hund') || text.includes('katze')) {
    return {
      replyEn: `I love animals! Dogs say Woof and cats say Meow!`,
      replyDe: `Ich liebe Tiere! Hunde sagen Wuff und Katzen Miau!`,
      replyTr: `Hayvanları çok severim! Köpekler havlar, kediler miyavlar!`,
      source: 'offline',
    };
  }

  if (text.includes('hungry') || text.includes('pizza') || text.includes('açım') || text.includes('hunger')) {
    return {
      replyEn: `Yum! Pizza is my favorite snack! Do you want a slice?`,
      replyDe: `Lecker! Pizza ist mein Lieblingssnack! Willst du ein Stück?`,
      replyTr: `Nefis! Pizza benim en sevdiğim atıştırmalık! Bir dilim ister misin?`,
      source: 'offline',
    };
  }

  // Default encouraging response
  return {
    replyEn: `That sounds awesome, ${childName}! You speak English so well!`,
    replyDe: `Das klingt toll, ${childName}! Du sprichst so gut Englisch!`,
    replyTr: `Kulağa harika geliyor, ${childName}! Çok güzel İngilizce konuşuyorsun!`,
    source: 'offline',
  };
}

/**
 * Conversational companion call with Gemini AI (fallback to offline dialog)
 */
export async function chatWithLeoGemini({
  apiKey,
  message,
  childName = 'Deniz',
  childAge = 7,
}) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
    return getOfflineLeoResponse(message, childName);
  }

  const url = `${GEMINI_API_URL}?key=${apiKey.trim()}`;
  const systemPrompt = `You are Leo, a playful, warm 3D Lego builder companion for a ${childAge}-year-old child named ${childName}.
The child speaks German and Turkish at home and is learning English.
The child said to you: "${message}".

Rules:
1. Reply in ONE short, joyful, simple English sentence suitable for a 7-year-old (maximum 8-10 words).
2. If the child spoke in German or Turkish, understand their meaning, respond cheerfully in English, and provide the friendly translation.
3. Keep it enthusiastic and ask a simple follow-up question or celebrate.
4. Provide German (replyDe) and Turkish (replyTr) translations of your response.

Respond strictly in valid JSON format:
{
  "replyEn": string,
  "replyDe": string,
  "replyTr": string
}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: 200,
          temperature: 0.7,
        }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return getOfflineLeoResponse(message, childName);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return getOfflineLeoResponse(message, childName);

    const parsed = JSON.parse(rawText);
    return {
      replyEn: parsed.replyEn || `Awesome, ${childName}! Let's build!`,
      replyDe: parsed.replyDe || 'Toll gemacht!',
      replyTr: parsed.replyTr || 'Harika!',
      source: 'gemini',
    };
  } catch (err) {
    console.warn('Gemini chat failed, falling back to local dialog engine:', err);
    return getOfflineLeoResponse(message, childName);
  }
}

