"""Generate mushroom_visual_prompts for all species without validated DNA Visual.

Calls Gemini 2.5 Flash (text-only, offline) to produce structured visual DNA
for each species, incorporating genus congener context to enable intra-genus
visual differentiation.

Usage:
    cd backend
    GEMINI_API_KEY=<key>  python -m scripts.generate_visual_dna
    GEMINI_API_KEY=<key>  python -m scripts.generate_visual_dna --dry-run
    GEMINI_API_KEY=<key>  python -m scripts.generate_visual_dna --limit 5
    GEMINI_API_KEY=<key>  python -m scripts.generate_visual_dna --family Boletaceae
    GEMINI_API_KEY=<key>  python -m scripts.generate_visual_dna --species-id esp-002

Notes:
  - Reads GEMINI_API_KEY (or VITE_GEMINI_API_KEY as fallback) from env / .env
  - Skips species that already have is_validated=True in mushroom_visual_prompts
  - Upserts with is_validated=False — validated entries are never overwritten
  - Saves a progress log to /tmp/generate_visual_dna_progress.json so interrupted
    runs can be resumed (already-processed species are skipped)
  - Concurrent requests: up to 6 simultaneous Gemini calls
"""
from __future__ import annotations

import argparse
import asyncio
import json
import logging
import os
import re
import sys
import textwrap
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv
from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models.mushroom_visual_prompt import MushroomVisualPrompt
from app.models.species import Species

# ── Logging ───────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────────────────────

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.5-flash:generateContent"
)
CONCURRENCY = 6
PROGRESS_FILE = Path("/tmp/generate_visual_dna_progress.json")


# ── Gemini prompt ─────────────────────────────────────────────────────────────

SYSTEM_CONTEXT = """\
You are a mycological image-generation specialist. Your task is to write structured
visual descriptions used to drive an AI image model (Imagen 4) to generate
photorealistic field photographs of mushrooms for a Spanish mycological app.

## CRITICAL RULES FOR IMAGE-MODEL TEXT FIELDS
These rules apply to: cap_description, stipe_description, hymenium_description,
extra_morphology_visual, composition_notes.

1. POSITIVE LANGUAGE ONLY — describe what IS visible. Never use negation words
   ("no", "without", "absent", "lacks", "never") in these fields.
   ❌ BAD:  "stipe without ring or volva, not swollen"
   ✅ GOOD: "stipe slender and cylindrical, smooth surface"

2. ANCHOR TO FIELD PHOTOGRAPHY — end cap/stipe/hymenium with the phrase
   "as seen in [Scientific name] field photography"

3. MOST DISTINCTIVE FEATURES FIRST — image models weight the start of the
   prompt more than the end. The rarest, most species-specific feature goes first.

4. EXPLICIT SIZE + SHAPE + COLOR + TEXTURE — image models need all four axes.
   Use metric units. Prefer specific color names (ochre, brick-red, cream-white).

5. FOR INTRA-GENUS DIFFERENTIATION — when the species has congeners in the same
   genus, extra_morphology_visual MUST describe what visually sets this species
   apart from the others listed in "Congeners" below.

## FIELDS WHERE NEGATIONS ARE ALLOWED
  extra_morphology_gemini — internal context for the LLM scene builder only,
  never sent to the image model. Chemical reactions, toxicity, taste, smell, etc.
  may be described freely here including negative statements.
"""


def _fmt_cap(cap: dict | None) -> str:
    if not cap:
        return "not available"
    parts = []
    if cap.get("diametro"):
        parts.append(f"diameter {cap['diametro']}")
    if cap.get("forma"):
        parts.append(f"shape: {cap['forma']}")
    if cap.get("color"):
        parts.append(f"color: {cap['color']}")
    if cap.get("superficie"):
        parts.append(f"surface: {cap['superficie']}")
    return "; ".join(parts) if parts else "not available"


