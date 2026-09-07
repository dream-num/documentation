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
    demoRef.current?.setDarkMode(darkModeRef.current)
  }, [resolvedTheme])
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      demoRef.current = createDemo(containerRef.current, darkModeRef.current)
    })
    return () => {
      cancelAnimationFrame(frame)
      const demo = demoRef.current
      demoRef.current = undefined
      queueMicrotask(() => demo?.dispose())
    }
  }, [])
  return <div ref={containerRef} className="h-full min-h-0" />
}
