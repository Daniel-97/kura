# Theme Toggle + AGENTS.md — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiungere il toggle light/dark nell'header e il file AGENTS.md di documentazione del frontend.

**Architecture:** `next-themes` (già installato) viene wrappato attorno all'app in `main.tsx`. Un nuovo componente `ThemeToggle.tsx` legge il tema corrente via `useTheme()` e alterna tra light e dark. `App.tsx` aggiunge il toggle nell'header accanto a `LanguageSwitcher`. L'AGENTS.md è un file di documentazione statico in `frontend/`.

**Tech Stack:** React 18, TypeScript, next-themes, lucide-react, Tailwind CSS con variabili shadcn/ui

---

### Task 1: Aggiungere ThemeProvider in `main.tsx`

**Files:**
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1: Aggiornare `main.tsx`**

Sostituire il contenuto di `frontend/src/main.tsx` con:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter } from 'react-router-dom'
import './i18n/index'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
        </HashRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
```

Note:
- `attribute="class"`: next-themes aggiunge/rimuove la classe `.dark` sull'elemento `<html>`, che è quello che shadcn/ui si aspetta
- `defaultTheme="light"`: tema iniziale
- `disableTransitionOnChange`: evita il flash di colori durante il cambio tema

- [ ] **Step 2: Verificare TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

Atteso: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/main.tsx
git commit -m "feat: wrap app with next-themes ThemeProvider"
```

---

### Task 2: Creare il componente `ThemeToggle`

**Files:**
- Create: `frontend/src/components/ThemeToggle.tsx`

- [ ] **Step 1: Creare il file**

Creare `frontend/src/components/ThemeToggle.tsx` con il seguente contenuto:

```tsx
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
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
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  )
}
```

Note:
- `useTheme()` è fornito da `next-themes` (già installato come dipendenza)
- `Moon` e `Sun` vengono da `lucide-react` (già installato)
- `Button` viene da `@/components/ui/button` (già presente nel progetto)
- In light mode mostra la luna (per passare al dark); in dark mode mostra il sole (per tornare al light)

- [ ] **Step 2: Verificare TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

Atteso: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ThemeToggle.tsx
git commit -m "feat: add ThemeToggle component"
```

---

### Task 3: Aggiungere `ThemeToggle` nell'header in `App.tsx`

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Aggiungere l'import di ThemeToggle**

Aggiungere la riga di import dopo quella di `LanguageSwitcher`:

```tsx
import LanguageSwitcher from '@/components/LanguageSwitcher'
import ThemeToggle from '@/components/ThemeToggle'
```

- [ ] **Step 2: Aggiungere `<ThemeToggle />` nell'header**

Sostituire la riga:

```tsx
              <LanguageSwitcher />
```

Con:

```tsx
              <div className="flex items-center gap-1">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
```

- [ ] **Step 3: Verificare TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

Atteso: nessun errore.

- [ ] **Step 4: Verifica manuale nel browser**

Aprire http://localhost:5173 (Vite dev server già in esecuzione).

Checklist:
- [ ] L'header mostra l'icona luna (🌙) accanto al selettore lingua in tema light
- [ ] Click sull'icona passa al tema dark — tutta l'app diventa scura
- [ ] In tema dark l'icona diventa sole (☀️)
- [ ] Click sull'icona sole torna al tema light
- [ ] Il tema persiste ricaricando la pagina (next-themes salva in localStorage)
- [ ] Il drawer si adegua al tema (sfondo bianco in light, scuro in dark)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat: add ThemeToggle to header"
```

---

### Task 4: Scrivere `frontend/AGENTS.md`

**Files:**
- Create: `frontend/AGENTS.md`

- [ ] **Step 1: Creare il file**

Creare `frontend/AGENTS.md` con il seguente contenuto:

