import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const next = i18n.language.startsWith('it') ? 'en' : 'it'
  return (
    <Button variant="ghost" size="sm" onClick={() => i18n.changeLanguage(next)}>
      {next.toUpperCase()}
    </Button>
  )
}
