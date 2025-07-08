import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { customTranslations } from '@/lib/i18n'
import { showcase } from '@/showcase/data'
import { PlaygroundFrame } from './playground.client'

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

  return (
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
        <PlaygroundFrame slug={slug} lang={lang} />
      </section>
    </div>
  )
}
