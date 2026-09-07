'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'

import { createDemo } from '../code/create-demo'

export default function Preview() {
  const container = useRef<HTMLDivElement>(null!)
  const demoRef = useRef<ReturnType<typeof createDemo> | undefined>(undefined)
  const darkRef = useRef(false)
  const { resolvedTheme } = useTheme()
  useEffect(() => {
    darkRef.current = resolvedTheme === 'dark'
    const current = (window as typeof window & { pelicanDemo?: ReturnType<typeof createDemo> }).pelicanDemo
    if (current?.container === container.current) current.univerAPI.toggleDarkMode(darkRef.current)
  }, [resolvedTheme])
  useEffect(() => {
    const element = container.current
    const frame = requestAnimationFrame(() => {
      demoRef.current = createDemo(element, darkRef.current)
    })
    return () => {
      cancelAnimationFrame(frame)
      const current = (window as typeof window & { pelicanDemo?: ReturnType<typeof createDemo> }).pelicanDemo
      const demo = current?.container === element ? current : demoRef.current
      demoRef.current = undefined
      queueMicrotask(() => demo?.dispose())
    }
  }, [])
  return <div ref={container} className="h-full" />
}
