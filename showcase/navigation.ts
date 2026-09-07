import type { ShowcaseMetadata } from './types'
import entries from './catalog.generated.json'

export const showcaseNavigation = entries as Array<{ slug: string; metadata: ShowcaseMetadata }>
