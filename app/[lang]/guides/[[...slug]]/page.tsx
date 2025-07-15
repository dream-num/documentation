import process from 'node:process'
import { SiGithub } from '@icons-pack/react-simple-icons'
import { createRelativeLink } from 'fumadocs-ui/mdx'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PostHog } from 'posthog-node'
import { Rate } from '@/components/rate'
import { Button } from '@/components/ui/button'
import { customTranslations } from '@/lib/i18n'
import { guides } from '@/lib/source'
import { getMDXComponents } from '@/mdx-components'

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

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        style: 'clerk',
      }}
    >
      <header className="border-b border-b-neutral-200 pb-6">
        <DocsTitle className="mb-6">{page.data.title}</DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>

        {/* Actions */}
        <section>
          <Button size="sm" asChild>
            <Link className="text-xs" href={`https://github.com/dream-num/univer-documentation/tree/dev/content/guides/${page.path}`}>
              <SiGithub />
              {customTranslations[lang]['docs.header.edit-on-github']}
            </Link>
          </Button>
        </section>
      </header>

      <DocsBody>
        <MDXContent
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(guides, page),
          })}
        />
      </DocsBody>

      <Rate
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
      />
    </DocsPage>
  )
}
