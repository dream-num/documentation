import type { SandpackSetup } from '@codesandbox/sandpack-react'
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from '@codesandbox/sandpack-react'

export type Denpendencies = SandpackSetup['dependencies']
export type Files = Record<string, string>

interface IProps {
  lang: string
  dependencies: Denpendencies
  files: Files
}

export function Playground(props: IProps) {
  const { lang, dependencies, files } = props

  const npmRegistries: SandpackSetup['npmRegistries'] = lang === 'zh-CN'
    ? [{
        enabledScopes: ['@univerjs', '@univerjs-pro'],
        limitToScopes: false,
        registryUrl: 'https://registry.npmmirror.com/',
        proxyEnabled: false,
      }]
    : []

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
          dependencies,
          npmRegistries,
          entry: '/index.ts',
        }}
        files={transformedFiles}
      >
        <SandpackLayout className="grid!">
          <SandpackPreview className="h-180!" showOpenInCodeSandbox={false} showRefreshButton={false} />
          <SandpackCodeEditor className="h-180!" showTabs showLineNumbers />
        </SandpackLayout>
      </SandpackProvider>
    </section>
  )
}
