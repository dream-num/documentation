import process from 'node:process'

import { notFound } from 'next/navigation'
import { PostHog } from 'posthog-node'

import { AgentDocsLinks } from '@/components/agent-docs-links'
import { GuidesArticle } from '@/components/guides/article'
import { GuidesLayout } from '@/components/guides/layout'
import { getGuidesMDXComponents } from '@/components/mdx-docs'
import { SponsorCard } from '@/components/sponsor-card'
import { createDocsRelativeLink } from '@/lib/docs/links'
import { getGuidesEditUrl } from '@/lib/github'
import { createGuideNavigation } from '@/lib/guides/navigation'
import { guides } from '@/lib/source'

interface IProps {
  params: Promise<{
    slug?: string[]
    lang: string
  }>
}

export async function generateStaticParams() {
  return guides.generateParams()
}

export async function generateMetadata({ params }: IProps) {
  const { slug, lang } = await params
  const page = guides.getPage(slug, lang)
  if (!page) {
    notFound()
  }

  return {
    title: page.data.title,
    description: page.data.description,
  }
}

export default async function Page({ params }: IProps) {
  const { slug, lang } = await params
  const page = guides.getPage(slug, lang)
  if (!page) {
    notFound()
  }

  const MDXContent = page.data.body
  const navigation = createGuideNavigation(guides.pageTree[lang], page.url)
  const editUrl = await getGuidesEditUrl(page.path)
  const GuideLink = createDocsRelativeLink(guides, page)

  return (
    <>
      <AgentDocsLinks collection="guides" lang={lang} pageUrl={page.url} />
      <GuidesLayout
        navigation={navigation}
        lang={lang}
        pathname={page.url}
        toc={page.data.toc}
        tocFooter={<SponsorCard />}
      >
        <GuidesArticle
          title={page.data.title}
          description={page.data.description}
          editUrl={editUrl}
          navigation={navigation}
          lang={lang}
          onRateAction={async (url, feedback) => {
            'use server'

            if (!process.env.NEXT_POSTHOG_APIKEY) return

            const posthog = new PostHog(process.env.NEXT_POSTHOG_APIKEY, { host: 'https://us.i.posthog.com' })

            posthog.capture({
              event: 'on_rate_docs',
              timestamp: new Date(),
              distinctId: 'anonymous',
              properties: {
                ...feedback,
                url,
                lang,
              },
            })
          }}
        >
          <div data-docs-body>
            <MDXContent
              components={getGuidesMDXComponents({
                a: GuideLink,
              })}
            />
          </div>
        </GuidesArticle>
      </GuidesLayout>
    </>
  )
}
