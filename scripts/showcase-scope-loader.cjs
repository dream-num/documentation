// Development-only: remove unselected imports before webpack builds its module graph.
// A runtime filter is insufficient because webpack would still compile every import.
const entryPattern = /^\s*'([^']+)':\s*\(\)\s*=>\s*import\('([^']+)'\),?$/

function filterRegistry(source, slugs) {
  const lines = source.split(/\r?\n/)
  const available = new Set(lines.flatMap((line) => entryPattern.exec(line)?.[1] ?? []))
  if (!slugs.length) throw new Error('Select at least one Showcase slug.')
  for (const slug of slugs) {
    if (!available.has(slug)) throw new Error(`Unknown Showcase slug: ${slug}`)
  }
  const selected = new Set(slugs)
  return lines
    .map((line) => {
      const match = entryPattern.exec(line)
      return match && !selected.has(match[1]) ? '' : line
    })
    .join('\n')
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
