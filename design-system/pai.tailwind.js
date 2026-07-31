/* ============================================================================
   presentations.ai — Tailwind tokens for HTML prototypes
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
        "green-50": "#EFF9F2",  "green-100": "#DAF1E2", "green-200": "#BDE7CB",
        "green-300": "#8DD6A6", "green-400": "#47BE70", "green-500": "#00A449",
        "green-600": "#018C3C", "green-700": "#017735", "green-800": "#106131",
        "green-900": "#11512B", "green-950": "#052E16",
        // success-* is an alias of the same ramp, as in the app
        "success-50": "#EFF9F2",  "success-100": "#DAF1E2", "success-200": "#BDE7CB",
        "success-300": "#8DD6A6", "success-400": "#47BE70", "success-500": "#00A449",
        "success-600": "#018C3C", "success-700": "#017735", "success-800": "#106131",
        "success-900": "#11512B", "success-950": "#052E16",

        // shadow primitives. Every elevation composes from these, which is why
        // they live with the colours rather than in boxShadow.
        "drop-1": "rgba(9, 15, 21, 0.06)",
        "drop-2": "rgba(9, 15, 21, 0.09)",
        "drop-3": "rgba(9, 15, 21, 0.20)",
        "inner-1": "rgba(255, 255, 255, 0.80)",
        "inner-2": "rgba(255, 255, 255, 0)",

        // neutrals (gray = production scale)
        "gray-25": "#F6F6F6", "gray-50": "#F4F4F4", "gray-75": "#ECECEC",
        "gray-100": "#E0E0E0", "gray-200": "#C6C6C6", "gray-300": "#A8A8A8",
        "gray-400": "#8D8D8D", "gray-500": "#6F6F6F", "gray-600": "#525252",
        "gray-700": "#393939", "gray-800": "#262626", "gray-850": "#1B1B1B",
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
        // Two near-white surface steps between primary (#FFF) and tertiary
        // (#F5F5F5). Exact Figma JAS'26 raw fills: subtle is the dashboard main
        // column and top nav; muted is the side panel, deliberately one step
        // darker so the panel reads as its own surface.
        "bg-subtle": "#FCFCFC",
        "bg-muted": "#F9F9F9",
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
        "amber-50": "#fefce8", "amber-100": "#fef9c3", "amber-200": "#fef08a",
        "amber-300": "#fde047", "amber-400": "#facc15", "amber-500": "#eab308",
        "amber-600": "#ca8a04", "amber-700": "#a16207", "amber-800": "#854d0e",
        "amber-900": "#713f12", "amber-950": "#422006",
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
        "red-50": "#fef2f2", "red-100": "#fee2e2", "red-200": "#fecaca",
        "red-300": "#fca5a5", "red-400": "#f87171", "red-500": "#ef4444",
        "red-600": "#dc2626", "red-700": "#b91c1c", "red-800": "#991b1b",
        "red-900": "#7f1d1d", "red-950": "#450a0a",
        // indigo
        "indigo-50": "#eef2ff", "indigo-100": "#e0e7ff", "indigo-200": "#c7d2fe",
        "indigo-300": "#a5b4fc", "indigo-400": "#818cf8", "indigo-500": "#6366f1",
        "indigo-600": "#4f46e5", "indigo-700": "#4338ca", "indigo-800": "#3730a3",
        "indigo-900": "#312e81", "indigo-950": "#1e1b4b",
        // blue
        "blue-50": "#eff6ff", "blue-100": "#dbeafe", "blue-200": "#bfdbfe",
        "blue-300": "#93c5fd", "blue-400": "#60a5fa", "blue-500": "#3b82f6",
        "blue-600": "#2563eb", "blue-700": "#1d4ed8", "blue-800": "#1e40af",
        "blue-900": "#1e3a8a", "blue-950": "#172554",
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
        sans: ["Inter", "system-ui", "sans-serif"],
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
        "elevation-01": "0 0 0 0.5px rgba(26, 26, 26, 0.01), 0 1px 2px 0 rgba(38, 38, 38, 0.05)",
        "elevation-02": "0 0 0 1px rgba(255,255,255,0.80) inset, 0 0 0 1px rgba(11,15,20,0.09), 0 1px 2px 0 rgba(11,15,20,0.09)",
        "elevation-03": "0 0 0 1px rgba(255,255,255,0.80) inset, 0 0 0 1px rgba(26,26,26,0.09), 0 1px 2px 0 rgba(26,26,26,0.09), 0 4px 6px 0 rgba(26,26,26,0.09), 0 24px 40px -16px rgba(26,26,26,0.09)",
        "elevation-button": "0 0 0 0.5px rgba(26, 26, 26, 0.09), 0 1px 2px 1px rgba(0, 0, 0, 0.04)",
        "elevation-focused": "0 0 0 1px rgba(26,26,26,0.06), 0 0 0 2px #56A0FF",
        "elevation-input": "0 0 0 1px rgba(11,15,20,0.09), 0 1px 2px 0 rgba(16, 24, 40, 0.05)",
        "elevation-input-focused": "0 0 0 2px rgba(10,25,37,0.48), 0 0 0 1px #0A1925 inset, 0 1px 2px 0 rgba(11,15,20,0.09)",
        "elevation-input-error": "0 0 0 2px rgba(248, 113, 113, 0.40), 0 0 0 1px #FECACA, 0 1px 2px 0 rgba(26, 26, 26, 0.06)",
        "elevation-04": "0 0 0 1.5px rgba(255,255,255,0.30) inset, 0 0 0 0.5px rgba(11,15,20,0.09), 0 1px 2px 0 rgba(26,26,26,0.06), 0 4px 6px 0 rgba(26,26,26,0.06), 0 40px 40px -24px rgba(26,26,26,0.06), 0 56px 56px -32px rgba(26,26,26,0.09), 0 24px 40px 0 rgba(26,26,26,0.06)",
        // Figma effect style 471:2410 ("elevation 4"), stronger than elevation-04
        // and used by the newer dashboard modals. This is the one the cancel-flow
        // protos were transcribing by hand under the name elevation-04.
        // legacy numeric aliases; distinct from elevation-03 / elevation-04
        "03": "0 1px 0 0 rgba(0,0,0,0.05)",
        "04": "0 1px 2px 0 rgba(0,0,0,0.08), 0 4px 10px 0 rgba(0,0,0,0.06)",
        // colour primitives re-exposed as shadow utilities, as the app does
        "drop-1": "rgba(9,15,21,0.06)",
        "drop-2": "rgba(9,15,21,0.09)",
        "drop-3": "rgba(9,15,21,0.20)",
        "inner-1": "rgba(255,255,255,0.80)",
        "inner-2": "rgba(255,255,255,0)",
        "elevation-new-03": "0 0 0 1px rgba(255,255,255,0.80) inset, 0 0 0 1px rgba(26,26,26,0.09), 0 1px 2px 0 rgba(26,26,26,0.09), 0 4px 6px 0 rgba(26,26,26,0.09), 0 24px 40px -16px rgba(26,26,26,0.09)",
        "elevation-05": "0 0 0 0.5px rgba(0,0,0,0.30) inset, 0 0 10px 4px rgba(255,255,255,0.40) inset",
        "elevation-06": "0 1px 2px 0 rgba(16,24,40,0.05)",
        "elevation-pill": "0 2px 6px 0 rgba(11,15,20,0.09), 0 0 0 1px rgba(11,15,20,0.06), 0 0 0 1px rgba(255,255,255,0.80) inset",
        // Figma JAS'26 prompt-card (101:592): elevation-03's drop layers without its inset rim
        "elevation-prompt-card": "0 24px 40px -16px rgba(9,15,21,0.09), 0 4px 6px 0 rgba(9,15,21,0.09), 0 1px 2px 0 rgba(9,15,21,0.09)",
        "elevation-input-hover": "0 0 0 1px #a3a3a3, 0 1px 2px 0 rgba(16,24,40,0.05)",
        "elevation-input-dark": "0 0 0 2.5px rgba(38,38,38,0.55), 0 0 0 0.75px rgba(26,26,26,0.50), 0 1px 2px 0 rgba(16,24,40,0.05)",
        "elevation-white-border-bottom": "0 1px 0 0 #FFFFFF",
        "pd-bottom": "0 1px 0 rgba(0,0,0,0.05)",
        // numeric aliases the app also exposes
        "01": "0 0 0 0.5px rgba(26,26,26,0.01), 0 1px 2px 0 rgba(38,38,38,0.05)",
        "02": "0 0 0 1px rgba(255,255,255,0.80) inset, 0 0 0 1px rgba(11,15,20,0.09), 0 1px 2px 0 rgba(11,15,20,0.09)",
        "elevation-new-04": "0 0 0 1.5px rgba(255,255,255,0.80) inset, 0 0 0 1px rgba(11,15,20,0.09), 0 1px 2px 0 rgba(11,15,20,0.09), 0 4px 6px 0 rgba(11,15,20,0.09), 0 40px 40px -24px rgba(11,15,20,0.09), 0 56px 56px -32px rgba(11,15,20,0.20), 0 24px 40px 0 rgba(11,15,20,0.09)",
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
  },
};
