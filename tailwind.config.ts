import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Calm NxtWave-ish palette
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#bcd3ff",
          300: "#8eb6ff",
          400: "#598dff",
          500: "#3366ff",
          600: "#1f47e6",
          700: "#1a37b8",
          800: "#1b3194",
          900: "#1c2e75",
        },
        ink: {
          DEFAULT: "#0f172a",
          soft: "#334155",
          faint: "#64748b",
        },
        risk: {
          high: "#dc2626",
          med: "#f59e0b",
          low: "#16a34a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)",
        lift: "0 8px 24px rgba(16,24,40,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
