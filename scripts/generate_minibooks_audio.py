#!/usr/bin/env python3
"""
Generate neural audio clips for all MiniBooks stories, pages, questions, and options.
Uses edge-tts (en-US-AnaNeural) and afconvert to produce high quality m4a audio.
"""

import asyncio
import json
import os
import re
import shutil
import subprocess

OUTPUT_DIR = "public/audio/gemini/en"
DOCS_DIR = "docs/audio/gemini/en"
MANIFEST_PATH = "public/audio/manifest.json"
AZURE_MANIFEST_PATH = "public/audio/azure/manifest.json"
DOCS_MANIFEST_PATH = "docs/audio/manifest.json"
DOCS_AZURE_MANIFEST_PATH = "docs/audio/azure/manifest.json"

VOICE = "en-US-AnaNeural"
CONCURRENCY = 8

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(DOCS_DIR, exist_ok=True)


def clean_text_for_tts(text):
    s = str(text or "").strip()
    if not s:
        return ""
    # remove emojis and non-alphanumeric / basic punctuation
    s = re.sub(r"[^\w\s.,!?'’\":;-]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def text_to_slug(text):
    s = str(text or "").lower().strip()
    s = re.sub(r"[\x27’\"]", "", s)
    s = re.sub(r"[^a-z0-9]+", "_", s)
    s = re.sub(r"^_+|_+count$", "", s).strip("_")
    if not s:
        s = "audio"
    if len(s) > 55:
        s = s[:55].rstrip("_")
    return s


def extract_minibooks():
    cmd = [
        "node",
        "-e",
        """
const fs = require('fs');
const code = fs.readFileSync('src/components/MiniBooksReader.jsx', 'utf8');
const startIdx = code.indexOf('function getMiniBooks');
const endIdx = code.indexOf('export default function MiniBooksReader');
const fnCode = code.slice(startIdx, endIdx);
const fn = new Function(fnCode + "; return getMiniBooks('Deniz');")();
console.log(JSON.stringify(fn));
""",
    ]
    out = subprocess.check_output(cmd, text=True)
    return json.loads(out)


async def synthesize_item(sem, text, slug, progress):
    m4a_path = os.path.join(OUTPUT_DIR, f"{slug}.m4a")
    tmp_mp3 = os.path.join(OUTPUT_DIR, f"{slug}.tmp.mp3")

    if os.path.exists(m4a_path) and os.path.getsize(m4a_path) > 1000:
        progress["skipped"] += 1
        return

    import edge_tts

    async with sem:
        for attempt in range(3):
            try:
                comm = edge_tts.Communicate(text, VOICE)
                await comm.save(tmp_mp3)

                subprocess.run(
                    ["afconvert", "-f", "m4af", "-d", "aac", tmp_mp3, m4a_path],
                    check=True,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
                if os.path.exists(tmp_mp3):
                    os.remove(tmp_mp3)

                progress["completed"] += 1
                if progress["completed"] % 10 == 0:
                    pct = (progress["completed"] + progress["skipped"]) / progress["total"] * 100
                    print(f"[{pct:5.1f}%] Completed {progress['completed']}/{progress['total']} clips...")
                return
            except Exception as e:
                if os.path.exists(tmp_mp3):
                    os.remove(tmp_mp3)
                if attempt == 2:
                    print(f"Error on '{text}': {e}")
                await asyncio.sleep(1.0)


async def main():
    books = extract_minibooks()
    print(f"Loaded {len(books)} mini books.")

    phrases = set()

    for b in books:
        # Pages
        for p in b.get("pages", []):
            clean = clean_text_for_tts(p["text"])
            if clean:
                phrases.add(clean)

        # Question
        q_clean = clean_text_for_tts(b.get("question", ""))
        if q_clean:
            phrases.add(q_clean)

        # Options
        for opt in b.get("options", []):
            opt_clean = clean_text_for_tts(opt["text"])
            if opt_clean:
                phrases.add(opt_clean)
                # Feedback phrase for wrong answer
                phrases.add(f"That is {opt_clean}. I am asking: {q_clean}")

    print(f"Total unique phrases to synthesize: {len(phrases)}")

    manifest = {}
    if os.path.exists(MANIFEST_PATH):
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            manifest = json.load(f)

    used_slugs = set()
    for v in manifest.values():
        if isinstance(v, str):
            slug_base = os.path.basename(v).replace(".m4a", "").replace(".wav", "")
            used_slugs.add(slug_base)

    items_to_generate = []
    for text in sorted(phrases):
        direct_key = f"en:{text}"
        lower_key = f"en:{text.lower()}"

        existing = manifest.get(direct_key) or manifest.get(lower_key)
        if existing:
            slug = os.path.basename(existing).replace(".m4a", "").replace(".wav", "")
        else:
            base_slug = text_to_slug(text)
            slug = base_slug
            ctr = 2
            while slug in used_slugs:
                slug = f"{base_slug}_{ctr}"
                ctr += 1
            used_slugs.add(slug)
            rel_asset = f"audio/gemini/en/{slug}"
            manifest[direct_key] = rel_asset
            manifest[lower_key] = rel_asset

        items_to_generate.append({"text": text, "slug": slug})

    sem = asyncio.Semaphore(CONCURRENCY)
    progress = {"completed": 0, "skipped": 0, "total": len(items_to_generate)}

    print(f"Synthesizing {len(items_to_generate)} audio clips...")
    tasks = [synthesize_item(sem, item["text"], item["slug"], progress) for item in items_to_generate]
    await asyncio.gather(*tasks)

    print(f"Done! Synthesized: {progress['completed']}, Skipped (already existed): {progress['skipped']}")

    # Save manifests
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    with open(AZURE_MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    # Copy new m4a files to docs/
    copied = 0
    for item in items_to_generate:
        src = os.path.join(OUTPUT_DIR, f"{item['slug']}.m4a")
        dst = os.path.join(DOCS_DIR, f"{item['slug']}.m4a")
        if os.path.exists(src):
            if not os.path.exists(dst) or os.path.getmtime(src) > os.path.getmtime(dst):
                shutil.copy2(src, dst)
                copied += 1

    print(f"Copied {copied} files to docs/audio/gemini/en/")

    # Sync docs manifests
    shutil.copy2(MANIFEST_PATH, DOCS_MANIFEST_PATH)
    shutil.copy2(AZURE_MANIFEST_PATH, DOCS_AZURE_MANIFEST_PATH)
    print("Manifests updated and synchronized successfully.")


if __name__ == "__main__":
    asyncio.run(main())
