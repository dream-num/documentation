'use client'

import {
  BasesMultiIcon,
  BoardsMultiIcon,
  DocsMultiIcon,
  PdfMultiIcon,
  SheetsMultiIcon,
  SlidesMultiIcon,
} from '@univerjs/icons'

import type { UniverIconName } from '@/lib/univer-icons'

const icons = {
  BasesMultiIcon,
  BoardsMultiIcon,
  DocsMultiIcon,
  PdfMultiIcon,
  SheetsMultiIcon,
  SlidesMultiIcon,
} satisfies Record<UniverIconName, typeof SheetsMultiIcon>

export function UniverIcon({ className, name }: { className?: string; name: UniverIconName }) {
  const Icon = icons[name]

  return <Icon className={className} />
}
