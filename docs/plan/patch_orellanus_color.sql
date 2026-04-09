-- PATCH: Cortinarius orellanus — fix cap color (too brown) and gill color (too yellow)
--
-- Problems:
--   cap_description: "tawny" (yellow-brown) + "autumn leaves" (brown) pulled the render brown
--   hymenium_description: "rust-orange to tawny" — model resolves "tawny" as yellow
--
-- Fix: anchor cap to unambiguous ORANGE analogies; anchor gills to "matching the cap exactly"
-- Safe to re-run.

UPDATE mushroom_visual_prompts SET
  cap_description = 'Vivid rust-orange to brick-red pileus, 4–9 cm, convex to broadly flat; surface smooth and silky-matte like polished terracotta tile or fired red clay, uniformly even — colour is a saturated copper-orange, like iron oxide or a terracotta flower pot; emphatically orange, warm and vivid. As seen in Cortinarius orellanus field photography.',
  hymenium_description = 'Widely spaced, thick gills — the conspicuously wide spacing between gills is the most distinctive field character, far more open than typical gilled mushrooms; gill colour deep rust-brown to auburn-orange, the same warm copper-brown as the cap surface — NOT yellow, matching the cap colour exactly. As seen in Cortinarius orellanus field photography.',
  associated_fauna = 'A small woodlouse or pill bug slowly moving through the dry leaf litter at the stipe base; alternatively a tiny ground beetle crawling along the sandy soil — always on the forest floor, at ground level, never on the cap.',
  updated_at = NOW()
WHERE species_id = 'esp-111';
