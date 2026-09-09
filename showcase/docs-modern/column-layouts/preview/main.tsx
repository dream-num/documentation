'use client'
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'

import { createDemo } from '../code/create-demo'
export default function Preview() {
  const containerRef = useRef<HTMLDivElement>(null!)
  const controller = useRef<ReturnType<typeof createDemo> | undefined>(undefined)
  const dark = useRef(false)
  const { resolvedTheme } = useTheme()
  useEffect(() => {
    dark.current = resolvedTheme === 'dark'
    controller.current?.univerAPI.toggleDarkMode(dark.current)
  }, [resolvedTheme])
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      controller.current = createDemo(containerRef.current, dark.current)
    })
    return () => {
      cancelAnimationFrame(frame)
      const demo = controller.current
      controller.current = undefined
      queueMicrotask(() => demo?.dispose())
    }
  }, [])
  return <div ref={containerRef} className="h-full min-h-0" />
}
