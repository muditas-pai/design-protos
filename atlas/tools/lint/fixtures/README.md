# Fixtures

Two hand-built screens that pin the linter's behaviour. Both load
`../../design-system/pai.css`, so `adopted_design_system` is true for both and
everything in them is in scope (spec §6).

## clean.html

A screen that is correct by construction, started from `design-system/template.html`.
It proves the linter does not cry wolf: **zero errors**, and every finding it does
produce is a proposal for a property the system is silent about (padding, margin,
radius, gap, max-width, display, transition duration). It exercises a heading from
the type ramp, body copy, brand-coloured text, a primary and a secondary button, a
badge, an elevation shadow, a published gradient, and laid-out structure with
padding and radius. It contains no colour literal at all — every colour is a token
reference or a token utility class.

It also carries the trap that broke an earlier spike, twice: the type ramp and the
gradients are published **only as Tailwind class names**, so there is no
`--font-size-heading-2xl` and no `--gradient-01` to reference. `font-size: 1.5rem`
*is* `heading-2xl` and must pass; `class="bg-gradient-01"` is the only way to reach
a published gradient. Two more traps are dodged rather than planted, and both are
deliberate: `template.html`'s inline `background:#F5F5F7` is a 2-unit near-miss for
`--bg-tertiary` and is replaced by `bg-bg-tertiary`, and its font `<link>` loads
weights 700/800 that the scale does not publish (design-system issue #6), trimmed
here to 400/500/600.

**A failure here means the linter is over-blocking.** If clean.html reports an
error, the linter is wrong until proven otherwise — work out which published
member it failed to recognise before touching the fixture.

## violations.html

One deliberate instance of every rule, each on its own line, each with a comment
naming the rule and its expected bucket. It covers the three error families from
spec §4 (a token redefined to a different value, a colour near-miss, a literal
equal to a token, an off-scale font-size and font-weight, a dangling `var()`, a
Tailwind arbitrary value, a `/NN` alpha on a token, and a `text-*` utility
out-specifying a component class's colour) and, just as importantly, the
non-errors that must never be reported as errors: a monospace font stack, a custom
keyframe animation, an ad-hoc gradient and an off-system shadow are **extensions**
because §1 forbids blocking when no replacement can be named; an odd radius and an
odd padding are **proposals** because the system publishes no vocabulary for them;
`p-4` is a proposal with `origin: "adopted"` against `p-[18px]`'s `"invented"`; and
a token redefined to its *own* value, plus a colourless `text-*` utility sitting
beside a component class, are not findings at all.

**A failure here means the linter is under-detecting or mis-bucketing.** A missing
error is a rule that does not work; an extension or proposal reported as an error
is a rule that will get the linter ignored, which spec §8 says is the worse
failure of the two.
