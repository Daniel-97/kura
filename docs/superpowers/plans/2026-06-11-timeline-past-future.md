# Timeline Past/Future Visual Distinction — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Visually separate future appointments from past records on the timeline: dashed line + outline dots + dashed card borders for future events, a right-pointing red "Oggi" tag as the separator, and the existing solid-line style for past events.

**Architecture:** Three changes to two files. (1) `RecordCard` gains an optional `className` prop forwarded to its `<Card>` so the future dashed border can be applied from the outside. (2) Both i18n locale files get a `timeline.today` key. (3) `Timeline.tsx` gains an `isFuture()` helper, splits `grouped` into `futureGroups`/`pastGroups`, and renders them as two adjacent `relative` sections with different line styles and an interstitial "Oggi" tag.

**Tech Stack:** React 18, TypeScript, Tailwind CSS 3, `cn()` from `@/lib/utils`, `i18next`

**Spec:** `docs/superpowers/specs/2026-06-11-timeline-past-future-design.md`

---

### Task 1: Add optional `className` to RecordCard

**Files:**
- Modify: `frontend/src/components/RecordCard.tsx`

- [ ] **Step 1: Add `className` to the Props interface and forward to `<Card>`**

Replace the current file content with:

```tsx
import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { pb } from '@/lib/pb'
import type { HealthRecord } from '@/lib/types'

interface Props {
  record: HealthRecord
  className?: string
}

export default function RecordCard({ record, className }: Props) {
  const { t, i18n } = useTranslation()
  const tags = record.tags
    ? record.tags.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const dateLabel = new Intl.DateTimeFormat(i18n.language, {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date(record.date))

  return (
    <Card className={className}>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{record.title}</span>
              <Badge variant="secondary">{t(`category.${record.category}`)}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{dateLabel}</p>
            {record.description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {record.description}
              </p>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}
          </div>
          {record.file && record.file.length > 0 && (
            <div className="flex shrink-0 flex-col gap-1">
              {record.file.map((filename) => (
                <a
                  key={filename}
                  href={pb.files.getUrl(record, filename)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('timeline.attachments')}
                  className="text-primary hover:text-primary/80"
                >
                  <FileText className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

---

### Task 2: Add i18n keys for "today"

**Files:**
- Modify: `frontend/src/i18n/locales/it.json`
- Modify: `frontend/src/i18n/locales/en.json`

- [ ] **Step 3: Add `timeline.today` to Italian locale**

In `frontend/src/i18n/locales/it.json`, inside the `"timeline"` object, add after `"attachments"`:

```json
"today": "Oggi"
```

The `"timeline"` block becomes:
```json
"timeline": {
  "title": "Diario sanitario",
  "empty": "Nessun referto trovato",
  "filterByCategory": "Filtra per categoria",
  "filterByTag": "Filtra per tag",
  "allCategories": "Tutte le categorie",
  "attachments": "Allegati",
  "today": "Oggi"
},
```

- [ ] **Step 4: Add `timeline.today` to English locale**

In `frontend/src/i18n/locales/en.json`, inside the `"timeline"` object, add after `"attachments"`:

```json
"today": "Today"
```

The `"timeline"` block becomes:
```json
"timeline": {
  "title": "Health diary",
  "empty": "No records found",
  "filterByCategory": "Filter by category",
  "filterByTag": "Filter by tag",
  "allCategories": "All categories",
  "attachments": "Attachments",
  "today": "Today"
},
```

---

### Task 3: Rewrite Timeline.tsx with past/future logic

**Files:**
- Modify: `frontend/src/pages/Timeline.tsx`

- [ ] **Step 5: Replace the full file content**

```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useRecords } from '@/hooks/useRecords'
import RecordCard from '@/components/RecordCard'
import TagFilter from '@/components/TagFilter'
import { CATEGORIES } from '@/lib/types'
import type { HealthRecord, RecordCategory } from '@/lib/types'

const CATEGORY_DOT: Record<RecordCategory | string, string> = {
  visita:  'bg-indigo-500 ring-indigo-500',
  esame:   'bg-sky-500 ring-sky-500',
  referto: 'bg-emerald-500 ring-emerald-500',
  altro:   'bg-slate-400 ring-slate-400',
}

const CATEGORY_DOT_OUTLINE: Record<RecordCategory | string, string> = {
  visita:  'ring-indigo-500',
  esame:   'ring-sky-500',
  referto: 'ring-emerald-500',
  altro:   'ring-slate-400',
}

function groupByYearMonth(records: HealthRecord[]): [string, HealthRecord[]][] {
  const map = new Map<string, HealthRecord[]>()
  for (const r of records) {
    const d = new Date(r.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(r)
  }
  return [...map.entries()].sort(([a], [b]) => b.localeCompare(a))
}

function isFuture(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateStr) >= today
}

