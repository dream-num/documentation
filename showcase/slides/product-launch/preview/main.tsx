'use client'
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'

import { createDemo } from '../code/create-demo'

export default function Preview() {
  const containerRef = useRef<HTMLDivElement>(null!)
  const demoRef = useRef<ReturnType<typeof createDemo> | undefined>(undefined)
  const darkModeRef = useRef(false)
  const { resolvedTheme } = useTheme()
  useEffect(() => {
    darkModeRef.current = resolvedTheme === 'dark'
    const current = (window as typeof window & { atlasLaunch?: ReturnType<typeof createDemo> }).atlasLaunch
    if (current?.container === containerRef.current) current.univerAPI.toggleDarkMode(darkModeRef.current)
  }, [resolvedTheme])
  useEffect(() => {
    const container = containerRef.current
    const frame = requestAnimationFrame(() => {
      demoRef.current = createDemo(container, darkModeRef.current)
    })
    return () => {
      cancelAnimationFrame(frame)
      const current = (window as typeof window & { atlasLaunch?: ReturnType<typeof createDemo> }).atlasLaunch
      const demo = current?.container === container ? current : demoRef.current
      demoRef.current = undefined
      queueMicrotask(() => demo?.dispose())
    }
  }, [])
  return <div ref={containerRef} className="h-full min-h-0" />
}
