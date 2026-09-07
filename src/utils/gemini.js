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
