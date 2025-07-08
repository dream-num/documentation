import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PlaygroundFrame } from '@/components/playground'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { customTranslations } from '@/lib/i18n'
import { showcase } from '@/showcase/data'

interface IProps {
  params: Promise<{
    slug: string[]
    lang: string
  }>
}

export function generateStaticParams(): { slug: string }[] {
  return Object.keys(showcase).reduce((acc, key) => {
    acc.push({
      slug: key,
    })
    return acc
  }, [] as { slug: string }[])
}

export async function generateMetadata({ params }: IProps) {
  const { slug, lang } = await params

  const { metadata } = (await showcase[slug.join('/')]).default

  return {
    title: metadata.title[lang],
    description: metadata.description[lang],
  }
}

export default async function Page({ params }: IProps) {
  const { slug, lang } = await params

  const currentShowCasePromise = showcase[slug.join('/')]
  if (!currentShowCasePromise) {
    notFound()
  }

  const { metadata } = (await currentShowCasePromise).default

  const nav = []
  for (const key of Object.keys(showcase)) {
    const item = showcase[key as keyof typeof showcase]

    const { metadata } = (await item).default

    const type = key.split('/')[0]

    nav.push({
      type: `Univer ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      title: metadata.title,
      description: metadata.description,
      tags: metadata.tags,
      slug: key,
    })
  }

  const groupedNav = nav.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = []
    }
    acc[item.type].push(item)
    return acc
  }, {} as Record<string, typeof nav>)

  return (
    <div className="flex flex-1">
      <aside className="h-auto w-72 overflow-x-hidden">
        <div className="fixed top-14 h-[calc(100%-110px)] p-4">
          <ScrollArea className="h-full">
            {Object.entries(groupedNav).map(([type, items]) => (
              <div key={type} className="mb-4">
                <label
                  className={`
                    mb-2 px-2 text-xs font-medium text-neutral-400
                    dark:text-neutral-600
                  `}
                >
                  {type}
                </label>

                {items.map(item => (
                  <div key={item.slug} className="mb-1">
                    <Link
                      href={`/showcase/${item.slug}`}
                      className={`
                        inline-flex h-8 items-center truncate rounded px-2 text-sm font-medium text-neutral-800
                        transition-colors
                        hover:bg-fd-card
                        dark:text-neutral-50
                      `}
                    >
                      {item.title[lang]}
                    </Link>
                  </div>
                ))}
              </div>
            ))}
          </ScrollArea>
        </div>
      </aside>

      <div
        className={`
          container py-12
          max-sm:px-0
        `}
      >
        <header className="flex justify-between">
          <div>
            <h1
              className={`
                mb-2 text-3xl font-semibold text-neutral-800
                dark:text-neutral-50
              `}
            >
              {metadata.title[lang]}
            </h1>

            <p className="mb-4">{metadata.description[lang]}</p>

            <div className="flex gap-2">
              {metadata.tags[lang]?.map(tag => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>

          <div>
            <Button asChild>
              <Link href="/showcase">
                {customTranslations[lang]['showcase.back']}
              </Link>
            </Button>
          </div>
        </header>

        <section className="mt-4">
          <PlaygroundFrame slug={slug.join('/')} lang={lang} />
        </section>
      </div>
    </div>
  )
}
