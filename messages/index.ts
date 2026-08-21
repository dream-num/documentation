import type { Locale } from '@/i18n/routing'

import type { Messages } from './en-US'
import deDEMessages from './de-DE'
import enUSMessages from './en-US'
import esESMessages from './es-ES'
import frFRMessages from './fr-FR'
import jaJPMessages from './ja-JP'
import koKRMessages from './ko-KR'
import ruRUMessages from './ru-RU'
import zhCNMessages from './zh-CN'
import zhTWMessages from './zh-TW'

export const messagesByLocale = {
  'en-US': enUSMessages,
  'de-DE': deDEMessages,
  'es-ES': esESMessages,
  'fr-FR': frFRMessages,
  'ja-JP': jaJPMessages,
  'ko-KR': koKRMessages,
  'ru-RU': ruRUMessages,
  'zh-CN': zhCNMessages,
  'zh-TW': zhTWMessages,
} satisfies Record<Locale, Messages>
