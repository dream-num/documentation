import { ArrowUpRightIcon, RssIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

import type { Locale } from '@/i18n/routing'
import { Footer } from '@/components/footer'
import { formatLocalDate } from '@/lib/dayjs'
import { getActiveBlogPages } from '@/lib/source'

interface IProps {
  params: Promise<{
    lang: string
  }>
}

export async function generateMetadata({ params }: IProps) {
  const { lang } = await params
  const t = await getTranslations({ locale: lang as Locale })

  return {
    title: t('blog.title'),
    description: t('blog.slogan'),
  }
}

function formatDateTime(date: Date | string): string {
  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) {
    return String(date)
  }

  return parsedDate.toISOString().slice(0, 10)
}

export default async function Page({ params }: IProps) {
  const { lang } = await params
  const t = await getTranslations({ locale: lang as Locale })

  const posts = getActiveBlogPages(lang).toSorted((a, b) => {
    return new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  })
  const postsByYear = new Map<number, typeof posts>()

  for (const post of posts) {
    const year = new Date(post.data.date).getUTCFullYear()
    const postsInYear = postsByYear.get(year)

    if (postsInYear) {
      postsInYear.push(post)
    } else {
      postsByYear.set(year, [post])
    }
  }

  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-4 pt-8 pb-16 md:pt-10 md:pb-20">
        <header className="border-foreground flex items-end justify-between gap-6 border-b-2 pb-4">
          <h1 className="text-2xl leading-none font-semibold tracking-tight md:text-3xl">{t('blog.title')}</h1>

          <Link
            className="group hover:border-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-11 items-center gap-2 border-b border-transparent text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
            href="/blog/rss.xml"
            target="_blank"
            rel="nofollow noreferrer"
          >
            <RssIcon aria-hidden className="size-4" />
            <span>{t('blog.rss')}</span>
          </Link>
        </header>

        <div aria-label={t('blog.recent')} className="mt-8 space-y-10 md:mt-10 md:space-y-12">
          {[...postsByYear].map(([year, postsInYear]) => {
            const yearHeadingId = `blog-year-${year}`

            return (
              <section
                key={year}
                aria-labelledby={yearHeadingId}
                className="grid gap-3 md:grid-cols-[6rem_minmax(0,1fr)] md:gap-8"
              >
                <h2 id={yearHeadingId} className="text-base font-semibold tabular-nums">
                  <bdo dir="ltr">{year}</bdo>
                </h2>

                <ol className="divide-y border-y">
                  {postsInYear.map((post) => (
                    <li key={post.url}>
                      <Link
                        className="group focus-visible:ring-ring relative grid min-h-12 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2 py-3 pr-1 pl-3 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-center sm:gap-x-6"
                        href={post.url}
                      >
                        <span
                          aria-hidden
                          className="bg-foreground absolute inset-y-3 left-0 w-0.5 origin-center scale-y-0 transition-transform group-hover:scale-y-100 motion-reduce:transition-none"
                        />

                        <time
                          className="text-muted-foreground text-sm tabular-nums"
                          dateTime={formatDateTime(post.data.date)}
                        >
                          <bdo dir="ltr">{formatLocalDate(post.data.date, lang)}</bdo>
                        </time>

                        <h3 className="col-span-2 row-start-2 text-base leading-snug font-medium tracking-tight text-pretty wrap-break-word sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:text-lg">
                          {post.data.title}
                        </h3>

                        <span className="text-muted-foreground col-start-2 row-start-1 inline-flex max-w-60 items-center justify-end gap-2 text-right text-sm sm:col-start-3">
                          <span className="wrap-break-word">{post.data.author}</span>
                          <ArrowUpRightIcon
                            aria-hidden
                            className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                          />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            )
          })}
        </div>
      </main>
      <Footer />
    </>
  )
}
