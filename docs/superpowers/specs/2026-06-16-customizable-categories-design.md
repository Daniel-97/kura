# Customizable Categories — Design Spec

**Date:** 2026-06-16
**Status:** Approved

## Context

Kura è una app self-hosted (PocketBase + React) per la gestione di referti sanitari
personali. Il campo `records.category` è oggi un `select` con 4 valori fissi
(`visita`, `esame`, `referto`, `altro`) definiti in `pb_migrations/init.js:22-26`.

L'utente vuole poter aggiungere, nominare e colorare le proprie categorie, e
rimuovere quelle che non usa, senza dover toccare la dashboard admin di
PocketBase. Il modello attuale non lo permette: i valori sono hardcoded sia
nello schema sia nel codice frontend (`CATEGORIES` in `lib/types.ts:1`,
mappe colori in `pages/Timeline.tsx:17-36`).

## Requirements

- Nuova collection `categories` per-utente; ogni record ha `name`, `color` e
  relazione `user`.
- `records.category` diventa una `relation` nullable verso `categories` (al
  posto del `select`).
- Nuova pagina `/categories` con:
  - Form inline per creare una categoria (nome + selezione colore da paletta
    fissa).
  - Tabella delle categorie esistenti con conteggio dei record associati e
    azione elimina.
- Eliminare una categoria collegata a record chiede conferma esplicita con
  conteggio; i record sopravvivono con `category = null`.
- Nessuna localizzazione del nome categoria (nome libero, mostrato as-is in
  entrambe le lingue).
- Nessun seed automatico: utenti nuovi ed esistenti (dopo wipe di `pb_data/`)
  partono con zero categorie.

## Architecture

### Backend — PocketBase

**Nuova collection `categories`** in `pb_migrations/init.js`, prima della
collection `records` (la relazione `records.category → categories` richiede che
la collection target esista):

```js
createIfMissing(() => new Collection({
  name: "categories",
  type: "base",
  fields: [
    { type: "text",     name: "name",  required: true, max: 50 },
    { type: "text",     name: "color", required: true, max: 20 },
    {
      type: "relation", name: "user",  required: true,
      collectionId: usersCol.id, maxSelect: 1,
      cascadeDelete: true,
    },
  ],
  listRule:   '@request.auth.id != "" && user = @request.auth.id',
  viewRule:   '@request.auth.id != "" && user = @request.auth.id',
  createRule: '@request.auth.id != "" && @request.body.user = @request.auth.id',
  updateRule: '@request.auth.id != "" && user = @request.auth.id',
  deleteRule: '@request.auth.id != "" && user = @request.auth.id',
}))
```

**Modifica di `records.category`**: da

```js
{
  type: "select", name: "category", required: true,
  maxSelect: 1,
  values: ["visita", "esame", "referto", "altro"],
}
```

a (campo da posizionare dopo la creazione di `categories`):

```js
{
  type: "relation", name: "category", required: false,
  collectionId: categoriesCol.id, maxSelect: 1,
  cascadeDelete: false,  // elimina la categoria → record sopravvivono con category = null
}
```

`cascadeDelete: false` è il default PocketBase per le relation: quando la
categoria viene cancellata, il campo `category` sui record correlati viene
impostato a `null` automaticamente.

I 4 valori del `select` precedente non hanno corrispondenza nella nuova
collection (nessun seed). I record esistenti con valori `visita/esame/referto/
altro` non sono recuperabili: dopo wipe di `pb_data/`, `records.category` è
semplicemente `null` per ogni record.

### Frontend — Tipi

**`frontend/src/lib/types.ts`** — rimozione di `CATEGORIES`/`RecordCategory`,
aggiunta di `Category` e `CategoryColor`:

```ts
export type CategoryColor =
  | 'indigo' | 'sky' | 'emerald' | 'amber'
  | 'rose'   | 'violet' | 'teal'  | 'slate'

export const CATEGORY_COLORS: CategoryColor[] = [
  'indigo', 'sky', 'emerald', 'amber',
  'rose',   'violet', 'teal',  'slate',
]

export interface Category {
  id: string
  name: string
  color: CategoryColor
  user: string
  created: string
  updated: string
}

export interface HealthRecord {
  id: string
  title: string
  /** ISO 8601 UTC datetime */
  date: string
  description: string
  /** ID della Category collegata, oppure null (mai stata assegnata o eliminata) */
  category: string | null
  /** Comma-separated free-form tags */
  tags: string
  file: string[]
  user: string
  created: string
  updated: string
}
```

