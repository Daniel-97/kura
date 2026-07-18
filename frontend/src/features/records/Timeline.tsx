import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useRecords } from './useRecords'
import { useCategories } from '@/features/categories/useCategories'
import { getCategoryStyles } from '@/features/categories/category-styles'
import RecordCard from './RecordCard'
import EcgTrace from '@/components/EcgTrace'
import { InfoTip } from '@/components/InfoTip'
import type { HealthRecord } from '@/lib/types'

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

function isFuture(dateStr: string, now: Date): boolean {
  return new Date(dateStr) > now
}

export default function Timeline() {
  const { t, i18n } = useTranslation()
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  // Debounced copy of the search text so typing doesn't fire a query per keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(id)
  }, [search])
  const { data: categoriesData = [] } = useCategories()
  const categoryById = useMemo(
    () => new Map(categoriesData.map((c) => [c.id, c])),
    [categoriesData],
  )
  const { data, isLoading, isFetching, hasNextPage, isFetchingNextPage, fetchNextPage } = useRecords({
    category: category === '__null' ? '' : (category || undefined),
    search: debouncedSearch || undefined,
  })
  // Spinner while the debounce is pending or the filtered query is in flight
  // (page loads from the infinite scroll have their own indicator).
  const isSearching = search.trim() !== debouncedSearch || (isFetching && !isFetchingNextPage)
  const records = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  )
  const grouped = groupByYearMonth(records)

  // Auto-load older records when the sentinel at the bottom scrolls into view.
  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasNextPage) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isFetchingNextPage) fetchNextPage()
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Split each group into future and past records; a group can appear in both
  // when it straddles today (e.g. current month has past and future records).
  const today = new Date()
  const futureGroups: [string, HealthRecord[]][] = []
  const pastGroups: [string, HealthRecord[]][] = []
  for (const [key, items] of grouped) {
    const futureItems = items.filter((r) => isFuture(r.date, today))
    const pastItems = items.filter((r) => !isFuture(r.date, today))
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
            const cat = r.category ? categoryById.get(r.category) : undefined
            const styles = getCategoryStyles(cat?.color ?? null)
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
                    future ? cn('bg-background', styles.outline) : styles.dot,
                  )} />
                </div>
                {/* §5.2: niente bordo sinistro colorato — la categoria parla
                    attraverso il dot sulla spina e il badge nella card */}
                <RecordCard
                  record={r}
                  className={cn(future && 'border-dashed border-muted-foreground/40 bg-muted/40')}
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
        <h1 className="page-header flex items-center gap-2">
          {t('timeline.title')}
          <InfoTip text={t('timeline.info')} />
        </h1>
        <Button asChild size="sm">
          <Link to="/timeline/new">
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
            <SelectItem value="__null">{t('common.uncategorized')}</SelectItem>
            {categoriesData.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative">
          {isSearching ? (
            <Loader2 className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden="true" />
          ) : (
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          )}
          <Input
            className="w-64 pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('timeline.search')}
            aria-label={t('timeline.search')}
          />
        </div>
      </div>

      {isLoading ? (
        <p className="muted-empty">{t('common.loading')}</p>
      ) : (
        <div
          className={cn(
            'relative transition-opacity duration-200',
            isSearching && 'opacity-50 pointer-events-none',
          )}
          aria-busy={isSearching}
        >
          {isSearching && (
            <div className="absolute inset-x-0 top-10 z-10 flex justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          )}
          {/* §5.5: empty state con la firma ECG (unica occorrenza in pagina) */}
          {records.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <EcgTrace />
              <p className="muted-empty">{t('timeline.empty')}</p>
            </div>
          )}
          {futureGroups.length > 0 && (
            <div className="relative">
              <div
                className="absolute left-[64px] top-0 bottom-0 w-0.5"
                style={{
                  background: 'repeating-linear-gradient(to bottom, var(--border-strong) 0px, var(--border-strong) 5px, transparent 5px, transparent 10px)',
                }}
                aria-hidden="true"
              />
              {renderGroups(futureGroups, true)}
            </div>
          )}

          {/* §1: niente rosso per contenuti non distruttivi — il marcatore
              "oggi" usa il primario brand */}
          {hasSplit && (
            <div
              className="inline-block bg-primary text-primary-foreground text-[9px] font-extrabold uppercase tracking-widest py-[5px] pl-[10px] pr-5"
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

          <div ref={sentinelRef} aria-hidden="true" />
          {isFetchingNextPage && (
            <p className="muted-empty">{t('common.loading')}</p>
          )}
        </div>
      )}
    </div>
  )
}
