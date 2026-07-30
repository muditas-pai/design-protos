#!/usr/bin/env node
/* ============================================================================
   The analysis pass. Reads every annotation and prints a REVIEW PACKET.

   Capture is deliberately thin — a verdict and a sentence. Everything else
   (the principle, the "instead", the rule slug that clusters recurrences) is
   an inference over the whole corpus, which is a job for an LLM reading this
   packet, not for a person typing into a form while looking at one screen.

   So this script does the arithmetic and the validation, and hands the
   judgement to whoever reads it. It writes nothing.

     node scripts/annotations.mjs            review packet
     node scripts/annotations.mjs --check    validation only, exits non-zero
     node scripts/annotations.mjs --json     machine-readable, for an LLM pass
   ========================================================================== */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'src')
const CHECK = process.argv.includes('--check')
const JSON_OUT = process.argv.includes('--json')
const c = { dim: '\x1b[2m', b: '\x1b[1m', r: '\x1b[31m', y: '\x1b[33m', g: '\x1b[32m', off: '\x1b[0m' }

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    statSync(p).isDirectory() ? walk(p, out) : out.push(p)
  }
  return out
}

const files = walk(SRC).filter((f) => f.endsWith('.annotations.json'))
const annotations = files.flatMap((f) => {
  const rel = relative(SRC, f)
  const surface = rel.startsWith('explorations/')
    ? rel.replace(/^explorations\//, '').replace(/\/[^/]+\.annotations\.json$/, '')
    : rel.replace(/^canonical\/(components|screens)\//, '').replace(/\.annotations\.json$/, '')
  return JSON.parse(readFileSync(f, 'utf8')).map((a) => ({ ...a, file: rel, surface }))
})

/* ── validate: only what capture is actually responsible for ─────────────── */
const SUBJECTIVE = /\b(clean|clear|nice|premium|cluttered|ugly|pretty|elegant|better|worse|feels?|looks? (good|bad|off))\b/i
const OBSERVABLE = /\d|#[0-9a-f]{3,8}|['"“«]|\bpx\b|\bcqw\b|%/i

const bad = []
const soft = []
for (const a of annotations) {
  const where = a.at?.region ?? a.at?.selector ?? a.anchor ?? '?'
  const at = `${a.file} → ${where}`
  if (!a.at && !a.anchor) bad.push(`${at}: no locator`)
  if (!['good', 'bad'].includes(a.verdict)) bad.push(`${at}: verdict must be good or bad`)
  if (!a.note?.trim()) bad.push(`${at}: no note`)
  else if (SUBJECTIVE.test(a.note) && !OBSERVABLE.test(a.note))
    soft.push(`${at}: judgement with nothing observable — "${a.note.slice(0, 56)}…"`)
  if (a.route) soft.push(`${at}: has a "route" field; capture records evidence, this pass proposes the home`)
}

const enriched = annotations.filter((a) => a.rule)
const raw = annotations.filter((a) => !a.rule)

if (JSON_OUT) {
  console.log(JSON.stringify({ annotations, needsInference: raw, invalid: bad, warnings: soft }, null, 2))
  process.exit(bad.length ? 1 : 0)
}

console.log(`\n${c.b}Annotations${c.off}  ${annotations.length} across ${files.length} files\n`)

if (bad.length) {
  console.log(`${c.r}${c.b}Invalid (${bad.length})${c.off}`)
  bad.forEach((p) => console.log(`  ${c.r}✗${c.off} ${p}`))
  console.log()
}
if (soft.length) {
  console.log(`${c.y}${c.b}Soft (${soft.length})${c.off}`)
  soft.forEach((w) => console.log(`  ${c.y}!${c.off} ${w}`))
  console.log()
}
if (!bad.length && !soft.length) console.log(`${c.g}✓ every annotation is usable evidence${c.off}\n`)
if (CHECK) process.exit(bad.length ? 1 : 0)

/* ── the packet ──────────────────────────────────────────────────────────── */
console.log(`${c.b}Review packet${c.off}  ${c.dim}proposals only — this script writes nothing${c.off}\n`)

if (raw.length) {
  console.log(`  ${c.b}Awaiting inference (${raw.length})${c.off}  ${c.dim}captured, not yet clustered into a rule${c.off}`)
  raw.forEach((a) => {
    const where = a.at?.region ? `${a.at.region} › ${a.at.tag}` : (a.at?.tag ?? a.anchor)
    console.log(`    ${a.verdict === 'good' ? c.g + '✓' : c.r + '!'}${c.off} ${c.dim}${a.surface} · ${where}${c.off}`)
    console.log(`      ${a.note}`)
  })
  console.log(`\n    ${c.dim}→ an LLM pass reads these, proposes rule / why / instead, and you rule on it${c.off}\n`)
}

const byRule = {}
for (const a of enriched) (byRule[a.rule] ??= []).push(a)

if (Object.keys(byRule).length) {
  console.log(`  ${c.b}Clustered${c.off}\n`)
  Object.entries(byRule)
    .map(([rule, g]) => ({ rule, g, surfaces: new Set(g.map((a) => a.surface)) }))
    .sort((a, b) => b.g.length - a.g.length || a.rule.localeCompare(b.rule))
    .forEach(({ rule, g, surfaces }) => {
      const good = g.filter((a) => a.verdict === 'good').length
      const ready = surfaces.size >= 2 && good < g.length
      console.log(`    ${c.b}${rule}${c.off}  ${g.length} sighting${g.length > 1 ? 's' : ''} · ${surfaces.size} surface${surfaces.size > 1 ? 's' : ''} · ${good} good / ${g.length - good} bad`)
      console.log(`      ${c.dim}${[...surfaces].join(', ')}${c.off}`)
      console.log(ready
        ? `      ${c.g}→ promote?${c.off} fired on more than one surface, with a ❌ and a ✅`
        : good === g.length
          ? `      ${c.dim}→ exemplar candidate — all sightings good${c.off}`
          : `      ${c.dim}→ hold — one surface only${c.off}`)
      console.log()
    })
}

const surfaces = new Set(annotations.map((a) => a.surface))
console.log(`${c.b}Coverage${c.off}  ${annotations.length} notes over ${surfaces.size} surfaces`)
console.log(`  ${c.dim}${[...surfaces].sort().join(', ')}${c.off}\n`)
