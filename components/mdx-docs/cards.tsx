import type { ComponentProps, ReactNode } from 'react'
import { ArrowRightIcon, ExternalLinkIcon, FileTextIcon } from 'lucide-react'

import { Link } from '@/i18n/navigation'
import { clsx } from '@/lib/clsx'

function isExternalHref(href?: string) {
  return Boolean(href && /^(?:https?:)?\/\//.test(href))
}

export function Cards({ className, ...props }: ComponentProps<'div'>) {
  return <div className={clsx(`my-5 grid gap-2.5 sm:grid-cols-2`, className)} {...props} />
}

export function Card({
  title,
  description,
  icon,
  href,
  className,
  children,
  ...props
}: Omit<ComponentProps<'a'>, 'href' | 'title'> & {
  href: string
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
}) {
  const external = isExternalHref(href)
  const titleContent = title ?? children
  const descriptionContent = description ?? (title ? children : undefined)
  const Icon = external ? ExternalLinkIcon : ArrowRightIcon

  return (
    <Link
      className={clsx(
        `group bg-card hover:border-ring/40 hover:bg-accent/50 hover:text-accent-foreground focus-visible:bg-accent/60 focus-visible:ring-ring/60 flex min-h-18 items-center gap-3 rounded-md border p-3.5 text-sm no-underline shadow-xs transition-[border-color,background-color,box-shadow] hover:shadow-sm focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset`,
        className,
      )}
      href={href}
      rel={external ? 'noreferrer' : props.rel}
      {...props}
    >
      <span className="bg-background text-muted-foreground group-hover:border-ring/30 group-hover:text-foreground flex size-8 shrink-0 items-center justify-center rounded-md border shadow-xs transition-colors [&_svg]:size-4">
        {icon ?? <FileTextIcon />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-foreground group-hover:text-accent-foreground block text-sm/5 font-semibold transition-colors">
          {titleContent}
        </span>
        {descriptionContent ? (
          <span className="text-muted-foreground mt-1 block text-sm/5">{descriptionContent}</span>
        ) : null}
      </span>
      <Icon className="text-muted-foreground group-hover:text-foreground size-3.5 shrink-0 opacity-70 transition-[color,opacity,transform] group-hover:translate-x-0.5 group-hover:opacity-100" />
    </Link>
  )
}
