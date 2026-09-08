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

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'))
  process.exit(1)
}

console.log(`Validated ${registered.length} registered demos and their source entries.`)

function walk(directory) {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(target) : [target]
  })
}
