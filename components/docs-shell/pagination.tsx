import type { DocsNavItem } from '@/lib/docs/navigation'
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'

export function DocsPagination({
  previous,
  next,
  labels,
}: {
  previous?: DocsNavItem
  next?: DocsNavItem
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
      className="mt-12 border-t pt-6"
    >
      <div
        className="
          relative grid gap-3
          md:grid-cols-[minmax(0,1fr)_minmax(4rem,8rem)_minmax(0,1fr)] md:items-center
        "
      >
        {previous?.url
          ? (
              <Link
                className="
                  group flex min-h-18 items-center gap-3 rounded-lg px-1 py-3 text-sm text-muted-foreground
                  transition-colors
                  hover:text-foreground
                "
                href={previous.url}
              >
                <span
                  className="
                    flex size-9 shrink-0 items-center justify-center rounded-full border bg-background shadow-xs
                    transition-all
                    group-hover:-translate-x-0.5 group-hover:border-foreground/20 group-hover:bg-muted
                  "
                  aria-hidden="true"
                >
                  <ArrowLeftIcon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-medium tracking-wide text-muted-foreground uppercase">{labels.previous}</span>
                  <span className="mt-1 block truncate text-base font-medium text-foreground">{previous.name}</span>
                </span>
              </Link>
            )
          : <span />}
        <span
          className="
            hidden h-px w-full bg-linear-to-r from-transparent via-border to-transparent
            md:block
          "
          aria-hidden="true"
        />
        {next?.url
          ? (
              <Link
                className="
                  group flex min-h-18 items-center justify-end gap-3 rounded-lg px-1 py-3 text-right text-sm
                  text-muted-foreground transition-colors
                  hover:text-foreground
                "
                href={next.url}
              >
                <span className="min-w-0">
                  <span className="block text-xs font-medium tracking-wide text-muted-foreground uppercase">{labels.next}</span>
                  <span className="mt-1 block truncate text-base font-semibold text-foreground">{next.name}</span>
                </span>
                <span
                  className="
                    flex size-9 shrink-0 items-center justify-center rounded-full border bg-background shadow-xs
                    transition-all
                    group-hover:translate-x-0.5 group-hover:border-foreground/20 group-hover:bg-muted
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
