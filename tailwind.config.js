/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
      colors: {
        // ABS Developers inspired color palette
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#0a1c2e',
        },
        charcoal: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#f4e68c',
          300: '#fde047',
          400: '#facc15',
          500: '#d4af37',
          600: '#b8860b',
          700: '#9a7b0a',
          800: '#7c5d08',
          900: '#5e4506',
          950: '#3f2e04',
        },
        bronze: {
          50: '#fdf6f0',
          100: '#fae8d6',
          200: '#f4d0a8',
          300: '#ecb374',
          400: '#e28d3f',
          500: '#d97706',
          600: '#c4620a',
          700: '#a04e0b',
          800: '#84400f',
          900: '#6d3510',
          950: '#3a1a06',
        },
        // Legacy shadcn colors
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
      },
      fontFamily: {
        'sans': ['Poppins', 'system-ui', 'sans-serif'],
        'display': ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'abs': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
        'abs-lg': '0 20px 60px -10px rgba(0, 0, 0, 0.15)',
        'abs-xl': '0 30px 80px -10px rgba(0, 0, 0, 0.2)',
        'gold': '0 0 20px rgba(212, 175, 55, 0.3)',
        'gold-lg': '0 0 30px rgba(212, 175, 55, 0.4)',
        'navy': '0 10px 40px -10px rgba(16, 42, 67, 0.3)',
        'navy-lg': '0 20px 60px -10px rgba(16, 42, 67, 0.4)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
