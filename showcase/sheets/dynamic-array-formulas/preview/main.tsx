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
    demoRef.current?.univerAPI.toggleDarkMode(darkRef.current)
  }, [resolvedTheme])
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      demoRef.current = createDemo(container.current, darkRef.current)
    })
    return () => {
      cancelAnimationFrame(frame)
      const demo = demoRef.current
      demoRef.current = undefined
      queueMicrotask(() => demo?.dispose())
    }
  }, [])
  return <div ref={container} className="h-full min-h-0" />
}
