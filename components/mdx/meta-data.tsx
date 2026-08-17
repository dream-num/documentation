'use client'

import {
  Box,
  Check,
  Languages,
  Palette,
  PlugZap,
  Puzzle,
  Server,
  Smartphone,
  SparkleIcon,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { useState } from 'react'

import { Tooltip } from '@/components/tooltip'
import { clsx } from '@/lib/clsx'
import { localizePath } from '@/lib/i18n'

const locales: Record<string, Record<string, string>> = {
  'zh-CN': {
    'preset-mode': '预设模式',
    'plugin-mode': '插件模式',
    'preset-info': '预设信息',
    'plugins-info': '插件信息',
    'mobile-support': '移动端支持',
    'mobile-support-desc': '提供针对触摸设备的 UI 适配',
    'server-required': '需要服务端',
    'server-required-desc': '部分功能依赖服务端支持',
    'server-optional': '可选服务端',
    'server-optional-desc': '可选接入服务端增强功能',
    copied: '已复制',
    locale: '语言包',
    style: '样式',
    facade: 'Facade',
  },
  'zh-TW': {
    'preset-mode': '預設模式',
    'plugin-mode': '插件模式',
    'preset-info': '預設信息',
    'plugins-info': '插件信息',
    'mobile-support': '行動端支援',
    'mobile-support-desc': '提供針對觸摸設備的 UI 適配',
    'server-required': '需要服務端',
    'server-required-desc': '部分功能依賴服務端支持',
    'server-optional': '可選服務端',
    'server-optional-desc': '可選接入服務端增強功能',
    copied: '已複製',
    locale: '語系包',
    style: '樣式',
    facade: 'Facade',
  },
  'en-US': {
    'preset-mode': 'Preset Mode',
    'plugin-mode': 'Plugin Mode',
    'preset-info': 'Preset Info',
    'plugins-info': 'Plugins Info',
    'mobile-support': 'Mobile Support',
    'mobile-support-desc': 'Optimized UI for touch devices',
    'server-required': 'Server Required',
    'server-required-desc': 'Depends on server-side capabilities',
    'server-optional': 'Server Optional',
    'server-optional-desc': 'Optional server for enhanced features',
    copied: 'Copied',
    locale: 'Locale',
    style: 'CSS',
    facade: 'Facade',
  },
  'ja-JP': {
    'preset-mode': 'プリセットモード',
    'plugin-mode': 'プラグインモード',
    'preset-info': 'プリセット情報',
    'plugins-info': 'プラグイン情報',
    'mobile-support': 'モバイルサポート',
    'mobile-support-desc': 'タッチデバイス向けUI最適化',
    'server-required': 'サーバーが必要',
    'server-required-desc': 'サーバー側の機能に依存',
    'server-optional': 'サーバー (任意)',
    'server-optional-desc': 'サーバー連携で機能拡張が可能',
    copied: 'コピーしました',
    locale: 'ロケール',
    style: 'スタイル',
    facade: 'Facade',
  },
}

function CopyableTag({ text, label, icon: Icon, successText }: { text: string, label: string, icon: any, successText: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(setCopied, 2000, false)
  }

  return (
    <Tooltip content={copied ? successText : text}>
      <button
        onClick={handleCopy}
        type="button"
        className={clsx(
          `
            group inline-flex cursor-pointer items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium
            transition-all outline-none
            focus-visible:ring-2 focus-visible:ring-primary/50
          `,
          copied
            ? `
              border-green-200 bg-green-50 text-green-600
              dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400
            `
            : `
              border-neutral-200 bg-white text-neutral-500
              hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700
              dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400
              dark:hover:border-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200
            `,
        )}
      >
        {copied ? <Check className="size-3" /> : <Icon className="size-3" />}
        <span>{label}</span>
      </button>
    </Tooltip>
  )
}

function PackageRow({
  client,
  locale,
  style,
  facade,
  t,
}: {
  client?: string
  locale?: string
  style?: string
  facade?: string
  t: Record<string, string>
}) {
  const [copied, setCopied] = useState(false)

  const handleCopyClient = () => {
    if (!client) return
    navigator.clipboard.writeText(client)
    setCopied(true)
    setTimeout(setCopied, 2000, false)
  }

  if (!client && !locale && !style && !facade) return null

  return (
    <div
      className="
        flex flex-col gap-1.5 border-b border-neutral-100 py-1.5
        last:border-0
        sm:flex-row sm:items-center sm:justify-between
        dark:border-neutral-800
      "
    >
      {client && (
        <div className="flex min-w-0 items-center">
          <Tooltip content={copied ? t.copied : client}>
            <button
              className="
                group relative flex max-w-full cursor-pointer items-center gap-1 rounded-sm bg-neutral-100 px-1.5 py-0.5
                font-mono text-xs text-neutral-700 transition-colors
                hover:bg-neutral-200
                dark:bg-neutral-900 dark:text-neutral-300
                dark:hover:bg-neutral-800
              "
              type="button"
              onClick={handleCopyClient}
            >
              <span className="truncate">{client}</span>
              {copied && (
                <Check className="size-3 text-green-500" />
              )}
            </button>
          </Tooltip>
        </div>
      )}

      <div className="flex flex-wrap gap-1">
        {locale && <CopyableTag text={locale} label={t.locale} icon={Languages} successText={t.copied} />}
        {style && <CopyableTag text={style} label={t.style} icon={Palette} successText={t.copied} />}
        {facade && <CopyableTag text={facade} label={t.facade} icon={PlugZap} successText={t.copied} />}
      </div>
    </div>
  )
}

function StatusBadge({ icon: Icon, label, desc, active }: { icon: any, label: string, desc: string, active?: boolean }) {
  if (!active) return null
  return (
    <div
      className="
        inline-flex items-center gap-2 rounded-md border border-neutral-100 bg-neutral-50 px-2.5 py-1.5
        dark:border-neutral-800 dark:bg-neutral-900/50
      "
    >
      <div
        className="
          flex size-6 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5
          dark:bg-neutral-800 dark:shadow-none dark:ring-white/10
        "
      >
        <Icon
          className="
            size-3 text-neutral-500
            dark:text-neutral-400
          "
        />
      </div>
      <div className="flex flex-col">
        <span
          className="
            text-[11px] leading-tight font-semibold text-neutral-700
            dark:text-neutral-200
          "
        >
          {label}
        </span>
        <span
          className="
            text-[10px] leading-tight text-neutral-500
            dark:text-neutral-400
          "
        >
          {desc}
        </span>
      </div>
    </div>
  )
}

export function MetaData(props: {
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
    server: boolean | 'optional'
    mobile?: boolean
  }
}) {
  const { lang, isPro = false, meta } = props
  const { preset = [], plugins = [], server = false, mobile = false } = meta

  // If we have presets, default to 'preset', otherwise 'plugin'.
  // If we have both, user can switch.
  const [mode, setMode] = useState<'preset' | 'plugin'>(preset.length > 0 ? 'preset' : 'plugin')

  const showTabs = preset.length > 0 && plugins.length > 0
  const currentItems = mode === 'preset' ? preset : plugins

  const t = locales[lang] || locales['en-US']

  return (
    <div
      className="
        my-4 overflow-hidden rounded-lg border border-neutral-200 bg-white
        dark:border-neutral-800 dark:bg-neutral-950
      "
    >
      {/* Header */}
      <div
        className="
          flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 bg-neutral-50/30 px-3 py-2
          dark:border-neutral-800 dark:bg-neutral-900/30
        "
      >
        <div className="flex items-center gap-2">
          {showTabs
            ? (
                <div
                  className="
                    flex items-center gap-0.5 rounded-md bg-neutral-200/50 p-0.5
                    dark:bg-neutral-800/50
                  "
                >
                  <button
                    className={clsx(
                      `
                        relative flex cursor-pointer items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium
                        transition-all outline-none
                        focus-visible:ring-2 focus-visible:ring-primary/50
                      `,
                      mode === 'preset'
                        ? `
                          bg-white text-neutral-900 shadow-sm
                          dark:bg-neutral-800 dark:text-white
                        `
                        : `
                          text-neutral-500
                          hover:bg-neutral-200/50
                          dark:text-neutral-400
                          dark:hover:bg-neutral-700/50
                        `,
                    )}
                    onClick={() => setMode('preset')}
                  >
                    <Box className="size-3.5" />
                    {t['preset-mode']}
                  </button>
                  <button
                    onClick={() => setMode('plugin')}
                    className={clsx(
                      `
                        relative flex cursor-pointer items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium
                        transition-all outline-none
                        focus-visible:ring-2 focus-visible:ring-primary/50
                      `,
                      mode === 'plugin'
                        ? `
                          bg-white text-neutral-900 shadow-sm
                          dark:bg-neutral-800 dark:text-white
                        `
                        : `
                          text-neutral-500
                          hover:bg-neutral-200/50
                          dark:text-neutral-400
                          dark:hover:bg-neutral-700/50
                        `,
                    )}
                  >
                    <Puzzle className="size-3.5" />
                    {t['plugin-mode']}
                  </button>
                </div>
              )
            : (
                <div className="flex min-h-[26px] items-center gap-1.5 px-1.5">
                  {mode === 'preset'
                    ? <Box className="size-4 text-neutral-500" />
                    : (
                        <Puzzle
                          className="size-4 text-neutral-500"
                        />
                      )}
                  <span
                    className="
                      text-sm font-medium text-neutral-900
                      dark:text-neutral-100
                    "
                  >
                    {mode === 'preset' ? t['preset-info'] : t['plugins-info']}
                  </span>
                </div>
              )}
        </div>

        {isPro && (
          <Link
            className={`
              group inline-flex items-center gap-1 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 px-2.5 py-2
              text-xs font-semibold text-white no-underline shadow-sm shadow-blue-500/20 transition-all
              hover:shadow-md hover:shadow-blue-500/30
              dark:from-blue-500 dark:to-indigo-500
            `}
            href={localizePath('/guides/pro', lang)}
          >
            Univer Pro
            <SparkleIcon className="size-2.5" />
          </Link>
        )}
      </div>

      {/* Content */}
      <div className="px-3">
        {/* List */}
        <div className="flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              {currentItems.length > 0
                ? (
                    currentItems.map(item => (
                      <PackageRow key={JSON.stringify(item)} {...item} t={t} />
                    ))
                  )
                : (
                    <div
                      className="
                        py-6 text-center text-xs text-neutral-400
                        dark:text-neutral-500
                      "
                    >
                      No items available
                    </div>
                  )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Info (Mobile / Server) */}
        {(mobile || server) && (
          <div
            className="
              flex flex-wrap gap-2 border-t border-neutral-100 py-3
              dark:border-neutral-800
            "
          >
            <StatusBadge
              active={!!mobile}
              icon={Smartphone}
              label={t['mobile-support']}
              desc={t['mobile-support-desc']}
            />
            <StatusBadge
              active={!!server}
              icon={Server}
              label={server === 'optional' ? t['server-optional'] : t['server-required']}
              desc={server === 'optional' ? t['server-optional-desc'] : t['server-required-desc']}
            />
          </div>
        )}
      </div>
    </div>
  )
}
