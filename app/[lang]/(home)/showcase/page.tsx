import { BookTextIcon, PresentationIcon, SheetIcon } from 'lucide-react'
import { ShowcaseCard } from '@/components/showcase/showcase-card'
import { ShowcaseHero } from '@/components/showcase/showcase-hero'
import { clsx } from '@/lib/clsx'
import { customTranslations } from '@/lib/i18n'
import { showcase } from '@/showcase/data'

interface IProps {
  params: Promise<{
    lang: string
  }>
  searchParams: Promise<{
    filter?: string
  }>
}

export const metadata = {
  title: 'Univer Showcase',
  description: 'Explore the Univer showcase',
}

export default async function Page({ params, searchParams }: IProps) {
  const { lang } = await params
  const { filter } = await searchParams

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
      url: `/${lang}/showcase/${key}`,
      type,
      index: i,
    })
  }

  const activeFilter = filter || 'all'
  const filteredItems = activeFilter === 'all'
    ? items
    : items.filter(item => item.type === activeFilter)

  const t = customTranslations[lang]

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

      {/* Filter */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex h-10 items-center rounded-lg bg-muted p-[3px] text-muted-foreground">
          <a
            href={`/${lang}/showcase?filter=all`}
            className={clsx(`
              inline-flex h-[calc(100%-1px)] items-center justify-center gap-1.5 rounded-md border border-transparent
              px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
              sm:px-4
            `, activeFilter === 'all'
              ? `
                bg-background text-foreground shadow-sm
                dark:border-input dark:bg-input/30
              `
              : 'hover:text-foreground')}
          >
            <span>{t['showcase.filter.all']}</span>
            <span
              className="
                rounded-full bg-neutral-200 px-1.5 py-0 text-[10px] font-medium text-neutral-600
                dark:bg-neutral-700 dark:text-neutral-300
              "
            >
              {items.length}
            </span>
          </a>
          <a
            href={`/${lang}/showcase?filter=sheets`}
            className={clsx(`
              inline-flex h-[calc(100%-1px)] items-center justify-center gap-1.5 rounded-md border border-transparent
              px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
              sm:px-4
            `, activeFilter === 'sheets'
              ? `
                bg-background text-foreground shadow-sm
                dark:border-input dark:bg-input/30
              `
              : 'hover:text-foreground')}
          >
            <SheetIcon className="size-3.5" />
            <span
              className="
                hidden
                sm:inline
              "
            >
              {t['showcase.filter.sheets']}
            </span>
            <span
              className="
                rounded-full bg-emerald-100 px-1.5 py-0 text-[10px] font-medium text-emerald-700
                dark:bg-emerald-900/30 dark:text-emerald-400
              "
            >
              {sheetsCount}
            </span>
          </a>
          <a
            href={`/${lang}/showcase?filter=docs`}
            className={clsx(`
              inline-flex h-[calc(100%-1px)] items-center justify-center gap-1.5 rounded-md border border-transparent
              px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
              sm:px-4
            `, activeFilter === 'docs'
              ? `
                bg-background text-foreground shadow-sm
                dark:border-input dark:bg-input/30
              `
              : 'hover:text-foreground')}
          >
            <BookTextIcon className="size-3.5" />
            <span
              className="
                hidden
                sm:inline
              "
            >
              {t['showcase.filter.docs']}
            </span>
            <span
              className="
                rounded-full bg-blue-100 px-1.5 py-0 text-[10px] font-medium text-blue-700
                dark:bg-blue-900/30 dark:text-blue-400
              "
            >
              {docsCount}
            </span>
          </a>
          <a
            href={`/${lang}/showcase?filter=slides`}
            className={clsx(`
              inline-flex h-[calc(100%-1px)] items-center justify-center gap-1.5 rounded-md border border-transparent
              px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
              sm:px-4
            `, activeFilter === 'slides'
              ? `
                bg-background text-foreground shadow-sm
                dark:border-input dark:bg-input/30
              `
              : 'hover:text-foreground')}
          >
            <PresentationIcon className="size-3.5" />
            <span
              className="
                hidden
                sm:inline
              "
            >
              {t['showcase.filter.slides']}
            </span>
            <span
              className="
                rounded-full bg-rose-100 px-1.5 py-0 text-[10px] font-medium text-rose-700
                dark:bg-rose-900/30 dark:text-rose-400
              "
            >
              {slidesCount}
            </span>
          </a>
        </div>
      </div>

      {/* Grid */}
      <section
        className={`
          mt-8 grid grid-cols-1 gap-5
          md:grid-cols-2
          lg:grid-cols-3
        `}
      >
        {filteredItems.map(item => (
          <ShowcaseCard key={item.url} item={item} />
        ))}
      </section>

      {filteredItems.length === 0 && (
        <div className="py-24 text-center">
          <p
            className="
              text-neutral-500
              dark:text-neutral-400
            "
          >
            No examples found for this category.
          </p>
        </div>
      )}
    </div>
  )
}
