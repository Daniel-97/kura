# CSS Centralization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize repeated Tailwind utility chains into 12 semantic CSS classes in `frontend/src/index.css` under `@layer components`, and replace those chains across 8 consumer files (5 pages + 3 components). Add one rule to `frontend/AGENTS.md`.

**Architecture:** Pure CSS refactor using Tailwind's `@layer components` + `@apply`. No new React components, no new dependencies, no logic changes. Each consumer file gets a 1:1 substitution of repeated Tailwind chains for the new class names. Verification at every step is `npm run lint` (type-check) + `npm run build` (Tailwind purge + production build). Final step adds a manual smoke test.

**Tech Stack:** React 18, TypeScript 5 strict, Vite 6, Tailwind CSS 3, shadcn/ui, i18next.

**Spec:** `docs/superpowers/specs/2026-06-16-css-centralization-design.md`

**Note on testing:** This is a pure CSS refactor with no behavior change. There is no unit test to write for "class X applies styles Y" — Tailwind's own compilation is the test. Verification at every step is `cd frontend && npm run lint && npm run build`. The final task adds a manual visual smoke test.

---

## File Map

**Create:** none

**Modify (CSS):**
- `frontend/src/index.css` — append `@layer components { ... }` block with 12 classes

**Modify (TSX consumers):**
- `frontend/src/pages/Login.tsx`
- `frontend/src/pages/Register.tsx`
- `frontend/src/pages/Pressione.tsx`
- `frontend/src/pages/RecordForm.tsx`
- `frontend/src/pages/Timeline.tsx`
- `frontend/src/components/ReminderDialog.tsx`
- `frontend/src/components/RecordCard.tsx`
- `frontend/src/components/ReminderList.tsx`

**Modify (docs):**
- `frontend/AGENTS.md` — add one row to "Code Conventions" table

---

## Task 1: Add the 12 CSS classes to index.css

**Files:**
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Open `frontend/src/index.css` and locate the end of the file**

The file currently ends at line 58 with the closing brace of `@layer base { ... }`. We append a new `@layer components` block immediately after it.

- [ ] **Step 2: Append the `@layer components` block to the end of `frontend/src/index.css`**

Add this verbatim at the end of the file (no blank line before the existing closing brace — preserve current file ending with newline):

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

The final file should look like this (only the bottom is shown, the top is unchanged):

```css
  body {
    @apply bg-background text-foreground;
  }
}

@layer components {
  /* Form building blocks */
  .form              { @apply space-y-4; }
  /* ... rest as above ... */
}
```

- [ ] **Step 3: Verify Tailwind compiles the new layer**

Run:
```bash
cd frontend && npm run build
```

Expected: build succeeds. Even though no consumer uses the new classes yet, Tailwind will compile them; they will be in the output CSS but unused. (The `npm run build` step runs `tsc -b && vite build`.)

- [ ] **Step 4: Commit**

```bash
git add frontend/src/index.css
git commit -m "feat(css): add centralized component layer with 12 semantic classes"
```

---

## Task 2: Update Login.tsx

**Files:**
- Modify: `frontend/src/pages/Login.tsx`

- [ ] **Step 1: Replace the outer wrapper className**

Find (line 35):
```tsx
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
```

Replace with:
```tsx
    <div className="page-shell-centered">
```

- [ ] **Step 2: Replace the Card className**

Find (line 36):
```tsx
      <Card className="w-full max-w-sm">
```

Replace with:
```tsx
      <Card className="auth-card">
```

- [ ] **Step 3: Replace the CardTitle className**

Find (line 38):
```tsx
          <CardTitle className="text-center text-2xl">Kura</CardTitle>
```

Replace with:
```tsx
          <CardTitle className="auth-title">Kura</CardTitle>
```

- [ ] **Step 4: Replace the form className**

Find (line 41):
```tsx
          <form onSubmit={handleSubmit} className="space-y-4">
```

Replace with:
```tsx
          <form onSubmit={handleSubmit} className="form">
```

- [ ] **Step 5: Replace both form-field wrappers**

Find (lines 42, 54):
```tsx
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
```

