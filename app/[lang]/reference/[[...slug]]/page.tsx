import process from 'node:process'

import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { PostHog } from 'posthog-node'

import { AgentDocsLinks } from '@/components/agent-docs-links'
import { DocsArticle } from '@/components/docs-shell/article'
import { DocsShellPageLayout } from '@/components/docs-shell/layout'
import { Callout } from '@/components/mdx/callout'
import { getGuidesMDXComponents } from '@/components/mdx/components'
import { ReferenceMemberIndex } from '@/components/reference/member-index'
import { SponsorCard } from '@/components/sponsor-card'
import { normalizeLocale } from '@/i18n/locale-config'
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
  const page = reference.getPage(slug, lang)
  if (!page) {
    notFound()
  }

  const t = await getTranslations({ locale: normalizeLocale(lang), namespace: 'docs' })
  const { default: MDXContent, toc, structuredData } = await page.data.load()
  const navigation = createDocsNavigation(reference.pageTree[lang], page.url)
  const ReferenceLink = createDocsRelativeLink(reference, page)
  const members = structuredData.headings
    .map((item) => ({ title: item.content.replaceAll('`', ''), url: `#${item.id}` }))
    .filter((item) => /^(?:F\w+|Event|Enum)\./.test(item.title))
  const isFacade = slug?.[0] === 'facade'
  const pageToc = isFacade && toc.length > 25 ? toc.filter((item) => item.depth === 2) : toc

  return (
    <DocsShellPageLayout lang={lang} toc={[...pageToc]} tocFooter={<SponsorCard />}>
      <AgentDocsLinks collection="reference" lang={lang} pageUrl={page.url} />
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
        <div data-docs-body className="[&_td:first-child_code]:break-normal [&_td:first-child_code]:whitespace-nowrap">
          {lang !== 'en-US' && !page.data.info.path.endsWith(`.${lang}.mdx`) && (
            <Callout>{t('reference-language-notice')}</Callout>
          )}
          {isFacade && members.length > 0 && <ReferenceMemberIndex key={page.url} items={members} />}
          <MDXContent
            components={getGuidesMDXComponents({
              a: ReferenceLink,
            })}
          />
        </div>
      </DocsArticle>
    </DocsShellPageLayout>
  )
}
