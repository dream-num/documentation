import type { ComponentProps } from 'react'
import process from 'node:process'
import { notFound } from 'next/navigation'
import { PostHog } from 'posthog-node'
import { GuidesArticle } from '@/components/guides/article'
import { GuidesLayout } from '@/components/guides/layout'
import { getGuidesMDXComponents } from '@/components/mdx-docs'
import { SponsorCard } from '@/components/sponsor-card'
import { getGuidesEditUrl } from '@/lib/github'
import { createGuideNavigation } from '@/lib/guides/navigation'
import { guides } from '@/lib/source'

type GuidePage = NonNullable<ReturnType<typeof guides.getPage>>

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

function createGuideLink(page: GuidePage) {
  function GuideLink({
    href,
    ...props
  }: ComponentProps<'a'>) {
    return (
      <a
        href={typeof href === 'string' ? guides.resolveHref(href, page) : href}
        {...props}
      />
    )
  }

  return GuideLink
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
  const GuideLink = createGuideLink(page)

  return (
    <GuidesLayout
      lang={lang}
      navigation={navigation}
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

          const posthog = new PostHog(
            process.env.NEXT_POSTHOG_APIKEY,
            { host: 'https://us.i.posthog.com' },
          )

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
  )
}
