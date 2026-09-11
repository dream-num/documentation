'use client'

import { FxIcon } from '@univerjs/icons'
import { ChevronDown, X } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useState } from 'react'

const labels: Record<string, [string, string, string]> = {
  'en-US': ['Name box', 'Name manager', 'Close name manager'],
  'zh-CN': ['名称框', '名称管理器', '关闭名称管理器'],
  'zh-TW': ['名稱方塊', '名稱管理員', '關閉名稱管理員'],
  'ja-JP': ['名前ボックス', '名前の管理', '名前の管理を閉じる'],
  'ko-KR': ['이름 상자', '이름 관리자', '이름 관리자 닫기'],
  'fr-FR': ['Zone Nom', 'Gestionnaire de noms', 'Fermer le gestionnaire de noms'],
  'es-ES': ['Cuadro de nombre', 'Administrador de nombres', 'Cerrar el administrador de nombres'],
  'ru-RU': ['Поле имени', 'Диспетчер имен', 'Закрыть диспетчер имен'],
}

export function DefinedNamesDemo() {
  const [nameBox, manager, closeManager] = labels[useLocale()]

  const [managerOpen, setManagerOpen] = useState(false)

  return (
    <section
      aria-label={manager}
      className="not-prose my-4 overflow-hidden rounded-lg border border-neutral-200 bg-white text-sm dark:border-neutral-800 dark:bg-neutral-950"
    >
      <div className="flex h-10 items-center gap-3 border-b border-neutral-200 bg-neutral-100 px-2 dark:border-neutral-800 dark:bg-neutral-900">
        <details
          className="relative"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.currentTarget.open = false
              event.currentTarget.querySelector('summary')?.focus()
            }
          }}
        >
          <summary
            aria-label={nameBox}
            className="flex h-7 w-24 cursor-pointer list-none items-center justify-between rounded border border-neutral-200 bg-white px-2 text-blue-600 focus-visible:outline-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-blue-400 [&::-webkit-details-marker]:hidden"
          >
            <span aria-hidden="true" className="h-1.5 w-10 rounded-full bg-neutral-300 dark:bg-neutral-600" />
            <ChevronDown aria-hidden="true" className="size-4" />
          </summary>
          <div className="absolute top-full left-0 z-10 mt-1 w-40 rounded-md border border-neutral-200 bg-white p-1 shadow-sm dark:border-neutral-700 dark:bg-neutral-950">
            <div aria-hidden="true" className="space-y-3 border-b border-neutral-100 px-2 py-3 dark:border-neutral-800">
              <div className="h-1.5 w-16 rounded-full bg-neutral-300 dark:bg-neutral-600" />
              <div className="h-1.5 w-24 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            </div>
            <button
              type="button"
              className="mt-1 w-full rounded px-2 py-1.5 text-left text-blue-600 hover:bg-blue-50 focus-visible:outline-2 dark:text-blue-400 hover:dark:bg-blue-950"
              onClick={(event) => {
                setManagerOpen(true)
                event.currentTarget.closest('details')?.removeAttribute('open')
              }}
            >
              {manager}
            </button>
          </div>
        </details>
        <FxIcon aria-hidden="true" className="size-4 shrink-0 text-neutral-400" />
        <span aria-hidden="true" className="h-1.5 w-24 rounded-full bg-neutral-300 dark:bg-neutral-600" />
      </div>
      <div className="flex h-32">
        <div
          aria-hidden="true"
          className="relative min-w-0 flex-1 bg-[linear-gradient(to_right,var(--color-neutral-100)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-neutral-100)_1px,transparent_1px)] bg-size-[48px_24px] dark:bg-[linear-gradient(to_right,var(--color-neutral-900)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-neutral-900)_1px,transparent_1px)]"
        >
          <div className="absolute top-6 left-12 h-12 w-24 border border-blue-500 bg-blue-50/70 dark:bg-blue-950/50" />
        </div>
        {managerOpen && (
          <aside
            aria-label={manager}
            className="w-40 shrink-0 border-l border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
          >
            <div className="flex h-9 items-center justify-between border-b border-neutral-100 px-2 dark:border-neutral-800">
              <span className="text-xs text-neutral-600 dark:text-neutral-300">{manager}</span>
              <button
                type="button"
                aria-label={closeManager}
                autoFocus
                className="flex size-7 items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 focus-visible:outline-2 hover:dark:bg-neutral-800"
                onClick={(event) => {
                  event.currentTarget.closest('section')?.querySelector('summary')?.focus()
                  setManagerOpen(false)
                }}
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            </div>
            <div aria-hidden="true" className="space-y-3 p-3">
              <div className="h-1.5 w-16 rounded-full bg-blue-400 dark:bg-blue-500" />
              <div className="h-1.5 w-24 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            </div>
          </aside>
        )}
      </div>
    </section>
  )
}
