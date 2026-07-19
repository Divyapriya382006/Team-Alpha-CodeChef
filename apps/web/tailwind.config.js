/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        sans: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        brand: "#C8F135",
        "brand-dark": "#9BBF1A",
        ink: "#0A0A0A",
        paper: "#F5F0E8",
        muted: "#555555",
      },
      boxShadow: {
        brutal: "4px 4px 0px #0A0A0A",
        "brutal-sm": "3px 3px 0px #0A0A0A",
        "brutal-lg": "6px 6px 0px #0A0A0A",
        "brutal-pressed": "1px 1px 0px #0A0A0A",
      },
      borderRadius: {
        DEFAULT: "0",
        none: "0",
      },
      keyframes: {
        "brute-in": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "brute-in": "brute-in 0.2s ease-out both",
      },
    },
  },
  plugins: [],
};
