'use client'

import type { UniverIconName } from '@/lib/univer-icons'
import {
  BasesMultiIcon,
  BoardsMultiIcon,
  DocsMultiIcon,
  SheetsMultiIcon,
  SlidesMultiIcon,
  SymbolsIcon,
} from '@univerjs/icons'

const icons = {
  BasesMultiIcon,
  BoardsMultiIcon,
  DocsMultiIcon,
  SheetsMultiIcon,
  SlidesMultiIcon,
  SymbolsIcon,
} satisfies Record<UniverIconName, typeof SheetsMultiIcon>

export function UniverIcon({
  className,
  name,
}: {
  className?: string
  name: UniverIconName
}) {
  const Icon = icons[name]

  return <Icon className={className} />
}
