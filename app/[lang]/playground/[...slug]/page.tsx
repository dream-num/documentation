import { notFound } from 'next/navigation'
import { Playground } from '@/components/playground'
import { showcase } from '@/showcase/data'
import { PageProvider } from './page.client'

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

  const { files, Preview } = (await currentShowCasePromise).default

  return (
    <PageProvider>
      <Playground
        lang={lang}
        preview={<Preview />}
        files={files}
      />
    </PageProvider>
  )
}
