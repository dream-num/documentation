import type { Locale } from './i18n/routing'
import type { Messages } from './messages/en-US'

declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale
    Messages: Messages
  }
}
