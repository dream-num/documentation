'use client'

import { SearchIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'

interface IReferenceMember {
  title: string
  url: string
}

export function ReferenceMemberIndex({ items }: { items: IReferenceMember[] }) {
  const t = useTranslations('docs.reference')
  const id = useId()
  const [query, setQuery] = useState('')
  const term = query.trim().toLocaleLowerCase()
  const matches = items.filter((item) => item.title.toLocaleLowerCase().includes(term))

  const links = (
    <ul className="m-0! grid max-h-72 list-none! gap-1 overflow-y-auto overscroll-contain p-2! sm:grid-cols-2">
      {matches.map((member) => (
        <li className="m-0! min-w-0 p-0!" key={member.url}>
          <a
            className="hover:bg-accent focus-visible:bg-accent block rounded px-2 py-1.5 font-mono text-xs wrap-break-word no-underline! focus-visible:outline-2"
            href={member.url}
          >
            {member.title}
          </a>
        </li>
      ))}
    </ul>
  )

  return (
    <nav aria-label={t('label')} className="not-prose my-6 rounded-lg border border-(--separator)">
      <label
        className="focus-within:ring-ring flex items-center gap-2 rounded-t-lg px-3 py-3 focus-within:ring-2"
        htmlFor={id}
      >
        <SearchIcon aria-hidden="true" className="text-muted-foreground size-4 shrink-0" />
        <span className="sr-only">{t('filter')}</span>
        <input
          className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none"
          id={id}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('filter')}
          type="search"
          value={query}
        />
      </label>
      {term ? (
        <div className="border-t border-(--separator)">
          <p aria-live="polite" role="status" className="text-muted-foreground m-0 px-3 pt-3 text-xs">
            {matches.length ? t('matches', { count: matches.length }) : t('empty')}
          </p>
          {links}
        </div>
      ) : (
        <details className="border-t border-(--separator)">
          <summary className="text-muted-foreground cursor-pointer px-3 py-2 text-xs focus-visible:outline-2">
            {t('browse', { count: items.length })}
          </summary>
          {links}
        </details>
      )}
    </nav>
  )
}
