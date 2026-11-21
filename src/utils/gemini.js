/**
 * Gemini AI Integration for Lego English Adventure.
 * Evaluates early reader / kid pronunciation, powers Gemini Studio TTS,
 * and provides gentle feedback for German and Turkish speaking children.
 */

const GEMINI_TEXT_MODELS = ['gemini-3.6-flash', 'gemini-flash-lite-latest'];
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_KEY_STORAGE = 'lego_english_adventure_gemini_key_v1';

/**
 * Resolve the effective Gemini API key from explicit arg, localStorage, or a local development global.
 * API keys are never bundled into the client.
 * @param {string} [explicitKey]
 * @returns {string}
 */
export function getEffectiveGeminiApiKey(explicitKey = '') {
  if (typeof explicitKey === 'string' && explicitKey.trim().length >= 20) {
    return explicitKey.trim();
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedKey = window.localStorage.getItem(GEMINI_KEY_STORAGE);
      if (savedKey && savedKey.trim().length >= 20) {
        return savedKey.trim();
      }

      // Migrate keys saved by older versions out of the general app state.
      const savedRaw = window.localStorage.getItem('lego_english_adventure_state_v1');
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed?.geminiApiKey && String(parsed.geminiApiKey).trim().length >= 20) {
          const legacyKey = String(parsed.geminiApiKey).trim();
          window.localStorage.setItem(GEMINI_KEY_STORAGE, legacyKey);
          return legacyKey;
        }
      }
      const directKey = window.localStorage.getItem('gemini_api_key');
      if (directKey && directKey.trim().length >= 20) {
        const legacyKey = directKey.trim();
        window.localStorage.setItem(GEMINI_KEY_STORAGE, legacyKey);
        return legacyKey;
      }
    }
  } catch {
    // Ignore storage access errors
  }

  if (typeof globalThis !== 'undefined' && typeof globalThis.GEMINI_LOCAL_KEY === 'string' && globalThis.GEMINI_LOCAL_KEY.trim().length >= 20) {
    return globalThis.GEMINI_LOCAL_KEY.trim();
  }

  return '';
}

export function saveGeminiApiKey(apiKey = '') {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  const cleanKey = typeof apiKey === 'string' ? apiKey.trim() : '';
  if (!cleanKey) {
    window.localStorage.removeItem(GEMINI_KEY_STORAGE);
    return true;
  }
  if (cleanKey.length < 20) {
    return false;
  }
  window.localStorage.setItem(GEMINI_KEY_STORAGE, cleanKey);
  return true;
}

export function clearGeminiApiKey() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.removeItem(GEMINI_KEY_STORAGE);
}

/**
 * Call Gemini generateContent with primary model (`gemini-3.6-flash`) and automatic fallback (`gemini-2.5-flash`).
 */
async function postGeminiWithFallback(apiKey, payload, timeoutMs = 6500) {
  let lastError = null;
  let lastResponse = null;

  for (const model of GEMINI_TEXT_MODELS) {
    const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(payload),
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        return response;
      }
      lastResponse = response;
      if (response.status !== 404 && response.status !== 400 && response.status < 500) {
        break;
      }
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
    }
  }

  if (lastResponse) return lastResponse;
  throw lastError || new Error('GEMINI_REQUEST_FAILED');
}

/**
 * Extract and parse the non-thought JSON text payload from a Gemini generateContent response.
 */
function extractGeminiJson(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const rawText = (parts.find((p) => !p.thought && typeof p.text === 'string') || parts[0])?.text;
  if (!rawText) return null;
  let jsonString = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
  const firstBrace = jsonString.indexOf('{');
  const lastBrace = jsonString.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonString = jsonString.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(jsonString);
}

/**
 * Test a Gemini API key with a fast verification ping
 */
