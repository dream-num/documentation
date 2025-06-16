'use client'

import dynamic from 'next/dynamic'

export default dynamic(() => import('./icon-block'), {
  ssr: false,
})
