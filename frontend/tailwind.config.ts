import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // Design system §2.1: palette brand dal logo
        kura: {
          50: '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#6EE7B7',
          400: '#34D399', 500: '#10B981', 600: '#059669', 700: '#047857',
          800: '#065F46', 900: '#064E3B',
        },
        // §2.3: semantici (il danger coincide con destructive di shadcn)
        warning: { DEFAULT: '#D97706', bg: '#FEF3E2' },
        info:    { DEFAULT: '#0284C7', bg: '#E8F4FB' },
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },
      // §4.1: scala raggi esplicita (mai angoli vivi)
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      // §3: tre ruoli tipografici, font self-hosted via @fontsource
      fontFamily: {
        display: ['Outfit Variable', 'system-ui', 'sans-serif'],
        sans: ['Inter Variable', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      // §4.3: ombre tinte di verde, mai grigio-blu
      boxShadow: {
        sm: '0 1px 2px rgba(6,78,59,.06)',
        md: '0 4px 12px rgba(6,78,59,.08)',
        lg: '0 12px 32px rgba(6,78,59,.12)',
      },
      keyframes: {
        ripple: {
          '0%':   { transform: 'scale(0)',   opacity: '0.5' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
      },
      animation: {
        ripple: 'ripple 600ms ease-out forwards',
      },
    },
  },
  plugins: [animate],
}

export default config
