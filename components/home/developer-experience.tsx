'use client'

import {
  CheckIcon,
  CopyIcon,
  GitBranchIcon,
  MonitorIcon,
  PackageIcon,
  SettingsIcon,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { BlurFade } from '@/components/magicui/blur-fade'
import { clsx } from '@/lib/clsx'

interface IProps {
  title: string
  subtitle: string
  step1Title: string
  step1Desc: string
  step2Title: string
  step2Desc: string
  step3Title: string
  step3Desc: string
  step4Title: string
  step4Desc: string
  copyLabel: string
  copiedLabel: string
  presetLabel: string
  pluginLabel: string
}

/* Simple syntax highlighting tokens */
function Kw({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="
        text-purple-600
        dark:text-purple-400
      "
    >
      {children}
    </span>
  )
}
function St({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="
        text-green-600
        dark:text-green-400
      "
    >
      {children}
    </span>
  )
}
function Fn({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="
        text-blue-600
        dark:text-blue-400
      "
    >
      {children}
    </span>
  )
}
function Co({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="
        text-neutral-400
        dark:text-neutral-500
      "
    >
      {children}
    </span>
  )
}
function Pr({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="
        text-cyan-600
        dark:text-cyan-400
      "
    >
      {children}
    </span>
  )
}
function Id({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="
        text-amber-600
        dark:text-amber-400
      "
    >
      {children}
    </span>
  )
}

const lb = '{'
const rb = '}'

const presetCode = `npm install @univerjs/presets @univerjs/preset-sheets-core

import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'

import '@univerjs/preset-sheets-core/lib/index.css'

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: mergeLocales([sheetsCoreEnUS]),
  },
  presets: [
    UniverSheetsCorePreset({
      container: 'app',
    }),
  ],
})

univerAPI.createWorkbook(data)`

const pluginCode = `npm install @univerjs/core @univerjs/design @univerjs/docs @univerjs/docs-ui @univerjs/engine-formula @univerjs/engine-render @univerjs/sheets @univerjs/sheets-formula @univerjs/sheets-formula-ui @univerjs/sheets-numfmt @univerjs/sheets-numfmt-ui @univerjs/sheets-ui @univerjs/ui react react-dom rxjs

import { LocaleType, mergeLocales, Univer, UniverInstanceType } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula'
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui'
import SheetsFormulaUIEnUS from '@univerjs/sheets-formula-ui/locale/en-US'
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt'
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui'
import SheetsNumfmtUIEnUS from '@univerjs/sheets-numfmt-ui/locale/en-US'
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui'
import SheetsUIEnUS from '@univerjs/sheets-ui/locale/en-US'
import SheetsEnUS from '@univerjs/sheets/locale/en-US'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import '@univerjs/engine-formula/facade'
import '@univerjs/ui/facade'
import '@univerjs/docs-ui/facade'
import '@univerjs/sheets/facade'
import '@univerjs/sheets-ui/facade'
import '@univerjs/sheets-formula/facade'
import '@univerjs/sheets-numfmt/facade'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs/sheets-numfmt-ui/lib/index.css'

const univer = new Univer({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: mergeLocales(
      DesignEnUS,
      UIEnUS,
      DocsUIEnUS,
      SheetsEnUS,
      SheetsUIEnUS,
      SheetsFormulaUIEnUS,
      SheetsNumfmtUIEnUS,
    ),
  },
})

univer.registerPlugin(UniverRenderEnginePlugin)
univer.registerPlugin(UniverFormulaEnginePlugin)
univer.registerPlugin(UniverUIPlugin, { container: 'app' })
univer.registerPlugin(UniverDocsPlugin)
univer.registerPlugin(UniverDocsUIPlugin)
univer.registerPlugin(UniverSheetsPlugin)
univer.registerPlugin(UniverSheetsUIPlugin)
univer.registerPlugin(UniverSheetsFormulaPlugin)
univer.registerPlugin(UniverSheetsFormulaUIPlugin)
univer.registerPlugin(UniverSheetsNumfmtPlugin)
univer.registerPlugin(UniverSheetsNumfmtUIPlugin)

univer.createUnit(UniverInstanceType.UNIVER_SHEET, {})

const univerAPI = FUniver.newAPI(univer)`

function PresetBlock() {
  return (
    <pre className="overflow-x-auto p-4 text-xs/relaxed">
      <code
        className="
          text-neutral-700
          dark:text-neutral-300
        "
      >
        <Co># npm install @univerjs/presets @univerjs/preset-sheets-core</Co>
        {'\n\n'}
        <Kw>import</Kw>
        {' '}
        {lb}
        {' '}
        <Fn>createUniver</Fn>
        ,
        {' '}
        <Fn>LocaleType</Fn>
        ,
        {' '}
        <Fn>mergeLocales</Fn>
        {' '}
        {rb}
        {' '}
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/presets&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        {lb}
        {' '}
        <Fn>UniverSheetsCorePreset</Fn>
        {' '}
        {rb}
        {' '}
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/preset-sheets-core&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        sheetsCoreEnUS
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/preset-sheets-core/locales/en-US&apos;</St>
        {'\n\n'}
        <Kw>import</Kw>
        {' '}
        <St>&apos;@univerjs/preset-sheets-core/lib/index.css&apos;</St>
        {'\n\n'}
        <Kw>const</Kw>
        {' '}
        {lb}
        {' '}
        <Id>univerAPI</Id>
        {' '}
        {rb}
        {' '}
        <Kw>=</Kw>
        {' '}
        <Fn>createUniver</Fn>
        (
        {lb}
        {'\n  '}
        <Pr>locale</Pr>
        :
        {' '}
        <Fn>LocaleType</Fn>
        .
        <Id>EN_US</Id>
        ,
        {'\n  '}
        <Pr>locales</Pr>
        :
        {' '}
        {lb}
        {'\n    '}
        [
        <Fn>LocaleType</Fn>
        .
        <Id>EN_US</Id>
        ]:
        <Fn>mergeLocales</Fn>
        ([sheetsCoreEnUS]),
        {'\n  '}
        {rb}
        ,
        {'\n  '}
        <Pr>presets</Pr>
        : [
        {lb}
        {'\n    '}
        <Fn>UniverSheetsCorePreset</Fn>
        (
        {lb}
        {'\n      '}
        <Pr>container</Pr>
        :
        {' '}
        <St>&apos;app&apos;</St>
        ,
        {'\n    '}
        {rb}
        ),
        {'\n  '}
        {rb}
        ],
        {'\n'}
        {rb}
        )
        {'\n\n'}
        <Id>univerAPI</Id>
        .
        <Fn>createWorkbook</Fn>
        (
        <Id>data</Id>
        )
      </code>
    </pre>
  )
}

function PluginBlock() {
  return (
    <pre className="overflow-x-auto p-4 text-xs/relaxed">
      <code
        className="
          text-neutral-700
          dark:text-neutral-300
        "
      >
        <Co># npm install @univerjs/core @univerjs/design @univerjs/docs @univerjs/docs-ui @univerjs/engine-formula @univerjs/engine-render @univerjs/sheets @univerjs/sheets-formula @univerjs/sheets-formula-ui @univerjs/sheets-numfmt @univerjs/sheets-numfmt-ui @univerjs/sheets-ui @univerjs/ui react react-dom rxjs</Co>
        {'\n\n'}
        <Kw>import</Kw>
        {' '}
        {lb}
        {' '}
        <Fn>LocaleType</Fn>
        ,
        {' '}
        <Fn>mergeLocales</Fn>
        ,
        {' '}
        <Fn>Univer</Fn>
        ,
        {' '}
        <Fn>UniverInstanceType</Fn>
        {' '}
        {rb}
        {' '}
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/core&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        {lb}
        {' '}
        <Fn>FUniver</Fn>
        {' '}
        {rb}
        {' '}
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/core/facade&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        DesignEnUS
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/design/locale/en-US&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        {lb}
        {' '}
        <Fn>UniverDocsPlugin</Fn>
        {' '}
        {rb}
        {' '}
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/docs&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        {lb}
        {' '}
        <Fn>UniverDocsUIPlugin</Fn>
        {' '}
        {rb}
        {' '}
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/docs-ui&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        DocsUIEnUS
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/docs-ui/locale/en-US&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        {lb}
        {' '}
        <Fn>UniverFormulaEnginePlugin</Fn>
        {' '}
        {rb}
        {' '}
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/engine-formula&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        {lb}
        {' '}
        <Fn>UniverRenderEnginePlugin</Fn>
        {' '}
        {rb}
        {' '}
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/engine-render&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        {lb}
        {' '}
        <Fn>UniverSheetsPlugin</Fn>
        {' '}
        {rb}
        {' '}
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/sheets&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        {lb}
        {' '}
        <Fn>UniverSheetsFormulaPlugin</Fn>
        {' '}
        {rb}
        {' '}
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/sheets-formula&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        {lb}
        {' '}
        <Fn>UniverSheetsFormulaUIPlugin</Fn>
        {' '}
        {rb}
        {' '}
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/sheets-formula-ui&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        SheetsFormulaUIEnUS
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/sheets-formula-ui/locale/en-US&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        {lb}
        {' '}
        <Fn>UniverSheetsNumfmtPlugin</Fn>
        {' '}
        {rb}
        {' '}
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/sheets-numfmt&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        {lb}
        {' '}
        <Fn>UniverSheetsNumfmtUIPlugin</Fn>
        {' '}
        {rb}
        {' '}
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/sheets-numfmt-ui&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        SheetsNumfmtUIEnUS
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/sheets-numfmt-ui/locale/en-US&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        {lb}
        {' '}
        <Fn>UniverSheetsUIPlugin</Fn>
        {' '}
        {rb}
        {' '}
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/sheets-ui&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        SheetsUIEnUS
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/sheets-ui/locale/en-US&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        SheetsEnUS
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/sheets/locale/en-US&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        {lb}
        {' '}
        <Fn>UniverUIPlugin</Fn>
        {' '}
        {rb}
        {' '}
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/ui&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        UIEnUS
        <Kw>from</Kw>
        {' '}
        <St>&apos;@univerjs/ui/locale/en-US&apos;</St>
        {'\n\n'}
        <Kw>import</Kw>
        {' '}
        <St>&apos;@univerjs/engine-formula/facade&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        <St>&apos;@univerjs/ui/facade&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        <St>&apos;@univerjs/docs-ui/facade&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        <St>&apos;@univerjs/sheets/facade&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        <St>&apos;@univerjs/sheets-ui/facade&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        <St>&apos;@univerjs/sheets-formula/facade&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        <St>&apos;@univerjs/sheets-numfmt/facade&apos;</St>
        {'\n\n'}
        <Kw>import</Kw>
        {' '}
        <St>&apos;@univerjs/design/lib/index.css&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        <St>&apos;@univerjs/ui/lib/index.css&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        <St>&apos;@univerjs/docs-ui/lib/index.css&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        <St>&apos;@univerjs/sheets-ui/lib/index.css&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        <St>&apos;@univerjs/sheets-formula-ui/lib/index.css&apos;</St>
        {'\n'}
        <Kw>import</Kw>
        {' '}
        <St>&apos;@univerjs/sheets-numfmt-ui/lib/index.css&apos;</St>
        {'\n\n'}
        <Kw>const</Kw>
        {' '}
        <Id>univer</Id>
        {' '}
        <Kw>=</Kw>
        {' '}
        <Kw>new</Kw>
        {' '}
        <Fn>Univer</Fn>
        (
        {lb}
        {'\n  '}
        <Pr>locale</Pr>
        :
        {' '}
        <Fn>LocaleType</Fn>
        .
        <Id>EN_US</Id>
        ,
        {'\n  '}
        <Pr>locales</Pr>
        :
        {' '}
        {lb}
        {'\n    '}
        [
        <Fn>LocaleType</Fn>
        .
        <Id>EN_US</Id>
        ]:
        <Fn>mergeLocales</Fn>
        ([
        {'\n      '}
        DesignEnUS,
        {'\n      '}
        UIEnUS,
        {'\n      '}
        DocsUIEnUS,
        {'\n      '}
        SheetsEnUS,
        {'\n      '}
        SheetsUIEnUS,
        {'\n      '}
        SheetsFormulaUIEnUS,
        {'\n      '}
        SheetsNumfmtUIEnUS,
        {'\n    '}
        ]),
        {'\n  '}
        {rb}
        ,
        {'\n'}
        {rb}
        )
        {'\n\n'}
        <Id>univer</Id>
        .
        <Fn>registerPlugin</Fn>
        (
        <Id>UniverRenderEnginePlugin</Id>
        )
        {'\n'}
        <Id>univer</Id>
        .
        <Fn>registerPlugin</Fn>
        (
        <Id>UniverFormulaEnginePlugin</Id>
        )
        {'\n'}
        <Id>univer</Id>
        .
        <Fn>registerPlugin</Fn>
        (
        <Id>UniverUIPlugin</Id>
        ,
        {lb}
        {' '}
        <Pr>container</Pr>
        :
        {' '}
        <St>&apos;app&apos;</St>
        {' '}
        {rb}
        )
        {'\n'}
        <Id>univer</Id>
        .
        <Fn>registerPlugin</Fn>
        (
        <Id>UniverDocsPlugin</Id>
        )
        {'\n'}
        <Id>univer</Id>
        .
        <Fn>registerPlugin</Fn>
        (
        <Id>UniverDocsUIPlugin</Id>
        )
        {'\n'}
        <Id>univer</Id>
        .
        <Fn>registerPlugin</Fn>
        (
        <Id>UniverSheetsPlugin</Id>
        )
        {'\n'}
        <Id>univer</Id>
        .
        <Fn>registerPlugin</Fn>
        (
        <Id>UniverSheetsUIPlugin</Id>
        )
        {'\n'}
        <Id>univer</Id>
        .
        <Fn>registerPlugin</Fn>
        (
        <Id>UniverSheetsFormulaPlugin</Id>
        )
        {'\n'}
        <Id>univer</Id>
        .
        <Fn>registerPlugin</Fn>
        (
        <Id>UniverSheetsFormulaUIPlugin</Id>
        )
        {'\n'}
        <Id>univer</Id>
        .
        <Fn>registerPlugin</Fn>
        (
        <Id>UniverSheetsNumfmtPlugin</Id>
        )
        {'\n'}
        <Id>univer</Id>
        .
        <Fn>registerPlugin</Fn>
        (
        <Id>UniverSheetsNumfmtUIPlugin</Id>
        )
        {'\n\n'}
        <Id>univer</Id>
        .
        <Fn>createUnit</Fn>
        (
        <Id>UniverInstanceType</Id>
        .
        <Id>UNIVER_SHEET</Id>
        ,
        {lb}
        {rb}
        )
        {'\n\n'}
        <Kw>const</Kw>
        {' '}
        <Id>univerAPI</Id>
        {' '}
        <Kw>=</Kw>
        {' '}
        <Fn>FUniver</Fn>
        .
        <Fn>newAPI</Fn>
        (
        <Id>univer</Id>
        )
      </code>
    </pre>
  )
}

export function DeveloperExperience(props: IProps) {
  const {
    title,
    subtitle,
    step1Title,
    step1Desc,
    step2Title,
    step2Desc,
    step3Title,
    step3Desc,
    step4Title,
    step4Desc,
    copyLabel,
    copiedLabel,
    presetLabel,
    pluginLabel,
  } = props

  const [mode, setMode] = useState<'preset' | 'plugin'>('preset')
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(mode === 'preset' ? presetCode : pluginCode)
    setCopied(true)
    setTimeout(setCopied, 2000, false)
  }

  const steps = [
    {
      num: '01',
      icon: <PackageIcon className="size-4" />,
      title: step1Title,
      desc: step1Desc,
    },
    {
      num: '02',
      icon: <GitBranchIcon className="size-4" />,
      title: step2Title,
      desc: step2Desc,
    },
    {
      num: '03',
      icon: <SettingsIcon className="size-4" />,
      title: step3Title,
      desc: step3Desc,
    },
    {
      num: '04',
      icon: <MonitorIcon className="size-4" />,
      title: step4Title,
      desc: step4Desc,
    },
  ]

  const tabs = [
    { key: 'preset' as const, label: presetLabel },
    { key: 'plugin' as const, label: pluginLabel },
  ]

  return (
    <BlurFade inView className="w-full max-w-7xl">
      <section className="w-full px-4">
        <div className="mb-8 w-full text-center">
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
            grid w-full items-start gap-6
            lg:grid-cols-2
          "
        >
          {/* Terminal */}
          <BlurFade
            inView
            delay={0.1}
            className="
              min-w-0
              lg:col-span-1
            "
          >
            <div
              className={`
                relative min-w-0 overflow-hidden rounded-2xl bg-white/30 shadow-xs ring-4 ring-neutral-100/20
                backdrop-blur-sm ring-inset
                dark:bg-neutral-900/50 dark:ring-neutral-600/20
              `}
            >
              {/* Header with tabs */}
              <div
                className="
                  flex items-center justify-between border-b border-neutral-200/50 px-4 py-3
                  dark:border-neutral-700/50
                "
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="block size-2.5 rounded-full bg-red-400/80" />
                    <span className="block size-2.5 rounded-full bg-amber-400/80" />
                    <span className="block size-2.5 rounded-full bg-green-400/80" />
                  </div>
                  {/* Mode switcher — equal width tabs */}
                  <div
                    className="
                      relative grid grid-cols-2 rounded-full bg-neutral-100 p-0.5
                      dark:bg-neutral-800
                    "
                  >
                    {tabs.map(tab => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => {
                          setMode(tab.key)
                          setCopied(false)
                        }}
                        className={clsx(
                          'relative z-10 min-w-18 rounded-full px-3 py-1 text-xs font-medium transition-colors',
                          mode === tab.key
                            ? `
                              text-neutral-800
                              dark:text-neutral-100
                            `
                            : `
                              text-neutral-500
                              dark:text-neutral-400
                            `,
                        )}
                      >
                        {mode === tab.key && (
                          <motion.div
                            layoutId="dev-active-tab"
                            className="
                              absolute inset-0 rounded-full bg-white shadow-sm
                              dark:bg-neutral-700
                            "
                            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`
                    inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-neutral-500
                    transition-colors
                    hover:bg-neutral-100 hover:text-neutral-700
                    dark:text-neutral-400
                    dark:hover:bg-neutral-800 dark:hover:text-neutral-200
                  `}
                  title={copied ? copiedLabel : copyLabel}
                >
                  {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
                  {copied ? copiedLabel : copyLabel}
                </button>
              </div>
              <div className="relative h-105 overflow-hidden">
                {mode === 'preset' ? <PresetBlock /> : <PluginBlock />}
                <div
                  className="
                    pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-white to-transparent
                    dark:from-neutral-950
                  "
                />
              </div>
            </div>
          </BlurFade>

          {/* Steps + Frameworks */}
          <div
            className="
              flex min-w-0 flex-col gap-6 self-center
              lg:col-span-1
            "
          >
            {/* Steps */}
            <div className="flex flex-col gap-5">
              {steps.map((step, index) => (
                <BlurFade key={step.num} inView delay={0.15 + index * 0.06}>
                  <div className="flex gap-4">
                    <div
                      className={`
                        flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600
                        dark:bg-neutral-800 dark:text-neutral-400
                      `}
                    >
                      {step.icon}
                    </div>
                    <div>
                      <h3
                        className="
                          text-sm font-semibold text-neutral-800
                          dark:text-neutral-200
                        "
                      >
                        {step.title}
                      </h3>
                      <p
                        className="
                          mt-1 text-sm/relaxed text-neutral-600
                          dark:text-neutral-400
                        "
                      >
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </BlurFade>
              ))}
            </div>
          </div>
        </div>
      </section>
    </BlurFade>
  )
}