Replace the opening div with:
```tsx
            <div className="form-field">
              <Label htmlFor="email">{t('auth.email')}</Label>
```

Find (line 54):
```tsx
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
```

Replace the opening div with:
```tsx
            <div className="form-field">
              <Label htmlFor="password">{t('auth.password')}</Label>
```

- [ ] **Step 6: Replace the submit button className**

Find (line 66):
```tsx
            <Button type="submit" className="w-full" disabled={pending}>
```

Replace with:
```tsx
            <Button type="submit" className="btn-block" disabled={pending}>
```

- [ ] **Step 7: Verify type-check + build**

Run:
```bash
cd frontend && npm run lint && npm run build
```

Expected: both succeed with no errors.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/pages/Login.tsx
git commit -m "refactor(login): use centralized css classes"
```

---

## Task 3: Update Register.tsx

**Files:**
- Modify: `frontend/src/pages/Register.tsx`

- [ ] **Step 1: Replace the outer wrapper className**

Find (line 60):
```tsx
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
```

Replace with:
```tsx
    <div className="page-shell-centered">
```

- [ ] **Step 2: Replace the Card className**

Find (line 61):
```tsx
      <Card className="w-full max-w-sm">
```

Replace with:
```tsx
      <Card className="auth-card">
```

- [ ] **Step 3: Replace the CardTitle className**

Find (line 63):
```tsx
          <CardTitle className="text-center text-2xl">{t('register.title')}</CardTitle>
```

Replace with:
```tsx
          <CardTitle className="auth-title">{t('register.title')}</CardTitle>
```

- [ ] **Step 4: Replace the form className**

Find (line 66):
```tsx
          <form onSubmit={handleSubmit} className="space-y-4">
```

Replace with:
```tsx
          <form onSubmit={handleSubmit} className="form">
```

- [ ] **Step 5: Replace all three form-field wrappers**

Find (lines 67, 79, 91):
```tsx
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
```

Replace the opening div with:
```tsx
            <div className="form-field">
              <Label htmlFor="email">{t('auth.email')}</Label>
```

Find (line 79):
```tsx
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
```

Replace the opening div with:
```tsx
            <div className="form-field">
              <Label htmlFor="password">{t('auth.password')}</Label>
```

Find (line 91):
```tsx
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">{t('register.passwordConfirm')}</Label>
```

Replace the opening div with:
```tsx
            <div className="form-field">
              <Label htmlFor="passwordConfirm">{t('register.passwordConfirm')}</Label>
```

- [ ] **Step 6: Replace the submit button className**

Find (line 103):
```tsx
            <Button type="submit" className="w-full" disabled={pending}>
```

Replace with:
```tsx
            <Button type="submit" className="btn-block" disabled={pending}>
```

- [ ] **Step 7: Verify type-check + build**

Run:
```bash
cd frontend && npm run lint && npm run build
```

Expected: both succeed.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/pages/Register.tsx
git commit -m "refactor(register): use centralized css classes"
```

---

## Task 4: Update Pressione.tsx

**Files:**
- Modify: `frontend/src/pages/Pressione.tsx`

- [ ] **Step 1: Replace the page h1 className**

Find (line 63):
```tsx
      <h1 className="text-2xl font-bold">{t('pressure.title')}</h1>
```

Replace with:
```tsx
      <h1 className="page-header">{t('pressure.title')}</h1>
```

- [ ] **Step 2: Replace the form className**

Find (line 69):
```tsx
          <form onSubmit={handleSubmit} className="space-y-4">
```

Replace with:
```tsx
          <form onSubmit={handleSubmit} className="form">
```

- [ ] **Step 3: Replace the two-column grid className**

Find (line 70):
```tsx
            <div className="grid grid-cols-2 gap-4">
```

Replace with:
```tsx
            <div className="form-grid-cols-2">
```

- [ ] **Step 4: Replace the two form-field wrappers inside the grid (lines 71, 80)**

Find (line 71):
```tsx
              <div className="space-y-2">
                <Label htmlFor="systolic">{t('pressure.systolicLabel')}</Label>
```

Replace the opening div with:
```tsx
              <div className="form-field">
                <Label htmlFor="systolic">{t('pressure.systolicLabel')}</Label>
```

