import { Footer } from '@/components/footer'
import { ShowcaseContent } from '@/components/showcase/showcase-content'
import { ShowcaseHero } from '@/components/showcase/showcase-hero'
import { createCatalogItem } from '@/showcase/catalog'
import { showcaseNavigation } from '@/showcase/navigation'
import { PRODUCT_IDS, type ProductId } from '@/showcase/types'

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

  const counts = Object.fromEntries(PRODUCT_IDS.map((product) => [product, 0])) as Record<ProductId, number>

  const items = showcaseNavigation.map(({ slug, metadata }, index) => {
    const item = createCatalogItem(slug, metadata, lang, index)
    counts[item.product]++
    return item
  })

  return (
    <>
      <div className={`container mx-auto px-4 py-8 max-sm:px-0 md:py-12`}>
        <ShowcaseHero lang={lang} counts={counts} />

        <ShowcaseContent items={items} lang={lang} counts={counts} />
      </div>
      <Footer />
    </>
  )
}
