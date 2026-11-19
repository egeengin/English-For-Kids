import { copyFile, unlink, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

function textToSlug(text) {
  let s = String(text || '').toLowerCase().trim();
  s = s.replace(/[\x27’"]/g, '');
  s = s.replace(/[^a-z0-9]+/g, '_');
  s = s.replace(/^_+|_+$/g, '');
  if (!s) s = 'audio';
  if (s.length > 55) {
    s = s.slice(0, 55).replace(/_+$/g, '');
  }
  return s;
}

async function run() {
  const targets = JSON.parse(await readFile('scripts/speech_targets.json', 'utf8'));
  const audioDir = path.resolve('public/audio/gemini/en');
  const manifestPath = path.resolve('public/audio/manifest.json');
  const azureManifestPath = path.resolve('public/audio/azure/manifest.json');

  const slugMap = new Map();
  const textToSlugMap = new Map();

  for (const t of targets) {
    const base = textToSlug(t.text);
    let slug = base;
    let counter = 2;
    while (slugMap.has(slug) && slugMap.get(slug) !== t.text.toLowerCase()) {
      slug = `${base}_${counter}`;
      counter++;
    }
    slugMap.set(slug, t.text.toLowerCase());
    textToSlugMap.set(t.text, slug);
  }

  const manifest = {};
  let renamed = 0;
  const oldHashes = new Set();

  for (const t of targets) {
    const slug = textToSlugMap.get(t.text);
    const hash = t.hash;
    oldHashes.add(hash);

    const oldM4a = path.join(audioDir, `${hash}.m4a`);
    const oldWav = path.join(audioDir, `${hash}.wav`);
    const newM4a = path.join(audioDir, `${slug}.m4a`);
    const newWav = path.join(audioDir, `${slug}.wav`);

    if (existsSync(oldM4a) && !existsSync(newM4a)) {
      await copyFile(oldM4a, newM4a);
    }
    if (existsSync(oldWav) && !existsSync(newWav)) {
      await copyFile(oldWav, newWav);
    }

    manifest[`en:${t.text}`] = `audio/gemini/en/${slug}`;
    manifest[`en:${t.text.toLowerCase()}`] = `audio/gemini/en/${slug}`;
    renamed++;
  }

  // Remove old hash files
  let deleted = 0;
  for (const hash of oldHashes) {
    const oldM4a = path.join(audioDir, `${hash}.m4a`);
    const oldWav = path.join(audioDir, `${hash}.wav`);
    if (existsSync(oldM4a)) {
      await unlink(oldM4a);
      deleted++;
    }
    if (existsSync(oldWav)) {
      await unlink(oldWav);
      deleted++;
    }
  }

  const json = `${JSON.stringify(manifest, null, 2)}\n`;
  await writeFile(manifestPath, json);
  await writeFile(azureManifestPath, json);

  console.log(`Successfully mapped ${renamed} texts to readable slugs.`);
  console.log(`Cleaned up ${deleted} old hash files.`);
  console.log(`Manifests updated at ${manifestPath} and ${azureManifestPath}`);
}

run().catch((e) => {
  console.error('Error renaming:', e);
  process.exit(1);
});
