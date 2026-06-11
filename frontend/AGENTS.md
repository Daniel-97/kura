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
| Backend client | PocketBase JS SDK (`pocketbase` ^0.21.5) |
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
- **blood_pressure** — misurazioni pressione (systolic, diastolic, pulse, measured_at, notes, user)

Tutte le regole di accesso richiedono autenticazione e limitano i dati all'utente autenticato.
La dashboard admin è su `http://localhost:8090/_/`.
