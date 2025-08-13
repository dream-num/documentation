'use client'

import type { ReactNode } from 'react'
import { SiCss } from '@icons-pack/react-simple-icons'
import { LanguagesIcon, PlugZapIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Switch } from '@/components/animate-ui/radix/switch'
import { CopyButton } from '@/components/copy-button'
import { Tooltip } from '@/components/tooltip'
import { clsx } from '@/lib/clsx'

interface IProps {
  lang: string
  isPro?: boolean
  meta: {
    preset: Array<{
      client?: string
      locale?: string
      style?: string
    }>
    plugins?: Array<{
      client?: string
      locale?: string
      style?: string
      facade?: string
    }>
    server: string
  }
}

const locales: Record<string, Record<string, string>> = {
  'zh-CN': {
    'preset-mode': '预设模式',
    'plugin-mode': '插件模式',
    'preset-info': '预设信息',
    'plugins-info': '插件信息',
    'server-required': '需要服务端支持',
  },
  'en-US': {
    'preset-mode': 'Preset Mode',
    'plugin-mode': 'Plugin Mode',
    'preset-info': 'Preset Info',
    'plugins-info': 'Plugins Info',
    'server-required': 'Server Required',
  },
  'ja-JP': {
    'preset-mode': 'プリセットモード',
    'plugin-mode': 'プラグインモード',
    'preset-info': 'プリセット情報',
    'plugins-info': 'プラグイン情報',
    'server-required': 'サーバーが必要',
  },
}

function PackageInfo({ client, locale, style, facade }: { client?: string, locale?: string, style?: string, facade?: string }) {
  return (
    <div className="flex items-center gap-2">
      {client && (
        <code
          className={`
            text-xs text-neutral-600
            dark:text-neutral-300
          `}
        >
          {client}
        </code>
      )}
      {locale && (
        <CopyButton text={locale}>
          <Tooltip content={locale}>
            <LanguagesIcon
              className={`
                h-4 w-4 text-neutral-500
                dark:text-neutral-400
              `}
            />
          </Tooltip>
        </CopyButton>
      )}
      {style && (
        <CopyButton text={style}>
          <Tooltip content={style}>
            <SiCss
              className={`
                h-4 w-4 text-neutral-500
                dark:text-neutral-400
              `}
            />
          </Tooltip>
        </CopyButton>
      )}
      {facade && (
        <CopyButton text={facade}>
          <Tooltip content={facade}>
            <PlugZapIcon
              className={`
                h-4 w-4 text-neutral-500
                dark:text-neutral-400
              `}
            />
          </Tooltip>
        </CopyButton>
      )}
    </div>
  )
}

function Label({ children }: { children: ReactNode }) {
  return (
    <span
      className={`
        text-sm font-semibold text-neutral-600
        dark:text-neutral-300
      `}
    >
      {children}
    </span>
  )
}

export function MetaData(props: IProps) {
  const { lang, isPro = false, meta } = props
  const { preset = [], plugins = [], server = false } = meta

  const [mode, setMode] = useState<'preset' | 'plugin'>(preset.length > 0 ? 'preset' : 'plugin')

  const t = locales[lang] || locales['en-US']

  return (
    <div
      className={`
        grid gap-2 rounded-lg bg-neutral-100 shadow-md
        dark:bg-neutral-800
      `}
    >
      <div
        className={`
          flex items-center justify-between gap-2 border-b border-neutral-200 p-2 text-sm
          dark:border-neutral-600
        `}
      >
        <div className="flex items-center gap-2">
          <label
            className={clsx('cursor-pointer text-neutral-400', {
              'text-neutral-800 dark:text-white': mode === 'preset',
            })}
            onClick={() => preset.length && setMode('preset')}
          >
            {t['preset-mode']}
          </label>
          <Switch
            checked={mode === 'plugin'}
            disabled={preset.length === 0 || plugins.length === 0}
            onCheckedChange={(checked) => {
              setMode(checked ? 'plugin' : 'preset')
            }}
          />
          <label
            className={clsx('cursor-pointer text-neutral-400', {
              'text-neutral-800 dark:text-white': mode === 'plugin',
            })}
            onClick={() => plugins.length && setMode('plugin')}
          >
            {t['plugin-mode']}
          </label>
        </div>

        <div>
          {isPro && (
            <Link
              className={`
                inline-block rounded-md bg-gradient-to-b from-[#5357ED] to-[#40B9FF] p-[5px] text-xs font-medium
                text-white no-underline shadow-lg
                dark:from-[#1d1f54] dark:to-[#2d3048]
              `}
              href="/guides/pro"
            >
              Univer Pro
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-2 rounded-lg p-2">
        {/* Preset */}
        <div
          className={clsx('grid gap-2', {
            hidden: mode === 'plugin',
          })}
        >
          <Label>{t['preset-info']}</Label>
          <div
            className={`
              grid grid-cols-1 gap-2
              xl:grid-cols-2
            `}
          >
            {preset.map((item, index) => (
              <PackageInfo key={index} {...item} />
            ))}
          </div>
        </div>

        {/* Plugins */}
        <div
          className={clsx('grid gap-2', {
            hidden: mode === 'preset',
          })}
        >
          <Label>{t['plugins-info']}</Label>
          <div
            className={`
              grid grid-cols-1 gap-2
              xl:grid-cols-2
            `}
          >
            {plugins.map((item, index) => (
              <div key={index}>
                <PackageInfo {...item} />
              </div>
            ))}
          </div>
        </div>

        {/* Server */}
        <div className="grid gap-2">
          <Label>{t['server-required']}</Label>
          <div
            className={`
              text-sm text-neutral-600
              dark:text-neutral-300
            `}
          >
            {server}
          </div>
        </div>
      </div>
    </div>
  )
}
