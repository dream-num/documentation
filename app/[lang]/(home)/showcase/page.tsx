import Link from 'next/link'
import { Header } from '@/components/header'
import { customTranslations } from '@/lib/i18n'
import { showcase } from './data'

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
    <main
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

      <section>
        {items.map(item => (
          <Link key={item.url} href={item.url} className="mb-4 block">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p
              className={`
                text-neutral-600
                dark:text-neutral-400
              `}
            >
              {item.description}
            </p>
            <div className="mt-2">
              {item.tags.map(tag => (
                <span
                  key={tag}
                  className="mr-2 mb-1 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
