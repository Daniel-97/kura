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
import CategoryPicker from './CategoryPicker'
import {
  useCategories, useCreateCategory, useDeleteCategory, useCategoryCounts,
} from './useCategories'
import { useAuth } from '@/features/auth/useAuth'
import { CATEGORY_COLORS, SWATCH_CLASSES } from './category-styles'
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
