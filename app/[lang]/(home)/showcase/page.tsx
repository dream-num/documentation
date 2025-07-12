import Link from 'next/link'
import { CardComment } from '@/components/animata/card-comment'
import { Header } from '@/components/header'
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
          <Link key={item.url} href={item.url}>
            <CardComment
              title={item.title}
              tags={item.tags}
              description={item.description}
            />
          </Link>
        ))}
      </section>
    </div>
  )
}
