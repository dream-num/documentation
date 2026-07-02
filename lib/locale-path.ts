import { routing } from '@/i18n/routing'

const localePattern = new RegExp(`^/(?:${routing.locales.join('|')})(?=/|$)`)

export function stripLocalePrefix(pathname: string) {
  return pathname.replace(localePattern, '') || '/'
}

export function withLocale(lang: string, pathname: string) {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`

  if (lang === routing.defaultLocale) {
    return normalizedPath
  }

  return `/${lang}${normalizedPath}`
}

export function isPathActive(pathname: string, href: string) {
  const normalizedPathname = stripLocalePrefix(pathname)
  const normalizedHref = stripLocalePrefix(href)

  if (normalizedPathname === normalizedHref) return true
  if (normalizedHref === '/') return normalizedPathname === '/'

  return normalizedPathname.startsWith(`${normalizedHref}/`)
}
