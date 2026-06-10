import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateRecord } from '@/hooks/useRecords'
import { useAuth } from '@/hooks/useAuth'
import { CATEGORIES } from '@/lib/types'

export default function RecordForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { userId } = useAuth()
  const createRecord = useCreateRecord()

  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !category) return

    const fd = new FormData()
    fd.append('title', title)
    fd.append('date', date)
    fd.append('category', category)
    fd.append('tags', tags)
    fd.append('description', description)
    fd.append('user', userId)
    if (files) Array.from(files).forEach((f) => fd.append('file', f))

    createRecord.mutate(fd, {
      onSuccess: () => { toast.success(t('record.savedSuccess')); navigate('/') },
      onError:   () => toast.error(t('common.error')),
    })
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>{t('record.newRecord')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('record.title')}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('record.titlePlaceholder')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">{t('record.date')}</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
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
            <div className="space-y-2">
              <Label htmlFor="tags">{t('record.tags')}</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={t('record.tagsPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t('record.description')}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('record.descriptionPlaceholder')}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="files">{t('record.files')}</Label>
              <Input
                id="files"
                type="file"
                multiple
                accept=".pdf,image/*"
                onChange={(e) => setFiles(e.target.files)}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={createRecord.isPending}>
                {createRecord.isPending ? t('common.loading') : t('common.save')}
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
