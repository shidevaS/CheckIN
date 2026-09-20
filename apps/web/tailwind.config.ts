import type { Config } from "tailwindcss";

// RGB triplets below are referenced by the CSS variables in globals.css.
const color = (varName: string) => `rgb(var(--${varName}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: color("background"),
        foreground: color("foreground"),
        card: { DEFAULT: color("card"), foreground: color("card-foreground") },
        popover: { DEFAULT: color("card"), foreground: color("card-foreground") },
        primary: { DEFAULT: color("primary"), foreground: color("primary-foreground") },
        secondary: { DEFAULT: color("secondary"), foreground: color("secondary-foreground") },
        muted: { DEFAULT: color("muted"), foreground: color("muted-foreground") },
        accent: { DEFAULT: color("accent"), foreground: color("accent-foreground") },
        destructive: { DEFAULT: color("destructive"), foreground: color("destructive-foreground") },
        border: color("border"),
        input: color("input"),
        ring: color("ring"),
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        serif: ["Iowan Old Style", "Palatino Linotype", "Palatino", "Book Antiqua", "Georgia", "serif"],
        mono: ["SFMono-Regular", "JetBrains Mono", "Cascadia Code", "Consolas", "Liberation Mono", "monospace"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
};
export default config;