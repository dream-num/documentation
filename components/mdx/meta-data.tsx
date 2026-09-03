'use client'

import { Box, Check, Languages, Palette, PlugZap, Puzzle, Server, Smartphone, SparkleIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Tooltip } from '@/components/tooltip'
import { Link } from '@/i18n/navigation'
import { clsx } from '@/lib/clsx'

interface IMetaDataLabels {
  copied: string
  facade: string
  locale: string
  style: string
}

function CopyableTag({
  text,
  label,
  icon: Icon,
  successText,
}: {
  text: string
  label: string
  icon: any
  successText: string
}) {
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
          `group inline-flex cursor-pointer items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium transition-all outline-none focus-visible:ring-2`,
          'focus-visible:ring-primary/50',
          copied
            ? `border-green-200 bg-green-50 text-green-600 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400`
            : `border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 hover:dark:border-neutral-600 hover:dark:bg-neutral-800 hover:dark:text-neutral-200`,
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
  labels,
}: {
  client?: string
  locale?: string
  style?: string
  facade?: string
  labels: IMetaDataLabels
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
    <div className="flex flex-col gap-1.5 border-b border-neutral-100 py-1.5 last:border-0 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800">
      {client && (
        <div className="flex min-w-0 items-center">
          <Tooltip content={copied ? labels.copied : client}>
            <button
              className="group relative flex max-w-full cursor-pointer items-center gap-1 rounded-sm bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 hover:dark:bg-neutral-800"
              type="button"
              onClick={handleCopyClient}
            >
              <span className="truncate">{client}</span>
              {copied && <Check className="size-3 text-green-500" />}
            </button>
          </Tooltip>
        </div>
      )}

      <div className="flex flex-wrap gap-1">
        {locale && <CopyableTag text={locale} label={labels.locale} icon={Languages} successText={labels.copied} />}
        {style && <CopyableTag text={style} label={labels.style} icon={Palette} successText={labels.copied} />}
        {facade && <CopyableTag text={facade} label={labels.facade} icon={PlugZap} successText={labels.copied} />}
      </div>
    </div>
  )
}

function StatusBadge({
  icon: Icon,
  label,
  desc,
  active,
}: {
  icon: any
  label: string
  desc: string
  active?: boolean
}) {
  if (!active) return null
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-neutral-100 bg-neutral-50 px-2.5 py-1.5 dark:border-neutral-800 dark:bg-neutral-900/50">
      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5 dark:bg-neutral-800 dark:shadow-none dark:ring-white/10">
        <Icon className="size-3 text-neutral-500 dark:text-neutral-400" />
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] leading-tight font-semibold text-neutral-700 dark:text-neutral-200">{label}</span>
        <span className="text-[10px] leading-tight text-neutral-500 dark:text-neutral-400">{desc}</span>
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
  const { isPro = false, meta } = props
  const t = useTranslations()
  const { preset = [], plugins = [], server = false, mobile = false } = meta

  // If we have presets, default to 'preset', otherwise 'plugin'.
  // If we have both, user can switch.
  const [mode, setMode] = useState<'preset' | 'plugin'>(preset.length > 0 ? 'preset' : 'plugin')

  const showTabs = preset.length > 0 && plugins.length > 0
  const currentItems = mode === 'preset' ? preset : plugins

  const labels: IMetaDataLabels = {
    copied: t('mdx-meta-data.copied'),
    facade: t('mdx-meta-data.facade'),
    locale: t('mdx-meta-data.locale'),
    style: t('mdx-meta-data.style'),
  }

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 bg-neutral-50/30 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900/30">
        <div className="flex items-center gap-2">
          {showTabs ? (
            <div className="flex items-center gap-0.5 rounded-md bg-neutral-200/50 p-0.5 dark:bg-neutral-800/50">
              <button
                className={clsx(
                  `relative flex cursor-pointer items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition-all outline-none focus-visible:ring-2`,
                  'focus-visible:ring-primary/50',
                  mode === 'preset'
                    ? `bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white`
                    : `text-neutral-500 hover:bg-neutral-200/50 dark:text-neutral-400 hover:dark:bg-neutral-700/50`,
                )}
                onClick={() => setMode('preset')}
              >
                <Box className="size-3.5" />
                {t('mdx-meta-data.preset-mode')}
              </button>
              <button
                onClick={() => setMode('plugin')}
                className={clsx(
                  `relative flex cursor-pointer items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition-all outline-none focus-visible:ring-2`,
                  'focus-visible:ring-primary/50',
                  mode === 'plugin'
                    ? `bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white`
                    : `text-neutral-500 hover:bg-neutral-200/50 dark:text-neutral-400 hover:dark:bg-neutral-700/50`,
                )}
              >
                <Puzzle className="size-3.5" />
                {t('mdx-meta-data.plugin-mode')}
              </button>
            </div>
          ) : (
            <div className="flex min-h-6.5 items-center gap-1.5 px-1.5">
              {mode === 'preset' ? (
                <Box className="size-4 text-neutral-500" />
              ) : (
                <Puzzle className="size-4 text-neutral-500" />
              )}
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {mode === 'preset' ? t('mdx-meta-data.preset-info') : t('mdx-meta-data.plugins-info')}
              </span>
            </div>
          )}
        </div>

        {isPro && (
          <Link
            className={`group inline-flex items-center gap-1 rounded-full bg-linear-[145deg,#18181B_0%,#71717A_48%,#27272A_100%] px-2.5 py-2 text-xs font-semibold text-zinc-50 no-underline shadow-[0_2px_8px_rgba(24,24,27,0.24)] ring-1 ring-black/10 transition-all hover:shadow-[0_4px_12px_rgba(24,24,27,0.3)] dark:bg-linear-[145deg,#FAFAFA_0%,#A1A1AA_48%,#E4E4E7_100%] dark:text-zinc-950 dark:shadow-[0_2px_8px_rgba(0,0,0,0.35)] dark:ring-white/10 hover:dark:shadow-[0_4px_12px_rgba(0,0,0,0.45)]`}
            href="/guides/pro"
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
              {currentItems.length > 0 ? (
                currentItems.map((item) => {
                  const facade = 'facade' in item ? item.facade : undefined
                  const key = [item.client, item.locale, item.style, facade].filter(Boolean).join(':')

                  return <PackageRow key={key} {...item} labels={labels} />
                })
              ) : (
                <div className="py-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
                  {t('mdx-meta-data.no-items')}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Info (Mobile / Server) */}
        {(mobile || server) && (
          <div className="flex flex-wrap gap-2 border-t border-neutral-100 py-3 dark:border-neutral-800">
            <StatusBadge
              active={!!mobile}
              icon={Smartphone}
              label={t('mdx-meta-data.mobile-support')}
              desc={t('mdx-meta-data.mobile-support-desc')}
            />
            <StatusBadge
              active={!!server}
              icon={Server}
              label={server === 'optional' ? t('mdx-meta-data.server-optional') : t('mdx-meta-data.server-required')}
              desc={
                server === 'optional'
                  ? t('mdx-meta-data.server-optional-desc')
                  : t('mdx-meta-data.server-required-desc')
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}
