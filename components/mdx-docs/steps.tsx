import type { ComponentProps } from 'react'
import { clsx } from '@/lib/clsx'

export function Steps({
  className,
  ...props
}: ComponentProps<'ol'>) {
  return (
    <ol
      className={clsx(
        `my-8 ml-4 space-y-8 border-l pl-8 [counter-reset:step]`,
        className,
      )}
      {...props}
    />
  )
}

export function Step({
  className,
  ...props
}: ComponentProps<'li'>) {
  return (
    <li
      className={clsx(
        `
          relative list-none
          before:absolute before:top-0 before:-left-12 before:flex before:size-8 before:items-center
          before:justify-center before:rounded-full before:border before:bg-background before:text-sm before:font-medium
          before:content-[counter(step)] before:[counter-increment:step]
        `,
        className,
      )}
      {...props}
    />
  )
}
