import type { ComponentProps, ReactNode } from 'react'
import { isValidElement } from 'react'

import type { InstallCommandOverride, PackageManager } from './install-command'
import { CodeBlock } from './code-block'
import { buildInstallCommand, PACKAGE_MANAGERS } from './install-command'
import { Tab, Tabs } from './tabs'

export interface IInstallTabsProps {
  dev?: boolean
  overrides?: Partial<Record<PackageManager, InstallCommandOverride>>
  packages: string | readonly string[]
}

export function InstallTabs({ dev = false, overrides, packages }: IInstallTabsProps) {
  return (
    <Tabs items={[...PACKAGE_MANAGERS]} variant="install">
      {PACKAGE_MANAGERS.map((manager) => (
        <Tab key={manager}>
          <CodeBlock className="px-4 text-sm/5" data-language="sh">
            <code>{buildInstallCommand(manager, packages, dev, overrides?.[manager])}</code>
          </CodeBlock>
        </Tab>
      ))}
    </Tabs>
  )
}

export function PackageInstallPre({ className, children, ...props }: ComponentProps<'pre'>) {
  function extractText(node: ReactNode): string {
    if (typeof node === 'string' || typeof node === 'number') return String(node)
    if (Array.isArray(node)) return node.map(extractText).join('')
    if (!isValidElement<{ className?: unknown; children?: ReactNode }>(node)) return ''

    const text = extractText(node.props.children)

    return typeof node.props.className === 'string' && node.props.className.split(/\s+/).includes('line')
      ? `${text}\n`
      : text
  }

  const isPackageInstall = className?.split(/\s+/).includes('language-package-install')
  const packages = extractText(children)
    .trim()
    .split('\n')
    .map((line) => line.match(/^npm install\s+(.+)$/)?.[1])

  if (isPackageInstall && packages.every((packageGroup): packageGroup is string => Boolean(packageGroup))) {
    return <InstallTabs packages={packages} />
  }

  return (
    <CodeBlock className={className} {...props}>
      {children}
    </CodeBlock>
  )
}
