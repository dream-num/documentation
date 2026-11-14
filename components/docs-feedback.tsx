import process from 'node:process'
import { headers } from 'next/headers'
import { after, userAgent } from 'next/server'
import { PostHog } from 'posthog-node'
import { Rate } from '@/components/rate'
import { withLocale } from '@/lib/locale-path'

interface IDocsFeedbackProps {
  lang: string
  url: string
}

export async function DocsFeedback({ lang, url }: IDocsFeedbackProps) {
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

  return (
    <Rate
      lang={lang}
      onRateAction={async (pageUrl, feedback) => {
        'use server'

        if (!process.env.NEXT_POSTHOG_APIKEY) return

        const posthog = new PostHog(process.env.NEXT_POSTHOG_APIKEY, {
          host: 'https://us.i.posthog.com',
          flushInterval: 0,
        })
        posthog.capture({
          event: 'on_rate_docs',
          timestamp: new Date(),
          distinctId: 'anonymous',
          properties: { ...feedback, url: pageUrl, lang },
        })
        await posthog.shutdown()
      }}
    />
  )
}
