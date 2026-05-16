/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: {
          black: "#050505",
          deep: "#0B0B0B",
          marble: "#151515",
          graphite: "#111112",
          smoke: "#9A9A9A",
          ivory: "#F7F1E6",
          gold: "#D6A84F",
          paleGold: "#F5D27A",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "Cormorant Garamond", "Georgia", "serif"],
        monoDisplay: ["Anton", "Bebas Neue", "Impact", "sans-serif"],
        body: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        gold: "0 0 48px rgba(214, 168, 79, 0.28)",
        glass: "inset 0 1px 0 rgba(255,255,255,.08), 0 24px 80px rgba(0,0,0,.42)",
      },
    },
  },
  plugins: [],
};
