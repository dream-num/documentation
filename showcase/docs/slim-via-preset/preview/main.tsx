'use client'

import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import docsCoreZhCN from '@univerjs/preset-docs-core/locales/zh-CN'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { useEffect, useRef } from 'react'
import { DOCUMENT_DATA } from './data'

import '@univerjs/preset-docs-core/lib/index.css'

export default function Preview() {
  const divRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    const { univerAPI } = createUniver({
      locale: LocaleType.ZH_CN,
      locales: {
        [LocaleType.ZH_CN]: merge(
          {},
          docsCoreZhCN,
        ),
      },
      presets: [
        UniverDocsCorePreset({
          container: divRef.current,
        }),
      ],
    })

    univerAPI.createUniverDoc(DOCUMENT_DATA)
  }, [])

  return (
    <div ref={divRef} className="h-full" />
  )
}
