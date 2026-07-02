'use client'

import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { isValidElement } from 'react'
import {
  TabsContent,
  TabsList,
  Tabs as TabsRoot,
  TabsTrigger,
} from '@/components/ui/tabs'
import { clsx } from '@/lib/clsx'

interface TabProps extends ComponentProps<'div'> {
  label?: string
}

function getChildLabel(child: ReactNode, fallback: string) {
  if (!isValidElement<TabProps>(child)) return fallback
  return child.props.label ?? fallback
}

function hasCodeBlock(node: ReactNode): boolean {
  if (!node) return false
  if (Array.isArray(node)) return node.some(hasCodeBlock)
  if (!isValidElement<{ children?: ReactNode }>(node)) return false
  if (node.type === 'pre') return true

  return hasCodeBlock(node.props.children)
}

function toChildArray(children: ReactNode): ReactNode[] {
  if (children === null || children === undefined) return []
  return Array.isArray(children) ? children : [children]
}

export function Tabs({
  items,
  children,
  className,
}: {
  items?: string[]
  children: ReactNode
  className?: string
}) {
  const childrenArray = toChildArray(children)
  const labels = items ?? childrenArray.map((child, index) => getChildLabel(child, `Tab ${index + 1}`))
  const defaultValue = labels[0] ?? 'tab-1'

  return (
    <TabsRoot
      className={clsx('my-6 gap-0 overflow-hidden rounded-lg border bg-card shadow-sm', className)}
      data-mdx-tabs
      defaultValue={defaultValue}
    >
      <TabsList
        className="flex h-auto w-full max-w-full justify-start overflow-x-auto rounded-none border-b bg-muted/45 p-1"
      >
        {labels.map(label => (
          <TabsTrigger className="flex-none px-3 py-1.5" key={label} value={label}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {childrenArray.map((child, index) => {
        const label = labels[index] ?? `Tab ${index + 1}`
        const codeOnly = hasCodeBlock(child)

        return (
          <TabsContent
            className={clsx(
              'm-0',
              codeOnly
                ? `
                  p-0
                  *:data-code-block:my-0 *:data-code-block:rounded-none *:data-code-block:border-0
                  *:data-code-block:shadow-none
                `
                : 'p-4',
            )}
            key={label}
            value={label}
          >
            {child}
          </TabsContent>
        )
      })}
    </TabsRoot>
  )
}

export function Tab({
  children,
}: TabProps): ReactElement {
  return <>{children}</>
}
