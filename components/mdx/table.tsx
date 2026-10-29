import type { ComponentProps } from 'react'
import { clsx } from '@/lib/clsx'

export function DocsTable({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div className="my-5 overflow-x-auto rounded-lg border border-(--separator)">
      <table
        className={clsx(
          `w-full border-collapse text-left text-sm [&_tbody]:divide-y [&_tbody]:divide-(--separator) [&_td]:px-3 [&_td]:py-2.5 [&_td]:align-top [&_td]:text-foreground/85 [&_th]:bg-muted/70 [&_th]:px-3 [&_th]:py-2.5 [&_th]:font-semibold [&_th]:whitespace-nowrap [&_th]:text-foreground`,
          className,
        )}
        {...props}
      />
    </div>
  )
}
