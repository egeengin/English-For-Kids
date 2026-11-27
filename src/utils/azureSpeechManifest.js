let manifestPromise = null;
let cachedManifest = null;

function getManifestUrl(pathName = 'audio/manifest.json') {
  const baseUrl =
    typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL
      ? import.meta.env.BASE_URL
      : './';
  const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${prefix}${pathName}`;
}

export function normalizeSpeechLanguage(lang) {
  return String(lang || 'en').toLowerCase().slice(0, 2);
}

export function getAzureSpeechManifestKey(text, lang = 'en') {
  return `${normalizeSpeechLanguage(lang)}:${String(text || '').trim()}`;
}

async function fetchManifestFile(url) {
  if (typeof fetch !== 'function') return null;
  try {
    const response = await fetch(url, { cache: 'no-cache' });
    if (response && response.ok) {
      return await response.json();
    }
  } catch {
    // Fall back to alternative URL or null
  }
  return null;
}

export function resetManifestCacheForTesting() {
  manifestPromise = null;
  cachedManifest = null;
}

async function loadManifest() {
  if (cachedManifest) return cachedManifest;
  if (!manifestPromise) {
    manifestPromise = (async () => {
      // Primary: audio/manifest.json
      let data = await fetchManifestFile(getManifestUrl('audio/manifest.json'));
      // Fallback: audio/azure/manifest.json
      if (!data) {
        data = await fetchManifestFile(getManifestUrl('audio/azure/manifest.json'));
      }
      if (data && typeof data === 'object') {
        cachedManifest = data;
      }
      return data;
    })();
  }
  return manifestPromise;
}

export function preloadSpeechManifest() {
  return loadManifest().catch(() => null);
}

function normalizeKeyText(value) {
  return String(value || '')
    .trim()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .toLowerCase();
}

function lookupInManifest(manifest, text, lang = 'en') {
  if (!manifest || typeof manifest !== 'object') return null;
  const directKey = getAzureSpeechManifestKey(text, lang);
  if (manifest[directKey]) return manifest[directKey];

  const normLang = normalizeSpeechLanguage(lang);
  const lowerKey = `${normLang}:${String(text || '').trim().toLowerCase()}`;
  if (manifest[lowerKey]) return manifest[lowerKey];

  if (!manifest._lowerMap) {
    manifest._lowerMap = new Map();
    manifest._lowerNoPunctMap = new Map();
    for (const k of Object.keys(manifest)) {
      if (k !== '_lowerMap' && k !== '_lowerNoPunctMap') {
        const colonIdx = k.indexOf(':');
        const kNorm = colonIdx === -1
          ? normalizeKeyText(k)
          : `${k.slice(0, colonIdx).toLowerCase()}:${normalizeKeyText(k.slice(colonIdx + 1))}`;
        if (!manifest._lowerMap.has(kNorm)) {
          manifest._lowerMap.set(kNorm, manifest[k]);
        }
        const noPunct = kNorm.replace(/[.,!?:;]+$/g, '');
        if (!manifest._lowerNoPunctMap.has(noPunct)) {
          manifest._lowerNoPunctMap.set(noPunct, manifest[k]);
        }
      }
    }
  }
  const normKey = `${normLang}:${normalizeKeyText(text)}`;
  const exactLower = manifest._lowerMap.get(normKey);
  if (exactLower) return exactLower;

  const noPunctKey = normKey.replace(/[.,!?:;]+$/g, '');
  return manifest._lowerNoPunctMap?.get(noPunctKey) || null;
}

export function getAzureSpeechAssetSync(text, lang = 'en') {
  return lookupInManifest(cachedManifest, text, lang);
}

export async function getAzureSpeechAsset(text, lang = 'en') {
  const manifest = await loadManifest();
  return lookupInManifest(manifest, text, lang);
}
