import type { Config } from "tailwindcss";

/**
 * Every color/radius/font here is a CSS variable defined in src/index.css
 * (§10 design system) — the same tokens as the design-system and dashboard
 * artifacts, so a component styled with `bg-accent` or `rounded-md` here
 * matches the mockups exactly, not an approximation of them.
 */
export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        "text-faint": "var(--text-faint)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          strong: "var(--accent-strong)",
          soft: "var(--accent-soft)",
          tint: "var(--accent-tint)",
        },
        success: { DEFAULT: "var(--success)", soft: "var(--success-soft)" },
        warning: { DEFAULT: "var(--warning)", soft: "var(--warning-soft)" },
        critical: { DEFAULT: "var(--critical)", soft: "var(--critical-soft)" },
        info: { DEFAULT: "var(--info)", soft: "var(--info-soft)" },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        card: "var(--shadow)",
      },
      fontFamily: {
        ui: "var(--font-ui)",
        mono: "var(--font-mono)",
      },
    },
  },
  plugins: [],
} satisfies Config;
