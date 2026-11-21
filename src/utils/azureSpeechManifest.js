let manifestPromise = null;

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
    const response = await fetch(url, { cache: 'force-cache' });
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
}

async function loadManifest() {
  if (!manifestPromise) {
    manifestPromise = (async () => {
      // Primary: audio/manifest.json
      let data = await fetchManifestFile(getManifestUrl('audio/manifest.json'));
      // Fallback: audio/azure/manifest.json
      if (!data) {
        data = await fetchManifestFile(getManifestUrl('audio/azure/manifest.json'));
      }
      return data;
    })();
  }
  return manifestPromise;
}

export async function getAzureSpeechAsset(text, lang = 'en') {
  const manifest = await loadManifest();
  if (!manifest || typeof manifest !== 'object') return null;
  const directKey = getAzureSpeechManifestKey(text, lang);
  if (manifest[directKey]) return manifest[directKey];

  const lowerKey = `${normalizeSpeechLanguage(lang)}:${String(text || '').trim().toLowerCase()}`;
  if (manifest[lowerKey]) return manifest[lowerKey];

  if (!manifest._lowerMap) {
    manifest._lowerMap = new Map();
    manifest._lowerNoPunctMap = new Map();
    for (const k of Object.keys(manifest)) {
      if (k !== '_lowerMap' && k !== '_lowerNoPunctMap') {
        const lower = k.toLowerCase();
        manifest._lowerMap.set(lower, manifest[k]);
        const noPunct = lower.replace(/[.,!?:;]+$/g, '');
        if (!manifest._lowerNoPunctMap.has(noPunct)) {
          manifest._lowerNoPunctMap.set(noPunct, manifest[k]);
        }
      }
    }
  }
  const exactLower = manifest._lowerMap.get(lowerKey);
  if (exactLower) return exactLower;

  const noPunctKey = lowerKey.replace(/[.,!?:;]+$/g, '');
  return manifest._lowerNoPunctMap?.get(noPunctKey) || null;
}
