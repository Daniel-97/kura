# CSS Centralization — Design Spec

**Date:** 2026-06-16
**Status:** Approved

## Context

Il frontend Kura (React 18 + TS strict + Vite + Tailwind 3 + shadcn/ui) contiene numerose catene Tailwind ripetute in pagine e componenti. Lo stesso pattern (form spacing, auth layout, page header, empty/loading state, full-width button, destructive icon button) è riscritto a mano in 6+ file. Questo crea rischio di drift: una modifica futura allo spacing di un form richiede N edit, e catene complesse come `min-h-[calc(100vh-3.5rem)]` sono fragili (un cambio all'altezza dell'header in App.tsx rompe due pagine in silenzio).

Obiettivo: rendere `frontend/src/index.css` l'unico punto di verità per gli stili UI ripetuti, seguendo la convenzione Tailwind `@layer components` + `@apply`. Tutto il resto (shadcn variables, dark mode, animazioni in `tailwind.config.ts`) resta invariato.

## Requirements

- Le 12 classi semantiche nuove vivono in `frontend/src/index.css` sotto `@layer components`, costruite con `@apply` su utility esistenti
- Le classi devono usare variabili shadcn (`text-muted-foreground`, `bg-background`, ecc.) per restare compatibili con light/dark mode
- Pagine e componenti che oggi ripetono le stesse catene Tailwind le sostituiscono con le nuove classi
- Niente nuovi componenti React, niente nuove dipendenze, nessuna modifica a `tailwind.config.ts`, hook, i18n, logica di business
- I file generati `components/ui/*` (shadcn) restano intatti
- Aggiungere una regola in `frontend/AGENTS.md` (sezione "Code Conventions") che codifichi la nuova convenzione

## Architecture

### File modificati (9)

| File | Tipo di modifica |
|---|---|
| `frontend/src/index.css` | Aggiungere blocco `@layer components` |
| `frontend/src/pages/Login.tsx` | Sostituire catene ripetute |
| `frontend/src/pages/Register.tsx` | Sostituire catene ripetute |
| `frontend/src/pages/Pressione.tsx` | Sostituire catene ripetute |
| `frontend/src/pages/RecordForm.tsx` | Sostituire catene ripetute |
| `frontend/src/pages/Timeline.tsx` | Sostituire page header + empty/loading state |
| `frontend/src/components/ReminderDialog.tsx` | Sostituire `.form` e `.form-field` |
| `frontend/src/components/RecordCard.tsx` | Sostituire `.icon-btn-destructive` |
| `frontend/src/components/ReminderList.tsx` | Sostituire `.icon-btn-destructive` |
| `frontend/AGENTS.md` | Aggiungere 1 riga alla tabella "Code Conventions" |

### Le 12 nuove classi

```css
@layer components {
  /* Form building blocks */
  .form              { @apply space-y-4; }
  .form-field        { @apply space-y-2; }
  .form-grid         { @apply grid gap-4; }
  .form-grid-cols-2  { @apply grid grid-cols-2 gap-4; }

  /* Page shells */
  .page-shell          { @apply mx-auto max-w-5xl px-4 py-6; }
  .page-shell-centered { @apply flex min-h-[calc(100vh-3.5rem)] items-center justify-center; }
  .page-header         { @apply text-2xl font-bold; }

  /* Auth (Login/Register) */
  .auth-card  { @apply w-full max-w-sm; }
  .auth-title { @apply text-center text-2xl; }

  /* States */
  .muted-empty          { @apply text-muted-foreground; }
  .btn-block            { @apply w-full; }
  .icon-btn-destructive { @apply shrink-0 text-muted-foreground hover:text-destructive; }
}
```

### Mapping classe → occorrenze sostituite

| Classe | Sostituisce | File |
|---|---|---|
| `.form` | `<form className="space-y-4">` | Login, Register, Pressione, RecordForm, ReminderDialog |
| `.form-field` | `<div className="space-y-2">` (label + input) | Login ×2, Register ×3, Pressione ×5, RecordForm ×7, ReminderDialog ×4 |
| `.form-grid-cols-2` | `grid grid-cols-2 gap-4` | Pressione (systolic/diastolic) |
| `.page-header` | `<h1 className="text-2xl font-bold">` | Pressione, Timeline |
| `.page-shell-centered` | wrapper auth layout | Login, Register |
| `.auth-card` | `<Card className="w-full max-w-sm">` | Login, Register |
| `.auth-title` | `<CardTitle className="text-center text-2xl">` | Login, Register |
| `.muted-empty` | `<p className="text-muted-foreground">` empty/loading | Pressione, Timeline |
| `.btn-block` | `<Button className="w-full">` | Login, Register, Pressione |
| `.icon-btn-destructive` | `shrink-0 text-muted-foreground hover:text-destructive` | RecordCard, RecordForm, ReminderList |

