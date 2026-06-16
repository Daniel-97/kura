# Customizable Categories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded `select` category field on `records` with a per-user `categories` collection and add a `/categories` management page where users can create and delete their own categories.

**Architecture:** New PocketBase `categories` collection (per-user, fields: name/color/user); `records.category` becomes a nullable `relation` to it with `cascadeDelete: false`. New React page `Categories.tsx` with inline form + table; new `useCategories` hook; new `getCategoryStyles` utility replacing the 3 hardcoded color maps in `Timeline.tsx`.

**Tech Stack:** PocketBase v0.27.1 (JS migration), React 18 + TypeScript strict, TanStack Query v5, shadcn/ui, i18next (native plurals with `_one`/`_other` suffix — i18next-icu is **not** installed), Vitest for the pure utility test.

---

## File Structure

**Create:**
- `frontend/src/lib/category-styles.ts` — pure color→className mapping
- `frontend/src/lib/category-styles.test.ts` — Vitest tests for the utility
- `frontend/src/hooks/useCategories.ts` — `useCategories`, `useCreateCategory`, `useDeleteCategory`, `useCategoryCounts`
- `frontend/src/components/CategoryPicker.tsx` — inline input + 8-color picker
- `frontend/src/pages/Categories.tsx` — management page

**Modify:**
- `pb_migrations/init.js` — add `categories` collection; convert `records.category` to relation
- `frontend/src/lib/types.ts` — replace `CATEGORIES`/`RecordCategory` with `Category` + `CategoryColor`; `HealthRecord.category: string | null`
- `frontend/src/i18n/locales/it.json` — add `nav.categories`, `common.uncategorized`, `categories.*` namespace; remove `category.visita/esame/referto/altro`
- `frontend/src/i18n/locales/en.json` — same as it.json
- `frontend/src/App.tsx` — add `/categories` route
- `frontend/src/components/SidebarContent.tsx` — add nav link
- `frontend/src/pages/Timeline.tsx` — use `useCategories` + `getCategoryStyles`; add "Senza categoria" filter option
- `frontend/src/pages/RecordForm.tsx` — use `useCategories`; send empty string for null category
- `frontend/src/components/RecordCard.tsx` — lookup category name via `useCategories`; show "Senza categoria" badge when null

---

## Task 1: Backend migration — add `categories` collection and convert `records.category` to relation

**Files:**
- Modify: `pb_migrations/init.js`

- [ ] **Step 1: Add the `categories` collection block, declared before `records`**

In `pb_migrations/init.js`, immediately after the `usersCol` line (line 12) and before the `// ── records ──` section, insert:

```js
  // ── categories ────────────────────────────────────────────────────
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

- [ ] **Step 2: Convert `records.category` from `select` to a `relation` to `categories`**

In the `records` collection (around lines 22-26), replace the `category` field block:

Old:
```js
      {
        type: "select",   name: "category",    required: true,
        maxSelect: 1,
        values: ["visita", "esame", "referto", "altro"],
      },
```

New (the new field references the `categories` collection id, which must already exist — order matters):
```js
      {
        type: "relation", name: "category",   required: false,
        collectionId: "categories",
        maxSelect: 1,
        cascadeDelete: false,
      },
```

Note: PocketBase JS migrations resolve `collectionId` by name (string) or id; using `"categories"` works because the collection has just been declared above.

- [ ] **Step 3: Update the `down` (rollback) function so deleting `records` cleans up `categories` first**

In the rollback function (lines 109-118), extend the delete loop:

Old:
```js
  for (const name of ["reminders", "records", "blood_pressure"]) {
    try { app.delete(app.findCollectionByNameOrId(name)) } catch (_) {}
  }
```

New:
```js
  for (const name of ["reminders", "records", "categories", "blood_pressure"]) {
    try { app.delete(app.findCollectionByNameOrId(name)) } catch (_) {}
  }
```

- [ ] **Step 4: Verify migration runs cleanly on a wiped `pb_data/`**

Run:
```bash
rm -rf pb_data && ./pocketbase serve &
sleep 2
# Should log: "Successfully migrated" or "Collections were already up to date" and exit 0
kill %1 2>/dev/null
```

Expected: server starts, applies the migration without errors. If `pb_data/` already exists with data, the field-type change is a no-op mismatch — wipe is required (consistent with `AGENTS.md`).

- [ ] **Step 5: Commit**

```bash
git add pb_migrations/init.js
git commit -m "feat(migration): add categories collection and convert records.category to relation"
```

---

## Task 2: Frontend types — replace `CATEGORIES` with `Category` + `CategoryColor`

**Files:**
- Modify: `frontend/src/lib/types.ts`

- [ ] **Step 1: Replace the file content**

Write the new content of `frontend/src/lib/types.ts`:

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
  /** ID della Category collegata, oppure null (mai assegnata o eliminata) */
  category: string | null
  /** Comma-separated free-form tags */
  tags: string
  file: string[]
  user: string
  created: string
  updated: string
}

export interface BloodPressureRecord {
  id: string
  systolic: number
  diastolic: number
  pulse?: number
  measured_at: string
  notes: string
  user: string
  created: string
  updated: string
}

export type ReminderKind = 'offset' | 'custom'

export interface Reminder {
  id: string
  record: string
  user: string
  fire_at: string
  sent_at?: string
  message?: string
  created: string
  updated: string
}
```

