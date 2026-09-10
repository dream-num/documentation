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
    <nav aria-label={labels.pagination} className="mt-16 grid gap-3 border-t border-(--separator) pt-8 sm:grid-cols-2">
      {previous?.url ? (
        <Link
          href={previous.url}
          className="group bg-card hover:border-primary/40 hover:bg-accent focus-visible:outline-ring flex min-h-24 flex-col justify-center rounded-lg border border-(--separator) px-5 py-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <span className="text-muted-foreground mb-2 inline-flex items-center gap-1.5 text-sm">
            <ArrowLeftIcon aria-hidden="true" className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            {labels.previous}
          </span>
          <span className="text-foreground font-medium">{previous.name}</span>
        </Link>
      ) : (
        <span />
      )}
      {next?.url ? (
        <Link
          href={next.url}
          className="group bg-card hover:border-primary/40 hover:bg-accent focus-visible:outline-ring flex min-h-24 flex-col items-end justify-center rounded-lg border border-(--separator) px-5 py-4 text-right transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <span className="text-muted-foreground mb-2 inline-flex items-center gap-1.5 text-sm">
            {labels.next}
            <ArrowRightIcon aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="text-foreground font-medium">{next.name}</span>
        </Link>
      ) : null}
    </nav>
  )
}
