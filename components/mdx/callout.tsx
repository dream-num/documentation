import type { ComponentProps, ReactNode } from 'react'
import { CircleAlertIcon, InfoIcon, TriangleAlertIcon } from 'lucide-react'

import { clsx } from '@/lib/clsx'

const calloutStyles = {
  info: {
    icon: InfoIcon,
    className: 'border-[var(--separator)] bg-muted/40 [&>svg]:text-muted-foreground',
  },
  warning: {
    icon: TriangleAlertIcon,
    className:
      'border-amber-600/20 bg-amber-500/5 [&>svg]:text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/5 dark:[&>svg]:text-amber-400',
  },
  error: {
    icon: CircleAlertIcon,
    className:
      'border-red-600/20 bg-red-500/5 [&>svg]:text-red-700 dark:border-red-400/20 dark:bg-red-400/5 dark:[&>svg]:text-red-400',
  },
} as const

function getCalloutStyle(type?: string) {
  if (type === 'warning') return calloutStyles.warning
  if (type === 'error' || type === 'danger') return calloutStyles.error
  return calloutStyles.info
}

export function Callout({
  type,
  title,
  children,
  className,
  ...props
}: ComponentProps<'div'> & {
  type?: string
  title?: ReactNode
}) {
  const style = getCalloutStyle(type)
  const Icon = style.icon

  return (
    <div
      className={clsx(
        `text-foreground my-4 flex gap-2.5 rounded-md border px-3 py-2.5 text-sm/6`,
        style.className,
        className,
      )}
      {...props}
    >
      <Icon aria-hidden="true" className="mt-[calc(0.5lh-0.5rem)] size-4 shrink-0" />
      <div className="min-w-0 [&_li]:my-0.5 [&_li:first-child]:mt-0 [&_li:last-child]:mb-0 [&_ol]:my-2 [&_p]:my-2 [&_p]:text-sm/6 [&_ul]:my-2 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {title ? <p className="font-medium">{title}</p> : null}
        {children}
      </div>
    </div>
  )
}
