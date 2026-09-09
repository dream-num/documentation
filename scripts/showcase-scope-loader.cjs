// Development-only: remove unselected imports before webpack builds its module graph.
// A runtime filter is insufficient because webpack would still compile every import.
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
const createScopeAudit = (slugs) => ({
  apply(compiler) {
    let previous = ''
    compiler.hooks.afterCompile.tap('ShowcaseScopeAudit', (compilation) => {
      const entries = new Set()
      let documentModules = 0
      for (const compiledModule of compilation.modules) {
        const resource = compiledModule.resource?.replaceAll('\\', '/') ?? ''
        if (/\/content\/.*\.mdx$/.test(resource)) documentModules++
        const match = resource.match(/\/showcase\/([^/]+\/[^/]+)\/(?:index\.ts|preview\/[^/]+\.[jt]sx?)$/)
        if (match) entries.add(match[1])
      }
      for (const slug of entries) {
        if (!slugs.includes(slug)) throw new Error(`Unselected demo entered the webpack graph: ${slug}`)
      }
      const current = [...entries].toSorted().join(', ') + `; document MDX modules: ${documentModules}`
      if (current && current !== previous) console.info(`[Showcase scope audit] ${compiler.name}: ${current}`)
      previous = current
    })
  },
})

module.exports = Object.assign(showcaseScopeLoader, { filterRegistry, createScopeAudit })
