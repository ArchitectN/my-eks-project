import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      colors: {
        sage: {
          50: "#f4f7f4",
          100: "#e6ede6",
          200: "#cedece",
          300: "#a8c4a8",
          400: "#7aa47a",
          500: "#568556",
          600: "#416841",
          700: "#355335",
          800: "#2c432c",
          900: "#253825",
        },
        cream: {
          50: "#fdfbf7",
          100: "#faf5eb",
          200: "#f4ebd3",
          300: "#ebdab0",
          400: "#dfc285",
          500: "#d4a85e",
        },
        clay: {
          100: "#f5ede8",
          200: "#e8d0c5",
          300: "#d4a898",
          400: "#c08070",
          500: "#a85f4f",
        },
      },
      backgroundImage: {
        "paw-pattern": "url('/paw-bg.svg')",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
        wiggle: "wiggle 0.5s ease-in-out",
      },
    },
  },
  plugins: [],
};
export default config;
