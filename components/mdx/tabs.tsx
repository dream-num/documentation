'use client'

import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { Children, isValidElement } from 'react'

import { TabsContent, TabsList, Tabs as TabsRoot, TabsTrigger } from '@/components/ui/tabs'
import { clsx } from '@/lib/clsx'

interface ITabProps extends ComponentProps<'div'> {
  label?: string
}

interface ITabsProps {
  children: ReactNode
  className?: string
  items?: string[]
  variant?: 'default' | 'install'
}

export function Tabs({ items, children, className, variant = 'default' }: ITabsProps) {
  function getChildLabel(child: ReactNode, fallback: string) {
    if (!isValidElement<ITabProps>(child)) return fallback
    return child.props.label ?? fallback
  }

  function hasCodeBlock(node: ReactNode): boolean {
    if (!node) return false
    if (Array.isArray(node)) return node.some(hasCodeBlock)
    if (!isValidElement<{ children?: ReactNode }>(node)) return false
    if (node.type === 'pre') return true

    return hasCodeBlock(node.props.children)
  }

  const childrenArray = Children.toArray(children)
  const labels = items ?? childrenArray.map((child, index) => getChildLabel(child, `Tab ${index + 1}`))
  const defaultValue = labels[0] ?? 'tab-1'
  const install = variant === 'install'

  return (
    <TabsRoot
      className={clsx(install ? 'my-6' : 'bg-card my-6 gap-0 overflow-hidden rounded-lg border shadow-sm', className)}
      data-mdx-tabs
      defaultValue={defaultValue}
    >
      <TabsList
        className={clsx(
          install
            ? 'bg-muted inline-flex h-8 w-fit max-w-full self-start overflow-x-auto rounded-lg p-[3px]'
            : 'bg-muted/45 flex h-auto w-full max-w-full justify-start overflow-x-auto rounded-none border-b p-1',
        )}
      >
        {labels.map((label) => (
          <TabsTrigger
            className={clsx(
              install
                ? 'text-foreground/60 hover:text-foreground hover:dark:text-foreground h-[calc(100%-1px)] flex-1 rounded-[calc(var(--radius)-0.125rem)] px-1.5 py-0.5 transition-all'
                : 'flex-none px-3 py-1.5',
            )}
            key={label}
            value={label}
          >
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
              install
                ? 'p-0 *:data-code-block:my-0'
                : codeOnly
                  ? `p-0 *:data-code-block:my-0 *:data-code-block:rounded-none *:data-code-block:border-0 *:data-code-block:shadow-none`
                  : 'p-4',
            )}
            key={label}
            keepMounted
            value={label}
          >
            {child}
          </TabsContent>
        )
      })}
    </TabsRoot>
  )
}

export function Tab({ children }: ITabProps): ReactElement {
  return <>{children}</>
}
