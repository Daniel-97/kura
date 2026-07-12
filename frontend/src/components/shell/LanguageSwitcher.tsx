import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { pb } from '@/lib/pb'
import type { SupportedLanguage } from '@/features/auth/languageSync'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const next: SupportedLanguage = i18n.language.startsWith('it') ? 'en' : 'it'

  // Persist the choice on the profile so reminder emails use it too;
  // keep authStore in sync so a later auth refresh can't revert the UI.
  const persist = useMutation({
    mutationFn: (language: SupportedLanguage) =>
      pb.collection('users').update(pb.authStore.model!.id, { language }),
    onSuccess: (record) => pb.authStore.save(pb.authStore.token, record),
  })

  const handleClick = () => {
    i18n.changeLanguage(next)
    if (pb.authStore.isValid) persist.mutate(next)
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick}>
      {next.toUpperCase()}
    </Button>
  )
}
