#!/usr/bin/env python3
"""Generate MP3 assets for Eva English (edge-tts)."""
import asyncio
import re
import sys
from pathlib import Path

sys.path.insert(0, "/tmp/tts-venv/lib/python3.13/site-packages")
import edge_tts

OUT = Path("/workspace/eva-english/public/audio")
OUT.mkdir(parents=True, exist_ok=True)
VOICE = "en-US-AnaNeural"

SOUNDS = {
    "sss": ("sss", "-25%"),
    "a": ("ah", "-20%"),
    "ttt": ("t", "-15%"),
    "i": ("ih", "-20%"),
    "ppp": ("p", "-15%"),
    "nnn": ("nnn", "-25%"),
    "kkk": ("k", "-15%"),
    "e": ("eh", "-20%"),
    "hhh": ("hhh", "-25%"),
    "rrr": ("rrr", "-25%"),
    "mmm": ("mmm", "-25%"),
    "ddd": ("d", "-15%"),
    "ggg": ("g", "-15%"),
    "o": ("ah", "-20%"),
    "u": ("uh", "-20%"),
    "lll": ("lll", "-25%"),
    "fff": ("fff", "-25%"),
    "bbb": ("b", "-15%"),
    "jjj": ("juh", "-15%"),
    "vvv": ("vvv", "-25%"),
    "www": ("wuh", "-15%"),
    "ks": ("ks", "-15%"),
    "yyy": ("yuh", "-15%"),
    "zzz": ("zzz", "-25%"),
    "kw": ("kwuh", "-15%"),
}

NAMES = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

KEYWORDS = [
    "sun", "apple", "tiger", "igloo", "pen", "nest", "cat", "kite", "egg",
    "hat", "rabbit", "moon", "dog", "goat", "octopus", "umbrella", "leaf",
    "fish", "ball", "jam", "van", "web", "box", "yellow", "zoo", "queen",
]

CVC = [
    "sat", "pin", "tip", "nap", "sit", "pan", "tin", "tap", "pat", "pit",
    "sip", "tan", "cat", "hen", "red", "mad", "him", "net", "cap", "map",
    "hid", "ten", "men", "rid", "kit", "can", "dog", "bus", "fog", "log",
    "big", "cup", "bug", "fun", "sun", "bud", "mug", "lot", "got", "bag",
]

HEART = ["I", "a", "the", "to", "my", "is", "you"]

def slug(s: str) -> str:
    return re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()

async def save(path: Path, text: str, rate: str = "+0%") -> None:
    if path.exists() and path.stat().st_size > 500:
        print(f"SKIP {path.name}")
        return
    communicate = edge_tts.Communicate(text, VOICE, rate=rate)
    await communicate.save(str(path))
    print(f"OK {path.name} ({text!r})")

async def main() -> None:
    jobs = []
    for key, (text, rate) in SOUNDS.items():
        jobs.append((OUT / f"sound-{key}.mp3", text, rate))
    for n in NAMES:
        jobs.append((OUT / f"name-{n}.mp3", n, "-10%"))
    seen = set()
    for w in KEYWORDS + CVC + HEART:
        p = OUT / f"word-{slug(w)}.mp3"
        if p.name in seen:
            continue
        seen.add(p.name)
        jobs.append((p, w, "-5%"))

    sem = asyncio.Semaphore(4)

    async def one(path, text, rate):
        async with sem:
            for attempt in range(3):
                try:
                    await save(path, text, rate)
                    return
                except Exception as e:
                    print(f"RETRY {path.name}: {e}")
                    await asyncio.sleep(1 + attempt)
            raise RuntimeError(f"failed {path}")

    await asyncio.gather(*(one(*j) for j in jobs))
    files = list(OUT.glob("*.mp3"))
    print(f"\nTotal MP3 files: {len(files)}")

if __name__ == "__main__":
    asyncio.run(main())