Le 4 label `category.visita/esame/referto/altro` nei file `i18n/locales/{it,
en}.json` (righe 72-77) vengono rimosse: le label vivono ora solo nel campo
`name` di ogni record di `categories`.

### Frontend — Hook

**`frontend/src/hooks/useCategories.ts`** (nuovo), segue lo stesso pattern di
`useRecords.ts`:

```ts
export function useCategories() { /* useQuery, ['categories'] */ }
export function useCreateCategory() { /* useMutation, invalidate ['categories', ['records']] */ }
export function useDeleteCategory() { /* useMutation, id: string, invalidate come sopra */ }
export function useCategoryCounts(): Record<string, number> | undefined
```

`useCategoryCounts` usa la funzionalità `groupBy` di PocketBase v0.21+:

```
GET /api/collections/records/records?groupBy=category&fields=category&page=1&perPage=0
```

Restituisce una mappa `categoryId → count`. I record con `category = ""` (null)
compaiono sotto la chiave `''`. Una sola request, supportata dal backend
pinnato (PocketBase v0.27.1).

Tutte le mutazioni su `categories` invalidano anche `['records']` per tenere
coerente la cache delle query che dipendono dai nomi delle categorie (es.
`RecordCard`).

### Frontend — Utility colori

**`frontend/src/lib/category-styles.ts`** (nuovo) — sostituisce le 3 mappe
separate in `Timeline.tsx:17-36`:

```ts
import type { CategoryColor } from './types'

const CLASSES: Record<CategoryColor, { dot: string; outline: string; border: string }> = {
  indigo: { dot: 'bg-indigo-500 ring-indigo-500',   outline: 'ring-indigo-500',   border: 'border-l-indigo-500' },
  sky:    { dot: 'bg-sky-500 ring-sky-500',         outline: 'ring-sky-500',      border: 'border-l-sky-500' },
  emerald:{ dot: 'bg-emerald-500 ring-emerald-500', outline: 'ring-emerald-500',  border: 'border-l-emerald-500' },
  amber:  { dot: 'bg-amber-500 ring-amber-500',     outline: 'ring-amber-500',    border: 'border-l-amber-500' },
  rose:   { dot: 'bg-rose-500 ring-rose-500',       outline: 'ring-rose-500',     border: 'border-l-rose-500' },
  violet: { dot: 'bg-violet-500 ring-violet-500',   outline: 'ring-violet-500',   border: 'border-l-violet-500' },
  teal:   { dot: 'bg-teal-500 ring-teal-500',       outline: 'ring-teal-500',     border: 'border-l-teal-500' },
  slate:  { dot: 'bg-slate-400 ring-slate-400',     outline: 'ring-slate-400',    border: 'border-l-slate-400' },
}

export function getCategoryStyles(color: CategoryColor | null) {
  if (!color) return { dot: 'bg-muted ring-muted', outline: 'ring-muted', border: 'border-l-muted' }
  return CLASSES[color]
}
```

Il fallback `null` serve per i record senza categoria (dot grigio, bordo
sinistro neutro). I nomi originali `indigo/sky/emerald/slate` sono conservati
per compatibilità visiva con il design precedente: le 4 vecchie categorie, se
mai ricreate dall'utente, avrebbero colori identici.

### Frontend — Pagine e componenti

**`frontend/src/pages/Categories.tsx`** (nuova):

Layout a `Card` shadcn/ui, due sezioni:

1. **Form di creazione** (in cima):
   - `<Input>` per `name` (placeholder localizzato, `maxLength=50`).
   - 8 cerchi colorati (`CATEGORY_COLORS.map`); click seleziona (evidenziato
     con `ring-2 ring-foreground`); default = primo colore.
   - Bottone "Aggiungi" (disabled se nome vuoto o duplicato case-insensitive
     tra le categorie esistenti).
   - Su submit: `useCreateCategory.mutate({ name: name.trim(), color })`,
     reset form, toast success.

