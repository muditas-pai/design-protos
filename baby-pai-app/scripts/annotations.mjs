#!/usr/bin/env node
/* ============================================================================
   The analysis pass. Reads every annotation, validates it, clusters by rule
   slug across surfaces, and prints a REVIEW PACKET.

   It proposes. It never decides — no file is written, nothing is promoted.
   That separation is the point: capture records evidence, this groups it, and
   a person rules on it.

     node scripts/annotations.mjs            review packet
     node scripts/annotations.mjs --check    validation only, exits non-zero
   ========================================================================== */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'src')
const CHECK_ONLY = process.argv.includes('--check')

const c = { dim: '\x1b[2m', b: '\x1b[1m', r: '\x1b[31m', y: '\x1b[33m', g: '\x1b[32m', off: '\x1b[0m' }

/* ── collect ─────────────────────────────────────────────────────────────── */
function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

const files = walk(SRC).filter((f) => f.endsWith('.annotations.json'))
const jsx = walk(SRC).filter((f) => f.endsWith('.jsx'))
const declaredAnchors = new Set(
  jsx.flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/data-annotate="([^"]+)"/g)].map((m) => m[1])),
)

const annotations = files.flatMap((f) => {
  const rel = relative(SRC, f)
  const surface = rel.startsWith('explorations/')
    ? rel.replace(/^explorations\//, '').replace(/\/[^/]+\.annotations\.json$/, '')
    : 'canonical'
  return JSON.parse(readFileSync(f, 'utf8')).map((a) => ({ ...a, file: rel, surface }))
})

/* ── validate ────────────────────────────────────────────────────────────── */
// the observability bar: a note that names a judgement but no observable thing
const SUBJECTIVE = /\b(clean|clear|nice|premium|cluttered|ugly|pretty|elegant|better|worse|feels?|looks? (good|bad|off))\b/i
const OBSERVABLE = /\d|#[0-9a-f]{3,8}|['"«]|\bpx\b|\bcqw\b|%/i

const problems = []
const warn = []
for (const a of annotations) {
  const at = `${a.file} → ${a.anchor}`
  if (!a.anchor) problems.push(`${at}: no anchor`)
  else if (!declaredAnchors.has(a.anchor)) problems.push(`${at}: anchor is not declared by any data-annotate`)
  if (!['good', 'bad'].includes(a.verdict)) problems.push(`${at}: verdict must be good or bad`)
  if (a.verdict === 'bad' && !a.instead) problems.push(`${at}: a "bad" needs an "instead", or it reaches the judge but never the builder`)
  if (!a.rule) problems.push(`${at}: no rule slug, so it can never be counted`)
  if (!a.note) problems.push(`${at}: no note`)
  else if (SUBJECTIVE.test(a.note) && !OBSERVABLE.test(a.note))
    warn.push(`${at}: note reads as a judgement with nothing observable in it — "${a.note.slice(0, 60)}…"`)
  if (a.route) warn.push(`${at}: has a "route" field. Capture records evidence; this pass proposes the home.`)
}

// anchors that exist but nobody has judged
const judged = new Set(annotations.map((a) => a.anchor))
const unjudged = [...declaredAnchors].filter((a) => !judged.has(a)).sort()

/* ── report ──────────────────────────────────────────────────────────────── */
console.log(`\n${c.b}Annotations${c.off}  ${annotations.length} across ${files.length} files\n`)

if (problems.length) {
  console.log(`${c.r}${c.b}Invalid (${problems.length})${c.off}`)
  problems.forEach((p) => console.log(`  ${c.r}✗${c.off} ${p}`))
  console.log()
}
if (warn.length) {
  console.log(`${c.y}${c.b}Warnings (${warn.length})${c.off}`)
  warn.forEach((w) => console.log(`  ${c.y}!${c.off} ${w}`))
  console.log()
}
if (!problems.length && !warn.length) console.log(`${c.g}✓ all annotations valid${c.off}\n`)

if (CHECK_ONLY) process.exit(problems.length ? 1 : 0)

/* cluster by rule slug — recurrence across SURFACES is what promotes */
const byRule = {}
for (const a of annotations) (byRule[a.rule] ??= []).push(a)

const MECHANICAL = /#[0-9a-f]{3,8}|\b\d+(px|cqw|%)\b|\b\d+ (filled|items?|cards?|options?|buttons?|colours?|steps?)\b|^\d+$/i
function proposeHome(group) {
  const text = group.map((a) => `${a.note} ${a.instead ?? ''}`).join(' ')
  if (MECHANICAL.test(text)) return 'lint check'
  if (group.some((a) => a.surface !== 'canonical' && a.verdict === 'bad')) return 'style rule'
  return 'style rule'
}

console.log(`${c.b}Review packet${c.off}  ${c.dim}proposals only — nothing is written${c.off}\n`)

Object.entries(byRule)
  .map(([rule, group]) => ({ rule, group, surfaces: new Set(group.map((a) => a.surface)) }))
  .sort((a, b) => b.group.length - a.group.length || a.rule.localeCompare(b.rule))
  .forEach(({ rule, group, surfaces }) => {
    const good = group.filter((a) => a.verdict === 'good').length
    const bad = group.length - good
    const ready = surfaces.size >= 2 && bad >= 1
    console.log(`  ${c.b}${rule}${c.off}`)
    console.log(`    ${group.length} sighting${group.length > 1 ? 's' : ''} · ${surfaces.size} surface${surfaces.size > 1 ? 's' : ''} · ${good} good / ${bad} bad`)
    console.log(`    ${c.dim}${[...surfaces].join(', ')}${c.off}`)
    if (ready) {
      console.log(`    ${c.g}→ promote?${c.off} ${proposeHome(group)}   ${c.dim}(fired on more than one surface, with a ❌ and a ✅)${c.off}`)
    } else if (bad === 0) {
      console.log(`    ${c.dim}→ exemplar candidate — all sightings are good${c.off}`)
    } else {
      console.log(`    ${c.dim}→ hold — one surface only, not yet a pattern${c.off}`)
    }
    console.log()
  })

console.log(`${c.b}Coverage${c.off}`)
console.log(`  ${judged.size}/${declaredAnchors.size} anchored elements judged`)
if (unjudged.length) {
  console.log(`  ${c.dim}unjudged: ${unjudged.join(', ')}${c.off}`)
  console.log(`  ${c.y}!${c.off} patchy coverage reads as approval — these have never been looked at`)
}
console.log()
