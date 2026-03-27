"""Seed mushroom_visual_prompts with pilot dataset — 10 species covering all hymenium types.

Usage:
    cd backend
    python -m scripts.seed_visual_prompts

This script upserts structured visual DNA for the pilot species.
All text fields use positive visual language anchored to reference specimens —
no negative prohibitions (they reinforce the concept in image models).

Pilot species coverage:
  Boletaceae      — Boletus edulis, Neoboletus luridiformis   (pores, sponge)
  Amanitaceae     — Amanita muscaria, Amanita phalloides      (gills + volva)
  Cantharellaceae — Cantharellus cibarius                     (blunt false-gills)
  Morchellaceae   — Morchella esculenta                       (honeycomb cap)
  Russulaceae     — Russula virescens                         (brittle white gills)
  Hydnaceae       — Hydnum repandum                           (downward spines)
  Bankeraceae     — Sarcodon imbricatus                       (coarse spines + scales)
  Hericiaceae     — Hericium erinaceus                        (coral cascade)
"""
import asyncio
import logging

from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models.mushroom_visual_prompt import MushroomVisualPrompt
from app.models.species import Species

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")

# ---------------------------------------------------------------------------
# Visual DNA catalogue — keyed by scientific name
# Each entry uses image-model-safe, positive-only language.
# ---------------------------------------------------------------------------
VISUAL_DNA: list[dict] = [
    # ── Boletaceae ──────────────────────────────────────────────────────────
    {
        "scientific_name": "Boletus edulis",
        "cap_description": (
            "Rich brown pileus, 8–20 cm, hemispherical when young becoming convex to flat, "
            "smooth matte cuticle with slightly paler buff margins, faint surface cracking "
            "toward the centre in mature specimens."
        ),
        "stipe_description": (
            "Robust pale buff to cream stipe, 10–20 cm tall, 3–7 cm thick, strongly swollen "
            "club-shaped base, covered with fine raised brownish reticulation (net pattern) "
            "over the upper two-thirds, solid and very firm."
        ),
        "hymenium_description": (
            "Pale cream to pale yellow-green sponge-like rim visible at the cap edge from a "
            "side-angle view — exactly as seen in a porcini / cep (Boletus edulis) field "
            "photograph. The underside is a dense fine tube layer forming that thin spongy "
            "band at the margin; it does not show individual gills."
        ),
        "extra_morphology_visual": (
            "Distinctive raised net-like reticulation (cream-brown mesh texture) on the upper "
            "stipe is the key diagnostic external feature — must be rendered prominently."
        ),
        "extra_morphology_gemini": (
            "Flesh firm and white, does not discolour when cut. Aromatic, nut-like scent. "
            "Outstanding edibility, the most prized edible bolete in Europe."
        ),
        "preferred_substrate": (
            "Damp mixed pine and spruce needle litter, decaying leaf mould, mossy forest humus."
        ),
        "habitat_context": (
            "Temperate mountain conifer and mixed forest understory, golden late-afternoon light "
            "filtering through Scots pine canopy, long shadows on the forest floor."
        ),
        "associated_fauna": (
            "Small pine bark beetle on the cap edge, a fungus gnat hovering nearby."
        ),
        "is_validated": True,
    },
    {
        "scientific_name": "Neoboletus luridiformis",
        "cap_description": (
            "Dark brick-red to dark brownish-red velvety pileus, 6–15 cm, hemispherical to "
            "convex, dry surface with a tomentose (finely felty) texture, colour deepening "
            "toward centre."
        ),
        "stipe_description": (
            "Vivid yellow to yellowish-red stipe, 6–12 cm tall, 2–4 cm thick, cylindrical "
            "to slightly club-shaped, densely covered with coarse blood-red reticulation "
            "(raised net pattern) over the entire surface."
        ),
        "hymenium_description": (
            "Blood-red to dark crimson sponge-like rim visible at the cap edge from a side "
            "view — as seen in Neoboletus luridiformis field photography. The underside shows "
            "a dense crimson tube layer, the spongy pore band at the margin being the only "
            "underside detail visible at a standard side angle."
        ),
        "extra_morphology_visual": (
            "Vivid yellow-red colouration of the stipe with dense dark red reticulation, and "
            "the crimson pore surface rim — the two most distinctive visual diagnostics."
        ),
        "extra_morphology_gemini": (
            "Flesh instantly blues intensely when exposed to air. Toxic when raw; rendered "
            "edible by prolonged cooking according to some traditions, though disputed."
        ),
        "preferred_substrate": (
            "Damp humus, forest moss and decaying leaf litter under beech and oak."
        ),
        "habitat_context": (
            "Mixed temperate deciduous forest, beech-oak understory, dappled summer forest light."
        ),
        "associated_fauna": "Small slug resting on a nearby fallen leaf, tiny forest beetle.",
        "is_validated": True,
    },

    # ── Amanitaceae ─────────────────────────────────────────────────────────
    {
        "scientific_name": "Amanita muscaria",
        "cap_description": (
            "Vivid scarlet to blood-red glossy pileus, 8–20 cm, hemispherical when young "
            "then flattening with age, smooth moist cuticle studded with irregular white to "
            "pale cream wart-like patches (universal veil remnants), margin finely striate "
            "in mature specimens."
        ),
        "stipe_description": (
            "Pure white stipe, 8–18 cm tall, 1–3 cm thick, finely scaly below the ring, "
            "base markedly bulbous with concentric white volva rings; prominent white "
            "membranous skirt-ring (annulus) hanging just below mid-stipe."
        ),
        "hymenium_description": (
            "Crowded pure white gills visible under the cap, free from the stipe, densely "
            "packed and delicate — as seen in Amanita muscaria field photography."
        ),
        "extra_morphology_visual": (
            "Prominent white membranous skirt-ring on the upper stipe and the bulbous base "
            "with white volva rings — defining visual identifiers alongside the vivid red cap."
        ),
        "extra_morphology_gemini": (
            "Contains muscimol and ibotenic acid — toxic, psychoactive. Iconic and universally "
            "recognised appearance."
        ),
        "preferred_substrate": (
            "Birch and pine leaf litter, soft mossy humus, damp forest floor."
        ),
        "habitat_context": (
            "Boreal and temperate birch-pine mixed forest, bright dappled light through birch "
            "canopy, warm golden hour backlight."
        ),
        "associated_fauna": "Red squirrel in the blurred background, small forest snail on moss.",
        "is_validated": True,
    },
    {
        "scientific_name": "Amanita phalloides",
        "cap_description": (
            "Pale yellowish-green to olive-green pileus, 5–12 cm, convex becoming flat, "
            "smooth silky cuticle with faint radial fibres, colour grading paler toward "
            "the margins."
        ),
        "stipe_description": (
            "White to pale greenish-white slender stipe, 7–15 cm tall, 1–2 cm thick, finely "
            "fibrous-scaly surface; large membranous white annulus hanging near the upper "
            "third; base enclosed in a distinctive white sac-like volva at soil level."
        ),
        "hymenium_description": (
            "Crowded white to pale cream gills under the cap, free from the stipe, densely "
            "packed — as seen in Amanita phalloides field photography."
        ),
        "extra_morphology_visual": (
            "The large white sac-like volva at the stipe base (often partially buried in soil) "
            "and the white membranous annulus are the critical diagnostic visual features "
            "— must be clearly rendered."
        ),
        "extra_morphology_gemini": (
            "Most lethal mushroom in Europe — amatoxins cause delayed liver failure with no "
            "early symptoms. Responsible for the majority of fatal mushroom poisonings worldwide."
        ),
        "preferred_substrate": "Damp oak and beech leaf litter, dark loamy forest soil with moss.",
        "habitat_context": (
            "Temperate mixed oak and beech forest understory, deep shade with cool diffused light."
        ),
        "associated_fauna": "Small forest snail, a fallen beech leaf resting beside the volva.",
        "is_validated": True,
    },

    # ── Cantharellaceae ──────────────────────────────────────────────────────
    {
        "scientific_name": "Cantharellus cibarius",
        "cap_description": (
            "Egg-yolk to golden-yellow wavy pileus, 3–10 cm, convex when young with inrolled "
            "margin, becoming irregularly funnel-shaped with wavy lobed margins in adult "
            "specimens, smooth dry surface."
        ),
        "stipe_description": (
            "Solid golden-yellow stipe, 3–7 cm tall, 0.5–2 cm thick, tapering toward the "
            "base, smooth, same colour as the cap, no ring or volva."
        ),
        "hymenium_description": (
            "Thick blunt forking ridges (not thin blades) running from the cap margin down "
            "onto the stipe — same golden-yellow as the cap surface, as seen in Cantharellus "
            "cibarius field photography. The ridges are shallow rounded folds that fork "
            "repeatedly toward the margin, not sharp separate lamellae."
        ),
        "extra_morphology_visual": (
            "Blunt forked ridges the same colour as the cap, descending onto the stipe — "
            "the defining diagnostic visual feature distinguishing chanterelles from gilled "
            "species."
        ),
        "extra_morphology_gemini": (
            "Distinctive apricot-like fruity fragrance. Outstanding edibility, highly prized "
            "in European cuisine."
        ),
        "preferred_substrate": "Mossy forest floor, damp green moss carpets, oak and beech leaf litter.",
        "habitat_context": (
            "Temperate mixed oak and beech forest, dappled green forest light through leafy "
            "summer canopy, warm humid atmosphere."
        ),
        "associated_fauna": "Small forest beetle, dewdrops on nearby moss fronds.",
        "is_validated": True,
    },

    # ── Morchellaceae ────────────────────────────────────────────────────────
    {
        "scientific_name": "Morchella esculenta",
        "cap_description": (
            "Buff to pale ochre honeycomb cap, 3–8 cm tall, completely covered by a deep "
            "irregular network of pits and ridges — the pits are dark brown hollow chambers, "
            "the ridges pale cream, the entire surface resembling brain coral or a natural "
            "sponge in close-up field photography."
        ),
        "stipe_description": (
            "Hollow white to pale cream stipe, 3–8 cm tall, granular-mealy texture, "
            "somewhat wider at the base, attached directly to the cap base with no gap."
        ),
        "hymenium_description": (
            "The entire cap surface IS the fertile layer — a three-dimensional honeycomb of "
            "deep irregular recesses lined with the spore-bearing tissue, visible as dramatic "
            "deep brown pits separated by pale cream ridges in Morchella esculenta field "
            "photography."
        ),
        "extra_morphology_visual": (
            "Entire cap is a waffle-coral honeycomb texture of deep dark pits and pale ridges "
            "— completely unique, unmistakable structure that must be the dominant visual element."
        ),
        "extra_morphology_gemini": (
            "Spring-fruiting ascomycete. Must be cooked before eating — contains thermolabile "
            "toxins when raw. Found near woodland edges, disturbed ground and ash trees."
        ),
        "preferred_substrate": "Rich dark loamy soil with dead leaves, disturbed earth with ash tree debris.",
        "habitat_context": (
            "Woodland edge and riparian forest, dappled spring light through fresh pale green "
            "new foliage, moist air after spring rain."
        ),
        "associated_fauna": "Small earthworm emerging from soil, a fly attracted to the surface.",
        "is_validated": True,
    },

    # ── Russulaceae ──────────────────────────────────────────────────────────
    {
        "scientific_name": "Russula virescens",
        "cap_description": (
            "Pale grayish-green to sea-green pileus, 5–12 cm, convex to slightly depressed, "
            "distinctive surface breaking into an irregular mosaic of polygonal greenish "
            "patches (areolate cracked cuticle), giving a tiled or puzzle-piece appearance."
        ),
        "stipe_description": (
            "Pure white robust stipe, 4–9 cm tall, 2–4 cm thick, cylindrical, solid and "
            "firm, smooth surface."
        ),
        "hymenium_description": (
            "Crowded white to cream gills under the cap, brittle and chalk-like in texture, "
            "equal with occasional forking near the stipe, free to slightly attached — as "
            "seen in Russula virescens field photography."
        ),
        "extra_morphology_visual": (
            "The distinctive mosaic-cracked green cap surface breaking into polygonal segments "
            "is the unmistakable key diagnostic feature — must be rendered with clarity."
        ),
        "extra_morphology_gemini": (
            "Brittle chalk-like flesh typical of Russulaceae (no fibrous stringy texture when "
            "broken). Mild nutty flavour, outstanding edibility."
        ),
        "preferred_substrate": "Oak and beech leaf litter, damp summer soil with moss patches.",
        "habitat_context": (
            "Temperate deciduous oak and beech forest, dappled warm summer light, "
            "rich green understory."
        ),
        "associated_fauna": "Small forest snail, a fallen oak leaf resting beside the stipe base.",
        "is_validated": True,
    },

    # ── Hydnaceae ────────────────────────────────────────────────────────────
    {
        "scientific_name": "Hydnum repandum",
        "cap_description": (
            "Pale cream to buff-ochre irregularly wavy pileus, 5–12 cm, convex with strongly "
            "inrolled margin when young, flattening and becoming undulate with age, dry matte "
            "surface."
        ),
        "stipe_description": (
            "Pale cream solid stipe, 3–8 cm tall, 1–3 cm thick, cylindrical to slightly "
            "eccentric, smooth, same colour as cap."
        ),
        "hymenium_description": (
            "Hundreds of short downward-pointing cream to pale buff spines (teeth) hanging "
            "uniformly from the entire cap underside, like fragile icicles or densely packed "
            "inverted pins — exactly as seen in Hydnum repandum field photography. The spines "
            "are 3–6 mm long, uniformly distributed to the cap edge."
        ),
        "extra_morphology_visual": (
            "Dense uniform array of short pale cream downward spines covering the entire cap "
            "underside — unique toothed hymenium, the defining visual feature of this species."
        ),
        "extra_morphology_gemini": (
            "Mild taste, slightly bitter in old specimens. Excellent and distinctive edible "
            "species, one of the safest to identify."
        ),
        "preferred_substrate": "Damp mixed leaf litter under oak and beech, mossy forest humus.",
        "habitat_context": (
            "Temperate mixed deciduous forest understory, even diffused forest light, "
            "cool humid atmosphere."
        ),
        "associated_fauna": "Small millipede on nearby leaf litter, moisture droplets on the teeth.",
        "is_validated": True,
    },

    # ── Bankeraceae ──────────────────────────────────────────────────────────
    {
        "scientific_name": "Sarcodon imbricatus",
        "cap_description": (
            "Large dark brown to grayish-brown pileus, 6–20 cm, flat to broadly depressed, "
            "surface covered by large coarse concentric scales lifting at their tips like "
            "overlapping roof tiles or fish scales — giving an imbricate texture."
        ),
        "stipe_description": (
            "Solid grayish to dark brownish stipe, 3–8 cm tall, 1–4 cm thick, cylindrical "
            "to slightly eccentric, smooth."
        ),
        "hymenium_description": (
            "Densely packed gray to grayish-brown downward spines on the cap underside, "
            "0.5–1 cm long, coarser and more widely spaced than Hydnum repandum — as seen "
            "in Sarcodon imbricatus field photography."
        ),
        "extra_morphology_visual": (
            "Coarse overlapping dark brown scales on the cap surface combined with the downward "
            "gray spines on the underside — twin diagnostic visual features unique to this "
            "species."
        ),
        "extra_morphology_gemini": (
            "Bitter taste intensifying with age. Edibility disputed; used dried and powdered "
            "as a spice in Scandinavia. Grows in montane conifer forests."
        ),
        "preferred_substrate": "Deep conifer needle litter under spruce and pine, dry acidic soil.",
        "habitat_context": (
            "Montane conifer forest, dense spruce and pine stands, cool subdued forest light "
            "through dense dark canopy."
        ),
        "associated_fauna": "Small conifer bark beetle, fallen pine cone beside the stipe base.",
        "is_validated": True,
    },

    # ── Hericiaceae ──────────────────────────────────────────────────────────
    {
        "scientific_name": "Hericium erinaceus",
        "cap_description": (
            "No conventional cap — the entire fruiting body is a compact globose to "
            "pendulous mass, 5–25 cm overall, pure white to cream, attached to wood at "
            "a single basal point; the outer surface is entirely composed of long cascading "
            "spine-like teeth hanging downward."
        ),
        "stipe_description": (
            "No conventional stipe — the fruiting body attaches directly to dead or living "
            "hardwood at a single basal attachment point; all visual interest is in the "
            "cascading white spine mass."
        ),
        "hymenium_description": (
            "The spines themselves are the fertile surface — long white cylindrical hanging "
            "teeth, 1–5 cm, covering the entire outer surface of the body like a lion's mane "
            "or cascading white waterfall, as seen in Hericium erinaceus field photography."
        ),
        "extra_morphology_visual": (
            "The entire fruiting body is a white cascading waterfall of long icicle-like spines "
            "growing directly from hardwood — no cap, no stipe visible. This dramatic coral-like "
            "form is completely unique and must dominate the composition."
        ),
        "extra_morphology_gemini": (
            "Saprotrophic on dead and dying hardwood, particularly beech and oak. Excellent "
            "edible species with lobster-like texture when cooked. Prized in East Asian cuisine."
        ),
        "preferred_substrate": (
            "Dead or dying hardwood trunk, bark surface, rotting wood — the substrate is the "
            "background behind the dangling white spine mass."
        ),
        "habitat_context": (
            "Temperate deciduous forest, dramatic side lighting on a large fallen or standing "
            "dead beech trunk, deep forest with strong contrast between light and shadow."
        ),
        "associated_fauna": "Small fungus beetle on the bark below the fruiting body.",
        "is_validated": True,
    },
]


