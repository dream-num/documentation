'use client'

import type { HTMLProps, ReactElement } from 'react'
import { useParams } from 'next/navigation'
import { clsx } from '@/lib/clsx'

function useMode(): string | undefined {
  const { slug } = useParams()

  return Array.isArray(slug) && slug.length > 0 ? `page-${slug[0]}` : undefined
}

export function Body(props: HTMLProps<HTMLBodyElement>): ReactElement {
  const { children, className, ...restProps } = props

  const mode = useMode()

  return (
    <body className={clsx(mode, className)} {...restProps}>
      {children}
    </body>
  )
}
