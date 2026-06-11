# Theme Toggle + AGENTS.md — Design Spec

**Data:** 2026-06-11  
**Scope:** Aggiungere il toggle light/dark nell'header e il file AGENTS.md per il frontend

---

## 1. Theme Toggle

### Decisioni di design

| Aspetto | Scelta |
|---|---|
| Stile | Icona sola — `Moon` in light mode, `Sun` in dark mode |
| Interazione | Click alterna direttamente tra light e dark (no system) |
| Posizione | Destra dell'header, dopo `LanguageSwitcher` |
| Libreria | `next-themes` (già installata) |
| Integrazione CSS | `attribute="class"` — shadcn/ui usa `.dark` su `<html>` |

### Header risultante

```
┌─────────────────────────────────────────┐
│ ☰  Kura                    [IT]  [🌙]   │  light mode
│ ☰  Kura                    [IT]  [☀️]   │  dark mode
└─────────────────────────────────────────┘
```

### Architettura componenti

**`ThemeProvider` in `main.tsx`**

`next-themes` richiede un provider che wrappa l'intera app. Va aggiunto in `main.tsx` come wrapper esterno a `<App />`:

```tsx
<ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
  <App />
</ThemeProvider>
```

- `attribute="class"`: aggiunge/rimuove la classe `.dark` sull'elemento `<html>`
- `defaultTheme="light"`: tema iniziale
- `disableTransitionOnChange`: evita flash di colori durante il cambio tema

**Nuovo componente: `ThemeToggle.tsx`**

Responsabilità: leggere il tema corrente via `useTheme()` e alternare al click.

```tsx
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro'}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
```

**Modifica `App.tsx`**

Aggiungere `<ThemeToggle />` dopo `<LanguageSwitcher />` nell'header:

```tsx
<LanguageSwitcher />
<ThemeToggle />
```

### File coinvolti

| File | Modifica |
|---|---|
| `frontend/src/components/ThemeToggle.tsx` | **Nuovo** |
| `frontend/src/main.tsx` | Aggiunge `ThemeProvider` wrapper |
| `frontend/src/App.tsx` | Aggiunge `<ThemeToggle />` nell'header |

Nessuna nuova dipendenza — `next-themes` è già in `package.json`.

---

## 2. AGENTS.md frontend

**Path:** `frontend/AGENTS.md`

Documento di onboarding per agenti AI (e sviluppatori) che lavorano sul frontend. Contiene:

1. **Stack** — framework, build tool, dipendenze principali
2. **Struttura directory** — dove si trovano pagine, componenti, hook, tipi
3. **Comandi** — come avviare, buildare, fare type check
4. **Convenzioni** — pattern usati nel progetto (alias `@/`, variabili CSS shadcn/ui, i18n, ecc.)
5. **Backend** — come il frontend comunica con PocketBase

Il file non contiene segreti, chiavi API o configurazioni sensibili — è pura documentazione di onboarding.