async def _seed() -> None:
    async with AsyncSessionLocal() as db:
        seeded = 0
        skipped = 0
        for entry in VISUAL_DNA:
            name = entry["scientific_name"]
            # Find species by scientific name (case-sensitive match)
            result = await db.execute(
                select(Species).where(Species.scientific_name == name)
            )
            species = result.scalar_one_or_none()
            if species is None:
                log.warning("⚠️  Species not found in DB: %s — skipping", name)
                skipped += 1
                continue

            # Upsert
            vp_result = await db.execute(
                select(MushroomVisualPrompt).where(
                    MushroomVisualPrompt.species_id == species.id
                )
            )
            row = vp_result.scalar_one_or_none()
            if row is None:
                row = MushroomVisualPrompt(species_id=species.id)
                db.add(row)

            row.cap_description = entry.get("cap_description")
            row.stipe_description = entry.get("stipe_description")
            row.hymenium_description = entry.get("hymenium_description")
            row.extra_morphology_visual = entry.get("extra_morphology_visual")
            row.extra_morphology_gemini = entry.get("extra_morphology_gemini")
            row.preferred_substrate = entry.get("preferred_substrate")
            row.habitat_context = entry.get("habitat_context")
            row.associated_fauna = entry.get("associated_fauna")
            row.is_validated = entry.get("is_validated", False)

            seeded += 1
            log.info("  ✓  %s (%s)", name, species.id)

        await db.commit()
        log.info(
            "\nDone. %d species seeded, %d skipped (not found in DB).", seeded, skipped
        )


if __name__ == "__main__":
    asyncio.run(_seed())
