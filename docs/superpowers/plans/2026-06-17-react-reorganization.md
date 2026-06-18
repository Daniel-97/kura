# React Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the Kura frontend from a role-based folder layout (`pages/`, `components/`, `hooks/`, `lib/`) to a feature-based layout (`features/<feature>/` + `components/shell/`), and extract the route table from `App.tsx` into a typed `lib/routes.ts`. No behavior change, no new dependencies, no code-splitting, no CSS Modules.

**Architecture:** Pure file moves with import updates. Each task moves one feature's files (pages, components, hooks, utils, tests) into `frontend/src/features/<feature>/` using `git mv` (preserves history), updates within-feature imports to relative paths and cross-feature imports to `@/features/...`, then verifies `npm run lint` (TypeScript `--noEmit`) passes. A final task creates `lib/routes.ts` and refactors `App.tsx` to consume it. `components/ui/` (shadcn), `lib/pb.ts`, `lib/utils.ts`, `lib/types.ts`, `i18n/`, `main.tsx`, `index.css` are never moved.

**Tech Stack:** React 18, TypeScript 5 (strict, `noUnusedLocals`, `noUnusedParameters`), Vite 6, path alias `@/` → `./src/*` (configured in both `tsconfig.json` and `vite.config.ts`), Vitest 4 for the two existing pure-utility tests.

## Global Constraints

- TypeScript strict mode ON; `any` banned. `npm run lint` = `tsc --noEmit` must pass after every task.
- Path alias `@/` points to `frontend/src/` (e.g. `@/features/auth/Login` → `src/features/auth/Login.tsx`).
- **Within-feature imports use relative paths** (`./useAuth`, `../useRecords`); **cross-feature / shell / ui / lib-shared / i18n imports use `@/`**.
- `components/ui/` (shadcn) files are NEVER moved or edited.
- `lib/pb.ts`, `lib/utils.ts`, `lib/types.ts`, `i18n/`, `main.tsx`, `index.css` are NEVER moved.
- Use `git mv` for every file move (preserves history). Create feature directories with `mkdir -p` before the first move into them.
- No `React.lazy`, no code-splitting, no CSS Modules.
- Each task ends with `npm run lint` passing AND `npm test` passing (where the task touches tested files) before committing.
- Commit message style: lowercase conventional commits (matches repo: `refactor(...)`, `feat(...)`, `chore(...)`).
- Working directory for all `npm` commands: `frontend/`. For `git mv`: repo root.

---

## File Structure

**Create (directories):**
- `frontend/src/features/auth/`
- `frontend/src/features/records/`
- `frontend/src/features/blood-pressure/`
- `frontend/src/features/categories/`
- `frontend/src/features/reminders/`
- `frontend/src/components/shell/`

**Create (files):**
- `frontend/src/features/auth/AuthGuard.tsx` — extracted from `App.tsx` inline component
- `frontend/src/lib/routes.ts` — typed route table consumed by `App.tsx`

**Move (via `git mv`):**
- `pages/Login.tsx`, `pages/Register.tsx`, `hooks/useAuth.ts`, `hooks/useRegister.ts` → `features/auth/`
- `pages/Pressione.tsx`, `components/BloodPressureChart.tsx`, `hooks/useBloodPressure.ts`, `lib/bloodPressureUtils.ts`, `lib/bloodPressureUtils.test.ts` → `features/blood-pressure/`
- `pages/Categories.tsx`, `components/CategoryPicker.tsx`, `hooks/useCategories.ts`, `lib/category-styles.ts`, `lib/category-styles.test.ts` → `features/categories/`
- `components/ReminderDialog.tsx`, `components/ReminderList.tsx`, `hooks/useReminders.ts` → `features/reminders/`
- `pages/Timeline.tsx`, `pages/RecordForm.tsx`, `components/RecordCard.tsx`, `components/TagFilter.tsx`, `hooks/useRecords.ts` → `features/records/`
- `components/AppDrawer.tsx`, `components/SidebarContent.tsx`, `components/UserMenu.tsx`, `components/LanguageSwitcher.tsx`, `components/ThemeToggle.tsx` → `components/shell/`

