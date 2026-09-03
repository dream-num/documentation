import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'

import type { IDocsNavItem } from '@/lib/docs/navigation'
import { Link } from '@/i18n/navigation'

export function DocsPagination({
  previous,
  next,
  labels,
}: {
  previous?: IDocsNavItem
  next?: IDocsNavItem
  labels: {
    next: string
    pagination: string
    previous: string
  }
}) {
  if (!previous && !next) return null

  return (
    <nav aria-label={labels.pagination} className="mt-12 border-t pt-6">
      <div className="relative grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(4rem,8rem)_minmax(0,1fr)] md:items-center">
        {previous?.url ? (
          <Link
            className="group text-muted-foreground hover:text-foreground flex min-h-18 items-center gap-3 rounded-lg px-1 py-3 text-sm transition-colors"
            href={previous.url}
          >
            <span
              className="bg-background group-hover:border-foreground/20 group-hover:bg-muted flex size-9 shrink-0 items-center justify-center rounded-full border shadow-xs transition-all group-hover:-translate-x-0.5"
              aria-hidden="true"
            >
              <ArrowLeftIcon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="text-muted-foreground block text-xs font-medium tracking-wide uppercase">
                {labels.previous}
              </span>
              <span className="text-foreground mt-1 block truncate text-base font-medium">{previous.name}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        <span
          className="via-border hidden h-px w-full bg-linear-to-r from-transparent to-transparent md:block"
          aria-hidden="true"
        />
        {next?.url ? (
          <Link
            className="group text-muted-foreground hover:text-foreground flex min-h-18 items-center justify-end gap-3 rounded-lg px-1 py-3 text-right text-sm transition-colors"
            href={next.url}
          >
            <span className="min-w-0">
              <span className="text-muted-foreground block text-xs font-medium tracking-wide uppercase">
                {labels.next}
              </span>
              <span className="text-foreground mt-1 block truncate text-base font-semibold">{next.name}</span>
            </span>
            <span
              className="bg-background group-hover:border-foreground/20 group-hover:bg-muted flex size-9 shrink-0 items-center justify-center rounded-full border shadow-xs transition-all group-hover:translate-x-0.5"
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
