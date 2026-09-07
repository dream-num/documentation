import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const registrySource = fs.readFileSync(path.join(root, 'showcase/data.ts'), 'utf8')
const registered = [...registrySource.matchAll(/^\s*'([^']+)':\s*\(\)\s*=>\s*import\('([^']+)'\),?$/gm)]
const errors = []
const enhancedFixtures = new Map()

if (!registered.length) errors.push('No Showcase cases are registered in showcase/data.ts')

for (const [, slug, modulePath] of registered) {
  if (!fs.existsSync(path.resolve(root, 'showcase', modulePath, 'index.ts')))
    errors.push(`${slug}: registry import does not resolve: ${modulePath}`)
  const caseDirectory = path.join(root, 'showcase', ...slug.split('/'))
  const indexPath = path.join(caseDirectory, 'index.ts')
  const previewPath = path.join(caseDirectory, 'preview/main.tsx')

  for (const requiredPath of [indexPath, previewPath]) {
    if (!fs.existsSync(requiredPath)) errors.push(`${slug}: missing ${path.relative(root, requiredPath)}`)
  }
  if (!fs.existsSync(indexPath) || !fs.existsSync(previewPath)) continue

  const indexSource = fs.readFileSync(indexPath, 'utf8')
  const previewSource = fs.readFileSync(previewPath, 'utf8')
  for (const requiredExport of ['metadata', 'files', 'Preview']) {
    if (!indexSource.includes(requiredExport)) errors.push(`${slug}: index.ts does not expose ${requiredExport}`)
  }

  const enhanced = /\bguide\s*[:,]/.test(indexSource)
  if (!enhanced) continue

  for (const field of ['product', 'category', 'group', 'packages', 'apis', 'variants', 'actions', 'states']) {
    if (!new RegExp(`\\b${field}\\s*[:,]`).test(indexSource))
      errors.push(`${slug}: enhanced metadata is missing ${field}`)
  }

  const createDemoPath = path.join(caseDirectory, 'code/create-demo.ts')
  const standalonePath = path.join(caseDirectory, 'code/index.ts')
  if (!fs.existsSync(createDemoPath)) errors.push(`${slug}: enhanced case is missing code/create-demo.ts`)
  if (!previewSource.includes('../code/create-demo'))
    errors.push(`${slug}: Preview must import the displayed code/create-demo.ts`)
  if (!fs.existsSync(standalonePath) || !fs.readFileSync(standalonePath, 'utf8').includes('./create-demo')) {
    errors.push(`${slug}: standalone code/index.ts must import the same create-demo.ts`)
  }

  const dataFiles = walk(path.join(caseDirectory, 'code')).filter((file) => /(?:data|fixture)\.(?:ts|json)$/.test(file))
  const fixtureSource = dataFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n')
  if (/Math\.random\(|Date\.now\(|crypto\.randomUUID\(|new Date\(\s*\)/.test(fixtureSource)) {
    errors.push(`${slug}: fixture data must be deterministic`)
  }
  if (fixtureSource) {
    const fingerprint = createHash('sha256').update(fixtureSource.replace(/\s+/g, '')).digest('hex')
    const duplicate = enhancedFixtures.get(fingerprint)
    if (duplicate) errors.push(`${slug}: fixture is identical to ${duplicate}`)
    else enhancedFixtures.set(fingerprint, slug)
  }
}

const playgroundRoute = fs.readFileSync(path.join(root, 'app/[lang]/playground/[...slug]/page.tsx'), 'utf8')
if (!playgroundRoute.includes("'/reference/preview.tsx.txt'")) {
  errors.push('Playground must expose the real preview/main.tsx in the Source explorer')
}

const blueprints = JSON.parse(fs.readFileSync(path.join(root, 'showcase/capabilities/blueprints.json'), 'utf8'))
const firstWaveFixtures = JSON.parse(
  fs.readFileSync(path.join(root, 'showcase/capabilities/first-wave-fixtures.json'), 'utf8'),
).fixtures
const coverage = JSON.parse(fs.readFileSync(path.join(root, 'showcase/capabilities/coverage.json'), 'utf8'))
const blueprintIds = new Set(blueprints.map((item) => item.id))
for (const blueprint of blueprints) {
  if (blueprint.shell?.resetControl !== false || blueprint.shell?.stateControl !== false)
    errors.push(`${blueprint.id}: generic fixture/reset panels are excluded; use native UI or source-level diagnostics`)
}
const excludedHistory = JSON.parse(
  fs.readFileSync(path.join(root, 'showcase/capabilities/excluded-collaborative-history.json'), 'utf8'),
)
for (const entry of excludedHistory.blueprints) {
  if (blueprintIds.has(entry.id)) errors.push(`${entry.id}: collaborative history is excluded from frontend demos`)
}
if (blueprints.some((entry) => /revision history|version history/i.test(entry.title)))
  errors.push('Collaborative revision history must not enter the frontend-only capability plan')
const registeredSlugs = new Set(registered.map(([, slug]) => slug))
const assessed = new Set()
if (coverage.schemaVersion !== 1 || !Array.isArray(coverage.entries)) errors.push('Invalid coverage ledger schema')
for (const entry of coverage.entries ?? []) {
  if (!blueprintIds.has(entry.blueprintId)) errors.push(`Unknown coverage blueprint: ${entry.blueprintId}`)
  if (assessed.has(entry.blueprintId)) errors.push(`Duplicate coverage assessment: ${entry.blueprintId}`)
  assessed.add(entry.blueprintId)
  if (!['partial', 'verified'].includes(entry.status)) errors.push(`${entry.blueprintId}: invalid coverage status`)
  if (!entry.demos?.length) errors.push(`${entry.blueprintId}: no mapped demos`)
  for (const slug of entry.demos ?? []) {
    if (!registeredSlugs.has(slug)) errors.push(`${entry.blueprintId}: demo is not registered: ${slug}`)
  }
  if (entry.status === 'partial' && !entry.remaining?.length)
    errors.push(`${entry.blueprintId}: partial coverage needs explicit gaps`)
  if (entry.status === 'verified') {
    if (entry.remaining?.length) errors.push(`${entry.blueprintId}: verified coverage still has gaps`)
    for (const check of ['sourceParity', 'interaction', 'reset', 'rendering', 'accessibility', 'acceptance']) {
      if (!entry.evidence?.[check]?.length) errors.push(`${entry.blueprintId}: missing ${check} evidence`)
    }
  }
  for (const reference of Object.values(entry.evidence ?? {}).flat()) {
    const resolved = path.resolve(root, reference)
    if (!resolved.startsWith(root + path.sep) || !fs.existsSync(resolved)) {
      errors.push(`${entry.blueprintId}: evidence file is missing or outside the repository: ${reference}`)
    }
  }
}
const blueprintProducts = new Set([...blueprints, ...firstWaveFixtures].map((item) => item.product))
for (const product of ['sheets', 'docs-modern', 'docs-traditional', 'slides', 'boards', 'bases', 'pdfs', 'embed']) {
  if (!blueprintProducts.has(product)) errors.push(`Coverage backlog has no ${product} capabilities`)

  const productBlueprints = blueprints.filter((item) => item.product === product)
  if (productBlueprints.length < 20) errors.push(`Coverage backlog has fewer than 20 ${product} capabilities`)

  const productFixtures = firstWaveFixtures.filter((item) => item.product === product)
  if (productFixtures.length !== 3) errors.push(`First wave must define exactly three ${product} fixtures`)
}

for (const field of ['id', 'product', 'family', 'title', 'route', 'fixture', 'focus', 'interaction', 'acceptance']) {
  const missing = blueprints.filter((item) => !item[field])
  if (missing.length) errors.push(`${missing.length} capability blueprints are missing ${field}`)
}

for (const field of ['id', 'route']) {
  const values = blueprints.map((item) => item[field])
  const duplicates = [...new Set(values.filter((value, index) => values.indexOf(value) !== index))]
  if (duplicates.length) errors.push(`Duplicate capability ${field}: ${duplicates.join(', ')}`)
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'))
  process.exit(1)
}

console.log(
  `Validated ${registered.length} registered demos, ${blueprints.length} capability blueprints, and ${firstWaveFixtures.length} first-wave fixtures.`,
)
console.log(
  `Coverage ledger: ${coverage.entries.filter((entry) => entry.status === 'verified').length} verified, ${coverage.entries.filter((entry) => entry.status === 'partial').length} partial, ${blueprints.length - assessed.size} unassessed. These are capability assessments, not registry counts.`,
)

function walk(directory) {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(target) : [target]
  })
}