**Modify (import-line edits only, no logic changes):**
- `frontend/src/App.tsx` — updated in Tasks 1, 2, 3, 5, 6, 7 (import paths) and refactored in Task 7 (route table)
- `frontend/src/components/UserMenu.tsx` — Task 1 (useAuth path)
- `frontend/src/components/RecordCard.tsx` — Tasks 3, 4 (useCategories, ReminderList paths), then moved in Task 5
- `frontend/src/pages/RecordForm.tsx` — Task 1 (useAuth), Task 3 (useCategories), then moved in Task 5
- `frontend/src/pages/Pressione.tsx` — Task 1 (useAuth), then moved in Task 2
- `frontend/src/pages/Categories.tsx` — Task 1 (useAuth), then moved in Task 3
- `frontend/src/pages/Timeline.tsx` — Task 3 (useCategories, category-styles), then moved in Task 5
- `frontend/src/components/ReminderDialog.tsx` — Task 1 (useAuth), then moved in Task 4
- `frontend/src/components/AppDrawer.tsx` — moved in Task 6 (SidebarContent relative import)

**Never touched:** `components/ui/*`, `lib/pb.ts`, `lib/utils.ts`, `lib/types.ts`, `i18n/*`, `main.tsx`, `index.css`, `vite.config.ts`, `tsconfig.json`, `pb_migrations/*`, `pb_data/*`.

---

## Task 1: Move `auth` feature and extract `AuthGuard`

**Files:**
- Create: `frontend/src/features/auth/AuthGuard.tsx`
- Move: `pages/Login.tsx`, `pages/Register.tsx`, `hooks/useAuth.ts`, `hooks/useRegister.ts` → `features/auth/`
- Modify: `App.tsx`, `components/UserMenu.tsx`, `pages/RecordForm.tsx`, `pages/Pressione.tsx`, `pages/Categories.tsx`, `components/ReminderDialog.tsx` (useAuth import path); `App.tsx` (Login/Register import path + inline AuthGuard removal)

**Interfaces:**
- Produces: `AuthGuard` default export at `@/features/auth/AuthGuard` (props: `{ children: ReactNode }`); `useAuth` at `@/features/auth/useAuth`; `useRegister` at `@/features/auth/useRegister`; `Login` at `@/features/auth/Login`; `Register` at `@/features/auth/Register`.

- [ ] **Step 1: Create the `features/auth/` directory**

Run: `mkdir -p frontend/src/features/auth`

- [ ] **Step 2: Create `frontend/src/features/auth/AuthGuard.tsx`**

```tsx
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}
```

- [ ] **Step 3: Move the four auth files with `git mv`**

Run:
```bash
git mv frontend/src/pages/Login.tsx frontend/src/features/auth/Login.tsx
git mv frontend/src/pages/Register.tsx frontend/src/features/auth/Register.tsx
git mv frontend/src/hooks/useAuth.ts frontend/src/features/auth/useAuth.ts
git mv frontend/src/hooks/useRegister.ts frontend/src/features/auth/useRegister.ts
```

- [ ] **Step 4: Update within-feature imports in `features/auth/Login.tsx`**

In `frontend/src/features/auth/Login.tsx`, change:
```
import { useAuth } from '@/hooks/useAuth'
```
to:
```
import { useAuth } from './useAuth'
```

- [ ] **Step 5: Update within-feature imports in `features/auth/Register.tsx`**

In `frontend/src/features/auth/Register.tsx`, change two lines:
```
import { useAuth } from '@/hooks/useAuth'
import { useRegister } from '@/hooks/useRegister'
```
to:
```
import { useAuth } from './useAuth'
import { useRegister } from './useRegister'
```

- [ ] **Step 6: Update `App.tsx` — useAuth, Login, Register paths and extract AuthGuard**

In `frontend/src/App.tsx`:

(a) Replace the line `import { useAuth } from '@/hooks/useAuth'` with:
```
import { useAuth } from '@/features/auth/useAuth'
```

(b) Replace the two lines:
```
import Login from '@/pages/Login'
import Register from '@/pages/Register'
```
with:
```
import Login from '@/features/auth/Login'
import Register from '@/features/auth/Register'
import AuthGuard from '@/features/auth/AuthGuard'
```

(c) Remove the inline `AuthGuard` function (the 5-line block):
```
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}
```
(The `<AuthGuard>` JSX usage in the Routes block stays unchanged — it now resolves to the imported component.)

- [ ] **Step 7: Update `useAuth` import path in `components/UserMenu.tsx`**

