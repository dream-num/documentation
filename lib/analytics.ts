import type { CaptureResult, Properties } from 'posthog-js'
import { posthog } from 'posthog-js'
import { routing } from '@/i18n/routing'
import { stripLocalePrefix } from '@/lib/locale-path'

export function captureDocsEvent(event: string, properties?: Properties) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || !process.env.NEXT_PUBLIC_POSTHOG_HOST) return
  posthog.capture(event, properties)
}

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

export function enrichAnalyticsEvent(event: CaptureResult | null) {
  if (!event) return null

  const properties = event.properties
  let url: URL
  try {
    url = new URL(properties.$current_url || window.location.href)
  } catch {
    return null
  }
  Object.assign(properties, getAnalyticsPage(url.pathname), {
    site: 'documentation',
    schema_version: 1,
    reporting_side: 'frontend',
  })

  if (event.event === '$pageview' && typeof properties.$prev_pageview_pathname === 'string') {
    properties.from_path = properties.$prev_pageview_pathname
    properties.from_content_path = getAnalyticsPage(properties.$prev_pageview_pathname).content_path
  }

  // Keep page rankings stable and strip query strings and fragments from URLs.
  for (const values of [properties, properties.$set, properties.$set_once, event.$set, event.$set_once]) {
    if (!values || typeof values !== 'object') continue
    for (const key of [
      '$current_url',
      '$referrer',
      '$initial_current_url',
      '$initial_referrer',
      '$session_entry_url',
    ]) {
      if (typeof values[key] !== 'string' || !values[key]) continue
      try {
        const value = new URL(values[key])
        values[key] = `${value.origin}${value.pathname}`
      } catch {
        delete values[key]
      }
    }
  }

  return event
}

export function captureDocumentationLink(event: MouseEvent) {
  if (event.defaultPrevented || (event.button !== 0 && event.button !== 1) || !(event.target instanceof Element)) return
  const link = event.target.closest<HTMLAnchorElement>('a[href]')
  if (!link) return

  let target: URL
  try {
    target = new URL(link.href, window.location.href)
  } catch {
    return
  }
  if (target.protocol !== 'https:' && target.protocol !== 'http:') return
  const current = new URL(window.location.href)
  const destination = getAnalyticsPage(target.pathname)
  const location =
    [
      ['[role="option"]', 'search'],
      ['[data-toc-link]', 'toc'],
      ['[data-docs-body]', 'article'],
      ['header', 'header'],
      ['footer', 'footer'],
      ['aside', 'sidebar'],
      ['nav', 'navigation'],
    ].find(([selector]) => link.closest(selector))?.[1] ?? 'other'

  captureDocsEvent('docs_link_click', {
    from_path: current.pathname,
    to_path: target.pathname,
    to_content_path: destination.content_path,
    to_content_type: target.origin === current.origin ? destination.content_type : 'external',
    to_locale: target.origin === current.origin ? destination.locale : undefined,
    to_host: target.host,
    to_anchor: target.hash.slice(1) || undefined,
    link_kind:
      target.origin !== current.origin
        ? 'outbound'
        : target.pathname === current.pathname && target.hash
          ? 'anchor'
          : 'internal',
    link_location: location,
    opens_new_context:
      link.target === '_blank' || event.button === 1 || event.metaKey || event.ctrlKey || event.shiftKey,
  })
}