```markdown
# Frontend — AGENTS.md

Guida allo stack e alle convenzioni del frontend di Kura per agenti AI e sviluppatori.

## Stack

| Layer | Tecnologia |
|---|---|
| Framework | React 18 |
| Linguaggio | TypeScript 5 |
| Build tool | Vite 6 |
| Stile | Tailwind CSS 3 + shadcn/ui (variabili CSS) |
| Componenti UI | Radix UI (via shadcn/ui) |
| Routing | React Router v6 (HashRouter) |
| State / fetch | TanStack Query v5 |
| Backend client | PocketBase JS SDK (`pocketbase`) |
| i18n | i18next + react-i18next + browser language detector |
| Tema | next-themes (light / dark, persistito in localStorage) |
| Icone | lucide-react |
| Notifiche | sonner |

## Struttura directory

```
frontend/src/
├── components/        # Componenti riutilizzabili
│   ├── ui/            # Componenti shadcn/ui (generati, non modificare manualmente)
│   ├── AppDrawer.tsx  # Drawer di navigazione laterale
│   ├── LanguageSwitcher.tsx
│   ├── RecordCard.tsx
│   ├── TagFilter.tsx
│   └── ThemeToggle.tsx
├── hooks/             # Custom hooks React
│   ├── useAuth.ts     # Autenticazione PocketBase
│   ├── useBloodPressure.ts
│   └── useRecords.ts
├── i18n/
│   ├── index.ts       # Configurazione i18next
│   └── locales/
│       ├── it.json    # Italiano (default)
│       └── en.json    # Inglese
├── lib/
│   ├── pb.ts          # Istanza singleton PocketBase
│   ├── types.ts       # Tipi TypeScript condivisi
│   └── utils.ts       # Utility (cn helper)
├── pages/             # Componenti pagina (route)
│   ├── Login.tsx
│   ├── Pressione.tsx  # Diario pressione arteriosa
│   ├── RecordForm.tsx # Creazione/modifica referti
│   └── Timeline.tsx   # Lista referti con filtri
├── App.tsx            # Shell app: header, routing, drawer
├── index.css          # Variabili CSS shadcn/ui + base Tailwind
└── main.tsx           # Entry point React + provider tree
```

## Comandi

```bash
# Installare dipendenze
npm install

# Avviare dev server (porta 5173, proxy verso PocketBase su 8090)
npm run dev

# Build di produzione (output in ../pb_public/)
npm run build

# Type check senza emissione file
npm run lint        # alias di tsc --noEmit
```

## Convenzioni

### Path alias
`@/` punta a `frontend/src/`. Usare sempre `@/` invece di path relativi.

### Variabili CSS tema
Non usare mai colori Tailwind hardcoded (`bg-white`, `text-gray-900`).
Usare sempre le variabili shadcn/ui: `bg-background`, `text-foreground`, `bg-accent`, `text-muted-foreground`, `border`, ecc.
Questo garantisce che i componenti funzionino in entrambi i temi (light e dark).

### Componenti UI
I componenti in `src/components/ui/` sono generati da shadcn/ui. Non modificarli direttamente — rigenerare via CLI se necessario. Usarli come building block nei componenti custom.

### i18n
Tutte le stringhe visibili all'utente devono usare `t('chiave')` da `react-i18next`.
Aggiungere sempre la chiave in entrambi i file (`it.json` e `en.json`) prima di usarla nel codice.

### PocketBase
L'istanza `pb` è un singleton esportato da `@/lib/pb`. Non creare nuove istanze.
Il proxy Vite (`/api`, `/_`) redirige al backend su `http://127.0.0.1:8090` in sviluppo.
In produzione il frontend è servito direttamente da PocketBase (build in `pb_public/`).

### Routing
Usa `HashRouter` — le route hanno prefisso `#/` nell'URL. Passare i path senza `#` a `<Link>` e `<NavLink>` (es. `to="/"`, `to="/pressione"`).

## Backend (PocketBase)

Il backend è PocketBase v0.27.1. Espone due collezioni:

- **records** — referti sanitari (titolo, data, categoria, tag, allegati, utente)
- **blood_pressure** — misurazioni pressione (sistolica, diastolica, polso, data, note, utente)

Tutte le regole di accesso richiedono autenticazione e limitano i dati all'utente autenticato.
La dashboard admin è su `http://localhost:8090/_/`.
```

- [ ] **Step 2: Commit**

```bash
git add frontend/AGENTS.md
git commit -m "docs: add frontend AGENTS.md with stack and conventions"
```
