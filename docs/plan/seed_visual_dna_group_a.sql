-- Seed: mushroom_visual_prompts — Group A (56 species)
-- Curated by Claude. is_validated=false — validate visually in the generator before promoting.
-- Covers: excelente + mortal + precaución alto riesgo + icónicas populares.
-- Run in Supabase SQL Editor. Safe to re-run (ON CONFLICT DO UPDATE).
-- NOTE: includes composition_notes column (added in v5.5).

INSERT INTO mushroom_visual_prompts (
  species_id, cap_description, stipe_description, hymenium_description,
  extra_morphology_visual, extra_morphology_gemini,
  preferred_substrate, habitat_context, associated_fauna,
  composition_notes, is_validated
) VALUES

-- ═══════════════════════════════════════════════════════════════════════════
-- AMANITACEAE (9 species — excelente, mortal, precaución)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-055 Amanita caesarea (excelente) ────────────────────────────────────
('esp-055',
 'Deep vivid orange to vermilion-orange pileus, 8–20 cm, hemispherical when young expanding to broadly convex then almost flat with maturity; surface perfectly smooth and shining, moist, entirely free of warts or patches; margin slightly striate in older specimens. As seen in Amanita caesarea field photography.',
 'Bright egg-yellow stipe, 8–15 cm tall, 2–4 cm thick, cylindrical, smooth surface; prominent egg-yellow membranous pendant ring (annulus) hanging like a skirt just below mid-stipe; basal volva a conspicuous large white sac-like sheath partially buried in the litter, clearly distinct from the yellow stipe above. As seen in Amanita caesarea field photography.',
 'Crowded, free, bright egg-yellow gills visible under the cap — the saturated yellow colour is the single most diagnostic character and completely unlike any other Amanita species; as seen in Amanita caesarea field photography.',
 'The pure egg-yellow gills (not white), yellow pendant ring and yellow stipe against the vivid orange cap — this yellow-on-orange colour combination is unique among all Amanita species and the defining visual identity of caesarea. The large white sac-like volva at the stipe base must also be rendered distinctly.',
 'Excellent edible, prized since Roman antiquity as the "food of the gods". No colour reactions. Distinguished from A.muscaria by yellow (not white) gills, yellow stipe and ring, and smooth cap without warts. Young stages emerge from a white egg-like structure buried in the soil.',
 'Rich deciduous leaf litter, oak and chestnut mast layer, warm calcareous loam soil.',
 'Warm dry deciduous oak and chestnut forest on south-facing slopes, late summer golden afternoon light, Mediterranean-influenced woodland.',
 'A small lizard in the background, one or two forest ants at the stipe base.',
 'Ground-level camera showing the vivid orange cap in the upper-centre and the large white volva sac at the stipe base in the lower frame — both features must be simultaneously visible. Single dominant specimen.',
 false),

-- ── esp-058 Amanita verna (mortal) ──────────────────────────────────────────
('esp-058',
 'Pure glossy white pileus, 5–10 cm, convex to broadly flattened with age; surface smooth, immaculate and brilliant white without blemish or warts; margin clean and not striate. As seen in Amanita verna field photography.',
 'Pure white stipe, 8–15 cm tall, 1–2 cm thick, cylindrical with a small bulb enclosed in a conspicuous large white sac-like volva at the base; prominent white membranous pendant ring hanging just above mid-stipe; surface smooth to finely fibrous. As seen in Amanita verna field photography.',
 'Dense crowded pure white free gills under the cap, as seen in Amanita verna field photography.',
 'The deadly all-white appearance — cap, stipe, gills and ring all pure uniform white — with the rounded (not conical) cap and large white sac volva at the base is the defining visual signature. Distinguished from A.virosa by a more rounded (not persistently conical) cap and smoother (not shaggy) stipe surface.',
 'Deadly toxic — amatoxins (alpha-amanitin) cause fatal liver and kidney failure with no visible intoxication signs for 24–36 hours after ingestion. Spring fruiting (April–May). Often confused with edible Volvariella species or young Agaricus. No colour change in flesh.',
 'Rich woodland soil, decaying leaf litter, calcareous loam under deciduous trees.',
 'Mixed deciduous forest edge, oak-holm oak woodland, warm spring morning light in a clearing.',
 'Single small white butterfly resting on a leaf nearby.',
 'Ground-level camera must show the large white sac-like volva at the stipe base clearly — partially emerging from leaf litter; the volva must be visible in the lower third of frame. Single specimen.',
 false),

-- ── esp-059 Amanita virosa (mortal) ─────────────────────────────────────────
('esp-059',
 'Pure gleaming white pileus, 5–12 cm, distinctly conical to campanulate — a shape that persists even in fully mature specimens, never flattening completely; surface smooth, satiny-white, sometimes with a slightly fibrous sheen near the centre. As seen in Amanita virosa field photography.',
 'Pure white stipe, 10–20 cm tall, 1–2 cm thick, notably elongated; surface densely shaggy-fibrillose (woolly or cottony texture) along its entire length; white pendant ring appears ragged and torn at the edges; large white sac-like volva at the basal bulb. As seen in Amanita virosa field photography.',
 'Dense crowded pure white free gills under the cap, as seen in Amanita virosa field photography.',
 'The persistently conical (not flattening) white cap combined with the unusually long, shaggy-fibrillose white stipe are the two features distinguishing this from A.verna (rounded cap, smoother stipe). The elongated form and woolly stipe surface are the primary visual differentiators within the white deadly Amanitas.',
 'Among the most deadly fungi known — very high amatoxin levels; no antidote; causes fatal liver failure. Found in summer and autumn in conifer and beech forest. Distinguished from A.verna by conical cap and shaggy stipe surface.',
 'Needle litter, decomposing conifer and beech leaf mould, acidic humus under spruce and pine.',
 'Dense beech and spruce forest, deep shade, cool and damp summer conditions, late afternoon light through dense canopy.',
 'Small forest snail on the leaf litter nearby.',
 'Ground-level camera showing the elongated stipe and the white sac-like volva at base visible in lower frame; the conical white cap in the upper-centre of frame. Single dominant specimen.',
 false),

-- ── esp-062 Amanita ovoidea (precaución) ────────────────────────────────────
('esp-062',
 'Very large white to cream pileus, 8–20 cm, broadly convex to nearly flat at maturity; surface smooth, dry, satiny; the cap margin bears very large, thick, irregular ragged veil remnants hanging conspicuously 1–3 cm downward — like torn lace curtains or rough-edged fabric fringe running around the entire cap perimeter. These hanging fragments are prominent, thick and easily visible. As seen in Amanita ovoidea field photography.',
 'Stout white stipe, 10–20 cm tall, 2–4 cm thick, densely covered with cottony-floccose white scales and granules over its full length; a broad white membranous ring on the upper portion; large thick-walled lobulate white sac-like volva at the base. As seen in Amanita ovoidea field photography.',
 'Dense crowded white free gills under the cap, as seen in Amanita ovoidea field photography.',
 'The dramatically appendiculate cap margin — thick, irregular, ragged lace-like white curtain fragments hanging from the entire cap edge — is the single most visually striking and unique character of this species. No other common Amanita has such large and prominent hanging veil fragments at the cap margin at this scale.',
 'Edibility disputed — contains toxins; causes poisoning. The largest white Amanita in European forests. Found in warm Mediterranean holm oak and pine forest. Large white sac volva at base.',
 'Dry calcareous soil, sparse dry leaf litter under holm oak and Aleppo pine in Mediterranean regions.',
 'Mediterranean holm oak and Aleppo pine forest, dry summer-autumn conditions, strong warm afternoon light casting sharp shadows.',
 'A small beetle on the leaf litter, a lizard in the background.',
 'Ground-level camera angled slightly upward to simultaneously show the large ragged hanging veil fragments at the cap margin (must be prominent in frame) and the thick volva at the stipe base. Single dominant specimen.',
 false),

-- ── esp-063 Amanita spissa (precaución) ─────────────────────────────────────
('esp-063',
 'Medium to large grey-brown to umber pileus, 6–14 cm, convex to broadly flat; surface covered with irregular greyish-brown wart-like patches (universal veil remnants) distributed across the cap; margin not appendiculate. As seen in Amanita spissa field photography.',
 'White to grey-white stipe, 8–15 cm tall, 1.5–3 cm thick, cylindrical with a markedly swollen rounded bulbous base; surface above the bulb with grey-white fibrous scales; white pendant ring just below mid-stipe; volva reduced to concentric grey-white girdles encircling the bulb (not a free sac). As seen in Amanita spissa field photography.',
 'Dense crowded white free gills under the cap, as seen in Amanita spissa field photography.',
 'The combination of grey-brown cap with scattered greyish wart patches and the distinctly swollen rounded bulbous base with concentric grey girdles (not a free sac volva) are the diagnostic visual features. Distinguished from A.excelsa by having a more strongly rounded-bulbous (not napiform) base and slightly browner (less grey) cap.',
 'Smell distinctly of radish. Generally considered non-toxic but best avoided — some confusion with A.pantherina (toxic). Flesh white, unchanging.',
 'Rich humus under pine, beech and spruce, mixed forest soil.',
 'Mixed temperate montane forest, beech-pine understory, summer-autumn damp conditions, soft diffuse forest light.',
 'Small forest ant colony trail on the leaf litter.',
 NULL,
 false),

-- ── esp-065 Amanita citrina (precaución) ────────────────────────────────────
('esp-065',
 'Medium pileus, 5–12 cm, convex to broadly flat; colour lemon-yellow to pale greenish-yellow or whitish with a yellow tinge, decorated with irregular flat white to cream patches (universal veil remnants) that contrast with the yellowish background; surface dry, smooth between patches. As seen in Amanita citrina field photography.',
 'White to pale yellowish stipe, 8–14 cm tall, 1.5–2.5 cm thick, cylindrical with a distinctly marginate bulbous base — a sharply edged shelf-like rim around the bulb; prominent white to yellowish pendant ring hanging near mid-stipe; surface smooth. As seen in Amanita citrina field photography.',
 'Dense crowded white free gills under the cap, as seen in Amanita citrina field photography.',
 'The distinctive lemon-yellow to pale greenish-yellow cap with contrasting flat white patches, and the sharply marginate (shelf-rimmed) bulbous base — not a rounded bulb, but one with a clear flat flange — are the diagnostic visual markers. The margin of the bulb has a distinct sharp horizontal rim.',
 'Strong smell of raw potato — the most characteristic field character. Not toxic but inedible. Confused with A.phalloides at distance due to pale greenish-yellow cap; distinguished by flat (not rounded) patch remnants on cap, marginate bulb flange, and raw potato smell.',
 'Acidic humus under beech, pine and oak, mixed forest soil.',
 'Mixed deciduous and conifer forest, beech and pine understory, autumn forest light.',
 'Small fungus fly on the cap surface.',
 NULL,
 false),

