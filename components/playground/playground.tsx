import type { ReactNode } from 'react'
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackProvider,
} from '@codesandbox/sandpack-react'

export type Files = Record<string, string>

interface IProps {
  lang: string
  files: Files
  preview: ReactNode
  options?: {
    showCodeEditor?: boolean
  }
}

export function Playground(props: IProps) {
  const { lang, preview, files, options = {} } = props

  const { showCodeEditor = true } = options

  const transformedFiles = Object.keys(files).reduce((acc, key) => {
    if (lang === 'en-US') {
      const value = files[key].replaceAll('zh-CN', 'en-US')
        .replaceAll('ZhCN', 'EnUS')
        .replaceAll('ZH_CN', 'EN_US')

      acc[key] = value
      return acc
    }

    acc[key] = files[key]

    return acc
  }, {} as Files)

  return (
    <section>
      <SandpackProvider
        customSetup={{
          dependencies: {},
          entry: '/index.ts',
        }}
        files={transformedFiles}
      >
        <SandpackLayout className="grid!">
          <div className="h-180!">{preview}</div>
          {showCodeEditor && (
            <SandpackCodeEditor
              className="h-180!"
              showTabs
              showLineNumbers
              readOnly
              showReadOnly={false}
            />
          )}
        </SandpackLayout>
      </SandpackProvider>
    </section>
  )
}
