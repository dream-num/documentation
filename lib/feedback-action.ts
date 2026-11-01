'use server'

import { headers } from 'next/headers'
import { cookieStateToProperties, cookieStoreFromHeader, PostHog, readPostHogCookie } from 'posthog-node'
import { getAnalyticsPage } from '@/lib/analytics-page'
import { feedbackSchema } from '@/lib/feedback'

let client: PostHog | undefined

export async function submitFeedback(input: unknown): Promise<{ ok: boolean }> {
  const parsed = feedbackSchema.safeParse(input)
  if (!parsed.success) return { ok: false }
  if (process.env.NODE_ENV !== 'production') return { ok: true }

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST
  if (!key || !host) return { ok: false }

  try {
    const data = parsed.data
    const requestHeaders = await headers()
    const identity = readPostHogCookie(cookieStoreFromHeader(requestHeaders.get('cookie') ?? ''), key)
    const publicHost = requestHeaders.get('x-forwarded-host')?.split(',')[0].trim() ?? requestHeaders.get('host')
    if (!publicHost) return { ok: false }
    const protocol = requestHeaders.get('x-forwarded-proto')?.split(',')[0].trim() === 'http' ? 'http' : 'https'
    const currentUrl = new URL(data.url, `${protocol}://${publicHost}`)
    const page = getAnalyticsPage(data.url)

    client ??= new PostHog(key, { host, flushInterval: 0 })
    await client.captureImmediate({
      distinctId: identity?.distinctId ?? data.distinct_id ?? data.feedback_id,
      event: data.kind === 'vote' ? 'on_rate_docs' : 'docs_feedback_detail',
      properties: {
        ...(identity ? cookieStateToProperties(identity) : {}),
        ...page,
        site: 'documentation',
        schema_version: 1,
        reporting_side: 'server',
        $process_person_profile: false,
        url: data.url,
        lang: page.locale,
        $current_url: currentUrl.toString(),
        $host: currentUrl.host,
        $pathname: currentUrl.pathname,
        ...(data.session_id ? { $session_id: data.session_id } : {}),
        ...(data.pageview_id ? { $pageview_id: data.pageview_id } : {}),
        feedback_id: data.feedback_id,
        feedback_revision: data.feedback_revision,
        opinion: data.opinion,
        reason: data.reason,
        message: data.message,
      },
    })
    return { ok: true }
  } catch (error) {
    console.error('[feedback] Failed to submit documentation feedback', error)
    return { ok: false }
  }
}
