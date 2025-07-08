'use client'

import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import docsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { useEffect, useRef } from 'react'
import { DOCUMENT_DATA } from './data'

import '@univerjs/preset-docs-core/lib/index.css'

export default function Preview() {
  const divRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    const { univerAPI } = createUniver({
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: merge(
          {},
          docsCoreEnUS,
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
