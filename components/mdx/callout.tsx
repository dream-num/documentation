import type { ComponentProps, ReactNode } from 'react'
import { CircleAlertIcon, InfoIcon, TriangleAlertIcon } from 'lucide-react'

import { clsx } from '@/lib/clsx'

const calloutStyles = {
  info: {
    icon: InfoIcon,
    className: 'border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100',
  },
  warning: {
    icon: TriangleAlertIcon,
    className:
      'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100',
  },
  error: {
    icon: CircleAlertIcon,
    className: 'border-red-200 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100',
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
    <div className={clsx(`my-6 flex gap-3 rounded-md border p-4 text-sm`, style.className, className)} {...props}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 [&_li:first-child]:mt-0 [&_li:last-child]:mb-0 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {title ? <p className="mb-2 font-medium">{title}</p> : null}
        {children}
      </div>
    </div>
  )
}
