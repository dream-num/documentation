'use client'

import {
  BarChart3Icon,
  FileSpreadsheetIcon,
  FileTextIcon,
  PresentationIcon,
  UsersIcon,
  ZapIcon,
} from 'lucide-react'
import { BlurFade } from '@/components/magicui/blur-fade'

interface SceneItem {
  icon: React.ReactNode
  title: string
  desc: string
  isPro?: boolean
  visual: React.ReactNode
}

interface IProps {
  title: string
  subtitle: string
  sheetsTitle: string
  sheetsDesc: string
  docsTitle: string
  docsDesc: string
  slidesTitle: string
  slidesDesc: string
  dataTitle: string
  dataDesc: string
  collabTitle: string
  collabDesc: string
  automationTitle: string
  automationDesc: string
  proBadge: string
}

/* Pure CSS illustrations */

function SheetsVisual() {
  return (
    <div className="flex h-16 items-center justify-center">
      <div
        className="
          grid grid-cols-4 gap-px rounded-md border border-neutral-200/60 bg-neutral-200/60
          dark:border-neutral-700/60 dark:bg-neutral-700/60
        "
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`
              size-5
              ${i === 5
            ? `
              bg-emerald-400/30
              dark:bg-emerald-500/30
            `
            : `
              bg-white/60
              dark:bg-neutral-800/60
            `}
              ${i === 0 ? 'rounded-tl-md' : ''}
              ${i === 3 ? 'rounded-tr-md' : ''}
              ${i === 8 ? 'rounded-bl-md' : ''}
              ${i === 11 ? 'rounded-br-md' : ''}
            `}
          />
        ))}
      </div>
    </div>
  )
}

function DocsVisual() {
  return (
    <div className="flex h-16 flex-col items-center justify-center gap-1.5">
      <div
        className="
          h-1.5 w-16 rounded-full bg-neutral-200/70
          dark:bg-neutral-700/70
        "
      />
      <div
        className="
          h-1.5 w-12 rounded-full bg-neutral-200/70
          dark:bg-neutral-700/70
        "
      />
      <div
        className="
          h-1.5 w-14 rounded-full bg-neutral-200/70
          dark:bg-neutral-700/70
        "
      />
      <div
        className="
          mt-1 h-1.5 w-8 rounded-full bg-blue-300/60
          dark:bg-blue-600/40
        "
      />
    </div>
  )
}

function SlidesVisual() {
  return (
    <div className="flex h-16 flex-col items-center justify-center gap-2">
      <div
        className="
          relative h-10 w-18 rounded-sm border-2 border-neutral-200/60 bg-white/40
          dark:border-neutral-700/60 dark:bg-neutral-800/40
        "
      >
        <div
          className="
            absolute top-1/2 left-1/2 h-5 w-9 -translate-1/2 rounded-sm bg-red-300/30
            dark:bg-red-500/20
          "
        />
      </div>
      <div className="flex gap-1">
        <span
          className="
            block size-1.5 rounded-full bg-neutral-400/60
            dark:bg-neutral-500/60
          "
        />
        <span
          className="
            block size-1.5 rounded-full bg-neutral-300/40
            dark:bg-neutral-600/40
          "
        />
        <span
          className="
            block size-1.5 rounded-full bg-neutral-300/40
            dark:bg-neutral-600/40
          "
        />
      </div>
    </div>
  )
}

function DataVisual() {
  return (
    <div className="flex h-16 items-end justify-center gap-1">
      <div
        className="
          w-3 rounded-t bg-purple-300/50
          dark:bg-purple-500/30
        "
        style={{ height: 16 }}
      />
      <div
        className="
          w-3 rounded-t bg-purple-300/50
          dark:bg-purple-500/30
        "
        style={{ height: 28 }}
      />
      <div
        className="
          w-3 rounded-t bg-purple-400/60
          dark:bg-purple-400/40
        "
        style={{ height: 22 }}
      />
      <div
        className="
          w-3 rounded-t bg-purple-300/50
          dark:bg-purple-500/30
        "
        style={{ height: 32 }}
      />
      <div
        className="
          w-3 rounded-t bg-purple-300/50
          dark:bg-purple-500/30
        "
        style={{ height: 20 }}
      />
    </div>
  )
}

function CollabVisual() {
  return (
    <div className="flex h-16 items-center justify-center gap-2">
      <div className="flex -space-x-1.5">
        <div
          className="
            flex size-5 items-center justify-center rounded-full bg-amber-300/50 text-[8px] font-bold text-amber-700
            dark:bg-amber-600/30 dark:text-amber-300
          "
        >
          A
        </div>
        <div
          className="
            flex size-5 items-center justify-center rounded-full bg-blue-300/50 text-[8px] font-bold text-blue-700
            dark:bg-blue-600/30 dark:text-blue-300
          "
        >
          B
        </div>
        <div
          className="
            flex size-5 items-center justify-center rounded-full bg-green-300/50 text-[8px] font-bold text-green-700
            dark:bg-green-600/30 dark:text-green-300
          "
        >
          C
        </div>
      </div>
    </div>
  )
}

