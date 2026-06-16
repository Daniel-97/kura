# RecordCard Section Separators Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add subtle horizontal divider lines between the three sections of `RecordCard` (main / reminders / files) to improve visual scannability, with zero new dependencies and no behavior change.

**Architecture:** Pure presentational change to a single file (`RecordCard.tsx`). Use a `<div className="my-3 border-t" />` divider that reuses the existing `--border` CSS variable from shadcn (already globally applied via `* { @apply border-border }` in `index.css`). The main↔reminders divider is unconditional (reminders always render); the reminders↔files divider is conditional on `record.file` being non-empty. Replace the existing `mt-3` spacer before the file grid with the new conditional divider.

**Tech Stack:** React 18, TypeScript 5 strict, Tailwind CSS 3, shadcn/ui CSS variables.

**Spec:** `docs/superpowers/specs/2026-06-16-record-card-section-separators-design.md`

**Note on testing:** This is a pure presentational change with no logic, no new component API, and no new behavior. The project has no unit test framework (`package.json` has no `test` script — verified). Tailwind's own compilation is the type-safety net for class names. Verification at every step is `cd frontend && npm run lint` (TypeScript strict check) + `cd frontend && npm run build` (Tailwind purge + production build). The final task adds a manual visual smoke test against the AGENTS.md checklist.

---

## File Map

**Create:** none

**Modify (1 file):**
- `frontend/src/components/RecordCard.tsx` — add 1 unconditional divider, convert 1 conditional `mt-3` wrapper into a fragment containing 1 divider + the existing grid

**Modify (docs):** none

**Modify (translations):** none — no new user-facing strings

---

## Task 1: Apply both divider edits to RecordCard.tsx

**Files:**
- Modify: `frontend/src/components/RecordCard.tsx`

- [ ] **Step 1: Read the current state of the file around lines 95-140**

The relevant block is the closing of the main column, the `<ReminderList>`, the end of the outer flex row, and the start of the file grid:

```tsx
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
              <ReminderList recordId={record.id} recordDate={record.date} />
            </div>
            ...
          </div>

          {record.file && record.file.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
```

- [ ] **Step 2: Add unconditional divider before `<ReminderList>`**

Replace this block:

```tsx
              )}
              <ReminderList recordId={record.id} recordDate={record.date} />
```

with:

```tsx
              )}
              <div className="my-3 border-t" />
              <ReminderList recordId={record.id} recordDate={record.date} />
```

- [ ] **Step 3: Convert the file block wrapper into a fragment with conditional divider**

Replace this block:

```tsx
          {record.file && record.file.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {record.file.map((filename) => {
                const ext = filename.split('.').pop()?.toLowerCase()
                const isImage = ext ? IMAGE_EXTS.has(ext) : false
                const url = pb.files.getUrl(record, filename)
                return (
                  <a
                    key={filename}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={filename}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isImage ? (
                      <img
                        src={url}
                        alt={filename}
                        className="h-20 w-20 rounded border object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded border bg-muted">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">
                          {ext ?? '?'}
                        </span>
                      </div>
                    )}
                  </a>
                )
              })}
            </div>
          )}
```

with:

```tsx
          {record.file && record.file.length > 0 && (
            <>
              <div className="my-3 border-t" />
              <div className="flex flex-wrap gap-2">
                {record.file.map((filename) => {
                  const ext = filename.split('.').pop()?.toLowerCase()
                  const isImage = ext ? IMAGE_EXTS.has(ext) : false
                  const url = pb.files.getUrl(record, filename)
                  return (
                    <a
                      key={filename}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={filename}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isImage ? (
                        <img
                          src={url}
                          alt={filename}
                          className="h-20 w-20 rounded border object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded border bg-muted">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                          <span className="text-[10px] font-bold uppercase text-muted-foreground">
                            {ext ?? '?'}
                          </span>
                        </div>
                      )}
                    </a>
                  )
                })}
              </div>
            </>
          )}
```

