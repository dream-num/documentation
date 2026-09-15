'use client'

import type { SVGAttributes } from 'react'
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

interface IUniverIconProps extends SVGAttributes<SVGSVGElement> {
  name: UniverIconName
}

export function UniverIcon({ name, ...props }: IUniverIconProps) {
  const Icon = icons[name]

  return <Icon {...props} />
}
