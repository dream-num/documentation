'use client'

import { useInView } from 'motion/react'
import dynamic from 'next/dynamic'
import { useRef } from 'react'
import Spinner from '@/components/animata/spinner'
import type { IUniverProps } from './univer'

function UniverLoading() {
  return (
    <div className="w-full" aria-busy="true">
      <div className="mb-5 flex justify-center px-4" aria-hidden="true">
        <div className="grid h-21 w-full max-w-sm grid-cols-3 gap-0.5 rounded-lg bg-muted p-1 sm:h-11.5 sm:w-128 sm:max-w-none sm:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex items-center justify-center gap-1.5">
              <div className="size-4 rounded-sm bg-background/70" />
              <div className="h-2 w-9 rounded-sm bg-background/70" />
            </div>
          ))}
        </div>
      </div>
      <div className="relative mx-auto flex h-160 w-7xl max-w-full items-center justify-center rounded-lg border border-border sm:h-200 dark:border-white/10">
        <Spinner />
      </div>
    </div>
  )
}

const UniverPlayground = dynamic(() => import('./univer'), {
  ssr: false,
  loading: UniverLoading,
})

export default function UniverClient(props: IUniverProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const visible = useInView(containerRef, { once: true, margin: '200px' })

  return <div ref={containerRef}>{visible ? <UniverPlayground {...props} /> : <UniverLoading />}</div>
}
