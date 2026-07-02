import type { Locale } from './routing'
import { routing } from './routing'

export function isAppLocale(value: string | undefined): value is Locale {
  return routing.locales.includes(value as Locale)
}

export function normalizeLocale(value: string | undefined): Locale {
  return isAppLocale(value) ? value : routing.defaultLocale
}

const codeSampleLocaleReplacements: Partial<Record<Locale, Array<[string, string]>>> = {
  'zh-CN': [
    ['en-US', 'zh-CN'],
    ['EnUS', 'ZhCN'],
    ['EN_US', 'ZH_CN'],
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
  'ja-JP': 'cjk',
  'zh-CN': 'cjk',
  'zh-TW': 'cjk',
} satisfies Record<Locale, 'cjk' | 'english'>

export const formulaLocaleFallbacks = {
  'en-US': 'en-US',
  'ja-JP': 'en-US',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-CN',
} satisfies Record<Locale, 'en-US' | 'zh-CN'>

export function getFormulaLocale(locale: string) {
  return formulaLocaleFallbacks[normalizeLocale(locale)]
}
