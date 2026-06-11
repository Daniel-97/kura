# Timeline — Past/Future Visual Distinction

**Date:** 2026-06-11  
**Status:** Approved

## Context

The medical records timeline will also contain future appointments and planned exams. Since events are sorted newest-first (future at top, past at bottom), there is no natural visual break between scheduled future events and recorded past events. This spec adds a clear visual distinction so the user can instantly tell which events have happened and which are upcoming.

## Design Decisions

| Element | Past (below today) | Future (above today) |
|---|---|---|
| Vertical line | Solid `bg-border` | Dashed (CSS repeating-gradient) |
| Dot | Filled, category color | Outline only, category color ring |
| Card border | Solid `border` | Dashed `border-dashed`, lighter color |
| Card background | `bg-card` (white/dark) | `bg-muted/30` (slightly grey) |
| Day number | `text-muted-foreground` | `text-muted-foreground/40` (lighter) |
| Month label | Normal muted color | Lighter (`text-muted-foreground/40`) |

## "Today" Indicator

A red arrow-tag rendered as a full-width separator between the last future group and the first past group.

- **Shape:** Rectangle with right-pointing tip via `clip-path: polygon(0% 0%, calc(100%-10px) 0%, 100% 50%, calc(100%-10px) 100%, 0% 100%)`
- **Color:** `bg-rose-500` text white
- **Content:** `"Oggi · {day} {month} {year}"` — formatted with `Intl.DateTimeFormat`
- **Position:** `margin-left: -72px` (same negative margin as year watermark) so it starts flush with the left edge of the container, with the tip pointing at the timeline line

The "today" indicator is only rendered when the grouped data actually straddles today — i.e. there are both future and past groups. If all records are in the past (or all in the future), the separator is omitted.

## Determining Past vs Future

A record is **future** if `new Date(record.date) >= today` where `today` is `new Date()` with time set to start of day (`setHours(0,0,0,0)`). Each record is evaluated individually — group membership does not determine styling.

A new helper:
```ts
function isFuture(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateStr) >= today
}
```

The existing `groupByYearMonth()` function is unchanged.

## Implementation Scope

**Modified:** `frontend/src/pages/Timeline.tsx` only.  
**Unchanged:** `RecordCard.tsx`, `useRecords.ts`, `types.ts`, all other files.  
**New dependencies:** none.

### Logic summary

Records are already sorted newest-first by the API (`sort: '-date'`). Within each group, records maintain that order.

```
today = start of today (midnight)

todayInserted = false

for each group (newest first):
  for each record in group (newest first):
    if record is future → render with future styling
    if record is past AND todayInserted is false:
      → insert "Oggi" separator here
      → todayInserted = true
      → render record with past styling
    else → render with past styling

"Oggi" separator renders exactly once, before the first past record encountered.
```

Because records within a group are also sorted newest-first, this handles the mixed-month case correctly: future records in the current month appear with dashed styling, then the "Oggi" tag, then past records in the same month with solid styling.

### Line split strategy

The vertical line is split into two adjacent sections rather than a single absolute element spanning the full height:

- **Future section** (`div.relative`): wraps all future record rows — the line is `absolute left-[64px] top-0 bottom-0 w-0.5` with the dashed gradient background
- **Past section** (`div.relative`): wraps all past record rows — same positioning with solid `bg-border`

The "Oggi" tag sits between the two sections with no line behind it, breaking the visual continuity intentionally.

## Verification

1. Run `npm run dev` from `frontend/`
2. Open the Timeline page with records on both sides of today
3. Check:
   - Future events (top): dashed line, dot outline, dashed card border, lighter text
   - "Oggi" tag: red right-pointing arrow, correct date, sits between future and past sections
   - Past events (bottom): solid line, filled colored dot, normal card
   - No "Oggi" tag when all records are past-only or future-only
   - Dark mode: all elements render correctly
   - Filter by category: past/future distinction preserved after filtering
