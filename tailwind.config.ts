import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F1115",
        paper: "#FAFAF8",
        accent: "#1F6F52", // deep green — calm, disciplined money feel
        gold: "#C9A227",   // tithe / accountability accent
        danger: "#B3261E",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
