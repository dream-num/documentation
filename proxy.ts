import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Matcher ignoring internal assets and backend proxy prefixes.
  matcher: ['/((?!api|universer-api|_next/static|_next/image|favicon.ico|assets).*)'],
}
