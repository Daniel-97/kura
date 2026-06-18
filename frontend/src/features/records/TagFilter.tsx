import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function TagFilter({ value, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <Input
      className="w-44"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={t('timeline.filterByTag')}
    />
  )
}
