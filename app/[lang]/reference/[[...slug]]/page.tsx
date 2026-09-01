import process from 'node:process'

import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { PostHog } from 'posthog-node'

import type { Locale } from '@/i18n/routing'
import { AgentDocsLinks } from '@/components/agent-docs-links'
import { DocsArticle } from '@/components/docs-shell/article'
import { DocsShellLayout } from '@/components/docs-shell/layout'
import { getGuidesMDXComponents } from '@/components/mdx'
import { SponsorCard } from '@/components/sponsor-card'
import { getAgentDocsSourceUrl, getAgentMarkdownPath } from '@/lib/agent-docs/links'
import { createDocsRelativeLink } from '@/lib/docs/links'
import { createDocsNavigation } from '@/lib/docs/navigation'
import { reference } from '@/lib/source'

interface IProps {
  params: Promise<{
    slug?: string[]
    lang: string
  }>
}

export async function generateStaticParams() {
  return reference.generateParams()
}

export async function generateMetadata({ params }: IProps) {
  const { slug, lang } = await params
  const page = reference.getPage(slug, lang)
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
  const t = await getTranslations({ locale: lang as Locale })
  const page = reference.getPage(slug, lang)
  if (!page) {
    notFound()
  }

  const { default: MDXContent, toc } = await page.data.load()
  const navigation = createDocsNavigation(reference.pageTree[lang], page.url)
  const ReferenceLink = createDocsRelativeLink(reference, page)

  return (
    <>
      <AgentDocsLinks collection="reference" lang={lang} pageUrl={page.url} />
      <DocsShellLayout
        lang={lang}
        navigation={navigation}
        pathname={page.url}
        searchScope="reference"
        title={t('navigation.reference')}
        toc={[...toc]}
        tocFooter={<SponsorCard />}
      >
        <DocsArticle
          description={page.data.description}
          githubUrl={getAgentDocsSourceUrl('reference', page.path)}
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
                a: ReferenceLink,
              })}
            />
          </div>
        </DocsArticle>
      </DocsShellLayout>
    </>
  )
}
