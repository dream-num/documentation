'use client'

import {
  BoldIcon,
  CopyIcon,
  DatabaseIcon,
  EyeIcon,
  FontColorDoubleIcon,
  FunctionIcon,
  HomeIcon,
  ItalicIcon,
  MergeAllIcon,
  MoreDownIcon,
  PaintIcon,
  PercentIcon,
  RedoIcon,
  UnderlineIcon,
  UndoIcon,
} from '@univerjs/icons'
import { useState } from 'react'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { clsx } from '@/lib/clsx'

const ribbonTabs = [36, 42, 54, 34, 38]
const historyIcons = [
  ['undo', UndoIcon],
  ['redo', RedoIcon],
  ['paint', PaintIcon],
] as const
const formatIcons = [
  ['bold', BoldIcon],
  ['italic', ItalicIcon],
  ['underline', UnderlineIcon],
  ['font-color', FontColorDoubleIcon],
] as const
const layoutIcons = [
  ['merge', MergeAllIcon],
  ['percent', PercentIcon],
  ['copy', CopyIcon],
] as const
const extraIcons = [
  ['function', FunctionIcon],
  ['database', DatabaseIcon],
  ['view', EyeIcon],
] as const
const gridFormatIcons = [...formatIcons, ['percent', PercentIcon], ['paint', PaintIcon], ['copy', CopyIcon]] as const
const gridLayoutIcons = [
  ...layoutIcons,
  ['function', FunctionIcon],
  ['database', DatabaseIcon],
  ['view', EyeIcon],
  ['more', MoreDownIcon],
] as const

