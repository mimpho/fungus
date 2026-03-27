-- Seed: mushroom_visual_prompts — 10 pilot species
-- Run this in Supabase SQL Editor after applying migration 009.
-- Uses INSERT ... ON CONFLICT DO UPDATE so it's safe to re-run.

INSERT INTO mushroom_visual_prompts (
  species_id, cap_description, stipe_description, hymenium_description,
  extra_morphology_visual, extra_morphology_gemini,
  preferred_substrate, habitat_context, associated_fauna, is_validated
) VALUES

-- ── esp-001 Boletus edulis (Boletaceae — pores) ──────────────────────────────
('esp-001',
 'Rich brown pileus, 8–20 cm, hemispherical when young becoming convex to flat, smooth matte cuticle with slightly paler buff margins, faint surface cracking toward the centre in mature specimens.',
 'Robust pale buff to cream stipe, 10–20 cm tall, 3–7 cm thick, strongly swollen club-shaped base, covered with fine raised brownish reticulation (net pattern) over the upper two-thirds, solid and very firm.',
 'Pale cream to pale yellow-green sponge-like rim visible at the cap edge from a side-angle view — exactly as seen in a porcini / cep (Boletus edulis) field photograph. The underside is a dense fine tube layer forming that thin spongy band at the margin; it does not show individual gills.',
 'Distinctive raised net-like reticulation (cream-brown mesh texture) on the upper stipe is the key diagnostic external feature — must be rendered prominently.',
 'Flesh firm and white, does not discolour when cut. Aromatic, nut-like scent. Outstanding edibility, the most prized edible bolete in Europe.',
 'Damp mixed pine and spruce needle litter, decaying leaf mould, mossy forest humus.',
 'Temperate mountain conifer and mixed forest understory, golden late-afternoon light filtering through Scots pine canopy, long shadows on the forest floor.',
 'Small pine bark beetle on the cap edge, a fungus gnat hovering nearby.',
 true),

-- ── esp-019 Neoboletus luridiformis (Boletaceae — pores, red) ───────────────
('esp-019',
 'Dark brick-red to dark brownish-red velvety pileus, 6–15 cm, hemispherical to convex, dry surface with a tomentose (finely felty) texture, colour deepening toward centre.',
 'Vivid yellow to yellowish-red stipe, 6–12 cm tall, 2–4 cm thick, cylindrical to slightly club-shaped, densely covered with coarse blood-red reticulation (raised net pattern) over the entire surface.',
 'Blood-red to dark crimson sponge-like rim visible at the cap edge from a side view — as seen in Neoboletus luridiformis field photography. The underside shows a dense crimson tube layer, the spongy pore band at the margin being the only underside detail visible at a standard side angle.',
 'Vivid yellow-red colouration of the stipe with dense dark red reticulation, and the crimson pore surface rim — the two most distinctive visual diagnostics.',
 'Flesh instantly blues intensely when exposed to air. Toxic when raw; rendered edible by prolonged cooking according to some traditions, though disputed.',
 'Damp humus, forest moss and decaying leaf litter under beech and oak.',
 'Mixed temperate deciduous forest, beech-oak understory, dappled summer forest light.',
 'Small slug resting on a nearby fallen leaf, tiny forest beetle.',
 true),

-- ── esp-056 Amanita muscaria (Amanitaceae — gills + volva) ──────────────────
('esp-056',
 'Vivid scarlet to blood-red glossy pileus, 8–20 cm, hemispherical when young then flattening with age, smooth moist cuticle studded with irregular white to pale cream wart-like patches (universal veil remnants), margin finely striate in mature specimens.',
 'Pure white stipe, 8–18 cm tall, 1–3 cm thick, finely scaly below the ring, base markedly bulbous with concentric white volva rings; prominent white membranous skirt-ring (annulus) hanging just below mid-stipe.',
 'Crowded pure white gills visible under the cap, free from the stipe, densely packed and delicate — as seen in Amanita muscaria field photography.',
 'Prominent white membranous skirt-ring on the upper stipe and the bulbous base with white volva rings — defining visual identifiers alongside the vivid red cap.',
 'Contains muscimol and ibotenic acid — toxic, psychoactive. Iconic and universally recognised appearance.',
 'Birch and pine leaf litter, soft mossy humus, damp forest floor.',
 'Boreal and temperate birch-pine mixed forest, bright dappled light through birch canopy, warm golden hour backlight.',
 'Red squirrel in the blurred background, small forest snail on moss.',
 true),