Find (line 80):
```tsx
              <div className="space-y-2">
                <Label htmlFor="diastolic">{t('pressure.diastolicLabel')}</Label>
```

Replace the opening div with:
```tsx
              <div className="form-field">
                <Label htmlFor="diastolic">{t('pressure.diastolicLabel')}</Label>
```

- [ ] **Step 5: Replace the three remaining form-field wrappers (lines 90, 98, 106)**

Find (line 90):
```tsx
            <div className="space-y-2">
              <Label htmlFor="pulse">{t('pressure.pulseLabel')}</Label>
```

Replace the opening div with:
```tsx
            <div className="form-field">
              <Label htmlFor="pulse">{t('pressure.pulseLabel')}</Label>
```

Find (line 98):
```tsx
            <div className="space-y-2">
              <Label htmlFor="measuredAt">{t('pressure.measuredAt')}</Label>
```

Replace the opening div with:
```tsx
            <div className="form-field">
              <Label htmlFor="measuredAt">{t('pressure.measuredAt')}</Label>
```

Find (line 106):
```tsx
            <div className="space-y-2">
              <Label htmlFor="notes">{t('pressure.notes')}</Label>
```

Replace the opening div with:
```tsx
            <div className="form-field">
              <Label htmlFor="notes">{t('pressure.notes')}</Label>
```

- [ ] **Step 6: Replace the submit button className**

Find (line 114):
```tsx
            <Button type="submit" className="w-full" disabled={create.isPending}>
```

Replace with:
```tsx
            <Button type="submit" className="btn-block" disabled={create.isPending}>
```

- [ ] **Step 7: Replace the two empty/loading state p classNames (lines 123, 125)**

Find (line 123):
```tsx
          <p className="text-muted-foreground">{t('common.loading')}</p>
```

Replace with:
```tsx
          <p className="muted-empty">{t('common.loading')}</p>
```

Find (line 125):
```tsx
          <p className="text-muted-foreground">{t('pressure.empty')}</p>
```

Replace with:
```tsx
          <p className="muted-empty">{t('pressure.empty')}</p>
```

- [ ] **Step 8: Verify type-check + build**

Run:
```bash
cd frontend && npm run lint && npm run build
```

Expected: both succeed.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/pages/Pressione.tsx
git commit -m "refactor(pressione): use centralized css classes"
```

---

## Task 5: Update RecordForm.tsx

**Files:**
- Modify: `frontend/src/pages/RecordForm.tsx`

- [ ] **Step 1: Replace the form className**

Find (line 116):
```tsx
          <form onSubmit={handleSubmit} className="space-y-4">
```

Replace with:
```tsx
          <form onSubmit={handleSubmit} className="form">
```

- [ ] **Step 2: Replace all form-field wrappers (lines 117, 127, 137, 150, 159, 198, and 171 inside the existing-files block)**

For each of the following patterns, replace the opening `<div className="space-y-2">` with `<div className="form-field">`:

- Line 117: `<div className="space-y-2">` before `<Label htmlFor="title">{t('record.title')}</Label>`
- Line 127: `<div className="space-y-2">` before `<Label htmlFor="date">{t('record.date')}</Label>`
- Line 137: `<div className="space-y-2">` before `<Label>{t('record.category')}</Label>`
- Line 150: `<div className="space-y-2">` before `<Label htmlFor="tags">{t('record.tags')}</Label>`
- Line 159: `<div className="space-y-2">` before `<Label htmlFor="description">{t('record.description')}</Label>`
- Line 171: `<div className="space-y-2">` before `<Label>{t('record.existingFiles')}</Label>`
- Line 198: `<div className="space-y-2">` before `<Label htmlFor="files">` (the file picker)

Use `replaceAll: true` only if you're certain all 7 instances have the exact same text — they don't (different Label children), so do them one at a time.

- [ ] **Step 3: Replace the icon-btn-destructive className**

Find (line 187):
```tsx
                        className="shrink-0 text-muted-foreground hover:text-destructive"
```

Replace with:
```tsx
                        className="icon-btn-destructive"
