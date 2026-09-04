import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'

import { routing } from '@/i18n/routing'

const intlMiddleware = createMiddleware(routing)
const agentDocsPath = new RegExp(
  `^/(?:(?:(${routing.locales.join('|')})/))?(llms(?:-full)?\\.txt|(?:guides|reference|icons)(?:\\.md|/llms\\.txt|/.+\\.md))$`,
)

export default function proxy(request: NextRequest) {
  const match = request.nextUrl.pathname.match(agentDocsPath)
  if (!match) return intlMiddleware(request)

  const locale = match[1] ?? routing.defaultLocale
  if (match[1] === routing.defaultLocale) {
    const canonicalUrl = request.nextUrl.clone()
    canonicalUrl.pathname = `/${match[2]}`
    return NextResponse.redirect(canonicalUrl)
  }

  const destination = request.nextUrl.clone()
  destination.pathname = `/api/agent-docs/${locale}/${match[2]}`
  return NextResponse.rewrite(destination)
}

export const config = {
  // Matcher ignoring internal assets and backend proxy prefixes.
  matcher: ['/((?!api|universer-api|_next/static|_next/image|icon.svg|assets).*)'],
}
