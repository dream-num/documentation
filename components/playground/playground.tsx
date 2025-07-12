'use client'

import type { ReactNode } from 'react'
import {
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackLayout,
  SandpackProvider,
} from '@codesandbox/sandpack-react'
import { useTheme } from 'next-themes'

export type Files = Record<string, string>

interface IProps {
  lang: string
  files: Files
  preview: ReactNode
}

export function Playground(props: IProps) {
  const { lang, preview, files } = props

  const { theme } = useTheme()

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

  transformedFiles['package.json'] = JSON.stringify({
    name: 'univer-playground',
    version: '1.0.0',
    main: 'src/index.ts',
    dependencies: {},
  }, null, 2)

  transformedFiles['index.html'] = `<!doctype html>
<html>
  <head>
    <title>Univer</title>
    <meta charset="UTF-8" />
  </head>
  <body>
    <div id="app"></div>
    <script src="index.js"></script>
  </body>
</html>
`
  transformedFiles['src/styles.css'] = `html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}
`

  return (
    <section>
      <SandpackProvider
        theme={theme === 'dark' ? 'dark' : 'light'}
        customSetup={{
          dependencies: {},
          entry: '/index.ts',
        }}
        files={transformedFiles}
      >
        <SandpackLayout className="grid!">
          <div className="h-160">{preview}</div>

          <div className="grid grid-cols-12">
            <SandpackFileExplorer
              className={`
                col-span-3 h-180! border-r border-neutral-100
                dark:border-neutral-800
              `}
            />
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
