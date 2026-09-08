import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'

import { readShowcaseSources } from './showcase-sources.mjs'

const require = createRequire(import.meta.url)
const { parser } = require('next/dist/compiled/babel/bundle')
const expected = {
  '@univerjs-pro/boards-ui/locale/en-US': ['boards-ui.settings.findBoardElements'],
  '@univerjs-pro/embed-unit-ui/locale/en-US': ['embed-unit-ui.referencedUnitViewer.base'],
  '@univerjs-pro/shape-editor-ui/locale/en-US': [
    'shape-editor-ui.formulaBinding.baseUnit',
    'shape-editor-ui.formulaShape.baseUnit',
  ],
  '@univerjs-pro/bases-ui/locale/en-US': [
    'bases-ui.collaboration.localTooltip',
    'bases-ui.collaboration.notCollabTooltip',
    'bases-ui.fieldConfig.formulaReferenceError',
    'bases-ui.fieldConfig.referenceCurrentField',
    'bases-ui.fieldMenu.createSharedBaseField',
    'bases-ui.viewMenus.setWorkingDaysDescription',
    'bases-ui.formula.generic.engineDescription',
  ],
}
const official = Object.fromEntries(
  await Promise.all(Object.keys(expected).map(async (name) => [name, (await import(name)).default])),
)
const originalPacks = JSON.stringify(official)
function evaluate(node, bindings) {
  if (node.type === 'StringLiteral') return node.value
  if (node.type === 'Identifier') return bindings[node.name]
  if (node.type === 'MemberExpression')
    return evaluate(node.object, bindings)[node.computed ? node.property.value : node.property.name]
  assert.equal(node.type, 'ObjectExpression')
  const value = {}
  for (const property of node.properties) {
    if (property.type === 'SpreadElement') Object.assign(value, evaluate(property.argument, bindings))
    else value[property.key.name ?? property.key.value] = evaluate(property.value, bindings)
  }
  return value
}
function flatten(node, prefix = '', result = {}) {
  assert.equal(node.type, 'ObjectExpression')
  for (const property of node.properties) {
    if (property.type === 'SpreadElement') continue
    const key = prefix + (property.key.name ?? property.key.value)
    if (property.value.type === 'ObjectExpression') flatten(property.value, `${key}.`, result)
    else {
      assert.equal(property.value.type, 'StringLiteral')
      result[key] = property.value.value
    }
  }
  return result
}
const sources = await readShowcaseSources()
const files = sources.flatMap(({ slug, files: exportedFiles }) =>
  Object.entries(exportedFiles)
    .filter(([name]) => /\.tsx?$/.test(name))
    .map(([name, source]) => ({ name: `${slug}${name}`, source })),
)
files.push({ name: 'home demo', source: fs.readFileSync('components/univer/univer.tsx', 'utf8') })
let checked = 0
for (const { name, source } of files) {
  if (!Object.keys(expected).some((pack) => source.includes(pack))) continue
  const ast = parser().parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] })
  const packs = new Map()
  const bindings = {}
  const merges = new Set()
  for (const node of ast.program.body) {
    if (node.type !== 'ImportDeclaration') continue
    for (const specifier of node.specifiers) {
      if (specifier.type === 'ImportDefaultSpecifier' && expected[node.source.value]) {
        packs.set(specifier.local.name, expected[node.source.value])
        bindings[specifier.local.name] = official[node.source.value]
      }
      if (specifier.type === 'ImportSpecifier' && specifier.imported.name === 'mergeLocales')
        merges.add(specifier.local.name)
    }
  }
  let calls = 0
  function visit(node) {
    if (!node || typeof node !== 'object') return
    if (node.type === 'CallExpression' && merges.has(node.callee.name)) {
      const keys = node.arguments.flatMap((arg) => packs.get(arg.name) ?? [])
      if (keys.length) {
        const overrides = flatten(node.arguments.at(-1))
        assert.deepEqual(
          Object.keys(overrides).toSorted(),
          keys.toSorted(),
          `${name}: override only product terminology`,
        )
        for (const [key, value] of Object.entries(overrides)) {
          assert.doesNotMatch(value, /\b(?:board|boards|base|bases)\b/i, `${name}: ${key}`)
          assert.match(value, /canvas|relational table/i, `${name}: ${key}`)
        }
        assert.match(overrides['bases-ui.fieldConfig.referenceCurrentField'] ?? '{0} {1}', /\{0\}.*\{1\}/)
        const original = Object.assign(
          {},
          ...node.arguments.filter((arg) => packs.has(arg.name)).map((arg) => bindings[arg.name]),
        )
        const preserved = structuredClone(original)
        for (const [path, value] of Object.entries(overrides)) {
          const parts = path.split('.')
          let target = preserved
          for (const part of parts.slice(0, -1)) target = target[part]
          target[parts.at(-1)] = value
        }
        assert.deepEqual(
          evaluate(node.arguments.at(-1), bindings),
          preserved,
          `${name}: shallow mergeLocales must retain all untouched official translations`,
        )
        calls++
      }
    }
    for (const [key, value] of Object.entries(node)) {
      if (['loc', 'extra', 'comments'].includes(key)) continue
      if (Array.isArray(value)) value.forEach(visit)
      else if (value && typeof value === 'object') visit(value)
    }
  }
  visit(ast)
  assert.ok(calls, `${name}: complete official locale packs plus demo-local product names`)
  checked += calls
}
assert.ok(checked > 0)
assert.equal(JSON.stringify(official), originalPacks, 'Imported SDK locale packs remain untouched')
console.log(
  `PASS ${checked} independent locale configurations: product names overridden, API keys and formula translations preserved`,
)
