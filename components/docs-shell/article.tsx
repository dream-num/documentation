import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import type { DocsNavigation } from '@/lib/docs/navigation'
import { DocsPageActions } from '@/components/docs-page-actions'
import { Rate } from '@/components/rate'
import { Link } from '@/i18n/navigation'

import { DocsPagination } from './pagination'

export async function DocsArticle({
  title,
  description,
  githubUrl,
  markdownUrl,
  navigation,
  lang,
  children,
  onRateAction,
}: {
  title: string
  description?: string
  githubUrl: string
  markdownUrl: string
  navigation: DocsNavigation
  lang: string
  children: ReactNode
  onRateAction: Parameters<typeof Rate>[0]['onRateAction']
}) {
  const t = await getTranslations({ locale: lang as Locale })

  return (
    <article className="min-w-0">
      {navigation.activeTrail.length > 0 ? (
        <nav
          aria-label={t('docs.breadcrumb')}
          className="text-muted-foreground mb-4 flex gap-2 overflow-x-auto text-sm"
        >
          {navigation.activeTrail.map((item, index) => (
            <span className="inline-flex items-center gap-2 whitespace-nowrap" key={item.id}>
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {item.url && index < navigation.activeTrail.length - 1 ? (
                <Link className="hover:text-foreground" href={item.url}>
                  {item.name}
                </Link>
              ) : (
                <span>{item.name}</span>
              )}
            </span>
          ))}
        </nav>
      ) : null}
      <header className="border-b pb-6">
        <h1 className="text-4xl/tight font-semibold tracking-normal">{title}</h1>
        {description ? <p className="text-muted-foreground mt-4 max-w-3xl text-base">{description}</p> : null}
        <DocsPageActions githubUrl={githubUrl} markdownUrl={markdownUrl} />
      </header>
      <div className="mt-8 min-w-0">{children}</div>
      <div className="mt-10">
        <Rate lang={lang} onRateAction={onRateAction} />
      </div>
      <DocsPagination
        previous={navigation.previous}
        next={navigation.next}
        labels={{
          next: t('common.next-page'),
          pagination: t('docs.pagination'),
          previous: t('common.previous-page'),
        }}
      />
    </article>
  )
}
