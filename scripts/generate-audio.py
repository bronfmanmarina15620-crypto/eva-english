#!/usr/bin/env python3
"""Generate MP3 assets for Eva English (edge-tts).

Letter-name files (name-A.mp3 … name-Z.mp3) use explicit English letter-name
pronunciations (ay, bee, see, …) so every letter is as clear as “aitch”.
Bare single-letter glyphs are uneven in neural TTS.

Usage:
  python scripts/generate-audio.py              # skip existing non-tiny files
  python scripts/generate-audio.py --force-names  # overwrite name-*.mp3 only
  python scripts/generate-audio.py --force        # overwrite every MP3
  python scripts/generate-audio.py --voice en-US-AriaNeural --force-names
"""
from __future__ import annotations

import argparse
import asyncio
import re
import sys
from pathlib import Path

try:
    import edge_tts
except ImportError:
    sys.path.insert(0, "/tmp/tts-venv/lib/python3.13/site-packages")
    import edge_tts

OUT = Path(__file__).resolve().parent.parent / "public" / "audio"
OUT.mkdir(parents=True, exist_ok=True)

DEFAULT_VOICE = "en-US-JennyNeural"
DEFAULT_NAME_RATE = "-12%"

# Explicit spoken letter names — not the bare glyph ("A", "B", …).
LETTER_NAMES: dict[str, str] = {
    "A": "ay",
    "B": "bee",
    "C": "see",
    "D": "dee",
    "E": "ee",
    "F": "eff",
    "G": "jee",
    "H": "aitch",
    "I": "eye",
    "J": "jay",
    "K": "kay",
    "L": "ell",
    "M": "em",
    "N": "en",
    "O": "oh",
    "P": "pee",
    "Q": "cue",
    "R": "ar",
    "S": "ess",
    "T": "tee",
    "U": "you",
    "V": "vee",
    "W": "double you",
    "X": "ex",
    "Y": "why",
    "Z": "zee",
}

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


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Generate Eva English MP3 assets")
    p.add_argument(
        "--force",
        action="store_true",
        help="Overwrite every existing MP3",
    )
    p.add_argument(
        "--force-names",
        action="store_true",
        help="Overwrite name-*.mp3 even if they already exist",
    )
    p.add_argument(
        "--voice",
        default=DEFAULT_VOICE,
        help=f"edge-tts voice (default: {DEFAULT_VOICE})",
    )
    p.add_argument(
        "--name-rate",
        default=DEFAULT_NAME_RATE,
        help=f"Speaking rate for letter names (default: {DEFAULT_NAME_RATE})",
    )
    return p.parse_args()


def should_skip(path: Path, force_all: bool, force_names: bool) -> bool:
    if force_all:
        return False
    if force_names and path.name.startswith("name-"):
        return False
    return path.exists() and path.stat().st_size > 500


async def save(
    path: Path,
    text: str,
    voice: str,
    rate: str,
    force_all: bool,
    force_names: bool,
) -> None:
    if should_skip(path, force_all, force_names):
        print(f"SKIP {path.name}")
        return
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    await communicate.save(str(path))
    print(f"OK {path.name} ({text!r}) voice={voice} rate={rate}")


async def main() -> None:
    args = parse_args()
    jobs: list[tuple[Path, str, str]] = []
    for key, (text, rate) in SOUNDS.items():
        jobs.append((OUT / f"sound-{key}.mp3", text, rate))
    for letter, spoken in LETTER_NAMES.items():
        jobs.append((OUT / f"name-{letter}.mp3", spoken, args.name_rate))
    seen: set[str] = set()
    for w in KEYWORDS + CVC + HEART:
        p = OUT / f"word-{slug(w)}.mp3"
        if p.name in seen:
            continue
        seen.add(p.name)
        jobs.append((p, w, "-5%"))

    sem = asyncio.Semaphore(4)

    async def one(path: Path, text: str, rate: str) -> None:
        async with sem:
            for attempt in range(3):
                try:
                    await save(path, text, args.voice, rate, args.force, args.force_names)
                    return
                except Exception as e:
                    print(f"RETRY {path.name}: {e}")
                    await asyncio.sleep(1 + attempt)
            raise RuntimeError(f"failed {path}")

    print(f"Voice: {args.voice}  force={args.force}  force_names={args.force_names}")
    await asyncio.gather(*(one(*j) for j in jobs))
    files = list(OUT.glob("*.mp3"))
    names = sorted(OUT.glob("name-*.mp3"))
    print(f"\nTotal MP3 files: {len(files)}")
    print(f"Letter-name MP3s: {len(names)}")
    for n in names:
        print(f"  {n.name:12} {n.stat().st_size:6} bytes")


if __name__ == "__main__":
    asyncio.run(main())
