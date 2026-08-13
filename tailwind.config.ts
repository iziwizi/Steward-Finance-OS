import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // StewardOS design system — "01 — Foundations" Figma page.
        brand: {
          50: "#E8F2F0",
          100: "#C6DFDC",
          200: "#A2CAC4",
          300: "#7CB3AC",
          400: "#529B91",
          500: "#1D6458",
          600: "#175047",
          700: "#113D38",
          800: "#0B2E28",
          900: "#051D19",
        },
        income: "#10B981",
        expense: "#EF4444",
        pending: "#F59E0B",

        // Legacy aliases kept so existing className usages repaint to the
        // new system without touching every file — see MIGRATION note in
        // ENV_SETUP.md-adjacent docs. New code should prefer brand/income/
        // expense/pending directly.
        ink: "#09090B", // sys/text-primary
        paper: "#FAFAFA", // sys/bg
        accent: "#1D6458", // brand/500
        gold: "#F59E0B", // sys/pending — closest semantic equivalent to the old gold tithe accent
        danger: "#EF4444", // sys/danger
      },
      borderRadius: {
        none: "0px",
        sm: "4px",
        DEFAULT: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        full: "9999px",
      },
      fontSize: {
        "display-lg": ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        "display-md": ["24px", { lineHeight: "1.2", fontWeight: "700" }],
        caption: ["11px", { lineHeight: "1.4", fontWeight: "500" }],
        "financial-hero": ["48px", { lineHeight: "1.1", fontWeight: "800" }],
        "financial-md": ["28px", { lineHeight: "1.1", fontWeight: "700" }],
        "financial-caption": ["12px", { lineHeight: "1.1", fontWeight: "600" }],
      },
      transitionTimingFunction: {
        "ease-out-motion": "cubic-bezier(0.0, 0.0, 0.2, 1.0)",
        "ease-in-out-motion": "cubic-bezier(0.4, 0.0, 0.2, 1.0)",
        spring: "cubic-bezier(0.2, 0.8, 0.2, 1.0)",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
        slow: "400ms",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "sheet-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 250ms cubic-bezier(0.0, 0.0, 0.2, 1.0) both",
        "sheet-up": "sheet-up 300ms cubic-bezier(0.2, 0.8, 0.2, 1.0) both",
      },
    },
  },
  plugins: [],
};
export default config;
