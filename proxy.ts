import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'

import { routing } from '@/i18n/routing'

const intlMiddleware = createMiddleware(routing)
const guidesRootPath = new RegExp(`^/(?:(${routing.locales.join('|')})/)?guides/?$`)
const showcasePath = new RegExp(`^/(?:(${routing.locales.join('|')})/)?((?:showcase|playground)(?:/.*)?)$`)
const agentDocsPath = new RegExp(
  `^/(?:(?:(${routing.locales.join('|')})/))?(llms(?:-full)?\\.txt|(?:guides|server|ai|reference)(?:\\.md|/llms\\.txt|/.+\\.md))$`,
)

export default function proxy(request: NextRequest) {
  if (guidesRootPath.test(request.nextUrl.pathname)) {
    const destination = request.nextUrl.clone()
    destination.pathname = `${destination.pathname.replace(/\/$/, '')}/sheets`
    return NextResponse.redirect(destination)
  }

  const showcaseMatch = request.nextUrl.pathname.match(showcasePath)
  if (showcaseMatch && showcaseMatch[2] !== 'playground/theme-customizer') {
    const locale = showcaseMatch[1] || routing.defaultLocale
    const origin = process.env.NEXT_PUBLIC_SHOWCASES_ORIGIN || 'https://office.univer.ai'
    const pathname = /^showcase\/?$/.test(showcaseMatch[2]) ? '/' : `/${locale}/${showcaseMatch[2]}`
    const destination = new URL(pathname, origin)
    destination.search = request.nextUrl.search
    return NextResponse.redirect(destination)
  }

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
  // Keep MCP requests outside locale routing, alongside APIs and assets.
  matcher: ['/((?!mcp(?:/|$)|api|universer-api|_next/static|_next/image|icon.svg|assets).*)'],
}
