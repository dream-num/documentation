import dayjs from 'dayjs'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import type { Locale } from '@/i18n/routing'
import { DocsToc } from '@/components/docs-shell/toc'
import { Footer } from '@/components/footer'
import { getGuidesMDXComponents } from '@/components/mdx'
import { Button } from '@/components/ui/button'
import { formatLocalDate } from '@/lib/dayjs'
import { createDocsRelativeLink } from '@/lib/docs/links'
import { blog, getActiveBlogPage, getActiveBlogParams } from '@/lib/source'

interface IProps {
  params: Promise<{
    slug: string
    lang: string
  }>
}

export function generateStaticParams(): { slug: string }[] {
  return getActiveBlogParams().map((page) => ({
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
  const t = await getTranslations({ locale: lang as Locale })
  const page = getActiveBlogPage([slug], lang)
  if (!page) {
    notFound()
  }

  const { default: MDXContent, toc } = await page.data.load()
  const BlogLink = createDocsRelativeLink(blog, page)

  return (
    <>
      <div className="container mx-auto px-4 py-12">
        <header>
          <h1 className="mb-2 text-3xl font-semibold text-neutral-800 dark:text-neutral-50">{page.data.title}</h1>
          <p className="text-muted-foreground mb-4">{page.data.description}</p>
        </header>

        <div className="grid gap-8 md:grid-cols-[1fr_auto]">
          <article data-docs-body className="order-last md:order-0">
            <MDXContent
              components={getGuidesMDXComponents({
                a: BlogLink,
              })}
            />
          </article>

          <aside className="flex flex-col gap-4 md:sticky md:top-16 md:max-h-[calc(100dvh-5rem)] md:w-2xs md:self-start md:overflow-y-auto md:overscroll-contain md:pr-2">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('blog.author')}</p>
              <p className="font-medium">{page.data.author}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('blog.date')}</p>
              <time className="font-medium" dateTime={dayjs(page.data.date).format('YYYY-MM-DD')}>
                <bdo dir="ltr">{formatLocalDate(page.data.date, lang)}</bdo>
              </time>
            </div>
            {toc.length > 0 ? <DocsToc compact items={[...toc]} lang={lang} /> : null}
            <Button className="w-full" render={<Link href="/blog" />}>
              {t('blog.back')}
            </Button>
          </aside>
        </div>
      </div>
      <Footer />
    </>
  )
}
