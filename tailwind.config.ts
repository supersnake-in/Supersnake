import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#fafafa",
        snake: {
          green: "#04fc21",
          glow: "rgba(4, 252, 33, 0.35)",
          muted: "rgba(4, 252, 33, 0.12)",
          dark: "#024a09",
        },
        obsidian: "#000000",
        "off-black": "#080808",
        charcoal: "#111111",
        carbon: "#171717",
        "border-dark": "#222222",
        "muted-gray": "#737373",
        "light-gray": "#a3a3a3",
        "soft-white": "#f5f5f5",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["var(--font-syne)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
        wide: "0.08em",
        wider: "0.15em",
        widest: "0.25em",
        mega: "0.35em",
      },
      animation: {
        "pulse-subtle": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite alternate",
        "marquee": "marquee 40s linear infinite",
      },
      keyframes: {
        glowPulse: {
          "0%": { filter: "drop-shadow(0 0 10px rgba(4, 252, 33, 0.2))" },
          "100%": { filter: "drop-shadow(0 0 25px rgba(4, 252, 33, 0.6))" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
