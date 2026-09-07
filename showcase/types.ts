import type { ComponentType } from 'react'

import type { Files } from '@/components/playground/playground'

export const PRODUCT_IDS = [
  'sheets',
  'docs-modern',
  'docs-traditional',
  'slides',
  'boards',
  'bases',
  'pdfs',
  'embed',
] as const

export type ProductId = (typeof PRODUCT_IDS)[number]
export type ShowcaseCategory = 'features' | 'showcases' | 'integrations'
export type Localized<T> = Record<string, T>

export interface ShowcaseOption {
  id: string
  label: Localized<string>
  description?: Localized<string>
}

export interface ShowcaseApi {
  name: string
  description?: Localized<string>
}

export interface ShowcaseGuide {
  overview: Localized<string>
  tryIt: Localized<string[]>
  expected: Localized<string>
}

export interface ShowcaseMetadata {
  /** Reviewed native screenshot served from the public assets directory. */
  image?: string
  title: Localized<string>
  description: Localized<string>
  tags: Localized<string[]>
  product?: ProductId
  category?: ShowcaseCategory
  group?: Localized<string>
  packages?: string[]
  apis?: ShowcaseApi[]
  guide?: ShowcaseGuide
  variants?: ShowcaseOption[]
  actions?: ShowcaseOption[]
  states?: ShowcaseOption[]
  /** Fixed preview height in CSS pixels; omit to retain the standard 640px playground. */
  previewHeight?: number
}

export interface ShowcaseDefinition {
  metadata: ShowcaseMetadata
  files: Files
  Preview: ComponentType
}

export type ShowcaseRegistry = Record<string, () => Promise<{ default: ShowcaseDefinition }>>

export function localize<T>(value: Localized<T> | undefined, locale: string, fallback: T): T {
  return value?.[locale] ?? value?.['en-US'] ?? Object.values(value ?? {})[0] ?? fallback
}
