import type { MDXComponents } from 'mdx/types'
import { APITable } from '@/components/mdx/api-table'
import { Mermaid } from '@/components/mdx/mermaid'
import { MetaData } from '@/components/mdx/meta-data'
import { PlaygroundFrame } from '@/components/playground'
import { Callout } from './callout'
import { Card, Cards } from './cards'
import {
  CodeBlock,
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
  InlineCode,
} from './code-block'
import { createHeading } from './heading'
import { DocsImage } from './image'
import { Step, Steps } from './steps'
import { DocsTable } from './table'
import { Tab, Tabs } from './tabs'

function AutoTypeTableWrapper() {
  return null
}

export function getGuidesMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    h2: createHeading('h2'),
    h3: createHeading('h3'),
    h4: createHeading('h4'),
    img: DocsImage,
    table: DocsTable,
    pre: CodeBlock,
    code: InlineCode,
    CodeBlockTabs,
    CodeBlockTabsList,
    CodeBlockTabsTrigger,
    CodeBlockTab,
    Tabs,
    Tab,
    Steps,
    Step,
    Callout,
    Cards,
    Card,
    Mermaid,
    MetaData,
    AutoTypeTable: AutoTypeTableWrapper,
    APITable,
    PlaygroundFrame,
    ...components,
  }
}