In `frontend/src/components/UserMenu.tsx`, change:
```
import { useAuth } from '@/hooks/useAuth'
```
to:
```
import { useAuth } from '@/features/auth/useAuth'
```

- [ ] **Step 8: Update `useAuth` import path in `pages/RecordForm.tsx`**

In `frontend/src/pages/RecordForm.tsx`, change:
```
import { useAuth } from '@/hooks/useAuth'
```
to:
```
import { useAuth } from '@/features/auth/useAuth'
```

- [ ] **Step 9: Update `useAuth` import path in `pages/Pressione.tsx`**

In `frontend/src/pages/Pressione.tsx`, change:
```
import { useAuth } from '@/hooks/useAuth'
```
to:
```
import { useAuth } from '@/features/auth/useAuth'
```

- [ ] **Step 10: Update `useAuth` import path in `pages/Categories.tsx`**

In `frontend/src/pages/Categories.tsx`, change:
```
import { useAuth } from '@/hooks/useAuth'
```
to:
```
import { useAuth } from '@/features/auth/useAuth'
```

- [ ] **Step 11: Update `useAuth` import path in `components/ReminderDialog.tsx`**

In `frontend/src/components/ReminderDialog.tsx`, change:
```
import { useAuth } from '@/hooks/useAuth'
```
to:
```
import { useAuth } from '@/features/auth/useAuth'
```

- [ ] **Step 12: Run type check**

Run: `cd frontend && npm run lint`
Expected: passes with no errors. If it fails on an unresolved `@/hooks/useAuth` or `@/pages/Login`, a file was missed — grep for the old path and fix it.

- [ ] **Step 13: Commit**

```bash
git add -A frontend/src
git commit -m "refactor(auth): move auth into features/auth and extract AuthGuard"
```

---

## Task 2: Move `blood-pressure` feature

**Files:**
- Move: `pages/Pressione.tsx`, `components/BloodPressureChart.tsx`, `hooks/useBloodPressure.ts`, `lib/bloodPressureUtils.ts`, `lib/bloodPressureUtils.test.ts` → `features/blood-pressure/`
- Modify: `App.tsx` (Pressione import path); within moved files (relative imports + `@/lib/types` for the util and its test)

**Interfaces:**
- Produces: `Pressione` at `@/features/blood-pressure/Pressione`; `BloodPressureChart` at `@/features/blood-pressure/BloodPressureChart` (named export); `useBloodPressure`, `useCreateBloodPressure` at `@/features/blood-pressure/useBloodPressure`; `filterByPreset`, `toChartData`, `ChartPoint`, `ChartPreset` at `@/features/blood-pressure/bloodPressureUtils`.

- [ ] **Step 1: Create directory and move files**

Run:
```bash
mkdir -p frontend/src/features/blood-pressure
git mv frontend/src/pages/Pressione.tsx frontend/src/features/blood-pressure/Pressione.tsx
git mv frontend/src/components/BloodPressureChart.tsx frontend/src/features/blood-pressure/BloodPressureChart.tsx
git mv frontend/src/hooks/useBloodPressure.ts frontend/src/features/blood-pressure/useBloodPressure.ts
git mv frontend/src/lib/bloodPressureUtils.ts frontend/src/features/blood-pressure/bloodPressureUtils.ts
git mv frontend/src/lib/bloodPressureUtils.test.ts frontend/src/features/blood-pressure/bloodPressureUtils.test.ts
```

- [ ] **Step 2: Update within-feature imports in `features/blood-pressure/Pressione.tsx`**

Change two lines:
```
import { useBloodPressure, useCreateBloodPressure } from '@/hooks/useBloodPressure'
import { BloodPressureChart } from '@/components/BloodPressureChart'
```
to:
```
import { useBloodPressure, useCreateBloodPressure } from './useBloodPressure'
import { BloodPressureChart } from './BloodPressureChart'
```

