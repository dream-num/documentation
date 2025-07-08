import type { ReactNode } from 'react'
import {
  SandpackCodeEditor,
  SandpackFileExplorer,
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
    if (lang === 'zh-CN') {
      const value = files[key].replaceAll('en-US', 'zh-CN')
        .replaceAll('EnUS', 'ZhCN')
        .replaceAll('EN_US', 'ZH_CN')

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

          <div className="grid grid-cols-12">
            <SandpackFileExplorer className="col-span-2" />
            {showCodeEditor && (
              <SandpackCodeEditor
                className="col-span-10 h-180!"
                showLineNumbers
                readOnly
                showReadOnly={false}
                showTabs={false}
              />
            )}
          </div>
        </SandpackLayout>
      </SandpackProvider>
    </section>
  )
}
