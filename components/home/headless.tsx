'use client'

import { CheckIcon, CopyIcon, MonitorOffIcon, ServerIcon, Share2Icon, SparklesIcon } from 'lucide-react'
import { useState } from 'react'

import { BlurFade } from '@/components/magicui/blur-fade'
import { clsx } from '@/lib/clsx'

interface IProps {
  title: string
  subtitle: string
  feature1Title: string
  feature1Desc: string
  feature2Title: string
  feature2Desc: string
  feature3Title: string
  feature3Desc: string
  feature4Title: string
  feature4Desc: string
  copyLabel: string
  copiedLabel: string
  pluginLabel: string
  presetLabel: string
}

/* Simple syntax highlighting tokens */
function Kw({ children }: { children: React.ReactNode }) {
  return <span className="text-purple-600 dark:text-purple-400">{children}</span>
}
function Fn({ children }: { children: React.ReactNode }) {
  return <span className="text-blue-600 dark:text-blue-400">{children}</span>
}
function St({ children }: { children: React.ReactNode }) {
  return <span className="text-green-600 dark:text-green-400">{children}</span>
}
function Id({ children }: { children: React.ReactNode }) {
  return <span className="text-amber-600 dark:text-amber-400">{children}</span>
}
function Pr({ children }: { children: React.ReactNode }) {
  return <span className="text-cyan-600 dark:text-cyan-400">{children}</span>
}
function Co({ children }: { children: React.ReactNode }) {
  return <span className="text-neutral-400 dark:text-neutral-500">{children}</span>
}

const lb = '{'
const rb = '}'

const presetCode = `npm install @univerjs/presets @univerjs/preset-sheets-node-core

import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { UniverSheetsNodeCorePreset } from '@univerjs/preset-sheets-node-core'
import sheetsNodeCoreEnUS from '@univerjs/preset-sheets-node-core/locales/en-US'

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: mergeLocales(
      sheetsNodeCoreEnUS,
    ),
  },
  presets: [
    UniverSheetsNodeCorePreset(),
  ],
})

// Server-side document processing
const workbook = univerAPI.createWorkbook(data)
const snapshot = workbook.save()`

const pluginCode = `npm install @univerjs/core @univerjs/docs @univerjs/engine-formula @univerjs/engine-render @univerjs/sheets @univerjs/sheets-formula @univerjs/sheets-numfmt

import { LocaleType, mergeLocales, Univer, UniverInstanceType } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula'
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt'
import SheetsEnUS from '@univerjs/sheets/locale/en-US'

import '@univerjs/engine-formula/facade'
import '@univerjs/sheets/facade'
import '@univerjs/sheets-formula/facade'
import '@univerjs/sheets-numfmt/facade'

const univer = new Univer({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: mergeLocales(
      SheetsEnUS,
    ),
  },
})

univer.registerPlugin(UniverRenderEnginePlugin)
univer.registerPlugin(UniverFormulaEnginePlugin)
univer.registerPlugin(UniverDocsPlugin)
univer.registerPlugin(UniverSheetsPlugin)
univer.registerPlugin(UniverSheetsFormulaPlugin)
univer.registerPlugin(UniverSheetsNumfmtPlugin)

univer.createUnit(UniverInstanceType.UNIVER_SHEET, {})`

function PresetBlock() {
  return (
    <pre className="overflow-x-auto p-4 text-xs/relaxed">
      <code className="text-neutral-700 dark:text-neutral-300">
        <Kw>import</Kw> {lb} <Fn>createUniver</Fn>, <Fn>LocaleType</Fn>, <Fn>mergeLocales</Fn> {rb} <Kw>from</Kw>{' '}
        <St>&apos;@univerjs/presets&apos;</St>
        {'\n'}
        <Kw>import</Kw> {lb} <Fn>UniverSheetsNodeCorePreset</Fn> {rb} <Kw>from</Kw>{' '}
        <St>&apos;@univerjs/preset-sheets-node-core&apos;</St>
        {'\n'}
        <Kw>import</Kw> sheetsNodeCoreEnUS
        <Kw>from</Kw> <St>&apos;@univerjs/preset-sheets-node-core/locales/en-US&apos;</St>
        {'\n\n'}
        <Kw>const</Kw> {lb} <Id>univerAPI</Id> {rb} <Kw>=</Kw> <Fn>createUniver</Fn>({lb}
        {'\n  '}
        <Pr>locale</Pr>: <Fn>LocaleType</Fn>.<Id>EN_US</Id>,{'\n  '}
        <Pr>locales</Pr>: {lb}
        {'\n    '}[<Fn>LocaleType</Fn>.<Id>EN_US</Id>
        ]:
        <Fn>mergeLocales</Fn>({'\n      '}
        sheetsNodeCoreEnUS,
        {'\n    '}
        ),
        {'\n  '}
        {rb},{'\n  '}
        <Pr>presets</Pr>: [{'\n    '}
        <Fn>UniverSheetsNodeCorePreset</Fn>
        (),
        {'\n  '}
        ],
        {'\n'}
        {rb}){'\n\n'}
        <Co>{'// Server-side document processing'}</Co>
        {'\n'}
        <Kw>const</Kw> <Id>workbook</Id> <Kw>=</Kw> <Id>univerAPI</Id>.<Fn>createWorkbook</Fn>(<Id>data</Id>){'\n'}
        <Kw>const</Kw> <Id>snapshot</Id> <Kw>=</Kw> <Id>workbook</Id>.<Fn>save</Fn>
        ()
      </code>
    </pre>
  )
}