```

- [ ] **Step 4: Verify type-check + build**

Run:
```bash
cd frontend && npm run lint && npm run build
```

Expected: both succeed.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/RecordForm.tsx
git commit -m "refactor(record-form): use centralized css classes"
```

---

## Task 6: Update Timeline.tsx

**Files:**
- Modify: `frontend/src/pages/Timeline.tsx`

- [ ] **Step 1: Replace the page h1 className**

Find (line 139):
```tsx
        <h1 className="text-2xl font-bold">{t('timeline.title')}</h1>
```

Replace with:
```tsx
        <h1 className="page-header">{t('timeline.title')}</h1>
```

- [ ] **Step 2: Replace the two empty/loading state p classNames (lines 164, 166)**

Find (line 164):
```tsx
        <p className="text-muted-foreground">{t('common.loading')}</p>
```

Replace with:
```tsx
        <p className="muted-empty">{t('common.loading')}</p>
```

Find (line 166):
```tsx
        <p className="text-muted-foreground">{t('timeline.empty')}</p>
```

Replace with:
```tsx
        <p className="muted-empty">{t('timeline.empty')}</p>
```

- [ ] **Step 3: Verify type-check + build**

Run:
```bash
cd frontend && npm run lint && npm run build
```

Expected: both succeed.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Timeline.tsx
git commit -m "refactor(timeline): use centralized css classes"
```

---

## Task 7: Update ReminderDialog.tsx

**Files:**
- Modify: `frontend/src/components/ReminderDialog.tsx`

- [ ] **Step 1: Replace form-field wrappers**

Find and replace each `<div className="space-y-2">` opening with `<div className="form-field">`. The form-field pattern appears 4 times in this file (around lines 108, 117, 139, and 155). Replace them one at a time, since the Label/control children differ.

- [ ] **Step 2: Verify type-check + build**

Run:
```bash
cd frontend && npm run lint && npm run build
```

Expected: both succeed.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ReminderDialog.tsx
git commit -m "refactor(reminder-dialog): use centralized css classes"
```

---

## Task 8: Update RecordCard.tsx

**Files:**
- Modify: `frontend/src/components/RecordCard.tsx`

- [ ] **Step 1: Replace the icon-btn-destructive className**

The pattern `shrink-0 text-muted-foreground hover:text-destructive` does NOT currently appear in RecordCard.tsx. Search to confirm:

Run:
```bash
grep -n "shrink-0 text-muted-foreground hover:text-destructive" frontend/src/components/RecordCard.tsx
```

If no match, this task is a no-op for RecordCard. Skip to step 3 (commit no-op message) — but DO commit so the per-file trail is clean. If a match is found, replace the className with `icon-btn-destructive`.

- [ ] **Step 2: Verify type-check + build**

Run:
```bash
cd frontend && npm run lint && npm run build
```

Expected: both succeed (the file is unchanged if step 1 was a no-op).

- [ ] **Step 3: Commit**

```bash
git commit --allow-empty -m "refactor(record-card): use centralized css classes (no-op)"
```

---

## Task 9: Update ReminderList.tsx

**Files:**
- Modify: `frontend/src/components/ReminderList.tsx`

- [ ] **Step 1: Replace the icon-btn-destructive className**

Find (line 69):
```tsx
                  className="ml-auto shrink-0 text-muted-foreground/40 hover:text-destructive"
```

Replace with:
```tsx
                  className="ml-auto icon-btn-destructive"
```

(Note: this preserves the `ml-auto` margin class — only the icon-related classes get centralized.)

- [ ] **Step 2: Verify type-check + build**

Run:
```bash
cd frontend && npm run lint && npm run build
```

