import type { MDXComponents } from 'mdx/types'
import { createGenerator } from 'fumadocs-typescript'
import { AutoTypeTable } from 'fumadocs-typescript/ui'
import { Step, Steps } from 'fumadocs-ui/components/steps'
import { Tab, Tabs } from 'fumadocs-ui/components/tabs'
import defaultMdxComponents from 'fumadocs-ui/mdx'
import { APITable } from '@/components/api-table'
import { MetaData } from '@/components/meta-data'
import { PlaygroundFrame } from '@/components/playground'

const generator = createGenerator()

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...components,
    Tabs,
    Tab,
    Steps,
    Step,
    MetaData,
    AutoTypeTable: props => (
      <AutoTypeTable
        class="hidden"
        {...props}
        generator={generator}
      />
    ),
    APITable,
    PlaygroundFrame,
  }
}