2. **Tabella** (sotto):
   - Colonne: Nome, Colore (cerchietto + label testuale del colore), Record
     associati, Azioni (icona cestino).
   - Riga speciale "Senza categoria" in cima: nessuna azione, mostra solo
     `counts[''] ?? 0` record.
   - Click cestino → Dialog shadcn con testo: *"Eliminare '{name}'? I {count}
     record associati resteranno senza categoria."* Conferma → delete.
   - Stato vuoto: `t('categories.empty')` con suggerimento per aggiungere la
     prima categoria.

**`frontend/src/components/CategoryPicker.tsx`** (nuovo, riusato):

Espone due modalità tramite prop:
- `<CategoryPicker value onChange />` — riga compatta `Input + 8 cerchi + bottone`
  usata da `Categories.tsx`.
- `<CategoryPicker.Dot value onChange />` — solo i 8 cerchi (per uso futuro,
  se servirà un picker più stretto altrove).

**File modificati**:

- `frontend/src/App.tsx:79-83` — aggiunge
  `<Route path="/categories" element={<AuthGuard><Categories /></AuthGuard>} />`.
- `frontend/src/components/SidebarContent.tsx:37-40` — aggiunge
  `<NavLink to="/categories">` con emoji `🏷️` e label `t('nav.categories')`,
  dopo il link a Pressione.
- `frontend/src/pages/Timeline.tsx`:
  - `CATEGORIES` import rimosso; aggiunto `useCategories` hook.
  - Le 3 mappe `CATEGORY_DOT`/`CATEGORY_DOT_OUTLINE`/`CATEGORY_BORDER` (righe
    17-36) rimosse; sostituite da `getCategoryStyles(c.color)` importato da
    `lib/category-styles.ts`.
  - Filter dropdown (righe 149-159): itera `categories`; mostra
    `categories.find(c => c.id === r.category)?.name ?? t('common.uncategorized')`.
  - Aggiunta voce "Senza categoria" nel dropdown con valore sentinella `''`;
    applica `filter: category = ""`.
  - Per i record con `category == null`: `getCategoryStyles(null)`.
- `frontend/src/pages/RecordForm.tsx:17,144`:
  - Sostituisce `CATEGORIES` import con `useCategories()` hook.
  - Il select (righe 138-149) itera `categories ?? []`; placeholder quando
    vuoto: `t('record.noCategoryAvailable')`.
  - Submit (riga 70): `fd.append('category', category || '')` — stringa vuota
    per relation nullable.
- `frontend/src/components/RecordCard.tsx:88`:
  - `t(\`category.${record.category}\`)` →
    `categories?.find(c => c.id === record.category)?.name ?? t('common.uncategorized')`.
  - Richiede `useCategories()` nell componente (o passaggio della categoria
    risolta come prop, da decidere in implementazione).
- `frontend/src/hooks/useRecords.ts:12` — il filter builder già supporta
  `category = ""` come stringa vuota; nessuna modifica necessaria.

### i18n

**`frontend/src/i18n/locales/it.json`** — modifiche:
- `nav.categories: "Categorie"`
- `common.uncategorized: "Senza categoria"`
- Nuovo namespace `categories`:
  ```json
  "categories": {
    "title": "Categorie",
    "empty": "Nessuna categoria. Aggiungine una per iniziare.",
    "namePlaceholder": "Es. Cardiologia",
    "add": "Aggiungi",
    "addedSuccess": "Categoria creata",
    "deletedSuccess": "Categoria eliminata",
    "duplicateName": "Esiste già una categoria con questo nome",
    "deleteConfirm": "Eliminare \"{name}\"?",
    "deleteConfirmMessage": "I {count, plural, one {# record associato resterà} other {# record associati resteranno}} senza categoria.",
    "usageCount": "{count, plural, one {# record} other {# record}}",
    "noCategoryAvailable": "Crea prima una categoria"
  }
  ```
- Rimosse chiavi `category.visita/esame/referto/altro`.

**`frontend/src/i18n/locales/en.json`** — modifiche speculari:
- `nav.categories: "Categories"`
- `common.uncategorized: "Uncategorized"`
- `categories.*` con testi inglesi, mantenendo lo stesso shape (icu plural
  incluso per `deleteConfirmMessage` e `usageCount`).

## Data Flow

### Creazione categoria

```
Categories.tsx → handleAdd({ name, color })
  → useCreateCategory.mutate({ name, color })
  → pb.collection('categories').create({ name, color, user: userId })
  → invalidate ['categories', ['records']]
  → toast.success(t('categories.addedSuccess'))
```

### Eliminazione categoria

