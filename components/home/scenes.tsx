'use client'

import {
  BarChart3Icon,
  DatabaseIcon,
  FilePenLineIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  PresentationIcon,
  ShapesIcon,
  UsersIcon,
  ZapIcon,
} from 'lucide-react'

import { BlurFade } from '@/components/magicui/blur-fade'

interface ISceneItem {
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
  basesTitle: string
  basesDesc: string
  boardsTitle: string
  boardsDesc: string
  pdfTitle: string
  pdfDesc: string
  dataTitle: string
  dataDesc: string
  collabTitle: string
  collabDesc: string
  automationTitle: string
  automationDesc: string
  proBadge: string
}

const sheetVisualCells = [
  { id: 'a1', corner: 'rounded-tl-md' },
  { id: 'b1' },
  { id: 'c1' },
  { id: 'd1', corner: 'rounded-tr-md' },
  { id: 'a2' },
  { id: 'b2', active: true },
  { id: 'c2' },
  { id: 'd2' },
  { id: 'a3', corner: 'rounded-bl-md' },
  { id: 'b3' },
  { id: 'c3' },
  { id: 'd3', corner: 'rounded-br-md' },
]

const baseVisualCells = [
  { id: 'field-a', active: true },
  { id: 'field-b' },
  { id: 'field-c' },
  { id: 'record-a' },
  { id: 'record-b', active: true },
  { id: 'record-c' },
  { id: 'view-a' },
  { id: 'view-b' },
  { id: 'view-c', active: true },
]

/* Pure CSS illustrations */

