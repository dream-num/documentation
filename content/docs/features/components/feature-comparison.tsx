import type { ReactNode } from 'react'
import { Children, isValidElement } from 'react'
import { FeatureComparisonTable } from './feature-comparison-table'

interface IContentProps {
  children: ReactNode
  id: string
  'data-support': string
  'data-summary': string
  'data-open-source': string
}

export interface IFeatureGroup {
  id: string
  title: string
  heading: ReactNode
  header: ReactNode
  rows: {
    children: ReactNode
    text: string
    openSource: boolean
    differs: boolean
  }[]
}

export function FeatureComparison({
  children,
  groups,
  compareSummaries = true,
}: {
  children: ReactNode
  groups: string[]
  compareSummaries?: boolean
}) {
  const content = Children.toArray(children).filter(isValidElement<IContentProps>)
  const sections = groups.map((title, index) => {
    const heading = content[index * 2]
    const table = content[index * 2 + 1]
    const [header, body] = Children.toArray(table.props.children).filter(isValidElement<IContentProps>)
    return {
      id: heading.props.id,
      title,
      heading,
      header,
      rows: Children.toArray(body.props.children)
        .filter(isValidElement<IContentProps>)
        .map((row) => {
          const support = Children.toArray(row.props.children)
            .filter(isValidElement<IContentProps>)
            .slice(1)
            .map((cell) => Children.toArray(cell.props.children).find(isValidElement<IContentProps>)!.props)
          const text: string[] = [title, ' ']
          function collectText(nodes: ReactNode) {
            Children.forEach(nodes, (node) => {
              if (isValidElement<IContentProps>(node)) collectText(node.props.children)
              else if (typeof node === 'string' || typeof node === 'number') text.push(String(node))
            })
          }
          collectText(row.props.children)
          return {
            children: row.props.children,
            text: text.join('').toLocaleLowerCase(),
            openSource: support[0]['data-open-source'] === 'true',
            differs: support.some(
              (cell) =>
                cell['data-support'] !== support[0]['data-support'] ||
                (compareSummaries && cell['data-summary'] !== support[0]['data-summary']),
            ),
          }
        }),
    }
  })

  return <FeatureComparisonTable groups={sections} />
}
