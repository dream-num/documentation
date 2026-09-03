import process from 'node:process'

import { notFound } from 'next/navigation'
import { PostHog } from 'posthog-node'

import { AgentDocsLinks } from '@/components/agent-docs-links'
import { DocsArticle } from '@/components/docs-shell/article'
import { DocsShellPageLayout } from '@/components/docs-shell/layout'
import { getGuidesMDXComponents } from '@/components/mdx'
import { SponsorCard } from '@/components/sponsor-card'
import { getAgentDocsSourceUrl, getAgentMarkdownPath } from '@/lib/agent-docs/links'
import { createDocsRelativeLink } from '@/lib/docs/links'
import { createDocsNavigation } from '@/lib/docs/navigation'
import { icons } from '@/lib/source'

interface IProps {
  params: Promise<{
    slug?: string[]
    lang: string
  }>
}

export async function generateStaticParams() {
  return icons.generateParams()
}

export async function generateMetadata({ params }: IProps) {
  const { slug, lang } = await params
  const page = icons.getPage(slug, lang)
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
  const page = icons.getPage(slug, lang)
  if (!page) {
    notFound()
  }

  const { default: MDXContent, toc } = await page.data.load()
  const navigation = createDocsNavigation(icons.pageTree[lang], page.url)
  const IconsLink = createDocsRelativeLink(icons, page)

  return (
    <DocsShellPageLayout lang={lang} toc={[...toc]} tocFooter={<SponsorCard />}>
      <AgentDocsLinks collection="icons" lang={lang} pageUrl={page.url} />
      <DocsArticle
        description={page.data.description}
        githubUrl={getAgentDocsSourceUrl('icons', page.path)}
        lang={lang}
        markdownUrl={getAgentMarkdownPath(lang, page.url)}
        navigation={navigation}
        title={page.data.title}
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
              a: IconsLink,
            })}
          />
        </div>
      </DocsArticle>
    </DocsShellPageLayout>
  )
}
