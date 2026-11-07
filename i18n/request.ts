import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { lang } from 'next/root-params'
import { messagesByLocale } from '@/messages'
import { routing } from './routing'

export default getRequestConfig(async ({ locale: explicitLocale }) => {
  const requested = explicitLocale ?? (await lang())
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  return {
    locale,
    messages: messagesByLocale[locale],
  }
})
