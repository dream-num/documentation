import * as BaseTabs from '@base-ui/react/tabs'

import { clsx } from '@/lib/clsx'

function Tabs({ className, orientation = 'horizontal', ...props }: BaseTabs.Tabs.Root.Props) {
  return (
    <BaseTabs.Tabs.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={clsx('flex flex-col gap-2', className)}
      orientation={orientation}
      {...props}
    />
  )
}

function TabsList({ className, ...props }: BaseTabs.Tabs.List.Props) {
  return (
    <BaseTabs.Tabs.List
      data-slot="tabs-list"
      className={clsx(
        'bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]',
        className,
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: BaseTabs.Tabs.Tab.Props) {
  return (
    <BaseTabs.Tabs.Tab
      data-slot="tabs-trigger"
      className={clsx(
        `text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring data-active:bg-background dark:text-muted-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-active:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: BaseTabs.Tabs.Panel.Props) {
  return <BaseTabs.Tabs.Panel data-slot="tabs-content" className={clsx('flex-1 outline-none', className)} {...props} />
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
