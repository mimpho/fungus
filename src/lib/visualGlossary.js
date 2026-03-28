/**
 * visualGlossary.js
 *
 * Translates mycological technical terms into plain visual language
 * that image generation models (Imagen 4, Gemini Image) understand.
 *
 * Applied to DNA Visual fields before building the Layer 1 morphological
 * prefix and the Gemini scene prompt. This prevents the model from
 * hallucinating morphological features based on unfamiliar terminology.
 *
 * Rules:
 * - Ordered from most specific to most general to avoid partial matches.
 * - "fibrillose scales" is intentionally NOT replaced — those are real
 *   visible scales (e.g. Agaricus augustus, Armillaria mellea).
 * - Add new entries here as new problematic terms are discovered.
 */

const GLOSSARY = [
  // ── Cap / surface texture ──────────────────────────────────────────────────
  // "fibrillose scales" → real scales, keep as-is (must come before "fibrillose")
  // "fibrillose" alone → smooth surface with invisible fine fibers → silky-matte
  [/\bfibrillose\b(?!\s+scales)/gi, 'smooth silky-matte'],

  // ── Morphological terms ────────────────────────────────────────────────────
  [/\bcampanulate\b/gi,          'bell-shaped'],
  [/\bconvex\s+pileus\b/gi,      'dome-shaped cap'],
  [/\bpileus\b/gi,               'cap'],
  [/\bumbo\b/gi,                 'central raised bump'],
  [/\bumbonate\b/gi,             'with a central raised bump'],
  [/\bdecurrent\b/gi,            'running down the stem'],
  [/\badnate\b/gi,               'attached squarely to the stem'],
  [/\bsinuate\b/gi,              'wavy-attached to the stem'],
  [/\bgibbous\b/gi,              'irregular and wavy'],
  [/\bpruinose\b/gi,             'dusted with a fine powdery bloom'],
  [/\btomentose\b/gi,            'covered in dense short fuzzy hairs'],
  [/\bgranular\b(?!\s+texture)/gi, 'covered in fine grainy dots'],
  [/\bviscid\b/gi,               'sticky and glutinous'],
  [/\bhygrophanous\b/gi,         'water-soaked looking when wet, fading when dry'],
  [/\bstriate\b/gi,              'with fine radial lines or grooves'],
  [/\bpubescent\b/gi,            'covered in fine soft hairs'],
  [/\bvelutinous\b/gi,           'velvety-textured'],
  [/\bfloccose\b/gi,             'covered in fluffy cottony tufts'],
  [/\bsubtomentose\b/gi,         'finely fuzzy'],

  // ── Structure names ────────────────────────────────────────────────────────
  [/\bvolva\b/gi,                'sac-like cup at the base of the stem'],
  [/\bcortina\b/gi,              'cobweb-like veil'],
  [/\bannulus\b/gi,              'ring on the stem'],
];

/**
 * Apply the visual glossary to a DNA Visual field string.
 * Returns the string with mycological terms replaced by image-model-friendly equivalents.
 *
 * @param {string|null|undefined} text
 * @returns {string|null|undefined}
 */
export function applyVisualGlossary(text) {
  if (!text) return text;
  return GLOSSARY.reduce(
    (acc, [pattern, replacement]) => acc.replace(pattern, replacement),
    text
  );
}
