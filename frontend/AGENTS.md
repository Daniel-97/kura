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

Layout feature-based: ogni feature raccoglie i propri componenti, hook, tipi e utils in una cartella dedicata; la shell dell'app e i componenti UI generici vivono sotto `components/`.

```
frontend/src/
├── components/
│   ├── ui/            # Componenti shadcn/ui (generati, non modificare manualmente)
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── chart.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── popover.tsx
│   │   ├── select.tsx
│   │   ├── sonner.tsx
│   │   ├── tabs.tsx
│   │   └── textarea.tsx
│   └── shell/         # App chrome (header, sidebar, drawer, switcher, toggle, user menu)
│       ├── AppDrawer.tsx       # Drawer di navigazione laterale
│       ├── LanguageSwitcher.tsx
│       ├── SidebarContent.tsx
│       ├── ThemeToggle.tsx
│       └── UserMenu.tsx
├── features/
│   ├── auth/          # Login, Register, AuthGuard, useAuth, useRegister
│   │   ├── AuthGuard.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── useAuth.ts          # Autenticazione PocketBase
│   │   └── useRegister.ts
│   ├── blood-pressure/         # Diario pressione arteriosa
│   │   ├── BloodPressureChart.tsx
│   │   ├── Pressione.tsx
│   │   ├── bloodPressureUtils.ts
│   │   ├── bloodPressureUtils.test.ts
│   │   └── useBloodPressure.ts
│   ├── categories/             # Gestione categorie
│   │   ├── Categories.tsx
│   │   ├── CategoryPicker.tsx
│   │   ├── category-styles.ts
│   │   ├── category-styles.test.ts
│   │   └── useCategories.ts
│   ├── reminders/              # Promemoria
│   │   ├── ReminderDialog.tsx
│   │   ├── ReminderList.tsx
│   │   └── useReminders.ts
│   └── records/                # Referti: lista, form, card, filtri
│       ├── RecordCard.tsx
│       ├── RecordForm.tsx      # Creazione/modifica referti
│       ├── TagFilter.tsx
│       ├── Timeline.tsx        # Lista referti con filtri
│       └── useRecords.ts
├── i18n/
│   ├── index.ts       # Configurazione i18next
│   └── locales/
│       ├── it.json    # Italiano (default)
│       └── en.json    # Inglese
├── lib/
│   ├── pb.ts          # Istanza singleton PocketBase
│   ├── types.ts       # Tipi TypeScript condivisi
│   ├── utils.ts       # Utility (cn helper, date helpers)
│   └── routes.ts      # Tabella route tipizzata (AppRoute + routes)
├── App.tsx            # Shell app: header, routing, drawer (consuma lib/routes.ts)
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
`@/` punta a `frontend/src/`. **Import within-feature** (componenti, hook, tipi, utils della stessa feature) usano path relativi (`./useAuth`, `../useRecords`). **Import cross-feature, shell, ui, lib condivisi, i18n** usano `@/` (es. `@/features/auth/useAuth`, `@/components/ui/button`, `@/lib/pb`).

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
