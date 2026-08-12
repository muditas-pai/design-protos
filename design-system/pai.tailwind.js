/* ============================================================================
   presentations.ai — Tailwind tokens for HTML prototypes
   ----------------------------------------------------------------------------
   Replaced with the atlas config on 12 Aug 2026, and then pinned: 93 theme
   values that BOTH configs defined were put back to what this file said before,
   because a utility is a contract with the markup that already uses it. The
   atlas config points shadow-elevation-02 at --elevation-02, whose ladder has
   four layers where the old literal had three, so 91 uses of that one utility
   across the protos would have gained a shadow. Caught by the screenshot pass,
   not by reading.

   New keys atlas adds — the spacing, radius, icon and layer scales — arrive
   unpinned, because nothing here used them.
   ----------------------------------------------------------------------------
   Translated from config/tailwind/pai.tailwind.config.js (the production app).
   Include AFTER the Tailwind Play CDN so utility classes resolve to brand
   tokens, e.g.  bg-bg-primary-inverted · text-text-secondary ·
   shadow-elevation-02 · text-body-base-medium · rounded.

     <script src="https://cdn.tailwindcss.com"></script>
     <script src="pai.tailwind.js"></script>

   theme() references in the source were resolved to literal values so this
   works standalone in the browser.
   ========================================================================== */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        // brand (app) ramp. Lightness steps evened out in OKLCH: the old
        // 400/500/600 sat within about three L points of each other. Anchors
        // marked "held" are exact brand values and must never change.
        "app-50": "#E6EFFF",   // held, brand tint
        "app-75": "#D6E5FF",
        "app-100": "#BFD5FC",
        "app-200": "#94BBFF",
        "app-300": "#69A0FF",
        "app-400": "#3C82FF",
        "app-500": "#005EFF",  // held, Brand Blue
        "app-600": "#0055ED",  // held, brand companion (= text-brand / bg-brand)
        "app-650": "#004DD1",
        "app-700": "#0043B8",  // held, brand companion (hover)
        "app-800": "#043485",
        "app-900": "#00225C",  // held

        // green / success ramp. Tailwind's stock green runs lighter and more
        // saturated than the other hues at the same step (the fluorescent
        // look), so each step's perceived lightness is pinned to the
        // red/blue/purple mean. Hue unchanged; 950 is Tailwind's original.
        "green-50": "var(--green-50)",  "green-100": "var(--green-100)", "green-200": "var(--green-200)",
        "green-300": "var(--green-300)", "green-400": "var(--green-400)", "green-500": "var(--green-500)",
        "green-600": "var(--green-600)", "green-700": "var(--green-700)", "green-800": "var(--green-800)",
        "green-900": "var(--green-900)", "green-950": "var(--green-950)",
        // success-* is an alias of the same ramp, as in the app
        "success-50": "var(--green-50)",  "success-100": "var(--green-100)", "success-200": "var(--green-200)",
        "success-300": "var(--green-300)", "success-400": "var(--green-400)", "success-500": "var(--green-500)",
        "success-600": "var(--green-600)", "success-700": "var(--green-700)", "success-800": "var(--green-800)",
        "success-900": "var(--green-900)", "success-950": "var(--green-950)",

        // shadow primitives. Every elevation composes from these, which is why
        // they live with the colours rather than in boxShadow.
        // identity palette — for telling one person from another, never a state
        "identity-indigo-tint": "var(--identity-indigo-tint)",   "identity-indigo-ink": "var(--identity-indigo-ink)",
        "identity-violet-tint": "var(--identity-violet-tint)",   "identity-violet-ink": "var(--identity-violet-ink)",
        "identity-purple-tint": "var(--identity-purple-tint)",   "identity-purple-ink": "var(--identity-purple-ink)",
        "identity-fuchsia-tint": "var(--identity-fuchsia-tint)", "identity-fuchsia-ink": "var(--identity-fuchsia-ink)",
        "identity-rose-tint": "var(--identity-rose-tint)",       "identity-rose-ink": "var(--identity-rose-ink)",
        "identity-orange-tint": "var(--identity-orange-tint)",   "identity-orange-ink": "var(--identity-orange-ink)",
        "identity-amber-tint": "var(--identity-amber-tint)",     "identity-amber-ink": "var(--identity-amber-ink)",
        "identity-lime-tint": "var(--identity-lime-tint)",       "identity-lime-ink": "var(--identity-lime-ink)",
        "identity-emerald-tint": "var(--identity-emerald-tint)", "identity-emerald-ink": "var(--identity-emerald-ink)",
        "identity-teal-tint": "var(--identity-teal-tint)",       "identity-teal-ink": "var(--identity-teal-ink)",
        "identity-cyan-tint": "var(--identity-cyan-tint)",       "identity-cyan-ink": "var(--identity-cyan-ink)",
        "identity-blue-tint": "var(--identity-blue-tint)",       "identity-blue-ink": "var(--identity-blue-ink)",

        "drop-1": "rgba(9, 15, 21, 0.06)",
        "drop-2": "rgba(9, 15, 21, 0.09)",
        "drop-3": "rgba(9, 15, 21, 0.20)",
        "inner-1": "rgba(255, 255, 255, 0.80)",
        "inner-2": "rgba(255, 255, 255, 0)",

        // neutrals (gray = production scale)
        "gray-25": "var(--gray-25)", "gray-50": "var(--gray-50)", "gray-75": "var(--gray-75)",
        "gray-100": "var(--gray-100)", "gray-200": "var(--gray-200)", "gray-300": "var(--gray-300)",
        "gray-400": "var(--gray-400)", "gray-500": "var(--gray-500)", "gray-600": "var(--gray-600)",
        "gray-700": "var(--gray-700)", "gray-800": "var(--gray-800)", "gray-850": "var(--gray-850)",
        "gray-900": "#161616",

        // backgrounds
        "bg-primary": "#ffffff",
        "bg-default-primary": "#ffffff",
        "bg-primary-inverted": "#0A1925",
        "bg-primary-inverted-hover": "#23303B",
        "bg-secondary": "#FAFAFA",
        "bg-default-secondary": "#FAFAFA",
        "bg-secondary-inverted": "#1C3550",
        "bg-tertiary": "#F5F5F5",
        "bg-default-tertiary": "#F5F5F5",
        // One near-white step between primary (#FFF) and secondary (#FAFAFA):
        // subtle is the dashboard main column and top nav. Exact Figma JAS'26
        // raw fill. bg-muted was removed 10 Aug 2026 — see pai.css.
        "bg-subtle": "#FCFCFC",
        "bg-tertiary-inverted": "#284B71",
        "bg-quaternary": "#E5E5E5",
        "bg-elevated": "#FFFFFF",
        "bg-elevated-hover": "rgba(11, 15, 20, 0.08)",
        "bg-elevation-hover": "rgba(26, 26, 26, 0.12)",
        "bg-brand": "#0055ED",
        "bg-brand-hover": "#0043B8",
        "bg-brand-pressed": "#043485",
        "bg-brand-selected": "rgba(0, 85, 237, 0.12)",
        "bg-brand-inverted": "#E6EFFF",
        "bg-danger": "#DC2626",
        "bg-danger-hover": "#B91C1C",
        "bg-danger-pressed": "#991B1B",
        "bg-danger-inverted": "#FEF2F2",
        "bg-warning": "#F0B100",
        "bg-warning-inverted": "#FEFCE8",
        "bg-success": "#018C3C",
        "bg-success-inverted": "#EFF9F2",
        "bg-info": "#0C4BFF",
        "bg-info-inverted": "#E8F7FF",
        "bg-blackout": "#171717",
        "bg-scrim": "var(--bg-scrim)",
        "bg-default-alpha-800": "rgba(255, 255, 255, 0.8)",

        // text
        "text-primary": "#171717",
        "text-secondary": "#525252",
        "text-tertiary": "#a3a3a3",
        "text-brand": "#0055ED",
        "text-brand-hover": "#043485",
        "text-brand-secondary": "#005EFF",
        "text-inverted-primary": "#ffffff",
        "text-inverted-secondary": "rgba(255, 255, 255, 0.6)",
        "text-danger-primary": "#b91c1c",
        "text-danger-hover": "#991b1b",
        "text-danger-secondary": "#dc2626",
        "text-warning-primary": "#a16207",
        "text-warning-secondary": "#ca8a04",
        "text-success-primary": "#017735",
        "text-success-secondary": "#018C3C",
        "text-white": "#ffffff",
        "text-neutral": "#0A0A0A",

        // borders
        "border-primary": "rgba(11, 15, 20, 0.20)",
        "border-primary-inverted": "#0A1925",
        "border-secondary": "rgba(11, 15, 20, 0.09)",
        "border-secondary-inverted": "rgba(10, 25, 37, 0.48)",
        "border-tertiary": "rgba(11, 15, 20, 0.06)",
        "border-quaternary": "#D4D4D4",
        "border-brand": "#0055ED",
        "border-brand-secondary": "#94BBFF",
        "border-danger": "#DC2626",
        "border-danger-secondary": "#FECACA",
        "border-warning-secondary": "#FEF08A",
        "border-success-secondary": "#BDE7CB",
        "border-info-secondary": "#BFDBFE",
        "border-neutral": "#0A0A0A",

        "alpha-light-50": "rgba(26, 26, 26, 0.06)",
        "alpha-light-100": "rgba(26, 26, 26, 0.09)",

        // ---- stock palettes, pinned to the exact ramps the app aliases -------
        // The app replaces Tailwind's whole palette, so two families are not what
        // their name suggests: gray is Tailwind NEUTRAL and amber is Tailwind
        // YELLOW. Pinned here as literals so a proto cannot silently pick up a
        // different ramp from the CDN default, and so a future Tailwind release
        // cannot drift them.
        // gray   // = tailwind neutral
        "gray-950": "#0a0a0a",
        // amber   // = tailwind yellow
        "amber-50": "var(--amber-50)", "amber-100": "var(--amber-100)", "amber-200": "var(--amber-200)",
        "amber-300": "var(--amber-300)", "amber-400": "var(--amber-400)", "amber-500": "var(--amber-500)",
        "amber-600": "var(--amber-600)", "amber-700": "var(--amber-700)", "amber-800": "var(--amber-800)",
        "amber-900": "var(--amber-900)", "amber-950": "var(--amber-950)",
        // violet
        "violet-50": "#f5f3ff", "violet-100": "#ede9fe", "violet-200": "#ddd6fe",
        "violet-300": "#c4b5fd", "violet-400": "#a78bfa", "violet-500": "#8b5cf6",
        "violet-600": "#7c3aed", "violet-700": "#6d28d9", "violet-800": "#5b21b6",
        "violet-900": "#4c1d95", "violet-950": "#2e1065",
        // purple
        "purple-50": "#faf5ff", "purple-100": "#f3e8ff", "purple-200": "#e9d5ff",
        "purple-300": "#d8b4fe", "purple-400": "#c084fc", "purple-500": "#a855f7",
        "purple-600": "#9333ea", "purple-700": "#7e22ce", "purple-800": "#6b21a8",
        "purple-900": "#581c87", "purple-950": "#3b0764",
        // red
        "red-50": "var(--red-50)", "red-100": "var(--red-100)", "red-200": "var(--red-200)",
        "red-300": "var(--red-300)", "red-400": "var(--red-400)", "red-500": "var(--red-500)",
        "red-600": "var(--red-600)", "red-700": "var(--red-700)", "red-800": "var(--red-800)",
        "red-900": "var(--red-900)", "red-950": "var(--red-950)",
        // indigo
        "indigo-50": "#eef2ff", "indigo-100": "#e0e7ff", "indigo-200": "#c7d2fe",
        "indigo-300": "#a5b4fc", "indigo-400": "#818cf8", "indigo-500": "#6366f1",
        "indigo-600": "#4f46e5", "indigo-700": "#4338ca", "indigo-800": "#3730a3",
        "indigo-900": "#312e81", "indigo-950": "#1e1b4b",
        // blue
        "blue-50": "var(--blue-50)", "blue-100": "var(--blue-100)", "blue-200": "var(--blue-200)",
        "blue-300": "var(--blue-300)", "blue-400": "var(--blue-400)", "blue-500": "var(--blue-500)",
        "blue-600": "var(--blue-600)", "blue-700": "var(--blue-700)", "blue-800": "var(--blue-800)",
        "blue-900": "var(--blue-900)", "blue-950": "var(--blue-950)",
        // orange
        "orange-50": "#fff7ed", "orange-100": "#ffedd5", "orange-200": "#fed7aa",
        "orange-300": "#fdba74", "orange-400": "#fb923c", "orange-500": "#f97316",
        "orange-600": "#ea580c", "orange-700": "#c2410c", "orange-800": "#9a3412",
        "orange-900": "#7c2d12", "orange-950": "#431407",

        // plan / share accents
        "ppt-50": "#FFF3F0", "ppt-100": "#FAE7DF", "ppt-500": "#D04423", "ppt-600": "#C43E1C",
        "gold-50": "#FEF5DF", "gold-100": "#FEF2D4", "gold-500": "#FBBE28",
        "linkedin-500": "#0077B5", "facebook-500": "#1877F2", "twitter-500": "#1DA1F2",
        "email-500": "#FF6C5F", "copylink-500": "#FF6A00",
        "darkblue-500": "#193351", "darkblue-600": "#0F233A",
        "profile-app-500": "#0284C7",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        serif: ["var(--font-serif)"],
        poppins: ["Poppins", "serif"],
        robotoCondensed: ['"Roboto Condensed"', "sans-serif"],
      },
      fontSize: {
        "2xs": "0.813rem",
        "heading-4xl": ["2.25rem", { lineHeight: "normal", letterSpacing: "-0.0075em", fontWeight: "400" }],
        "heading-3xl": ["2rem", { lineHeight: "normal", letterSpacing: "-0.0075em", fontWeight: "400" }],
        "heading-2xl": ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "400" }],
        "heading-xl": ["1.25rem", { lineHeight: "normal", fontWeight: "500" }],
        "heading-lg": ["1.125rem", { lineHeight: "normal", fontWeight: "500" }],
        "heading-base": ["1rem", { lineHeight: "normal", fontWeight: "500" }],
        "heading-sm": ["0.875rem", { lineHeight: "normal", fontWeight: "500" }],
        "body-xl-regular": ["1.125rem", { lineHeight: "1.55", fontWeight: "400" }],
        "body-xl-medium": ["1.125rem", { lineHeight: "1.55", fontWeight: "500" }],
        "body-lg-regular": ["1rem", { lineHeight: "1.5", fontWeight: "400" }],
        "body-lg-medium": ["1rem", { lineHeight: "1.5", fontWeight: "500" }],
        "body-lg-semibold": ["1rem", { lineHeight: "1.5", fontWeight: "600" }],
        "body-base-regular": ["0.875rem", { lineHeight: "1.43", fontWeight: "400" }],
        "body-base-medium": ["0.875rem", { lineHeight: "1.43", fontWeight: "500" }],
        "body-base-semibold": ["0.875rem", { lineHeight: "1.43", fontWeight: "600" }],
        "body-sm-regular": ["0.75rem", { lineHeight: "1.33", fontWeight: "400" }],
        "body-sm-medium": ["0.75rem", { lineHeight: "1.33", fontWeight: "500" }],
        "body-xs-regular": ["0.625rem", { lineHeight: "normal", fontWeight: "400" }],
        "body-xs-medium": ["0.625rem", { lineHeight: "normal", fontWeight: "500" }],
      },
      boxShadow: {
        // Four depths and three focus rings. `shadow-` is Tailwind's own
        // namespace, so a token named --elevation-01 is reached as
        // shadow-elevation-01 — the prefix is the utility's, not the token's.
        "elevation-01": "0 0 0 0.5px rgba(26, 26, 26, 0.01), 0 1px 2px 0 rgba(38, 38, 38, 0.05)",
        "elevation-02": "0 0 0 1px rgba(255,255,255,0.80) inset, 0 0 0 1px rgba(11,15,20,0.09), 0 1px 2px 0 rgba(11,15,20,0.09)",
        "elevation-03": "0 0 0 1px rgba(255,255,255,0.80) inset, 0 0 0 1px rgba(26,26,26,0.09), 0 1px 2px 0 rgba(26,26,26,0.09), 0 4px 6px 0 rgba(26,26,26,0.09), 0 24px 40px -16px rgba(26,26,26,0.09)",
        "elevation-04": "0 0 0 1.5px rgba(255,255,255,0.30) inset, 0 0 0 0.5px rgba(11,15,20,0.09), 0 1px 2px 0 rgba(26,26,26,0.06), 0 4px 6px 0 rgba(26,26,26,0.06), 0 40px 40px -24px rgba(26,26,26,0.06), 0 56px 56px -32px rgba(26,26,26,0.09), 0 24px 40px 0 rgba(26,26,26,0.06)",
        // composed here rather than read from a --focus-* token: Tailwind writes
        // this string into --tw-shadow ON THE ELEMENT, so the two semantics
        // resolve in the element's own scope and a dark region that re-declares
        // them gets a ring that follows. A composite declared at :root would
        // have baked in the light page's colours.
        "focus-field": "0 0 0 1px var(--border-primary-inverted)",
        "focus-surface": "0 0 0 1px var(--bg-elevated), 0 0 0 3px var(--border-primary-inverted)",
        "focus-image": "0 0 0 2px var(--bg-elevated), 0 0 0 4px var(--border-primary-inverted)",
        "inner-glow": "var(--shadow-inner-glow)",
        // numeric aliases the app also exposes
        "01": "0 0 0 0.5px rgba(26,26,26,0.01), 0 1px 2px 0 rgba(38,38,38,0.05)",
        "02": "0 0 0 1px rgba(255,255,255,0.80) inset, 0 0 0 1px rgba(11,15,20,0.09), 0 1px 2px 0 rgba(11,15,20,0.09)",
        // legacy numeric aliases; stock values, distinct from the ladder above
        "03": "0 1px 0 0 rgba(0,0,0,0.05)",
        "04": "0 1px 2px 0 rgba(0,0,0,0.08), 0 4px 10px 0 rgba(0,0,0,0.06)",
        "pd-bottom": "0 1px 0 rgba(0,0,0,0.05)",
        // colour primitives re-exposed as shadow utilities, as the app does
        "drop-1": "rgba(9,15,21,0.06)",
        "drop-2": "rgba(9,15,21,0.09)",
        "drop-3": "rgba(9,15,21,0.20)",
        "inner-1": "rgba(255,255,255,0.80)",
        "inner-2": "rgba(255,255,255,0)",
      },
      keyframes: {
        // Fast-editor loader (FastEditorLoader.jsx): brand-dot pulse and panel entrance.
        // The conic-gradient streak border animates a registered @property and cannot
        // live here; it stays in that component's own <style> block.
        "fel-step-pulse": {
          "0%, 100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(0,85,237,0.50)" },
          "50%": { transform: "scale(0.78)", boxShadow: "0 0 0 5px rgba(0,85,237,0)" },
        },
        "fel-panel-in": {
          from: { opacity: "0", transform: "translate(100%, -50%)" },
          to: { opacity: "1", transform: "translate(0, -50%)" },
        },
      },
      animation: {
        "fel-step-pulse": "fel-step-pulse 1.1s ease-in-out infinite",
        "fel-panel-in": "fel-panel-in 380ms cubic-bezier(0.32, 0.72, 0, 1) forwards",
      },
      backgroundImage: {
        "gradient-01": "linear-gradient(275.68deg, #3A8EE6 0%, #C03AE7 100%)",
        "gradient-02": "linear-gradient(274.01deg, #7732D3 0%, #2563EB 105.01%)",
        "gradient-03": "linear-gradient(275.68deg, rgba(58,142,230,0.2) 0%, rgba(192,58,231,0.2) 100%)",
        "gradient-04": "linear-gradient(85.02deg, #EBD5F6 0%, #C8EBED 45.25%, #FFFFFF 85.41%, #FFE8F6 100%)",
        "gradient-05": "linear-gradient(275.68deg, rgba(58,142,230,0.1) 0%, rgba(192,58,231,0.1) 100%)",
        "gradient-07": "linear-gradient(90deg, #AE49F6 0%, #2941F5 100%)",
        "gradient-brand-02": "linear-gradient(274deg, #7732D3 0%, #2563EB 105.01%)",
        "gradient-basic": "linear-gradient(101deg, #6F7378 8.29%, #CDCDCD 55.21%, #4F5054 96.51%)",
        "gradient-06": "linear-gradient(229deg, rgba(63,225,176,0.10) -2.97%, rgba(0,179,244,0.10) 34.14%, rgba(3,176,244,0.10) 35.51%, rgba(85,97,233,0.10) 71.8%, rgba(117,66,229,0.10) 88.43%)",
        // checkerboard behind transparent images
        "transparent-image-gradient": "repeating-linear-gradient(45deg, #000000 25%, transparent 25%, transparent 75%, #000000 0%, #000000), repeating-linear-gradient(45deg, #ffc107 25%, #ffffff 25%, #ffffff 75%, #000000 75%, #000000)",
        "gradient-brand-01": "linear-gradient(90deg, #2ABFFF -58.35%, #3E5DF7 22.24%, #9C4CFF 75.71%, #E14CFF 99.69%)",
        "gradient-brand-03": "radial-gradient(145.58% 149.6% at 29.59% -25%, #C2D8FF 0%, #5291FF 31.73%, #0055ED 76.78%, #00225C 100%)",
        "gradient-pro": "linear-gradient(101deg, #652CD1 8.29%, #3362E9 91.71%)",
        "gradient-gold": "linear-gradient(90deg, #FFDB82 0%, #FCB813 100%)",
        "gradient-primary-button": "linear-gradient(180deg, #1C3550 0%, #0A1925 100%)",
        "gradient-primary-danger-button": "linear-gradient(180deg, #DC2626 0%, #B91C1C 100%)",
        "skeleton-gradient": "linear-gradient(110deg, #ececec 8%, #f4f4f4 18%, #ececec 33%)",
      },
    },
    // Rounding. Read off the Figma design system and the AMJ '26 handoff, Aug 2026.
    // Deliberately NOT under `extend`: a scale that leaves the steps above it in
    // place is not a scale. Replacing the key is what makes `rounded-3xl` and up
    // stop resolving, which is the point — the corners are sharper than most
    // product UI and that is the most recognisable thing about the surface.
    //
    // Every value here is identical to the stock Tailwind step of the same name, so
    // nothing already on the scale moves by a pixel. What changes is what is gone.
    //
    //   none   0     structural edges — card rows, table cells, full-bleed sections
    //   sm     2     tiny — swatches, thumbnails, anything under ~40px
    //   DEFAULT 4    the default — buttons, inputs, cards, panels, nav rows
    //   md     6     floating chrome — inline menus, toolbars, filmstrip, segmented control
    //   lg     8     large floating containers — the modal shell
    //   xl    12     the prompt card, and hero surfaces that carry the page
    //   2xl   16     the largest content cards — billing, pricing, plan
    //   full         pills — badges, chips, avatars, toggles
    //
    // `2xl` is the ceiling. Above it there is only `full`: 24px and up showed up
    // only on progress bars, skeletons and other things meant to read as pills.
    borderRadius: {
      none: "0px",
      sm: "var(--rounded-sm)",
      DEFAULT: "var(--rounded-base)",
      md: "var(--rounded-md)",
      lg: "var(--rounded-lg)",
      xl: "var(--rounded-xl)",
      "2xl": "var(--rounded-2xl)",
      full: "var(--rounded-full)",
    },
  },
};
