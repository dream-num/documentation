'use client'

import { useShiki } from 'fumadocs-core/highlight/client'
import { Suspense } from 'react'

import { clsx } from '@/lib/clsx'

interface ICodePreviewProps {
  code: string
  language: 'javascript' | 'json' | 'html' | 'markdown' | 'bash'
  label?: string
  className?: string
}

function HighlightedCode({ code, language }: ICodePreviewProps) {
  return useShiki(code, {
    lang: language,
    themes: { light: 'vitesse-light', dark: 'vitesse-dark' },
    defaultColor: false,
    components: { pre: ({ children }) => children },
  })
}

export function CodePreview({ code, language, label, className }: ICodePreviewProps) {
  return (
    <pre
      tabIndex={0}
      aria-label={label}
      data-language={language}
      className={clsx(
        'overflow-auto p-3 font-mono text-xs leading-5 [&_span]:text-(--shiki-light) dark:[&_span]:text-(--shiki-dark)',
        className,
      )}
    >
      <Suspense fallback={<code>{code}</code>}>
        <HighlightedCode code={code} language={language} />
      </Suspense>
    </pre>
  )
}
