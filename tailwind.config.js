/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: "class",
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary, #2563eb)",
          foreground: "var(--primary-foreground, #ffffff)"
        },
        accent: {
          DEFAULT: "var(--accent, #3b82f6)",
          foreground: "var(--accent-foreground, #ffffff)"
        },
        background: "var(--background, #0f172a)",
        surface: "var(--surface, #111827)",
        card: {
          DEFAULT: "var(--card, #1f2937)",
          foreground: "var(--card-foreground, #f9fafb)"
        },
        border: "var(--border, #374151)",
        muted: {
          DEFAULT: "var(--muted, #9ca3af)",
          foreground: "var(--muted-foreground, #f9fafb)"
        },
        foreground: "var(--foreground, #f9fafb)",
        success: {
          DEFAULT: "var(--success, #22c55e)",
          foreground: "var(--success-foreground, #ffffff)"
        },
        warning: {
          DEFAULT: "var(--warning, #f59e0b)",
          foreground: "var(--warning-foreground, #ffffff)"
        },
        danger: {
          DEFAULT: "var(--danger, #ef4444)",
          foreground: "var(--danger-foreground, #ffffff)"
        },
        info: {
          DEFAULT: "var(--info, #3b82f6)",
          foreground: "var(--info-foreground, #ffffff)"
        },
        input: 'var(--input)',
        ring: 'var(--ring)',
        chart: {
          primary: "var(--chart-primary, #2563eb)",
          secondary: "var(--chart-secondary, #64748b)",
          accent: "var(--chart-accent, #3b82f6)",
          success: "var(--chart-success, #10b981)",
          warning: "var(--chart-warning, #f59e0b)",
          danger: "var(--chart-danger, #ef4444)",
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

module.exports = config