# Timeline — Vertical Line with Bubbles

**Date:** 2026-06-11  
**Status:** Approved

## Context

The current timeline page (`Timeline.tsx`) groups medical records by year-month and renders them as stacked cards with a plain text month header. There is no visual connective element. The goal is to add a classic vertical-timeline layout — a continuous line on the left with a colored dot per event and date labels — to make the chronological structure immediately readable.

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Visual style | Style B: large watermark year, vertical line, dot | Matches reference screenshot, modern editorial feel |
| Grouping | Year + month (unchanged logic) | `groupByYearMonth()` stays as-is; no data-layer changes |
| Dot color | By category | Gives instant visual category cue without hovering |
| Date column | Day only | Month already present in the section header |

### Category → Color Mapping

| Category | Dot color | Tailwind class |
|---|---|---|
| `visita` | Indigo `#6366f1` | `bg-indigo-500` |
| `esame` | Sky `#0ea5e9` | `bg-sky-500` |
| `referto` | Emerald `#10b981` | `bg-emerald-500` |
| `altro` | Slate `#94a3b8` | `bg-slate-400` |

## Layout Structure

```
<div> ← relative container, left padding ~80px, ::before vertical line
  <div> ← year watermark (opacity ~10%, font-size large, outside padding via negative margin)
  <div> ← month label (uppercase, small, muted, outside padding)

  <div> ← row (relative, flex)
    <div> ← dot (absolute, left -87px, category color, border-background for dark-mode compat)
    <div> ← day number (absolute, left -56px, small, muted)
    <RecordCard> ← unchanged component, takes remaining width
  </div>
  ...repeat rows...
</div>
```

The vertical line is implemented as a single left-border or a `before:` pseudo-element on the wrapper div (`absolute left-[60px] top-0 bottom-0 w-0.5 bg-border`).

## Scope

**Modified:** `frontend/src/pages/Timeline.tsx` only.  
**Unchanged:** `RecordCard.tsx`, `useRecords.ts`, `types.ts`, all other files.  
**New dependencies:** none — pure Tailwind utility classes.

## Verification

1. Run `npm run dev` from `frontend/`
2. Open `/` (Timeline page)
3. Check:
   - Vertical line visible, continuous across all groups
   - Dots appear at the correct category color
   - Year watermark appears above each year group
   - Month label appears above each month sub-group
   - Day number visible to the left of each card
   - Existing RecordCard content (title, badge, description, tags, files) unchanged
   - Responsive: no overflow on small screens (line + dot disappear below a breakpoint if needed)
   - Dark mode: line, dots, and watermark render correctly against dark background