def _fmt_stem(stem: dict | None) -> str:
    if not stem:
        return "not available"
    parts = []
    if stem.get("altura"):
        parts.append(f"height {stem['altura']}")
    if stem.get("diametro"):
        parts.append(f"diameter {stem['diametro']}")
    if stem.get("forma"):
        parts.append(f"shape: {stem['forma']}")
    if stem.get("color"):
        parts.append(f"color: {stem['color']}")
    return "; ".join(parts) if parts else "not available"


def _fmt_flesh(flesh: dict | None) -> str:
    if not flesh:
        return "not available"
    parts = []
    if flesh.get("color"):
        parts.append(f"color: {flesh['color']}")
    if flesh.get("textura"):
        parts.append(f"texture: {flesh['textura']}")
    if flesh.get("olor"):
        parts.append(f"odour: {flesh['olor']}")
    if flesh.get("sabor"):
        parts.append(f"taste: {flesh['sabor']}")
    return "; ".join(parts) if parts else "not available"


def _fmt_congeners(genus: str, congeners: list[dict]) -> str:
    """Format a list of congener species for inclusion in the Gemini prompt."""
    if not congeners:
        return f"No other {genus} species in database — describe this species standalone."
    lines = []
    for c in congeners:
        ed = c.get("extra_data") or {}
        cap = ed.get("cap") or {}
        cap_color = cap.get("color", "unknown cap color")
        cap_diam = cap.get("diametro", "")
        lines.append(
            f"  - {c['scientific_name']} ({c['family']}): "
            f"cap {cap_color}{', ' + cap_diam if cap_diam else ''}"
        )
    return "\n".join(lines)


def build_prompt(
    species: Any,
    congeners: list[dict],
) -> str:
    """Build the Gemini prompt for one species."""
    ed = species.extra_data or {}
    cap_str = _fmt_cap(ed.get("cap"))
    stem_str = _fmt_stem(ed.get("stem"))
    flesh_str = _fmt_flesh(ed.get("flesh"))
    forest_str = ", ".join(species.forest_types or []) or "mixed forest"
    genus = species.scientific_name.split()[0]
    congener_block = _fmt_congeners(genus, congeners)

    prompt = textwrap.dedent(f"""
        {SYSTEM_CONTEXT}

        ---

        ## SPECIES TO DESCRIBE

        Scientific name : {species.scientific_name}
        Family          : {species.family}
        Edibility       : {species.edibility}
        Spore print     : {ed.get('sporePrint', 'unknown')}
        Forest types    : {forest_str}
        Fruiting months : {', '.join(str(m) for m in (species.fruiting_months or []))}

        Cap   : {cap_str}
        Stem  : {stem_str}
        Flesh : {flesh_str}

        ## CONGENERS IN SAME GENUS ({genus} spp.)
        {congener_block}

        ---

        ## OUTPUT FORMAT

        Return a single JSON object — nothing else, no markdown fences, no commentary.

        {{
          "cap_description": "...",
          "stipe_description": "...",
          "hymenium_description": "...",
          "extra_morphology_visual": "...",
          "extra_morphology_gemini": "...",
          "preferred_substrate": "...",
          "habitat_context": "...",
          "associated_fauna": "...",
          "composition_notes": null
        }}

        Field guidance:
        - cap_description      : pileus — shape, size, colour, surface texture, margin.
                                  End: "as seen in {species.scientific_name} field photography"
        - stipe_description    : stipe — shape, height, diameter, colour, surface.
                                  End: "as seen in {species.scientific_name} field photography"
        - hymenium_description : what is physically visible under the cap from a side angle —
                                  pores / gills / spines / ridges / honeycomb / coral, with
                                  exact colour, density, and typical width visible.
                                  End: "as seen in {species.scientific_name} field photography"
        - extra_morphology_visual : 1–2 sentences naming the 1–3 key visual features that
                                  distinguish THIS species from the congeners listed above.
                                  Image-model safe (positive only).
        - extra_morphology_gemini : internal/chemical context — bruising reaction, toxicity,
                                  taste, smell, spore print, edibility notes. Negations allowed.
        - preferred_substrate  : specific substrate/litter description for scene.
        - habitat_context      : forest type, season/light atmosphere for scene.
        - associated_fauna     : 1–2 small animals or insects fitting the scene (enhance realism).
        - composition_notes    : per-species framing rule only if non-standard — e.g. if the
                                  species emerges from an egg (Amanita ovoidea) or has a
                                  distinctive posture that must be enforced. For most species: null.
    """).strip()

    return prompt


