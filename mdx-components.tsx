import type { MDXComponents } from 'mdx/types'
import type { ComponentProps } from 'react'
import { createGenerator } from 'fumadocs-typescript'
import { AutoTypeTable } from 'fumadocs-typescript/ui'
import { Card } from 'fumadocs-ui/components/card'
import { Step, Steps } from 'fumadocs-ui/components/steps'
import { Tab, Tabs } from 'fumadocs-ui/components/tabs'
import defaultMdxComponents from 'fumadocs-ui/mdx'
import Link from 'next/link'

import { APITable } from '@/components/mdx/api-table'
import { Mermaid } from '@/components/mdx/mermaid'
import { MetaData } from '@/components/mdx/meta-data'
import { PlaygroundFrame } from '@/components/playground/playground-frame'
import { localizePath } from '@/lib/i18n'

const generator = createGenerator()

interface IResolvablePage {
  path: string
}

interface IResolvableSource<Page extends IResolvablePage> {
  resolveHref: (href: string, page: Page) => string
}

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
export function createLocalizedRelativeLink<Page extends IResolvablePage>(
  source: IResolvableSource<Page>,
  page: Page,
  language: string,
) {
  function LocalizedRelativeLink({ href, ...props }: ComponentProps<'a'>) {
    if (typeof href !== 'string') {
      return <a href={href} {...props} />
    }

    return <Link href={localizePath(source.resolveHref(href, page), language)} {...props} />
  }

  return LocalizedRelativeLink
}

export function getMDXComponents(language: string, components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Card: ({ href, ...props }: ComponentProps<typeof Card>) => (
      <Card href={href ? localizePath(href, language) : href} {...props} />
    ),
    ...components,
    Tabs,
    Tab,
    Steps,
    Step,
    Mermaid,
    MetaData,
    AutoTypeTable: AutoTypeTableWrapper,
    APITable,
    PlaygroundFrame: props => <PlaygroundFrame {...props} lang={language} />,
  }
}
