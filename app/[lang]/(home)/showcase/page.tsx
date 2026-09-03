import { Footer } from '@/components/footer'
import { ShowcaseContent } from '@/components/showcase/showcase-content'
import { ShowcaseHero } from '@/components/showcase/showcase-hero'
import { showcase } from '@/showcase/data'

interface IProps {
  params: Promise<{
    lang: string
  }>
  searchParams: Promise<{
    filter?: string
    view?: string
    q?: string
  }>
}

export const metadata = {
  title: 'Univer SDK Showcase',
  description: 'Explore the Univer SDK showcase',
}

export default async function Page({ params }: IProps) {
  const { lang } = await params

  const items: Array<{
    title: string
    description: string
    tags: string[]
    url: string
    type: 'sheets' | 'docs' | 'slides'
    index: number
  }> = []

  let sheetsCount = 0
  let docsCount = 0
  let slidesCount = 0

  const keys = Object.keys(showcase)
  const entries = await Promise.all(
    keys.map(async (key) => ({
      key,
      itemMetadata: (await showcase[key]).default.metadata,
    })),
  )

  for (let i = 0; i < entries.length; i++) {
    const { key, itemMetadata } = entries[i]
    const type = key.split('/')[0] as 'sheets' | 'docs' | 'slides'

    if (type === 'sheets') sheetsCount++
    else if (type === 'docs') docsCount++
    else if (type === 'slides') slidesCount++

    items.push({
      title: itemMetadata.title[lang],
      description: itemMetadata.description[lang],
      tags: itemMetadata.tags[lang],
      url: `/showcase/${key}`,
      type,
      index: i,
    })
  }

  return (
    <>
      <div className={`container mx-auto px-4 py-8 max-sm:px-0 md:py-12`}>
        <ShowcaseHero lang={lang} sheetsCount={sheetsCount} docsCount={docsCount} slidesCount={slidesCount} />

        <ShowcaseContent
          items={items}
          lang={lang}
          sheetsCount={sheetsCount}
          docsCount={docsCount}
          slidesCount={slidesCount}
        />
      </div>
      <Footer />
    </>
  )
}
