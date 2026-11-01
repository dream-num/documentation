import { posthog } from 'posthog-js'
import { captureDocumentationLink, enrichAnalyticsEvent } from '@/lib/analytics'

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

if (key && host) {
  try {
    const desktop = window.matchMedia('(min-width: 64rem)')
    const scrollRoot = () => (desktop.matches ? ['[data-doc-scroll-container]', 'html'] : 'html')
    posthog.init(key, {
      api_host: host,
      autocapture: false,
      capture_pageview: 'history_change',
      capture_pageleave: 'if_capture_pageview',
      defaults: '2026-05-30',
      disable_capture_url_hashes: true,
      disable_session_recording: true,
      opt_out_capturing_by_default: process.env.NODE_ENV !== 'production',
      person_profiles: 'identified_only',
      scroll_root_selector: scrollRoot(),
      before_send: enrichAnalyticsEvent,
    })
    desktop.addEventListener('change', () => posthog.set_config({ scroll_root_selector: scrollRoot() }))
    document.addEventListener('click', captureDocumentationLink, true)
    document.addEventListener('auxclick', captureDocumentationLink, true)
  } catch (error) {
    console.error('[analytics] Failed to initialize PostHog', error)
  }
}
