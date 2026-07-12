import { pb } from '@/lib/pb'
import i18n from '@/i18n'

export const SUPPORTED_LANGUAGES = ['it', 'en'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

/** Validate the `language` value stored on the user record. */
export function pickUserLanguage(stored: unknown): SupportedLanguage | null {
  return (SUPPORTED_LANGUAGES as readonly unknown[]).includes(stored)
    ? (stored as SupportedLanguage)
    : null
}

/**
 * Apply the language saved on the user profile whenever the auth state
 * changes (login, auth refresh). Called once at app startup.
 */
export function initLanguageSync() {
  pb.authStore.onChange((_token, model) => {
    const lang = pickUserLanguage(model?.language)
    if (lang && !i18n.language.startsWith(lang)) {
      i18n.changeLanguage(lang)
    }
  })
}
