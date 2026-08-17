import dayjs from 'dayjs'
import { InlineTOC } from 'fumadocs-ui/components/inline-toc'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { clsx } from '@/lib/clsx'
import { formatLocalDate } from '@/lib/dayjs'
import { customTranslations, localizePath } from '@/lib/i18n'
import { blog, getActiveBlogPage, getActiveBlogParams } from '@/lib/source'
import { createLocalizedRelativeLink, getMDXComponents } from '@/mdx-components'

interface IProps {
  params: Promise<{
    slug: string
    lang: string
  }>
}

export function generateStaticParams(): { slug: string }[] {
  return getActiveBlogParams().map(page => ({
    slug: page.slug[0],
  }))
}

export async function generateMetadata({ params }: IProps) {
  const { slug, lang } = await params
  const page = getActiveBlogPage([slug], lang)
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
  const page = getActiveBlogPage([slug], lang)
  if (!page) {
    notFound()
  }

  const MDXContent = page.data.body

  return (
    <div className="container mx-auto px-4 py-12">
      <header>
        <h1
          className={`
            mb-2 text-3xl font-semibold text-neutral-800
            dark:text-neutral-50
          `}
        >
          {page.data.title}
        </h1>
        <p className="mb-4 text-white/80">{page.data.description}</p>
      </header>

      <div
        className={`
          grid gap-8
          md:grid-cols-[1fr_auto]
        `}
      >
        <article

          className={clsx('prose overflow-x-hidden', `
            order-last
            md:order-0
          `)}
        >
          <MDXContent
            components={getMDXComponents(lang, {
              // this allows you to link to other pages with relative file paths
              a: createLocalizedRelativeLink(blog, page, lang),
            })}
          />
        </article>

        <aside
          className={`
            flex flex-col gap-4
            md:w-2xs
          `}
        >
          <div>
            <p
              className={`
                text-sm text-neutral-600
                dark:text-neutral-400
              `}
            >
              {customTranslations[lang]['blog.author']}
            </p>
            <p className="font-medium">{page.data.author}</p>
          </div>
          <div>
            <p
              className={`
                text-sm text-neutral-600
                dark:text-neutral-400
              `}
            >
              {customTranslations[lang]['blog.date']}
            </p>
            <time className="font-medium" dateTime={dayjs(page.data.date).format('YYYY-MM-DD')}>
              {formatLocalDate(page.data.date, lang)}
            </time>
          </div>
          {page.data.toc.length >= 0 && <InlineTOC defaultOpen items={page.data.toc} />}
          <Button className="w-full" asChild>
            <Link href={localizePath('/blog', lang)}>
              {customTranslations[lang]['blog.back']}
            </Link>
          </Button>
        </aside>
      </div>
    </div>
  )
}
