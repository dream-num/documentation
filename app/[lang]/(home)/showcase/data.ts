import type { Denpendencies, Files } from '@/components/playground'

export const showcase: Record<string, Promise<{ default: {
  metadata: {
    title: Record<string, string>
    description: Record<string, string>
    tags: Record<string, string[]>
  }
  dependencies: Denpendencies
  files: Files
} }>> = {
  'sheets/slim-via-plugin': import('./sheets/slim-via-plugin'),
  'sheets/slim-via-preset': import('./sheets/slim-via-preset'),
  'sheets/basic-via-plugin': import('./sheets/basic-via-plugin'),
  'sheets/basic-via-preset': import('./sheets/basic-via-preset'),
}
