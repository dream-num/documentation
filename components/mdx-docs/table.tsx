import type { ComponentProps } from 'react'
import { clsx } from '@/lib/clsx'

export function DocsTable({
  className,
  ...props
}: ComponentProps<'table'>) {
  return (
    <div className="my-6 overflow-x-auto rounded-md border">
      <table
        className={clsx(
          `
            w-full border-collapse text-sm
            [&_td]:border-t [&_td]:px-4 [&_td]:py-3
            [&_th]:bg-muted [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-medium
            [&_tr]:border-b
            [&_tr:last-child]:border-b-0
          `,
          className,
        )}
        {...props}
      />
    </div>
  )
}
