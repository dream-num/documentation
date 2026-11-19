import process from 'node:process'
import { PostHog } from 'posthog-node'
import { Rate } from '@/components/rate'
import { trackDocsPageView } from '@/lib/docs/page-view'

interface IDocsFeedbackProps {
  lang: string
  url: string
}

export async function DocsFeedback({ lang, url }: IDocsFeedbackProps) {
  await trackDocsPageView({ lang, url })

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