# ── Gemini API call ────────────────────────────────────────────────────────────

async def call_gemini(
    client: httpx.AsyncClient,
    api_key: str,
    prompt: str,
    species_name: str,
    semaphore: asyncio.Semaphore,
) -> dict | None:
    """Call Gemini 2.5 Flash and return the parsed JSON dict, or None on failure."""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.3,
            "maxOutputTokens": 1500,
        },
    }
    async with semaphore:
        for attempt in range(3):
            try:
                resp = await client.post(
                    GEMINI_URL,
                    params={"key": api_key},
                    json=payload,
                    timeout=60.0,
                )
                if resp.status_code == 429:
                    wait = 15 * (attempt + 1)
                    log.warning("  Rate limit — waiting %ds (attempt %d)", wait, attempt + 1)
                    await asyncio.sleep(wait)
                    continue
                resp.raise_for_status()
                body = resp.json()
                text = body["candidates"][0]["content"]["parts"][0]["text"]
                # Strip any accidental markdown fences
                text = re.sub(r"^```(?:json)?\s*", "", text.strip())
                text = re.sub(r"\s*```$", "", text)
                return json.loads(text)
            except (httpx.HTTPStatusError, httpx.RequestError) as exc:
                log.warning("  HTTP error for %s (attempt %d): %s", species_name, attempt + 1, exc)
                await asyncio.sleep(5 * (attempt + 1))
            except (json.JSONDecodeError, KeyError) as exc:
                log.warning("  Parse error for %s: %s", species_name, exc)
                return None
        log.error("  Failed after 3 attempts: %s", species_name)
        return None


# ── DB helpers ─────────────────────────────────────────────────────────────────

async def load_species_and_prompts() -> tuple[list[Any], set[str]]:
    """Return (all_species, validated_ids) from DB."""
    async with AsyncSessionLocal() as db:
        species_rows = (await db.execute(
            select(Species).order_by(Species.family, Species.scientific_name)
        )).scalars().all()

        vp_rows = (await db.execute(
            select(MushroomVisualPrompt).where(MushroomVisualPrompt.is_validated == True)  # noqa: E712
        )).scalars().all()
        validated_ids = {vp.species_id for vp in vp_rows}

    return list(species_rows), validated_ids


async def upsert_visual_prompt(species_id: str, data: dict) -> None:
    """Upsert a MushroomVisualPrompt row (is_validated=False)."""
    from sqlalchemy.dialects.postgresql import insert as pg_insert  # noqa: PLC0415
    values = {
        "species_id": species_id,
        "cap_description": data.get("cap_description"),
        "stipe_description": data.get("stipe_description"),
        "hymenium_description": data.get("hymenium_description"),
        "extra_morphology_visual": data.get("extra_morphology_visual"),
        "extra_morphology_gemini": data.get("extra_morphology_gemini"),
        "preferred_substrate": data.get("preferred_substrate"),
        "habitat_context": data.get("habitat_context"),
        "associated_fauna": data.get("associated_fauna"),
        "composition_notes": data.get("composition_notes"),
        "is_validated": False,
    }
    stmt = (
        pg_insert(MushroomVisualPrompt)
        .values(**values)
        .on_conflict_do_update(
            index_elements=["species_id"],
            set_={k: v for k, v in values.items() if k != "species_id"},
        )
    )
    async with AsyncSessionLocal() as db:
        await db.execute(stmt)
        await db.commit()


# ── Main ──────────────────────────────────────────────────────────────────────

