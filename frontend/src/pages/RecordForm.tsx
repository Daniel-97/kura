import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateRecord, useUpdateRecord, useFetchRecord } from '@/hooks/useRecords'
import { useAuth } from '@/features/auth/useAuth'
import { useCategories } from '@/features/categories/useCategories'
import { toLocalInputValue, fromLocalInputValue } from '@/lib/utils'

export default function RecordForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = !!id
  const { userId } = useAuth()

  const createRecord = useCreateRecord()
  const updateRecord = useUpdateRecord()
  const { data: existingRecord, isLoading: isLoadingRecord } = useFetchRecord(id ?? '')
  const { data: categories = [] } = useCategories()

  const [title, setTitle] = useState('')
  const [date, setDate] = useState(toLocalInputValue(new Date().toISOString()))
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)

  // Edit mode file state
  const [existingFiles, setExistingFiles] = useState<string[]>([])
  const [filesToRemove, setFilesToRemove] = useState<Set<string>>(new Set())
  const [newFiles, setNewFiles] = useState<File[]>([])

  useEffect(() => {
    if (existingRecord) {
      setTitle(existingRecord.title)
      setDate(toLocalInputValue(existingRecord.date))
      setCategory(existingRecord.category ?? '')
      setTags(existingRecord.tags ?? '')
      setDescription(existingRecord.description ?? '')
      setExistingFiles(existingRecord.file ?? [])
    }
  }, [existingRecord])

  const toggleRemoveFile = (filename: string) => {
    setFilesToRemove((prev) => {
      const next = new Set(prev)
      if (next.has(filename)) next.delete(filename)
      else next.add(filename)
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    const fd = new FormData()
    fd.append('title', title)
    fd.append('date', fromLocalInputValue(date))
    if (category) fd.append('category', category)
    fd.append('tags', tags)
    fd.append('description', description)

    if (isEditMode) {
      filesToRemove.forEach((filename) => fd.append('file-', filename))
      newFiles.forEach((f) => fd.append('file+', f))

      updateRecord.mutate({ id: id!, data: fd }, {
        onSuccess: () => {
          toast.success(t('record.updatedSuccess'))
          navigate('/')
        },
        onError: () => toast.error(t('common.error')),
      })
    } else {
      if (!userId) return
      fd.append('user', userId)
      if (files) Array.from(files).forEach((f) => fd.append('file', f))

      createRecord.mutate(fd, {
        onSuccess: () => { toast.success(t('record.savedSuccess')); navigate('/') },
        onError: () => toast.error(t('common.error')),
      })
    }
  }

  const isPending = isEditMode ? updateRecord.isPending : createRecord.isPending

  if (isEditMode && isLoadingRecord) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {t('common.loading')}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditMode ? t('record.editRecord') : t('record.newRecord')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-field">
              <Label htmlFor="title">{t('record.title')}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('record.titlePlaceholder')}
                required
              />
            </div>
            <div className="form-field">
              <Label htmlFor="date">{t('record.date')}</Label>
              <Input
                id="date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
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
            <div className="form-field">
              <Label htmlFor="tags">{t('record.tags')}</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={t('record.tagsPlaceholder')}
              />
            </div>
            <div className="form-field">
              <Label htmlFor="description">{t('record.description')}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('record.descriptionPlaceholder')}
                rows={4}
              />
            </div>

            {isEditMode && existingFiles.length > 0 && (
              <div className="form-field">
                <Label>{t('record.existingFiles')}</Label>
                <div className="space-y-1">
                  {existingFiles.map((filename) => (
                    <div
                      key={filename}
                      className={`flex items-center justify-between gap-2 rounded-md border px-3 py-1.5 text-sm ${
                        filesToRemove.has(filename)
                          ? 'opacity-40 line-through'
                          : ''
                      }`}
                    >
                      <span className="truncate">{filename}</span>
                      <button
                        type="button"
                        onClick={() => toggleRemoveFile(filename)}
                        className="icon-btn-destructive"
                        aria-label={filesToRemove.has(filename) ? 'Ripristina' : 'Rimuovi'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-field">
              <Label htmlFor="files">
                {isEditMode ? t('record.addMoreFiles') : t('record.files')}
              </Label>
              <Input
                id="files"
                type="file"
                multiple
                accept=".pdf,image/*"
                onChange={(e) => {
                  if (isEditMode) {
                    setNewFiles(e.target.files ? Array.from(e.target.files) : [])
                  } else {
                    setFiles(e.target.files)
                  }
                }}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? t('common.loading') : t('common.save')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
