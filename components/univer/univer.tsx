'use client'

import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import docsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { UniverSheetsConditionalFormattingPreset } from '@univerjs/preset-sheets-conditional-formatting'
import sheetsConditionalFormattingEnUS from '@univerjs/preset-sheets-conditional-formatting/locales/en-US'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation'
import sheetsDataValidationEnUS from '@univerjs/preset-sheets-data-validation/locales/en-US'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { BookTextIcon, SheetIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import Spinner from '@/components/animata/spinner'
import { BorderBeam } from '@/components/magicui/border-beam'
import { clsx } from '@/lib/clsx'
import { documentData, workbookData } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import '@univerjs/preset-sheets-core/lib/index.css'

export default function Univer() {
  const divRef = useRef<HTMLDivElement>(null!)

  const [type, setType] = useState<'sheets' | 'docs'>('sheets')
  const [steady, setSteady] = useState(false)

  const { theme } = useTheme()

  useEffect(() => {
    const locales = []
    const presets = []

    if (type === 'docs') {
      locales.push(docsCoreEnUS)
      presets.push(
        UniverDocsCorePreset({
          container: divRef.current,
        }),
      )
    } else if (type === 'sheets') {
      locales.push(sheetsCoreEnUS, sheetsDataValidationEnUS, sheetsConditionalFormattingEnUS)
      presets.push(
        UniverSheetsCorePreset({
          container: divRef.current,
        }),
        UniverSheetsDataValidationPreset(),
        UniverSheetsConditionalFormattingPreset(),
      )
    }

    const { univerAPI } = createUniver({
      darkMode: theme === 'dark',
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: merge(
          {},
          ...locales,
        ),
      },
      presets,
    })

    if (type === 'docs') {
      univerAPI.createUniverDoc(documentData)
    } else if (type === 'sheets') {
      univerAPI.createWorkbook(workbookData)
    }

    univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, (event) => {
      if (event.stage === univerAPI.Enum.LifecycleStages.Rendered) {
        setSteady(true)
      }
    })

    return () => {
      univerAPI.dispose()
    }
  }, [theme, type])

  function handleChangeType(newType: 'sheets' | 'docs') {
    setSteady(false)
    setType(newType)
  }

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
            onClick={() => handleChangeType('sheets')}
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
            onClick={() => handleChangeType('docs')}
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
        className="relative mx-auto h-160 w-320 max-w-full overflow-hidden rounded-xl p-0.5 shadow-xl"
      >
        {/* Mask */}
        <div
          className={clsx(`
            pointer-events-auto absolute inset-0 z-1 flex size-full items-center justify-center bg-white/20
            transition-all
            dark:bg-neutral-900/20
          `, {
            'opacity-0': steady,
          })}
        >
          {!steady && <Spinner />}
        </div>

        {/* Univer Container */}
        <div
          className={clsx('relative z-1 size-full blur-3xl transition-all duration-300', {
            'blur-none': steady,
          })}
        >
          <div ref={divRef} className="h-full" />
        </div>

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
