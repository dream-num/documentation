import type { ComponentType } from 'react'
import type { Files } from '@/components/playground'

export const showcase: Record<string, Promise<{ default: {
  metadata: {
    title: Record<string, string>
    description: Record<string, string>
    tags: Record<string, string[]>
  }
  files: Files
  Preview: ComponentType
} }>> = {
  'sheets/slim-via-plugin': import('./sheets/slim-via-plugin'),
  'sheets/slim-via-preset': import('./sheets/slim-via-preset'),
  'sheets/basic-via-plugin': import('./sheets/basic-via-plugin'),
  'sheets/basic-via-preset': import('./sheets/basic-via-preset'),
  'sheets/lit': import('./sheets/lit'),
  'docs/slim-via-plugin': import('./docs/slim-via-plugin'),
  'docs/slim-via-preset': import('./docs/slim-via-preset'),
}
