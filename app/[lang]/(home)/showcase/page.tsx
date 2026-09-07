import { Footer } from '@/components/footer'
import { ShowcaseContent } from '@/components/showcase/showcase-content'
import { ShowcaseHero } from '@/components/showcase/showcase-hero'
import { createCatalogItem } from '@/showcase/catalog'
import { categoriesFor, SECTION_IDS, INTEGRATION_PRODUCT_IDS, type SectionId } from '@/showcase/directory'
import { showcaseNavigation } from '@/showcase/navigation'

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

  const counts = Object.fromEntries(SECTION_IDS.map((product) => [product, 0])) as Record<SectionId, number>

  const items = showcaseNavigation.map(({ slug, metadata }, index) => {
    const item = createCatalogItem(slug, metadata, lang, index)
    counts[item.section]++
    return item
  })
  items.sort(
    (a, b) =>
      SECTION_IDS.indexOf(a.section) - SECTION_IDS.indexOf(b.section) ||
      (a.integrationProduct && b.integrationProduct
        ? INTEGRATION_PRODUCT_IDS.indexOf(a.integrationProduct) - INTEGRATION_PRODUCT_IDS.indexOf(b.integrationProduct)
        : 0) ||
      categoriesFor(a.section).indexOf(a.category) - categoriesFor(b.section).indexOf(b.category) ||
      a.title.localeCompare(b.title, lang),
  )

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