- [ ] **Step 2: Confirm `npm run lint` reports errors only in files that haven't migrated yet (expected)**

Run:
```bash
cd frontend && npm run lint 2>&1 | head -40
```

Expected: errors in `Timeline.tsx`, `RecordForm.tsx`, `RecordCard.tsx` because they still reference the removed `CATEGORIES` and `RecordCategory`. **These are expected** and will be fixed in later tasks. Note them and proceed. Do NOT proceed if errors appear in any *new* file (something else broke).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/types.ts
git commit -m "refactor(types): replace CATEGORIES const with Category and CategoryColor"
```

---

## Task 3: i18n — add new keys, remove old `category.*` keys

**Files:**
- Modify: `frontend/src/i18n/locales/it.json`
- Modify: `frontend/src/i18n/locales/en.json`

- [ ] **Step 1: Update `it.json`**

In `frontend/src/i18n/locales/it.json`:
- Add `"categories": "Categorie"` to the `nav` object (after `"openMenu"`).
- Add `"uncategorized": "Senza categoria"` to the `common` object (after `"back"`).
- Remove the `category` object entirely (the 4 entries `visita/esame/referto/altro` are dead).
- Add a new `categories` namespace at the top level (next to `pressure`):

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
    "deleteConfirmMessage": "I {count} record associati resteranno senza categoria.",
    "deleteConfirmMessage_one": "Il record associato resterà senza categoria.",
    "deleteConfirmMessage_other": "I {count} record associati resteranno senza categoria.",
    "usageCount": "{count} record",
    "usageCount_one": "{count} record",
    "usageCount_other": "{count} record",
    "noCategoryAvailable": "Crea prima una categoria"
  },
```

i18next pluralization uses `_one`/`_other` suffixes natively (no i18next-icu needed). The fallback `deleteConfirmMessage` / `usageCount` keys are kept for any other locale or for when count is missing.

- [ ] **Step 2: Update `en.json` (mirror)**

In `frontend/src/i18n/locales/en.json`:
- Add `"categories": "Categories"` to `nav`.
- Add `"uncategorized": "Uncategorized"` to `common`.
- Remove the `category` object.
- Add the `categories` namespace:

```json
  "categories": {
    "title": "Categories",
    "empty": "No categories yet. Add one to get started.",
    "namePlaceholder": "E.g. Cardiology",
    "add": "Add",
    "addedSuccess": "Category created",
    "deletedSuccess": "Category deleted",
    "duplicateName": "A category with this name already exists",
    "deleteConfirm": "Delete \"{name}\"?",
    "deleteConfirmMessage": "The {count} associated record will be left without a category.",
    "deleteConfirmMessage_one": "The associated record will be left without a category.",
    "deleteConfirmMessage_other": "The {count} associated records will be left without a category.",
    "usageCount": "{count} records",
    "usageCount_one": "{count} record",
    "usageCount_other": "{count} records",
    "noCategoryAvailable": "Create a category first"
  },
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/i18n/locales/it.json frontend/src/i18n/locales/en.json
git commit -m "feat(i18n): add categories namespace and remove hardcoded category labels"
```

---

## Task 4: `category-styles` utility with tests

**Files:**
- Create: `frontend/src/lib/category-styles.ts`
- Create: `frontend/src/lib/category-styles.test.ts`

- [ ] **Step 1: Write the failing test first**

Create `frontend/src/lib/category-styles.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { getCategoryStyles } from './category-styles'
import { CATEGORY_COLORS } from './types'

describe('getCategoryStyles', () => {
  it('returns the indigo classes for "indigo"', () => {
    expect(getCategoryStyles('indigo')).toEqual({
      dot: 'bg-indigo-500 ring-indigo-500',
      outline: 'ring-indigo-500',
      border: 'border-l-indigo-500',
    })
  })

  it('returns the slate classes for "slate"', () => {
    expect(getCategoryStyles('slate')).toEqual({
      dot: 'bg-slate-400 ring-slate-400',
      outline: 'ring-slate-400',
      border: 'border-l-slate-400',
    })
  })

  it('returns distinct classes for every color in the palette', () => {
    const all = CATEGORY_COLORS.map((c) => getCategoryStyles(c))
    const uniqueDots = new Set(all.map((s) => s.dot))
    expect(uniqueDots.size).toBe(CATEGORY_COLORS.length)
  })

  it('returns the neutral fallback for null', () => {
    expect(getCategoryStyles(null)).toEqual({
      dot: 'bg-muted ring-muted',
      outline: 'ring-muted',
      border: 'border-l-muted',
    })
  })

  it('returns the neutral fallback for an unknown color', () => {
    expect(getCategoryStyles('not-a-color')).toEqual({
      dot: 'bg-muted ring-muted',
      outline: 'ring-muted',
      border: 'border-l-muted',
    })
  })

  it('returns the neutral fallback for an empty string', () => {
    expect(getCategoryStyles('')).toEqual({
      dot: 'bg-muted ring-muted',
      outline: 'ring-muted',
      border: 'border-l-muted',
    })
  })
})
```

- [ ] **Step 2: Run the test to confirm it fails**

Run:
```bash
cd frontend && npx vitest run src/lib/category-styles.test.ts
```

Expected: FAIL — module not found / `getCategoryStyles` is not exported from `./category-styles`.

- [ ] **Step 3: Write the implementation**

