'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'

import { createDemo } from '../code/create-demo'

export default function Preview() {
  const container = useRef<HTMLDivElement>(null!)
  const demo = useRef<ReturnType<typeof createDemo> | undefined>(undefined)
  useLayoutEffect(
    () => () => {
      // Child windows must still exist when their SDK owners are released.
      void demo.current?.dispose().catch(console.error)
      demo.current = undefined
    },
    [],
  )
  useEffect(() => {
    let active = true
    // Strict Mode's discarded setup must not start an SDK render lifecycle.
    queueMicrotask(() => {
      if (active) demo.current = createDemo(container.current)
    })
    return () => {
      active = false
    }
  }, [])
  return <div ref={container} className="h-full min-h-0" />
}
