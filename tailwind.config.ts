import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f0f7f0",
          100: "#dceedd",
          200: "#b9debb",
          300: "#8faa8b",
          400: "#5e8860",
          500: "#3d6b3f",
          600: "#2d5230",
          700: "#1a3a2a",
          800: "#122819",
          900: "#0b1a10",
        },
        cream: {
          50: "#fefcf8",
          100: "#fdf7ed",
          200: "#f5f0e8",
          300: "#ede4d3",
          400: "#ddd0b8",
        },
        terracotta: {
          400: "#d4856a",
          500: "#c4714a",
          600: "#a85c37",
        },
        sage: {
          300: "#b8c9b5",
          400: "#9ab595",
          500: "#7a9e75",
        }
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "leaf-pattern": "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 C20 15 10 25 30 45 C50 25 40 15 30 5z' fill='none' stroke='%231a3a2a' stroke-opacity='0.05' stroke-width='1'/%3E%3C/svg%3E\")",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "leaf-sway": "leafSway 3s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        leafSway: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
