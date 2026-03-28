"""Refine mushroom_visual_prompts using Gemini Vision and real catalog photos.

For each species that has:
  - a row in mushroom_visual_prompts (DNA Visual already generated)
  - at least one real photo (URL starting with /assets/, NOT data: URIs which are AI-generated)

This script:
  1. Loads the real photos from disk (public/assets/images/content/species/)
  2. Sends them to Gemini Vision alongside the current DNA Visual description
  3. Gets structured JSON corrections per field
  4. Upserts corrected fields back to mushroom_visual_prompts (is_validated stays false)
  5. Saves progress to /tmp/refine_visual_dna_progress.json (resume-safe)

Usage:
    cd backend
    GEMINI_API_KEY=... python -m scripts.refine_visual_dna
    GEMINI_API_KEY=... python -m scripts.refine_visual_dna --dry-run
    GEMINI_API_KEY=... python -m scripts.refine_visual_dna --species-id esp-111
    GEMINI_API_KEY=... python -m scripts.refine_visual_dna --limit 10
    GEMINI_API_KEY=... python -m scripts.refine_visual_dna --reset
"""

from __future__ import annotations

import argparse
import asyncio
import base64
import json
import os
import re
import sys
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

# ── paths ──────────────────────────────────────────────────────────────────────
SCRIPT_DIR   = Path(__file__).parent
BACKEND_DIR  = SCRIPT_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent
PUBLIC_DIR   = PROJECT_ROOT / "public" / "assets" / "images" / "content" / "species"
PROGRESS_FILE = Path("/tmp/refine_visual_dna_progress.json")

# ── env / config ───────────────────────────────────────────────────────────────
load_dotenv(BACKEND_DIR / ".env")

DATABASE_URL = os.environ.get("DATABASE_URL", "")
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

GEMINI_API_KEY = (
    os.environ.get("GEMINI_API_KEY")
    or os.environ.get("VITE_GEMINI_API_KEY")
    or ""
)

GEMINI_MODEL  = "gemini-2.5-flash"
GEMINI_URL    = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
)

CONCURRENCY   = 3   # keep low — vision calls are heavier than text
MAX_PHOTOS    = 3   # max real photos to send per species (main + foto1 + foto2)

# ── Vision prompt ──────────────────────────────────────────────────────────────
SYSTEM_INSTRUCTION = """You are a senior mycologist and scientific illustrator reviewing DNA Visual descriptions used to generate field photographs of mushrooms for a Spanish mycology catalog.

You will receive one or more real field photographs of a mushroom species, together with its current DNA Visual description (structured text fields used to guide an AI image model).

Your job is to compare what you ACTUALLY SEE in the photographs against each description field, and correct any inaccuracies.

CORRECTION RULES (critical — the description guides an image model):
1. POSITIVE LANGUAGE ONLY — never use "not", "without", "lacking", "absent", "no ring", etc. Describe only what IS present and visible.
2. IMAGE-MODEL-FRIENDLY language — avoid mycological jargon the model won't understand:
   - "fibrillose" → "smooth silky-matte"
   - "campanulate" → "bell-shaped"
   - "pileus" → "cap"
   - "umbo" → "central raised bump"
   - "decurrent" → "running down the stem"
   - "viscid" → "sticky and glossy"
3. COLOUR PRECISION — be specific about hue, saturation, lightness. Use analogies: "deep copper-orange like a terracotta tile", "pure white like fresh chalk". Never just say "brown" or "orange" alone.
4. CONGENER DIFFERENTIATION — if you know of similar species, include ONE sentence explaining the key visual feature that distinguishes this species from its closest lookalikes.
5. END each corrected field with: "As seen in [species scientific name] field photography."
6. If a field is ACCURATE as written, return null for both issue and fix.
7. Keep descriptions concise — 2–4 sentences per field maximum.

OUTPUT: JSON only, no markdown fences, no commentary outside the JSON object."""


def build_vision_prompt(species_name: str, vp: dict) -> str:
    return f"""Species: {species_name}

Current DNA Visual description:
CAP: {vp.get('cap_description') or '(empty)'}
STIPE: {vp.get('stipe_description') or '(empty)'}
HYMENIUM: {vp.get('hymenium_description') or '(empty)'}
ADDITIONAL VISUAL: {vp.get('extra_morphology_visual') or '(empty)'}

You are looking at real field photographs of this species above.

Analyze the photos carefully and respond with corrections in this exact JSON format:
{{
  "cap_ok": true or false,
  "cap_issue": "describe the inaccuracy, or null if accurate",
  "cap_fix": "corrected cap_description (full replacement), or null if no change needed",
  "stipe_ok": true or false,
  "stipe_issue": "...",
  "stipe_fix": "...",
  "hymenium_ok": true or false,
  "hymenium_issue": "...",
  "hymenium_fix": "...",
  "extra_visual_ok": true or false,
  "extra_visual_issue": "...",
  "extra_visual_fix": "..."
}}

Be strict — if you see any colour, texture or proportion that contradicts the description, flag it."""


