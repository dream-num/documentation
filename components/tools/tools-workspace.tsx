'use client'

import type { ReactNode } from 'react'
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import type { IDocsNavItem } from '@/lib/docs/navigation'
import { Button } from '@/components/ui/button'
import { TooltipContent, TooltipRoot, TooltipTrigger } from '@/components/ui/tooltip'
import { Link, usePathname } from '@/i18n/navigation'
import { clsx } from '@/lib/clsx'
import { isPathActive } from '@/lib/locale-path'

export function ToolsWorkspace({ children, items }: { children: ReactNode; items: IDocsNavItem[] }) {
  const t = useTranslations()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="container mx-auto flex min-h-[calc(100dvh-5.5rem)] items-start gap-4 px-4 lg:min-h-[calc(100dvh-3rem)]">
      <aside
        data-collapsed={collapsed}
        className="group/tools hidden w-12 shrink-0 self-stretch border-r pr-3 lg:block xl:w-44 xl:data-[collapsed=true]:w-12"
      >
        <div className="sticky top-12 max-h-[calc(100dvh-3rem)] overflow-y-auto py-5">
          <div className="mb-2 hidden h-8 items-center justify-between xl:flex">
            <span className={clsx('text-muted-foreground px-2 text-xs font-medium', collapsed && 'hidden')}>
              {t('tools.section')}
            </span>
            <TooltipRoot>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground size-8"
                    aria-label={t(collapsed ? 'tools.expand-navigation' : 'tools.collapse-navigation')}
                    aria-expanded={!collapsed}
                    aria-controls="tools-navigation"
                    onClick={() => setCollapsed(!collapsed)}
                  />
                }
              >
                {collapsed ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                {t(collapsed ? 'tools.expand-navigation' : 'tools.collapse-navigation')}
              </TooltipContent>
            </TooltipRoot>
          </div>
          <nav id="tools-navigation" aria-label={t('tools.section')} className="space-y-1">
            {items.map(
              (item) =>
                item.url && (
                  <TooltipRoot key={item.id}>
                    <TooltipTrigger
                      render={
                        <Link
                          href={item.url}
                          aria-label={item.name}
                          aria-current={isPathActive(pathname, item.url) ? 'page' : undefined}
                          className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-ring aria-[current=page]:bg-muted aria-[current=page]:text-foreground flex min-h-9 items-center gap-2 rounded-md px-2 py-2 text-sm leading-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 aria-[current=page]:font-medium"
                        />
                      }
                    >
                      {item.icon}
                      <span className="hidden min-w-0 group-data-[collapsed=true]/tools:hidden xl:block">
                        {item.name}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12}>
                      {item.name}
                    </TooltipContent>
                  </TooltipRoot>
                ),
            )}
          </nav>
        </div>
      </aside>
      <main className="@container/tools min-w-0 flex-1 py-5">{children}</main>
    </div>
  )
}
