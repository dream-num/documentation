'use client'

import {
  BasesMultiIcon,
  BoardsMultiIcon,
  DocsMultiIcon,
  PdfMultiIcon,
  SheetsMultiIcon,
  SlidesMultiIcon,
} from '@univerjs/icons'
import { motion } from 'motion/react'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import Spinner from '@/components/animata/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { clsx } from '@/lib/clsx'

function EditorLoading() {
  return (
    <div className="flex size-full items-center justify-center" aria-busy="true">
      <Spinner />
    </div>
  )
}

const editors = {
  sheets: dynamic(() => import('./sheets'), { ssr: false, loading: EditorLoading }),
  slides: dynamic(() => import('./slides'), { ssr: false, loading: EditorLoading }),
  bases: dynamic(() => import('./bases'), { ssr: false, loading: EditorLoading }),
  boards: dynamic(() => import('./boards'), { ssr: false, loading: EditorLoading }),
  pdfs: dynamic(() => import('./pdfs'), { ssr: false, loading: EditorLoading }),
}
const DocsDemo = dynamic(() => import('./docs'), { ssr: false, loading: EditorLoading })
type UniverType = keyof typeof editors | 'docs'
type DocumentMode = 'modern' | 'traditional'

export interface IUniverProps {
  tablistLabel: string
}

export default function UniverDemo({ tablistLabel }: IUniverProps) {
  const [type, setType] = useState<UniverType>('sheets')
  const [documentMode, setDocumentMode] = useState<DocumentMode>('modern')
  const Editor = type === 'docs' ? undefined : editors[type]

  function handleChangeType(newType: UniverType) {
    if (newType === type) return
    setType(newType)
  }

  function handleChangeDocumentMode(newMode: DocumentMode) {
    if (newMode === documentMode) return
    setDocumentMode(newMode)
  }

  const tabs = [
    {
      key: 'sheets' as const,
      label: 'Sheets',
      fullLabel: 'Univer Sheets',
      icon: SheetsMultiIcon,
    },
    {
      key: 'docs' as const,
      label: 'Docs',
      fullLabel: 'Univer Docs',
      icon: DocsMultiIcon,
    },
    {
      key: 'slides' as const,
      label: 'Slides',
      fullLabel: 'Univer Slides',
      icon: SlidesMultiIcon,
    },
    {
      key: 'bases' as const,
      label: 'Bases',
      fullLabel: 'Univer Bases',
      icon: BasesMultiIcon,
    },
    {
      key: 'boards' as const,
      label: 'Boards',
      fullLabel: 'Univer Boards',
      icon: BoardsMultiIcon,
    },
    {
      key: 'pdfs' as const,
      label: 'PDFs',
      fullLabel: 'Univer PDFs',
      icon: PdfMultiIcon,
    },
  ]

  return (
    <Tabs
      value={type}
      onValueChange={(value) => {
        const nextTab = tabs.find((tab) => tab.key === value)
        if (nextTab) handleChangeType(nextTab.key)
      }}
      className="w-full gap-0"
    >
      <div className={clsx('flex justify-center px-4', type === 'docs' ? 'mb-2.5' : 'mb-5')}>
        <TabsList
          aria-label={tablistLabel}
          className="grid h-21 w-full max-w-sm grid-cols-3 gap-0.5 p-1 sm:inline-flex sm:h-11.5 sm:w-auto sm:max-w-none"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger
                key={tab.key}
                id={`univer-tab-${tab.key}`}
                value={tab.key}
                aria-label={tab.fullLabel}
                className="h-9 px-2.5 text-xs sm:px-4 sm:text-sm"
              >
                <Icon aria-hidden className="size-4" />
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </div>

      {type === 'docs' && (
        <motion.div
          className="mb-4 flex justify-center px-4"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Tabs
            value={documentMode}
            onValueChange={(value) => {
              if (value === 'modern' || value === 'traditional') handleChangeDocumentMode(value)
            }}
          >
            <TabsList aria-label="Document layout mode">
              {(['modern', 'traditional'] as const).map((mode) => (
                <TabsTrigger key={mode} value={mode} aria-controls="univer-product-demo" className="px-4 text-xs">
                  {mode === 'modern' ? 'Modern' : 'Traditional'}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>
      )}

      <TabsContent
        value={type}
        keepMounted
        id="univer-product-demo"
        aria-labelledby={`univer-tab-${type}`}
        className="relative mx-auto h-160 w-7xl max-w-full flex-none overflow-hidden overscroll-contain rounded-lg border border-border bg-card sm:h-200 dark:border-white/10 dark:shadow-[0_12px_36px_#00000026]"
      >
        {type === 'docs' ? <DocsDemo documentMode={documentMode} /> : Editor && <Editor />}
      </TabsContent>
    </Tabs>
  )
}
