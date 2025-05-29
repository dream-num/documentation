import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { middleware as nextraMiddleware } from 'nextra/locales'

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|manifest).*)',
  ],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/assets')) {
    return NextResponse.next()
  }
  if (pathname === '/zh-CN' || pathname === '/en-US') {
    return NextResponse.redirect(new URL(`${pathname}/introduction`, request.url))
  }
  if (pathname === '/zh-CN/guides' || pathname === '/en-US/guides') {
    return NextResponse.redirect(new URL(`${pathname}/sheets`, request.url))
  }
  if (pathname === '/zh-CN/blog' || pathname === '/en-US/blog') {
    const { default: meta } = await import('./content/en-US/blog/_meta')
    const currentBlogPath = Object.keys(meta)[0]

    return NextResponse.redirect(new URL(`${pathname}/${currentBlogPath}`, request.url))
  }
  if (pathname === '/zh-CN/playground' || pathname === '/en-US/playground') {
    return NextResponse.redirect(new URL(`${pathname}/sheets/basic`, request.url))
  }

  return nextraMiddleware(request)
}