export default function RibbonStyle() {
  const [ribbonType, setRibbonType] = useState<string>('classic')

  return (
    <div>
      <Tabs className="mb-2" defaultValue="classic" onValueChange={setRibbonType}>
        <TabsList>
          <TabsTrigger value="classic">classic</TabsTrigger>
          <TabsTrigger value="grid">grid</TabsTrigger>
          <TabsTrigger value="collapsed">collapsed</TabsTrigger>
          <TabsTrigger value="simple">simple</TabsTrigger>
        </TabsList>
      </Tabs>

      <div
        aria-hidden="true"
        data-ribbon-preview={ribbonType}
        className="overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
      >
        {(ribbonType === 'classic' || ribbonType === 'grid') && (
          <div
            className={clsx('flex h-9 bg-neutral-100 dark:bg-neutral-900', {
              'items-center justify-center gap-1 px-3': ribbonType === 'classic',
              'items-end justify-start px-2': ribbonType === 'grid',
            })}
          >
            {ribbonTabs.map((width, index) => (
              <span
                key={width}
                className={clsx('flex items-center justify-center px-3 text-neutral-400 dark:text-neutral-500', {
                  'h-7 rounded-sm': ribbonType === 'classic',
                  'h-9 border-b-[3px]': ribbonType === 'grid',
                  'bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-950 dark:text-blue-300':
                    ribbonType === 'classic' && index === 0,
                  'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-300':
                    ribbonType === 'grid' && index === 0,
                  'border-transparent': ribbonType === 'grid' && index !== 0,
                })}
              >
                <span className="h-1.5 rounded-full bg-current" style={{ width }} />
              </span>
            ))}
          </div>
        )}

        {ribbonType === 'grid' ? (
          <div className="flex h-[88px] overflow-hidden border-t border-neutral-200 bg-neutral-50 px-2 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="grid shrink-0 grid-flow-col grid-rows-[1.5rem_1.5rem] content-center items-center gap-x-1 gap-y-2 border-r border-neutral-200 px-2 dark:border-neutral-700">
              <span className="flex size-6 items-center justify-center rounded text-neutral-600 dark:text-neutral-300">
                <UndoIcon className="size-4" />
              </span>
              <span className="flex size-6 items-center justify-center rounded text-neutral-600 dark:text-neutral-300">
                <RedoIcon className="size-4" />
              </span>
              <span className="flex h-6 w-20 items-center gap-1.5 rounded px-1.5 text-neutral-600 dark:text-neutral-300">
                <PaintIcon className="size-4 shrink-0" />
                <span className="h-1.5 flex-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
              </span>
              <span className="flex h-6 w-20 items-center gap-1.5 rounded px-1.5 text-neutral-600 dark:text-neutral-300">
                <CopyIcon className="size-4 shrink-0" />
                <span className="h-1.5 flex-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
              </span>
            </div>

            <div className="grid shrink-0 grid-cols-[repeat(7,1.5rem)] grid-rows-[1.5rem_1.5rem] content-center items-center gap-x-1 gap-y-2 border-r border-neutral-200 px-2 dark:border-neutral-700">
              <span className="col-span-4 flex h-6 items-center rounded border border-neutral-200 bg-white px-2 dark:border-neutral-700 dark:bg-neutral-800">
                <span className="h-1.5 w-12 rounded-full bg-neutral-300 dark:bg-neutral-600" />
              </span>
              <span className="flex h-6 items-center justify-center rounded border border-neutral-200 bg-white text-[9px] text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                17
              </span>
              <span className="flex size-6 items-center justify-center rounded text-neutral-600 dark:text-neutral-300">
                A+
              </span>
              <span className="flex size-6 items-center justify-center rounded text-neutral-600 dark:text-neutral-300">
                A−
              </span>
              {gridFormatIcons.map(([key, Icon]) => (
                <span
                  key={key}
                  className="flex size-6 items-center justify-center rounded text-neutral-600 dark:text-neutral-300"
                >
                  <Icon className="size-4" />
                </span>
              ))}
            </div>

            <div className="grid shrink-0 grid-flow-col grid-rows-[1.5rem_1.5rem] content-center items-center gap-x-2 gap-y-2 border-r border-neutral-200 px-2 dark:border-neutral-700">
              {gridLayoutIcons.map(([key, Icon]) => (
                <span
                  key={key}
                  className="flex size-6 items-center justify-center rounded text-neutral-600 dark:text-neutral-300"
                >
                  <Icon className="size-4" />
                </span>
              ))}
            </div>

            <div className="flex min-w-20 shrink-0 items-center justify-center px-2">
              <span className="flex h-16 w-14 flex-col items-center justify-center gap-1 rounded text-neutral-600 dark:text-neutral-300">
                <HomeIcon className="size-7" />
                <span className="h-1.5 w-9 rounded-full bg-neutral-300 dark:bg-neutral-600" />
              </span>
            </div>
          </div>
        ) : (
          <div className="flex h-10 items-center overflow-hidden border-t border-neutral-200 bg-white px-3 dark:border-neutral-800 dark:bg-neutral-950">
            {ribbonType === 'collapsed' && (
              <span className="mr-2 flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-neutral-700 px-2.5 text-white dark:bg-neutral-200 dark:text-neutral-800">
                <HomeIcon className="size-3.5" />
                <span className="h-1.5 w-7 rounded-full bg-current opacity-70" />
                <MoreDownIcon className="size-3.5" />
              </span>
            )}

            <div
              className={clsx('flex min-w-0 flex-1 items-center overflow-hidden', {
                'justify-center': ribbonType === 'classic',
              })}
            >
              <div className="flex shrink-0 items-center gap-1 border-r border-neutral-200 px-2 dark:border-neutral-700">
                {historyIcons.map(([key, Icon]) => (
                  <span
                    key={key}
                    className="flex size-6 items-center justify-center rounded text-neutral-600 dark:text-neutral-300"
                  >
                    <Icon className="size-4" />
                  </span>
                ))}
              </div>

              <div className="flex shrink-0 items-center gap-1 border-r border-neutral-200 px-2 dark:border-neutral-700">
                <span className="flex h-6 w-16 items-center rounded border border-neutral-200 px-2 dark:border-neutral-700">
                  <span className="h-1.5 w-9 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                </span>
                {formatIcons.map(([key, Icon]) => (
                  <span
                    key={key}
                    className="flex size-6 items-center justify-center rounded text-neutral-600 dark:text-neutral-300"
                  >
                    <Icon className="size-4" />
                  </span>
                ))}
              </div>

              <div className="flex shrink-0 items-center gap-1 px-2">
                {layoutIcons.map(([key, Icon]) => (
                  <span
                    key={key}
                    className="flex size-6 items-center justify-center rounded text-neutral-600 dark:text-neutral-300"
                  >
                    <Icon className="size-4" />
                  </span>
                ))}
              </div>

              {ribbonType === 'simple' && (
                <div className="flex shrink-0 items-center gap-1 border-l border-neutral-200 px-2 dark:border-neutral-700">
                  {extraIcons.map(([key, Icon]) => (
                    <span
                      key={key}
                      className="flex size-6 items-center justify-center rounded text-neutral-600 dark:text-neutral-300"
                    >
                      <Icon className="size-4" />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
