import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { messagesByLocale } from '@/messages'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  return {
    locale,
    messages: messagesByLocale[locale],
  }
})
