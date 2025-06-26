'use client'

import type { ReactNode } from 'react'
import { SiCss } from '@icons-pack/react-simple-icons'
import { LanguagesIcon, PlugZapIcon } from 'lucide-react'
import { useState } from 'react'
import { CopyButton } from '@/components/copy-button'
import { Tooltip } from '@/components/tooltip'
import { Switch } from '@/components/ui/switch'
import { clsx } from '@/lib/clsx'

interface IProps {
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

function PackageInfo({ client, locale, style, facade }: { client?: string, locale?: string, style?: string, facade?: string }) {
  return (
    <div className="flex items-center gap-2">
      {client && <code className="text-xs text-neutral-600">{client}</code>}
      {locale && (
        <CopyButton text={locale}>
          <Tooltip content={locale}>
            <LanguagesIcon className="h-4 w-4 text-neutral-500" />
          </Tooltip>
        </CopyButton>
      )}
      {style && (
        <CopyButton text={style}>
          <Tooltip content={style}>
            <SiCss className="h-4 w-4 text-neutral-500" />
          </Tooltip>
        </CopyButton>
      )}
      {facade && (
        <CopyButton text={facade}>
          <Tooltip content={facade}>
            <PlugZapIcon className="h-4 w-4 text-neutral-500" />
          </Tooltip>
        </CopyButton>
      )}
    </div>
  )
}

function Label({ children }: { children: ReactNode }) {
  return (
    <span className="text-sm font-semibold text-neutral-600">
      {children}
    </span>
  )
}

export function MetaData(props: IProps) {
  const { meta } = props
  const { preset = [], plugins = [], server = false } = meta

  const [mode, setMode] = useState<'preset' | 'plugin'>(preset.length > 0 ? 'preset' : 'plugin')

  return (
    <div
      className={`
        grid gap-2 rounded-lg bg-neutral-100 p-2.5 shadow-md
        dark:bg-neutral-800
      `}
    >
      <div className="flex items-center gap-1 text-xs">
        <label
          className={clsx('text-neutral-400', {
            'text-neutral-800': mode === 'preset',
          })}
          onClick={() => preset.length && setMode('preset')}
        >
          Preset Mode
        </label>
        <Switch
          checked={mode === 'plugin'}
          disabled={preset.length === 0 || plugins.length === 0}
          onCheckedChange={(checked) => {
            setMode(checked ? 'plugin' : 'preset')
          }}
        />
        <label
          className={clsx('text-neutral-400', {
            'text-neutral-800': mode === 'plugin',
          })}
          onClick={() => plugins.length && setMode('plugin')}
        >
          Plugin Mode
        </label>
      </div>

      <div className="grid gap-2">
        {/* Preset */}
        <div
          className={clsx('grid gap-2', {
            hidden: mode === 'plugin',
          })}
        >
          <Label>Preset Info</Label>
          <div
            className={`
              grid grid-cols-2 gap-2
              xl:grid-cols-3
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
          <Label>Plugins Info</Label>
          <div
            className={`
              grid grid-cols-2 gap-2
              xl:grid-cols-3
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
          <Label>Server Required</Label>
          <div className="text-sm text-neutral-600">
            {server}
          </div>
        </div>
      </div>
    </div>
  )
}