export default function Timeline() {
  const { t, i18n } = useTranslation()
  const [category, setCategory] = useState('')
  const [tag, setTag] = useState('')
  const { data, isLoading } = useRecords({
    category: category || undefined,
    tag: tag || undefined,
  })
  const records = data?.items ?? []
  const grouped = groupByYearMonth(records)

  // Split each group into future and past records; a group can appear in both
  // when it straddles today (e.g. current month has past and future records).
  const futureGroups: [string, HealthRecord[]][] = []
  const pastGroups: [string, HealthRecord[]][] = []
  for (const [key, items] of grouped) {
    const futureItems = items.filter((r) => isFuture(r.date))
    const pastItems = items.filter((r) => !isFuture(r.date))
    if (futureItems.length > 0) futureGroups.push([key, futureItems])
    if (pastItems.length > 0) pastGroups.push([key, pastItems])
  }
  const hasSplit = futureGroups.length > 0 && pastGroups.length > 0

  const todayLabel = new Intl.DateTimeFormat(i18n.language, {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date())

  const renderGroups = (groups: [string, HealthRecord[]][], future: boolean) =>
    groups.map(([key, items]) => {
      const [year, month] = key.split('-').map(Number)
      const monthLabel = new Intl.DateTimeFormat(i18n.language, {
        month: 'long',
      }).format(new Date(year, month - 1))

      return (
        <div key={`${key}-${future ? 'f' : 'p'}`} className="mb-8">
          <p className={cn(
            'text-5xl font-black tracking-tighter leading-none select-none text-foreground',
            future ? 'opacity-[0.04]' : 'opacity-[0.07]',
          )}>
            {year}
          </p>
          <p className={cn(
            'pl-[88px] text-[10px] font-bold uppercase tracking-widest mt-1 mb-3',
            future ? 'text-muted-foreground/40' : 'text-muted-foreground',
          )}>
            {monthLabel}
          </p>

          {items.map((r) => {
            const day = String(new Date(r.date).getDate()).padStart(2, '0')
            return (
              <div key={r.id} className="grid grid-cols-[40px_24px_1fr] items-start gap-x-3 mb-3">
                <span className={cn(
                  'text-right text-[11px] font-bold pt-3 leading-none',
                  future ? 'text-muted-foreground/40' : 'text-muted-foreground',
                )}>
                  {day}
                </span>
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
                  className={future ? 'border-dashed border-border/50 bg-muted/20' : undefined}
                />
              </div>
            )
          })}
        </div>
      )
    })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('timeline.title')}</h1>
        <Button asChild size="sm">
          <Link to="/nuovo">
            <Plus className="mr-1 h-4 w-4" />
            {t('record.newRecord')}
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
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
        <TagFilter value={tag} onChange={setTag} />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : records.length === 0 ? (
        <p className="text-muted-foreground">{t('timeline.empty')}</p>
      ) : (
        <>
          {futureGroups.length > 0 && (
            <div className="relative">
              <div
                className="absolute left-[64px] top-0 bottom-0 w-0.5"
                style={{
                  background: 'repeating-linear-gradient(to bottom, hsl(var(--border)) 0px, hsl(var(--border)) 5px, transparent 5px, transparent 10px)',
                }}
                aria-hidden="true"
              />
              {renderGroups(futureGroups, true)}
            </div>
          )}

          {hasSplit && (
            <div
              className="inline-block bg-rose-500 text-white text-[9px] font-extrabold uppercase tracking-widest py-[5px] pl-[10px] pr-5"
              style={{ clipPath: 'polygon(0% 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0% 100%)' }}
            >
              {t('timeline.today')} · {todayLabel}
            </div>
          )}

          {pastGroups.length > 0 && (
            <div className="relative">
              <div className="absolute left-[64px] top-0 bottom-0 w-0.5 bg-border" aria-hidden="true" />
              {renderGroups(pastGroups, false)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Verify TypeScript compiles cleanly**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

---

### Task 4: Build and verify

- [ ] **Step 7: Full build check**

```bash
cd frontend && npm run build 2>&1 | tail -10
```

Expected: `✓ built in ...` with no errors.

- [ ] **Step 8: Start dev server and verify visually**

```bash
cd frontend && npm run dev
```

Open `http://localhost:5173`. On the Timeline page check:

1. **Future section (top):** dashed vertical line, dot outline (hollow, category-color ring), card with dashed border + lighter background, day number and month in muted/40 color, year watermark at opacity 4%
2. **"Oggi" separator:** red right-pointing arrow tag with "Oggi · [formatted date]", appears only when both future and past records exist
3. **Past section (bottom):** solid vertical line, filled colored dot, normal card, normal text colors, year watermark at opacity 7%
4. **All-past case:** no "Oggi" tag, solid line throughout
5. **All-future case:** no "Oggi" tag, dashed line throughout
6. **Mixed-month case:** if a month group has records both before and after today, future records appear in the future section and past records in the past section — the same month label appears in both sections, separated by "Oggi"
7. **Dark mode:** toggle — dashed line, dot outlines, and tag all render correctly
8. **Category filter:** past/future distinction preserved after filtering

- [ ] **Step 9: Commit**

```bash
git add frontend/src/components/RecordCard.tsx \
        frontend/src/i18n/locales/it.json \
        frontend/src/i18n/locales/en.json \
        frontend/src/pages/Timeline.tsx
git commit -m "feat: add past/future distinction with today indicator to timeline"
```
