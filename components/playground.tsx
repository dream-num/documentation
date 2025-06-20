import type { SandpackSetup } from '@codesandbox/sandpack-react'
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from '@codesandbox/sandpack-react'
import { customTranslations } from '@/lib/i18n'
import { ClickToShowButton } from './click-to-show-button'

export type Denpendencies = SandpackSetup['dependencies']
export type Files = Record<string, string>

interface IProps {
  lang: string
  dependencies: Denpendencies
  files: Files
  options?: {
    clickToShow?: boolean
    showCodeEditor?: boolean
  }
}

export function Playground(props: IProps) {
  const { lang, dependencies, files, options = {} } = props

  const { clickToShow = false, showCodeEditor = true } = options

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

  const sandbox = (
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
          {showCodeEditor && <SandpackCodeEditor className="h-180!" showTabs showLineNumbers />}
        </SandpackLayout>
      </SandpackProvider>
    </section>
  )

  if (clickToShow) {
    return (
      <ClickToShowButton
        showText={customTranslations[lang]['playground.click-to-show']}
        hideText={customTranslations[lang]['playground.click-to-hide']}
      >
        {sandbox}
      </ClickToShowButton>
    )
  }

  return sandbox
}