# ── helpers ────────────────────────────────────────────────────────────────────

def load_real_photo_paths(extra_data: dict | None) -> list[Path]:
    """Extract real (non-AI) photo URLs from species extra_data and resolve to disk paths."""
    if not extra_data:
        return []

    urls: list[str] = []

    # main photo
    photo = extra_data.get("photo")
    if isinstance(photo, dict) and photo.get("url"):
        urls.append(photo["url"])

    # additional photos
    for p in (extra_data.get("photos") or []):
        if isinstance(p, dict) and p.get("url"):
            urls.append(p["url"])

    paths: list[Path] = []
    for url in urls:
        # Skip AI-generated (data URIs)
        if url.startswith("data:"):
            continue
        # Convert /assets/images/content/species/filename.jpg → disk path
        # Strip leading slash and resolve against public dir
        rel = url.lstrip("/")
        # rel is like "assets/images/content/species/esp-xxx-main.jpg"
        filename = Path(rel).name
        disk_path = PUBLIC_DIR / filename
        if disk_path.exists():
            paths.append(disk_path)

    return paths[:MAX_PHOTOS]


def encode_image(path: Path) -> dict:
    """Encode image file as Gemini inline_data part."""
    with open(path, "rb") as f:
        data = base64.b64encode(f.read()).decode()
    suffix = path.suffix.lower().lstrip(".")
    mime = "image/jpeg" if suffix in ("jpg", "jpeg") else f"image/{suffix}"
    return {"inline_data": {"mime_type": mime, "data": data}}


def strip_fences(text: str) -> str:
    text = re.sub(r"^```(?:json)?\s*", "", text.strip())
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


async def call_gemini_vision(
    client: httpx.AsyncClient,
    species_name: str,
    photo_paths: list[Path],
    vp: dict,
    semaphore: asyncio.Semaphore,
) -> dict | None:
    prompt_text = build_vision_prompt(species_name, vp)
    parts: list[dict] = []
    for path in photo_paths:
        parts.append(encode_image(path))
    parts.append({"text": prompt_text})

    payload = {
        "system_instruction": {"parts": [{"text": SYSTEM_INSTRUCTION}]},
        "contents": [{"role": "user", "parts": parts}],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 2048,
            "responseMimeType": "application/json",
        },
    }

    async with semaphore:
        for attempt in range(3):
            try:
                resp = await client.post(GEMINI_URL, json=payload, timeout=120)
                resp.raise_for_status()
                candidates = resp.json().get("candidates", [])
                if not candidates:
                    print(f"  ⚠️  {species_name}: no candidates returned")
                    return None
                raw = candidates[0]["content"]["parts"][0]["text"]
                return json.loads(strip_fences(raw))
            except json.JSONDecodeError as e:
                print(f"  ⚠️  {species_name}: JSON parse error ({e}) — attempt {attempt+1}")
                if attempt == 2:
                    return None
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429:
                    wait = 30 * (attempt + 1)
                    print(f"  ⏳ {species_name}: rate limit, waiting {wait}s...")
                    await asyncio.sleep(wait)
                else:
                    print(f"  ❌ {species_name}: HTTP {e.response.status_code}")
                    return None
            except Exception as e:
                print(f"  ❌ {species_name}: {e}")
                if attempt == 2:
                    return None
                await asyncio.sleep(5)
    return None


# ── database ───────────────────────────────────────────────────────────────────

async def load_species_with_visual(
    session: AsyncSession,
    species_id_filter: str | None = None,
) -> list[dict]:
    """Load species that have DNA Visual + at least one real photo."""
    base = """
        SELECT
            s.id,
            s.scientific_name,
            s.extra_data,
            vp.cap_description,
            vp.stipe_description,
            vp.hymenium_description,
            vp.extra_morphology_visual,
            vp.extra_morphology_gemini,
            vp.is_validated
        FROM species s
        JOIN mushroom_visual_prompts vp ON vp.species_id = s.id
    """
    if species_id_filter:
        result = await session.execute(
            text(base + " WHERE s.id = :sid ORDER BY s.id"),
            {"sid": species_id_filter},
        )
    else:
        result = await session.execute(text(base + " ORDER BY s.id"))
    rows = result.mappings().all()
    return [dict(r) for r in rows]


async def upsert_corrections(
    session: AsyncSession,
    species_id: str,
    corrections: dict,
    dry_run: bool,
) -> None:
    updates: dict[str, str] = {}
    if corrections.get("cap_fix"):
        updates["cap_description"] = corrections["cap_fix"]
    if corrections.get("stipe_fix"):
        updates["stipe_description"] = corrections["stipe_fix"]
    if corrections.get("hymenium_fix"):
        updates["hymenium_description"] = corrections["hymenium_fix"]
    if corrections.get("extra_visual_fix"):
        updates["extra_morphology_visual"] = corrections["extra_visual_fix"]

    if not updates:
        print(f"    ✅ No corrections needed")
        return

    fields_changed = list(updates.keys())
    print(f"    ✏️  Correcting: {', '.join(fields_changed)}")

    if dry_run:
        for field, value in updates.items():
            print(f"      [{field}] → {value[:120]}...")
        return

    set_clauses = ", ".join(f"{k} = :{k}" for k in updates)
    updates["species_id"] = species_id
    updates["updated_at"] = "NOW()"

    stmt = text(f"""
        UPDATE mushroom_visual_prompts
        SET {set_clauses}, updated_at = NOW()
        WHERE species_id = :species_id
    """)
    params = {k: v for k, v in updates.items() if k not in ("species_id", "updated_at")}
    params["species_id"] = species_id
    await session.execute(stmt, params)
    await session.commit()


