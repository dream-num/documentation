'use client'

import type { ReactNode } from 'react'
import { SandpackCodeEditor, SandpackFileExplorer, SandpackLayout, SandpackProvider } from '@codesandbox/sandpack-react'
import { useTheme } from 'next-themes'

export type Files = Record<string, string>

interface IProps {
  files: Files
  dependencies: Record<string, string>
  preview: ReactNode
  previewHeight?: number
}

export function Playground(props: IProps) {
  const { preview, files, dependencies, previewHeight = 640 } = props

  const { theme } = useTheme()

  return (
    <section>
      <SandpackProvider
        options={{ autorun: false, activeFile: '/src/index.ts' }}
        theme={theme === 'dark' ? 'dark' : 'light'}
        customSetup={{
          dependencies,
          entry: '/src/index.ts',
        }}
        files={files}
      >
        <SandpackLayout className="grid! grid-cols-1">
          <div data-showcase-preview className="min-w-0" style={{ height: previewHeight }}>
            {preview}
          </div>

          <div className="grid min-w-0 grid-cols-12">
            <SandpackFileExplorer className="col-span-3 h-180! border-r border-neutral-100 dark:border-neutral-800" />
            <SandpackCodeEditor
              className="col-span-9 h-180!"
              showLineNumbers
              readOnly
              showReadOnly={false}
              showTabs={false}
            />
          </div>
        </SandpackLayout>
      </SandpackProvider>
    </section>
  )
}
