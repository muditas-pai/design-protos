# Get most out of Pro: outline animation handoff

Live demo with copyable CSS under each variant:
https://muditas-pai.github.io/design-protos/explorations/mani/dashboard/crazy8s.html

## What this is

An animated light that orbits the outline of the "Get most out of Pro" button.
Four candidates are on the demo page:

1. **Comet tail**: bright Brand Blue head with a fading tail, one lap every 3s.
2. **Silk tail**: thinner band, tail stretches half the lap, slower (4.6s).
3. **Beam glow**: thicker 3px band with a soft outer bloom (drop-shadow).
4. **Comet + living gradient**: variant 1 plus the button fill drifting slowly (7s ease loop).

## Technique (all variants)

- The light is a `conic-gradient` painted on an absolutely positioned
  `::before` pseudo-element on a wrapper around the button.
- It is masked to a thin band using a two-layer mask with
  `mask-composite: exclude` (keep the `-webkit-` prefixed lines).
- Rotation animates a registered custom property `--a` declared with
  `@property`, so the gradient angle tweens smoothly.
- The band follows the border radius exactly. No SVG, no JS.

## Shape coupling

The pseudo-element sits at `inset: -2px` with `padding: 2px` (band
thickness) and `border-radius: button radius + 2px`. Button radius is 4px,
so the ring radius is 6px (7px for Beam glow, which uses a 3px inset).
If the button radius ever changes, change the ring radius with it.

## Markup contract

Wrap the existing button in a positioned wrapper and put the ring class on
the wrapper. Nothing inside the button DOM changes.

```html
<div class="wrap comet">
  <button class="pro-btn">...</button>
</div>
```

```css
.wrap { position: relative; display: inline-flex; }
```

## Color tokens

- Brand Blue `#005EFF`
- Tint `#E6EFFF`
- Translucent stops `rgba(0,94,255,alpha)`

No other hues. Per the design system, growth surfaces stay on Brand Blue.

## Support and fallback

- Works: Chrome/Edge 85+, Safari 16.4+, Firefox 128+.
- Older browsers show no ring at all; the button renders normally.
- Paint-only animation on a small layer, no layout work. Negligible cost.

## Motion safety

Disable the animation under reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  .comet::before { animation: none; }
}
```

## Full CSS per variant

On the demo page, expand "CSS for devs" under each variant and hit Copy.
Each snippet is self-contained.
