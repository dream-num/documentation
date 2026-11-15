import type { ComponentProps, ReactNode } from 'react'
import { Children, isValidElement } from 'react'
import { clsx } from '@/lib/clsx'
import type { IConfigOption } from './config-options'
import { InlineCode } from './code-block'
import { ConfigOptions } from './config-options'

export function DocsTable({ className, children, ...props }: ComponentProps<'table'>) {
  const isElement = isValidElement<{ children?: ReactNode }>

  const text = (node: ReactNode): string =>
    Children.toArray(node)
      .map((child) => (isValidElement<{ children?: ReactNode }>(child) ? text(child.props.children) : String(child)))
      .join('')

  function isConfigHeader(node: ReactNode): boolean {
    return Children.toArray(node)
      .filter(isElement)
      .some((child) => 'data-config-options' in child.props || isConfigHeader(child.props.children))
  }

  const sections = Children.toArray(children).filter(isElement)
  const head = sections.find((section) => section.type === 'thead')
  if (head && isConfigHeader(head)) {
    const headerRow = Children.toArray(head.props.children).find(isElement)
    const headers = Children.toArray(headerRow?.props.children).filter(isElement)
    const body = sections.find((section) => section.type === 'tbody')
    const ancestors: number[] = []
    const source = Children.toArray(body?.props.children).filter(isElement)
    const rows: IConfigOption[] = []
    for (const row of source) {
      const index = rows.length
      const cells = Children.toArray(row.props.children).filter(isElement)
      const key = Children.toArray(cells[0]?.props.children)
        .filter(isElement)
        .find((child) => child.type === ConfigKey)
      const depth = key ? (key.props as IConfigKeyProps).depth : 0
      const name = text(cells[0]?.props.children)
      while (ancestors.length > depth) {
        rows[ancestors.pop()!].end = index
      }
      const parent = rows[ancestors.at(-1) ?? -1]
      const arrayItem = parent && /\[\](?:\s*\||$)|^(?:Readonly)?Array</.test(text(parent.type))
      rows.push({
        name,
        depth,
        ancestors: [...ancestors],
        path: parent ? `${parent.path}${arrayItem ? '[]' : ''}${name.startsWith('[') ? '' : '.'}${name}` : name,
        type: cells[1]?.props.children,
        defaultValue: text(cells[2]?.props.children).trim() ? cells[2]?.props.children : undefined,
        description: cells[3]?.props.children,
        end: source.length,
      })
      ancestors.push(index)
    }

    return (
      <ConfigOptions id={props.id} className={className} defaultLabel={text(headers[2]?.props.children)} rows={rows} />
    )
  }

  return (
    <div className="my-5 overflow-x-auto rounded-lg border border-(--separator)">
      <table
        className={clsx(
          `w-full border-collapse text-left text-sm [&_tbody]:divide-y [&_tbody]:divide-(--separator) [&_td]:px-3 [&_td]:py-2.5 [&_td]:align-top [&_td]:text-foreground/85 [&_th]:bg-muted/70 [&_th]:px-3 [&_th]:py-2.5 [&_th]:font-semibold [&_th]:whitespace-nowrap [&_th]:text-foreground`,
          className,
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}

interface IConfigKeyProps {
  children: ReactNode
  depth: number
}

export function ConfigKey({ children }: IConfigKeyProps) {
  return <InlineCode>{children}</InlineCode>
}
