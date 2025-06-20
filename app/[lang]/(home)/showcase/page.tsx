import Link from 'next/link'
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { customTranslations } from '@/lib/i18n'
import { showcase } from '@/showcase/data'

interface IProps {
  params: Promise<{
    lang: string
  }>
}

export const metadata = {
  title: 'Univer Showcase',
  description: 'Explore the Univer showcase',
}

export default async function Page({ params }: IProps) {
  const { lang } = await params

  const items = []
  const keys = Object.keys(showcase)
  for (const key of keys) {
    const { metadata } = (await showcase[key]).default

    items.push({
      title: metadata.title[lang],
      description: metadata.description[lang],
      tags: metadata.tags[lang],
      url: `/${lang}/showcase/${key}`,
    })
  }

  return (
    <div
      className={`
        container
        max-sm:px-0
        md:py-12
      `}
    >
      <Header
        title={customTranslations[lang]['showcase.title']}
        slogan={customTranslations[lang]['showcase.slogan']}
      />

      <section
        className={`
          mt-4 grid grid-cols-1 gap-4
          md:grid-cols-2
          lg:grid-cols-3
        `}
      >
        {items.map(item => (
          <Link
            key={item.url}
            className="group relative overflow-hidden rounded-2xl border"
            href={item.url}
          >
            <div
              className={`
                absolute inset-0 bg-gradient-to-br from-[#64bcff] to-50%
                opacity-0 transition-all duration-500 ease-in-out
                group-hover:opacity-100
                hover:to-neutral-50
                dark:bg-gradient-to-t dark:from-[#242424] dark:to-[#020202]
                dark:hover:from-[#182135] dark:hover:to-[#080808]
              `}
            />

            <div className="relative">
              <div className="px-6 py-5">
                <div className="flex flex-wrap gap-2">
                  {item.tags.map(tag => (
                    <Badge
                      key={tag}
                      className={`
                        rounded-full transition-all duration-500 ease-in-out
                      `}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <span
                  className={`
                    mb-1 inline-block pt-2 text-lg font-semibold
                    text-neutral-800 transition-all duration-500 ease-in-out
                    dark:text-neutral-100
                  `}
                >
                  {item.title}
                </span>
                <p
                  className={`
                    text-sm text-neutral-600 transition-all duration-500
                    ease-in-out
                    dark:text-neutral-400
                  `}
                >
                  {item.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}
