import type { MDXComponents } from 'mdx/types'
import { PlaygroundFrame } from '@/components/playground/playground-frame'
import { Callout } from './callout'
import { Card, Cards } from './cards'
import { CodeBlockTab, CodeBlockTabs, CodeBlockTabsList, CodeBlockTabsTrigger, InlineCode } from './code-block'
import { createHeading } from './heading'
import { DocsImage } from './image'
import { InstallTabs, PackageInstallPre } from './install-tabs'
import { Mermaid } from './mermaid'
import { MetaData } from './meta-data'
import { Step, Steps } from './steps'
import { DocsTable } from './table'
import { Tab, Tabs } from './tabs'

export function getGuidesMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    h2: createHeading('h2'),
    h3: createHeading('h3'),
    h4: createHeading('h4'),
    img: DocsImage,
    table: DocsTable,
    pre: PackageInstallPre,
    code: InlineCode,
    CodeBlockTabs,
    CodeBlockTabsList,
    CodeBlockTabsTrigger,
    CodeBlockTab,
    InstallTabs,
    Tabs,
    Tab,
    Steps,
    Step,
    Callout,
    Cards,
    Card,
    Mermaid,
    MetaData,
    PlaygroundFrame,
    ...components,
  }
}
