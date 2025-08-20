'use client'

import type { ReactNode } from 'react'
import { useParams } from 'next/navigation'

function useMode(): string | undefined {
  const { slug } = useParams()

  return Array.isArray(slug) && slug.length > 0 ? `page-${slug[0]}` : undefined
}

export function Wrapper({ children }: { children: ReactNode }) {
  const mode = useMode()

  return (
    <div className={mode}>
      {children}
    </div>
  )
}
