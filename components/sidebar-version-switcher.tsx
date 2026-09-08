'use client'

import { CheckIcon, ChevronsUpDownIcon, TagIcon } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { localizePath } from '@/lib/i18n'

const labels: Record<string, { version: string, latest: string }> = {
  'en-US': { version: 'Version', latest: 'Latest version' },
  'zh-CN': { version: '版本', latest: '最新版本' },
  'zh-TW': { version: '版本', latest: '最新版本' },
  'ja-JP': { version: 'バージョン', latest: '最新バージョン' },
}

export function SidebarVersionSwitcher({ lang }: { lang: string }) {
  const label = labels[lang]
  const latestHref = `https://docs.univer.ai${localizePath('/', lang)}`

  return (
    <Popover>
      <PopoverTrigger
        className="
          flex w-full items-center gap-3 rounded-md p-1 text-left transition-colors
          hover:bg-fd-accent hover:text-fd-accent-foreground
          focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none
        "
        type="button"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-md border bg-fd-background text-fd-primary">
          <TagIcon aria-hidden className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{label.version}</span>
          <span className="block text-sm text-fd-muted-foreground">v0.25.x</span>
        </span>
        <ChevronsUpDownIcon aria-hidden className="size-4 text-fd-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-1">
        <a
          className="
            flex min-h-9 items-center rounded-sm px-2 text-sm
            hover:bg-fd-accent
            focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none
          "
          href={latestHref}
        >
          {label.latest}
        </a>
        <div aria-current="true" className="flex min-h-9 items-center justify-between px-2 text-sm">
          <span>v0.25.x</span>
          <CheckIcon aria-hidden className="size-4" />
        </div>
      </PopoverContent>
    </Popover>
  )
}
