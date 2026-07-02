import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  defaultLocale: 'en-US',
  localeCookie: {
    name: 'FD_LOCALE',
    sameSite: 'lax',
  },
  localePrefix: 'as-needed',
  locales: ['en-US', 'zh-CN', 'zh-TW', 'ja-JP'],
})

export type Locale = (typeof routing.locales)[number]