async def main(args: argparse.Namespace) -> None:
    # ── API key ──────────────────────────────────────────────────────────────
    load_dotenv()
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("VITE_GEMINI_API_KEY", "")
    if not api_key:
        log.error("GEMINI_API_KEY not set. Export it or add to .env")
        sys.exit(1)

    # ── Load from DB ─────────────────────────────────────────────────────────
    log.info("Loading species from DB …")
    all_species, validated_ids = await load_species_and_prompts()
    log.info("  %d species total, %d already validated", len(all_species), len(validated_ids))

    # ── Build genus → species map for congener context ────────────────────────
    genus_map: dict[str, list[dict]] = {}
    for s in all_species:
        genus = s.scientific_name.split()[0]
        genus_map.setdefault(genus, []).append({
            "scientific_name": s.scientific_name,
            "family": s.family,
            "extra_data": s.extra_data,
        })

    # ── Filter candidates ─────────────────────────────────────────────────────
    candidates = [s for s in all_species if s.id not in validated_ids]
    if args.family:
        candidates = [s for s in candidates if s.family.lower() == args.family.lower()]
    if args.species_id:
        candidates = [s for s in candidates if s.id == args.species_id]
    if args.limit:
        candidates = candidates[: args.limit]

    log.info("  %d species to process", len(candidates))
    if not candidates:
        log.info("Nothing to do.")
        return

    # ── Progress resume file ──────────────────────────────────────────────────
    progress: dict[str, str] = {}
    if PROGRESS_FILE.exists() and not args.reset:
        try:
            progress = json.loads(PROGRESS_FILE.read_text())
            already_done = sum(1 for v in progress.values() if v == "ok")
            log.info("  Progress file found — %d previously processed entries", already_done)
        except Exception:
            pass
    candidates = [s for s in candidates if progress.get(s.id) != "ok"]
    log.info("  %d species remaining after resume filter", len(candidates))
    if not candidates:
        log.info("All candidates already processed.")
        return

    if args.dry_run:
        log.info("[DRY-RUN] Would process:")
        for s in candidates:
            genus = s.scientific_name.split()[0]
            n_cong = len(genus_map.get(genus, [])) - 1
            log.info("  %s — %s (%d congeners)", s.id, s.scientific_name, n_cong)
        return

    # ── Process ───────────────────────────────────────────────────────────────
    semaphore = asyncio.Semaphore(CONCURRENCY)
    ok_count = error_count = 0

    async with httpx.AsyncClient() as client:
        tasks = []
        for species in candidates:
            genus = species.scientific_name.split()[0]
            congeners = [
                c for c in genus_map.get(genus, [])
                if c["scientific_name"] != species.scientific_name
            ]
            tasks.append((species, congeners))

        # Process sequentially within batches to allow resume saves
        for i, (species, congeners) in enumerate(tasks, 1):
            log.info(
                "[%d/%d]  %s  (%s, %d congeners)",
                i, len(tasks), species.scientific_name, species.family, len(congeners),
            )
            prompt = build_prompt(species, congeners)
            data = await call_gemini(client, api_key, prompt, species.scientific_name, semaphore)

            if data:
                await upsert_visual_prompt(species.id, data)
                log.info("  ✓ upserted %s", species.id)
                progress[species.id] = "ok"
                ok_count += 1
            else:
                log.warning("  ✗ failed %s — skipping", species.id)
                progress[species.id] = "error"
                error_count += 1

            # Save progress after every species
            PROGRESS_FILE.write_text(json.dumps(progress, indent=2))

    log.info("")
    log.info("Done — %d OK, %d errors", ok_count, error_count)
    if error_count:
        log.info("Failed species saved to %s (re-run to retry)", PROGRESS_FILE)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--dry-run", action="store_true", help="List candidates, do not call Gemini")
    p.add_argument("--limit", type=int, default=0, help="Process at most N species")
    p.add_argument("--family", type=str, default="", help="Restrict to one family name")
    p.add_argument("--species-id", type=str, default="", help="Process a single species by ID")
    p.add_argument(
        "--reset",
        action="store_true",
        help="Ignore progress file and reprocess all candidates",
    )
    return p.parse_args()


if __name__ == "__main__":
    asyncio.run(main(parse_args()))
