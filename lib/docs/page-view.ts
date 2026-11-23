import process from 'node:process'
import { headers } from 'next/headers'
import { after, userAgent } from 'next/server'
import { PostHog } from 'posthog-node'
import { withLocale } from '@/lib/locale-path'
import 'server-only'

interface IDocsPageViewParams {
  lang: string
  url: string
}

export async function trackDocsPageView({ lang, url }: IDocsPageViewParams) {
  const pathname = withLocale(lang, url)
  const apiKey = process.env.NEXT_POSTHOG_APIKEY

  if (process.env.NODE_ENV === 'production' && apiKey) {
    // Read during render so visits run per request instead of during static generation.
    const requestHeaders = await headers()
    const agent = userAgent({ headers: requestHeaders })
    const referrer = requestHeaders.get('referer')
    const isPrefetch =
      requestHeaders.get('purpose')?.includes('prefetch') || requestHeaders.get('sec-purpose')?.includes('prefetch')

    if (!agent.isBot && !isPrefetch && !requestHeaders.has('next-action')) {
      after(async () => {
        const posthog = new PostHog(apiKey, { host: 'https://us.i.posthog.com', flushInterval: 0 })
        posthog.capture({
          event: 'on_view_docs',
          distinctId: 'anonymous',
          properties: {
            url: pathname,
            lang,
            referrer,
            $browser: agent.browser.name,
            $os: agent.os.name,
            $device_type:
              agent.device.type === 'mobile' ? 'Mobile' : agent.device.type === 'tablet' ? 'Tablet' : 'Desktop',
            $process_person_profile: false,
          },
        })
        await posthog.shutdown()
      })
    }
  }
}
