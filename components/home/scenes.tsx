'use client'

import {
  DatabaseIcon,
  FilePenLineIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  PresentationIcon,
  ShapesIcon,
} from 'lucide-react'
import Script from 'next/script'
import { useState } from 'react'

import { BlurFade } from '@/components/magicui/blur-fade'

import type { Scene } from './hairline'
import { SceneIllustration } from './scene-illustration'

interface IProps {
  title: string
  subtitle: string
  sheetsTitle: string
  sheetsDesc: string
  docsTitle: string
  docsDesc: string
  slidesTitle: string
  slidesDesc: string
  basesTitle: string
  basesDesc: string
  boardsTitle: string
  boardsDesc: string
  pdfTitle: string
  pdfDesc: string
}

export function Scenes(props: IProps) {
  const [ready, setReady] = useState(false)
  const items = [
    { scene: 'sheets', icon: FileSpreadsheetIcon, title: props.sheetsTitle, desc: props.sheetsDesc },
    { scene: 'docs', icon: FileTextIcon, title: props.docsTitle, desc: props.docsDesc },
    { scene: 'slides', icon: PresentationIcon, title: props.slidesTitle, desc: props.slidesDesc },
    { scene: 'bases', icon: DatabaseIcon, title: props.basesTitle, desc: props.basesDesc },
    { scene: 'boards', icon: ShapesIcon, title: props.boardsTitle, desc: props.boardsDesc },
    { scene: 'pdf', icon: FilePenLineIcon, title: props.pdfTitle, desc: props.pdfDesc },
  ] satisfies { scene: Scene; icon: typeof FileTextIcon; title: string; desc: string }[]

  return (
    <BlurFade inView>
      <Script src="/assets/illustrations/hairline-kernel.js" onReady={() => setReady(true)} />
      <section className="container px-4">
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{props.title}</h2>
          <p className="text-neutral-600 dark:text-neutral-400">{props.subtitle}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <BlurFade key={item.scene} inView delay={index * 0.05} className="h-full">
              <article className="flex h-full flex-col rounded-2xl border border-neutral-200/80 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  <item.icon className="size-4 text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
                  {item.title}
                </h3>
                <SceneIllustration scene={item.scene} label={item.title} ready={ready} />
                <p className="text-sm/relaxed text-neutral-600 dark:text-neutral-400">{item.desc}</p>
              </article>
            </BlurFade>
          ))}
        </div>
      </section>
    </BlurFade>
  )
}
