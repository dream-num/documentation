'use client'

import {
  BasesAppIcon,
  BasesMultiIcon,
  BoardsAppIcon,
  BoardsMultiIcon,
  DocsAppIcon,
  DocsMultiIcon,
  PdfAppIcon,
  PdfMultiIcon,
  SheetsAppIcon,
  SheetsMultiIcon,
  SlidesAppIcon,
  SlidesMultiIcon,
} from '@univerjs/icons'

import type { UniverIconName } from '@/lib/univer-icons'

const icons = {
  BasesAppIcon,
  BasesMultiIcon,
  BoardsAppIcon,
  BoardsMultiIcon,
  DocsAppIcon,
  DocsMultiIcon,
  PdfAppIcon,
  PdfMultiIcon,
  SheetsAppIcon,
  SheetsMultiIcon,
  SlidesAppIcon,
  SlidesMultiIcon,
} satisfies Record<UniverIconName, typeof SheetsMultiIcon>

export function UniverIcon({ className, name }: { className?: string; name: UniverIconName }) {
  const Icon = icons[name]

  return <Icon className={className} />
}
