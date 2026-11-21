import type { MetaData, PageData, StaticSource } from 'fumadocs-core/source'
import type { ElementType } from 'react'
import { loader } from 'fumadocs-core/source'
import { icons as lucideIcons } from 'lucide-react'
import { createElement } from 'react'
import { IconWrapper } from '@/components/icon-wrapper'
import { UniverIcon } from '@/components/univer-icon'
import { fumadocsI18n } from '@/i18n/fumadocs'
import { isUniverIconName } from '@/lib/univer-icons'
import { getGuideContentPlacementTargetFromUrl } from './content-placements'

const lucideIconComponents = lucideIcons as unknown as Record<string, ElementType<{ className?: string }>>

// Navigation-only and article loaders share exactly the same tree transformations.
export function createGuidesLoader<P extends PageData, M extends MetaData>(
  source: StaticSource<{ pageData: P; metaData: M }>,
  baseUrl = '/guides',
) {
  return loader({
    baseUrl,
    source,
    i18n: fumadocsI18n,
    pageTree: {
      transformers: [
        {
          file(node, filePath) {
            if (filePath) return node
            const target = getGuideContentPlacementTargetFromUrl(node.url)
            if (!target) return node
            const targetPage = this.storage.read(`${target}.mdx`)
            if (targetPage?.format !== 'page')
              throw new Error(`Guide content placement target not found: ${target}.mdx`)
            return { ...node, name: targetPage.data.title ?? node.name }
          },
        },
      ],
    },
    icon(icon) {
      if (!icon) return
      if (icon in lucideIconComponents)
        return createElement(IconWrapper, { type: 'icon', icon: lucideIconComponents[icon] })
      if (isUniverIconName(icon)) return createElement(UniverIcon, { name: icon })
      return createElement(IconWrapper, { type: 'text', text: icon })
    },
  })
}
