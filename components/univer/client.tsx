'use client'

import dynamic from 'next/dynamic'

import Spinner from '@/components/animata/spinner'

import type { IUniverProps } from './univer'

const UniverPlayground = dynamic(() => import('./univer'), {
  ssr: false,
  loading: () => (
    <div className="w-full" aria-busy="true">
      <div className="mb-5 flex justify-center px-4" aria-hidden="true">
        <div className="bg-muted grid h-21 w-full max-w-sm grid-cols-3 gap-0.5 rounded-lg p-1 sm:h-11.5 sm:w-128 sm:max-w-none sm:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex items-center justify-center gap-1.5">
              <div className="bg-background/70 size-4 rounded-sm" />
              <div className="bg-background/70 h-2 w-9 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
      <div className="border-border relative mx-auto flex h-[34rem] w-7xl max-w-full items-center justify-center rounded-lg border sm:h-160 dark:border-white/10">
        <Spinner />
      </div>
    </div>
  ),
})

export default function UniverClient(props: IUniverProps) {
  return <UniverPlayground {...props} />
}
