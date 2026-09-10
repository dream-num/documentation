'use client'

import { SiGithub } from '@icons-pack/react-simple-icons'
import { ChevronDown, FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface IDocsPageActionsProps {
  markdownUrl: string
  githubUrl: string
}

export function DocsPageActions({ markdownUrl, githubUrl }: IDocsPageActionsProps) {
  const t = useTranslations('docs')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t('page-actions')}
        className="bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-primary ml-auto inline-flex h-8 items-center gap-2 rounded-md border px-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <FileText aria-hidden="true" className="size-3.5" />
        {t('page-actions')}
        <ChevronDown aria-hidden="true" className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-max min-w-(--anchor-width)">
        {githubUrl && (
          <DropdownMenuItem
            render={(props) => (
              <a {...props} href={githubUrl} target="_blank" rel="noreferrer">
                {props.children}
              </a>
            )}
          >
            <SiGithub aria-hidden="true" className="size-4" />
            {t('open-in-github')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          render={(props) => (
            <a {...props} href={markdownUrl} target="_blank" rel="noreferrer">
              {props.children}
            </a>
          )}
        >
          <FileText aria-hidden="true" className="size-4" />
          {t('view-as-markdown')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
