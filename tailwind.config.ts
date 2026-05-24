import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          "system-ui",
          "sans-serif",
        ],
        mono: [
          '"SF Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
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
        // Apple semantic colors
        apple: {
          blue: "hsl(var(--apple-blue))",
          green: "hsl(var(--apple-green))",
          red: "hsl(var(--apple-red))",
          orange: "hsl(var(--apple-orange))",
          teal: "hsl(var(--apple-teal))",
          indigo: "hsl(var(--apple-indigo))",
        },
      },
      borderRadius: {
        // Apple radius scale
        none: "0",
        sm: "8px",
        DEFAULT: "12px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        full: "9999px",
      },
      boxShadow: {
        // Apple elevation shadows
        "apple-sm": "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
        apple:
          "0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.06)",
        "apple-md":
          "0 4px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.06)",
        "apple-lg":
          "0 8px 40px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)",
        "apple-inset": "inset 0 1px 2px rgba(0,0,0,0.06)",
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
        // Apple spring animations
        "spring-in": {
          "0%": { opacity: "0", transform: "scale(0.92) translateY(4px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "spring-out": {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.94)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "spring-in": "spring-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "spring-out": "spring-out 0.2s ease-in",
        "slide-up": "slide-up 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
