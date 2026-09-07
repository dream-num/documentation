'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'

import { createSlidesDemo } from '../code/create-demo'

export default function Preview() {
  const containerRef = useRef<HTMLDivElement>(null!)
  const controllerRef = useRef<ReturnType<typeof createSlidesDemo> | undefined>(undefined)
  const darkModeRef = useRef(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    darkModeRef.current = resolvedTheme === 'dark'
    controllerRef.current?.univerAPI.toggleDarkMode(darkModeRef.current)
  }, [resolvedTheme])
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      controllerRef.current = createSlidesDemo(containerRef.current, darkModeRef.current)
    })
    return () => {
      cancelAnimationFrame(frame)
      const controller = controllerRef.current
      controllerRef.current = undefined
      queueMicrotask(() => controller?.dispose())
    }
  }, [])

  return <div ref={containerRef} className="h-full min-h-0" />
}
