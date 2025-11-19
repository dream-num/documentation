import { RssIcon } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { dayjs, formatLocalDate } from '@/lib/dayjs'
import { customTranslations } from '@/lib/i18n'
import { blog } from '@/lib/source'

interface IProps {
  params: Promise<{
    lang: string
  }>
}

export const metadata = {
  title: 'Blog',
  description: 'Blog posts about Univer',
}

export default async function Page({ params }: IProps) {
  const { lang } = await params

  const posts = [...blog.getPages(lang)].sort((a, b) => {
    return new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  })

  return (
    <div
      className={`
        container
        max-sm:px-0
        md:py-12
      `}
    >
      <Header
        title={customTranslations[lang]['blog.title']}
        slogan={customTranslations[lang]['blog.slogan']}
        actions={(
          <Link
            className={`
              text-sm text-amber-500 transition-all
              hover:text-amber-600
            `}
            href={`/${lang}/blog/rss.xml`}
            target="_blank"
            rel="nofollow noreferrer"
          >
            <RssIcon />
          </Link>
        )}
      />

      <section
        className={`
          mt-4 grid grid-cols-1 gap-6 px-4
          md:grid-cols-2
          lg:grid-cols-3
        `}
      >
        {posts.map(post => (
          <Link
            key={post.url}
            className={`
              group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4
              transition-all duration-300
              hover:-translate-y-1
              dark:border-neutral-800 dark:bg-neutral-950/50
            `}
            href={post.url}
          >
            <div className="mb-4 flex flex-col gap-2">
              <h3
                className={`
                  line-clamp-2 text-lg font-medium tracking-tight text-neutral-900
                  group-hover:text-blue-600
                  dark:text-neutral-100 dark:group-hover:text-blue-400
                `}
              >
                {post.data.title}
              </h3>
            </div>

            <div
              className={`
                mt-auto flex items-center justify-between border-t border-neutral-100 pt-4 text-xs text-neutral-500
                dark:border-neutral-800 dark:text-neutral-500
              `}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`
                    font-medium text-neutral-700
                    dark:text-neutral-300
                  `}
                >
                  {post.data.author}
                </span>
              </div>
              <time dateTime={dayjs(post.data.date).format('YYYY-MM-DD')}>
                {formatLocalDate(post.data.date, lang)}
              </time>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}
