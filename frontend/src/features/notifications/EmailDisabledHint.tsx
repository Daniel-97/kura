import { useTranslation } from 'react-i18next'
import { Info } from 'lucide-react'
import { useEmailStatus } from './useEmailStatus'

/** Discreet note shown near email toggles when the server can't send
 *  (§2.3: informational, not an error — the feature still saves). */
export default function EmailDisabledHint() {
  const { t } = useTranslation()
  const { data } = useEmailStatus()

  if (!data || data.emailEnabled) return null

  return (
    <p className="flex items-start gap-1.5 rounded-md bg-info-bg px-3 py-2 text-sm text-info">
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      {t('notifications.emailNotConfigured')}
    </p>
  )
}