function PluginBlock() {
  return (
    <pre className="overflow-x-auto p-4 text-xs/relaxed">
      <code className="text-neutral-700 dark:text-neutral-300">
        <Kw>import</Kw> {lb} <Fn>LocaleType</Fn>, <Fn>mergeLocales</Fn>, <Fn>Univer</Fn>, <Fn>UniverInstanceType</Fn>{' '}
        {rb} <Kw>from</Kw> <St>&apos;@univerjs/core&apos;</St>
        {'\n'}
        <Kw>import</Kw> {lb} <Fn>FUniver</Fn> {rb} <Kw>from</Kw> <St>&apos;@univerjs/core/facade&apos;</St>
        {'\n'}
        <Kw>import</Kw> {lb} <Fn>UniverDocsPlugin</Fn> {rb} <Kw>from</Kw> <St>&apos;@univerjs/docs&apos;</St>
        {'\n'}
        <Kw>import</Kw> {lb} <Fn>UniverFormulaEnginePlugin</Fn> {rb} <Kw>from</Kw>{' '}
        <St>&apos;@univerjs/engine-formula&apos;</St>
        {'\n'}
        <Kw>import</Kw> {lb} <Fn>UniverRenderEnginePlugin</Fn> {rb} <Kw>from</Kw>{' '}
        <St>&apos;@univerjs/engine-render&apos;</St>
        {'\n'}
        <Kw>import</Kw> {lb} <Fn>UniverSheetsPlugin</Fn> {rb} <Kw>from</Kw> <St>&apos;@univerjs/sheets&apos;</St>
        {'\n'}
        <Kw>import</Kw> {lb} <Fn>UniverSheetsFormulaPlugin</Fn> {rb} <Kw>from</Kw>{' '}
        <St>&apos;@univerjs/sheets-formula&apos;</St>
        {'\n'}
        <Kw>import</Kw> {lb} <Fn>UniverSheetsNumfmtPlugin</Fn> {rb} <Kw>from</Kw>{' '}
        <St>&apos;@univerjs/sheets-numfmt&apos;</St>
        {'\n'}
        <Kw>import</Kw> SheetsEnUS
        <Kw>from</Kw> <St>&apos;@univerjs/sheets/locale/en-US&apos;</St>
        {'\n\n'}
        <Kw>import</Kw> <St>&apos;@univerjs/engine-formula/facade&apos;</St>
        {'\n'}
        <Kw>import</Kw> <St>&apos;@univerjs/sheets/facade&apos;</St>
        {'\n'}
        <Kw>import</Kw> <St>&apos;@univerjs/sheets-formula/facade&apos;</St>
        {'\n'}
        <Kw>import</Kw> <St>&apos;@univerjs/sheets-numfmt/facade&apos;</St>
        {'\n\n'}
        <Kw>const</Kw> <Id>univer</Id> <Kw>=</Kw> <Kw>new</Kw> <Fn>Univer</Fn>({lb}
        {'\n  '}
        <Pr>locale</Pr>: <Fn>LocaleType</Fn>.<Id>EN_US</Id>,{'\n  '}
        <Pr>locales</Pr>: {lb}
        {'\n    '}[<Fn>LocaleType</Fn>.<Id>EN_US</Id>
        ]:
        <Fn>mergeLocales</Fn>({'\n      '}
        SheetsEnUS,
        {'\n    '}
        ),
        {'\n  '}
        {rb},{'\n'}
        {rb}){'\n\n'}
        <Id>univer</Id>.<Fn>registerPlugin</Fn>(<Id>UniverRenderEnginePlugin</Id>){'\n'}
        <Id>univer</Id>.<Fn>registerPlugin</Fn>(<Id>UniverFormulaEnginePlugin</Id>){'\n'}
        <Id>univer</Id>.<Fn>registerPlugin</Fn>(<Id>UniverDocsPlugin</Id>){'\n'}
        <Id>univer</Id>.<Fn>registerPlugin</Fn>(<Id>UniverSheetsPlugin</Id>){'\n'}
        <Id>univer</Id>.<Fn>registerPlugin</Fn>(<Id>UniverSheetsFormulaPlugin</Id>){'\n'}
        <Id>univer</Id>.<Fn>registerPlugin</Fn>(<Id>UniverSheetsNumfmtPlugin</Id>){'\n\n'}
        <Id>univer</Id>.<Fn>createUnit</Fn>(<Id>UniverInstanceType</Id>.<Id>UNIVER_SHEET</Id>,{lb}
        {rb})
      </code>
    </pre>
  )
}

