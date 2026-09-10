import assert from 'node:assert/strict'
import { test } from 'node:test'

import { searchIcons } from '../catalog.ts'

test('semantic icon search combines purpose, product, style and source subgroup', () => {
  assert(searchIcons('duplicate').some((icon) => icon.componentName === 'CopyIcon'))
  const diagrams = searchIcons('boards connector', 'single', 'diagram')
  assert(diagrams.length > 0)
  assert(diagrams.every((icon) => icon.products.includes('boards') && icon.subgroup === 'diagram'))
  assert.deepEqual(searchIcons('SearchIcon', 'multi'), [])
  assert.equal(searchIcons('paint-bucket-double-icon', 'double')[0]?.componentName, 'PaintBucketDoubleIcon')
  assert.deepEqual(searchIcons('nonexistent-icon-xyz'), [])
})
