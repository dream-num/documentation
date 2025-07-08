'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'

interface IProps {
  children: ReactNode
}

export function PageProvider(props: IProps) {
  const { children } = props

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target instanceof HTMLElement) {
          const height = entry.target.scrollHeight
          window.parent.postMessage({
            type: 'setHeight',
            height,
          }, '*')
        }
      }
    })

    observer.observe(document.documentElement)

    return () => {
      observer.disconnect()
    }
  }, [])

  return <>{children}</>
}
