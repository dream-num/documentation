'use client'

import dynamic from 'next/dynamic'

import Spinner from '@/components/animata/spinner'

import type { IUniverProps } from './univer'

const UniverPlayground = dynamic(() => import('./univer'), {
  ssr: false,
  loading: () => (
    <div
      className={`mx-auto flex h-[34rem] w-7xl max-w-full items-center justify-center rounded-2xl border border-neutral-200 bg-white/70 shadow-2xl shadow-sky-950/10 backdrop-blur-sm sm:h-160 dark:border-neutral-800 dark:bg-neutral-950/70`}
    >
      <Spinner />
    </div>
  ),
})

export default function UniverClient(props: IUniverProps) {
  return <UniverPlayground {...props} />
}
