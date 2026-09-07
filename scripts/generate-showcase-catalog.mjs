import fs from 'node:fs/promises'

import { readShowcaseSources } from './showcase-sources.mjs'

// Metadata only: no Preview or SDK runtime enters the navigation module graph.
const entries = (await readShowcaseSources()).map(({ slug, metadata }) => ({ slug, metadata }))
await fs.writeFile('showcase/catalog.generated.json', JSON.stringify(entries, null, 2) + '\n')
console.log(`Generated full Showcase navigation: ${entries.length} entries`)
