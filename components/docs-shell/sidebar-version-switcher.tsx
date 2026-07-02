'use client'

import { CheckIcon, ChevronsUpDownIcon, TagIcon } from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { guideVersions } from '@/lib/guides/versions'

export function SidebarVersionSwitcher() {
  const currentVersion = guideVersions.find(version => version.isCurrent) ?? guideVersions[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="
            flex w-full items-center gap-3 rounded-md p-1 text-left transition-colors
            hover:bg-accent hover:text-accent-foreground
            focus-visible:bg-accent/70 focus-visible:ring-1 focus-visible:ring-ring/60 focus-visible:outline-none
            focus-visible:ring-inset
          "
          type="button"
        >
          <span
            className="
              grid size-10 shrink-0 place-items-center overflow-hidden rounded-md border bg-background p-2 text-primary
              [&_svg]:size-4.5!
            "
          >
            <TagIcon className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-foreground">
              Latest Version
            </span>
            <span className="block truncate text-sm text-muted-foreground">
              {currentVersion?.label}
            </span>
          </span>
          <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {guideVersions.map((version) => {
          const content = (
            <>
              <span>{version.label}</span>
              {version.isCurrent ? <CheckIcon className="size-4" /> : null}
            </>
          )

          return version.href
            ? (
                <DropdownMenuItem asChild key={version.value}>
                  <Link className="justify-between" href={version.href}>
                    {content}
                  </Link>
                </DropdownMenuItem>
              )
            : (
                <DropdownMenuItem
                  className="justify-between"
                  key={version.value}
                  onSelect={event => event.preventDefault()}
                >
                  {content}
                </DropdownMenuItem>
              )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
