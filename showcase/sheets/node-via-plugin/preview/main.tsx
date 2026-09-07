'use client'

import { useEffect, useState } from 'react'

import { createHeadlessDemo } from '../code/create-demo'

export default function Preview() {
  const [snapshot, setSnapshot] = useState('')

  useEffect(() => {
    let demo: ReturnType<typeof createHeadlessDemo> | undefined
    const frame = requestAnimationFrame(() => {
      demo = createHeadlessDemo()
      setSnapshot(JSON.stringify(demo.snapshot, null, 2))
    })
    return () => {
      cancelAnimationFrame(frame)
      queueMicrotask(() => demo?.dispose())
    }
  }, [])

  return (
    <pre
      className="h-full overflow-auto bg-neutral-950 p-4 text-sm text-neutral-100"
      aria-label="Headless workbook snapshot"
    >
      {snapshot}
    </pre>
  )
}
