import { Suspense } from 'react'

import { ShowcaseContent } from '@/components/showcase/showcase-content'
import { ShowcaseHero } from '@/components/showcase/showcase-hero'
import { localizePath } from '@/lib/i18n'
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
  title: 'Univer Showcase',
  description: 'Explore the Univer showcase',
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
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const { metadata } = (await showcase[key]).default
    const type = key.split('/')[0] as 'sheets' | 'docs' | 'slides'

    if (type === 'sheets') sheetsCount++
    else if (type === 'docs') docsCount++
    else if (type === 'slides') slidesCount++

    items.push({
      title: metadata.title[lang],
      description: metadata.description[lang],
      tags: metadata.tags[lang],
      url: localizePath(`/showcase/${key}`, lang),
      type,
      index: i,
    })
  }

  return (
    <div
      className={`
        container mx-auto px-4 py-8
        max-sm:px-0
        md:py-12
      `}
    >
      <ShowcaseHero
        lang={lang}
        sheetsCount={sheetsCount}
        docsCount={docsCount}
        slidesCount={slidesCount}
      />

      <Suspense fallback={null}>
        <ShowcaseContent
          items={items}
          lang={lang}
          sheetsCount={sheetsCount}
          docsCount={docsCount}
          slidesCount={slidesCount}
        />
      </Suspense>
    </div>
  )
}
