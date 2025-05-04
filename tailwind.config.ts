import type { Config } from "tailwindcss"
import animatePlugin from "tailwindcss-animate"
import plugin from "tailwindcss/plugin"

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-outfit)', 'Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Figma colors
        figma: {
          white: "#ffffff",
          brown: "#4e2e20",
          lightGray: "#d5d7da",
          mediumGray: "#717680",
          slateBlue: "#64748b",
          darkGray: "#535862",
          offWhite: "#f7f7f7",
          lightBlue: "#eef4fd",
          lightPurple: "#d7c7ff",
          darkPurple: "#5f5086",
          lightPeach: "#ffeee6",
          mediumBrown: "#8d543d",
          dustyPeach: "#d8a48f",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: "fadeIn 0.8s ease-out forwards",
        slideUp: "slideUp 0.8s ease-out forwards",
        pulse: "pulse 2s ease-in-out infinite",
      },
      boxShadow: {
        subtle: "0 10px 30px -15px rgba(78, 46, 32, 0.1)",
      },
    },
  },
  plugins: [
    animatePlugin,
    plugin((api) => {
      const { addUtilities, e } = api as unknown;
      const animationDelayUtilities: Record<string, { "animation-delay": string }> = {};
      for (let i = 1; i <= 10; i++) {
        animationDelayUtilities[`.${e(`animation-delay-${i * 100}`)}`] = {
          "animation-delay": `${i * 0.1}s`,
        };
      }
      addUtilities(animationDelayUtilities);
    }),
  ],
} satisfies Config

export default config
