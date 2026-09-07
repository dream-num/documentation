import { notFound } from 'next/navigation'

import { Footer } from '@/components/footer'
import { PlaygroundFrame } from '@/components/playground/playground-frame'
import { RelatedShowcases } from '@/components/showcase/related-showcases'
import { ShowcaseDetailHeader } from '@/components/showcase/showcase-detail-header'
import { ShowcaseSidebar } from '@/components/showcase/showcase-sidebar'
import { createCatalogItem } from '@/showcase/catalog'
import { showcase } from '@/showcase/data'
import { showcaseNavigation } from '@/showcase/navigation'
import { localize } from '@/showcase/types'

interface IProps {
  params: Promise<{
    slug: string[]
    lang: string
  }>
}

export function generateStaticParams(): { slug: string[] }[] {
  return showcaseNavigation.map(({ slug }) => ({
    slug: slug.split('/'),
  }))
}

export async function generateMetadata({ params }: IProps) {
  const { slug, lang } = await params
  const pathname = slug.join('/')

  const entry = showcaseNavigation.find((item) => item.slug === pathname)
  if (!entry) {
    return { title: 'Not Found' }
  }

  const { metadata } = entry

  return {
    title: localize(metadata.title, lang, pathname),
    description: localize(metadata.description, lang, ''),
  }
}

export default async function Page({ params }: IProps) {
  const { slug, lang } = await params
  const pathname = slug.join('/')

  const entry = showcaseNavigation.find((item) => item.slug === pathname)
  if (!entry) {
    notFound()
  }

  const { metadata } = entry
  const catalogItems = showcaseNavigation.map(({ slug, metadata }, index) =>
    createCatalogItem(slug, metadata, lang, index),
  )
  const currentItem = createCatalogItem(pathname, metadata, lang, -1)
  const relatedItems = catalogItems.filter((item) => item.product === currentItem.product && item.slug !== pathname)

  return (
    <div className={`container mx-auto flex min-h-[calc(100vh-108px)] flex-1 px-4 pt-12 max-sm:px-0 lg:px-0`}>
      <ShowcaseSidebar items={catalogItems} pathname={pathname} lang={lang} />

      <div className="w-full px-2 lg:pr-0 lg:pl-74">
        <ShowcaseDetailHeader
          lang={lang}
          title={currentItem.title}
          description={currentItem.description}
          tags={currentItem.tags}
          product={currentItem.product}
          productName={currentItem.productName}
        />

        <section className="mt-6">
          {showcase[pathname] ? (
            <PlaygroundFrame slug={pathname} lang={lang} />
          ) : (
            <p role="status" className="rounded-lg border p-6 text-sm">
              {lang === 'zh-CN'
                ? '此案例已加入目录，但未纳入本次限定编译的本地预览。启动预览时选择此案例即可运行。'
                : 'This case is in the full catalog but is not compiled in this scoped local preview. Select it when starting the preview to run it.'}
              <code className="mt-3 block">pnpm dev:showcase {pathname}</code>
            </p>
          )}
        </section>

        <RelatedShowcases lang={lang} items={relatedItems} currentSlug={pathname} />

        <Footer className="mb-8 text-center" variant="content" />
      </div>
    </div>
  )
}
