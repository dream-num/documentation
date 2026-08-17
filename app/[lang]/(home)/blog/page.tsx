import { ArrowRightIcon, RssIcon } from 'lucide-react'
import Link from 'next/link'

import { clsx } from '@/lib/clsx'
import { customTranslations, localizePath } from '@/lib/i18n'
import { getActiveBlogPages } from '@/lib/source'

interface IProps {
  params: Promise<{
    lang: string
  }>
}

export const metadata = {
  title: 'Blog',
  description: 'Blog posts about Univer',
}

const localeMap: Record<string, string> = {
  en: 'en-US',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  ja: 'ja-JP',
}

const localeCopy: Record<string, {
  featured: string
  recent: string
  rss: string
}> = {
  en: {
    featured: 'Featured',
    recent: 'Recent posts',
    rss: 'RSS Feed',
  },
  'zh-CN': {
    featured: '焦点文章',
    recent: '最新文章',
    rss: 'RSS 订阅',
  },
  'zh-TW': {
    featured: '焦點文章',
    recent: '最新文章',
    rss: 'RSS 訂閱',
  },
  ja: {
    featured: '注目の記事',
    recent: '最新記事',
    rss: 'RSS フィード',
  },
}

function formatDisplayDate(date: Date | string, lang: string): string {
  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) {
    return String(date)
  }

  return new Intl.DateTimeFormat(localeMap[lang] ?? 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parsedDate)
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
  const labels = localeCopy[lang] ?? localeCopy.en

  const posts = [...getActiveBlogPages(lang)].sort((a, b) => {
    return new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  })
  const [featuredPost, ...restPosts] = posts
  const secondaryPosts = restPosts.slice(0, 2)
  const archivePosts = restPosts.slice(2)

  if (!featuredPost) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">{customTranslations[lang]['blog.title']}</h1>
      </div>
    )
  }

  return (
    <main
      className="
        container mx-auto px-4 py-10
        md:py-12
      "
    >
      <header
        className={`
          flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm
          md:flex-row md:items-start md:justify-between md:p-8
        `}
      >
        <div className="space-y-2">
          <h1
            className={`
              text-3xl font-semibold tracking-tight text-balance
              md:text-4xl
            `}
          >
            {customTranslations[lang]['blog.title']}
          </h1>
          <p
            className={`
              max-w-2xl text-sm text-muted-foreground
              md:text-base
            `}
          >
            {customTranslations[lang]['blog.slogan']}
          </p>
        </div>
        <Link
          className={`
            inline-flex w-fit items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium
            transition-colors
            hover:bg-accent
            focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
          `}
          href={localizePath('/blog/rss.xml', lang)}
          target="_blank"
          rel="nofollow noreferrer"
        >
          <RssIcon aria-hidden className="size-4" />
          <span>{labels.rss}</span>
        </Link>
      </header>

      <section
        aria-labelledby="featured-post"
        className={`
          mt-8 grid gap-4
          lg:grid-cols-3 lg:items-stretch
        `}
      >
        <h2 id="featured-post" className="sr-only">
          {labels.featured}
        </h2>

        <Link
          className={`
            group flex min-h-[150px] flex-col rounded-2xl border bg-card p-4 shadow-sm transition-colors
            hover:bg-accent/20
            focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
          `}
          href={featuredPost.url}
        >
          <time className="text-xs text-muted-foreground" dateTime={formatDateTime(featuredPost.data.date)}>
            {formatDisplayDate(featuredPost.data.date, lang)}
          </time>
          <h3 className="mt-1.5 line-clamp-2 text-base font-medium tracking-tight text-balance">
            {featuredPost.data.title}
          </h3>
          <div
            className="mt-auto inline-flex items-center justify-between pt-3 text-xs text-muted-foreground"
          >
            <span>{featuredPost.data.author}</span>
            <ArrowRightIcon
              aria-hidden
              className="
                size-4 transition-transform
                group-hover:translate-x-0.5
              "
            />
          </div>
        </Link>

        <div
          className={`
            grid gap-4
            md:grid-cols-2
            lg:col-span-2
          `}
        >
          {secondaryPosts.map(post => (
            <Link
              key={post.url}
              className={`
                group flex min-h-[150px] flex-col rounded-2xl border bg-card p-4 shadow-sm transition-colors
                hover:bg-accent/20
                focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
              `}
              href={post.url}
            >
              <time className="text-xs text-muted-foreground" dateTime={formatDateTime(post.data.date)}>
                {formatDisplayDate(post.data.date, lang)}
              </time>
              <h3 className="mt-1.5 line-clamp-2 text-base font-medium tracking-tight text-balance">
                {post.data.title}
              </h3>
              <div
                className="mt-auto inline-flex items-center justify-between pt-3 text-xs text-muted-foreground"
              >
                <span>{post.data.author}</span>
                <ArrowRightIcon
                  aria-hidden
                  className="
                    size-4 transition-transform
                    group-hover:translate-x-0.5
                  "
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="recent-posts" className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="recent-posts" className="text-xl font-semibold tracking-tight">
            {labels.recent}
          </h2>
          <span className="text-xs text-muted-foreground">{posts.length}</span>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          {archivePosts.map((post, index) => (
            <Link
              key={post.url}
              className={clsx(`
                group grid gap-2 p-4 transition-colors
                hover:bg-accent/20
                focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset
                md:grid-cols-[140px_1fr_auto] md:items-center
              `, index !== archivePosts.length - 1 && 'border-b')}
              href={post.url}
            >
              <time className="text-sm text-muted-foreground" dateTime={formatDateTime(post.data.date)}>
                {formatDisplayDate(post.data.date, lang)}
              </time>
              <h3 className="text-base font-medium tracking-tight text-balance">
                {post.data.title}
              </h3>
              <span
                className={`
                  inline-flex items-center gap-1 text-sm text-muted-foreground
                  md:justify-end
                `}
              >
                {post.data.author}
                <ArrowRightIcon
                  aria-hidden
                  className="
                    size-4 transition-transform
                    group-hover:translate-x-0.5
                  "
                />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