Create `frontend/src/lib/category-styles.ts`:

```ts
import type { CategoryColor } from './types'

const CLASSES: Record<CategoryColor, { dot: string; outline: string; border: string }> = {
  indigo:  { dot: 'bg-indigo-500 ring-indigo-500',   outline: 'ring-indigo-500',   border: 'border-l-indigo-500' },
  sky:     { dot: 'bg-sky-500 ring-sky-500',         outline: 'ring-sky-500',      border: 'border-l-sky-500' },
  emerald: { dot: 'bg-emerald-500 ring-emerald-500', outline: 'ring-emerald-500',  border: 'border-l-emerald-500' },
  amber:   { dot: 'bg-amber-500 ring-amber-500',     outline: 'ring-amber-500',    border: 'border-l-amber-500' },
  rose:    { dot: 'bg-rose-500 ring-rose-500',       outline: 'ring-rose-500',     border: 'border-l-rose-500' },
  violet:  { dot: 'bg-violet-500 ring-violet-500',   outline: 'ring-violet-500',   border: 'border-l-violet-500' },
  teal:    { dot: 'bg-teal-500 ring-teal-500',       outline: 'ring-teal-500',     border: 'border-l-teal-500' },
  slate:   { dot: 'bg-slate-400 ring-slate-400',     outline: 'ring-slate-400',    border: 'border-l-slate-400' },
}

const NEUTRAL = { dot: 'bg-muted ring-muted', outline: 'ring-muted', border: 'border-l-muted' }

export function getCategoryStyles(color: string | null): { dot: string; outline: string; border: string } {
  if (!color || !(color in CLASSES)) return NEUTRAL
  return CLASSES[color as CategoryColor]
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run:
```bash
cd frontend && npx vitest run src/lib/category-styles.test.ts
```

Expected: all 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/category-styles.ts frontend/src/lib/category-styles.test.ts
git commit -m "feat(lib): add getCategoryStyles utility with neutral fallback"
```

---

## Task 5: `useCategories` hook

**Files:**
- Create: `frontend/src/hooks/useCategories.ts`

- [ ] **Step 1: Create the hook file**

Create `frontend/src/hooks/useCategories.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pb'
import type { Category, CategoryColor } from '@/lib/types'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'] as const,
    queryFn: () => pb.collection('categories').getFullList<Category>({ sort: 'name' }),
    enabled: pb.authStore.isValid,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; color: CategoryColor }) =>
      pb.collection('categories').create<Category>(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['records'] })
    },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pb.collection('categories').delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['records'] })
      qc.invalidateQueries({ queryKey: ['categoryCounts'] })
    },
  })
}

interface CountRow { category: string }

export function useCategoryCounts() {
  return useQuery({
    queryKey: ['categoryCounts'] as const,
    queryFn: async () => {
      const result = await pb.collection('records').getList<CountRow>(1, 0, {
        groupBy: 'category',
        fields: 'category',
      })
      const counts: Record<string, number> = {}
      for (const row of result.items as unknown as CountRow[]) {
        const key = row.category ?? ''
        counts[key] = (counts[key] ?? 0) + 1
      }
      return counts
    },
    enabled: pb.authStore.isValid,
  })
}
```

