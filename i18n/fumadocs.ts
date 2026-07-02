import { defineI18n } from 'fumadocs-core/i18n'
import { routing } from './routing'

export const fumadocsI18n = defineI18n({
  defaultLanguage: routing.defaultLocale,
  hideLocale: 'always',
  languages: [...routing.locales],
})
