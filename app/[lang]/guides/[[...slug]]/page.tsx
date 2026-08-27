import process from 'node:process'

import { notFound } from 'next/navigation'
import { PostHog } from 'posthog-node'

import { AgentDocsLinks } from '@/components/agent-docs-links'
import { GuidesArticle } from '@/components/guides/article'
import { GuidesLayout } from '@/components/guides/layout'
import { getGuidesMDXComponents } from '@/components/mdx-docs'
import { SponsorCard } from '@/components/sponsor-card'
import { getAgentDocsSourceUrl, getAgentMarkdownPath } from '@/lib/agent-docs/links'
import { createDocsRelativeLink } from '@/lib/docs/links'
import {
  getGuideContentPlacementSlugs,
  getGuideContentPlacementTarget,
  resolveGuideContentSlug,
} from '@/lib/guides/content-placements'
import { createGuideNavigation } from '@/lib/guides/navigation'
import { withLocale } from '@/lib/locale-path'
import { guides } from '@/lib/source'

interface IProps {
  params: Promise<{
    slug?: string[]
    lang: string
  }>
}

const DOCS_ORIGIN = 'https://docs.univer.ai'

export async function generateStaticParams() {
  return [
    ...guides.generateParams(),
    ...guides
      .getLanguages()
      .flatMap(({ language }) => getGuideContentPlacementSlugs().map((slug) => ({ lang: language, slug }))),
  ]
}

export async function generateMetadata({ params }: IProps) {
  const { slug, lang } = await params
  const placementTarget = getGuideContentPlacementTarget(slug)
  const page = guides.getPage(resolveGuideContentSlug(slug), lang)
  if (!page) {
    notFound()
  }

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: placementTarget ? { canonical: `${DOCS_ORIGIN}${withLocale(lang, page.url)}` } : undefined,
  }
}

export default async function Page({ params }: IProps) {
  const { slug, lang } = await params
  const placementTarget = getGuideContentPlacementTarget(slug)
  const page = guides.getPage(resolveGuideContentSlug(slug), lang)
  if (!page) {
    notFound()
  }

  const pathname = placementTarget && slug ? `/guides/${slug.join('/')}` : page.url
  const MDXContent = page.data.body
  const navigation = createGuideNavigation(guides.pageTree[lang], pathname)
  const GuideLink = createDocsRelativeLink(guides, page)

  return (
    <>
      <AgentDocsLinks collection="guides" lang={lang} pageUrl={page.url} />
      <GuidesLayout
        navigation={navigation}
        lang={lang}
        pathname={pathname}
        toc={page.data.toc}
        tocFooter={<SponsorCard />}
      >
        <GuidesArticle
          title={page.data.title}
          description={page.data.description}
          githubUrl={getAgentDocsSourceUrl('guides', page.path)}
          markdownUrl={getAgentMarkdownPath(lang, page.url)}
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
