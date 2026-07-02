'use client'

import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import docsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { UniverSheetsConditionalFormattingPreset } from '@univerjs/preset-sheets-conditional-formatting'
import sheetsConditionalFormattingEnUS from '@univerjs/preset-sheets-conditional-formatting/locales/en-US'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation'
import sheetsDataValidationEnUS from '@univerjs/preset-sheets-data-validation/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { BookTextIcon, SheetIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import Spinner from '@/components/animata/spinner'
import { BorderBeam } from '@/components/magicui/border-beam'
import { clsx } from '@/lib/clsx'
import { documentData, workbookData } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-data-validation/lib/index.css'
import '@univerjs/preset-sheets-conditional-formatting/lib/index.css'

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
          ribbonType: 'classic',
        }),
      )
    } else if (type === 'sheets') {
      locales.push(sheetsCoreEnUS, sheetsDataValidationEnUS, sheetsConditionalFormattingEnUS)
      presets.push(
        UniverSheetsCorePreset({
          container: divRef.current,
          ribbonType: 'classic',
        }),
        UniverSheetsDataValidationPreset(),
        UniverSheetsConditionalFormattingPreset(),
      )
    }

    const { univerAPI } = createUniver({
      darkMode: theme === 'dark',
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: mergeLocales(locales),
      },
      presets,
    })

    if (type === 'docs') {
      univerAPI.createDocument(documentData)
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
    if (newType === type) return
    setSteady(false)
    setType(newType)
  }

  const tabs = [
    {
      key: 'sheets' as const,
      label: 'Sheets',
      fullLabel: 'Univer Sheets',
      icon: SheetIcon,
      activeClass: 'text-green-700 dark:text-green-300',
      beamColor: '#22c55e',
    },
    {
      key: 'docs' as const,
      label: 'Docs',
      fullLabel: 'Univer Docs',
      icon: BookTextIcon,
      activeClass: 'text-blue-700 dark:text-blue-300',
      beamColor: '#3b82f6',
    },
  ]

  const activeIndex = type === 'sheets' ? 0 : 1

  return (
    <div className="w-full">
      {/* Tab Switcher */}
      <header className="mb-5 flex justify-center">
        <div
          className={`
            relative inline-flex items-center rounded-full bg-neutral-100 p-0.5
            dark:bg-neutral-800
          `}
        >
          {tabs.map((tab) => {
            const isActive = type === tab.key
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleChangeType(tab.key)}
                className={clsx(
                  `
                    relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors duration-200
                    md:px-4
                  `,
                  isActive
                    ? clsx('font-semibold', tab.activeClass)
                    : `
                      font-medium text-neutral-500
                      hover:text-neutral-700
                      dark:text-neutral-400
                      dark:hover:text-neutral-300
                    `,
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="univer-active-tab"
                    className={`
                      absolute inset-0 rounded-full bg-white shadow-xs
                      dark:bg-neutral-700
                    `}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className="size-3.5" />
                  <span
                    className="
                      hidden
                      md:inline
                    "
                  >
                    {tab.fullLabel}
                  </span>
                  <span className="md:hidden">{tab.label}</span>
                </span>
              </button>
            )
          })}
        </div>
      </header>

      {/* Playground Container */}
      <div
        className="relative mx-auto h-160 w-7xl max-w-full overflow-hidden rounded-xl p-0.5 shadow-xl"
      >
        {/* Mask / Loading */}
        <AnimatePresence>
          {!steady && (
            <motion.div
              className={`
                pointer-events-auto absolute inset-0 z-10 flex size-full items-center justify-center bg-white/30
                backdrop-blur-sm
                dark:bg-neutral-900/30
              `}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Spinner />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Univer Container */}
        <div
          className={clsx('relative z-1 size-full blur-3xl transition-all duration-300', {
            'blur-none': steady,
          })}
        >
          <div ref={divRef} className="h-full" />
        </div>

        {/* Border Beam */}
        <BorderBeam
          key={type}
          delay={0}
          size={600}
          borderWidth={2}
          colorFrom={tabs[activeIndex].beamColor}
          colorTo={tabs[activeIndex].beamColor}
          className="opacity-40"
        />
      </div>
    </div>
  )
}
