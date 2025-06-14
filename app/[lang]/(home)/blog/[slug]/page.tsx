import { InlineTOC } from 'fumadocs-ui/components/inline-toc'
import { createRelativeLink } from 'fumadocs-ui/mdx'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { blog } from '@/lib/source'
import { getMDXComponents } from '@/mdx-components'

interface IProps {
  params: Promise<{
    slug: string
    lang: string
  }>
}

export function generateStaticParams(): { slug: string }[] {
  return blog.generateParams().map(page => ({
    slug: page.slug[0],
  }))
}

export async function generateMetadata({ params }: IProps) {
  const { slug, lang } = await params
  const page = blog.getPage([slug], lang)
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
  const page = blog.getPage([slug], lang)
  if (!page) {
    notFound()
  }

  const MDXContent = page.data.body

  // console.log(page.data.toc)
  // console.log(page.data.full)
  // console.log(page.data.title)
  // console.log(page.data.description)

  return (
    <main>
      <header>
        <h1 className="mb-2 text-3xl font-bold text-white">
          {page.data.title}
        </h1>
        <p className="mb-4 text-white/80">{page.data.description}</p>
        <Link
          href="/blog"
        >
          Back
        </Link>
      </header>

      <div>
        <article>
          <InlineTOC items={page.data.toc} />
          <MDXContent
            components={getMDXComponents({
              // this allows you to link to other pages with relative file paths
              a: createRelativeLink(blog, page),
            })}
          />
        </article>

        <aside>
          <p className="font-medium">{page.data.author}</p>
          <time className="font-medium">{page.data.date.toString()}</time>
        </aside>
      </div>
    </main>
  )
}
