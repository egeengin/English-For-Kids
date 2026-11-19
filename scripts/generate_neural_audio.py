#!/usr/bin/env python3
"""
High-fidelity Neural AI Audio Generator for English Learning
Generates natural, expressive, human-quality child audio clips (en-US-AnaNeural)
and converts to compact .m4a and .wav formats with human-readable slugs.
"""

import asyncio
import json
import os
import re
import subprocess
import sys
import time
import edge_tts

OUTPUT_DIR = "public/audio/gemini/en"
MANIFEST_PATH = "public/audio/manifest.json"
AZURE_MANIFEST_PATH = "public/audio/azure/manifest.json"
VOICE = os.environ.get("TTS_VOICE", "en-US-AnaNeural")
CONCURRENCY = int(os.environ.get("CONCURRENCY", "12"))

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(os.path.dirname(AZURE_MANIFEST_PATH), exist_ok=True)

def text_to_slug(text):
    s = str(text or "").lower().strip()
    s = re.sub(r"['’\"]", "", s)
    s = re.sub(r"[^a-z0-9]+", "_", s)
    s = s.strip("_")
    if not s:
        s = "audio"
    if len(s) > 55:
        s = s[:55].rstrip("_")
    return s

async def synthesize_item(sem, item, progress):
    text = item["text"]
    slug = item["slug"]
    m4a_path = os.path.join(OUTPUT_DIR, f"{slug}.m4a")
    wav_path = os.path.join(OUTPUT_DIR, f"{slug}.wav")
    tmp_mp3 = os.path.join(OUTPUT_DIR, f"{slug}.tmp.mp3")

    if os.path.exists(m4a_path) and os.path.exists(wav_path):
        progress["skipped"] += 1
        return

    async with sem:
        for attempt in range(3):
            try:
                communicate = edge_tts.Communicate(text, VOICE)
                await communicate.save(tmp_mp3)

                # Convert to .m4a
                subprocess.run(
                    ["afconvert", "-f", "m4af", "-d", "aac", tmp_mp3, m4a_path],
                    check=True,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )

                # Convert to .wav
                subprocess.run(
                    ["afconvert", "-f", "WAVE", "-d", "LEI16", tmp_mp3, wav_path],
                    check=True,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )

                if os.path.exists(tmp_mp3):
                    os.remove(tmp_mp3)

                progress["completed"] += 1
                if progress["completed"] % 25 == 0:
                    pct = (progress["completed"] + progress["skipped"]) / progress["total"] * 100
                    print(f"[{progress['completed']}/{progress['needed']}] ({pct:.1f}%) Generated: {text}")
                return
            except Exception as e:
                if os.path.exists(tmp_mp3):
                    try:
                        os.remove(tmp_mp3)
                    except OSError:
                        pass
                if attempt == 2:
                    print(f"FAILED after 3 attempts: {text} ({e})", file=sys.stderr)
                    progress["failed"] += 1
                await asyncio.sleep(1 + attempt)

async def main():
    targets_file = "scripts/speech_targets.json"
    if not os.path.exists(targets_file):
        print(f"Missing {targets_file}. Run 'node scripts/export_speech_targets.mjs' first.")
        sys.exit(1)

    with open(targets_file, "r", encoding="utf-8") as f:
        targets = json.load(f)

    manifest = {}
    if os.path.exists(MANIFEST_PATH):
        try:
            with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
                manifest = json.load(f)
        except Exception:
            manifest = {}

    slug_map = {}
    items = []
    for t in targets:
        text = t["text"]
        base = text_to_slug(text)
        slug = base
        counter = 2
        while slug in slug_map and slug_map[slug] != text.lower():
            slug = f"{base}_{counter}"
            counter += 1
        slug_map[slug] = text.lower()
        items.append({"text": text, "slug": slug})

        # Build manifest mappings
        manifest[f"en:{text}"] = f"audio/gemini/en/{slug}"
        manifest[f"en:{text.lower()}"] = f"audio/gemini/en/{slug}"

    needed = [it for it in items if not (
        os.path.exists(os.path.join(OUTPUT_DIR, f"{it['slug']}.m4a")) and
        os.path.exists(os.path.join(OUTPUT_DIR, f"{it['slug']}.wav"))
    )]

    print(f"Neural Audio Synthesis: {len(needed)} clips needed ({len(items) - len(needed)} already exist).")
    sem = asyncio.Semaphore(CONCURRENCY)
    progress = {
        "total": len(items),
        "needed": len(needed),
        "completed": 0,
        "skipped": len(items) - len(needed),
        "failed": 0,
    }

    if needed:
        t0 = time.time()
        batch_size = 100
        for i in range(0, len(needed), batch_size):
            batch = needed[i:i + batch_size]
            await asyncio.gather(*(synthesize_item(sem, it, progress) for it in batch))
            # Incremental manifest save
            with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
                json.dump(manifest, f, indent=2, ensure_ascii=False)
                f.write("\n")
            with open(AZURE_MANIFEST_PATH, "w", encoding="utf-8") as f:
                json.dump(manifest, f, indent=2, ensure_ascii=False)
                f.write("\n")

        elapsed = time.time() - t0
        print(f"\n🎉 Done in {elapsed:.1f}s! Completed: {progress['completed']}, Failed: {progress['failed']}")

    # Final manifest save
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        f.write("\n")
    with open(AZURE_MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"Manifests updated at {MANIFEST_PATH} and {AZURE_MANIFEST_PATH}")

if __name__ == "__main__":
    asyncio.run(main())
