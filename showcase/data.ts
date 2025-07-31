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
  'sheets/node-via-plugin': import('./sheets/node-via-plugin'),
  'sheets/big-data': import('./sheets/big-data'),
  'sheets/csv-import-plugin': import('./sheets/csv-import-plugin'),
  'sheets/custom-canvas': import('./sheets/custom-canvas'),
  'sheets/custom-menu': import('./sheets/custom-menu'),
  'sheets/custom-formula': import('./sheets/custom-formula'),
  'sheets/custom-shortcuts': import('./sheets/custom-shortcuts'),
  'sheets/permission': import('./sheets/permission'),
  'sheets/images': import('./sheets/images'),
  'sheets/hyper-link': import('./sheets/hyper-link'),
  'sheets/notes': import('./sheets/notes'),
  'sheets/crosshair-highlighting': import('./sheets/crosshair-highlighting'),
  'sheets/watermark': import('./sheets/watermark'),
  'sheets/charts': import('./sheets/charts'),
  'sheets/print': import('./sheets/print'),
  'sheets/migrate-from-luckysheet': import('./sheets/migrate-from-luckysheet'),
  'sheets/cross-workbook-formula': import('./sheets/cross-workbook-formula'),
  'docs/slim-via-plugin': import('./docs/slim-via-plugin'),
  'docs/slim-via-preset': import('./docs/slim-via-preset'),
  'docs/lit': import('./docs/lit'),
  'docs/node-via-plugin': import('./docs/node-via-plugin'),
  'docs/big-data': import('./docs/big-data'),
  'docs/watermark': import('./docs/watermark'),
  'slides/basic-via-plugin': import('./slides/basic-via-plugin'),
}
