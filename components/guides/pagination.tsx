import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'

import type { IGuideNavItem } from '@/lib/guides/navigation'
import { Link } from '@/i18n/navigation'

export function GuidesPagination({
  previous,
  next,
  labels,
}: {
  previous?: IGuideNavItem
  next?: IGuideNavItem
  labels: {
    next: string
    pagination: string
    previous: string
  }
}) {
  if (!previous && !next) return null

  return (
    <nav aria-label={labels.pagination} className="mt-12 border-t pt-5">
      <div className="relative grid gap-3 md:grid-cols-[minmax(0,1fr)_3.5rem_minmax(0,1fr)] md:items-stretch">
        {previous?.url ? (
          <Link
            className="group bg-background text-muted-foreground hover:border-foreground/15 hover:bg-muted/25 hover:text-foreground focus-visible:ring-ring/40 relative isolate flex min-h-20 items-center gap-3 overflow-hidden rounded-lg border px-4 py-3 text-sm shadow-xs transition-all outline-none hover:-translate-x-0.5 focus-visible:ring-[3px]"
            href={previous.url}
          >
            <span
              className="bg-primary/70 absolute inset-y-3 left-0 w-1 rounded-r-full opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              aria-hidden="true"
            />
            <span
              className="bg-muted/40 group-hover:border-primary/25 group-hover:bg-primary/8 flex size-9 shrink-0 items-center justify-center rounded-md border shadow-xs transition-all group-hover:-translate-x-0.5"
              aria-hidden="true"
            >
              <ArrowLeftIcon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="text-muted-foreground block text-xs font-medium tracking-wide uppercase">
                {labels.previous}
              </span>
              <span className="text-foreground mt-1 block truncate text-base font-semibold">{previous.name}</span>
            </span>
          </Link>
        ) : (
          <span className="hidden md:block" />
        )}
        <span className="hidden items-center justify-center md:flex" aria-hidden="true">
          <span className="bg-border h-px w-full" />
          <span className="bg-muted-foreground/35 mx-2 size-1.5 shrink-0 rounded-full" />
          <span className="bg-border h-px w-full" />
        </span>
        {next?.url ? (
          <Link
            className="group bg-background text-muted-foreground hover:border-foreground/15 hover:bg-muted/25 hover:text-foreground focus-visible:ring-ring/40 relative isolate flex min-h-20 items-center justify-end gap-3 overflow-hidden rounded-lg border px-4 py-3 text-right text-sm shadow-xs transition-all outline-none hover:translate-x-0.5 focus-visible:ring-[3px]"
            href={next.url}
          >
            <span
              className="bg-primary/70 absolute inset-y-3 right-0 w-1 rounded-l-full opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              aria-hidden="true"
            />
            <span className="min-w-0">
              <span className="text-muted-foreground block text-xs font-medium tracking-wide uppercase">
                {labels.next}
              </span>
              <span className="text-foreground mt-1 block truncate text-base font-semibold">{next.name}</span>
            </span>
            <span
              className="bg-muted/40 group-hover:border-primary/25 group-hover:bg-primary/8 flex size-9 shrink-0 items-center justify-center rounded-md border shadow-xs transition-all group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              <ArrowRightIcon className="size-4" />
            </span>
          </Link>
        ) : (
          <span />
        )}
      </div>
    </nav>
  )
}
