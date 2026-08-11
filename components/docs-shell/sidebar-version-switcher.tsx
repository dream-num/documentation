'use client'

import { CheckIcon, ChevronsUpDownIcon, TagIcon } from 'lucide-react'
import Link from 'next/link'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { guideVersions } from '@/lib/guides/versions'

export function SidebarVersionSwitcher() {
  const currentVersion = guideVersions.find((version) => version.isCurrent) ?? guideVersions[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className="hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent/70 focus-visible:ring-ring/60 flex w-full items-center gap-3 rounded-md p-1 text-left transition-colors focus-visible:ring-1 focus-visible:outline-none focus-visible:ring-inset"
            type="button"
          />
        }
      >
        <span className="bg-background text-primary grid size-10 shrink-0 place-items-center overflow-hidden rounded-md border p-2 [&_svg]:size-4.5!">
          <TagIcon className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-foreground block truncate text-sm font-semibold">Latest Version</span>
          <span className="text-muted-foreground block truncate text-sm">{currentVersion?.label}</span>
        </span>
        <ChevronsUpDownIcon className="text-muted-foreground size-4 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {guideVersions.map((version) => {
          const content = (
            <>
              <span>{version.label}</span>
              {version.isCurrent ? <CheckIcon className="size-4" /> : null}
            </>
          )

          return version.href ? (
            <DropdownMenuItem key={version.value} render={<Link className="justify-between" href={version.href} />}>
              {content}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem className="justify-between" closeOnClick={false} key={version.value}>
              {content}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
