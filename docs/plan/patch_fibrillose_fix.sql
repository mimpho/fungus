-- PATCH: replace mycological term "fibrillose" in cap_description with image-model-friendly language
-- Problem: Imagen 4 does not understand "fibrillose" (means smooth silky cap surface with invisible fibres)
--          and renders it as warts/bumps, like an Amanita universal veil remnant.
-- Fix: use plain visual language — "smooth, silky-matte", "smooth like polished clay/terracotta", etc.
-- Only affects cap surfaces that ARE smooth. Species with real scales (A.augustus, A.mellea, L.cristata, etc.) unchanged.
-- Safe to re-run.

-- ── esp-111 Cortinarius orellanus ────────────────────────────────────────────
UPDATE mushroom_visual_prompts SET
  cap_description = 'Rust-orange to tawny-orange dry pileus, 4–9 cm, convex to campanulate to broadly flat; surface smooth and silky-matte, like polished terracotta or brushed rust-coloured clay — entirely even with no raised features, bumps or ornamentation; colour a uniform burnt-orange or tawny, like dry autumn leaves or iron oxide. As seen in Cortinarius orellanus field photography.',
  extra_morphology_visual = 'The uniform tawny-orange-rust colouration of cap, stipe and gills combined with the smooth silky-matte cap surface and notably wide-spaced rusty gills distinguish this from other Cortinarius species. The autumn dry-leaf orange colour creates effective camouflage against the oak leaf litter.',
  updated_at = NOW()
WHERE species_id = 'esp-111';

-- ── esp-112 Cortinarius rubellus ─────────────────────────────────────────────
UPDATE mushroom_visual_prompts SET
  cap_description = 'Conical to campanulate-umbonate orange-brown to ochre-rust pileus, 3–8 cm; persistently conical even when mature — the cap does not flatten; surface smooth and matte, uniformly reddish-ochre with no scales or bumps. As seen in Cortinarius rubellus field photography.',
  updated_at = NOW()
WHERE species_id = 'esp-112';

-- ── esp-119 Inocybe erubescens ────────────────────────────────────────────────
UPDATE mushroom_visual_prompts SET
  cap_description = 'White to cream conical to campanulate pileus, 3–7 cm; surface smooth and silky, splitting radially toward the margin with age to reveal pale flesh beneath; most distinctive: visible reddening of all surfaces — the cap surfaces flush vivid rose-red where handled or damaged; even light contact produces the pinking. As seen in Inocybe erubescens field photography.',
  updated_at = NOW()
WHERE species_id = 'esp-119';

-- ── esp-158 Agaricus campestris ───────────────────────────────────────────────
UPDATE mushroom_visual_prompts SET
  cap_description = 'White to pale cream convex pileus, 5–12 cm, smooth to silky-satiny; colour white, sometimes becoming faintly brownish-scaled toward the centre in mature specimens; margin inrolled when young. As seen in Agaricus campestris field photography.',
  updated_at = NOW()
WHERE species_id = 'esp-158';
