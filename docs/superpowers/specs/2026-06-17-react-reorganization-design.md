# React Reorganization — Design Spec

**Date:** 2026-06-17
**Status:** Approved

## Context

La struttura attuale del frontend (`frontend/src/`) è organizzata per ruolo tecnico (`pages/`, `components/`, `hooks/`, `lib/`). Con la crescita dell'app (6 pagine, 5 feature con hook e componenti dedicati), questa organizzazione rende difficile trovare tutto il codice di una feature in un unico posto e rende meno evidenti i confini tra feature.

Si è valutata l'introduzione di Astro per migliorare manutenibilità e gestibilità tramite il modello di authoring dei file `.astro`. La valutazione ha concluso che **Astro non è adatto a Kura**:

- L'app è interattiva e auth-gated al 100% (nessuna pagina pubblica/SEO)
- I file `.astro` ospitano solo HTML statico; tutto ciò che è interattivo diventa un'isola React
- Le pagine dell'app resterebbero React, quindi Astro aggiungerebbe un livello in più invece di ridurlo
- Il deploy single-binary (PocketBase serve `pb_public/`) si manterrebbe solo con output statico (beneficio minore); l'SSR romperebbe il deploy

Si procede quindi con una **riorganizzazione di React in-place**: struttura per feature + tabella route tipizzata. Rischio zero su deploy e behaviour.

## Requirements

- Co-locare componenti, hook, tipi e utils di ciascuna feature in un'unica directory `features/<feature>/`
- Mantenere `components/ui/` (shadcn) invariato — i file generati non si spostano
- Raggruppare i componenti di shell (header, sidebar, drawer, switcher, toggle, user menu) in `components/shell/`
- Estrarre la tabella route da `App.tsx` in un'unica sorgente di verità tipizzata in `lib/routes.ts`
- `App.tsx` deve iterare la tabella route per renderizzare `<Routes>`, mantenendo il comportamento attuale (AuthGuard sulle route protette, redirect fallback)
- **Niente code-splitting** (niente `React.lazy`): import statici come oggi
- **Niente CSS Modules**: mantenere Tailwind + `@layer components` in `index.css` come da convenzione
- Tutti i path alias `@/` devono continuare a funzionare
- `npm run lint` (type check) deve passare senza errori
- L'app deve avviarsi e funzionare come prima (stesso routing, stessi componenti renderizzati)

## Architecture

### Struttura directory target

```
frontend/src/
├── features/
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── AuthGuard.tsx          # estratto da App.tsx
│   │   ├── useAuth.ts
│   │   └── useRegister.ts
│   ├── records/
│   │   ├── Timeline.tsx
│   │   ├── RecordForm.tsx
│   │   ├── RecordCard.tsx
│   │   ├── TagFilter.tsx
│   │   ├── useRecords.ts
│   │   └── types.ts               # Record, Category, tag types (se specifici della feature)
│   ├── blood-pressure/
│   │   ├── Pressione.tsx
│   │   ├── BloodPressureChart.tsx
│   │   ├── useBloodPressure.ts
│   │   └── bloodPressureUtils.ts
│   ├── categories/
│   │   ├── Categories.tsx
│   │   ├── CategoryPicker.tsx
│   │   ├── useCategories.ts
│   │   └── category-styles.ts
│   └── reminders/
│       ├── ReminderDialog.tsx
│       ├── ReminderList.tsx
│       └── useReminders.ts
├── components/
│   ├── ui/                        # shadcn (invariato)
│   └── shell/
│       ├── AppDrawer.tsx
│       ├── SidebarContent.tsx
│       ├── UserMenu.tsx
│       ├── LanguageSwitcher.tsx
│       └── ThemeToggle.tsx
├── lib/
│   ├── pb.ts                      # invariato
│   ├── utils.ts                   # invariato
│   ├── types.ts                   # tipi condivisi non specifici di una feature
│   └── routes.ts                  # NUOVO — tabella route tipizzata
├── i18n/                          # invariato
├── App.tsx                        # consuma lib/routes.ts
├── main.tsx                       # invariato
└── index.css                      # invariato
```

