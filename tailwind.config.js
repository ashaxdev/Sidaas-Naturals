/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#FBF7EF",
        champagne: "#F3EADA",
        forest: {
          DEFAULT: "#1F4A2C",
          light: "#2E6540",
          dark: "#123018",
        },
        gold: {
          DEFAULT: "#B8923F",
          light: "#D4B570",
          dark: "#8F6E2A",
        },
        terracotta: {
          DEFAULT: "#B5602F",
          light: "#CE7C4B",
        },
        ink: "#2A2620",
        muted: "#6E6656",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "leaf-corner": "radial-gradient(circle at top left, rgba(31,74,44,0.06), transparent 60%)",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(31,74,44,0.08)",
        card: "0 4px 20px rgba(42,38,32,0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
