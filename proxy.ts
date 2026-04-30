import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware'
import { i18n } from '@/lib/i18n'

export default createI18nMiddleware(i18n)

export const config = {
  // Matcher ignoring internal assets and backend proxy prefixes.
  matcher: ['/((?!api|universer-api|_next/static|_next/image|favicon.ico|assets).*)'],
}
