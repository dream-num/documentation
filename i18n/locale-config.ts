import type { Locale } from './routing'
import { routing } from './routing'

export function isAppLocale(value: string | undefined): value is Locale {
  return routing.locales.includes(value as Locale)
}

export function normalizeLocale(value: string | undefined): Locale {
  return isAppLocale(value) ? value : routing.defaultLocale
}

const codeSampleLocaleReplacements: Partial<Record<Locale, Array<[string, string]>>> = {
  'es-ES': [
    ['en-US', 'es-ES'],
    ['EnUS', 'EsES'],
    ['EN_US', 'ES_ES'],
  ],
  'zh-CN': [
    ['en-US', 'zh-CN'],
    ['EnUS', 'ZhCN'],
    ['EN_US', 'ZH_CN'],
  ],
  'ko-KR': [
    ['en-US', 'ko-KR'],
    ['EnUS', 'KoKR'],
    ['EN_US', 'KO_KR'],
  ],
  'fr-FR': [
    ['en-US', 'fr-FR'],
    ['EnUS', 'FrFR'],
    ['EN_US', 'FR_FR'],
  ],
  'ru-RU': [
    ['en-US', 'ru-RU'],
    ['EnUS', 'RuRU'],
    ['EN_US', 'RU_RU'],
  ],
}

export function transformLocaleCodeSample(source: string, locale: string) {
  return (codeSampleLocaleReplacements[normalizeLocale(locale)] ?? []).reduce(
    (value, [from, to]) => value.replaceAll(from, to),
    source,
  )
}

export const searchLocaleProfiles = {
  'en-US': 'english',
  'es-ES': 'english',
  'fr-FR': 'english',
  'ja-JP': 'cjk',
  'ko-KR': 'cjk',
  'ru-RU': 'english',
  'zh-CN': 'cjk',
  'zh-TW': 'cjk',
} satisfies Record<Locale, 'cjk' | 'english'>

export const formulaLocaleFallbacks = {
  'en-US': 'en-US',
  'es-ES': 'en-US',
  'fr-FR': 'fr-FR',
  'ja-JP': 'en-US',
  'ko-KR': 'ko-KR',
  'ru-RU': 'ru-RU',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-CN',
} satisfies Record<Locale, 'en-US' | 'zh-CN' | 'ko-KR' | 'fr-FR' | 'ru-RU'>

export function getFormulaLocale(locale: string) {
  return formulaLocaleFallbacks[normalizeLocale(locale)]
}
