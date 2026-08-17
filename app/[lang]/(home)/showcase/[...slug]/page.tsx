import { notFound } from 'next/navigation'

import { PlaygroundFrame } from '@/components/playground/playground-frame'
import { RelatedShowcases } from '@/components/showcase/related-showcases'
import { ShowcaseDetailHeader } from '@/components/showcase/showcase-detail-header'
import { ShowcaseSidebar } from '@/components/showcase/showcase-sidebar'
import { showcase } from '@/showcase/data'

interface IProps {
  params: Promise<{
    slug: string[]
    lang: string
  }>
}

export function generateStaticParams(): { slug: string[] }[] {
  return Object.keys(showcase).map(key => ({
    slug: key.split('/'),
  }))
}

export async function generateMetadata({ params }: IProps) {
  const { slug, lang } = await params
  const pathname = slug.join('/')

  const currentShowCasePromise = showcase[pathname]
  if (!currentShowCasePromise) {
    return { title: 'Not Found' }
  }

  const { metadata } = (await currentShowCasePromise).default

  return {
    title: metadata.title[lang],
    description: metadata.description[lang],
  }
}

export default async function Page({ params }: IProps) {
  const { slug, lang } = await params
  const pathname = slug.join('/')

  const currentShowCasePromise = showcase[pathname]
  if (!currentShowCasePromise) {
    notFound()
  }

  const { metadata } = (await currentShowCasePromise).default

  const type = pathname.split('/')[0] as 'sheets' | 'docs' | 'slides'

  const nav: Array<{
    type: string
    typeKey: string
    title: string
    slug: string
  }> = []

  const relatedItems: Array<{
    title: string
    description: string
    slug: string
    type: 'sheets' | 'docs' | 'slides'
  }> = []

  for (const key of Object.keys(showcase)) {
    const item = showcase[key as keyof typeof showcase]
    const { metadata } = (await item).default
    const itemType = key.split('/')[0] as 'sheets' | 'docs' | 'slides'
    const displayType = `Univer ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`

    nav.push({
      type: displayType,
      typeKey: itemType,
      title: metadata.title[lang],
      slug: key,
    })

    if (itemType === type && key !== pathname) {
      relatedItems.push({
        title: metadata.title[lang],
        description: metadata.description[lang],
        slug: key,
        type: itemType,
      })
    }
  }

  const groupedNav = nav.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = []
    }
    acc[item.type].push(item)
    return acc
  }, {} as Record<string, typeof nav>)

  return (
    <div
      className={`
        container mx-auto flex h-[calc(100vh-108px)] flex-1 px-4 pt-12
        max-sm:px-0
        lg:px-0
      `}
    >
      <ShowcaseSidebar groupedNav={groupedNav} pathname={pathname} lang={lang} />

      <div
        className="
          w-full px-2
          lg:pr-0 lg:pl-74
        "
      >
        <ShowcaseDetailHeader
          lang={lang}
          title={metadata.title[lang]}
          description={metadata.description[lang]}
          tags={metadata.tags[lang]}
          type={type}
        />

        <section className="mt-6">
          <PlaygroundFrame slug={pathname} lang={lang} />
        </section>

        <RelatedShowcases
          lang={lang}
          items={relatedItems}
          currentSlug={pathname}
        />

        {/* Bottom spacing */}
        <div className="h-16" />
      </div>
    </div>
  )
}