export async function testGeminiApiKey(apiKey) {
  if (typeof apiKey === 'string' && apiKey.trim().length > 0 && apiKey.trim().length < 10) {
    return { success: false, message: 'Please enter a valid Gemini API key.' };
  }

  const cleanKey = getEffectiveGeminiApiKey(apiKey);
  if (!cleanKey) {
    return { success: false, message: 'Please enter a valid Gemini API key.' };
  }

  try {
    const response = await postGeminiWithFallback(
      cleanKey,
      {
        contents: [
          {
            parts: [{ text: 'Hello! Respond with "OK" if you are ready to help a 7-year-old learn English.' }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 10,
          temperature: 0.1,
        },
      },
      7000
    );

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
  const effectiveKey = getEffectiveGeminiApiKey(apiKey);
  if (!effectiveKey) {
    return null;
  }

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
    const response = await postGeminiWithFallback(
      effectiveKey,
      {
        contents: [
          {
            parts: [{ text: systemPrompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
          thinkingConfig: { thinkingBudget: 0 },
        },
      },
      8000
    );

    if (!response.ok) {
      console.warn('Gemini API call failed with status:', response.status);
      return null;
    }

    const data = await response.json();
    const parsed = extractGeminiJson(data);
    if (!parsed) return null;
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

export const LEO_MISSIONS = [
  {
    id: 'free',
    emoji: '💬',
    labelTr: 'Serbest',
    titleTr: 'Serbest Sohbet',
    stepsCount: 3,
    starterEn: (name) => `Hello ${name}! I am Leo. What is your favorite color?`,
    starterDe: (name) => `Hallo ${name}! Ich bin Leo. Was ist deine Lieblingsfarbe?`,
    starterTr: (name) => `Merhaba ${name}! Ben Leo. En sevdiğin renk ne?`,
    starterHints: ['My favorite color is red! 🔴', 'I like blue! 🔵'],
    stepPrompts: [
      {
        en: 'Cool! What animal do you like?',
        de: 'Cool! Welches Tier magst du?',
        tr: 'Harika! Hangi hayvanı seversin?',
        hints: ['I like dogs! 🐶', 'I like dolphins! 🐬'],
      },
      {
        en: 'Awesome! Are you hungry? Pizza or apple?',
        de: 'Super! Hast du Hunger? Pizza oder Apfel?',
        tr: 'Süper! Aç mısın? Pizza mı elma mı?',
        hints: ['Pizza, please! 🍕', 'An apple, please! 🍎'],
      },
      {
        en: 'Yum! You spoke great English today! High five!',
        de: 'Lecker! Du hast heute toll Englisch gesprochen! High five!',
        tr: 'Nefis! Bugün harika İngilizce konuştun! Çak bir beşlik!',
        hints: ['Thank you Leo! 🙌', 'Let us play again! 🎮'],
      },
    ],
  },
  {
    id: 'pizza',
    emoji: '🍕',
    labelTr: 'Pizza',
    titleTr: 'Pizza Siparişi',
    stepsCount: 3,
    starterEn: (name) => `Welcome ${name}! I am the Pizza Chef! Say hello and order!`,
    starterDe: (name) => `Willkommen ${name}! Ich bin der Pizza-Koch! Sag Hallo und bestelle!`,
    starterTr: (name) => `Hoş geldin ${name}! Ben Pizza Şefiyim! Selam ver ve sipariş et!`,
    starterHints: ['Hello Chef! 👋', 'I want a pizza, please! 🍕'],
    stepPrompts: [
      {
        en: 'Hello! Cheese pizza or salami pizza?',
        de: 'Hallo! Käsepizza oder Salamipizza?',
        tr: 'Merhaba! Peynirli pizza mı salamlı pizza mı?',
        hints: ['Cheese pizza, please! 🧀', 'Salami pizza, please! 🍕'],
      },
      {
        en: 'Great choice! Do you want apple juice or water?',
        de: 'Tolle Wahl! Möchtest du Apfelsaft oder Wasser?',
        tr: 'Harika seçim! Elma suyu mu su mu istersin?',
        hints: ['Apple juice, please! 🧃', 'Water, please! 💧'],
      },
      {
        en: 'Here you go! Hot pizza and a cold drink!',
        de: 'Bitte schön! Heiße Pizza und ein kaltes Getränk!',
        tr: 'Buyur! Sıcak pizza ve soğuk içeceğin!',
        hints: ['Thank you very much! 😋', 'It is yummy! 🍕'],
      },
    ],
  },
  {
    id: 'basketball',
    emoji: '🏀',
    labelTr: 'Basket',
    titleTr: 'Kayıp Basket Topu',
    stepsCount: 3,
    starterEn: (name) => `Oh no ${name}! I lost my orange basketball! Where is it?`,
    starterDe: (name) => `Oh nein ${name}! Mein Basketball ist weg! Wo ist er?`,
    starterTr: (name) => `Eyvah ${name}! Turuncu basketbol topumu kaybettim! Nerede?`,
    starterHints: ['Where is the ball? 🏀', 'Let us look for it! 👀'],
    stepPrompts: [
      {
        en: 'Is it under the bed or behind the door?',
        de: 'Ist er unter dem Bett oder hinter der Tür?',
        tr: 'Yatağın altında mı yoksa kapının arkasında mı?',
        hints: ['Look under the bed! 🛏️', 'Look behind the door! 🚪'],
      },
      {
        en: 'Aha! I found the ball! Can you pass or shoot?',
        de: 'Aha! Gefunden! Kannst du passen oder werfen?',
        tr: 'Aha! Topu buldum! Pas atabilir misin yoksa şut mu?',
        hints: ['Pass the ball, please! 🏀', 'I can shoot! 🎯'],
      },
      {
        en: 'Swish! Three points! Great teamwork!',
        de: 'Treffer! Drei Punkte! Tolles Teamwork!',
        tr: 'Süper basket! Üç sayı! Harika takım oyunu!',
        hints: ['Let us play! 🎉', 'I am happy! 😄'],
      },
    ],
  },
  {
    id: 'pokemon',
    emoji: '⚡',
    labelTr: 'Pokemon',
    titleTr: 'Kart Savaşı',
    stepsCount: 3,
    starterEn: (name) => `Hey ${name}! Which card do you pick: Pikachu or Fire Dragon?`,
    starterDe: (name) => `Hey ${name}! Welche Karte wählst du: Pikachu oder Feuerdrache?`,
    starterTr: (name) => `Hey ${name}! Hangi kartı seçiyorsun: Pikachu mu Ateş Ejderhası mı?`,
    starterHints: ['I pick Pikachu! ⚡', 'I pick Fire Dragon! 🐉'],
    stepPrompts: [
      {
        en: 'Cool card! What can it do? Fly or jump?',
        de: 'Coole Karte! Was kann sie? Fliegen oder springen?',
        tr: 'Havalı kart! Ne yapabilir? Uçabilir mi zıplayabilir mi?',
        hints: ['It can fly fast! 🪽', 'It can jump high! ⚡'],
      },
      {
        en: 'Wow, super power! What color is your card?',
        de: 'Wow, Superkraft! Welche Farbe hat deine Karte?',
        tr: 'Vay, süper güç! Kartın ne renk?',
        hints: ['It is bright yellow! 💛', 'It is red and orange! ❤️'],
      },
      {
        en: 'You win the card battle! Shiny champion!',
        de: 'Du gewinnst den Kampf! Glänzender Champion!',
        tr: 'Kart savaşını kazandın! Parlak şampiyon!',
        hints: ['I am the champion! 🏆', 'Thank you Leo! ⚡'],
      },
    ],
  },
  {
    id: 'spaghetti',
    emoji: '🍝',
    labelTr: 'Spagetti',
    titleTr: 'Bolognese Şefi',
    stepsCount: 3,
    starterEn: (name) => `Hello Chef ${name}! Welcome to the Italian Kitchen! What pasta do you want?`,
    starterDe: (name) => `Hallo Chefkoch ${name}! Willkommen in der italienischen Küche! Welche Pasta möchtest du?`,
    starterTr: (name) => `Merhaba Şef ${name}! İtalyan Mutfağına hoş geldin! Hangi makarnayı istersin?`,
    starterHints: ['Spaghetti Bolognese, please! 🍝', 'With extra sauce, please! 🍅'],
    stepPrompts: [
      {
        en: 'Yum! Bolognese is delicious! Do you want cheese on top?',
        de: 'Lecker! Bolognese schmeckt super! Möchtest du Käse oben drauf?',
        tr: 'Nefis! Bolonez harika! Üstüne peynir ister misin?',
        hints: ['Yes, lots of cheese, please! 🧀', 'A little bit of cheese! 🧀'],
      },
      {
        en: 'Here is your warm spaghetti! What dessert should we bake: cake or chocolate pudding?',
        de: 'Hier sind deine warmen Spaghetti! Welchen Nachtisch backen wir: Kuchen oder Pudding?',
        tr: 'İşte sıcacık spagettin! Tatlı olarak ne yapalım: Kek mi çikolatalı muhallebi mi?',
        hints: ['Chocolate pudding, please! 🍮', 'Yummy cake with Mom and Dad! 🎂'],
      },
      {
        en: 'Delicious feast with Mom Melis and Dad Ege! High five, Master Chef!',
        de: 'Köstliches Festessen mit Mama Melis und Papa Ege! High five, Chefkoch!',
        tr: 'Anne Melis ve Baba Ege ile nefis bir ziyafet! Çak bir beşlik, Usta Şef!',
        hints: ['Thank you Chef Leo! 😋', 'That was so yummy! 🍝'],
      },
    ],
  },
  {
    id: 'swimming',
    emoji: '🏊',
    labelTr: 'Yüzme',
    titleTr: 'Gümüş Madalya',
    stepsCount: 3,
    starterEn: (name) => `Welcome to the pool ${name}! Are you ready to earn the Silver Medal?`,
    starterDe: (name) => `Willkommen im Schwimmbad ${name}! Bist du bereit für das Silberabzeichen?`,
    starterTr: (name) => `Havuzuna hoş geldin ${name}! Gümüş madalyayı (Silberabzeichen) almaya hazır mısın?`,
    starterHints: ['Yes, I am ready! 🏊', 'Let us jump in the water! 💦'],
    stepPrompts: [
      {
        en: 'Splendid! Can you swim fast or dive deep to find a ring?',
        de: 'Klasse! Kannst du schnell schwimmen oder tief nach einem Ring tauchen?',
        tr: 'Harika! Hızlı yüzebilir misin yoksa dibe dalıp halka çıkarabilir misin?',
        hints: ['I can swim fast! 🏊', 'I can dive deep! 🤿'],
      },
      {
        en: 'Great job! How many laps did you finish in the big pool?',
        de: 'Toll gemacht! Wie viele Bahnen bist du im großen Becken geschwommen?',
        tr: 'Tebrikler! Büyük havuzda kaç tur tamamladın?',
        hints: ['I swam ten laps! 🏊', 'I swam twenty laps! 🏅'],
      },
      {
        en: 'Hooray! Coach says you earned the Silver Medal! Shining silver champion!',
        de: 'Hurra! Der Schwimmlehrer sagt, du hast Silber geschafft! Silber-Champion!',
        tr: 'Yaşasın! Antrenör gümüş madalyayı kazandığını söyledi! Gümüş şampiyon!',
        hints: ['I got the Silver Medal! 🥈', 'Thank you Coach Leo! 🎉'],
      },
    ],
  },
  {
    id: 'lego',
    emoji: '🧱',
    labelTr: 'Lego Usta',
    titleTr: 'Lego Stüdyosu',
    stepsCount: 3,
    starterEn: (name) => `Welcome Master Builder ${name}! What huge Lego set are we building today?`,
    starterDe: (name) => `Willkommen Meisterbauer ${name}! Welches riesige Lego-Set bauen wir heute?`,
    starterTr: (name) => `Hoş geldin Lego Ustası ${name}! Bugün hangi dev Lego setini yapıyoruz?`,
    starterHints: ['A giant space rocket! 🚀', 'A grand medieval castle! 🏰'],
    stepPrompts: [
      {
        en: 'Awesome! We have thousands of colorful bricks! Which color first?',
        de: 'Klasse! Wir haben tausende bunte Steine! Welche Farbe zuerst?',
        tr: 'Harika! Binlerce renkli parçamız var! Önce hangi renk?',
        hints: ['Red and yellow bricks! 🔴🟡', 'Blue and grey bricks! 🔵🔘'],
      },
      {
        en: 'Snap, snap! Look at that tall tower! Should we put a minifigure on top?',
        de: 'Klick, klick! Schau dir den hohen Turm an! Setzen wir eine Minifigur oben drauf?',
        tr: 'Kıt, kıt! Şu yüksek kuleye bak! En tepesine bir minifigür koyalım mı?',
        hints: ['Yes, put the astronaut on top! 👨‍🚀', 'Put Master Deniz on top! 👦'],
      },
      {
        en: 'Incredible build! You truly are a Lego Master Genius!',
        de: 'Unglaubliches Bauwerk! Du bist wirklich ein Lego-Meistergenie!',
        tr: 'İnanılmaz bir eser! Sen gerçekten bir Lego Usta Dehasısın!',
        hints: ['Lego building is the best! 🧱', 'Let us build more! ✨'],
      },
    ],
  },
  {
    id: 'piano',
    emoji: '🎹',
    labelTr: 'Piyano',
    titleTr: 'Pazartesi Melodisi',
    stepsCount: 3,
    starterEn: (name) => `It is Monday piano time with Jeremias, ${name}! What song do you want to play?`,
    starterDe: (name) => `Es ist Montag-Klavierzeit mit Jeremias, ${name}! Welches Lied möchtest du spielen?`,
    starterTr: (name) => `Jeremias ile Pazartesi piyano vakti geldi ${name}! Hangi parçayı çalmak istersin?`,
    starterHints: ['A happy fast song! 🎵', 'A gentle classical melody! 🎼'],
    stepPrompts: [
      {
        en: 'Lovely! Press the black and white keys gently! Fast tempo or slow tempo?',
        de: 'Wunderschön! Drücke die schwarzen und weißen Tasten sanft! Schnell oder langsam?',
        tr: 'Harika! Siyah ve beyaz tuşlara nazikçe bas! Hızlı tempo mu yavaş tempo mu?',
        hints: ['Fast tempo, please! 🎶', 'Slow and sweet melody! 🎹'],
      },
      {
        en: 'Listen to those chords: Do, Re, Mi, Fa, Sol! Can you play with both hands?',
        de: 'Hör dir diese Akkorde an: Do, Re, Mi, Fa, Sol! Kannst du mit beiden Händen spielen?',
        tr: 'Şu akorları dinle: Do, Re, Mi, Fa, Sol! İki elinle birden çalabilir misin?',
        hints: ['Yes, with both hands! 👐', 'I practice every week! 🎹'],
      },
      {
        en: 'Bravo! Jeremias and the audience are applauding! Standing ovation!',
        de: 'Bravo! Jeremias und das Publikum klatschen! Riesenapplaus!',
        tr: 'Bravo! Jeremias ve tüm salon alkışlıyor! Harika bir konser!',
        hints: ['Thank you Jeremias! 👏', 'Music is so fun! 🎶'],
      },
    ],
  },
  {
    id: 'checker',
    emoji: '🔬',
    labelTr: 'Checker Bilim',
    titleTr: 'Checker & Woozle',
    stepsCount: 3,
    starterEn: (name) => `Checker ${name} is on air! Woozle Goozle has a wild invention! What question should we solve?`,
    starterDe: (name) => `Checker ${name} ist auf Sendung! Woozle Goozle hat eine wilde Erfindung! Welche Frage lösen wir?`,
    starterTr: (name) => `Checker ${name} yayında! Woozle Goozle çılgın bir icat yaptı! Hangi bilim sorusunu çözelim?`,
    starterHints: ['Why do rockets fly to space? 🚀', 'How do 5G phone signals travel? 📡'],
    stepPrompts: [
      {
        en: 'Woozle says: BOOM! The experiment is ready! What happens if we press the red button?',
        de: 'Woozle sagt: BUMM! Das Experiment ist bereit! Was passiert, wenn wir den roten Knopf drücken?',
        tr: 'Woozle diyor ki: BUM! Deney hazır! Kırmızı düğmeye basarsak ne olur?',
        hints: ['Press the button and watch it fly! 🚀', 'Check the science screen! 🖥️'],
      },
      {
        en: 'Aha! Science mystery solved! Who should we ask next: Dad Dr. Ege or Mom Melis?',
        de: 'Aha! Das Wissenschaftsrätsel ist gelöst! Wen fragen wir als nächstes: Papa Dr. Ege oder Mama Melis?',
        tr: 'Aha! Bilim sırrını çözdük! Sırada kime soralım: Baba Dr. Ege mi Anne Melis mi?',
        hints: ['Ask Dad Dr. Ege about 5G signals! 📡', 'Ask Mom Melis about the hospital! 🏥'],
      },
      {
        en: 'Checker Question checked! High five, Junior Scientist Deniz!',
        de: 'Checker-Frage gecheckt! High five, Nachwuchsforscher Deniz!',
        tr: 'Checker Sorusu başarıyla çözüldü! Çak bir beşlik, Genç Bilim İnsanı Deniz!',
        hints: ['Checker Deniz checks it all! 🔬', 'Woozle was so funny! 🐾'],
      },
    ],
  },
  {
    id: 'school',
    emoji: '🏫',
    labelTr: 'Okul 1b',
    titleTr: 'GGS Laurensberg 1b',
    stepsCount: 3,
    starterEn: (name) => `Good morning ${name}! Welcome to Class 1b at GGS Laurensberg! What is our first lesson?`,
    starterDe: (name) => `Guten Morgen ${name}! Willkommen in der Klasse 1b an der GGS Laurensberg! Welches Fach haben wir zuerst?`,
    starterTr: (name) => `Günaydın ${name}! GGS Laurensberg 1b sınıfına hoş geldin! İlk dersimiz ne?`,
    starterHints: ['Reading and writing! 📖', 'Math and numbers! 🧮'],
    stepPrompts: [
      {
        en: 'Frau Schwarz writes a puzzle on the board! Can you solve two-digit addition: 20 plus 15?',
        de: 'Frau Schwarz schreibt ein Rätsel an die Tafel! Kannst du 20 plus 15 rechnen?',
        tr: 'Frau Schwarz tahtaya bir bilmece yazdı! 20 artı 15 iki basamaklı toplamasını çözebilir misin?',
        hints: ['Thirty-five! 3️⃣5️⃣', 'I love math puzzles! 🧮'],
      },
      {
        en: 'Ding dong! Recess bell rings! Which friends are playing in the schoolyard: Ojas, Elias, Julius, Vukasin, or Liam?',
        de: 'Gong! Die Pausenglocke läutet! Welche Freunde spielen auf dem Schulhof?',
        tr: 'Zil çaldı! Teneffüs vakti! Bahçede hangi arkadaşlarınla oynuyorsun: Ojas, Elias, Julius, Vukasin ya da Liam?',
        hints: ['Let us play tag with all of them! 🏃', 'Let us play soccer together! ⚽'],
      },
      {
        en: 'School day in Aachen is awesome! You are a brilliant student, Deniz!',
        de: 'Der Schultag in Aachen ist super! Du bist ein spitzen Schüler, Deniz!',
        tr: 'Aachen’daki okul günü harika! Sen çok başarılı bir öğrencisin Deniz!',
        hints: ['See you tomorrow Frau Schwarz! 👋', 'High five friends! 🙌'],
      },
    ],
  },
  {
    id: 'rocket',
    emoji: '🚀',
    labelTr: 'Roket',
    titleTr: 'Uzay Roketi',
    stepsCount: 3,
    starterEn: (name) => `Ready for space ${name}? Let us build a rocket! What color?`,
    starterDe: (name) => `Bereit für das All ${name}? Bauen wir eine Rakete! Welche Farbe?`,
    starterTr: (name) => `Uzaya hazır mısın ${name}? Hadi roket yapalım! Hangi renk?`,
    starterHints: ['A red rocket, please! 🚀', 'Blue and yellow! 💙'],
    stepPrompts: [
      {
        en: 'Awesome rocket! Now count down: three, two, one!',
        de: 'Tolle Rakete! Zähle runter: drei, zwei, eins!',
        tr: 'Harika roket! Şimdi geri say: three, two, one!',
        hints: ['Three, two, one! 🔢', 'Blast off! 🚀'],
      },
      {
        en: 'Whoosh! Look out the window! What do you see?',
        de: 'Wusch! Schau aus dem Fenster! Was siehst du?',
        tr: 'Vuuuş! Pencereden bak! Ne görüyorsun?',
        hints: ['I see bright stars! ⭐', 'I see the big moon! 🌙'],
      },
      {
        en: 'We landed on Mars! Great space mission!',
        de: 'Wir sind auf dem Mars gelandet! Tolle Mission!',
        tr: 'Mars’a indik! Harika uzay görevi!',
        hints: ['That was awesome! 🪐', 'Fly back home! 🌍'],
      },
    ],
  },
];

/**
 * Smart offline dialog response generator for Leo the Lego Builder
 */
export function getOfflineLeoResponse(message, childName = 'Deniz', missionId = 'free', stepIndex = 0) {
  const text = (message || '').toLowerCase().trim();
  const mission = LEO_MISSIONS.find((m) => m.id === missionId);

  if (mission && mission.id !== 'free') {
    const safeStep = Math.min(Math.max(0, Number(stepIndex) || 0), mission.stepPrompts.length - 1);
    const stepData = mission.stepPrompts[safeStep];
    if (stepData) {
      return {
        replyEn: stepData.en,
        replyDe: stepData.de,
        replyTr: stepData.tr,
        hints: stepData.hints,
        source: 'offline',
      };
    }
  }

  if (!text) {
    return {
      replyEn: `Hi ${childName}! Press the button to talk to me!`,
      replyDe: `Hallo ${childName}! Drücke den Knopf, um mit mir zu sprechen!`,
      replyTr: `Merhaba ${childName}! Benimle konuşmak için düğmeye bas!`,
      hints: ['Hello Leo! 👋', 'My favorite color is blue! 🔵'],
      source: 'offline',
    };
  }

  if (text.includes('hello') || text.includes('hi') || text.includes('hey') || text.includes('merhaba') || text.includes('hallo')) {
    return {
      replyEn: `Hello ${childName}! Are you ready to build something cool?`,
      replyDe: `Hallo ${childName}! Bist du bereit, etwas Cooles zu bauen?`,
      replyTr: `Merhaba ${childName}! Havalı bir şey inşa etmeye hazır mısın?`,
      hints: ['Yes, let us build a rocket! 🚀', 'I like race cars! 🏎️'],
      source: 'offline',
    };
  }

  if (text.includes('color') || text.includes('renk') || text.includes('farbe') || text.includes('red') || text.includes('blue')) {
    return {
      replyEn: `My favorite color is bright red! What is your favorite color?`,
      replyDe: `Meine Lieblingsfarbe ist leuchtendes Rot! Was ist deine?`,
      replyTr: `Benim en sevdiğim renk parlak kırmızı! Seninki ne?`,
      hints: ['I like blue! 🔵', 'My favorite color is yellow! 💛'],
      source: 'offline',
    };
  }

  if (text.includes('name') || text.includes('who are you') || text.includes('adın') || text.includes('wer bist du')) {
    return {
      replyEn: `I am Leo the Lego Builder! And you are ${childName}!`,
      replyDe: `Ich bin Leo der Lego-Baumeister! Und du bist ${childName}!`,
      replyTr: `Ben Lego Ustası Leo! Sen de ${childName}'sin!`,
      hints: ['Nice to meet you Leo! 🤝', 'How are you today? 😄'],
      source: 'offline',
    };
  }

  if (text.includes('how are you') || text.includes('nasılsın') || text.includes('wie geht')) {
    return {
      replyEn: `I am super happy and clicking with bricks! How are you?`,
      replyDe: `Mir geht es super und ich baue gerne! Wie geht es dir?`,
      replyTr: `Bugün çok mutluyum ve tuğlalarla oynuyorum! Sen nasılsın?`,
      hints: ['I am very happy! 😄', 'I am great, thank you! ⭐'],
      source: 'offline',
    };
  }

  if (text.includes('car') || text.includes('araba') || text.includes('auto')) {
    return {
      replyEn: `Vroom! Race cars are super fast! Let's build one!`,
      replyDe: `Brumm! Rennautos sind super schnell! Lass uns eins bauen!`,
      replyTr: `Vınn! Yarış arabaları çok hızlı! Hadi bir tane yapalım!`,
      hints: ['My car is red! 🏎️', 'It is super fast! ⚡'],
      source: 'offline',
    };
  }

  if (text.includes('rocket') || text.includes('space') || text.includes('roket') || text.includes('rakete')) {
    return {
      replyEn: `3, 2, 1... Blast off! Let's fly our rocket to Mars!`,
      replyDe: `3, 2, 1... Abflug! Lass uns zum Mars fliegen!`,
      replyTr: `3, 2, 1... Fırlatma! Roketimizle Mars'a uçalım!`,
      hints: ['I see bright stars! ⭐', 'Blast off to Mars! 🚀'],
      source: 'offline',
    };
  }

  if (text.includes('cat') || text.includes('dog') || text.includes('kedi') || text.includes('köpek') || text.includes('hund') || text.includes('katze')) {
    return {
      replyEn: `I love animals! Dogs say Woof and cats say Meow!`,
      replyDe: `Ich liebe Tiere! Hunde sagen Wuff und Katzen Miau!`,
      replyTr: `Hayvanları çok severim! Köpekler havlar, kediler miyavlar!`,
      hints: ['I like puppies! 🐶', 'Can we play basketball? 🏀'],
      source: 'offline',
    };
  }

  if (text.includes('hungry') || text.includes('pizza') || text.includes('açım') || text.includes('hunger')) {
    return {
      replyEn: `Yum! Pizza is my favorite snack! Do you want a slice?`,
      replyDe: `Lecker! Pizza ist mein Lieblingssnack! Willst du ein Stück?`,
      replyTr: `Nefis! Pizza benim en sevdiğim atıştırmalık! Bir dilim ister misin?`,
      hints: ['Yes, please! 🍕', 'I want apple juice too! 🧃'],
      source: 'offline',
    };
  }

  // Default encouraging response
  const freeStep = LEO_MISSIONS[0].stepPrompts[Math.min(Math.max(0, Number(stepIndex) || 0), 2)];
  return {
    replyEn: `That sounds awesome, ${childName}! ${freeStep.en}`,
    replyDe: `Das klingt toll, ${childName}! ${freeStep.de}`,
    replyTr: `Kulağa harika geliyor, ${childName}! ${freeStep.tr}`,
    hints: freeStep.hints,
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
  missionId = 'free',
  stepIndex = 0,
}) {
  const offlineFallback = getOfflineLeoResponse(message, childName, missionId, stepIndex);
  const effectiveKey = getEffectiveGeminiApiKey(apiKey);
  if (!effectiveKey || effectiveKey.length < 10) {
    return offlineFallback;
  }

  const activeMission = LEO_MISSIONS.find((m) => m.id === missionId) || LEO_MISSIONS[0];
  const systemPrompt = `You are Leo, a playful, warm Lego builder friend talking with a ${childAge}-year-old beginner English learner named ${childName}.
The child speaks German and Turkish at home in Aachen, attends class 1b at primary school, loves building giant Lego sets, plays piano on Mondays, plays basketball on Wednesdays, and is practicing to win a Silver swimming medal on Sundays!
His mom is a doctor (anesthesiologist), his dad is a 5G engineer with a doctorate PhD, and his favorite food is Spaghetti Bolognese. He loves baking sweet pudding & cake with his parents, watching Checker Tobi and Woozle Goozle, and holidaying in Turkey with his friends!
Active Roleplay Mission: "${activeMission.titleTr}" (step ${Number(stepIndex) + 1} of ${activeMission.stepsCount}).
The child said to you: "${message}".

Rules:
1. Reply in ONE ultra-clear, simple beginner English sentence of 5 to 8 basic words (everyday words like colors, animals, Lego, cars, rockets, basketball, pizza) and end with an easy question or playful prompt matching the mission.
2. NEVER use walkie-talkie static words or radio jargon like "Krrch", "Over", "Roger", "Copy", or complex idioms.
3. If the child spoke in German or Turkish, understand them warmly and answer in simple, easy English.
4. Provide natural, child-friendly German (replyDe) and Turkish (replyTr) translations of your exact sentence.
5. Also provide "hints": an array of exactly 2 super-short, simple English reply choices with 1 emoji each (3-6 words) that ${childName} can say next.

Respond strictly in valid JSON format:
{
  "replyEn": string,
  "replyDe": string,
  "replyTr": string,
  "hints": [string, string]
}`;

  try {
    const response = await postGeminiWithFallback(
      effectiveKey,
      {
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.5,
          thinkingConfig: { thinkingBudget: 0 },
        },
      },
      8000
    );

    if (!response.ok) {
      return offlineFallback;
    }

    const data = await response.json();
    const parsed = extractGeminiJson(data);
    if (!parsed) return offlineFallback;
    const hints =
      Array.isArray(parsed.hints) && parsed.hints.length >= 2
        ? parsed.hints.slice(0, 2).map((h) => String(h))
        : offlineFallback.hints;
    return {
      replyEn: parsed.replyEn || offlineFallback.replyEn,
      replyDe: parsed.replyDe || offlineFallback.replyDe,
      replyTr: parsed.replyTr || offlineFallback.replyTr,
      hints,
      source: 'gemini',
    };
  } catch (err) {
    console.warn('Gemini chat failed, falling back to local dialog engine:', err);
    return offlineFallback;
  }
}