### Decisioni chiave

- **`.form-grid` e `.form-grid-cols-2` separati**: il primo è generico, il secondo è la variante a 2 colonne usata oggi. Insieme permettono future forme a 3 colonne (`<div className="form-grid grid-cols-3 gap-4">`) senza rinominare nulla.
- **`.page-shell` definito ma non usato**: incluso per uso futuro, ma App.tsx (main shell) resta fuori scope per minimizzare la diff.
- **`.auth-card` e `.auth-title` separati da `.page-shell-centered`**: una futura pagina centered non-auth (es. "account settings" modale) potrà usare il centered shell senza trascinare `max-w-sm`.

### Cosa NON centralizzare (e perché)

- `flex flex-wrap gap-3` (Timeline filter row) — usato una volta sola.
- Timeline "today" ribbon — artefatto visivo one-off.
- `CATEGORY_DOT` / `CATEGORY_BORDER` in Timeline — mappe data-driven accoppiate al tipo `RecordCategory`; già centralizzate come costanti TS. Spostarle in CSS richiederebbe variabili per-categoria e oscurerebbe la relazione col tipo.
- Catene inline `text-sm text-muted-foreground` (~30 occorrenze) — forzarle in classe ridurrebbe la leggibilità; è la convenzione standard shadcn.

## La regola in AGENTS.md

Aggiungere questa riga alla tabella "Code Conventions" in `frontend/AGENTS.md`:

```
| Repeated UI styles live in `frontend/src/index.css` under `@layer components` (built with `@apply`). Pages and components reference these classes instead of repeating the same Tailwind chains. | Single source of truth for layout patterns; keeps page markup readable. |
```

## Application plan (ordine di esecuzione)

1. `frontend/src/index.css` — appendere il blocco `@layer components { ... }`
2. `frontend/src/pages/Login.tsx` — sostituire catene
3. `frontend/src/pages/Register.tsx` — sostituire catene
4. `frontend/src/pages/Pressione.tsx` — sostituire catene
5. `frontend/src/pages/RecordForm.tsx` — sostituire catene
6. `frontend/src/pages/Timeline.tsx` — page header + empty/loading
7. `frontend/src/components/ReminderDialog.tsx` — `.form` e `.form-field`
8. `frontend/src/components/RecordCard.tsx` — `.icon-btn-destructive`
9. `frontend/src/components/ReminderList.tsx` — `.icon-btn-destructive`
10. `frontend/AGENTS.md` — aggiungere la regola
11. Verify: `cd frontend && npm run lint && npm run build`

## Verification

- **Type-check**: `cd frontend && npm run lint` deve passare senza errori
- **Build**: `cd frontend && npm run build` deve produrre un `pb_public/` pulito, senza warning di purge Tailwind
- **Smoke test manuale**: dev server, walk Login → Timeline → Pressione → RecordForm → Register (se `VITE_ALLOW_REGISTRATION=true`). Tutte le pagine renderizzate identicamente a prima del refactor
- **Purge Tailwind**: se qualche classe viene purgata, è segnale che uno step di applicazione è stato saltato. Nessuna classe nuova viene definita senza almeno un uso in pagina/componente

## Risk

- **Basso.** Nessuna modifica di logica, nessuna nuova dipendenza, nessuna edit di file generati, nessuna regressione dark mode (tutte le classi usano variabili shadcn esistenti), nessun nuovo componente.
- **Dark mode**: invariata — ogni classe nuova usa variabili che già rispondono a `.dark`.
- **Purge Tailwind**: le classi nuove sono usate nello stesso commit, quindi nessun CSS morto sopravvive.
- **Limitazioni `@apply`**: tutte le catene usano utility esistenti, nessun valore arbitrario oltre quelli già in uso.