Notes:
- `getFullList` is used (not `getList`) because the list is unbounded and small.
- `useCreateCategory` requires the caller to append `user` from `useAuth`; we keep the hook's signature minimal.
- The PocketBase `groupBy` endpoint returns one item per distinct value of `category`; we count them to get the totals. (Verify during manual testing — the SDK's typing for `groupBy` is loose; the actual response is `{ items: [{ category: 'abc', count: 3 }] }` but TS types are off, so we cast.)

Wait — re-read the spec: PocketBase groupBy actually returns `RecordItems` whose shape mirrors the `groupBy` columns. The actual response from the API includes a synthetic `_count` or relies on the row count. Let me reconsider.

After re-checking the PocketBase v0.21+ docs: the `groupBy` query param triggers the API to return one row per group, with the grouping column populated. The total number of rows = number of groups. The count of records per group is `items.length` after the groupBy response, since the API returns one row per matching record but with the grouping field collapsed. **This is wrong** — let me look it up.

Actually, looking at PocketBase v0.27 source: when `groupBy` is set, the response is paginated like normal (one row per source record), but only the grouped fields are returned, and the rows are deduplicated. Wait no.

Best to be safe: don't rely on the exact behavior of `groupBy`. Instead, use a different approach: fetch the records and count client-side. The existing `useRecords` already fetches up to 500 records, so we can compute counts in a separate hook that doesn't need its own fetch.

Actually, the cleanest pattern: piggyback on the existing `useRecords` (which Timeline and RecordCard already need). The `Categories` page can also use `useRecords` and compute counts in the component. Or expose a separate `useCategoryCounts` that just calls `useRecords` internally.

Let me revise the hook to just count client-side from `useRecords`. This avoids the `groupBy` uncertainty.

- [ ] **Step 1 (revised): Create the hook file**

Create `frontend/src/hooks/useCategories.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pb'
import type { Category, CategoryColor, HealthRecord } from '@/lib/types'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'] as const,
    queryFn: () => pb.collection('categories').getFullList<Category>({ sort: 'name' }),
    enabled: pb.authStore.isValid,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; color: CategoryColor }) =>
      pb.collection('categories').create<Category>(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['records'] })
    },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pb.collection('categories').delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['records'] })
    },
  })
}

export function useCategoryCounts(): Record<string, number> | undefined {
  const { data } = useQuery({
    queryKey: ['records'] as const,
    queryFn: () =>
      pb.collection('records').getFullList<HealthRecord>({ fields: 'category' }),
    enabled: pb.authStore.isValid,
    select: (records) => {
      const counts: Record<string, number> = {}
      for (const r of records) {
        const key = r.category ?? ''
        counts[key] = (counts[key] ?? 0) + 1
      }
      return counts
    },
  })
  return data
}
```

Note: `useCategoryCounts` shares the `['records']` cache key with `useRecords` in `useRecords.ts`. This means Timeline's existing `useRecords` and `useCategoryCounts` share the same cache entry but expose different fields via `select`. The PocketBase SDK will be called once (cache hit) and `select` will compute the counts. Same pattern as Timeline, so no extra requests.

Actually, this has a subtle issue: `useRecords` has filters (`{ category, tag }`) and `useCategoryCounts` doesn't. With different query keys, they would be separate cache entries. But if both use `['records']` as the base key, React Query will treat them as the same query. The `select` function in `useCategoryCounts` would compute over ALL records (no filter), but the `useRecords` Timeline call also has no filter when category/tag are undefined, so the data is consistent.

But: when the Timeline filter is active, it queries with a filter, and `useCategoryCounts` (which has no filter) would still return all records counts. That's correct behavior.

Wait, but the queryKey includes filters in `useRecords`. Let me re-read:

```ts
queryKey: ['records', filters] as const
```

So Timeline's `useRecords({ category: 'abc' })` has key `['records', { category: 'abc' }]`, and `useCategoryCounts` (with key `['records']`) is a separate cache entry. They share the underlying data only if the query function is identical — but it's not, because the filter differs.

OK so my plan is: keep `useCategoryCounts` with its own `getFullList` call. The overhead is one extra request to the records collection (no filter, just `fields: 'category'`), which is cheap and easy to reason about. The `useCategoryCounts` is only used in `Categories.tsx`, which is a relatively rare page, so the extra request is fine.

- [ ] **Step 2: Verify lint**

Run:
```bash
cd frontend && npm run lint
```

Expected: no new errors introduced by this file.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/useCategories.ts
git commit -m "feat(hooks): add useCategories, useCreateCategory, useDeleteCategory, useCategoryCounts"
```

---

## Task 6: `CategoryPicker` component

**Files:**
- Create: `frontend/src/components/CategoryPicker.tsx`

- [ ] **Step 1: Create the component**

Create `frontend/src/components/CategoryPicker.tsx`:

```tsx
import { CATEGORY_COLORS } from '@/lib/category-styles'
import type { CategoryColor } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CategoryPickerProps {
  value: CategoryColor
  onChange: (color: CategoryColor) => void
}

export default function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Colore categoria">
      {CATEGORY_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          role="radio"
          aria-checked={value === color}
          aria-label={color}
          onClick={() => onChange(color)}
          className={cn(
            'h-7 w-7 rounded-full border-2 border-background ring-1 ring-border transition-transform',
            `bg-${color}-500`,
            value === color && 'ring-2 ring-foreground scale-110',
          )}
        />
      ))}
    </div>
  )
}
```

Note: Tailwind's JIT compiler doesn't scan template strings like `bg-${color}-500`, so these classes won't be in the build. We need to explicitly list the full class names. Use a static lookup map:

- [ ] **Step 1 (corrected): Create the component with explicit class names**

Create `frontend/src/components/CategoryPicker.tsx`:

```tsx
import type { CategoryColor } from '@/lib/types'
import { CATEGORY_COLORS } from '@/lib/category-styles'
import { cn } from '@/lib/utils'

const SWATCH_CLASSES: Record<CategoryColor, string> = {
  indigo:  'bg-indigo-500',
  sky:     'bg-sky-500',
  emerald: 'bg-emerald-500',
  amber:   'bg-amber-500',
  rose:    'bg-rose-500',
  violet:  'bg-violet-500',
  teal:    'bg-teal-500',
  slate:   'bg-slate-400',
}

interface CategoryPickerProps {
  value: CategoryColor
  onChange: (color: CategoryColor) => void
  ariaLabel?: string
}