-- ── esp-067 Amanita strobiliformis (precaución) ─────────────────────────────
('esp-067',
 'Very large white to pale grey pileus, 8–20 cm, broadly convex; covered with large prominent pyramidal grey warts arranged across the entire cap surface — each wart 1–3 cm wide, irregular, angular, resembling pine cone scales; margin appendiculate with smaller veil fragments. As seen in Amanita strobiliformis field photography.',
 'Robust white stipe, 10–20 cm tall, 2–4 cm thick, surface with coarse grey-white scales and fibrils below the ring; white pendant ring, often large and fragile; bulb at base irregular, white. As seen in Amanita strobiliformis field photography.',
 'Dense crowded white free gills under the cap, as seen in Amanita strobiliformis field photography.',
 'The very large pyramidal grey warts on the white cap surface are the most striking feature — far larger and more angular than the warts on A.muscaria (which are white) or A.pantherina (which are white and much smaller). The pine-cone scale pattern of large angular grey warts on a white background is the primary diagnostic visual character.',
 'Contains toxins. Found under calcareous deciduous woodland. The fragile ring is easily lost. Confused with A.solitaria.',
 'Calcareous soil, rich deciduous woodland floor.',
 'Warm calcareous oak and mixed deciduous forest, summer forest light.',
 'A small beetle in the leaf litter.',
 'The large pyramidal grey warts on the cap must be clearly rendered — they are angular and prominent, not subtle; single dominant specimen at ground level.',
 false),

-- ── esp-068 Amanita eliae (precaución) ──────────────────────────────────────
('esp-068',
 'Small to medium cream to very pale beige pileus, 4–10 cm, convex then broadly flat; surface smooth, without warts; colour uniform very pale cream-white; margin clearly striate (grooved) for 1–2 cm — the striations are a defining diagnostic feature. As seen in Amanita eliae field photography.',
 'Slender white to cream stipe, 7–14 cm tall, 1–2 cm thick, cylindrical, smooth surface; the stipe carries no ring (anellate — ring completely absent, leaving the stipe smooth and bare between cap and base); basal sac-like white volva present at the base. As seen in Amanita eliae field photography.',
 'Dense crowded white free gills under the cap, as seen in Amanita eliae field photography.',
 'The complete absence of a ring (stipe smooth and bare from cap to base) combined with the clearly striate cap margin and the basal sac volva are the three diagnostic features that together define this species. Among Amanita species with sac volvas, having no ring is the most visually distinctive trait.',
 'Classified as precaución — contains some toxins. Distinguished from A.vaginata (edible, grey cap) by cream-white (not grey) cap colour. The absence of a ring is the key feature; the stipe must look completely bare between cap and volva.',
 'Rich deciduous soil under oak and mixed woodland.',
 'Warm Mediterranean-influenced open oak woodland, dry summer conditions, dappled afternoon light.',
 'Small forest beetle.',
 'Stipe must be clearly visible from base to cap margin with no ring — the completely bare smooth stipe between cap attachment and base volva is the defining visual character; camera angle must show the full stipe length.',
 false),

