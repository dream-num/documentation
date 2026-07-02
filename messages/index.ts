import type { Messages } from './en-US'
import type { Locale } from '@/i18n/routing'
import enUSMessages from './en-US'
import jaJPMessages from './ja-JP'
import zhCNMessages from './zh-CN'
import zhTWMessages from './zh-TW'

export const messagesByLocale = {
  'en-US': enUSMessages,
  'ja-JP': jaJPMessages,
  'zh-CN': zhCNMessages,
  'zh-TW': zhTWMessages,
} satisfies Record<Locale, Messages>
