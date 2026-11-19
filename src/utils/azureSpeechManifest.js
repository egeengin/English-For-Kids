let manifestPromise = null;

function getManifestUrl() {
  const baseUrl =
    typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL
      ? import.meta.env.BASE_URL
      : './';
  const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${prefix}audio/azure/manifest.json`;
}

function normalizeLanguage(lang) {
  return String(lang || 'en').toLowerCase().slice(0, 2);
}

export function getAzureSpeechManifestKey(text, lang = 'en') {
  return `${normalizeLanguage(lang)}:${String(text || '').trim()}`;
}

async function loadManifest() {
  if (typeof fetch !== 'function') return null;
  if (!manifestPromise) {
    manifestPromise = fetch(getManifestUrl(), { cache: 'force-cache' })
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null);
  }
  return manifestPromise;
}

export async function getAzureSpeechAsset(text, lang = 'en') {
  const manifest = await loadManifest();
  if (!manifest || typeof manifest !== 'object') return null;
  return manifest[getAzureSpeechManifestKey(text, lang)] || null;
}
