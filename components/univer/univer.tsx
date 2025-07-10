'use client'

import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import docsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { BookTextIcon, SheetIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import { BorderBeam } from '@/components/magicui/border-beam'
import { clsx } from '@/lib/clsx'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-docs-core/lib/index.css'

export default function Univer() {
  const divRef = useRef<HTMLDivElement>(null!)

  const [type, setType] = useState<'sheets' | 'docs'>('sheets')
  const [steady, setSteady] = useState(false)

  const { theme } = useTheme()

  useEffect(() => {
    const presets = []

    if (type === 'sheets') {
      presets.push(
        UniverSheetsCorePreset({
          container: divRef.current,
        }),
      )
    } else if (type === 'docs') {
      presets.push(
        UniverDocsCorePreset({
          container: divRef.current,
        }),
      )
    }

    const { univerAPI } = createUniver({
      darkMode: theme === 'dark',
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: merge(
          {},
          sheetsCoreEnUS,
          docsCoreEnUS,
        ),
      },
      presets,
    })

    if (type === 'sheets') {
      univerAPI.createWorkbook({})
    } else if (type === 'docs') {
      univerAPI.createUniverDoc({})
    }

    univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, (event) => {
      if (event.stage === univerAPI.Enum.LifecycleStages.Rendered) {
        setSteady(true)
      }
    })

    return () => {
      univerAPI.dispose()
      setSteady(false)
    }
  }, [type, theme])

  return (
    <div className="w-full">
      <header className="mb-4 flex justify-center gap-4">
        <div
          className={`
            flex gap-2 rounded-full bg-white p-1 text-sm font-medium shadow-md
            dark:bg-neutral-800
            [&_button]:flex [&_button]:cursor-pointer [&_button]:items-center [&_button]:gap-2 [&_button]:rounded-full
            [&_button]:px-2 [&_button]:py-1 [&_button]:transition-all [&_button]:duration-300
            [&_svg]:size-4
          `}
        >
          <button
            className={clsx('text-green-600', {
              'bg-green-600 text-white': type === 'sheets',
              'hover:bg-green-50 dark:hover:bg-green-900 dark:hover:text-neutral-200': type !== 'sheets',
            })}
            type="button"
            onClick={() => setType('sheets')}
          >
            <SheetIcon />
            <span
              className={`
                hidden
                md:inline
              `}
            >
              Univer Sheets
            </span>
          </button>
          <button
            className={clsx('text-blue-600', {
              'bg-blue-600 text-white': type === 'docs',
              'hover:bg-blue-50 dark:hover:bg-blue-900 dark:hover:text-neutral-200': type !== 'docs',
            })}
            type="button"
            onClick={() => setType('docs')}
          >
            <BookTextIcon />
            <span
              className={`
                hidden
                md:inline
              `}
            >
              Univer Docs
            </span>
          </button>
        </div>
      </header>

      <div
        className={`
          relative mx-auto h-120 w-320 max-w-full overflow-hidden rounded-xl p-px shadow-xl
          md:h-200
        `}
      >
        {/* Mask */}
        <div
          className={clsx(`
            absolute inset-0 size-full bg-white/10
            dark:bg-black/10
          `, {
            'pointer-events-auto z-0 opacity-0': steady,
          })}
        />

        {/* Univer Container */}
        <div
          ref={divRef}
          className={clsx('pointer-events-none size-full opacity-0 blur-3xl transition-all duration-500', {
            'pointer-events-auto opacity-100 blur-none': steady,
          })}
        />

        <BorderBeam
          delay={0}
          size={600}
          borderWidth={2}
          className="from-transparent via-green-500 to-transparent"
        />
        <BorderBeam
          delay={10}
          size={600}
          borderWidth={2}
          className="from-transparent via-blue-500 to-transparent"
        />
      </div>
    </div>
  )
}
