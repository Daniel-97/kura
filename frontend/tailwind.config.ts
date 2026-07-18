import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['selector', '[data-theme="dark"]'],
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
        // Design system §2.1/§8: brand e neutri verificati dalla fonte Checkmate
        brand: { DEFAULT: 'var(--brand)', light: 'var(--brand-light)', soft: 'var(--brand-soft)', accent: 'var(--brand-accent)', hover: 'var(--brand-hover)' },
        gray:  { 200: 'var(--gray-200)', 700: 'var(--gray-700)', 850: 'var(--gray-850)', 900: 'var(--gray-900)' },
        // §2.3: stato (niente più warning/info separati, niente --info nel nuovo sistema)
        status: {
          up:   { DEFAULT: 'var(--status-up)',   soft: 'var(--status-up-soft)' },
          warn: { DEFAULT: 'var(--status-warn)', soft: 'var(--status-warn-soft)' },
          down: { DEFAULT: 'var(--status-down)', soft: 'var(--status-down-soft)' },
        },
        // §2.4: colori categoria (pallino)
        cat: {
          report: 'var(--cat-report)', rx: 'var(--cat-rx)', vax: 'var(--cat-vax)',
          appt: 'var(--cat-appt)', imaging: 'var(--cat-imaging)', other: 'var(--cat-other)',
        },
        border:      'var(--border)',
        'border-strong': 'var(--border-strong)',
        input:       'var(--border)',
        ring:        'hsl(var(--ring))',
        // Alias diretti ai token grezzi (§2.2/§3), usati dai componenti
        // nuovi (Chip, Eyebrow, StatBlock, TwoToneHeading) che citano il
        // doc 1:1. Risolvono agli stessi valori delle voci shadcn sopra.
        surface:     'var(--surface)',
        'surface-raised': 'var(--surface-raised)',
        bg:          'var(--bg)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
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
      // §4.1: raggi (mai angoli vivi, mai oversize) — sm/md/lg restano le
      // classi usate nei componenti, i valori sono quelli di --radius-s/m/l
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
      },
      // §3: due voci tipografiche di sistema + serif editoriale
      fontFamily: {
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', '"SF Mono"', 'Menlo', 'Consolas', '"Liberation Mono"', 'monospace'],
        serif: ['"Instrument Serif"', 'Georgia', '"Iowan Old Style"', '"Palatino Linotype"', 'serif'],
      },
      // §4.3: un'unica ombra ufficiale per tutta l'app, riservata ai layer
      // flottanti (modali, dropdown, popover, toast, tooltip). Tutte le
      // scale shadow-* esistenti puntano allo stesso token: le card a
      // riposo non devono avere ombra (vedi components/ui/card.tsx).
      boxShadow: {
        DEFAULT: 'var(--shadow)',
        sm: 'var(--shadow)',
        md: 'var(--shadow)',
        lg: 'var(--shadow)',
        xl: 'var(--shadow)',
        float: 'var(--shadow)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(.2,.8,.2,1)',
      },
      transitionDuration: {
        fast: '160ms',
        med: '220ms',
      },
    },
  },
  plugins: [animate],
}

export default config
