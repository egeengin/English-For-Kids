#!/usr/bin/env python3
"""
Generate natural neural audio clips for wrong-answer feedback, prompts, and carrier phrases.
Uses en-US-AnaNeural to maintain consistent, warm, expressive child voice.
"""

import asyncio
import json
import os
import re
import shutil
import subprocess
import edge_tts

OUTPUT_DIR = "public/audio/gemini/en"
DOCS_DIR = "docs/audio/gemini/en"
MANIFEST_PATH = "public/audio/manifest.json"
AZURE_MANIFEST_PATH = "public/audio/azure/manifest.json"
DOCS_MANIFEST_PATH = "docs/audio/manifest.json"
DOCS_AZURE_MANIFEST_PATH = "docs/audio/azure/manifest.json"

VOICE = "en-US-AnaNeural"
CONCURRENCY = 10

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(DOCS_DIR, exist_ok=True)

CURRICULUM = {
    "colors_shapes": ["Red", "Blue", "Yellow", "Green", "Purple", "Pink", "Brown", "Black", "Circle", "Square", "Triangle", "Star"],
    "animals": ["Dog", "Cat", "Lion", "Tiger", "Bear", "Fox", "Frog", "Fish", "Bird", "Duck", "Owl", "Monkey"],
    "vehicles": ["Car", "Bus", "Train", "Bike", "Scooter", "Truck", "Boat", "Ship", "Rocket", "Airplane", "Helicopter", "Submarine"],
    "food": ["Apple", "Banana", "Grape", "Pear", "Peach", "Melon", "Lemon", "Bread", "Milk", "Cheese", "Pizza", "Cookie"],
    "school_toys": ["Book", "Pen", "Pencil", "Backpack", "Clock", "Puzzle", "Toy", "Game", "Door", "Chair", "Table", "Bed"],
    "actions": ["Run", "Walk", "Jump", "Swim", "Fly", "Dance", "Sing", "Smile", "Sleep", "Play", "Read", "Draw"],
    "nature": ["Sun", "Moon", "Sky", "Cloud", "Rain", "Snow", "Rainbow", "Tree", "Flower", "Forest", "Sea", "Park"]
}

ALL_CURRICULUM_WORDS = []
for group in CURRICULUM.values():
    ALL_CURRICULUM_WORDS.extend(group)

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

def build_feedback_targets():
    targets = []
    seen_texts = set()

    def add(text):
        t = text.strip()
        if t and t not in seen_texts:
            seen_texts.add(t)
            targets.append(t)

    # 1. Carrier and prompt phrases
    add("Not this one.")
    add("Not this one. I am asking for...")
    add("Not this one. I am asking for")
    add("Not there!")
    add("Try again!")
    add("I am asking:")
    add("I am asking")
    add("I am asking for...")
    add("I am asking for")
    add("Good try!")
    add("Good try! Find")
    add("Good try! Find...")
    add("Good try! Let's listen again.")
    add("Find the...")
    add("Find...")
    add("That is...")
    add("That is not it. Try again!")
    add("Oops, not that one. Try again!")
    add("That word does not fit. I am asking for")
    add("Look at the picture.")
    add("Look at the picture. Find")
    add("Which one is right?")

    # 2. Per-word feedback for all 84 curriculum words
    for w in ALL_CURRICULUM_WORDS:
        add(f"Not this one. I am asking for {w}.")
        add(f"Good try! Find {w}.")
        add(f"That is {w}.")
        add(f"Find {w}.")
        add(f"I am asking for {w}.")

    # 3. Level 1-3 pairwise feedback (already cached on disk)
    for group_name in ["colors_shapes", "animals", "vehicles"]:
        words = CURRICULUM[group_name]
        for item in words:
            for target in words:
                if item != target:
                    add(f"That is {item}. I am asking for {target}.")

    return targets

async def synthesize_item(sem, text, slug, progress):
    m4a_path = os.path.join(OUTPUT_DIR, f"{slug}.m4a")
    tmp_mp3 = os.path.join(OUTPUT_DIR, f"{slug}.tmp.mp3")

    if os.path.exists(m4a_path) and os.path.getsize(m4a_path) > 1000:
        progress["skipped"] += 1
        return

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
                if progress["completed"] % 20 == 0:
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
    targets = build_feedback_targets()
    print(f"Total feedback targets: {len(targets)}")

    # Load existing manifest
    manifest = {}
    if os.path.exists(MANIFEST_PATH):
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            manifest = json.load(f)

    # Assign slugs, avoiding collisions
    used_slugs = set()
    for v in manifest.values():
        if isinstance(v, str):
            slug_base = os.path.basename(v).replace(".m4a", "").replace(".wav", "")
            used_slugs.add(slug_base)

    items_to_generate = []
    for text in targets:
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