-- ── esp-069 Amanita excelsa (precaución) ────────────────────────────────────
('esp-069',
 'Medium-large dark grey to brownish-grey pileus, 7–15 cm, convex to broadly flat; surface covered with irregular grey patches and wart-like remnants against a darker grey-brown background; overall darker and greyer than A.spissa. As seen in Amanita excelsa field photography.',
 'White to greyish-white stipe, 8–16 cm tall, 1.5–3 cm thick, cylindrical with a napiform (turnip-shaped) swollen base that widens below mid-stipe then narrows again to a point; grey-white fibrous scales on the stipe; white pendant ring. As seen in Amanita excelsa field photography.',
 'Dense crowded white free gills under the cap, as seen in Amanita excelsa field photography.',
 'The napiform (turnip-shaped — widest below mid-stipe, then narrowing again) swollen base combined with the darker grey cap colour distinguishes this from A.spissa (which has a more simply rounded bulbous base and a slightly browner-less-grey cap). The tapering base tip is the key visual difference.',
 'Smell of radish. Toxic. Easily confused with A.spissa and A.pantherina. Not edible.',
 'Pine and spruce needle litter, acidic humus under conifers.',
 'Montane conifer forest, spruce-pine understory, cool forest light.',
 'Small slug on the leaf litter.',
 NULL,
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- BOLETACEAE (5 species — excelente)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-002 Boletus aereus (excelente) ──────────────────────────────────────
('esp-002',
 'Dark chocolate-brown to nearly black velvety pileus, 6–20 cm, hemispherical then convex; surface dry, finely tomentose (velvety-felty texture) especially when young, colour very dark at centre — like dark espresso coffee, significantly darker than B.edulis (which is milk-chocolate brown). As seen in Boletus aereus field photography.',
 'Pale brown stipe with brown reticulation (raised net pattern), 6–15 cm tall, 3–6 cm thick, cylindrical to club-shaped; the reticulation visible over the upper portion, creating a pale net on the brown surface; base not as strongly swollen as B.edulis. As seen in Boletus aereus field photography.',
 'Cream to pale olive-cream sponge-like pore rim visible at the cap edge from a side angle — the striking contrast between the very dark almost-black cap and the pale cream pore rim is greater than in any other edible bolete; as seen in Boletus aereus field photography.',
 'The extremely dark, almost black, velvety cap surface is the defining visual character — darker than any other edible European bolete. The dramatic contrast between the near-black cap and the pale reticulated stipe and cream pore rim is the primary visual identifier.',
 'Excellent edible, considered by many superior to B.edulis in flavour. Flesh white, unchanging. Found mainly in warm Mediterranean oak and holm oak forests in summer. Does not blue when cut.',
 'Dry warm deciduous leaf litter — holm oak (encinar) and cork oak mast layer.',
 'Warm Mediterranean oak forest (encinar, robledal), summer dry conditions, strong warm afternoon light.',
 'Small ground beetle on the dry leaf litter.',
 NULL,
 false),

-- ── esp-003 Boletus pinophilus (excelente) ──────────────────────────────────
('esp-003',
 'Dark chocolate to coppery-brown matte pileus, 6–20 cm, convex to broadly rounded; surface dry, matte and slightly tomentose (felty), darker and richer than B.edulis with a copper-chocolate tone and occasional reddish tinge; cap colour uniform without the paler margin typical of B.edulis. As seen in Boletus pinophilus field photography.',
 'Pale buff-brown stipe, 5–15 cm tall, 3–7 cm thick, club-shaped to cylindrical; reticulation (raised net pattern) over the upper portion, with a slightly browner (less pale cream) background than B.edulis. As seen in Boletus pinophilus field photography.',
 'Pale cream to slightly yellowish sponge-like pore rim at the cap edge, similar to B.edulis but with a faintly more yellowish tone; as seen in Boletus pinophilus field photography.',
 'The darker, more uniform chocolate-to-copper-brown and matte (not shiny) cap without the paler margin of B.edulis, combined with the exclusively pine-forest habitat, are the key visual differentiators. The all-over uniform dark cap colour lacking the lighter margin of B.edulis is the primary character.',
 'Excellent edible, closely related to B.edulis. Flesh white, unchanging. Strictly mycorrhizal with Scots pine. Often the first bolete to fruit in summer (July) before B.edulis.',
 'Deep Scots pine needle litter (pinar), acidic sandy-loam soil.',
 'Dense Scots pine forest, needle carpet floor, late summer golden light through pine canopy, long shadows.',
 'Pine bark beetle at the stipe base, a pine cone beside the mushroom.',
 NULL,
 false),

-- ── esp-004 Boletus reticulatus (excelente) ──────────────────────────────────
('esp-004',
 'Warm buff to ochraceous-brown pileus, 6–20 cm, convex; surface dry, often cracking in dry weather into a polygonal pattern — dried-earth crazing revealing pale flesh beneath — giving a distinctive cracked-leather texture. Paler and more ochre-toned than B.edulis. As seen in Boletus reticulatus field photography.',
 'Pale ochre-buff stipe with fine dense reticulation, 5–15 cm tall, 3–6 cm thick; the reticulation covers most of the stipe length and is fine-meshed; not as strongly club-shaped as B.edulis. As seen in Boletus reticulatus field photography.',
 'Cream to pale ochre sponge-like pore rim at the cap edge, similar to B.edulis. As seen in Boletus reticulatus field photography.',
 'The paler, more ochre-buff (not rich chocolate-brown) cap with characteristic dry-weather cracking into polygonal plates — revealing pale flesh beneath the cracks — distinguishes this from B.edulis. The cracked-earth surface pattern is the most visually distinctive character of mature specimens.',
 'Excellent edible. Flesh white, unchanging. A summer species fruiting earlier than B.edulis (June–July). Associated with deciduous oaks and chestnuts. Cap cracking in dry weather is a reliable diagnostic feature.',
 'Dry deciduous leaf litter, oak and chestnut mast, warm calcareous or neutral soil.',
 'Open deciduous oak-chestnut forest, drier summer conditions than B.edulis, bright afternoon light.',
 'A small butterfly on a nearby leaf, ground ants on the forest floor.',
 NULL,
 false),

-- ── esp-005 Imleria badia (excelente) ───────────────────────────────────────
('esp-005',
 'Rich chestnut-brown to bay-brown pileus, 5–15 cm, convex to broadly flat; surface smooth, slightly greasy or viscid in wet weather; bay-brown colour uniform across the entire cap without the paler margin typical of B.edulis. As seen in Imleria badia field photography.',
 'Pale buff to light brown slender stipe, 4–10 cm tall, 1.5–3 cm thick — notably more slender relative to cap size compared to Boletus species; surface with fine longitudinal fibres (NOT a raised reticulate net pattern — this absence of reticulation is a key diagnostic difference from Boletus s.str.). As seen in Imleria badia field photography.',
 'White to pale cream pore surface visible as a rim at the cap edge from a side angle — the pore surface turns noticeably blue-grey when bruised. As seen in Imleria badia field photography.',
 'The slender, longitudinally fibrous stipe lacking the raised reticulate net pattern of Boletus species, combined with the uniform bay-brown cap colour and more slender proportions, are the visual characters separating this from true Boletus. More gracile habit than the boleti.',
 'Flesh whitish, turning faint blue when cut — a diagnostic for the genus. Excellent edible, one of the most common boletes in northern Spain. No toxicity. Associated with both pine and beech. Widely collected.',
 'Mixed conifer-beech litter, acidic humus, often among mosses and bilberry.',
 'Mixed pine-beech forest (hayedo-pinar), mossy forest floor, cool damp summer conditions, soft diffuse light.',
 'Small fungus gnat, a patch of bilberry nearby.',
 NULL,
 false),

-- ── esp-201 Butyriboletus regius (excelente) ─────────────────────────────────
('esp-201',
 'Striking rose-pink to raspberry-red or lilac-tinged pileus, 8–20 cm, convex then broadly flat; surface dry, matte, finely velvety; the vivid pink-to-red cap colour is unique among all edible European boletes. As seen in Butyriboletus regius field photography.',
 'Bright chrome-yellow stipe with vivid red reticulation covering the entire surface, 6–15 cm tall, 3–5 cm thick, robust and firm. As seen in Butyriboletus regius field photography.',
 'Bright lemon-yellow to canary-yellow pore surface visible as a vivid band at the cap edge from a side angle — the yellow pores contrast strongly with the pink-red cap above. As seen in Butyriboletus regius field photography.',
 'The unique combination of rose-pink/raspberry cap + chrome-yellow stipe with vivid red reticulation + canary-yellow pores makes this unmistakable among all European boletes. No other species has this three-colour combination of pink cap, yellow-and-red stipe, and yellow pores.',
 'Excellent edible. Flesh pale yellow, slightly and faintly bluing when cut. A rare and spectacular species associated mainly with beech and oak on calcareous soils. Prized find.',
 'Rich deciduous humus under beech, oak, and lime on calcareous soils.',
 'Warm mixed deciduous forest with calcareous substrate, beech-oak canopy, warm summer afternoon light.',
 'A small butterfly on a nearby leaf.',
 NULL,
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- RUSSULACEAE (4 species)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-024 Russula cyanoxantha (excelente) ──────────────────────────────────
('esp-024',
 'Highly variable pileus, 6–15 cm, convex to broadly flat or slightly depressed; colour ranges across different tones of dull slate-purple, olive-green, greyish-violet, or a mixture of green, violet and grey — often different tones at different areas of the same cap, creating a mottled multicolour appearance; surface smooth, slightly viscid. As seen in Russula cyanoxantha field photography.',
 'White to slightly greyish stipe, 5–10 cm tall, 2–3 cm thick, cylindrical, smooth, solid and firm, without reticulation. As seen in Russula cyanoxantha field photography.',
 'Dense, forking, notably elastic (not brittle) white gills visible under the cap — the gills are flexible and do not snap cleanly; a diagnostic feature distinguishing this from most other Russula species; as seen in Russula cyanoxantha field photography.',
 'The highly variable cap colour — mixing grey, violet, green and olive in irregular patches — combined with the white elastic (non-brittle) gills distinguish this from other Russula species. No single-colour cap in this species: always a mottled mix of subdued hues. The flexible (not brittle) gills are the tactile diagnostic but visible as such in field photography.',
 'Excellent edible, one of the finest Russula species. Flesh white, not changing. Gills flexible and greasy-feeling, not snapping like most Russula. Widely distributed in beech and oak forests.',
 'Deciduous leaf litter, beech and oak mast on neutral to slightly acidic soil.',
 'Beech and oak forest understory, damp summer-autumn conditions, soft diffuse forest light under closed canopy.',
 'Small slug on a nearby leaf, a fungus fly.',
 NULL,
 false),

-- ── esp-035 Lactarius deliciosus (excelente) ─────────────────────────────────
('esp-035',
 'Vivid carrot-orange to brick-orange pileus with concentric darker orange zones, 4–14 cm, convex then infundibuliform (funnel-shaped) with a central depression; surface smooth, slightly viscid when wet; concentric zoning clearly visible. As seen in Lactarius deliciosus field photography.',
 'Orange to salmon-orange stipe, 3–8 cm tall, 1–3 cm thick, cylindrical; surface with scrobiculate pits — small round depressions slightly paler than the surrounding orange surface, visible along the stipe length; a key diagnostic feature. As seen in Lactarius deliciosus field photography.',
 'Orange to apricot-orange crowded gills, slightly decurrent (running down the stipe); the vivid orange gill colour is the most immediately diagnostic character; when broken, the gills exude bright carrot-orange latex (milk). As seen in Lactarius deliciosus field photography.',
 'The uniformly orange colouration of cap (with concentric zones), gills and latex — a completely orange mushroom — combined with the scrobiculate (pitted) stipe surface are completely distinctive. Distinguished from L.sanguifluus by brighter carrot-orange (not wine-red) latex.',
 'Excellent edible, the most popular wild mushroom in Catalonia (níscalo/rovelló). Latex bright carrot-orange (not wine-red — that is L.sanguifluus). Flesh orange-white, slowly turning green. Exclusively under Scots pine (Pinus sylvestris).',
 'Scots pine needle litter (pinar), acidic sandy-loam, often among bilberry or heather.',
 'Scots pine forest (pinar), golden autumn light filtering through pine canopy, September–November.',
 'A small ground beetle, a fallen pine cone at the base.',
 NULL,
 false),

-- ── esp-036 Lactarius sanguifluus (excelente) ────────────────────────────────
('esp-036',
 'Salmon-orange to apricot pileus with darker concentric zones, 5–15 cm, convex then broadly funnel-shaped; colour more salmon-pink (less vivid orange than L.deliciosus), sometimes with slight vinaceous-purple tones in certain lights. As seen in Lactarius sanguifluus field photography.',
 'Salmon-orange stipe, 3–7 cm tall, 1.5–3.5 cm thick, with scrobiculate pits — small round depressions of slightly different colour on the stipe surface, similar pattern to L.deliciosus but in salmon tones. As seen in Lactarius sanguifluus field photography.',
 'Salmon-orange to apricot gills with a slight vinaceous tint, crowded and decurrent; when broken, the gills exude deep wine-red to blood-red latex — much darker and more vinaceous than the bright carrot-orange of L.deliciosus. As seen in Lactarius sanguifluus field photography.',
 'The deep wine-red to blood-red latex (not carrot-orange as in L.deliciosus) is the primary visual diagnostic — if the gill exudate is dark wine-red it is L.sanguifluus; the more salmon-pink (less vivid orange) cap colour compared to the brighter L.deliciosus also helps differentiation.',
 'Considered by many superior in flavour to L.deliciosus. Latex wine-red. Flesh also turns vinaceous-red when exposed. Exclusively under pine; a Mediterranean and warm-climate species.',
 'Pine needle litter, warm dry acidic sandy soil under Scots or Aleppo pine.',
 'Warm Scots pine forest, Mediterranean-influenced conditions, autumn afternoon light.',
 'Small ground beetle, fallen pine needle clusters.',
 NULL,
 false),

-- ── esp-040 Lactarius indigo (comestible / icónico) ──────────────────────────
('esp-040',
 'Brilliant indigo-blue to steel-blue pileus with concentric darker blue zones, 5–15 cm, convex then broadly funnel-shaped; surface smooth, slightly viscid; the entire cap saturated in indigo blue — one of the most visually extraordinary mushrooms in European forests. As seen in Lactarius indigo field photography.',
 'Indigo-blue stipe matching the cap, with lighter pale blue background and darker blue scrobiculate pits, 3–8 cm tall, 1.5–3 cm thick. As seen in Lactarius indigo field photography.',
 'Blue to grey-blue crowded decurrent gills; when broken, the gills exude vivid indigo-blue latex — the blue latex sealing from the gills is immediately visible and confirmatory. As seen in Lactarius indigo field photography.',
 'The saturated, uniform indigo-blue colour across cap, stipe and gills is absolutely unique among European mushrooms — no other species comes close. The indigo-blue latex dripping from the cut gills adds a dramatic visual confirmation. The concentric zones add depth to the blue.',
 'Edible; less common in Europe but widespread in North America and Asia. Flesh blue, oxidising grey-green when exposed. Latex indigo-blue, fading. Found mainly under pine and oak.',
 'Mixed pine-oak litter, warm acidic soil, often partially buried in leaf mould.',
 'Mixed pine-oak forest (pinar-robledal), warm summer-autumn conditions, dappled forest light.',
 'A small blue-coloured beetle or butterfly on a nearby leaf — echoing the indigo colour.',
 NULL,
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- CANTHARELLACEAE (5 species)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-046 Cantharellus pallens (excelente) ─────────────────────────────────
('esp-046',
 'Pale cream to ochre-ivory pileus, 3–10 cm, convex then irregularly funnel-shaped with a lobed, wavy margin; colour a pale straw-yellow to cream — significantly less saturated yellow than C.cibarius. As seen in Cantharellus pallens field photography.',
 'Cream to white stipe, 3–8 cm tall, 1–2 cm thick, cylindrical to slightly club-shaped, solid, concolorous with the pale cap. As seen in Cantharellus pallens field photography.',
 'Pale cream to ivory-white blunt forking false-gill ridges (pseudogills) running partially down the stipe — less vividly coloured than C.cibarius, a cream-ivory shade; as seen in Cantharellus pallens field photography.',
 'The overall pale cream to ivory colouration — significantly less yellow than C.cibarius — is the key visual differentiator. Where C.cibarius is vivid egg-yellow, C.pallens is cream-ivory with only a faint yellow tinge. The characteristic blunt forking false-gill ridges (not true gills) are the same.',
 'Excellent edible, equivalent to C.cibarius. Found in warm oak and holm oak woodland at lower altitudes. Previously considered a variety of C.cibarius.',
 'Warm dry oak leaf litter, oak and holm oak mast layer.',
 'Warm dry deciduous and mixed woodland, Mediterranean-influenced oak forest, summer afternoon warm light.',
 'A small ground beetle, a few fallen oak leaves.',
 NULL,
 false),

-- ── esp-047 Cantharellus aurora (excelente) ──────────────────────────────────
('esp-047',
 'Vivid amber-orange to golden-yellow pileus, 2–7 cm, convex then broadly funnel-shaped with wavy lobed margin; colour warmer and more orange-gold than C.cibarius (which is egg-yellow), with a glowing amber quality. As seen in Cantharellus aurora field photography.',
 'Golden-yellow stipe, 3–7 cm tall, 0.8–1.5 cm thick, slender, cylindrical, solid, same golden-amber colour as the cap. As seen in Cantharellus aurora field photography.',
 'Deep golden-yellow to amber-orange blunt forking false-gill ridges running down the stipe — more intensely coloured (deeper amber-orange) than C.cibarius; as seen in Cantharellus aurora field photography.',
 'The deeper, warmer amber-orange colour (more orange-gold than egg-yellow) compared to C.cibarius, combined with the smaller, more slender form and the brightly coloured stipe, are the key visual differentiators among Cantharellus species.',
 'Excellent edible. The intensely golden-orange colouring makes it distinctive. Associated with pine and oak woodland.',
 'Pine needle litter and oak leaf litter, mixed forest floor.',
 'Mixed pine-oak woodland, warm dappled afternoon light, summer conditions.',
 'Small forest ant, a fallen leaf.',
 NULL,
 false),

-- ── esp-048 Craterellus cornucopioides (excelente) ───────────────────────────
('esp-048',
 'Trumpet-shaped fruiting body, entirely dark grey-black to charcoal-grey; the upper opening is 3–8 cm wide, the funnel descending steeply to a narrow base; the inner surface of the trumpet is dark grey-black and fibrous-scaly; the entire form is hollow. As seen in Craterellus cornucopioides field photography.',
 'No distinct stipe — the fruiting body is a continuous hollow trumpet narrowing downward, 5–12 cm tall, grey-black throughout, smooth on the outer surface. As seen in Craterellus cornucopioides field photography.',
 'The outer lower surface of the trumpet is the fertile zone — smooth to finely wrinkled pale grey, lacking true gills or ridges; this paler outer fertile surface contrasts with the darker inner surface; as seen in Craterellus cornucopioides field photography.',
 'The entirely dark grey-black hollow trumpet form — thin-walled, funnel-shaped — is unlike any other edible mushroom and unmistakable. Often grows in dense clusters of multiple dark trumpets emerging together from the forest floor.',
 'Excellent edible with an intense smoky-earthy flavour; prized when dried. No toxic lookalikes — the hollow black trumpet cannot be confused with any dangerous species. Often found in groups of 5–30 individuals.',
 'Rich deciduous leaf litter, beech and oak mast, mossy patches on the forest floor.',
 'Beech and oak forest understory, damp shaded conditions, soft diffuse autumn light.',
 'Small woodlouse on the leaf litter.',
 'Show a small cluster of 3–5 trumpets emerging from the leaf litter together rather than a single specimen — the clustered growth habit is a key visual character of this species.',
 false),

-- ── esp-049 Craterellus lutescens (excelente) ────────────────────────────────
('esp-049',
 'Orange to golden-amber funnel-shaped cap, 2–6 cm wide and 4–8 cm tall; irregular wavy-lobed margin; inner cap surface orange-yellow, smooth. As seen in Craterellus lutescens field photography.',
 'Vivid orange to egg-yolk orange hollow stipe, 4–8 cm tall, 0.5–1 cm wide — the stipe is the most brilliantly coloured part of the fungus, in a vivid warm orange that immediately draws the eye. As seen in Craterellus lutescens field photography.',
 'Outer stipe surface is the fertile zone — pale buff to cream with faint shallow pseudogill wrinkles, much paler than the brilliant orange inner cap and stipe; this pale outer surface against the bright orange creates a distinctive colour contrast; as seen in Craterellus lutescens field photography.',
 'The vivid egg-yolk orange stipe contrasting with the much paler cream-buff outer fertile surface is the unique visual character — no other Craterellus or Cantharellus has a stipe in this particular saturated warm orange. The orange stipe glows among the pine needles.',
 'Excellent edible, aromatic and fruity. Often found in large groups under pine. Previously known as Cantharellus lutescens. No toxic lookalikes.',
 'Pine needle litter, acidic peaty-sandy soil under Scots pine.',
 'Dense Scots pine forest (pinar), mossy patches, soft autumn forest light, often growing among green moss.',
 'Small forest moth, a patch of green moss surrounding the base.',
 'Show a small group of 3–5 specimens — the vivid orange stipes emerging through green moss are the defining visual composition; camera at ground level.',
 false),

-- ── esp-050 Craterellus tubaeformis (excelente) ──────────────────────────────
('esp-050',
 'Ochre-brown to olive-brown irregular funnel-shaped cap, 2–6 cm wide; surface fibrous to slightly scaly; colour brownish, much less vivid than C.lutescens; typically with a small central hole or perforation. As seen in Craterellus tubaeformis field photography.',
 'Yellow to yellowish-ochre hollow stipe, 4–8 cm tall, 0.5–1 cm wide; distinctly fluted or channelled lengthwise — longitudinal grooves running the full length give the stipe a squared or ridged cross-section visible from outside; colour brighter yellow than the brownish cap. As seen in Craterellus tubaeformis field photography.',
 'Pale cream to grey-buff shallow blunt forking pseudogill ridges on the underside of the cap, running partially down the stipe; sparse and shallow; as seen in Craterellus tubaeformis field photography.',
 'The fluted (longitudinally channelled and grooved) hollow yellow stipe is the single most diagnostic visual character — the external grooves create a ribbed surface unlike any other Craterellus; combined with the ochre-brown (not vivid orange) cap, it is clearly distinct from C.lutescens.',
 'Excellent edible, very common late-season mushroom (October–December). Grows in dense clusters in moss-rich conifer forest. The fluted hollow stipe is the key character. Also known as Cantharellus tubaeformis.',
 'Waterlogged peat and moss, among Sphagnum moss, wet conifer and beech forest floor.',
 'Wet mossy conifer forest, boggy patches, late autumn cool damp conditions, soft grey forest light.',
 'Small fungus gnat, large patch of Sphagnum moss as the substrate background.',
 'Show 4–6 specimens in a dense cluster emerging from green Sphagnum moss; the fluted yellow stipes and brownish funnel caps against the bright green moss are the defining composition.',
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- HYDNACEAE (1 species)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-052 Hydnum rufescens (excelente) ─────────────────────────────────────
('esp-052',
 'Small salmon-orange to peach-coloured pileus, 3–8 cm, convex to irregularly flat; surface smooth, dry, slightly irregular; colour warm salmon-apricot — clearly more orange than H.repandum (which is pale cream-buff). As seen in Hydnum rufescens field photography.',
 'Salmon to pale orange-white stipe, 3–7 cm tall, 1–2 cm thick, cylindrical, solid, slightly paler than the cap but concolorous. As seen in Hydnum rufescens field photography.',
 'Dense downward-pointing salmon to cream spines covering the entire underside of the cap, crowded, short (2–5 mm), slightly paler than the cap surface; the spines run slightly down the stipe (decurrent); as seen in Hydnum rufescens field photography.',
 'The warmer, more vivid salmon-orange colouration distinguishes this from H.repandum (pale cream-buff); the smaller cap and more uniformly orange colour of all parts are the key visual differences between the two hedgehog fungi.',
 'Excellent edible, equivalent to H.repandum. Slightly smaller and more vivid orange than H.repandum. Often growing alongside H.repandum in mixed forest.',
 'Mixed pine-beech needle and leaf litter, acidic humus.',
 'Mixed forest (pinar, hayedo), damp autumn conditions, soft diffuse forest light.',
 'Small ground beetle.',
 NULL,
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- PLEUROTACEAE (3 species)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-070 Pleurotus ostreatus (excelente) ──────────────────────────────────
('esp-070',
 'Oyster-shaped to fan-shaped greyish-blue to slate-grey pileus, 5–20 cm, growing laterally from wood; surface smooth, moist, slate-grey to dove-grey when fresh; margin inrolled when young; multiple fruiting bodies overlapping in shelf-like clusters from a single point on dead wood. As seen in Pleurotus ostreatus field photography.',
 'Very short, eccentric white stipe, 1–3 cm tall, 1–3 cm thick, attached laterally to the substrate; often barely visible behind the cap; white to cream. As seen in Pleurotus ostreatus field photography.',
 'White to cream crowded gills running far down the stipe (strongly decurrent), visible from the side and below the cap; the white gills on the inner surface of the greyish cap are the most visible underside feature; as seen in Pleurotus ostreatus field photography.',
 'The overlapping shelf-like clusters growing directly from dark hardwood bark — multiple grey oyster-shaped caps in a rosette with white gills visible at the inner edges — is the defining visual character. No terrestrial stem; entirely lateral on wood.',
 'Excellent edible, widely cultivated. Grows on dead hardwood (beech, oak). Main confusion: Omphalotus olearius (toxic, orange-brown, terrestrial) — but that species is orange and grows from ground at olive roots.',
 'Dead or dying hardwood — beech or oak bark surface, decaying trunk.',
 'Temperate deciduous forest, large dead standing or fallen beech or oak trunk, autumn-winter conditions, cool moist forest.',
 'Small bark beetle on the dead wood surface.',
 'Show a cluster of 3–5 overlapping oyster-shaped caps growing from a section of dark dead hardwood bark; the stipe attachment to bark must be visible, not growing from soil; ground-level view looking slightly up at the cluster.',
 false),

-- ── esp-071 Pleurotus eryngii (excelente) ────────────────────────────────────
('esp-071',
 'Brownish-grey to cream-beige broad pileus, 5–15 cm, convex to broadly funnel-shaped or depressed at centre; surface dry, smooth to slightly fibrous; colour grey-brown to oatmeal-beige; growing terrestrially from dry open ground. As seen in Pleurotus eryngii field photography.',
 'White to cream, central to slightly eccentric robust stipe, 2–6 cm tall, 1.5–4 cm thick — notably thicker and more central than P.ostreatus; very firm and solid. As seen in Pleurotus eryngii field photography.',
 'White to cream crowded gills running down the stipe (decurrent), as seen in Pleurotus eryngii field photography.',
 'Growing terrestrially from dry open ground (not from wood) at the base of Eryngium (sea holly) or similar dry thistle-like plants in Mediterranean grassland — this open-ground habitat in dry scrubland is unlike any other Pleurotus species; the robust white stipe and central (not lateral) position are also distinctive.',
 'Excellent edible, very firm meaty texture. Grows on dead roots of Eryngium, Ferula and related umbellifers in dry open Mediterranean habitat — never on wood. One of Spain''s most prized wild mushrooms (seta de cardo). Widely cultivated as King oyster mushroom.',
 'Dry calcareous stony ground — dead Eryngium (cardo) or similar plant root in Mediterranean scrubland.',
 'Open dry Mediterranean scrubland, rocky calcareous grassland, strong warm autumn sunlight in open terrain with no forest canopy.',
 'A small lizard on a nearby rock, one or two dry grass stalks in the background.',
 'Terrestrial growth — the mushroom grows from open dry stony ground with no wood visible; the surrounding habitat should be open Mediterranean scrubland with dry thistle-like vegetation, not forest.',
 false),

-- ── esp-073 Pleurotus pulmonarius (excelente) ────────────────────────────────
('esp-073',
 'White to very pale grey fan-shaped to irregularly lobed pileus, 4–12 cm; surface smooth, satiny-white; paler than P.ostreatus (white to very pale grey, not slate-grey). As seen in Pleurotus pulmonarius field photography.',
 'White, very short lateral stipe, 1–3 cm, solid, white. As seen in Pleurotus pulmonarius field photography.',
 'White crowded decurrent gills — the all-white to very pale grey appearance of cap and gills contrasts with the dark hardwood substrate. As seen in Pleurotus pulmonarius field photography.',
 'Whiter and more slender than P.ostreatus — caps are white to very pale grey (not slate-grey) and often smaller and more numerous; otherwise similar shelf-like growth on dead hardwood. The paler, whiter overall appearance is the key visual differentiator.',
 'Excellent edible, similar to P.ostreatus. Summer species (unlike P.ostreatus which fruits autumn-spring). Grows on dead hardwood.',
 'Dead hardwood bark surface.',
 'Temperate mixed or deciduous forest, dead beech or oak trunk, summer conditions, warm dappled light.',
 'Small bark beetle.',
 'Show a cluster growing laterally from dead hardwood bark, not from soil.',
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- OMPHALOTACEAE (1 species)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-075 Lentinula edodes / Shiitake (excelente) ──────────────────────────
('esp-075',
 'Dark chestnut-brown to coffee-brown convex pileus, 5–20 cm; surface covered with white to cream cottony-fibrous scale remnants concentrated at the margin and scattered across the surface, giving a fringe-like or shaggy appearance; centre darkest, margin often split or cracked with age revealing pale flesh beneath. As seen in Lentinula edodes field photography.',
 'Brown, slightly eccentric stipe, 4–10 cm tall, 1–2.5 cm thick; a membranous-fibrous ring zone or veil remnant visible as a pale cottony zone below mid-stipe; stipe surface brown and fibrous below the veil zone. As seen in Lentinula edodes field photography.',
 'White to cream crowded gills, free or barely attached to the stipe, as seen in Lentinula edodes field photography.',
 'The dark chestnut-brown cap with scattered white cottony-fibrous scale remnants giving a fringe-like or shaggy margin — combined with the brown fibrous stipe with veil zone — are the defining visual characters of shiitake in the wild or on a cultivation log.',
 'Excellent edible with intense umami flavour. Widely cultivated on hardwood logs or sawdust blocks. In the wild grows on dead oaks and other hardwoods in East Asian forests; in Europe mainly cultivated. Distinctive woody mushroom odour.',
 'Dead hardwood log — oak, chestnut or similar hardwood surface.',
 'Shaded hardwood forest or cultivation environment on log substrate, damp conditions.',
 'A small fungus gnat.',
 'Show the mushroom growing from a section of dark dead hardwood log; the cottony white veil fragments at the cap margin must be visible.',
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- MORCHELLACEAE (3 species)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-079 Morchella elata (excelente) ──────────────────────────────────────
('esp-079',
 'Tall, elongated conical to mitre-shaped head, 3–7 cm tall; surface covered with a network of deep dark ridges and angular pits (honeycomb alveoli); colour dark grey-brown to nearly black — notably darker than M.esculenta; both the ridges and the pits are dark charcoal-grey. As seen in Morchella elata field photography.',
 'White to cream cylindrical hollow stipe, 4–10 cm tall, 2–4 cm wide, smooth to finely granular; distinctly white against the dark head above. As seen in Morchella elata field photography.',
 'The entire outer surface of the conical head is the fertile zone — a network of dark charcoal-grey ridges forming deep angular pits with a more vertical, columnar pattern; as seen in Morchella elata field photography.',
 'The tall, dark elongated conical head with strongly vertical ridges and dark colouration (both ridges and pits charcoal-grey-brown) distinguishes M.elata from M.esculenta (which is ochre-brown with a more rounded, less elongated head). The elongated conical form and dark colour are the primary differentiators.',
 'Excellent edible when fully cooked (toxic raw). Spring species. Dark colour and strongly elongated shape distinguish from M.esculenta. Grows under pine and in disturbed areas.',
 'Rich soil near pine stumps, burned areas, disturbed pine forest floor.',
 'Pine forest (pinar), spring conditions (March–May), bright spring light in open or disturbed areas.',
 'Small spring butterfly, fresh green plants emerging from the forest floor.',
 NULL,
 false),

-- ── esp-080 Morchella conica (excelente) ─────────────────────────────────────
('esp-080',
 'Conical to narrowly conic head, 3–6 cm tall; honeycomb surface with ridges and pits; colour medium brown to grey-brown — intermediate between M.elata (darker charcoal) and M.esculenta (more ochre); the conical shape is more pronounced than M.esculenta. As seen in Morchella conica field photography.',
 'White to cream hollow stipe, 3–8 cm tall, 2–4 cm wide, smooth. As seen in Morchella conica field photography.',
 'The entire outer conical head is the fertile zone — brown ridges and angular pits, moderately deep; as seen in Morchella conica field photography.',
 'The more strongly conical shape (narrowing clearly to a pointed apex) compared to M.esculenta (which has a more rounded, egg-shaped head) combined with the medium brown colouration distinguishes this species within the morel complex.',
 'Excellent edible when fully cooked. Spring species. One of several conical morel species within a complex taxonomic group.',
 'Mixed forest floor and disturbed soil near path edges.',
 'Mixed forest and field edges, spring conditions, bright spring morning light.',
 'A spring beetle on the forest floor.',
 NULL,
 false),

-- ── esp-081 Morchella importuna (excelente) ──────────────────────────────────
('esp-081',
 'Conical to ellipsoidal head, 3–6 cm tall; honeycomb with well-defined primary vertical ribs creating orderly vertical columns from base to apex — a more structured, less irregular honeycomb than M.esculenta; colour ochre-brown to grey-brown. As seen in Morchella importuna field photography.',
 'White to cream hollow stipe, 4–10 cm tall, with a slightly wider base. As seen in Morchella importuna field photography.',
 'Well-ordered honeycomb with clearly defined primary ribs creating regular vertical columns — more regular and vertically structured than the irregular honeycomb of M.esculenta; as seen in Morchella importuna field photography.',
 'The more orderly, vertically structured honeycomb pattern with clearly defined primary ribs — creating regular column-like cells from base to apex — distinguishes this from the more randomly irregular honeycomb of M.esculenta. Often grows in disturbed, garden, or wood-chip mulch environments.',
 'Excellent edible when fully cooked. Distinguished by its association with disturbed environments (gardens, orchards, wood chip mulch, path edges) and the more regular honeycomb pattern.',
 'Rich disturbed soil, wood-chip mulch in gardens, disturbed pine forest floor.',
 'Disturbed garden, orchard or park environment, or disturbed pine forest edge, spring conditions (April–May), morning light.',
 'A spring ant trail on the soil.',
 NULL,
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- DISCINACEAE (1 species — mortal)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-082 Gyromitra esculenta (mortal) ─────────────────────────────────────
('esp-082',
 'Large, irregular brain-like or saddle-shaped pileus, 4–15 cm wide; surface deeply convoluted, wrinkled and cerebriforme — a complex irregular mass of dark chestnut-red to chocolate-brown folded lobes and irregular ridges; no flat or smooth cap surface anywhere; the brain-fold convolutions are the defining form. As seen in Gyromitra esculenta field photography.',
 'Short, stout, cream to pinkish-white stipe, 3–8 cm tall, 2–5 cm wide; surface irregularly ribbed and chambered; slightly paler than the dark cap above. As seen in Gyromitra esculenta field photography.',
 'The entire outer surface of the convoluted cap lobes is the fertile zone — dark reddish-brown irregular brain-fold surface without the orderly pits-and-ridges pattern of Morchella species; as seen in Gyromitra esculenta field photography.',
 'The deeply convoluted, brain-like cap surface — dark reddish-brown folded lobes with no orderly honeycomb pattern — completely unlike the regular honeycomb of Morchella morel species. Where morels have orderly pitted alveoli, Gyromitra has irregular brain-fold convolutions.',
 'Deadly toxic — contains gyromitrin hydrolysing to monomethylhydrazine; causes fatal liver and haematological damage despite name "esculenta". Superficially resembles morels but with irregular brain-folds not orderly honeycomb pits. Spring species under pine; multiple European fatalities recorded.',
 'Sandy acidic soil under pine, often near stumps or in burned areas.',
 'Open pine forest floor, disturbed sandy soil, spring light (March–April), bright open conditions.',
 'Spring beetle, a few fresh fern fronds emerging.',
 NULL,
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- TUBERACEAE (1 species — excelente)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-086 Tuber melanosporum (excelente) ───────────────────────────────────
('esp-086',
 'Irregular subglobose to lobose body, 3–10 cm overall — entirely enclosed, no cap; exterior surface covered in small polygonal pyramidal warts (verrucae), blue-black to black-brown, arranged in a regular geometric pattern resembling medieval paving stones or a reptile scale pattern. As seen in Tuber melanosporum field photography.',
 'No stipe — the entire truffle is the fruiting body; the exterior is a uniformly black warty surface enclosing the internal gleba. As seen in Tuber melanosporum field photography.',
 'No conventional hymenium visible externally; when cut, the interior (gleba) is black marbled with a white vein network — visible only in a cut cross-section displayed beside the intact truffle. The exterior shows only the geometric black warty surface. As seen in Tuber melanosporum field photography.',
 'A completely black, irregular warty ball with geometric polygonal wart patterning on the exterior surface — absolutely unlike any cap-and-stipe mushroom. When cut, jet-black flesh with an intricate white vein marbling revealed. The geometric warty exterior is the only external character.',
 'The most prized and expensive edible fungus in Europe (Périgord black truffle). Hypogeous (underground), found by trained dogs or pigs. Intense penetrating aroma. Found under oak and holm oak on calcareous soil in winter (November–March). Cut surface shows black gleba with white veins.',
 'Calcareous soil, 5–30 cm underground, among oak or holm oak roots — shown resting on soil surface for the photograph.',
 'Holm oak and oak forest (encinar, robledal), calcareous terrain, winter light, bare or sparse leaf-litter soil surface.',
 'A wood ant exploring the warty surface.',
 'Show one intact truffle and one cut truffle side by side on the bare forest floor — the warty black exterior of the intact one and the black-and-white marbled interior of the cut one must both be clearly visible. No conventional stipe or cap present.',
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- LYOPHYLLACEAE (1 species — excelente)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-095 Calocybe gambosa (excelente) ─────────────────────────────────────
('esp-095',
 'Large cream-white to faintly ochre-tinged pileus, 6–15 cm, convex then broadly flat; surface smooth, matte, slightly irregular at the margin; colour a uniform clean cream-ivory without distinctive marks or patches. As seen in Calocybe gambosa field photography.',
 'Robust, solid white stipe, 3–8 cm tall, 2–5 cm thick — notably short and thick relative to the large cap; surface smooth to slightly fibrous; pure white. As seen in Calocybe gambosa field photography.',
 'Very densely crowded white gills, thin and numerous, running slightly down the stipe (sinuate-decurrent); pure white, giving the underside a densely fluffy white appearance; as seen in Calocybe gambosa field photography.',
 'The strikingly short, thick, solid white stipe relative to the large cap — combined with the plain cream-white cap and intensely floury smell — are defining. Spring fruiting (April–May) under oak and hawthorn in short grass is equally diagnostic. Often grows in arcs or rings in meadows.',
 'Excellent edible, highly prized in spring. Intense smell of fresh flour or bread dough — most reliable field character. White spore print. No ring, no volva. Main confusion: Entoloma sinuatum (toxic, pink spores, less floury) and Clitocybe dealbata (small, mortal, wetter habitat).',
 'Rich grassy soil, meadow edges, under hawthorn or old oak, often in rings or arcs.',
 'Grassland edge with scattered hawthorn or oak, bright spring light (April–May), fresh green spring grass surrounding the mushrooms.',
 'A small spring butterfly, a honey bee exploring nearby flowers.',
 'Show a small arc or ring of 3–4 specimens in short green spring grass, with hawthorn branches and white blossom visible nearby; bright cheerful spring light.',
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- TRICHOLOMATACEAE (2 species — precaución, mortal)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-098 Clitocybe nebularis (precaución) ─────────────────────────────────
('esp-098',
 'Large grey-ash to pale beige-grey pileus, 8–20 cm, convex then broadly flat-depressed; surface pruinose (finely powdery bloom giving a slightly frosted matte appearance); colour a uniform medium grey or grey-beige without distinctive markings. As seen in Clitocybe nebularis field photography.',
 'Stout white to greyish-white stipe, 6–10 cm tall, 2–4 cm thick, with a distinctly swollen club-shaped base — the widening at the base is noticeable; surface fibrous longitudinally. As seen in Clitocybe nebularis field photography.',
 'Crowded white to cream gills running slightly down the stipe (decurrent), densely packed; as seen in Clitocybe nebularis field photography.',
 'The very large plain grey-ash cap with pruinose bloom, the swollen club-shaped stipe base, and the growth in dense rings or large troops in autumn leaf litter are the defining visual characters. Often growing in fairy rings of 10–30 specimens.',
 'Precaución — contains compounds causing gastrointestinal upset in many people; not recommended for eating. Can be confused with edible Lepista nuda (violet-tinged) or Clitocybe geotropa (taller stipe). Mass-collected by inexperienced foragers due to abundance.',
 'Deep deciduous leaf litter — beech, oak and pine needle mix.',
 'Mixed or deciduous forest, dense autumn leaf litter, often forming large rings; damp autumn forest, soft diffuse light.',
 'A few fallen leaves, a small forest snail.',
 NULL,
 false),

-- ── esp-100 Clitocybe dealbata (mortal) ──────────────────────────────────────
('esp-100',
 'Small white to cream-greyish pileus, 2–6 cm, convex to broadly flat then slightly depressed; surface pruinose (slightly powdery bloom); colour uniform cream-white, hygrophanous (slightly darker when wet). As seen in Clitocybe dealbata field photography.',
 'White to cream slender cylindrical stipe, 2–5 cm tall, 0.5–1.5 cm thick, solid; surface fibrous, concolorous with the cap. As seen in Clitocybe dealbata field photography.',
 'Crowded white to cream decurrent gills running down the stipe; pale cream-white; as seen in Clitocybe dealbata field photography.',
 'A plain, small, entirely white to cream depressed mushroom in open grassy areas — similar habitat to Marasmius oreades (senderuela) but entirely white (M.oreades is beige-ochre), with crowded decurrent gills, and growing in tight clusters in grass. The all-white small funnel in short lawn grass is the key visual.',
 'Deadly toxic — muscarinism with high muscarine levels; rapid cholinergic crisis. Fatally dangerous when mixed into foraging basket with Marasmius oreades or other small grassland mushrooms. Distinguished from M.oreades by entirely white colour, depressed cap, and crowded decurrent gills.',
 'Short green grass, lawns, meadows, grassy path edges.',
 'Open grassland, lawn or meadow, spring-autumn conditions, bright open light.',
 'A grass-feeding beetle, a few grass stems.',
 NULL,
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- PHYSALACRIACEAE (1 species — precaución)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-104 Armillaria mellea (precaución) ───────────────────────────────────
('esp-104',
 'Honey-yellow to tawny-orange convex pileus, 4–12 cm; surface dotted with small darker brownish fibrillose scales concentrated at the centre, giving a speckled appearance against the honey-coloured background; margin smooth; cap colour like clear golden honey. As seen in Armillaria mellea field photography.',
 'Pale honey-brown stipe, 8–15 cm tall, 0.8–1.5 cm thick, fibrous and slightly elastic; most distinctive feature is a prominent white to yellowish thick cottony membranous ring at mid-stipe; base of stipe often darker brown, typically attached in dense clusters to wood or tree roots. As seen in Armillaria mellea field photography.',
 'White to pale cream crowded gills running slightly down the stipe, as seen in Armillaria mellea field photography.',
 'Grows in dense tufted clusters at the base of trees or on wood, with multiple caps of various sizes packed together — the cluster growth habit at wood base and the prominent white cottony ring are the primary visual identifiers. Distinguished from Galerina marginata (deadly, smaller, no cluster, thinner ring) by large cluster size and thicker cottony ring.',
 'Precaución — commonly causes gastrointestinal illness when undercooked or eaten in large quantities. Must not be confused with Galerina marginata (mortal, smaller, solitary or few, thin ring). Grows as a parasite on tree roots and trunks. Black rhizomorphs in the soil are diagnostic.',
 'Base of live or dead hardwood trees — oak, beech, fruit trees; also on buried wood or roots.',
 'Deciduous forest, base of a large oak or beech tree, autumn conditions, warm afternoon light illuminating the cluster.',
 'Small forest ant trail between the cluster and the tree roots.',
 'Show a dense cluster of 5–8 mushrooms of varying sizes growing from the base of a dark hardwood tree trunk; the tree base must be visible as the substrate; single-specimen views are atypical for this species.',
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- ENTOLOMATACEAE (1 species — precaución)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-107 Entoloma clypeatum (precaución) ──────────────────────────────────
('esp-107',
 'Grey-brown to pale fawn pileus, 4–10 cm, convex to flat with a central umbo; surface dry, fibrous to silky; colour a dull grey-brown. As seen in Entoloma clypeatum field photography.',
 'White to pale grey stipe, 4–10 cm tall, 1–2 cm thick, cylindrical, solid then hollow, with longitudinal grey-white fibres. As seen in Entoloma clypeatum field photography.',
 'Initially white gills developing a distinctive salmon-pink to flesh-pink colour as spores mature — this colour change is the most diagnostic character; gills sinuate (notched near stipe); as seen in Entoloma clypeatum field photography.',
 'The gills maturing from white to a distinctive salmon-pink flush (the pink spore print depositing on gill surfaces) is the key visual diagnostic — mature specimens must show pink gills. Strong floury smell. Associated with prunus and rosaceous shrubs in spring.',
 'Toxic — causes severe gastrointestinal poisoning. Dangerously confused with Calocybe gambosa (St. George''s mushroom, excellent edible, all-white gills). Key differences: pink gills at maturity, fruiting under hawthorn/plum/apple, spring season. Distinguished by salmon-pink gills, not white.',
 'Grassland and woodland edge under Prunus species — hawthorn, plum, cherry, apple.',
 'Open grassy areas under hawthorn or plum blossom, spring (April–May), fresh spring light.',
 'Spring bee or butterfly on nearby hawthorn blossom.',
 'Show the specimen next to or under hawthorn (with white blossom if in flower); show gills at a visible angle to reveal the salmon-pink colouration — this diagnostic character must be apparent.',
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- CORTINARIACEAE (3 species — mortal)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-111 Cortinarius orellanus (mortal) ───────────────────────────────────
('esp-111',
 'Rust-orange to tawny-orange dry pileus, 4–9 cm, convex to campanulate to broadly flat; surface dry and fibrillose with fine radial fibres giving a silky-matte texture; colour a uniform burnt-orange or tawny, like dry autumn leaves or iron oxide. As seen in Cortinarius orellanus field photography.',
 'Cylindrical yellow to orange stipe, 4–8 cm tall, 1–2 cm thick, solid, surface with faint fibrous texture; similar orange-yellow colour to the cap but slightly paler; no ring (cortina veil lost early). As seen in Cortinarius orellanus field photography.',
 'Widely spaced, thick, rust-orange to tawny gills — the wide spacing between gills is distinctive, unlike most gilled mushrooms with crowded gills; the orange colour matches the cap; as seen in Cortinarius orellanus field photography.',
 'The uniform tawny-orange-rust colouration of cap, stipe and gills combined with the dry fibrillose cap surface and notably wide-spaced rusty gills distinguish this from other Cortinarius species. The autumn dry-leaf orange colour creates effective camouflage against the oak leaf litter.',
 'Deadly toxic — orellanine nephrotoxin causing kidney failure with a delayed onset of 1–4 weeks after ingestion; often too late for effective treatment. Among the most dangerous European fungi. Autumn, oak and beech woodland.',
 'Dry deciduous leaf litter under beech and oak on sandy-loam soil.',
 'Open beech-oak forest, dry autumn conditions, warm golden autumn afternoon light, deep fallen leaf carpet.',
 'Autumn leaf pile around the stipe base, a small beetle on the litter.',
 NULL,
 false),

-- ── esp-112 Cortinarius rubellus (mortal) ────────────────────────────────────
('esp-112',
 'Conical to campanulate-umbonate orange-brown to ochre-rust pileus, 3–8 cm; persistently conical even when mature — the cap does not flatten; surface dry, fibrillose, reddish-ochre. As seen in Cortinarius rubellus field photography.',
 'Orange-brown cylindrical solid stipe, 5–10 cm tall, 1–2 cm thick; remnants of an ochre-orange cobweb-like cortina visible as ochre girdle zones on the stipe; no ring. As seen in Cortinarius rubellus field photography.',
 'Ochre-rust moderately spaced gills, as seen in Cortinarius rubellus field photography.',
 'The persistently conical (not flattening even at maturity) cap combined with ochre-rust colour and visible cortina girdle zones on the stipe distinguish this from C.orellanus (which has a flatter cap) and from edible Cortinarius species.',
 'Deadly toxic — same orellanine nephrotoxin as C.orellanus. Found in conifer forest (particularly under spruce and pine), often in wetter, boggier habitats than C.orellanus. Also known as Cortinarius speciosissimus.',
 'Damp conifer needle litter under spruce and pine, often mossy boggy forest floor.',
 'Montane spruce-pine forest, damp mossy conditions, soft autumn light.',
 'Small slug, patch of green moss.',
 NULL,
 false),

-- ── esp-115 Cortinarius splendens (mortal) ───────────────────────────────────
('esp-115',
 'Vivid chrome-yellow to golden-yellow convex pileus, 4–10 cm, broadly flat at maturity; surface viscid (slimy-shiny when wet), smooth, with a bright uniform chrome-yellow that catches the light. As seen in Cortinarius splendens field photography.',
 'Bright yellow stipe, 5–10 cm tall, 1–2 cm thick, with a distinct swollen club-shaped to bulbous base; surface fibrous-silky; chrome-yellow throughout. As seen in Cortinarius splendens field photography.',
 'Vivid chrome-yellow gills becoming slightly rusty as spores mature — the saturated yellow of young gills is brighter than the cap; as seen in Cortinarius splendens field photography.',
 'The intense uniform chrome-yellow colouration of cap, stipe and gills combined with the viscid (wet-shiny) cap surface and the swollen bulbous stipe base distinguish this species. Distinguished from edible yellow Tricholoma species by the viscid cap surface and the bulbous stipe base.',
 'Deadly toxic — contains orellanine. The vivid yellow colouration with viscid cap and bulbous stipe base are key. Dangerous confusion with edible yellow Tricholoma species and other yellow Cortinarius.',
 'Beech and oak leaf litter on calcareous soil.',
 'Beech-oak woodland with calcareous substrate, autumn conditions, warm forest light.',
 'A small autumn moth.',
 NULL,
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- INOCYBACEAE (1 species — mortal)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-119 Inocybe erubescens (mortal) ──────────────────────────────────────
('esp-119',
 'White to cream conical to campanulate pileus, 3–7 cm; surface densely fibrillose (radially silky-fibrous), splitting toward the margin with age; most distinctive: visible reddening of all surfaces — the cap surfaces flush vivid rose-red where handled or damaged; even light contact produces the pinking. As seen in Inocybe erubescens field photography.',
 'White stipe gradually flushing vivid rose-red from the base upward where handled, 4–8 cm tall, 0.8–1.5 cm thick, cylindrical, solid; the reddening on the lower stipe is the single most striking diagnostic visual character. As seen in Inocybe erubescens field photography.',
 'Initially white gills flushing rose-red when damaged — the pink-red staining of the gills from handling or bruising is visible on any mature specimen; as seen in Inocybe erubescens field photography.',
 'The vivid and rapid reddening (flushing rose-red) of all parts when handled or damaged is the single diagnostic feature — no other common small Inocybe reddens so dramatically. Fresh unhandled specimens appear white; touched areas turn bright rose-red within moments. The two-tone white-and-red is the visual signature.',
 'Deadly toxic — very high muscarine levels causing rapid cholinergic crisis (sweating, salivation, bradycardia, death). The reddening is a unique chemical reaction. Found under deciduous trees in warm calcareous areas, spring and summer.',
 'Calcareous soil under deciduous trees, warm well-drained sites.',
 'Open deciduous woodland on calcareous terrain, warm spring-summer conditions, dappled afternoon light.',
 'A small butterfly on a nearby flower.',
 'Show the specimen with visible rose-red flushing at the stipe base and on some gills — the reddening from contact must be apparent in the image; the lower stipe should show pink-red discolouration where it touches the substrate.',
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- HYMENOGASTRACEAE (1 species — mortal)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-122 Galerina marginata (mortal) ──────────────────────────────────────
('esp-122',
 'Small honey-brown to ochre-brown convex pileus, 2–5 cm; surface smooth, hygrophanous — richer brown when wet, paling to honey-ochre when dry; margin finely striate (grooved) when moist. As seen in Galerina marginata field photography.',
 'Slender hollow brown stipe, 3–8 cm tall, 0.5–1 cm thick; a membranous to fibrous ring-zone (annulus) at mid-stipe — brown and fibrous or whitish and membranous; lower stipe distinctly darker brown with silky longitudinal fibres. As seen in Galerina marginata field photography.',
 'Brown to rusty-brown gills, attached to stipe (adnate), moderately crowded; the brown gill colour matching the cap is typical; as seen in Galerina marginata field photography.',
 'The ring-zone on a hollow brown stipe growing in small clusters on dead wood — the combination of small size, honey-brown hygrophanous cap, striate margin, brown gills, and ring-zone on wood is the visual profile. Distinguished from Kuehneromyces mutabilis (edible) by fibrous (not scaly) lower stipe.',
 'Deadly toxic — contains the same amatoxins (alpha-amanitin) as Amanita phalloides at comparable concentrations. Dangerously confused with Kuehneromyces mutabilis (Seta de tocón, edible) and Hypholoma capnoides (edible). Extreme caution for all small brown mushrooms on wood.',
 'Dead conifer or hardwood wood — logs, stumps, buried roots; often on mossy logs.',
 'Conifer forest or mixed woodland, decaying wood substrate, damp moss-covered log, soft forest light.',
 'Small bark beetle, moss on the log surface.',
 'Show a small cluster of 3–5 specimens growing from a section of dead mossy log or stump; the ring-zone on the stipe must be visible; growth must be on wood, not terrestrial.',
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- GANODERMATACEAE (iconic)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-126 Ganoderma lucidum / Reishi (no_comestible / icónico) ─────────────
('esp-126',
 'Fan-shaped to kidney-shaped bracket, 10–30 cm wide; surface lacquered with a deep reddish-brown mahogany to chestnut colour with a mirror-like gloss — genuinely appearing as if varnished with reddish lacquer; colour graduating from darker chestnut-mahogany near the attachment point to lighter ochre at the far margin. As seen in Ganoderma lucidum field photography.',
 'Long, lateral, curved stipe, 5–20 cm tall, 1–3 cm wide, attached laterally to wood and often curving upward; same deep reddish-brown lacquered surface as the cap. As seen in Ganoderma lucidum field photography.',
 'Cream to pale brown fine pore surface on the underside — very dense circular pores (4–6 per mm), cream-white when fresh; visible as a pale cream band under the reddish bracket when viewed from the side. As seen in Ganoderma lucidum field photography.',
 'The unmistakable lacquer-glossy deep reddish-mahogany surface of cap and stipe — genuinely looking like polished varnished wood — combined with the lateral stipe attachment to hardwood is completely unique among fungi. No other European species has this deep red lacquered sheen.',
 'Medicinal mushroom, not edible as food (too tough and bitter). Prized in East Asian herbal medicine (Língzhi/Reishi). Saprotrophic on dead hardwood, especially oak. No edible lookalikes.',
 'Decaying hardwood trunk or root — oak or beech bark surface.',
 'Temperate deciduous forest, base or trunk of an oak or beech tree with dead wood, dramatic side lighting to emphasise the lacquer gloss.',
 'A small golden beetle on the wood surface.',
 NULL,
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- POLYPORACEAE (iconic)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-128 Laetiporus sulphureus (bueno / icónico) ─────────────────────────
('esp-128',
 'Large overlapping shelf-like brackets, each 10–50 cm wide; surface vivid egg-yolk yellow to bright orange-yellow, smooth to slightly uneven; multiple brackets overlap in a large shelf or rosette pattern on the host tree, creating a striking mass of vivid yellow-orange. As seen in Laetiporus sulphureus field photography.',
 'No conventional stipe — attached directly to wood at a single lateral point; the base where it joins the tree bark is narrow. As seen in Laetiporus sulphureus field photography.',
 'Bright sulphur-yellow pore surface on the underside of each bracket, giving a dense uniform yellow layer; fine pores matching the vivid colour of the upper surface. As seen in Laetiporus sulphureus field photography.',
 'The bright sulphur-yellow to vivid orange mass of overlapping shelf brackets growing on a tree trunk — one of the most visually striking fungi in European forests; the vivid yellow-orange rosette on dark tree bark is recognisable from a distance.',
 'Edible when young and fresh; older specimens become tough and can cause reactions. Parasite on live and dead oaks and other hardwoods. Common in summer. Cannot be confused with any dangerous species.',
 'Living or dead hardwood trunk — oak, cherry, yew; growing 1–4 metres up the trunk.',
 'Open deciduous forest, large oak or cherry tree trunk, summer strong sunlight creating vivid colour contrast.',
 'A small woodpecker in the background, bark beetles on the tree surface.',
 'Show the bracket growing 1–2 metres up a large dark tree trunk; camera angle looking slightly upward to show the brackets attached to bark; multiple overlapping brackets of varying sizes.',
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- MERIPILACEAE (1 species — excelente)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-133 Grifola frondosa / Maitake (excelente) ───────────────────────────
('esp-133',
 'Mass of multiple overlapping fan-shaped to tongue-shaped greyish-brown pilei, each 2–7 cm wide, forming a large rosette up to 40 cm overall; individual caps smooth to finely fibrous, grey-brown to mouse-grey. As seen in Grifola frondosa field photography.',
 'Branching white-cream stipe system from a single basal point, each branch supporting one or more caps; the branching structure from a single base is diagnostic. As seen in Grifola frondosa field photography.',
 'White fine pore surface on the underside of each cap, clearly contrasting with the grey-brown cap surface above. As seen in Grifola frondosa field photography.',
 'The large many-tongued rosette of grey-brown caps all arising from a single basal branching structure — like a giant grey-brown floral bouquet — growing at the base of an oak; no single cap dominates; the overall mass form and the white pore underside contrasting with grey-brown cap are the diagnostic characters.',
 'Excellent edible, highly prized in Japanese cuisine (Maitake = dancing mushroom). Grows at the base of old oaks and chestnuts. Prized for medicinal properties in East Asian tradition.',
 'Base of a large old oak or chestnut tree, buried roots emerging from soil.',
 'Old-growth oak or chestnut forest, base of a very large tree, autumn conditions, soft forest light.',
 'A large forest beetle at the base.',
 'Show the entire rosette mass growing from the base of an oak tree — the tree base and roots must be visible; the full multi-cap rosette (not just one cap) should dominate the frame.',
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- SPARASSIDACEAE (1 species — excelente)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-134 Sparassis crispa (excelente) ─────────────────────────────────────
('esp-134',
 'Entire fruiting body is a large compact cauliflower-like mass of flattened, wavy, lobed branches, 20–50 cm overall; cream-white to pale ochre-yellow when fresh; the texture resembles closely packed egg-noodles or brain coral — densely packed flat curly lobes filling the entire structure. As seen in Sparassis crispa field photography.',
 'Thick, deeply rooted, white-cream central base, 5–15 cm, from which all wavy lobes arise; the base merges directly into the mass of lobes above; partially buried or attached to pine roots. As seen in Sparassis crispa field photography.',
 'The smooth to finely wrinkled surface of each flattened lobe is the fertile surface; cream-white, covering the entire complex mass uniformly. As seen in Sparassis crispa field photography.',
 'The giant cauliflower-like mass of flat wavy cream lobes — unlike any other European fungus; the overall form instantly resembles a cauliflower or a pile of egg noodles; cream-white to pale ochre. This distinctive form is completely unmistakable.',
 'Excellent edible — one of Europe''s most distinctive mushrooms. Grows at the base of pine trees, often appearing for several consecutive years at the same spot. No toxic lookalikes.',
 'Base of old Scots pine, attached to buried roots or the stump base.',
 'Scots pine forest (pinar), autumn conditions, the large white mass at the base of a tall dark pine trunk.',
 'A pine bark beetle on the nearby trunk, fallen pine needles around the base.',
 'Show the entire cauliflower-like mass as the main subject, with the pine trunk visible behind it; the full extent of the wavy lobe mass should be in frame; camera at ground level.',
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- AGARICACEAE (5 species)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-158 Agaricus campestris (excelente) ──────────────────────────────────
('esp-158',
 'White to pale cream convex pileus, 5–12 cm, smooth to finely fibrillose; colour white, sometimes becoming faintly brownish-scaled toward the centre in mature specimens; margin inrolled when young. As seen in Agaricus campestris field photography.',
 'White cylindrical solid stipe, 3–7 cm tall, 1.5–3 cm thick, with a simple fragile single membranous ring at mid-stipe; ring thin and easily lost; stipe surface smooth and white above and below the ring. As seen in Agaricus campestris field photography.',
 'Deep pink to vivid magenta-pink gills becoming chocolate-brown with spore maturity — never white gills; the initial vivid deep-pink gill colour is the primary diagnostic and must be shown prominently; as seen in Agaricus campestris field photography.',
 'The deep pink to vivid magenta-pink gills (visible when the cap margin is tilted up) are the absolute diagnostic character — a white-capped mushroom in open grassland with vivid pink gills. No other common white grassland mushroom has pink gills. Distinguished from Amanita species by pink gills (not white), ring (not volva), and grassland habitat.',
 'Excellent edible — the wild field mushroom, ancestor of cultivated Agaricus bisporus. Grows in open grassland, meadows; never in forest. Distinct pleasant mushroom smell. Distinguished from toxic Agaricus xanthodermus by no yellow staining at base and pleasant (not ink-like) smell.',
 'Short green grass, open meadow or pasture.',
 'Open grassy meadow or agricultural field, bright open sky light (no forest), late summer-autumn.',
 'A grasshopper on a nearby grass stem.',
 'Show the cap from a slight angle to reveal the vivid pink gills visible at the margin, or show one specimen tilted to reveal pink gills; the grassland habitat with short grass must be clear; no forest trees in frame.',
 false),

-- ── esp-161 Agaricus augustus (excelente) ────────────────────────────────────
('esp-161',
 'Large impressive convex to broadly flat pileus, 10–25 cm; densely covered in dark reddish-brown fibrillose scales on a pale yellow-ochre background — creating a distinctive two-tone pattern; cap centre darkest (almost chocolate), scales radiating outward, becoming sparser toward the margin. As seen in Agaricus augustus field photography.',
 'White to cream robust stipe, 8–18 cm tall, 2–4 cm thick, with a large drooping double-ringed white membranous skirt (annulus) hanging prominently below mid-stipe; below the ring the stipe surface has brownish fibrous scales matching the cap. As seen in Agaricus augustus field photography.',
 'Pink gills becoming chocolate-brown at spore maturity; as seen in Agaricus augustus field photography.',
 'The large, stately form with the distinctive two-tone scaly cap (dark chocolate-brown scales on pale ochre background) and the prominent large drooping double ring are the defining visual characters. The most ornate and impressive Agaricus species — large size and elaborate scale pattern.',
 'Excellent edible with distinctive pleasant almond odour. Flesh yellows slightly at the stipe base when cut. Found in parks, pine forest edges, path borders.',
 'Rich soil at forest edges, pine forest clearings, park lawns.',
 'Mixed forest edge or park setting, summer-autumn conditions, warm afternoon light.',
 'A small butterfly on a nearby plant.',
 NULL,
 false),

-- ── esp-162 Lepiota cristata (mortal) ────────────────────────────────────────
('esp-162',
 'Small white pileus, 2–6 cm, convex to flat-umbonate; background white with a dark reddish-brown umbo (central bump) surrounded by concentric rings of flattened reddish-brown fibrillose scales radiating outward — creating a distinctive bull''s-eye or target-ring pattern with a dark centre; scales becoming sparser toward the white margin. As seen in Lepiota cristata field photography.',
 'Slender white to cream stipe, 3–7 cm tall, 0.4–1 cm thick, hollow; a small fragile white ring near mid-stipe. As seen in Lepiota cristata field photography.',
 'White crowded free gills; as seen in Lepiota cristata field photography.',
 'The distinctive concentric ring pattern of reddish-brown scales on a white background — a target or bull''s-eye design — with a dark reddish central umbo; much smaller and more slender than Macrolepiota procera, with scales arranged in concentric rings rather than random patches.',
 'Deadly toxic — contains amatoxins. Strong unpleasant rubbery or petroleum-like odour (distinguishing character). Small size (under 7 cm cap) and the concentric scale pattern distinguish it from edible Lepiota and Macrolepiota species. Found in woodlands, gardens, path edges.',
 'Rich soil in woodland paths, gardens, compost areas.',
 'Woodland floor or garden border, damp conditions, soft diffuse light.',
 'Small ground beetle.',
 NULL,
 false),

-- ── esp-163 Macrolepiota procera (excelente) ─────────────────────────────────
('esp-163',
 'Very large pileus, 15–40 cm when fully open; convex then broadly flat with a prominent dark brown central umbo; background cream-white to pale ochre with large irregular dark brown flattened fibrillose scales — creating a snakeskin-like pattern radiating from the dark centre toward the margin. As seen in Macrolepiota procera field photography.',
 'Very long slender stipe, 15–30 cm tall, 1–2 cm thick; characteristically patterned with a snakeskin-like brown banding or marbling on a pale cream background; with a large double-edged moveable ring that slides freely up and down the stipe — this moveable ring is a key diagnostic feature. As seen in Macrolepiota procera field photography.',
 'White free crowded gills, as seen in Macrolepiota procera field photography.',
 'The extremely long snakeskin-patterned stipe with the distinctive freely moveable double ring combined with the very large parasol-shaped cap with snakeskin-scale patterning makes this one of the most visually distinctive European mushrooms. The great height (often 30–40 cm total) and parasol shape are defining.',
 'Excellent edible when fully cooked (cap only; stipe too tough). Distinguished from toxic Lepiota species by very large size (15–40 cm cap) and snakeskin-patterned stipe. The moveable ring is diagnostic. Found in forest edges and clearings.',
 'Soil at forest edges, open mixed woodland, path edges, often in partial shade.',
 'Open deciduous forest edge or large woodland clearing, bright dappled afternoon light, tall grass or bracken at the sides.',
 'A grasshopper on a nearby plant, a small beetle.',
 'Show the full height of the mushroom — from the base of the very long stipe at ground level to the fully-open parasol cap in the upper frame; the great height is the defining visual character; camera very close to the ground looking slightly upward past the snakeskin stipe.',
 false),

-- ── esp-165 Leucoagaricus leucothites (precaución) ───────────────────────────
('esp-165',
 'White to pale cream smooth convex to broadly flat pileus, 5–12 cm; surface smooth, dry, satiny-white; no distinctive features — plain and clean white. As seen in Leucoagaricus leucothites field photography.',
 'White to cream slender cylindrical stipe, 5–10 cm tall, 1–2 cm thick, with a membranous white ring at mid-stipe; smooth surface. As seen in Leucoagaricus leucothites field photography.',
 'White free gills — unlike Agaricus campestris (which has vivid pink gills), these gills are uniformly white; as seen in Leucoagaricus leucothites field photography.',
 'An entirely white mushroom (white cap, white stipe, white gills, white ring) growing in open grassland or gardens — the plain all-white appearance with white gills (not pink) and no volva at the base places it as slenderer than Amanita species but difficult to identify for non-experts.',
 'Precaución — can cause gastrointestinal problems. White gills eliminate Agaricus as the identification. White smooth cap with ring in grassland superficially resembles some white Amanita species but lacks a basal volva. Best avoided by non-experts.',
 'Short grass, meadow, park lawn, garden soil.',
 'Open grassland, garden or park with short grass, autumn, open sky light.',
 'A grassland beetle.',
 NULL,
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- PSATHYRELLACEAE (1 species — iconic)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-166 Coprinus comatus (bueno / icónico) ───────────────────────────────
('esp-166',
 'Elongated cylindrical to oval, shaggy white cap, 4–8 cm tall and 3–5 cm wide, covered in recurved white to pale brownish shaggy fibrous scales — looking like a shaggy white fur muff or a lawyers'' wig; margin showing the very beginning of black ink-like autodigestion (deliquescence) at the very edge in mature specimens. As seen in Coprinus comatus field photography.',
 'Tall, slender, hollow, bright white stipe, 10–20 cm tall, 1–2 cm thick, smooth and shining white; with a small moveable white ring that slides freely toward the base. As seen in Coprinus comatus field photography.',
 'White to pale pink gills (show young fresh stage before autodigestion); as seen in Coprinus comatus field photography.',
 'The distinctive shaggy-scaled elongated white drumstick shape and the early black-ink autodigestion at the very margin edges are absolutely unique — no other fungus has this shape and behaviour. The tall slender white stipe with the shaggy white cylindrical cap is unmistakable.',
 'Good edible when very young (before any black appears). Must be eaten immediately after harvest as autodigestion proceeds within hours. Found on rich organic soil, lawns, path edges. No toxic lookalikes.',
 'Rich organic soil, freshly turned earth, lawns, path edges, disturbed ground.',
 'Open grassland or garden, disturbed soil, autumn conditions, clear open light.',
 'A small earthworm partially visible in the nearby soil.',
 'Show a young specimen with the elongated white cylindrical cap and shaggy scales clearly rendered; show just the early stage of black ink-drip at the very margin edge — not fully melted; the tall slender white stipe must be fully visible.',
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- HERICIACEAE (1 species — excelente)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-173 Hericium coralloides (excelente) ─────────────────────────────────
('esp-173',
 'Branching coral-like structure growing from wood, 10–30 cm overall; white to cream; the fruiting body is a many-branched coral form with short downward-pointing white teeth clustered at the branch tips — 0.5–1.5 cm spines at the end of each branch. As seen in Hericium coralloides field photography.',
 'No conventional stipe — the entire structure is a branching coral arising from a single basal attachment point on hardwood. As seen in Hericium coralloides field photography.',
 'The short white downward-pointing spines at the branch tips are the fertile surface; each branch tip bristles with a cluster of short white teeth; as seen in Hericium coralloides field photography.',
 'The branched coral structure with short clustered spines at branch tips is the key differentiator from H.erinaceus (a single pendant mass of long cascading spines with no branching). H.coralloides has branching white coral arms; H.erinaceus has a dense waterfall of long spines from a single attachment point.',
 'Excellent edible, rare and protected in many European countries. Grows on dead beech and oak. Spectacular and unmistakable on dead hardwood.',
 'Dead standing or fallen beech or oak, large hardwood log or trunk.',
 'Old-growth deciduous forest, large dead beech or oak trunk, deep forest, dramatic side lighting.',
 'Small forest beetle on the bark below.',
 'Show the entire coral-form branching structure growing from hardwood; the branching arms and the short clustered spines at the branch tips must be clearly rendered; do not show as a simple undifferentiated mass without branching.',
 false),

-- ═══════════════════════════════════════════════════════════════════════════
-- MARASMIACEAE (1 species — excelente)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── esp-190 Marasmius oreades (excelente) ────────────────────────────────────
('esp-190',
 'Small pale beige to tan-ochre convex pileus, 2–5 cm, with a persistent central umbo (bump) that remains even in mature specimens; colour deeper tan-ochre when wet, fading to pale cream-beige when dry (hygrophanous); surface smooth, matte. As seen in Marasmius oreades field photography.',
 'Very slender, wiry, pale cream stipe, 4–8 cm tall, 0.2–0.4 cm thick — notably elastic and tough (does not break when bent); this tough, wiry quality distinguishes it from brittle-stemmed toxic grassland species; lower stipe slightly darker cream or pale tan. As seen in Marasmius oreades field photography.',
 'White to cream widely-spaced gills — the wide spacing between gills is notable and diagnostic; white colour clearly distinct from the beige cap; as seen in Marasmius oreades field photography.',
 'The wiry, elastic, pale stipe in open grassland combined with the small beige cap with central umbo and widely-spaced white gills; and above all the characteristic growth in fairy ring arcs or circles in short grass — the ring pattern of multiple specimens in lawn or meadow is the single most recognisable character.',
 'Excellent edible, delicious dried. The wiry tough stipe (does not break when bent) and intensely sweet almond-like smell are the key field characters. White Clitocybe dealbata (deadly) grows in similar habitats but has a white cap and crowded decurrent gills. Growing in rings throughout spring to autumn.',
 'Short grass in meadow, lawn, or grazed pasture.',
 'Open grassy meadow or lawn, showing a clear fairy ring arc in short grass, summer-autumn, bright open daylight.',
 'A small meadow butterfly on a grass blade, a grasshopper.',
 'Show a small fairy ring arc of 5–8 specimens in short grass — the ring or arc growth pattern in lawn or meadow must be the defining composition element; show the full arc from a slightly elevated ground-level angle.',
 false)

ON CONFLICT (species_id) DO UPDATE SET
  cap_description          = EXCLUDED.cap_description,
  stipe_description        = EXCLUDED.stipe_description,
  hymenium_description     = EXCLUDED.hymenium_description,
  extra_morphology_visual  = EXCLUDED.extra_morphology_visual,
  extra_morphology_gemini  = EXCLUDED.extra_morphology_gemini,
  preferred_substrate      = EXCLUDED.preferred_substrate,
  habitat_context          = EXCLUDED.habitat_context,
  associated_fauna         = EXCLUDED.associated_fauna,
  composition_notes        = EXCLUDED.composition_notes,
  is_validated             = EXCLUDED.is_validated,
  updated_at               = CURRENT_TIMESTAMP;
