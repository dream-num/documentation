import { routing } from '@/i18n/routing'
import { stripLocalePrefix } from '@/lib/locale-path'

export function getAnalyticsPage(pathname: string) {
  const contentPath = stripLocalePrefix(pathname).replace(/\/+$/, '') || '/'
  const section = contentPath.split('/')[1] || 'home'
  const locale =
    routing.locales.find((lang) => pathname === `/${lang}` || pathname.startsWith(`/${lang}/`)) ?? routing.defaultLocale

  return {
    page_path: pathname,
    content_path: contentPath,
    content_section: section,
    content_type: ['overview', 'guides', 'server', 'ai', 'reference', 'icons'].includes(section)
      ? 'documentation'
      : section === 'blog'
        ? 'blog'
        : 'other',
    locale,
  }
}