-- ── esp-057 Amanita phalloides (Amanitaceae — gills + volva, deadly) ─────────
('esp-057',
 'Pale yellowish-green to olive-green pileus, 5–12 cm, convex becoming flat, smooth silky cuticle with faint radial fibres, colour grading paler toward the margins.',
 'White to pale greenish-white slender stipe, 7–15 cm tall, 1–2 cm thick, finely fibrous-scaly surface; large membranous white annulus hanging near the upper third; base enclosed in a distinctive white sac-like volva at soil level.',
 'Crowded white to pale cream gills under the cap, free from the stipe, densely packed — as seen in Amanita phalloides field photography.',
 'The large white sac-like volva at the stipe base (often partially buried in soil) and the white membranous annulus are the critical diagnostic visual features — must be clearly rendered.',
 'Most lethal mushroom in Europe — amatoxins cause delayed liver failure with no early symptoms. Responsible for the majority of fatal mushroom poisonings worldwide.',
 'Damp oak and beech leaf litter, dark loamy forest soil with moss.',
 'Temperate mixed oak and beech forest understory, deep shade with cool diffused light.',
 'Small forest snail, a fallen beech leaf resting beside the volva.',
 true),

-- ── esp-045 Cantharellus cibarius (Cantharellaceae — false gills) ────────────
('esp-045',
 'Egg-yolk to golden-yellow wavy pileus, 3–10 cm, convex when young with inrolled margin, becoming irregularly funnel-shaped with wavy lobed margins in adult specimens, smooth dry surface.',
 'Solid golden-yellow stipe, 3–7 cm tall, 0.5–2 cm thick, tapering toward the base, smooth, same colour as the cap, no ring or volva.',
 'Thick blunt forking ridges (not thin blades) running from the cap margin down onto the stipe — same golden-yellow as the cap surface, as seen in Cantharellus cibarius field photography. The ridges are shallow rounded folds that fork repeatedly toward the margin, not sharp separate lamellae.',
 'Blunt forked ridges the same colour as the cap, descending onto the stipe — the defining diagnostic visual feature distinguishing chanterelles from gilled species.',
 'Distinctive apricot-like fruity fragrance. Outstanding edibility, highly prized in European cuisine.',
 'Mossy forest floor, damp green moss carpets, oak and beech leaf litter.',
 'Temperate mixed oak and beech forest, dappled green forest light through leafy summer canopy, warm humid atmosphere.',
 'Small forest beetle, dewdrops on nearby moss fronds.',
 true),

-- ── esp-078 Morchella esculenta (Morchellaceae — honeycomb) ─────────────────
('esp-078',
 'Buff to pale ochre honeycomb cap, 3–8 cm tall, completely covered by a deep irregular network of pits and ridges — the pits are dark brown hollow chambers, the ridges pale cream, the entire surface resembling brain coral or a natural sponge in close-up field photography.',
 'Hollow white to pale cream stipe, 3–8 cm tall, granular-mealy texture, somewhat wider at the base, attached directly to the cap base with no gap.',
 'The entire cap surface IS the fertile layer — a three-dimensional honeycomb of deep irregular recesses lined with the spore-bearing tissue, visible as dramatic deep brown pits separated by pale cream ridges in Morchella esculenta field photography.',
 'Entire cap is a waffle-coral honeycomb texture of deep dark pits and pale ridges — completely unique, unmistakable structure that must be the dominant visual element.',
 'Spring-fruiting ascomycete. Must be cooked before eating — contains thermolabile toxins when raw. Found near woodland edges, disturbed ground and ash trees.',
 'Rich dark loamy soil with dead leaves, disturbed earth with ash tree debris.',
 'Woodland edge and riparian forest, dappled spring light through fresh pale green new foliage, moist air after spring rain.',
 'Small earthworm emerging from soil, a fly attracted to the surface.',
 true),

-- ── esp-023 Russula virescens (Russulaceae — brittle gills) ─────────────────
('esp-023',
 'Pale grayish-green to sea-green pileus, 5–12 cm, convex to slightly depressed, distinctive surface breaking into an irregular mosaic of polygonal greenish patches (areolate cracked cuticle), giving a tiled or puzzle-piece appearance.',
 'Pure white robust stipe, 4–9 cm tall, 2–4 cm thick, cylindrical, solid and firm, smooth surface.',
 'Crowded white to cream gills under the cap, brittle and chalk-like in texture, equal with occasional forking near the stipe, free to slightly attached — as seen in Russula virescens field photography.',
 'The distinctive mosaic-cracked green cap surface breaking into polygonal segments is the unmistakable key diagnostic feature — must be rendered with clarity.',
 'Brittle chalk-like flesh typical of Russulaceae (no fibrous stringy texture when broken). Mild nutty flavour, outstanding edibility.',
 'Oak and beech leaf litter, damp summer soil with moss patches.',
 'Temperate deciduous oak and beech forest, dappled warm summer light, rich green understory.',
 'Small forest snail, a fallen oak leaf resting beside the stipe base.',
 true),