### `lib/routes.ts` — sorgente unica delle route

Struttura tipizzata (minimale, senza over-engineering):

```ts
import type { ComponentType } from 'react'
import Login from '@/features/auth/Login'
import Register from '@/features/auth/Register'
import Timeline from '@/features/records/Timeline'
import RecordForm from '@/features/records/RecordForm'
import Pressione from '@/features/blood-pressure/Pressione'
import Categories from '@/features/categories/Categories'

export interface AppRoute {
  path: string
  component: ComponentType
  requiresAuth: boolean
}

export const routes: AppRoute[] = [
  { path: '/login',           component: Login,      requiresAuth: false },
  { path: '/register',        component: Register,   requiresAuth: false },
  { path: '/',                component: Timeline,   requiresAuth: true },
  { path: '/new',             component: RecordForm, requiresAuth: true },
  { path: '/record/:id/edit', component: RecordForm, requiresAuth: true },
  { path: '/blood-pressure',  component: Pressione,  requiresAuth: true },
  { path: '/categories',      component: Categories, requiresAuth: true },
]
```

### `App.tsx` — refactoring del routing

`AuthGuard` viene spostato in `features/auth/AuthGuard.tsx` ed esportato. La sezione `<Routes>` diventa:

```tsx
<Routes>
  {routes.map(({ path, component: Component, requiresAuth }) => {
    const element = requiresAuth ? <AuthGuard><Component /></AuthGuard> : <Component />
    return <Route key={path} path={path} element={element} />
  })}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

Tutto il resto di `App.tsx` (header mobile, drawer, sidebar desktop, top bar desktop, main con padding condizionale, `<Toaster>`) resta invariato.

### Spostamenti di file

I file vengono **spostati** (non duplicati). Gli import interni tra file della stessa feature passano da `@/components/X` / `@/hooks/useX` a path relativi (`./X`, `../useX`) dove ha senso, oppure restano `@/...` per cross-feature/shell/ui. La regola pratica:

- **Stessa feature** → path relativi
- **Cross-feature, shell, ui, lib condiviso, i18n** → path `@/`

### Tipi

`lib/types.ts` resta il luogo per tipi condivisi tra feature. Se un tipo è usato da una sola feature, può essere co-locato in `features/<feature>/types.ts`. La migrazione dei tipi non è un requisito bloccante — si spostano solo quelli chiaramente feature-specific (es. `bloodPressureUtils.ts` e i suoi tipi restano in `features/blood-pressure/`). In questa fase si evita di frammentare eccessivamente i tipi.

## Verification

1. `cd frontend && npm run lint` → type check passa senza errori
2. `cd frontend && npm run build` → build completa senza errori, output in `pb_public/`
3. `./pocketbase serve` + `cd frontend && npm run dev` → dev server avvia senza errori
4. Login con utente di test → redirect a Timeline
5. Navigare tutte le route protette (`/`, `/new`, `/blood-pressure`, `/categories`) → ogni pagina renderizza correttamente
6. Editare un record (`/record/:id/edit`) → form caricato con dati corretti
7. Verificare `/login` e `/register` accessibili senza auth
8. Route sconosciuta (es. `/foo`) → redirect a `/`
9. Logout → redirect a `/login`, le route protette non accessibili
10. Switch IT ↔ EN, light ↔ dark → invariato

## Out of scope

- Code-splitting / `React.lazy`
- CSS Modules
- Introduzione di Astro
- Modifiche a `components/ui/` (shadcn)
- Modifiche a `i18n/`, `lib/pb.ts`, `main.tsx`, `index.css`
- Refactoring del contenuto dei componenti (solo spostamenti + aggiornamento import)
- Test automatizzati oltre al type check esistente