export function Headless(props: IProps) {
  const {
    title,
    subtitle,
    feature1Title,
    feature1Desc,
    feature2Title,
    feature2Desc,
    feature3Title,
    feature3Desc,
    feature4Title,
    feature4Desc,
    copyLabel,
    copiedLabel,
    pluginLabel,
    presetLabel,
  } = props

  const [mode, setMode] = useState<'preset' | 'plugin'>('preset')
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(mode === 'preset' ? presetCode : pluginCode)
      setCopied(true)
      setTimeout(setCopied, 2000, false)
    } catch (error) {
      console.error('Failed to copy code', error)
    }
  }

  const features = [
    {
      icon: <ServerIcon className="size-5 text-emerald-600 dark:text-emerald-400" />,
      title: feature1Title,
      desc: feature1Desc,
    },
    {
      icon: <MonitorOffIcon className="size-5 text-blue-600 dark:text-blue-400" />,
      title: feature2Title,
      desc: feature2Desc,
    },
    {
      icon: <Share2Icon className="size-5 text-amber-600 dark:text-amber-400" />,
      title: feature3Title,
      desc: feature3Desc,
    },
    {
      icon: <SparklesIcon className="size-5 text-violet-600 dark:text-violet-400" />,
      title: feature4Title,
      desc: feature4Desc,
    },
  ]

  const tabs = [
    { key: 'preset' as const, label: presetLabel },
    { key: 'plugin' as const, label: pluginLabel },
  ]

  return (
    <BlurFade inView className="w-full max-w-7xl">
      <section
        id="headless"
        aria-labelledby="headless-title"
        className="grid w-full scroll-mt-24 items-center gap-10 px-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20"
      >
        <div className="lg:order-2">
          <h2 id="headless-title" className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </h2>
          <p className="mt-4 text-sm/relaxed text-neutral-600 dark:text-neutral-400">{subtitle}</p>
          <div className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title}>
                {feature.icon}
                <h3 className="mt-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200">{feature.title}</h3>
                <p className="mt-2 text-sm/relaxed text-neutral-600 dark:text-neutral-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Code Block */}
        <BlurFade inView delay={0.15} className="min-w-0 lg:order-1">
          <div className="relative min-w-0 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/70 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/70">
            {/* Header with tabs */}
            <div className="flex items-center justify-between border-b border-neutral-200/50 px-4 py-3 dark:border-neutral-700/50">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="block size-2.5 rounded-full bg-red-400/80" />
                  <span className="block size-2.5 rounded-full bg-amber-400/80" />
                  <span className="block size-2.5 rounded-full bg-green-400/80" />
                </div>
                {/* Mode switcher */}
                <div className="relative grid grid-cols-2 rounded-full bg-neutral-100 p-0.5 dark:bg-neutral-800">
                  {tabs.map((tab) => {
                    const isActive = mode === tab.key
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setMode(tab.key)}
                        className={clsx(
                          'relative z-10 min-w-16 rounded-full px-3 py-1 text-xs font-medium transition-colors',
                          isActive
                            ? `text-neutral-800 dark:text-neutral-100`
                            : `text-neutral-500 dark:text-neutral-400`,
                        )}
                      >
                        {isActive && (
                          <div className="absolute inset-0 rounded-full bg-white shadow-sm dark:bg-neutral-700" />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 hover:dark:bg-neutral-800 hover:dark:text-neutral-200"
                title={copied ? copiedLabel : copyLabel}
              >
                {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
                {copied ? copiedLabel : copyLabel}
              </button>
            </div>
            <div className="relative h-[420px] overflow-hidden">
              {mode === 'preset' ? <PresetBlock /> : <PluginBlock />}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-white to-transparent dark:from-neutral-950" />
            </div>
          </div>
        </BlurFade>
      </section>
    </BlurFade>
  )
}
