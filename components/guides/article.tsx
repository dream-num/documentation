import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import type { IGuideNavigation } from '@/lib/guides/navigation'
import { DocsPageActions } from '@/components/docs-page-actions'
import { DocsPagination } from '@/components/docs-shell/pagination'
import { Rate } from '@/components/rate'
import { Link } from '@/i18n/navigation'

export async function GuidesArticle({
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
  navigation: IGuideNavigation
  lang: string
  children: ReactNode
  onRateAction: Parameters<typeof Rate>[0]['onRateAction']
}) {
  const t = await getTranslations({ locale: lang as Locale })

  return (
    <article className="mx-auto max-w-[50rem] min-w-0">
      <div className="mb-5 flex items-center justify-between gap-3">
        {navigation.activeTrail.length > 0 ? (
          <nav
            aria-label={t('docs.breadcrumb')}
            className="text-muted-foreground flex min-w-0 gap-2 overflow-x-auto text-sm"
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
        ) : (
          <span />
        )}
        <div className="shrink-0">
          <DocsPageActions githubUrl={githubUrl} markdownUrl={markdownUrl} />
        </div>
      </div>
      <header className="border-b border-(--separator) pb-6">
        <h1 className="text-[28px]/9 font-semibold tracking-normal">{title}</h1>
        {description ? <p className="text-muted-foreground mt-3 max-w-2xl text-base/[26px]">{description}</p> : null}
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
