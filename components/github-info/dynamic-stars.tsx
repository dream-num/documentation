'use client'

import { LoaderCircleIcon } from 'lucide-react'
import dynamic from 'next/dynamic'

export const DynamicStars = dynamic(() => import('./stars'), {
  ssr: false,
  loading: () => (
    <p className="flex items-center gap-1 text-xs text-muted-foreground">
      <LoaderCircleIcon className="size-3 animate-spin text-primary" />
    </p>
  ),
})
