import { SiGithub } from '@icons-pack/react-simple-icons'
import { createRelativeLink } from 'fumadocs-ui/mdx'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SponsorCard } from '@/components/sponsor-card'
import { Button } from '@/components/ui/button'
import { customTranslations } from '@/lib/i18n'
import { icons } from '@/lib/source'
import { getMDXComponents } from '@/mdx-components'

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

  const MDXContent = page.data.body

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        style: 'clerk',
        footer: <SponsorCard />,
      }}
    >
      <header className="border-b border-b-neutral-200 pb-6">
        <DocsTitle className="mb-6">{page.data.title}</DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>

        <section>
          <Button size="sm" asChild>
            <Link className="text-xs" href={`https://github.com/dream-num/univer-documentation/tree/dev/content/icons/${page.path}`}>
              <SiGithub />
              {customTranslations[lang]['docs.header.edit-on-github']}
            </Link>
          </Button>
        </section>
      </header>

      <DocsBody className="w-full">
        <MDXContent
          components={getMDXComponents({
            a: createRelativeLink(icons, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  )
}
