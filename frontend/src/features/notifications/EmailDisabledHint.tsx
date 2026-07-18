import { useTranslation } from 'react-i18next'
import { Info } from 'lucide-react'
import { useEmailStatus } from './useEmailStatus'

/** Discreet note shown near email toggles when the server can't send.
 *  §2.3: il nuovo sistema non ha un colore --info dedicato — le note
 *  informative usano una superficie neutra, non un blu che farebbe da
 *  secondo accento in un sistema quasi-monocromatico. */
export default function EmailDisabledHint() {
  const { t } = useTranslation()
  const { data } = useEmailStatus()

  if (!data || data.emailEnabled) return null

  return (
    <p className="flex items-start gap-1.5 rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text-secondary">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
      {t('notifications.emailNotConfigured')}
    </p>
  )
}
