/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // Analytiq brand: deep violet primary, teal for AI, warm ink neutrals.
        brand: {
          50: "#f4f2ff", 100: "#ebe7ff", 200: "#d9d1ff", 300: "#bdaeff", 400: "#9c82fd",
          500: "#7c55f8", 600: "#6a36ee", 700: "#5a26d6", 800: "#4b21b0", 900: "#3e1f8f", 950: "#251162",
        },
        ai: { 50: "#ebfbf8", 100: "#cff5ee", 500: "#14b8a0", 600: "#0d9484", 700: "#0f766b" },
        ink: {
          50: "#f7f7fb", 100: "#efeff6", 200: "#e2e2ec", 300: "#c9c9d8", 400: "#9d9db3",
          500: "#717189", 600: "#55556b", 700: "#3f3f52", 800: "#26263a", 900: "#151526", 950: "#0c0c1a",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(21,21,38,.04), 0 1px 3px rgba(21,21,38,.06)",
        pop: "0 12px 32px -8px rgba(21,21,38,.22)",
      },
      keyframes: {
        shimmer: { from: { backgroundPosition: "200% 0" }, to: { backgroundPosition: "-200% 0" } },
        "slide-in": { from: { transform: "translateY(8px)", opacity: 0 }, to: { transform: "none", opacity: 1 } },
      },
      animation: { shimmer: "shimmer 1.3s infinite", "slide-in": "slide-in .18s ease-out" },
    },
  },
  plugins: [],
};