function SheetsVisual() {
  return (
    <div className="flex h-16 items-center justify-center">
      <div
        className="grid grid-cols-4 gap-px rounded-md border border-neutral-200/60 bg-neutral-200/60 dark:border-neutral-700/60 dark:bg-neutral-700/60"
      >
        {sheetVisualCells.map((cell) => (
          <div
            key={cell.id}
            className={`size-5 ${
              cell.active ? `bg-emerald-400/30 dark:bg-emerald-500/30` : `bg-white/60 dark:bg-neutral-800/60`
            } ${cell.corner ?? ''} `}
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
        className="h-1.5 w-16 rounded-full bg-neutral-200/70 dark:bg-neutral-700/70"
      />
      <div
        className="h-1.5 w-12 rounded-full bg-neutral-200/70 dark:bg-neutral-700/70"
      />
      <div
        className="h-1.5 w-14 rounded-full bg-neutral-200/70 dark:bg-neutral-700/70"
      />
      <div
        className="mt-1 h-1.5 w-8 rounded-full bg-blue-300/60 dark:bg-blue-600/40"
      />
    </div>
  )
}

function SlidesVisual() {
  return (
    <div className="flex h-16 flex-col items-center justify-center gap-2">
      <div
        className="relative h-10 w-18 rounded-sm border-2 border-neutral-200/60 bg-white/40 dark:border-neutral-700/60 dark:bg-neutral-800/40"
      >
        <div
          className="absolute top-1/2 left-1/2 h-5 w-9 -translate-1/2 rounded-sm bg-red-300/30 dark:bg-red-500/20"
        />
      </div>
      <div className="flex gap-1">
        <span
          className="block size-1.5 rounded-full bg-neutral-400/60 dark:bg-neutral-500/60"
        />
        <span
          className="block size-1.5 rounded-full bg-neutral-300/40 dark:bg-neutral-600/40"
        />
        <span
          className="block size-1.5 rounded-full bg-neutral-300/40 dark:bg-neutral-600/40"
        />
      </div>
    </div>
  )
}

function DataVisual() {
  return (
    <div className="flex h-16 items-end justify-center gap-1">
      <div
        className="w-3 rounded-t bg-purple-300/50 dark:bg-purple-500/30"
        style={{ height: 16 }}
      />
      <div
        className="w-3 rounded-t bg-purple-300/50 dark:bg-purple-500/30"
        style={{ height: 28 }}
      />
      <div
        className="w-3 rounded-t bg-purple-400/60 dark:bg-purple-400/40"
        style={{ height: 22 }}
      />
      <div
        className="w-3 rounded-t bg-purple-300/50 dark:bg-purple-500/30"
        style={{ height: 32 }}
      />
      <div
        className="w-3 rounded-t bg-purple-300/50 dark:bg-purple-500/30"
        style={{ height: 20 }}
      />
    </div>
  )
}

function BasesVisual() {
  return (
    <div className="flex h-16 items-center justify-center">
      <div
        className="grid w-24 grid-cols-[24px_1fr] gap-1 rounded-md border border-teal-200/70 bg-white/50 p-2 dark:border-teal-700/50 dark:bg-neutral-800/40"
      >
        <div className="space-y-1">
          <div
            className="h-2 rounded-sm bg-teal-300/60 dark:bg-teal-500/40"
          />
          <div
            className="h-2 rounded-sm bg-teal-200/60 dark:bg-teal-600/30"
          />
          <div
            className="h-2 rounded-sm bg-teal-200/60 dark:bg-teal-600/30"
          />
        </div>
        <div className="grid grid-cols-3 gap-1">
          {baseVisualCells.map((cell) => (
            <span
              key={cell.id}
              className={`h-2 rounded-sm ${
                cell.active ? `bg-teal-400/50 dark:bg-teal-400/40` : `bg-neutral-200/70 dark:bg-neutral-700/70`
              } `}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function BoardsVisual() {
  return (
    <div className="flex h-16 items-center justify-center">
      <div
        className="relative h-12 w-28 rounded-md border border-violet-200/70 bg-violet-50/40 dark:border-violet-700/50 dark:bg-violet-950/20"
      >
        <span
          className="absolute top-2 left-3 size-6 rounded-sm bg-emerald-200/80 shadow-xs dark:bg-emerald-500/40"
        />
        <span
          className="absolute top-4 left-12 size-6 rounded-sm bg-blue-200/80 shadow-xs dark:bg-blue-500/40"
        />
        <span
          className="absolute right-4 bottom-2 size-6 rounded-sm bg-rose-200/80 shadow-xs dark:bg-rose-500/40"
        />
        <span
          className="absolute top-5 left-9 h-px w-5 bg-violet-300/70 dark:bg-violet-500/50"
        />
        <span
          className="absolute top-7 right-10 h-px w-5 bg-violet-300/70 dark:bg-violet-500/50"
        />
      </div>
    </div>
  )
}

function PdfVisual() {
  return (
    <div className="flex h-16 items-center justify-center">
      <div
        className="relative h-14 w-10 rounded-sm border border-rose-200/70 bg-white/60 p-2 dark:border-rose-700/50 dark:bg-neutral-800/60"
      >
        <span
          className="block h-1 w-6 rounded-full bg-neutral-200 dark:bg-neutral-700"
        />
        <span
          className="mt-2 block h-1 w-5 rounded-full bg-neutral-200 dark:bg-neutral-700"
        />
        <span
          className="mt-2 block h-4 rounded-sm bg-rose-200/60 dark:bg-rose-500/30"
        />
        <span className="absolute right-1 bottom-1 size-2 rounded-full bg-amber-400/70" />
      </div>
    </div>
  )
}

function CollabVisual() {
  return (
    <div className="flex h-16 items-center justify-center gap-2">
      <div className="flex -space-x-1.5">
        <div
          className="flex size-5 items-center justify-center rounded-full bg-amber-300/50 text-[8px] font-bold text-amber-700 dark:bg-amber-600/30 dark:text-amber-300"
        >
          A
        </div>
        <div
          className="flex size-5 items-center justify-center rounded-full bg-blue-300/50 text-[8px] font-bold text-blue-700 dark:bg-blue-600/30 dark:text-blue-300"
        >
          B
        </div>
        <div
          className="flex size-5 items-center justify-center rounded-full bg-green-300/50 text-[8px] font-bold text-green-700 dark:bg-green-600/30 dark:text-green-300"
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
          className="block size-1.5 rounded-full bg-cyan-400/60 dark:bg-cyan-500/40"
        />
        <span
          className="block h-px w-4 bg-cyan-300/40 dark:bg-cyan-600/30"
        />
        <span
          className="block size-1.5 rounded-full bg-cyan-400/60 dark:bg-cyan-500/40"
        />
        <span
          className="block h-px w-4 bg-cyan-300/40 dark:bg-cyan-600/30"
        />
        <span
          className="block size-1.5 rounded-full bg-cyan-400/60 dark:bg-cyan-500/40"
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
    basesTitle,
    basesDesc,
    boardsTitle,
    boardsDesc,
    pdfTitle,
    pdfDesc,
    dataTitle,
    dataDesc,
    collabTitle,
    collabDesc,
    automationTitle,
    automationDesc,
    proBadge,
  } = props

  const items: ISceneItem[] = [
    {
      icon: (
        <FileSpreadsheetIcon
          className="size-5 text-emerald-600 dark:text-emerald-400"
        />
      ),
      title: sheetsTitle,
      desc: sheetsDesc,
      visual: <SheetsVisual />,
    },
    {
      icon: (
        <FileTextIcon
          className="size-5 text-blue-600 dark:text-blue-400"
        />
      ),
      title: docsTitle,
      desc: docsDesc,
      visual: <DocsVisual />,
    },
    {
      icon: (
        <PresentationIcon
          className="size-5 text-red-600 dark:text-red-400"
        />
      ),
      title: slidesTitle,
      desc: slidesDesc,
      visual: <SlidesVisual />,
    },
    {
      icon: (
        <DatabaseIcon
          className="size-5 text-teal-600 dark:text-teal-400"
        />
      ),
      title: basesTitle,
      desc: basesDesc,
      isPro: true,
      visual: <BasesVisual />,
    },
    {
      icon: (
        <ShapesIcon
          className="size-5 text-violet-600 dark:text-violet-400"
        />
      ),
      title: boardsTitle,
      desc: boardsDesc,
      isPro: true,
      visual: <BoardsVisual />,
    },
    {
      icon: (
        <BarChart3Icon
          className="size-5 text-purple-600 dark:text-purple-400"
        />
      ),
      title: dataTitle,
      desc: dataDesc,
      isPro: true,
      visual: <DataVisual />,
    },
    {
      icon: (
        <FilePenLineIcon
          className="size-5 text-rose-600 dark:text-rose-400"
        />
      ),
      title: pdfTitle,
      desc: pdfDesc,
      isPro: true,
      visual: <PdfVisual />,
    },
    {
      icon: (
        <UsersIcon
          className="size-5 text-amber-600 dark:text-amber-400"
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
          className="size-5 text-cyan-600 dark:text-cyan-400"
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
          <h2 className={`mb-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100`}>{title}</h2>
          <p
            className="text-neutral-600 dark:text-neutral-400"
          >
            {subtitle}
          </p>
        </div>

        <div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item, index) => (
            <BlurFade key={item.title} inView delay={index * 0.05} className="h-full">
              <div
                className={`relative flex h-full flex-col gap-3 rounded-2xl bg-white/30 p-6 shadow-xs ring-4 ring-neutral-100/20 backdrop-blur-sm transition-colors ring-inset hover:bg-white/50 dark:bg-neutral-900/50 dark:ring-neutral-600/20 hover:dark:bg-neutral-800/60`}
              >
                {item.isPro && (
                  <span
                    className={`absolute top-4 right-4 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-neutral-500 uppercase dark:bg-neutral-800 dark:text-neutral-400`}
                  >
                    {proBadge}
                  </span>
                )}
                <div
                  className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  {item.icon}
                  {item.title}
                </div>
                {item.visual}
                <p
                  className="text-sm/relaxed text-neutral-600 dark:text-neutral-400"
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
