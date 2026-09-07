import fs from 'node:fs'
import path from 'node:path'

import { notFound } from 'next/navigation'

import { Playground } from '@/components/playground'
import packageJson from '@/package.json'
import { showcase } from '@/showcase/data'
import { prepareShowcaseSource } from '@/showcase/source-files'

import { LayoutProvider } from '../layout.client'

interface IProps {
  params: Promise<{
    slug: string[]
    lang: string
  }>
}

export function generateStaticParams(): { slug: string[] }[] {
  return Object.keys(showcase).reduce(
    (acc, key) => {
      acc.push({
        slug: key.split('/'),
      })
      return acc
    },
    [] as { slug: string[] }[],
  )
}

export async function generateMetadata({ params }: IProps) {
  const { slug, lang } = await params

  const current = showcase[slug.join('/')]
  if (!current) notFound()
  const { metadata } = (await current()).default

  return {
    title: metadata.title[lang],
    description: metadata.description[lang],
  }
}

export default async function Page({ params }: IProps) {
  const { slug } = await params

  const pathname = slug.join('/')

  const loadShowcase = showcase[pathname]
  if (!loadShowcase) {
    notFound()
  }

  const { files, Preview, metadata } = (await loadShowcase()).default
  const previewSource = fs.readFileSync(path.join(process.cwd(), 'showcase', pathname, 'preview', 'main.tsx'), 'utf8')
  const packageVersions = Object.fromEntries(
    Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies }).map((name) => [
      name,
      JSON.parse(fs.readFileSync(path.join(process.cwd(), 'node_modules', name, 'package.json'), 'utf8'))
        .version as string,
    ]),
  )
  const source = prepareShowcaseSource({ ...files, '/reference/preview.tsx.txt': previewSource }, packageVersions)

  return (
    <LayoutProvider>
      <Playground
        preview={<Preview />}
        files={source.files}
        dependencies={source.dependencies}
        previewHeight={metadata.previewHeight}
      />
    </LayoutProvider>
  )
}
