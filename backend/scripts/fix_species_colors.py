"""
fix_species_colors.py — One-time script to correct morphological color
descriptions that were found inaccurate during the 2026-03 audit.

Run with:
    cd backend
    python -m scripts.fix_species_colors

Audit source: cross-referenced with iNaturalist community photos and
scientific field guides. Changes are logged to stdout.
"""

import asyncio
import copy
import logging

from sqlalchemy import select
from sqlalchemy.orm.attributes import flag_modified

from app.database import AsyncSessionLocal
from app.models.species import Species

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")

# ── Corrections ────────────────────────────────────────────────────────────────
# Format: { species_id: { "path": ["extra_data", "key", ...], "new_value": ... } }
# Each entry is a targeted patch inside extra_data.

CORRECTIONS = [
    {
        "id": "esp-068",
        "name": "Amanita eliae",
        "reason": "CRITICAL: cap described as 'rosado-salmón' but real specimens are cream/beige. "
                  "Salmon color was causing AI generation to produce orange/salmon mushrooms. "
                  "Source: iNaturalist observations + mycological literature.",
        "patches": {
            "cap.color": "Blanco-crema a beige muy pálido, a veces con leve tinte rosado suave solo en el margen, margen estriado",
            "cap.description": None,  # no change
            "stem.color": "Blanco a blanco-crema, sin rosado prominente",
            # description text update
            "_description": (
                "Amanita del grupo Vaginatae (sin anillo) de sombrero blanco-crema a beige muy pálido "
                "con margen claramente estriado. Crece en bosques mediterráneos del sur y este peninsular. "
                "Especie variable: algunos ejemplares pueden mostrar un leve tinte rosado en el margen, "
                "pero el color predominante es crema/beige, no salmón ni naranja. "
                "Fuente: https://es.wikipedia.org/wiki/Amanita_eliae"
            ),
        },
    },
    {
        "id": "esp-061",
        "name": "Amanita rubescens",
        "reason": "MINOR: verrugas described as 'grises' but they are white (the grey appearance is "
                  "due to dirt/debris, not the actual color). Corrected to 'blancas'.",
        "patches": {
            "cap.color": "Rosa-grisáceo a marrón-pardo con verrugas blancas (no grises)",
            "cap.superficie": "Con flocos blancos-grisáceos (restos del velo)",
        },
    },
]


async def apply_corrections():
    async with AsyncSessionLocal() as db:
        for correction in CORRECTIONS:
            species_id = correction["id"]
            result = await db.execute(select(Species).where(Species.id == species_id))
            species = result.scalar_one_or_none()

            if not species:
                log.warning("Species %s (%s) NOT FOUND in DB — skipping", species_id, correction["name"])
                continue

            extra = copy.deepcopy(species.extra_data or {})
            changed = False

            for path, new_value in correction["patches"].items():
                if new_value is None:
                    continue  # explicit skip

                if path == "_description":
                    # Top-level description field on the Species model
                    if species.description != new_value:
                        log.info("  [%s] description updated", species_id)
                        species.description = new_value
                        changed = True
                    continue

                # Navigate the dotted path inside extra_data
                parts = path.split(".")
                node = extra
                for part in parts[:-1]:
                    if part not in node:
                        node[part] = {}
                    node = node[part]

                leaf = parts[-1]
                old_value = node.get(leaf)
                if old_value != new_value:
                    log.info(
                        "  [%s] extra_data.%s: %r → %r",
                        species_id, path, old_value, new_value
                    )
                    node[leaf] = new_value
                    changed = True

            if changed:
                species.extra_data = extra
                flag_modified(species, "extra_data")
                log.info("✓ %s (%s) updated — reason: %s", species_id, correction["name"], correction["reason"])
            else:
                log.info("○ %s (%s) already up to date", species_id, correction["name"])

        await db.commit()
        log.info("\nDone. All corrections applied.")


if __name__ == "__main__":
    asyncio.run(apply_corrections())
