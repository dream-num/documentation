'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'

import { createDemo } from '../code/create-demo'

export default function Preview() {
  const container = useRef<HTMLDivElement>(null!)
  const { resolvedTheme } = useTheme()
  useEffect(() => {
    if (!resolvedTheme) return
    let demo: ReturnType<typeof createDemo> | undefined
    const frame = requestAnimationFrame(() => {
      demo = createDemo(container.current, resolvedTheme === 'dark')
    })
    return () => {
      cancelAnimationFrame(frame)
      queueMicrotask(() => demo?.dispose())
    }
  }, [resolvedTheme])
  return <div ref={container} className="h-full" />
}
