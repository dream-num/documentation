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
  'sheets/basic-via-plugin': import('./sheets/basic-via-plugin'),
  'sheets/basic-via-preset': import('./sheets/basic-via-preset'),
}
