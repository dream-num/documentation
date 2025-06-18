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
    <main
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
              text-sm text-neutral-500
              hover:text-neutral-700
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
          grid grid-cols-1 bg-neutral-50
          md:grid-cols-3
          lg:grid-cols-4
          dark:bg-neutral-800
        `}
      >
        {posts.map(post => (
          <Link
            key={post.url}
            className="group relative flex flex-col p-4 transition-colors"
            href={post.url}
          >
            <div
              className={`
                absolute top-0 left-0 h-full w-full bg-linear-[145deg,#64bcff_-30%,rgba(0,0,0,0)_70%] opacity-0
                transition-all duration-300
                group-hover:opacity-100
                dark:bg-linear-[145deg,#40B9FF_-30%,rgba(0,0,0,0)_70%]
              `}
            />
            <div
              className={`
                relative text-neutral-800
                dark:text-neutral-100
              `}
            >
              <h3 className="font-medium">{post.data.title}</h3>
              <p>{post.data.description}</p>
            </div>

            <div
              className={`
                relative mt-auto flex flex-col pt-4 text-xs text-neutral-600
                dark:text-neutral-400
              `}
            >
              <span>{post.data.author}</span>
              <time dateTime={dayjs(post.data.date).format('YYYY-MM-DD')}>
                {formatLocalDate(post.data.date, lang)}
              </time>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
