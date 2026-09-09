// Development-only: remove unselected imports before Turbopack builds its module graph.
// A runtime filter is insufficient because Turbopack would still compile every import.
const entryPattern = /^[\t ]*'([^']+)':\s*\(\)\s*=>\s*import\('([^']+)'\),?[\t ]*$/gm

function filterRegistry(source, slugs) {
  const normalized = source.replaceAll('\r\n', '\n')
  const available = new Set([...normalized.matchAll(entryPattern)].map((match) => match[1]))
  if (!slugs.length) throw new Error('Select at least one Showcase slug.')
  for (const slug of slugs) {
    if (!available.has(slug)) throw new Error(`Unknown Showcase slug: ${slug}`)
  }
  const selected = new Set(slugs)
  return normalized.replace(entryPattern, (entry, slug) => (selected.has(slug) ? entry : entry.replace(/[^\n]/g, '')))
}

function showcaseScopeLoader(source) {
  return filterRegistry(source, this.getOptions().slugs)
}
module.exports = Object.assign(showcaseScopeLoader, { filterRegistry })
