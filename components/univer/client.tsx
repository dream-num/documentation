'use client'

import dynamic from 'next/dynamic'
import Spinner from '@/components/animata/spinner'

const UniverPlayground = dynamic(() => import('./univer'), {
  ssr: false,
  loading: () => (
    <div
      className={`
        flex min-h-120 w-full items-center justify-center rounded-2xl border border-neutral-200 bg-white/70 shadow-sm
        backdrop-blur-sm
        dark:border-neutral-800 dark:bg-neutral-950/70
      `}
    >
      <Spinner />
    </div>
  ),
})

export default function UniverClient() {
  return <UniverPlayground />
}
