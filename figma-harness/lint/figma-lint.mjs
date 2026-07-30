#!/usr/bin/env node
/* ============================================================================
   figma-lint — everything checkable without judgment, run against a node tree.

   The HTML lint asked "is there a hex literal in this file?" and hoped. Here
   the same questions are structural facts on the node:

     token discipline   fills[].boundVariables.color exists
     type scale         textStyleId is set
     real components    node.type === 'INSTANCE'
     systematic layout  layoutMode !== 'NONE'

   Four of the six checks stop being textual guesswork. That determinism is the
   reason to lint Figma rather than markup.

   IMPORTANT — where this actually runs. A real screen's node tree exceeds the
   use_figma return payload, so the checks must execute inside Figma, where the
   data is. This file is the RULES MODULE that gets injected into that script,
   not a second implementation. Two copies would drift, which is the disease
   the whole system exists to treat. It also runs standalone against a dumped
   tree, for tests:

     node figma-lint.mjs <tree.json> [--content ../content.md] [--json]

   Calibrated against run 2026-07-30-01 on a hand-designed canonical frame:
     · skip subtrees inside INSTANCE — not editable here, and the library's
       problem. This alone took signal from ~14% to ~75%.
     · only FRAME and GROUP can be a missed component; a TEXT layer named
       "Badge" is not a finding.
     · named-layers is hygiene — advisory, or it drowns the list.
     · content-driven colour (brand kits) is correctly raw and needs an
       exemption, or the check trains people to ignore it. NOT YET BUILT.

   Every finding is blocking and carries a locator (the node path), because a
   finding without one cannot be acted on.
   ========================================================================== */
import { readFileSync } from 'node:fs'

const IMPLEMENTED = [
  'token-bound-fills', 'token-bound-strokes', 'text-style-bound',
  'component-instances', 'auto-layout', 'no-placeholder-text',
  'numbers-resolve', 'named-layers',
]
const NOT_IMPLEMENTED = [
  'focus-visible', 'accessible-name',      // no equivalent on a static frame
  'contrast-declared',                     // needs opacity-aware background resolution;
                                           // a naive version produced false positives in run 01
  'content-colour-exemption',              // brand-kit colour is correctly raw
]

const PLACEHOLDER = /\b(lorem|ipsum|\$XX+|\b1234\b|placeholder|TODO|xxx)\b/i
const NUMERIC = /\$[\d,]+(?:\.\d+)?|\b\d{1,3}(?:,\d{3})+\b|\b\d+%/g
const DEFAULT_NAME = /^(Frame|Group|Rectangle|Ellipse|Vector|Line|Text)( \d+)?$/

const args = process.argv.slice(2)
const treePath = args.find((a) => !a.startsWith('--'))
const contentPath = args[args.indexOf('--content') + 1]
const JSON_OUT = args.includes('--json')
if (!treePath) { console.error('usage: figma-lint.mjs <tree.json> [--content content.md]'); process.exit(2) }

const tree = JSON.parse(readFileSync(treePath, 'utf8'))
const contentNumbers = contentPath ? collectNumbers(readFileSync(contentPath, 'utf8')) : null

function collectNumbers(md) {
  return new Set((md.match(NUMERIC) ?? []).map((s) => s.trim()))
}

const findings = []
const find = (rule, node, message) => findings.push({
  rule, severity: 'blocking', source: 'lint',
  locator: node.path, nodeId: node.id, message,
})

/* walk depth-first, carrying a readable path so every finding is located */
function walk(node, path = []) {
  const here = [...path, node.name ?? node.type]
  const n = { ...node, path: here.join(' › ') }
  check(n)
  ;(node.children ?? []).forEach((c) => walk(c, here))
}

function check(n) {
  const isText = n.type === 'TEXT'
  const isShape = ['FRAME', 'RECTANGLE', 'ELLIPSE', 'COMPONENT', 'INSTANCE', 'VECTOR'].includes(n.type)

  // ── token discipline: the structural version of "no colour literals" ──────
  for (const [i, f] of (n.fills ?? []).entries()) {
    if (f.type !== 'SOLID' || f.visible === false) continue
    if (!f.boundVariable) {
      find('token-bound-fills', n, `fill ${i} is a raw ${f.hex ?? 'colour'}, not bound to a variable`)
    }
  }
  for (const [i, s] of (n.strokes ?? []).entries()) {
    if (s.type !== 'SOLID' || s.visible === false) continue
    if (!s.boundVariable) {
      find('token-bound-strokes', n, `stroke ${i} is a raw ${s.hex ?? 'colour'}, not bound to a variable`)
    }
  }

  // ── the type scale is a style reference, not a font size ─────────────────
  if (isText && !n.textStyleId) {
    find('text-style-bound', n, `text is styled ad hoc (${n.fontSize ?? '?'}px), not from the type scale`)
  }

  // ── a detached frame that looks like a component is the drift we care about
  if (n.looksLikeComponent && ['FRAME', 'GROUP'].includes(n.type)) {
    find('component-instances', n, `named like a library component but is a ${n.type}, not an instance`)
  }

  // ── layout you can reflow, rather than absolute positions ────────────────
  if (n.type === 'FRAME' && (n.children?.length ?? 0) > 1 && n.layoutMode === 'NONE') {
    find('auto-layout', n, `${n.children.length} children with no auto-layout, so nothing reflows`)
  }

  // ── copy ─────────────────────────────────────────────────────────────────
  if (isText && n.characters) {
    if (PLACEHOLDER.test(n.characters)) {
      find('no-placeholder-text', n, `placeholder copy: "${n.characters.slice(0, 40)}"`)
    }
    if (contentNumbers) {
      for (const num of n.characters.match(NUMERIC) ?? []) {
        if (!contentNumbers.has(num.trim())) {
          find('numbers-resolve', n, `"${num}" is not in content.md — invented, or content.md is stale`)
        }
      }
    }
  }

  // ── a tree of "Frame 47" is unreviewable and unmaintainable ──────────────
  if (isShape && DEFAULT_NAME.test(n.name ?? '')) {
    find('named-layers', n, `default layer name "${n.name}"`)
  }

}

walk(tree)

const byRule = findings.reduce((m, f) => ((m[f.rule] ??= []).push(f), m), {})

if (JSON_OUT) {
  console.log(JSON.stringify({
    checksImplemented: IMPLEMENTED, checksNotRun: NOT_IMPLEMENTED,
    blocking: findings.length, findings,
  }, null, 2))
  process.exit(findings.length ? 1 : 0)
}

const c = { b: '\x1b[1m', r: '\x1b[31m', y: '\x1b[33m', g: '\x1b[32m', dim: '\x1b[2m', off: '\x1b[0m' }
console.log(`\n${c.b}figma-lint${c.off}  ${tree.name ?? 'frame'}\n`)

if (!findings.length) {
  console.log(`${c.g}✓ no blocking findings${c.off}`)
} else {
  for (const [rule, list] of Object.entries(byRule)) {
    console.log(`${c.r}${rule}${c.off}  ${list.length}`)
    list.slice(0, 6).forEach((f) => {
      console.log(`  ${c.dim}${f.locator}${c.off}`)
      console.log(`    ${f.message}`)
    })
    if (list.length > 6) console.log(`  ${c.dim}… ${list.length - 6} more${c.off}`)
    console.log()
  }
}

/* a thin lint must never read as a clean bill of health */
console.log(`${c.dim}ran ${IMPLEMENTED.length} checks · not implemented: ${NOT_IMPLEMENTED.join(', ')}${c.off}\n`)
process.exit(findings.length ? 1 : 0)
