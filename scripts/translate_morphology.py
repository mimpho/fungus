"""
translate_morphology.py
=======================
Fetches all species from the production API, finds those with morphology data
(cap / stem / flesh / sporePrint in extra_data), translates them to CA and EN
using the Anthropic API, and writes a SQL migration file.

Usage:
    ANTHROPIC_API_KEY=sk-... python scripts/translate_morphology.py

Output:
    migrations/038_morphology_i18n.sql
"""

import asyncio
import json
import os
import sys
from pathlib import Path

import httpx
import anthropic

# ── Config ────────────────────────────────────────────────────────────────────

API_BASE   = "https://fungus-api.onrender.com/api/v1"
PAGE_SIZE  = 500
OUT_FILE   = Path(__file__).parent.parent / "migrations" / "038_morphology_i18n.sql"

MORPH_KEYS = ("cap", "stem", "flesh", "sporePrint")

# Fields to translate inside each morph object
CAP_FIELDS   = ("forma", "color", "diametro", "superficie")
STEM_FIELDS  = ("forma", "color", "altura", "diametro")
FLESH_FIELDS = ("color", "textura", "olor", "sabor")


# ── Fetch species list ────────────────────────────────────────────────────────

async def fetch_all_species_ids() -> list[str]:
    """Return all species IDs from the catalog endpoint."""
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.get(f"{API_BASE}/species", params={"limit": PAGE_SIZE, "lang": "es"})
        resp.raise_for_status()
        data = resp.json()
    return [s["id"] for s in data]


async def fetch_species_detail(client: httpx.AsyncClient, species_id: str) -> dict:
    resp = await client.get(f"{API_BASE}/species/{species_id}", params={"lang": "es"})
    resp.raise_for_status()
    return resp.json()


async def fetch_all_details(ids: list[str]) -> list[dict]:
    """Fetch detail for every species id (max 10 concurrent)."""
    sem = asyncio.Semaphore(10)
    results = []

    async def _fetch(client, sid):
        async with sem:
            try:
                detail = await fetch_species_detail(client, sid)
                return detail
            except Exception as e:
                print(f"  ⚠ Error fetching {sid}: {e}", file=sys.stderr)
                return None

    async with httpx.AsyncClient(timeout=60) as client:
        tasks = [_fetch(client, sid) for sid in ids]
        raw = await asyncio.gather(*tasks)

    return [r for r in raw if r is not None]


# ── Filter species with morphology ────────────────────────────────────────────

def has_morphology(detail: dict) -> bool:
    ex = detail.get("extra_data") or {}
    return any(ex.get(k) for k in MORPH_KEYS)


# ── Translate via Anthropic ───────────────────────────────────────────────────

SYSTEM_PROMPT = """\
You are a professional mycological translator. Your task is to translate mushroom
morphology descriptions from Spanish to Catalan (ca) and English (en).

Rules:
- Keep technical mycological terminology accurate.
- Catalan translations must be natural Catalan, not calques from Spanish.
- English translations should use standard mycological vocabulary.
- Preserve any measurement ranges (e.g. "8-30 cm") exactly as-is.
- Respond ONLY with a valid JSON object, no markdown, no explanation.
"""

def build_translation_prompt(species_name: str, morph: dict) -> str:
    return f"""\
Species: {species_name}

Translate these morphology fields to Catalan (ca) and English (en).
Return a JSON object with the same structure but with _ca and _en suffixed keys.

Input JSON:
{json.dumps(morph, ensure_ascii=False, indent=2)}

Expected output format example (adapt keys to what is actually present):
{{
  "cap_ca": {{ "forma": "...", "color": "...", "diametro": "...", "superficie": "..." }},
  "cap_en": {{ "forma": "...", "color": "...", "diametro": "...", "superficie": "..." }},
  "stem_ca": {{ ... }},
  "stem_en": {{ ... }},
  "flesh_ca": {{ ... }},
  "flesh_en": {{ ... }},
  "sporePrint_ca": "...",
  "sporePrint_en": "..."
}}

Only include keys for fields that are present in the input. Return ONLY the JSON object.
"""


def translate_morphology(client: anthropic.Anthropic, species_name: str, morph: dict) -> dict | None:
    """Call Anthropic API and return translated morphology dict."""
    prompt = build_translation_prompt(species_name, morph)
    try:
        message = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}]
        )
        raw = message.content[0].text.strip()
        # Strip potential markdown fences
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(raw)
    except Exception as e:
        print(f"  ⚠ Translation error for {species_name}: {e}", file=sys.stderr)
        return None


# ── SQL generation ────────────────────────────────────────────────────────────

def build_sql_update(species_id: str, translated: dict) -> str:
    """Generate a single UPDATE statement that merges translated keys into extra_data."""
    # Build a JSONB fragment with only the new translated keys
    updates = {}
    for key, val in translated.items():
        updates[key] = val

    json_fragment = json.dumps(updates, ensure_ascii=False)
    # Escape single quotes for SQL
    json_fragment_escaped = json_fragment.replace("'", "''")
    return (
        f"UPDATE species\n"
        f"SET extra_data = extra_data || '{json_fragment_escaped}'::jsonb\n"
        f"WHERE id = '{species_id}';\n"
    )


# ── Main ──────────────────────────────────────────────────────────────────────

async def main():
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY not set.", file=sys.stderr)
        sys.exit(1)

    anthropic_client = anthropic.Anthropic(api_key=api_key)

    print("📡 Fetching species list from production API...")
    ids = await fetch_all_species_ids()
    print(f"   Found {len(ids)} species")

    print("📡 Fetching species details (this may take a while)...")
    details = await fetch_all_details(ids)
    print(f"   Got {len(details)} details")

    # Filter species with morphology
    with_morph = [d for d in details if has_morphology(d)]
    print(f"🍄 Species with morphology data: {len(with_morph)}")

    if not with_morph:
        print("No species with morphology found. Nothing to translate.")
        return

    # Translate each species
    sql_blocks = []
    for i, detail in enumerate(with_morph, 1):
        sid   = detail["id"]
        name  = detail.get("scientific_name", sid)
        ex    = detail.get("extra_data") or {}

        # Build the morph dict to send for translation
        morph = {}
        for k in MORPH_KEYS:
            if ex.get(k):
                morph[k] = ex[k]

        print(f"  [{i}/{len(with_morph)}] Translating {name}...")
        translated = translate_morphology(anthropic_client, name, morph)

        if not translated:
            print(f"    ⚠ Skipped {name} (translation failed)")
            continue

        sql_blocks.append(build_sql_update(sid, translated))
        print(f"    ✓ Done")

    # Write migration file
    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    header = f"""\
-- Migration 038: i18n morphology (cap / stem / flesh / sporePrint) → CA + EN
-- Generated automatically by scripts/translate_morphology.py
-- Apply in Supabase SQL Editor
-- Species translated: {len(sql_blocks)} / {len(with_morph)}

BEGIN;

"""
    footer = "\nCOMMIT;\n"

    OUT_FILE.write_text(header + "\n".join(sql_blocks) + footer, encoding="utf-8")
    print(f"\n✅ Migration written to {OUT_FILE}")
    print(f"   {len(sql_blocks)} UPDATE statements")


if __name__ == "__main__":
    asyncio.run(main())
