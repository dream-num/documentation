import type { MDXComponents } from 'mdx/types'
import type { ComponentProps } from 'react'
import { createGenerator } from 'fumadocs-typescript'
import { AutoTypeTable } from 'fumadocs-typescript/ui'
import { Step, Steps } from 'fumadocs-ui/components/steps'
import { Tab, Tabs } from 'fumadocs-ui/components/tabs'
import defaultMdxComponents from 'fumadocs-ui/mdx'
import { APITable } from '@/components/mdx/api-table'
import { Mermaid } from '@/components/mdx/mermaid'
import { MetaData } from '@/components/mdx/meta-data'
import { PlaygroundFrame } from '@/components/playground'

const generator = createGenerator()

function AutoTypeTableWrapper(props: ComponentProps<typeof AutoTypeTable>) {
  return (
    <AutoTypeTable
      className="hidden"
      {...props}
      generator={generator}
    />
  )
}

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...components,
    Tabs,
    Tab,
    Steps,
    Step,
    Mermaid,
    MetaData,
    AutoTypeTable: AutoTypeTableWrapper,
    APITable,
    PlaygroundFrame,
  }
}