Changes vs. the original:
- Outer `<div className="mt-3 flex flex-wrap gap-2">` → fragment `<>...</>`
- New `<div className="my-3 border-t" />` line inserted as the first child of the fragment
- Inner wrapper becomes `<div className="flex flex-wrap gap-2">` (the `mt-3` is dropped — replaced by the divider's `my-3`)
- All other content (file thumbnails) is unchanged
- All JSX indentation inside increases by 2 spaces (one level deeper because of the fragment)

- [ ] **Step 4: Visually inspect the two diff regions to confirm**

Open `frontend/src/components/RecordCard.tsx` and confirm:
- Line near the `<ReminderList>` call now has a `<div className="my-3 border-t" />` immediately above it
- The `{record.file && record.file.length > 0 && (` block is now a fragment containing a divider and a div, not a single div with `mt-3`
- No other lines in the file have been modified
- The two `</div>` closing tags at the end of the file block area are correctly balanced: the inner one closes the `flex flex-wrap gap-2` div, the outer `</>` closes the fragment

---

## Task 2: Run lint and build to verify

**Files:** none (verification only)

- [ ] **Step 1: Run the TypeScript / lint check**

Run: `cd frontend && npm run lint`
Expected: no errors. The command is an alias for `tsc --noEmit`. The only new content is two `<div className="my-3 border-t" />` elements and a fragment — all valid JSX/TS. If there are errors, the most likely cause is an unbalanced tag from Task 1; re-read the file and fix.

- [ ] **Step 2: Run the production build**

Run: `cd frontend && npm run build`
Expected: Vite reports a successful build, `pb_public/` is updated, and Tailwind's content scan picks up `my-3` and `border-t` (these are standard utilities, no JIT issues expected). The new CSS emitted to `pb_public/assets/*.css` should contain the `border-t` rule.

If `npm run build` warns that any new class isn't being purged, something is wrong — these are static strings, Tailwind's regex will catch them.

- [ ] **Step 3: Confirm the diff is exactly the two intended changes**

Run: `git diff frontend/src/components/RecordCard.tsx`

Expected: only two hunks:
1. The block ending with `<ReminderList ... />` — adds one line `<div className="my-3 border-t" />` before it
2. The file block — converts wrapper to fragment, adds the divider line, drops `mt-3` from the inner div, re-indents

If any other hunk appears, revert and re-apply carefully.

---

## Task 3: Manual visual smoke test

**Files:** none

This task is verification against the AGENTS.md manual feature checklist, items 2-3.

- [ ] **Step 1: Start the dev environment**

Per the project root AGENTS.md "Starting the Development Environment" section:

```bash
./pocketbase serve            # in one terminal
cd frontend && npm run dev    # in another terminal
```

If PocketBase data has no records, log in to the admin at `http://localhost:8090/_/` and create at least 3 test records covering the three cases below (or use existing data).

- [ ] **Step 2: Case A — card with reminders only (no files)**

Open `http://localhost:5173/` and find a card that has at least one reminder but no file attachments.

Expected:
- A thin horizontal line is visible between the tag row and the "REMINDERS" label / Bell icon area
- The reminders section renders normally below the line (badge, list, "Add" button)
- The card's overall padding (`py-4`) is preserved, the line is `my-3` (12px margin top and bottom)
- No second line is visible (no files section)

- [ ] **Step 3: Case B — card with both reminders and files**

Find (or create) a card that has a reminder and a file attachment.

Expected:
- Line 1 visible between main content and reminders (as in Case A)
- Line 2 visible between the reminders section and the file grid
- The file grid renders below line 2 with `flex flex-wrap gap-2` (unchanged)
- Thumbnail click still opens the file in a new tab

- [ ] **Step 4: Case C — dark mode check**

Toggle the theme via the header (ThemeToggle component).

Expected:
- Lines are still visible but use the dark `--border` value (a darker gray that contrasts against the dark card background)
- No hardcoded colors, no white lines on dark background
- `* { @apply border-border }` in `index.css:52` ensures the global rule applies

- [ ] **Step 5: Case D — regression checks**

Verify these still work (they should — the change is purely additive visual):
- Click anywhere on a card → ripple effect still animates from the click point
- Click the "⋮" button in the top-right → dropdown opens with Edit / Delete
- Click "Add" button in the reminders section → reminder dialog opens, click event does not bubble to the card
- Click a file thumbnail → opens in new tab, click event does not bubble to the card

If any of these regresses, the most likely cause is that the new `<div>` is intercepting pointer events. Add `pointer-events-none` to the divider div and re-test.

---

## Task 4: Commit

**Files:** none (git operation only)

- [ ] **Step 1: Stage and commit**

```bash
git add frontend/src/components/RecordCard.tsx
git commit -m "feat(record-card): add horizontal dividers between main, reminders, and files sections"
```

The body can be empty — the diff and the spec doc tell the full story.

---

## Self-Review Notes

- **Spec coverage:** all 7 requirements in the spec's "Requirements" section are satisfied by Task 1 (Steps 2-3); all 10 manual checklist items in the spec's "Testing" section are covered by Task 3 (Steps 2-5).
- **No placeholders:** every step contains actual code or commands with expected output. No "TBD", no "similar to", no "handle edge cases".
- **Type consistency:** the only new code is JSX `<div>` elements with string className props — no TypeScript signatures, function names, or types to keep consistent.
- **Out of scope:** not adding the shadcn `Separator` component, not adding CSS classes to `index.css`, not changing `tailwind.config.ts`, not adding translations. All explicitly excluded by the spec.