-- ── esp-051 Hydnum repandum (Hydnaceae — spines) ────────────────────────────
('esp-051',
 'Pale cream to buff-ochre irregularly wavy pileus, 5–12 cm, convex with strongly inrolled margin when young, flattening and becoming undulate with age, dry matte surface.',
 'Pale cream solid stipe, 3–8 cm tall, 1–3 cm thick, cylindrical to slightly eccentric, smooth, same colour as cap.',
 'Hundreds of short downward-pointing cream to pale buff spines (teeth) hanging uniformly from the entire cap underside, like fragile icicles or densely packed inverted pins — exactly as seen in Hydnum repandum field photography. The spines are 3–6 mm long, uniformly distributed to the cap edge.',
 'Dense uniform array of short pale cream downward spines covering the entire cap underside — unique toothed hymenium, the defining visual feature of this species.',
 'Mild taste, slightly bitter in old specimens. Excellent and distinctive edible species, one of the safest to identify.',
 'Damp mixed leaf litter under oak and beech, mossy forest humus.',
 'Temperate mixed deciduous forest understory, even diffused forest light, cool humid atmosphere.',
 'Small millipede on nearby leaf litter, moisture droplets on the teeth.',
 true),

-- ── esp-174 Sarcodon imbricatus (Bankeraceae — coarse spines + scales) ───────
('esp-174',
 'Large dark brown to grayish-brown pileus, 6–20 cm, flat to broadly depressed, surface covered by large coarse concentric scales lifting at their tips like overlapping roof tiles or fish scales — giving an imbricate texture.',
 'Solid grayish to dark brownish stipe, 3–8 cm tall, 1–4 cm thick, cylindrical to slightly eccentric, smooth.',
 'Densely packed gray to grayish-brown downward spines on the cap underside, 0.5–1 cm long, coarser and more widely spaced than Hydnum repandum — as seen in Sarcodon imbricatus field photography.',
 'Coarse overlapping dark brown scales on the cap surface combined with the downward gray spines on the underside — twin diagnostic visual features unique to this species.',
 'Bitter taste intensifying with age. Edibility disputed; used dried and powdered as a spice in Scandinavia. Grows in montane conifer forests.',
 'Deep conifer needle litter under spruce and pine, dry acidic soil.',
 'Montane conifer forest, dense spruce and pine stands, cool subdued forest light through dense dark canopy.',
 'Small conifer bark beetle, fallen pine cone beside the stipe base.',
 true),

-- ── esp-172 Hericium erinaceus (Hericiaceae — coral cascade) ────────────────
('esp-172',
 'No conventional cap — the entire fruiting body is a compact globose to pendulous mass, 5–25 cm overall, pure white to cream, attached to wood at a single basal point; the outer surface is entirely composed of long cascading spine-like teeth hanging downward.',
 'No conventional stipe — the fruiting body attaches directly to dead or living hardwood at a single basal attachment point; all visual interest is in the cascading white spine mass.',
 'The spines themselves are the fertile surface — long white cylindrical hanging teeth, 1–5 cm, covering the entire outer surface of the body like a lion''s mane or cascading white waterfall, as seen in Hericium erinaceus field photography.',
 'The entire fruiting body is a white cascading waterfall of long icicle-like spines growing directly from hardwood — no cap, no stipe visible. This dramatic coral-like form is completely unique and must dominate the composition.',
 'Saprotrophic on dead and dying hardwood, particularly beech and oak. Excellent edible species with lobster-like texture when cooked. Prized in East Asian cuisine.',
 'Dead or dying hardwood trunk, bark surface, rotting wood — the substrate is the background behind the dangling white spine mass.',
 'Temperate deciduous forest, dramatic side lighting on a large fallen or standing dead beech trunk, deep forest with strong contrast between light and shadow.',
 'Small fungus beetle on the bark below the fruiting body.',
 true)

ON CONFLICT (species_id) DO UPDATE SET
  cap_description          = EXCLUDED.cap_description,
  stipe_description        = EXCLUDED.stipe_description,
  hymenium_description     = EXCLUDED.hymenium_description,
  extra_morphology_visual  = EXCLUDED.extra_morphology_visual,
  extra_morphology_gemini  = EXCLUDED.extra_morphology_gemini,
  preferred_substrate      = EXCLUDED.preferred_substrate,
  habitat_context          = EXCLUDED.habitat_context,
  associated_fauna         = EXCLUDED.associated_fauna,
  is_validated             = EXCLUDED.is_validated,
  updated_at               = CURRENT_TIMESTAMP;
