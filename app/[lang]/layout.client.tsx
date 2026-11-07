'use client'

import type { ReactNode } from 'react'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

function useMode(): string | undefined {
  const { slug } = useParams()

  return Array.isArray(slug) && slug.length > 0 ? `page-${slug[0]}` : undefined
}

export function Wrapper({ children }: { children: ReactNode }) {
  const mode = useMode()

  useEffect(() => {
    document.documentElement.dataset.platform = /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'mac' : 'other'
  }, [])

  return <div className={mode}>{children}</div>
}
