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
        // brand (app) ramp
        "app-50": "#E6EFFF", "app-75": "#D6E5FF", "app-100": "#C2D8FF",
        "app-200": "#8FB8FF", "app-300": "#5291FF", "app-400": "#1A6EFF",
        "app-500": "#005EFF", "app-600": "#0055ED", "app-650": "#004DD1",
        "app-700": "#0043B8", "app-800": "#002F80", "app-900": "#00225C",

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
        "bg-tertiary-inverted": "#284B71",
        "bg-quaternary": "#E5E5E5",
        "bg-elevated": "#FFFFFF",
        "bg-elevated-hover": "rgba(11, 15, 20, 0.08)",
        "bg-elevation-hover": "rgba(26, 26, 26, 0.12)",
        "bg-brand": "#0055ED",
        "bg-brand-hover": "#0043B8",
        "bg-brand-pressed": "#002F80",
        "bg-brand-selected": "rgba(0, 85, 237, 0.12)",
        "bg-brand-inverted": "#E6EFFF",
        "bg-danger": "#DC2626",
        "bg-danger-hover": "#B91C1C",
        "bg-danger-pressed": "#991B1B",
        "bg-danger-inverted": "#FEF2F2",
        "bg-warning": "#F0B100",
        "bg-warning-inverted": "#FEFCE8",
        "bg-success": "#16A34A",
        "bg-success-inverted": "#F0FDF4",
        "bg-info": "#0C4BFF",
        "bg-info-inverted": "#E8F7FF",
        "bg-blackout": "#171717",
        "bg-default-alpha-800": "rgba(255, 255, 255, 0.8)",

        // text
        "text-primary": "#171717",
        "text-secondary": "#525252",
        "text-tertiary": "#a3a3a3",
        "text-brand": "#0055ED",
        "text-brand-hover": "#002F80",
        "text-brand-secondary": "#005EFF",
        "text-inverted-primary": "#ffffff",
        "text-inverted-secondary": "rgba(255, 255, 255, 0.6)",
        "text-danger-primary": "#b91c1c",
        "text-danger-secondary": "#dc2626",
        "text-warning-primary": "#a16207",
        "text-warning-secondary": "#ca8a04",
        "text-success-primary": "#15803d",
        "text-success-secondary": "#16a34a",
        "text-white": "#ffffff",
        "text-neutral": "#0A0A0A",

        // borders
        "border-primary": "rgba(11, 15, 20, 0.20)",
        "border-primary-inverted": "#0A1925",
        "border-secondary": "rgba(11, 15, 20, 0.09)",
        "border-secondary-inverted": "rgba(10, 25, 37, 0.48)",
        "border-tertiary": "rgba(11, 15, 20, 0.06)",
        "border-brand": "#0055ED",
        "border-brand-secondary": "#8FB8FF",
        "border-danger": "#DC2626",
        "border-danger-secondary": "#FECACA",
        "border-warning-secondary": "#FEF08A",
        "border-success-secondary": "#BBF7D0",
        "border-info-secondary": "#BFDBFE",
        "border-neutral": "#0A0A0A",

        "alpha-light-50": "rgba(26, 26, 26, 0.06)",
        "alpha-light-100": "rgba(26, 26, 26, 0.09)",

        // plan / share accents
        "ppt-50": "#FFF3F0", "ppt-100": "#FAE7DF", "ppt-500": "#D04423", "ppt-600": "#C43E1C",
        "gold-50": "#FEF5DF", "gold-100": "#FEF2D4", "gold-500": "#FBBE28",
        "linkedin-500": "#0077B5", "facebook-500": "#1877F2", "twitter-500": "#1DA1F2",
        "email-500": "#FF6C5F", "copylink-500": "#FF6A00",
        "darkblue-500": "#193351", "darkblue-600": "#0F233A",
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
      },
      backgroundImage: {
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