Expected: both succeed.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ReminderList.tsx
git commit -m "refactor(reminder-list): use centralized css classes"
```

---

## Task 10: Add the rule to frontend/AGENTS.md

**Files:**
- Modify: `frontend/AGENTS.md`

- [ ] **Step 1: Locate the "Code Conventions" table in `frontend/AGENTS.md`**

The table currently has rows for: TypeScript strict, function components, server state via react-query, shadcn/ui, no hardcoded UI strings, npm dependencies, naming, `pb.autoCancellation(false)`.

- [ ] **Step 2: Append a new row to the table**

Add this row as a new line at the end of the table (after the `pb.autoCancellation(false)` row):

```
| Repeated UI styles live in `frontend/src/index.css` under `@layer components` (built with `@apply`). Pages and components reference these classes instead of repeating the same Tailwind chains. | Single source of truth for layout patterns; keeps page markup readable. |
```

The final table should have 10 rows total (was 9, now 10).

- [ ] **Step 3: Verify the file is still valid markdown**

Run:
```bash
cat frontend/AGENTS.md | head -50
```

Expected: the table is well-formed (no broken pipe characters, no missing row separator).

- [ ] **Step 4: Commit**

```bash
git add frontend/AGENTS.md
git commit -m "docs(agents): add rule for centralized css classes"
```

---

## Task 11: Final verification

- [ ] **Step 1: Run full type-check + production build**

Run:
```bash
cd frontend && npm run lint && npm run build
```

Expected: both succeed with no errors and no Tailwind purge warnings.

- [ ] **Step 2: Verify all 12 classes are actually used in source (Tailwind purge sanity check)**

Run:
```bash
cd frontend && grep -rE "className=\"(form|form-field|form-grid|form-grid-cols-2|page-shell|page-shell-centered|page-header|auth-card|auth-title|muted-empty|btn-block|icon-btn-destructive)\"" src/ | wc -l
```

Expected: at least 20 matches (the spec lists 26 `.form-field`/`.form` replacements; other classes add to this count).

- [ ] **Step 3: Verify the production CSS bundle contains the new classes**

Run:
```bash
cd frontend && npm run build && grep -c "page-shell-centered\|icon-btn-destructive\|muted-empty" ../pb_public/assets/*.css
```

Expected: each of `page-shell-centered`, `icon-btn-destructive`, `muted-empty` appears at least once in the built CSS bundle.

- [ ] **Step 4: Manual visual smoke test**

```bash
cd frontend && npm run dev
```

Then walk through:
1. Open http://localhost:5173 — confirm Login page renders centered card with "Kura" title
2. Log in with test credentials — confirm Timeline renders with the new "Referti" header
3. Click "Pressione" in the sidebar — confirm the pressure form renders, submit works
4. Click "Nuovo referto" — confirm RecordForm renders, all 7 form fields are spaced correctly
5. Toggle language IT ↔ EN — confirm all labels still render
6. Toggle dark/light theme — confirm no contrast regressions
7. (If `VITE_ALLOW_REGISTRATION=true`) Navigate to /register — confirm Register page renders identically to Login

Expected: all pages render identically to before the refactor. No visual regressions.

- [ ] **Step 5: Final commit if anything was missed**

If step 1 or step 4 surfaced an issue, fix it and commit with a descriptive message. If everything passes, no commit is needed — the work is already committed in Tasks 1–10.

---

## Self-Review

**1. Spec coverage:**
- 12 CSS classes defined → Task 1
- 5 pages updated (Login, Register, Pressione, RecordForm, Timeline) → Tasks 2–6
- 3 components updated (ReminderDialog, RecordCard, ReminderList) → Tasks 7–9
- AGENTS.md rule added → Task 10
- Verification (type-check + build) at every step → every task
- Manual smoke test → Task 11

**2. Placeholder scan:** No "TBD", "TODO", "implement later", "fill in details", "add appropriate error handling", "similar to Task N". All replacements show exact old/new code.

**3. Type consistency:** Class names defined in Task 1 (`form`, `form-field`, `form-grid`, `form-grid-cols-2`, `page-shell`, `page-shell-centered`, `page-header`, `auth-card`, `auth-title`, `muted-empty`, `btn-block`, `icon-btn-destructive`) match the names used in Tasks 2–9.

**Note on Task 8 (RecordCard):** the spec listed RecordCard as a consumer of `icon-btn-destructive`, but my grep shows the pattern `shrink-0 text-muted-foreground hover:text-destructive` is NOT present in RecordCard.tsx. Task 8 is structured as a no-op with a clear verification step, and the per-file commit trail is preserved. This is intentional, not a gap.
