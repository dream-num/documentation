import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { createProEmbedProductCapabilities } from '@univerjs-pro/embed'
import { UniverInstanceType } from '@univerjs/core'

const plan = JSON.parse(fs.readFileSync('showcase/capabilities/embed-product-plan.json', 'utf8'))
const blueprints = JSON.parse(fs.readFileSync('showcase/capabilities/blueprints.json', 'utf8'))
const types = {
  sheets: UniverInstanceType.UNIVER_SHEET,
  'docs-modern': UniverInstanceType.UNIVER_DOC,
  'docs-traditional': UniverInstanceType.UNIVER_DOC,
  slides: UniverInstanceType.UNIVER_SLIDE,
  boards: UniverInstanceType.UNIVER_BOARD,
  bases: UniverInstanceType.UNIVER_BASE,
}
const capabilities = createProEmbedProductCapabilities()
const pairs = plan.cases.filter((item) => ['float', 'tab', 'block'].includes(item.mode))
for (const item of plan.cases) {
  assert.ok(
    blueprints.some((blueprint) => blueprint.id === item.id && blueprint.route === item.route),
    item.id,
  )
  assert.ok(
    fs.existsSync(path.join('../office.univer.ai/research-assets/showcase-references', item.referenceAsset)),
    item.referenceAsset,
  )
}
for (const item of pairs) {
  assert.ok(
    capabilities.some(
      (capability) =>
        capability.hostType === types[item.host] &&
        capability.childType === types[item.child] &&
        capability.mode === (item.mode === 'block' ? 'float' : item.mode),
    ),
    item.route,
  )
}
for (const capability of capabilities.filter((item) => item.hostType !== item.childType)) {
  assert.ok(
    pairs.some(
      (item) =>
        types[item.host] === capability.hostType &&
        types[item.child] === capability.childType &&
        (item.mode === 'block' ? 'float' : item.mode) === capability.mode,
    ),
    'Every declared cross-product SDK pair/mode has an independent planned case',
  )
}
assert.equal(plan.cases.length, 68)
assert.equal(new Set(plan.cases.map((item) => item.route)).size, 68)
assert.equal(pairs.length, 32)
assert.equal(plan.cases.filter((item) => item.mode === 'mixed').length, 6)
const formulas = plan.cases.filter((item) => item.mode.startsWith('formula'))
assert.equal(formulas.length, 30)
assert.equal(plan.formulaCatalog.plannedCases, formulas.length)
for (const source of ['sheets', 'bases']) {
  for (const target of ['docs-modern', 'docs-traditional', 'slides', 'boards', 'charts']) {
    assert.ok(
      formulas.some((item) => item.dataFlow?.sources.includes(source) && item.dataFlow.targets.includes(target)),
      source + ' -> ' + target,
    )
  }
}
for (const item of formulas.filter((candidate) => candidate.dataFlow)) {
  assert.ok(item.dataFlow.expected.length > 30, item.route + ' has independently checkable expected changes')
  assert.ok(item.variants.length >= 4, item.route + ' describes variations, not separate CRUD pages')
  assert.ok(item.dataFlow.sources.every((source) => ['sheets', 'bases'].includes(source)))
  const blueprint = blueprints.find((candidate) => candidate.id === item.id)
  assert.deepEqual(blueprint.dataFlow, item.dataFlow)
  if (item.child !== 'mixed' && !item.child.includes('+')) {
    assert.ok(
      capabilities.some(
        (capability) =>
          capability.hostType === types[item.host] &&
          capability.childType === types[item.child] &&
          capability.mode === (item.dataFlow.embeddingMode === 'block' ? 'float' : item.dataFlow.embeddingMode),
      ),
      item.route + ' native embedding declaration',
    )
  }
}
for (const mode of ['float', 'tab']) {
  assert.ok(
    formulas.some(
      (item) =>
        item.host === 'sheets' &&
        item.child === 'slides' &&
        item.dataFlow?.sources.includes('sheets') &&
        item.dataFlow.embeddingMode === mode,
    ),
    'Sheet-driven Slide@Sheet ' + mode,
  )
  assert.ok(
    formulas.some(
      (item) =>
        item.host === 'slides' &&
        item.child === 'sheets' &&
        item.dataFlow?.sources.includes('sheets') &&
        item.dataFlow.embeddingMode === mode,
    ),
    'Sheet-driven Sheet@Slide ' + mode,
  )
}
console.log(
  JSON.stringify({
    passed: true,
    plannedCases: plan.cases.length,
    pairCases: 32,
    composites: 6,
    formulas: formulas.length,
    installedCapabilities: capabilities.length,
    note: 'Planning/API-declaration coverage only; no runtime or complete SDK capability claim.',
  }),
)