```
Categories.tsx → confirmDelete(id)
  → useDeleteCategory.mutate(id)
  → pb.collection('categories').delete(id)
  → PocketBase: record legati ricevono category = null
  → invalidate ['categories', ['records']]
  → useCategoryCounts refetcha → conteggi aggiornati (record contati in "")
  → toast.success(t('categories.deletedSuccess'))
```

### Filter Timeline con categoria

```
useCategories() → { data: categories }
useRecords({ category: selectedId || undefined })
  → filter: category = "abc123"  (PocketBase accetta ID relation)
  → se selectedId === '' → filter: category = ""
```

## Edge Cases

1. **Record con `category == null`** (categoria eliminata o mai assegnata):
   - Timeline: dot grigio neutro, bordo sinistro `border-l-muted`.
   - `RecordCard`: badge `t('common.uncategorized')`.
   - Filter dropdown: voce "Senza categoria" con valore sentinella `''` →
     `filter: category = ""` (PocketBase lo supporta nativamente).

2. **Nome duplicato (case-insensitive)**: validazione client-side confrontando
   `name.trim().toLowerCase()` con le categorie esistenti. Bottone "Aggiungi"
   disabilitato + messaggio inline. Non implementato lato server (PocketBase
   richiederebbe un unique index composto su `(name, user)`; la complessità
   non giustifica per un'app personale self-hosted single-tenant — chiunque
   abbia accesso al backend è trusted).

3. **Eliminazione durante fetch attivo**: la mutazione è invalidante, non
   ottimistica. `useRecords` rifetcha alla prossima mount/render, mostrando
   i record sopravvissuti con `category = null`.

4. **Eliminazione dell'ultima categoria**: consentita. Tutti i record
   appariranno senza categoria nella Timeline. Filtro "Senza categoria"
   disponibile comunque.

5. **Colore non valido (record legacy, edge case difensivo)**: la funzione
   `getCategoryStyles` ha fallback a stile `null` se il valore di `color` non
   è in `CATEGORY_COLORS`. Difesa contro corruzione dati o migration
   parziali.

6. **Cache stale dopo cambio categoria**: `useCreateCategory` e
   `useDeleteCategory` invalidano sia `['categories']` sia `['records']`. La
   prossima render di Timeline, `RecordCard` e `RecordForm` rifetcha
   correttamente.

## Verification

1. **Migration clean**: `./pocketbase serve` con `pb_data/` wipato → collection
   `categories` creata, `records.category` ora `relation` nullable. Dashboard
   admin: struttura coerente, regole presenti.

2. **Type-check e build**:
   ```
   cd frontend && npm run lint   # tsc --noEmit, zero errori
   cd frontend && npm run build   # build di produzione senza warning
   ```

3. **Flusso principale**:
   - Login con utente nuovo (o dopo wipe di `pb_data/`).
   - `/categories` vuoto → aggiungere 3 categorie (es. "Cardiologia" indigo,
     "Esami lab" sky, "Radiologia" emerald) → appaiono in tabella.
   - Creare 4 record: 2 con Cardiologia, 1 con Esami lab, 1 senza categoria.
   - Timeline: dot e bordi colorati corretti; record senza categoria ha dot
     grigio e badge "Senza categoria".
   - Filtrare per "Cardiologia" → solo 2 record visibili.
   - Filtrare per "Senza categoria" → solo 1 record visibile.

4. **Eliminazione**:
   - Da `/categories`, eliminare "Cardiologia" → dialog mostra "I 2 record
     associati resteranno senza categoria". Conferma.
   - Tabella: "Cardiologia" scompare, "Senza categoria" ora mostra 3 record
     (i 2 prima Cardiologia + quello che era già senza).
   - Timeline: tutti i 4 record visibili, 3 senza categoria.

5. **Duplicato**:
   - Provare ad aggiungere "cardiologia" (minuscolo) quando esiste già
     "Cardiologia" → bottone "Aggiungi" disabilitato, messaggio inline.

6. **i18n**:
   - Switch IT ↔ EN → tutti i label UI aggiornati.
   - Nomi delle categorie ("Cardiologia", "Esami lab") restano identici in
     entrambe le lingue (per design).

7. **Styling**:
   - Light + dark theme: cerchi del color picker visibili in entrambi.
   - Mobile (drawer): `/categories` accessibile dalla sidebar mobile.
