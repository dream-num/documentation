import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import { routing } from '@/i18n/routing'
import { withHttpsAlternateLinks } from '@/lib/docs/alternate-links'
import { resolveLegacyDocsPath } from '@/lib/docs/legacy-redirects'
import { withLocale } from '@/lib/locale-path'

const intlMiddleware = createMiddleware(routing)
const defaultLocalePath = new RegExp(`^/${routing.defaultLocale}(/.*)?$`)
const guidesRootPath = new RegExp(`^/(?:(${routing.locales.join('|')})/)?guides/?$`)
const showcasePath = new RegExp(`^/(?:(${routing.locales.join('|')})/)?((?:showcase|playground)(?:/.*)?)$`)
const agentDocsPath = new RegExp(
  `^/(?:(?:(${routing.locales.join('|')})/))?(llms(?:-full)?\\.txt|(?:overview|guides|server|ai|reference)(?:\\.md|/llms\\.txt|/.+\\.md))$`,
)

export default function proxy(request: NextRequest) {
  const legacy = resolveLegacyDocsPath(request.nextUrl.pathname, routing.locales)
  if (legacy) {
    const destination = new URL(withLocale(legacy.locale || routing.defaultLocale, legacy.target), request.url)
    destination.search = request.nextUrl.search
    return NextResponse.redirect(destination, 308)
  }

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

  // English pages have no prefix; /en-US/… is a permanent move, so search engines keep only the short address.
  const defaultLocaleMatch = request.nextUrl.pathname.match(defaultLocalePath)
  if (defaultLocaleMatch) {
    const destination = request.nextUrl.clone()
    destination.pathname = defaultLocaleMatch[1] || '/'
    return NextResponse.redirect(destination, 308)
  }

  const match = request.nextUrl.pathname.match(agentDocsPath)
  if (!match) {
    const response = intlMiddleware(request)
    const link = response.headers.get('link')
    if (link) response.headers.set('link', withHttpsAlternateLinks(link))
    return response
  }

  const locale = match[1] ?? routing.defaultLocale

  const destination = request.nextUrl.clone()
  destination.pathname = `/api/agent-docs/${locale}/${match[2]}`
  return NextResponse.rewrite(destination)
}

export const config = {
  // Keep MCP requests outside locale routing, alongside APIs and assets.
  matcher: ['/((?!mcp(?:/|$)|api|universer-api|_next/static|_next/image|icon.svg|assets|sitemap.xml$|robots.txt$).*)'],
}
