'use client'

import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import docsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'
import { DOCUMENT_DATA } from './data'

import '@univerjs/preset-docs-core/lib/index.css'

export default function Preview() {
  const divRef = useRef<HTMLDivElement>(null!)

  const { theme } = useTheme()

  useEffect(() => {
    const { univerAPI } = createUniver({
      darkMode: theme === 'dark',
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

    const listener = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, (event) => {
      event.stage === univerAPI.Enum.LifecycleStages.Steady && window.parent.postMessage({
        type: 'lifecycle',
        stage: 'steady',
      }, '*')
    })

    return () => {
      listener.dispose()
      univerAPI.dispose()
    }
  }, [theme])

  return (
    <div ref={divRef} className="h-full" />
  )
}