(The `import { useAuth } from '@/features/auth/useAuth'` line stays — it's cross-feature, already updated in Task 1.)

- [ ] **Step 3: Update within-feature import in `features/blood-pressure/BloodPressureChart.tsx`**

Change:
```
import {
  filterByPreset, toChartData,
  type ChartPoint, type ChartPreset,
} from '@/lib/bloodPressureUtils'
```
to:
```
import {
  filterByPreset, toChartData,
  type ChartPoint, type ChartPreset,
} from './bloodPressureUtils'
```

(The `import type { BloodPressureRecord } from '@/lib/types'` and `import { ChartContainer } from '@/components/ui/chart'` lines stay — cross-feature/shared and ui.)

- [ ] **Step 4: Update `types` import in `features/blood-pressure/bloodPressureUtils.ts`**

Change:
```
import type { BloodPressureRecord } from './types'
```
to:
```
import type { BloodPressureRecord } from '@/lib/types'
```

- [ ] **Step 5: Update `types` import in `features/blood-pressure/bloodPressureUtils.test.ts`**

Change:
```
import type { BloodPressureRecord } from './types'
```
to:
```
import type { BloodPressureRecord } from '@/lib/types'
```

(The `import { filterByPreset, toChartData } from './bloodPressureUtils'` line stays — both files are now co-located in the same directory.)

- [ ] **Step 6: Update `App.tsx` — Pressione import path**

In `frontend/src/App.tsx`, change:
```
import Pressione from '@/pages/Pressione'
```
to:
```
import Pressione from '@/features/blood-pressure/Pressione'
```

- [ ] **Step 7: Run type check and tests**

Run: `cd frontend && npm run lint && npm test`
Expected: lint passes; vitest runs `bloodPressureUtils.test.ts` (and `category-styles.test.ts`) and passes. If lint fails on `@/lib/bloodPressureUtils` or `@/lib/types` from the moved util, re-check Step 4.

- [ ] **Step 8: Commit**

```bash
git add -A frontend/src
git commit -m "refactor(blood-pressure): move into features/blood-pressure"
```

---

## Task 3: Move `categories` feature

**Files:**
- Move: `pages/Categories.tsx`, `components/CategoryPicker.tsx`, `hooks/useCategories.ts`, `lib/category-styles.ts`, `lib/category-styles.test.ts` → `features/categories/`
- Modify: `App.tsx` (Categories path); `pages/Timeline.tsx`, `pages/RecordForm.tsx`, `components/RecordCard.tsx` (useCategories + category-styles paths); within moved files (relative imports + `@/lib/types`)

**Interfaces:**
- Produces: `Categories` at `@/features/categories/Categories`; `CategoryPicker` at `@/features/categories/CategoryPicker` (default export); `useCategories`, `useCreateCategory`, `useDeleteCategory`, `useCategoryCounts` at `@/features/categories/useCategories`; `getCategoryStyles`, `CATEGORY_COLORS`, `SWATCH_CLASSES` at `@/features/categories/category-styles`.

- [ ] **Step 1: Create directory and move files**

Run:
```bash
mkdir -p frontend/src/features/categories
git mv frontend/src/pages/Categories.tsx frontend/src/features/categories/Categories.tsx
git mv frontend/src/components/CategoryPicker.tsx frontend/src/features/categories/CategoryPicker.tsx
git mv frontend/src/hooks/useCategories.ts frontend/src/features/categories/useCategories.ts
git mv frontend/src/lib/category-styles.ts frontend/src/features/categories/category-styles.ts
git mv frontend/src/lib/category-styles.test.ts frontend/src/features/categories/category-styles.test.ts
```

- [ ] **Step 2: Update within-feature imports in `features/categories/Categories.tsx`**

Change three lines:
```
import CategoryPicker from '@/components/CategoryPicker'
import {
  useCategories, useCreateCategory, useDeleteCategory, useCategoryCounts,
} from '@/hooks/useCategories'
import { CATEGORY_COLORS, SWATCH_CLASSES } from '@/lib/category-styles'
```
to:
```
import CategoryPicker from './CategoryPicker'
import {
  useCategories, useCreateCategory, useDeleteCategory, useCategoryCounts,
} from './useCategories'
import { CATEGORY_COLORS, SWATCH_CLASSES } from './category-styles'
```

(The `@/features/auth/useAuth`, `@/lib/utils`, `@/lib/types`, and `@/components/ui/*` imports stay unchanged.)

- [ ] **Step 3: Update within-feature import in `features/categories/CategoryPicker.tsx`**

Change:
```
import { CATEGORY_COLORS, SWATCH_CLASSES } from '@/lib/category-styles'
```
to:
```
import { CATEGORY_COLORS, SWATCH_CLASSES } from './category-styles'
```

(The `@/lib/types` and `@/lib/utils` imports stay.)

- [ ] **Step 4: Update `types` import in `features/categories/category-styles.ts`**

Change:
```
import type { CategoryColor } from './types'
```
to:
```
import type { CategoryColor } from '@/lib/types'
```

- [ ] **Step 5: Update `types` import in `features/categories/category-styles.test.ts`**

Change:
```
import type { CategoryColor } from './types'
```
to:
```
import type { CategoryColor } from '@/lib/types'
```

(The `import { getCategoryStyles, CATEGORY_COLORS, SWATCH_CLASSES } from './category-styles'` line stays.)

- [ ] **Step 6: Update cross-feature imports in `pages/Timeline.tsx`**

Change two lines:
```
import { useCategories } from '@/hooks/useCategories'
import { getCategoryStyles } from '@/lib/category-styles'
```
to:
```
import { useCategories } from '@/features/categories/useCategories'
import { getCategoryStyles } from '@/features/categories/category-styles'
```

- [ ] **Step 7: Update cross-feature import in `pages/RecordForm.tsx`**

Change:
```
import { useCategories } from '@/hooks/useCategories'
```
to:
```
import { useCategories } from '@/features/categories/useCategories'
```

- [ ] **Step 8: Update cross-feature import in `components/RecordCard.tsx`**

Change:
```
import { useCategories } from '@/hooks/useCategories'
```
to:
```
import { useCategories } from '@/features/categories/useCategories'
```

- [ ] **Step 9: Update `App.tsx` — Categories import path**

In `frontend/src/App.tsx`, change:
```
import Categories from '@/pages/Categories'
```
to:
```
import Categories from '@/features/categories/Categories'
```

- [ ] **Step 10: Run type check and tests**

Run: `cd frontend && npm run lint && npm test`
Expected: lint passes; both test files pass. If lint fails on `@/lib/category-styles` or `@/hooks/useCategories`, grep for the old path and fix it.

- [ ] **Step 11: Commit**

```bash
git add -A frontend/src
git commit -m "refactor(categories): move into features/categories"
```

---

## Task 4: Move `reminders` feature

**Files:**
- Move: `components/ReminderDialog.tsx`, `components/ReminderList.tsx`, `hooks/useReminders.ts` → `features/reminders/`
- Modify: `components/RecordCard.tsx` (ReminderList import path); within moved files (relative imports)

**Interfaces:**
- Produces: `ReminderDialog` at `@/features/reminders/ReminderDialog` (default export); `ReminderList` at `@/features/reminders/ReminderList` (default export); `useReminders`, `useCreateReminder`, `useDeleteReminder` at `@/features/reminders/useReminders`.

- [ ] **Step 1: Create directory and move files**

Run:
```bash
mkdir -p frontend/src/features/reminders
git mv frontend/src/components/ReminderDialog.tsx frontend/src/features/reminders/ReminderDialog.tsx
git mv frontend/src/components/ReminderList.tsx frontend/src/features/reminders/ReminderList.tsx
git mv frontend/src/hooks/useReminders.ts frontend/src/features/reminders/useReminders.ts
```

- [ ] **Step 2: Update within-feature import in `features/reminders/ReminderDialog.tsx`**

Change:
```
import { useCreateReminder } from '@/hooks/useReminders'
```
to:
```
import { useCreateReminder } from './useReminders'
```

(The `@/features/auth/useAuth` import stays — cross-feature, updated in Task 1.)

- [ ] **Step 3: Update within-feature imports in `features/reminders/ReminderList.tsx`**

Change two lines:
```
import { useReminders, useDeleteReminder } from '@/hooks/useReminders'
import ReminderDialog from './ReminderDialog'
```
to:
```
import { useReminders, useDeleteReminder } from './useReminders'
import ReminderDialog from './ReminderDialog'
```

(The `./ReminderDialog` line was already relative before the move and stays relative — both files are co-located.)

- [ ] **Step 4: Update cross-feature import in `components/RecordCard.tsx`**

Change:
```
import ReminderList from '@/components/ReminderList'
```
to:
```
import ReminderList from '@/features/reminders/ReminderList'
```

- [ ] **Step 5: Run type check**

Run: `cd frontend && npm run lint`
Expected: passes. If lint fails on `@/components/ReminderList` or `@/hooks/useReminders`, grep and fix.

- [ ] **Step 6: Commit**

```bash
git add -A frontend/src
git commit -m "refactor(reminders): move into features/reminders"
```

---

## Task 5: Move `records` feature

**Files:**
- Move: `pages/Timeline.tsx`, `pages/RecordForm.tsx`, `components/RecordCard.tsx`, `components/TagFilter.tsx`, `hooks/useRecords.ts` → `features/records/`
- Modify: `App.tsx` (Timeline + RecordForm import paths); within moved files (relative imports for within-feature; cross-feature `@/` imports already point to final locations from earlier tasks)

**Interfaces:**
- Produces: `Timeline` at `@/features/records/Timeline`; `RecordForm` at `@/features/records/RecordForm`; `RecordCard` at `@/features/records/RecordCard`; `TagFilter` at `@/features/records/TagFilter`; `useRecords`, `useCreateRecord`, `useUpdateRecord`, `useFetchRecord`, `useDeleteRecord` at `@/features/records/useRecords`.

- [ ] **Step 1: Create directory and move files**

Run:
```bash
mkdir -p frontend/src/features/records
git mv frontend/src/pages/Timeline.tsx frontend/src/features/records/Timeline.tsx
git mv frontend/src/pages/RecordForm.tsx frontend/src/features/records/RecordForm.tsx
git mv frontend/src/components/RecordCard.tsx frontend/src/features/records/RecordCard.tsx
git mv frontend/src/components/TagFilter.tsx frontend/src/features/records/TagFilter.tsx
git mv frontend/src/hooks/useRecords.ts frontend/src/features/records/useRecords.ts
```

- [ ] **Step 2: Update within-feature imports in `features/records/Timeline.tsx`**

Change three lines:
```
import { useRecords } from '@/hooks/useRecords'
import RecordCard from '@/components/RecordCard'
import TagFilter from '@/components/TagFilter'
```
to:
```
import { useRecords } from './useRecords'
import RecordCard from './RecordCard'
import TagFilter from './TagFilter'
```

(The `@/features/categories/useCategories` and `@/features/categories/category-styles` imports stay — cross-feature, updated in Task 3. The `@/lib/utils`, `@/lib/types`, `@/components/ui/*` imports stay.)

- [ ] **Step 3: Update within-feature import in `features/records/RecordForm.tsx`**

Change:
```
import { useCreateRecord, useUpdateRecord, useFetchRecord } from '@/hooks/useRecords'
```
to:
```
import { useCreateRecord, useUpdateRecord, useFetchRecord } from './useRecords'
```

(The `@/features/auth/useAuth` and `@/features/categories/useCategories` imports stay — cross-feature, updated in Tasks 1 and 3. The `@/lib/utils` and `@/components/ui/*` imports stay.)

- [ ] **Step 4: Update within-feature import in `features/records/RecordCard.tsx`**

Change:
```
import { useDeleteRecord } from '@/hooks/useRecords'
```
to:
```
import { useDeleteRecord } from './useRecords'
```

(The `@/features/categories/useCategories` and `@/features/reminders/ReminderList` imports stay — cross-feature, updated in Tasks 3 and 4. The `@/lib/pb`, `@/lib/utils`, `@/components/ui/*` imports stay.)

- [ ] **Step 5: `features/records/TagFilter.tsx` — no import changes**

`TagFilter.tsx` only imports `@/components/ui/input` (ui, never moves) and `react-i18next`. Verify no change needed: open the file and confirm the only `@/` import is `@/components/ui/input`.

- [ ] **Step 6: `features/records/useRecords.ts` — no import changes**

`useRecords.ts` imports only `@tanstack/react-query`, `@/lib/pb`, `@/lib/types` — all cross-feature/shared, no change. Verify by opening the file.

- [ ] **Step 7: Update `App.tsx` — Timeline and RecordForm import paths**

In `frontend/src/App.tsx`, change two lines:
```
import Timeline from '@/pages/Timeline'
import RecordForm from '@/pages/RecordForm'
```
to:
```
import Timeline from '@/features/records/Timeline'
import RecordForm from '@/features/records/RecordForm'
```

- [ ] **Step 8: Run type check**

Run: `cd frontend && npm run lint`
Expected: passes. If lint fails on `@/pages/...`, `@/components/RecordCard`, `@/components/TagFilter`, or `@/hooks/useRecords`, grep for the old path and fix it.

- [ ] **Step 9: Commit**

```bash
git add -A frontend/src
git commit -m "refactor(records): move into features/records"
```

---

## Task 6: Move `shell` components

**Files:**
- Move: `components/AppDrawer.tsx`, `components/SidebarContent.tsx`, `components/UserMenu.tsx`, `components/LanguageSwitcher.tsx`, `components/ThemeToggle.tsx` → `components/shell/`
- Modify: `App.tsx` (five import paths); `components/shell/AppDrawer.tsx` (SidebarContent relative import)

**Interfaces:**
- Produces: `AppDrawer`, `SidebarContent`, `UserMenu`, `LanguageSwitcher`, `ThemeToggle` (all default exports) at `@/components/shell/<Name>`.

- [ ] **Step 1: Create directory and move files**

Run:
```bash
mkdir -p frontend/src/components/shell
git mv frontend/src/components/AppDrawer.tsx frontend/src/components/shell/AppDrawer.tsx
git mv frontend/src/components/SidebarContent.tsx frontend/src/components/shell/SidebarContent.tsx
git mv frontend/src/components/UserMenu.tsx frontend/src/components/shell/UserMenu.tsx
git mv frontend/src/components/LanguageSwitcher.tsx frontend/src/components/shell/LanguageSwitcher.tsx
git mv frontend/src/components/ThemeToggle.tsx frontend/src/components/shell/ThemeToggle.tsx
```

- [ ] **Step 2: Update within-feature import in `components/shell/AppDrawer.tsx`**

Change:
```
import SidebarContent from '@/components/SidebarContent'
```
to:
```
import SidebarContent from './SidebarContent'
```

- [ ] **Step 3: `components/shell/SidebarContent.tsx` — no import changes**

`SidebarContent.tsx` imports only `react-router-dom` and `react-i18next` — both external. No change.

- [ ] **Step 4: `components/shell/UserMenu.tsx` — no import changes**

`UserMenu.tsx` imports `@/features/auth/useAuth` (cross-feature, already correct from Task 1) and `@/components/ui/dropdown-menu` (ui). No change.

- [ ] **Step 5: `components/shell/LanguageSwitcher.tsx` and `ThemeToggle.tsx` — no import changes**

`LanguageSwitcher.tsx` imports `react-i18next` and `@/components/ui/button`. `ThemeToggle.tsx` imports `lucide-react`, `next-themes`, `react-i18next`, `@/components/ui/button`. No change.

- [ ] **Step 6: Update `App.tsx` — five shell import paths**

In `frontend/src/App.tsx`, change five lines:
```
import LanguageSwitcher from '@/components/LanguageSwitcher'
import ThemeToggle from '@/components/ThemeToggle'
import AppDrawer from '@/components/AppDrawer'
import UserMenu from '@/components/UserMenu'
import SidebarContent from '@/components/SidebarContent'
```
to:
```
import LanguageSwitcher from '@/components/shell/LanguageSwitcher'
import ThemeToggle from '@/components/shell/ThemeToggle'
import AppDrawer from '@/components/shell/AppDrawer'
import UserMenu from '@/components/shell/UserMenu'
import SidebarContent from '@/components/shell/SidebarContent'
```

- [ ] **Step 7: Run type check**

Run: `cd frontend && npm run lint`
Expected: passes. If lint fails on `@/components/<Name>` (without `shell/`), grep for the old path and fix it.

- [ ] **Step 8: Commit**

```bash
git add -A frontend/src
git commit -m "refactor(shell): move app chrome into components/shell"
```

---

## Task 7: Extract typed route table and refactor `App.tsx` routing

**Files:**
- Create: `frontend/src/lib/routes.ts`
- Modify: `frontend/src/App.tsx` (remove direct page imports, consume `routes`, render via `.map`)

**Interfaces:**
- Produces: `routes` (array of `AppRoute`) and `AppRoute` (interface: `{ path: string; component: ComponentType; requiresAuth: boolean }`) at `@/lib/routes`.
- Consumes: `AuthGuard` at `@/features/auth/AuthGuard` (from Task 1); the six page components at their final `@/features/...` paths (from Tasks 1–5).

- [ ] **Step 1: Create `frontend/src/lib/routes.ts`**

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

- [ ] **Step 2: Remove the six direct page imports from `App.tsx`**

In `frontend/src/App.tsx`, delete these six lines (they are now imported only by `routes.ts`):
```
import Login from '@/features/auth/Login'
import Register from '@/features/auth/Register'
import Timeline from '@/features/records/Timeline'
import RecordForm from '@/features/records/RecordForm'
import Pressione from '@/features/blood-pressure/Pressione'
import Categories from '@/features/categories/Categories'
```

- [ ] **Step 3: Add the `routes` import to `App.tsx`**

Add (next to the other `@/lib/...` imports, or right after the `AuthGuard` import):
```
import { routes } from '@/lib/routes'
```

- [ ] **Step 4: Replace the `<Routes>` block in `App.tsx`**

Find the existing block:
```tsx
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<AuthGuard><Timeline /></AuthGuard>} />
            <Route path="/new" element={<AuthGuard><RecordForm /></AuthGuard>} />
            <Route path="/record/:id/edit" element={<AuthGuard><RecordForm /></AuthGuard>} />
            <Route path="/blood-pressure" element={<AuthGuard><Pressione /></AuthGuard>} />
            <Route path="/categories" element={<AuthGuard><Categories /></AuthGuard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
```

Replace with:
```tsx
          <Routes>
            {routes.map(({ path, component: Component, requiresAuth }) => {
              const element = requiresAuth ? (
                <AuthGuard><Component /></AuthGuard>
              ) : (
                <Component />
              )
              return <Route key={path} path={path} element={element} />
            })}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
```

- [ ] **Step 5: Run type check**

Run: `cd frontend && npm run lint`
Expected: passes with no errors. `noUnusedLocals` will flag any of the six page imports left in `App.tsx` — if it does, re-check Step 2 (all six lines must be deleted).

- [ ] **Step 6: Run production build**

Run: `cd frontend && npm run build`
Expected: `tsc -b` and `vite build` complete; output written to `../pb_public/`. No "unresolved" or "not found" errors.

- [ ] **Step 7: Run tests**

Run: `cd frontend && npm test`
Expected: both `category-styles.test.ts` and `bloodPressureUtils.test.ts` pass (now resolved from their new `features/` locations).

- [ ] **Step 8: Manual smoke test (requires PocketBase running)**

Run in two terminals:
```bash
./pocketbase serve                                   # terminal 1
cd frontend && npm run dev                           # terminal 2
```

Then in the browser at `http://localhost:5173`:
1. `/login` renders the login form; `/register` renders the registration form (accessible without auth)
2. Login with a test user → redirected to `/` (Timeline)
3. Navigate via sidebar to `/blood-pressure` and `/categories` → each renders correctly
4. Click "Aggiungi record" → `/new` renders the record form
5. From Timeline, edit an existing record → `/record/:id/edit` renders with data
6. Enter a bogus URL like `/#/foobar` → redirected to `/`
7. Logout → redirected to `/login`; navigating back to `/` redirects to `/login`
8. Switch language IT ↔ EN and theme light ↔ dark → labels and colors change (sanity check that shell components still work)

- [ ] **Step 9: Commit**

```bash
git add -A frontend/src
git commit -m "refactor(app): extract typed route table into lib/routes"
```

---

## Final Verification

After Task 7, run the complete verification suite from the spec:

1. `cd frontend && npm run lint` → passes
2. `cd frontend && npm run build` → passes, output in `pb_public/`
3. `cd frontend && npm test` → both test files pass
4. `./pocketbase serve` + `cd frontend && npm run dev` → dev server starts, no console errors
5. All 6 routes render; auth guard works; bogus route redirects; logout works; language and theme toggles work

Confirm the directory layout matches the spec:
```bash
ls frontend/src/features/*/   frontend/src/components/shell/ frontend/src/lib/
```
Expected: `features/auth/`, `features/records/`, `features/blood-pressure/`, `features/categories/`, `features/reminders/` each contain their files; `components/shell/` contains the five chrome components; `lib/` contains only `pb.ts`, `utils.ts`, `types.ts`, `routes.ts` (the two util/test pairs moved out).

Confirm `pages/` and `hooks/` directories are gone:
```bash
ls frontend/src/pages frontend/src/hooks 2>&1
```
Expected: "No such file or directory" for both (all files moved).
