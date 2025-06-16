import { createRelativeLink } from 'fumadocs-ui/mdx'
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page'
import { notFound } from 'next/navigation'
import { ArticleActions } from '@/components/article-actions'
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
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <ArticleActions path={`/guides/${slug?.join('/')}`} />
      <DocsBody>
        <MDXContent
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(guides, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  )
}
