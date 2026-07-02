import type { GuideNavItem } from '@/lib/guides/navigation'
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'

export function GuidesPagination({
  previous,
  next,
  labels,
}: {
  previous?: GuideNavItem
  next?: GuideNavItem
  labels: {
    next: string
    pagination: string
    previous: string
  }
}) {
  if (!previous && !next) return null

  return (
    <nav
      aria-label={labels.pagination}
      className="mt-12 border-t pt-5"
    >
      <div
        className="
          relative grid gap-3
          md:grid-cols-[minmax(0,1fr)_3.5rem_minmax(0,1fr)] md:items-stretch
        "
      >
        {previous?.url
          ? (
              <Link
                className="
                  group relative isolate flex min-h-20 items-center gap-3 overflow-hidden rounded-lg border
                  bg-background px-4 py-3 text-sm text-muted-foreground shadow-xs transition-all outline-none
                  hover:-translate-x-0.5 hover:border-foreground/15 hover:bg-muted/25 hover:text-foreground
                  focus-visible:ring-[3px] focus-visible:ring-ring/40
                "
                href={previous.url}
              >
                <span
                  className="
                    absolute inset-y-3 left-0 w-1 rounded-r-full bg-primary/70 opacity-0 transition-opacity
                    group-hover:opacity-100
                    group-focus-visible:opacity-100
                  "
                  aria-hidden="true"
                />
                <span
                  className="
                    flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/40 shadow-xs
                    transition-all
                    group-hover:-translate-x-0.5 group-hover:border-primary/25 group-hover:bg-primary/8
                  "
                  aria-hidden="true"
                >
                  <ArrowLeftIcon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-medium tracking-wide text-muted-foreground uppercase">{labels.previous}</span>
                  <span className="mt-1 block truncate text-base font-semibold text-foreground">{previous.name}</span>
                </span>
              </Link>
            )
          : (
              <span
                className="
                  hidden
                  md:block
                "
              />
            )}
        <span
          className="
            hidden items-center justify-center
            md:flex
          "
          aria-hidden="true"
        >
          <span className="h-px w-full bg-border" />
          <span className="mx-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/35" />
          <span className="h-px w-full bg-border" />
        </span>
        {next?.url
          ? (
              <Link
                className="
                  group relative isolate flex min-h-20 items-center justify-end gap-3 overflow-hidden rounded-lg border
                  bg-background px-4 py-3 text-right text-sm text-muted-foreground shadow-xs transition-all outline-none
                  hover:translate-x-0.5 hover:border-foreground/15 hover:bg-muted/25 hover:text-foreground
                  focus-visible:ring-[3px] focus-visible:ring-ring/40
                "
                href={next.url}
              >
                <span
                  className="
                    absolute inset-y-3 right-0 w-1 rounded-l-full bg-primary/70 opacity-0 transition-opacity
                    group-hover:opacity-100
                    group-focus-visible:opacity-100
                  "
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <span className="block text-xs font-medium tracking-wide text-muted-foreground uppercase">{labels.next}</span>
                  <span className="mt-1 block truncate text-base font-semibold text-foreground">{next.name}</span>
                </span>
                <span
                  className="
                    flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/40 shadow-xs
                    transition-all
                    group-hover:translate-x-0.5 group-hover:border-primary/25 group-hover:bg-primary/8
                  "
                  aria-hidden="true"
                >
                  <ArrowRightIcon className="size-4" />
                </span>
              </Link>
            )
          : <span />}
      </div>
    </nav>
  )
}