# ── progress tracking ──────────────────────────────────────────────────────────

def load_progress() -> set[str]:
    if PROGRESS_FILE.exists():
        try:
            return set(json.loads(PROGRESS_FILE.read_text()).get("done", []))
        except Exception:
            pass
    return set()


def save_progress(done: set[str]) -> None:
    PROGRESS_FILE.write_text(json.dumps({"done": list(done)}, indent=2))


# ── main ───────────────────────────────────────────────────────────────────────

async def main(args: argparse.Namespace) -> None:
    if not GEMINI_API_KEY:
        print("❌ GEMINI_API_KEY not set. Export it or add to backend/.env")
        sys.exit(1)

    if not DATABASE_URL:
        print("❌ DATABASE_URL not set.")
        sys.exit(1)

    if args.reset:
        PROGRESS_FILE.unlink(missing_ok=True)
        print("🔄 Progress reset.")

    done = load_progress()
    print(f"📋 Already processed: {len(done)} species")

    engine = create_async_engine(DATABASE_URL, echo=False)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with AsyncSessionLocal() as session:
        rows = await load_species_with_visual(session, args.species_id)

    print(f"🔍 Found {len(rows)} species with DNA Visual in DB")

    # Filter: skip already done, skip validated, apply limit
    to_process: list[dict] = []
    skipped_ai   = 0
    skipped_done = 0
    skipped_nophoto = 0

    for row in rows:
        sid = row["id"]
        if sid in done:
            skipped_done += 1
            continue
        photo_paths = load_real_photo_paths(row.get("extra_data"))
        if not photo_paths:
            skipped_nophoto += 1
            continue
        row["_photo_paths"] = photo_paths
        to_process.append(row)

    print(f"  ⏭  Skipped (already done): {skipped_done}")
    print(f"  ⏭  Skipped (no real photos): {skipped_nophoto}")
    print(f"  🎯 To process: {len(to_process)}")

    if args.limit:
        to_process = to_process[: args.limit]
        print(f"  🔢 Limit applied: processing {len(to_process)}")

    if args.dry_run:
        print("\n🧪 DRY RUN — no DB writes\n")

    semaphore = asyncio.Semaphore(CONCURRENCY)

    async with httpx.AsyncClient() as client:
        async with AsyncSessionLocal() as session:
            for i, row in enumerate(to_process, 1):
                sid   = row["id"]
                name  = row["scientific_name"]
                paths = row["_photo_paths"]
                vp    = {
                    "cap_description":       row.get("cap_description"),
                    "stipe_description":     row.get("stipe_description"),
                    "hymenium_description":  row.get("hymenium_description"),
                    "extra_morphology_visual": row.get("extra_morphology_visual"),
                }

                print(f"\n[{i}/{len(to_process)}] {name} ({sid}) — {len(paths)} real photo(s)")

                corrections = await call_gemini_vision(client, name, paths, vp, semaphore)

                if corrections is None:
                    print(f"  ⚠️  Skipping — no response from Gemini Vision")
                    continue

                # Report what Gemini found
                issues = [
                    f for f in ["cap", "stipe", "hymenium", "extra_visual"]
                    if not corrections.get(f"{f}_ok", True)
                ]
                if issues:
                    print(f"  🔎 Issues found: {', '.join(issues)}")
                    for f in issues:
                        issue_text = corrections.get(f"{f}_issue", "")
                        if issue_text:
                            print(f"    [{f}] {issue_text[:120]}")
                else:
                    print(f"  ✅ All fields look correct")

                await upsert_corrections(session, sid, corrections, args.dry_run)

                if not args.dry_run:
                    done.add(sid)
                    save_progress(done)

                # Small delay between calls
                await asyncio.sleep(1)

    print(f"\n✅ Done. Processed {len(to_process)} species.")
    if args.dry_run:
        print("   (dry run — no DB changes made)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Refine DNA Visual descriptions using Gemini Vision + real photos")
    parser.add_argument("--dry-run",    action="store_true", help="Show proposed corrections without writing to DB")
    parser.add_argument("--species-id", type=str,            help="Process a single species (e.g. esp-111)")
    parser.add_argument("--limit",      type=int,            help="Process at most N species")
    parser.add_argument("--reset",      action="store_true", help="Clear progress file and start from scratch")
    args = parser.parse_args()
    asyncio.run(main(args))
