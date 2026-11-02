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
    if (!isValidElement<ITabProps>(child)) {
      return fallback
    }
    return child.props.label ?? fallback
  }

  const childrenArray = Children.toArray(children)
  const labels = items ?? childrenArray.map((child, index) => getChildLabel(child, `Tab ${index + 1}`))
  const defaultValue = labels[0] ?? 'tab-1'
  const install = variant === 'install'

  return (
    <TabsRoot
      className={clsx(install ? 'my-6' : 'my-6 gap-0 overflow-hidden rounded-lg border bg-card shadow-sm', className)}
      data-mdx-tabs
      defaultValue={defaultValue}
    >
      <TabsList
        className={clsx(
          install
            ? 'inline-flex h-8 w-fit max-w-full self-start overflow-x-auto rounded-lg bg-muted p-[3px]'
            : 'flex h-auto w-full max-w-full justify-start overflow-x-auto rounded-none border-b bg-muted/45 p-1',
        )}
      >
        {labels.map((label) => (
          <TabsTrigger
            className={clsx(
              install
                ? 'h-[calc(100%-1px)] flex-1 rounded-[calc(var(--radius)-0.125rem)] px-1.5 py-0.5 text-foreground/60 transition-all hover:text-foreground dark:hover:text-foreground'
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

        return (
          <TabsContent
            className={clsx(
              'm-0',
              install
                ? 'p-0 *:data-code-block:my-0'
                : 'p-4 has-[>[data-code-block]:only-child]:p-0 [&>[data-code-block]:only-child]:my-0 [&>[data-code-block]:only-child]:rounded-none [&>[data-code-block]:only-child]:border-0 [&>[data-code-block]:only-child]:shadow-none',
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