function AutomationVisual() {
  return (
    <div className="flex h-16 items-center justify-center">
      <div className="flex items-center gap-1">
        <span
          className="
            block size-1.5 rounded-full bg-cyan-400/60
            dark:bg-cyan-500/40
          "
        />
        <span
          className="
            block h-px w-4 bg-cyan-300/40
            dark:bg-cyan-600/30
          "
        />
        <span
          className="
            block size-1.5 rounded-full bg-cyan-400/60
            dark:bg-cyan-500/40
          "
        />
        <span
          className="
            block h-px w-4 bg-cyan-300/40
            dark:bg-cyan-600/30
          "
        />
        <span
          className="
            block size-1.5 rounded-full bg-cyan-400/60
            dark:bg-cyan-500/40
          "
        />
      </div>
    </div>
  )
}

export function Scenes(props: IProps) {
  const {
    title,
    subtitle,
    sheetsTitle,
    sheetsDesc,
    docsTitle,
    docsDesc,
    slidesTitle,
    slidesDesc,
    dataTitle,
    dataDesc,
    collabTitle,
    collabDesc,
    automationTitle,
    automationDesc,
    proBadge,
  } = props

  const items: SceneItem[] = [
    {
      icon: (
        <FileSpreadsheetIcon
          className="
            size-5 text-emerald-600
            dark:text-emerald-400
          "
        />
      ),
      title: sheetsTitle,
      desc: sheetsDesc,
      visual: <SheetsVisual />,
    },
    {
      icon: (
        <FileTextIcon
          className="
            size-5 text-blue-600
            dark:text-blue-400
          "
        />
      ),
      title: docsTitle,
      desc: docsDesc,
      visual: <DocsVisual />,
    },
    {
      icon: (
        <PresentationIcon
          className="
            size-5 text-red-600
            dark:text-red-400
          "
        />
      ),
      title: slidesTitle,
      desc: slidesDesc,
      visual: <SlidesVisual />,
    },
    {
      icon: (
        <BarChart3Icon
          className="
            size-5 text-purple-600
            dark:text-purple-400
          "
        />
      ),
      title: dataTitle,
      desc: dataDesc,
      isPro: true,
      visual: <DataVisual />,
    },
    {
      icon: (
        <UsersIcon
          className="
            size-5 text-amber-600
            dark:text-amber-400
          "
        />
      ),
      title: collabTitle,
      desc: collabDesc,
      isPro: true,
      visual: <CollabVisual />,
    },
    {
      icon: (
        <ZapIcon
          className="
            size-5 text-cyan-600
            dark:text-cyan-400
          "
        />
      ),
      title: automationTitle,
      desc: automationDesc,
      isPro: true,
      visual: <AutomationVisual />,
    },
  ]

  return (
    <BlurFade inView>
      <section className="container px-4">
        <div className="mb-8 text-center">
          <h2
            className={`
              mb-2 text-2xl font-semibold text-neutral-900
              dark:text-neutral-100
            `}
          >
            {title}
          </h2>
          <p
            className="
              text-neutral-600
              dark:text-neutral-400
            "
          >
            {subtitle}
          </p>
        </div>

        <div
          className="
            grid gap-4
            md:grid-cols-2
            lg:grid-cols-3
          "
        >
          {items.map((item, index) => (
            <BlurFade key={item.title} inView delay={index * 0.05} className="h-full">
              <div
                className={`
                  relative flex h-full flex-col gap-3 rounded-2xl bg-white/30 p-6 shadow-xs ring-4 ring-neutral-100/20
                  backdrop-blur-sm transition-colors ring-inset
                  hover:bg-white/50
                  dark:bg-neutral-900/50 dark:ring-neutral-600/20
                  dark:hover:bg-neutral-800/60
                `}
              >
                {item.isPro && (
                  <span
                    className={`
                      absolute top-4 right-4 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold
                      tracking-wider text-neutral-500 uppercase
                      dark:bg-neutral-800 dark:text-neutral-400
                    `}
                  >
                    {proBadge}
                  </span>
                )}
                <div
                  className="
                    inline-flex items-center gap-2 text-sm font-semibold text-neutral-700
                    dark:text-neutral-300
                  "
                >
                  {item.icon}
                  {item.title}
                </div>
                {item.visual}
                <p
                  className="
                    text-sm/relaxed text-neutral-600
                    dark:text-neutral-400
                  "
                >
                  {item.desc}
                </p>
              </div>
            </BlurFade>
          ))}
        </div>
      </section>
    </BlurFade>
  )
}
