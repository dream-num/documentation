import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  defaultLocale: 'en-US',
  localeCookie: {
    name: 'FD_LOCALE',
    sameSite: 'lax',
  },
  localePrefix: 'as-needed',
  locales: ['en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR', 'fr-FR', 'ru-RU', 'es-ES'],
})

export type Locale = (typeof routing.locales)[number]
