import process from 'node:process'

import { notFound } from 'next/navigation'
import { PostHog } from 'posthog-node'

import { AgentDocsLinks } from '@/components/agent-docs-links'
import { GuidesArticle } from '@/components/guides/article'
import { GuidesPageLayout } from '@/components/guides/layout'
import { getGuidesMDXComponents } from '@/components/mdx/components'
import { SponsorCard } from '@/components/sponsor-card'
import { getAgentDocsSourceUrl, getAgentMarkdownPath } from '@/lib/agent-docs/links'
import { createDocsRelativeLink } from '@/lib/docs/links'
import {
  getGuideContentPlacementSlugs,
  getGuideContentPlacementTarget,
  resolveGuideContentSlug,
} from '@/lib/guides/content-placements'
import { createGuideNavigation } from '@/lib/guides/navigation'
import { guideNavigationSource } from '@/lib/guides/navigation-source'
import { withLocale } from '@/lib/locale-path'
import { sdkSources } from '@/lib/source'

interface IProps {
  params: Promise<{
    sdk: string
    slug?: string[]
    lang: string
  }>
}

const DOCS_ORIGIN = 'https://docs.univer.ai'

export async function generateStaticParams() {
  return Object.entries(sdkSources).flatMap(([sdk, source]) => [
    ...source.generateParams().map((params) => ({ ...params, sdk })),
    ...(sdk === 'guides'
      ? source
          .getLanguages()
          .flatMap(({ language }) => getGuideContentPlacementSlugs().map((slug) => ({ sdk, lang: language, slug })))
      : []),
  ])
}

function getSdkSource(sdk: string) {
  if (sdk !== 'guides' && sdk !== 'server' && sdk !== 'ai') notFound()
  return { source: sdkSources[sdk], collection: sdk } as const
}

export async function generateMetadata({ params }: IProps) {
  const { sdk, slug, lang } = await params
  const { source } = getSdkSource(sdk)
  const placementTarget = sdk === 'guides' ? getGuideContentPlacementTarget(slug) : undefined
  const page = source.getPage(sdk === 'guides' ? resolveGuideContentSlug(slug) : slug, lang)
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
  const { sdk, slug, lang } = await params
  const { source, collection } = getSdkSource(sdk)
  const placementTarget = sdk === 'guides' ? getGuideContentPlacementTarget(slug) : undefined
  const page = source.getPage(sdk === 'guides' ? resolveGuideContentSlug(slug) : slug, lang)
  if (!page) {
    notFound()
  }

  const pathname = placementTarget && slug ? `/guides/${slug.join('/')}` : page.url
  const { default: MDXContent, toc } = await page.data.load()
  const navigation = createGuideNavigation(guideNavigationSource.pageTree[lang], pathname)
  const GuideLink = createDocsRelativeLink(source, page)

  return (
    <GuidesPageLayout lang={lang} toc={[...toc]} tocFooter={<SponsorCard />}>
      <AgentDocsLinks collection={collection} lang={lang} pageUrl={page.url} />
      <GuidesArticle
        title={page.data.title}
        description={page.data.description}
        githubUrl={getAgentDocsSourceUrl(collection, page.path)}
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
    </GuidesPageLayout>
  )
}
