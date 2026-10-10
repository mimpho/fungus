/**
 * scripts/generate-css-vars.ts
 *
 * Reads shared/colors.ts and rewrites two generated blocks in src/styles.css:
 *
 *   1. Inside :root { } — between [generated:css-vars:start] and [generated:css-vars:end]
 *   2. The [data-theme="light"] { } block — between [generated:light-theme:start] and [generated:light-theme:end]
 *
 * Run manually or as a prebuild step:
 *   npx tsx scripts/generate-css-vars.ts
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { darkPalette, lightPalette, Fixed } from '../shared/colors.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const STYLES_PATH = path.resolve(__dirname, '../src/styles.css')

const ROOT_START   = '/* [generated:css-vars:start] */'
const ROOT_END     = '/* [generated:css-vars:end] */'
const LIGHT_START  = '/* [generated:light-theme:start] */'
const LIGHT_END    = '/* [generated:light-theme:end] */'

function buildRootVars(): string {
  const d = darkPalette
  return [
    ROOT_START,
    '',
    '  /* ── Generated from shared/colors.ts — do not edit manually ── */',
    '',
    '  /* Fixed tokens — same in both themes */',
    `  --color-positive:     ${Fixed.positive};`,
    `  --color-green-f:      ${Fixed.greenF};`,
    `  --color-bar:          ${Fixed.bar};`,
    `  --color-coffee:       ${Fixed.coffee};`,
    `  --color-danger:       ${Fixed.danger};`,
    `  --color-warning:      ${Fixed.warning};`,
    '',
    '  /* Dark theme (default) */',
    `  --color-bg-deep:      ${d.backgroundDeep};`,
    `  --color-bg:           ${d.background};`,
    `  --color-modal:        ${d.backgroundPanel};`,
    `  --color-cream:        ${d.textPrimary};`,
    `  --color-muted:        ${d.textSecondary};`,
    `  --color-coffee-light: ${d.accentLight};`,
    `  --color-search-bg:    ${d.searchBg};`,
    `  --glass-white:        ${d.surfaceSubtle};`,
    `  --glass-warm:         ${d.surfaceWarm};`,
    `  --glass-warm-border:  ${d.borderWarm};`,
    `  --glass-olive:        ${d.surface};`,
    `  --glass-olive-80:     ${d.surfaceHeavy};`,
    `  --modal-overlay:      ${d.overlay};`,
    `  --border-default:     ${d.border};`,
    `  --border-accent:      ${d.borderAccent};`,
    `  --gradient-a:         ${d.gradientA};`,
    `  --gradient-b:         ${d.gradientB};`,
    `  --gradient-c:         ${d.gradientC};`,
    '',
    `  ${ROOT_END}`,
  ].join('\n')
}

function buildLightTheme(): string {
  const l = lightPalette
  return [
    LIGHT_START,
    '[data-theme="light"] {',
    `  --color-bg-deep:      ${l.backgroundDeep};`,
    `  --color-bg:           ${l.background};`,
    `  --color-modal:        ${l.backgroundPanel};`,
    `  --color-cream:        ${l.textPrimary};`,
    `  --color-muted:        ${l.textSecondary};`,
    `  --color-coffee:       ${l.accent};`,
    `  --color-coffee-light: ${l.accentLight};`,
    `  --color-search-bg:    ${l.searchBg};`,
    `  --glass-white:        ${l.surfaceSubtle};`,
    `  --glass-warm:         ${l.surfaceWarm};`,
    `  --glass-warm-border:  ${l.borderWarm};`,
    `  --glass-olive:        ${l.surface};`,
    `  --glass-olive-80:     ${l.surfaceHeavy};`,
    `  --modal-overlay:      ${l.overlay};`,
    `  --border-default:     ${l.border};`,
    `  --border-accent:      ${l.borderAccent};`,
    `  --gradient-a:         ${l.gradientA};`,
    `  --gradient-b:         ${l.gradientB};`,
    `  --gradient-c:         ${l.gradientC};`,
    '}',
    LIGHT_END,
  ].join('\n')
}

function replaceBlock(css: string, start: string, end: string, content: string): string {
  const si = css.indexOf(start)
  const ei = css.indexOf(end)
  if (si !== -1 && ei !== -1) {
    return css.slice(0, si) + content + css.slice(ei + end.length)
  }
  // Block not found — append before closing of first :root if it's the root block,
  // otherwise append at end of file.
  if (start === ROOT_START) {
    const rootClose = css.indexOf('\n}')
    if (rootClose !== -1) {
      return css.slice(0, rootClose) + '\n  ' + content + css.slice(rootClose)
    }
  }
  return css + '\n' + content + '\n'
}

function run() {
  let css = fs.readFileSync(STYLES_PATH, 'utf8')
  css = replaceBlock(css, ROOT_START,  ROOT_END,  buildRootVars())
  css = replaceBlock(css, LIGHT_START, LIGHT_END, buildLightTheme())
  fs.writeFileSync(STYLES_PATH, css, 'utf8')
  console.log('✅  src/styles.css updated from shared/colors.ts')
}

run()