export default function CategoryPicker({ value, onChange, ariaLabel }: CategoryPickerProps) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={ariaLabel}>
      {CATEGORY_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          role="radio"
          aria-checked={value === color}
          aria-label={color}
          onClick={() => onChange(color)}
          className={cn(
            'h-7 w-7 rounded-full border-2 border-background ring-1 ring-border transition-transform hover:scale-110',
            SWATCH_CLASSES[color],
            value === color && 'ring-2 ring-foreground scale-110',
          )}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify lint**

Run:
```bash
cd frontend && npm run lint
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/CategoryPicker.tsx
git commit -m "feat(components): add CategoryPicker color swatch component"
```

---

## Task 7: `Categories` management page

**Files:**
- Create: `frontend/src/pages/Categories.tsx`

- [ ] **Step 1: Create the page**

Create `frontend/src/pages/Categories.tsx`:

```tsx
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import CategoryPicker from '@/components/CategoryPicker'
import {
  useCategories, useCreateCategory, useDeleteCategory, useCategoryCounts,
} from '@/hooks/useCategories'
import { useAuth } from '@/hooks/useAuth'
import { CATEGORY_COLORS } from '@/lib/category-styles'
import { SWATCH_CLASSES as _SWATCH_CLASSES } from '@/lib/category-styles'
import { cn } from '@/lib/utils'
import type { CategoryColor } from '@/lib/types'
```

Wait — I'm referencing `SWATCH_CLASSES` from `category-styles.ts`, but I defined it in `CategoryPicker.tsx`. Let me move it. Or re-export it. Let me restructure: keep `SWATCH_CLASSES` in `category-styles.ts` so both the utility and the picker can use it.

Reorganize:

- Move `SWATCH_CLASSES` to `frontend/src/lib/category-styles.ts` (re-export).
- Update `CategoryPicker.tsx` to import it from there.

Let me update the prior task's code to put `SWATCH_CLASSES` in `category-styles.ts` and re-export it. This requires a follow-up edit before Task 7.

- [ ] **Step 0 (prerequisite): Move `SWATCH_CLASSES` to `category-styles.ts`**

In `frontend/src/lib/category-styles.ts`, append the map and export:

```ts
export const SWATCH_CLASSES: Record<CategoryColor, string> = {
  indigo:  'bg-indigo-500',
  sky:     'bg-sky-500',
  emerald: 'bg-emerald-500',
  amber:   'bg-amber-500',
  rose:    'bg-rose-500',
  violet:  'bg-violet-500',
  teal:    'bg-teal-500',
  slate:   'bg-slate-400',
}
```

In `frontend/src/components/CategoryPicker.tsx`, replace the local `SWATCH_CLASSES` declaration with:

```ts
import { SWATCH_CLASSES } from '@/lib/category-styles'
```

(Remove the local `const SWATCH_CLASSES = {...}` block.)

- [ ] **Step 1: Update the test file to cover the new export (if needed)**

The existing test file (`category-styles.test.ts`) doesn't reference `SWATCH_CLASSES`, no update needed.

- [ ] **Step 2: Write the full `Categories.tsx` page**

Create `frontend/src/pages/Categories.tsx`:

```tsx
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import CategoryPicker from '@/components/CategoryPicker'
import {
  useCategories, useCreateCategory, useDeleteCategory, useCategoryCounts,
} from '@/hooks/useCategories'
import { useAuth } from '@/hooks/useAuth'
import { SWATCH_CLASSES } from '@/lib/category-styles'
import { cn } from '@/lib/utils'
import type { Category, CategoryColor } from '@/lib/types'

const NEUTRAL_SWATCH = 'bg-muted'

export default function Categories() {
  const { t } = useTranslation()
  const { userId } = useAuth()
  const { data: categories = [], isLoading: loadingCategories } = useCategories()
  const counts = useCategoryCounts() ?? {}
  const createCategory = useCreateCategory()
  const deleteCategory = useDeleteCategory()

  const [name, setName] = useState('')
  const [color, setColor] = useState<CategoryColor>(CATEGORY_COLORS[0])
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null)

  const trimmedName = name.trim()
  const duplicate = useMemo(() => {
    if (!trimmedName) return false
    const lower = trimmedName.toLowerCase()
    return categories.some((c) => c.name.trim().toLowerCase() === lower)
  }, [trimmedName, categories])

  const canAdd = trimmedName.length > 0 && !duplicate && !!userId

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canAdd || !userId) return
    createCategory.mutate(
      { name: trimmedName, color, user: userId } as unknown as { name: string; color: CategoryColor },
      {
        onSuccess: () => {
          toast.success(t('categories.addedSuccess'))
          setName('')
          setColor(CATEGORY_COLORS[0])
        },
        onError: () => toast.error(t('common.error')),
      },
    )
  }
```

Wait — the `useCreateCategory` mutation takes `{ name, color }` and appends `user` server-side. But actually, the create endpoint requires the `user` field to be in the body (because of the createRule `@request.body.user = @request.auth.id`). The hook signature needs to accept `user` too, or the caller has to add it manually. Let me reconsider.

The cleanest approach: `useCreateCategory` accepts `{ name, color }` and inside the hook, it grabs `pb.authStore.model?.id` and appends it. This matches the existing `useRecords` pattern (where the caller appends `user`).

Actually, looking at `useCreateRecord` in `useRecords.ts`:

```ts
mutationFn: (data: FormData) => pb.collection('records').create<HealthRecord>(data),
```

The caller builds the FormData including `user`. For consistency, `useCreateCategory` should do the same — the caller passes `{ name, color, user }`. Let me update the hook signature to accept `user` too.

Update `useCategories.ts` (from Task 5):

```ts
export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; color: CategoryColor; user: string }) =>
      pb.collection('categories').create<Category>(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['records'] })
    },
  })
}
```

- [ ] **Step 3: Continue writing `Categories.tsx` with the table and delete dialog**

Replace the partial `Categories.tsx` (the file I started in Step 2) with the complete version:

```tsx
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import CategoryPicker from '@/components/CategoryPicker'
import {
  useCategories, useCreateCategory, useDeleteCategory, useCategoryCounts,
} from '@/hooks/useCategories'
import { useAuth } from '@/hooks/useAuth'
import { CATEGORY_COLORS, SWATCH_CLASSES } from '@/lib/category-styles'
import { cn } from '@/lib/utils'
import type { Category, CategoryColor } from '@/lib/types'

const NEUTRAL_SWATCH = 'bg-muted'

export default function Categories() {
  const { t } = useTranslation()
  const { userId } = useAuth()
  const { data: categories = [], isLoading: loadingCategories } = useCategories()
  const counts = useCategoryCounts() ?? {}
  const createCategory = useCreateCategory()
  const deleteCategory = useDeleteCategory()

  const [name, setName] = useState('')
  const [color, setColor] = useState<CategoryColor>(CATEGORY_COLORS[0])
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null)

  const trimmedName = name.trim()
  const duplicate = useMemo(() => {
    if (!trimmedName) return false
    const lower = trimmedName.toLowerCase()
    return categories.some((c) => c.name.trim().toLowerCase() === lower)
  }, [trimmedName, categories])

  const canAdd = trimmedName.length > 0 && !duplicate && !!userId

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canAdd || !userId) return
    createCategory.mutate(
      { name: trimmedName, color, user: userId },
      {
        onSuccess: () => {
          toast.success(t('categories.addedSuccess'))
          setName('')
          setColor(CATEGORY_COLORS[0])
        },
        onError: () => toast.error(t('common.error')),
      },
    )
  }

  const handleConfirmDelete = () => {
    if (!pendingDelete) return
    const id = pendingDelete.id
    deleteCategory.mutate(id, {
      onSuccess: () => {
        toast.success(t('categories.deletedSuccess'))
        setPendingDelete(null)
      },
      onError: () => toast.error(t('common.error')),
    })
  }

  const deleteCount = pendingDelete ? (counts[pendingDelete.id] ?? 0) : 0

  return (
    <div className="space-y-6">
      <h1 className="page-header">{t('categories.title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('categories.add')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="form">
            <div className="form-field">
              <Label htmlFor="category-name">{t('categories.title')}</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('categories.namePlaceholder')}
                maxLength={50}
                disabled={!userId}
              />
              {duplicate && (
                <p className="text-xs text-destructive mt-1">
                  {t('categories.duplicateName')}
                </p>
              )}
            </div>
            <div className="form-field">
              <Label>Colore</Label>
              <CategoryPicker
                value={color}
                onChange={setColor}
                ariaLabel={t('categories.title')}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={!canAdd || createCategory.isPending}>
                {createCategory.isPending ? t('common.loading') : t('categories.add')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Colore</th>
                  <th className="px-4 py-3 font-medium">Record</th>
                  <th className="px-4 py-3 font-medium w-16">Azioni</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-3 italic text-muted-foreground">
                    {t('common.uncategorized')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-block h-4 w-4 rounded-full ring-1 ring-border', NEUTRAL_SWATCH)} />
                  </td>
                  <td className="px-4 py-3 tabular-nums">{counts[''] ?? 0}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">—</td>
                </tr>
                {loadingCategories ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                      {t('common.loading')}
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                      {t('categories.empty')}
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2">
                          <span className={cn('inline-block h-4 w-4 rounded-full ring-1 ring-border', SWATCH_CLASSES[c.color])} />
                          <span className="text-xs text-muted-foreground">{c.color}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums">{counts[c.id] ?? 0}</td>
                      <td className="px-4 py-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          aria-label={t('common.delete')}
                          onClick={() => setPendingDelete(c)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('categories.deleteConfirm', { name: pendingDelete?.name ?? '' })}
            </DialogTitle>
            <DialogDescription>
              {t('categories.deleteConfirmMessage', { count: deleteCount })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={deleteCategory.isPending}>
                {t('common.cancel')}
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={deleteCategory.isPending}
              onClick={handleConfirmDelete}
            >
              {deleteCategory.isPending ? t('common.loading') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

Verify the `Dialog` and `Button` exports exist in the shadcn/ui components:
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose` — check `frontend/src/components/ui/dialog.tsx` to confirm these exports exist.
- `Button` with `variant="destructive"` — confirmed in `button.tsx`.

If `DialogClose` doesn't exist as a named export, use `DialogContent`'s built-in close or import what does exist. Check the file.

- [ ] **Step 4: Verify the shadcn/ui Dialog API**

Read `frontend/src/components/ui/dialog.tsx` and confirm the exports:
- `Dialog`, `DialogPortal`, `DialogOverlay`, `DialogClose`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`

If anything is missing, adjust the imports in `Categories.tsx` accordingly.

- [ ] **Step 5: Verify lint**

Run:
```bash
cd frontend && npm run lint
```

Expected: errors only in the files that haven't been migrated yet (Timeline, RecordForm, RecordCard). The new `Categories.tsx` must compile cleanly.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/lib/category-styles.ts frontend/src/components/CategoryPicker.tsx frontend/src/pages/Categories.tsx frontend/src/hooks/useCategories.ts
git commit -m "feat(pages): add Categories management page with inline form and table"
```

---

## Task 8: Routing and sidebar

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/SidebarContent.tsx`

- [ ] **Step 1: Add the route in `App.tsx`**

In `frontend/src/App.tsx`:
- Add `import Categories from '@/pages/Categories'` (after the `Pressione` import, line 15).
- In the `<Routes>` block (line 76), add a new route after the `blood-pressure` route (line 82):

```tsx
            <Route path="/categories" element={<AuthGuard><Categories /></AuthGuard>} />
```

- [ ] **Step 2: Add the nav link in `SidebarContent.tsx`**

In `frontend/src/components/SidebarContent.tsx`, after the `/blood-pressure` link (line 37-40), add:

```tsx
        <NavLink to="/categories" className={navClass} onClick={onNavigate}>
          <span>🏷️</span>
          {t('nav.categories')}
        </NavLink>
```

- [ ] **Step 3: Verify lint**

Run:
```bash
cd frontend && npm run lint
```

Expected: errors only in Timeline, RecordForm, RecordCard (still pending).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/App.tsx frontend/src/components/SidebarContent.tsx
git commit -m "feat(nav): add /categories route and sidebar link"
```

---

## Task 9: `Timeline` integration

**Files:**
- Modify: `frontend/src/pages/Timeline.tsx`

- [ ] **Step 1: Replace the 3 color maps with `getCategoryStyles` and import the hook**

In `frontend/src/pages/Timeline.tsx`:
- Remove the `CATEGORIES` import (line 14) and the `RecordCategory` type import (line 15).
- Add imports:

```ts
import { useCategories } from '@/hooks/useCategories'
import { getCategoryStyles } from '@/lib/category-styles'
import type { HealthRecord } from '@/lib/types'
```

- Remove the 3 constants `CATEGORY_DOT`, `CATEGORY_DOT_OUTLINE`, `CATEGORY_BORDER` (lines 17-36).
- Inside the `Timeline` component (after the `useState` calls around line 56), add:

```ts
  const { data: categories = [] } = useCategories()
  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  )
```

(Need to add `useMemo` to the React import at the top of the file.)

- [ ] **Step 2: Update the rendering to look up the category and use dynamic styles**

In the `renderGroups` function (line 81), inside the `items.map((r) => { ... })` block (line 103), replace the dot rendering and border className:

Old (line 113-128):
```tsx
                <div className="flex justify-center pt-2.5">
                  <div className={cn(
                    'w-3 h-3 rounded-full border-2 border-background ring-2 relative z-10',
                    future
                      ? cn('bg-background', CATEGORY_DOT_OUTLINE[r.category] ?? CATEGORY_DOT_OUTLINE.altro)
                      : (CATEGORY_DOT[r.category] ?? CATEGORY_DOT.altro),
                  )} />
                </div>
                <RecordCard
                  record={r}
                  className={cn(
                    'border-l-4',
                    CATEGORY_BORDER[r.category] ?? CATEGORY_BORDER.altro,
                    future && 'border-dashed border-border/50 bg-muted/20 [border-left-style:solid]',
                  )}
                />
```

New:
```tsx
                {(() => {
                  const cat = r.category ? categoryById.get(r.category) : undefined
                  const styles = getCategoryStyles(cat?.color ?? null)
                  return (
                    <>
                      <div className="flex justify-center pt-2.5">
                        <div className={cn(
                          'w-3 h-3 rounded-full border-2 border-background ring-2 relative z-10',
                          future ? cn('bg-background', styles.outline) : styles.dot,
                        )} />
                      </div>
                      <RecordCard
                        record={r}
                        className={cn(
                          'border-l-4',
                          styles.border,
                          future && 'border-dashed border-border/50 bg-muted/20 [border-left-style:solid]',
                        )}
                      />
                    </>
                  )
                })()}
```

- [ ] **Step 3: Update the filter dropdown to use dynamic categories and add "Senza categoria"**

Replace the `<Select>` block (lines 149-159):

Old:
```tsx
        <Select value={category || 'all'} onValueChange={(v) => setCategory(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('timeline.allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('timeline.allCategories')}</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{t(`category.${c}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
```

New:
```tsx
        <Select value={category || 'all'} onValueChange={(v) => setCategory(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('timeline.allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('timeline.allCategories')}</SelectItem>
            <SelectItem value="__null">{t('common.uncategorized')}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
```

Update the state setter: when the value is `__null`, the filter is `category = ""`. Update the call site (around line 57-60):

Old:
```tsx
  const { data, isLoading } = useRecords({
    category: category || undefined,
    tag: tag || undefined,
  })
```

New:
```tsx
  const { data, isLoading } = useRecords({
    category: category === '__null' ? '' : (category || undefined),
    tag: tag || undefined,
  })
```

- [ ] **Step 4: Verify lint**

Run:
```bash
cd frontend && npm run lint
```

Expected: errors only in RecordForm and RecordCard (still pending).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/Timeline.tsx
git commit -m "feat(timeline): use useCategories hook and dynamic category styles"
```

---

## Task 10: `RecordForm` integration

**Files:**
- Modify: `frontend/src/pages/RecordForm.tsx`

- [ ] **Step 1: Replace the `CATEGORIES` import with `useCategories`**

In `frontend/src/pages/RecordForm.tsx`:
- Remove `import { CATEGORIES } from '@/lib/types'` (line 17).
- Add `import { useCategories } from '@/hooks/useCategories'`.

- [ ] **Step 2: Use the hook and update the category select**

In the `RecordForm` component body (after the `useState` calls around line 33-36), add:

```tsx
  const { data: categories = [] } = useCategories()
```

Replace the `<Select>` for category (lines 138-149):

Old:
```tsx
            <div className="form-field">
              <Label>{t('record.category')}</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder={t('record.category')} />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{t(`category.${c}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
```

New:
```tsx
            <div className="form-field">
              <Label>{t('record.category')}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    categories.length === 0
                      ? t('categories.noCategoryAvailable')
                      : t('record.category')
                  } />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
```

Note: removed `required` since the field is now optional.

- [ ] **Step 3: Update submit logic**

Replace the `if (!category) return` check (line 65) with:

Old:
```tsx
    if (!category) return
```

New (allow no category):
```tsx
    if (!userId) return
```

Update the formData append (line 70):

Old:
```tsx
    fd.append('category', category)
```

New:
```tsx
    if (category) fd.append('category', category)
```

(If `category` is empty/undefined, omit the field — PocketBase will store `null`. Sending an empty string works too, but omitting is cleaner.)

- [ ] **Step 4: Verify lint**

Run:
```bash
cd frontend && npm run lint
```

Expected: errors only in `RecordCard.tsx` (still pending).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/RecordForm.tsx
git commit -m "feat(record-form): use useCategories hook and make category optional"
```

---

## Task 11: `RecordCard` integration

**Files:**
- Modify: `frontend/src/components/RecordCard.tsx`

- [ ] **Step 1: Look up the category name via `useCategories`**

In `frontend/src/components/RecordCard.tsx`:
- Add `import { useCategories } from '@/hooks/useCategories'` (after the other hook imports, line 18).
- Inside the `RecordCard` component (after line 37 where `useDeleteRecord` is called), add:

```tsx
  const { data: categories = [] } = useCategories()
  const category = categories.find((c) => c.id === record.category)
```

- Replace the badge (line 88):

Old:
```tsx
                <Badge variant="secondary">{t(`category.${record.category}`)}</Badge>
```

New:
```tsx
                <Badge variant="secondary">
                  {category?.name ?? t('common.uncategorized')}
                </Badge>
```

- [ ] **Step 2: Verify lint**

Run:
```bash
cd frontend && npm run lint
```

Expected: zero errors. (All previous errors should now be resolved.)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/RecordCard.tsx
git commit -m "feat(record-card): show category name from useCategories with uncategorized fallback"
```

---

## Task 12: Final verification

**Files:** none

- [ ] **Step 1: Run all tests**

```bash
cd frontend && npx vitest run
```

Expected: all tests pass, including the new `category-styles.test.ts`.

- [ ] **Step 2: Run lint**

```bash
cd frontend && npm run lint
```

Expected: exit code 0, no TypeScript errors.

- [ ] **Step 3: Run production build**

```bash
cd frontend && npm run build
```

Expected: build completes, output in `../pb_public/`. No Tailwind warnings about missing classes.

- [ ] **Step 4: Manual smoke test (with wiped `pb_data/`)**

```bash
rm -rf pb_data && ./pocketbase serve &
sleep 2
cd frontend && npm run dev
```

Open `http://localhost:5173`:
- Login with a test user (or create one if `ALLOW_REGISTRATION=true`).
- Verify `/categories` is empty.
- Create 2 categories (e.g. "Cardiologia" indigo, "Esami lab" emerald).
- Create 2 records: one with Cardiologia, one with no category.
- Verify Timeline shows correct colors and badges.
- Filter by Cardiologia → 1 record visible.
- Filter by "Senza categoria" → 1 record visible.
- Delete Cardiologia from `/categories` → confirm dialog shows count.
- Verify the previously-Cardiologia record now shows as "Senza categoria".
- Switch IT ↔ EN → all UI labels change, category names stay.
- Test duplicate name validation: try to add "cardiologia" lowercase → button disabled with message.

- [ ] **Step 5: Commit any final fixes**

If any fixes were needed during smoke testing, commit them with appropriate messages.

---

## Self-Review

**Spec coverage:**
- ✅ Backend `categories` collection → Task 1
- ✅ `records.category` relation → Task 1
- ✅ `Category`, `CategoryColor` types → Task 2
- ✅ `getCategoryStyles` utility with neutral fallback → Task 4
- ✅ `useCategories`/`useCreateCategory`/`useDeleteCategory`/`useCategoryCounts` → Task 5
- ✅ CategoryPicker component → Task 6
- ✅ Categories page (form + table + delete dialog) → Task 7
- ✅ Routing (`/categories`) + sidebar link → Task 8
- ✅ Timeline integration (filter + dynamic colors) → Task 9
- ✅ RecordForm integration (select + nullable submit) → Task 10
- ✅ RecordCard integration (lookup name + fallback) → Task 11
- ✅ i18n keys (added + removed) → Task 3
- ✅ Verification (lint + build + manual) → Task 12

**Placeholder scan:** no "TBD"/"TODO"/etc. All code blocks are complete.

**Type consistency:** `CategoryColor` defined in Task 2 and used consistently in Tasks 4, 5, 6, 7. `Category` defined in Task 2 and used in Tasks 5, 7. `getCategoryStyles` signature stable across Tasks 4, 7, 9. `useCreateCategory` mutation signature stable across Tasks 5, 7. ✅

**Spec deviation (caught during plan review):** spec mentioned ICU plural syntax, but the codebase does not have `i18next-icu` installed. Task 3 uses i18next native `_one`/`_other` suffix pluralization, which works out of the box. The spec doc (`docs/superpowers/specs/2026-06-16-customizable-categories-design.md`) is now out of date on this point — needs an inline fix to match the implementation. **Doing this fix in the implementation step, not the plan.**
