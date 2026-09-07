import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

import { Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'

import { readShowcaseSources } from './showcase-sources.mjs'

// Verify the installed SDK contract, not an assumption about method names.
const univer = new Univer()
let ownerDisposed = false
univer.onDispose(() => {
  ownerDisposed = true
})
const api = FUniver.newAPI(univer)
api.dispose()
assert.equal(ownerDisposed, false, 'Facade disposal does not destroy its owning Univer')
univer.dispose()
assert.equal(ownerDisposed, true)
const secondOwner = new Univer()
const secondFacade = FUniver.newAPI(secondOwner)
let facadeDisposedWithOwner = false
secondFacade.disposeWithMe({
  dispose() {
    facadeDisposedWithOwner = true
  },
})
secondOwner.dispose()
assert.equal(facadeDisposedWithOwner, true, 'Destroying the owner also releases its Facade')

const cases = await readShowcaseSources()
const previews = await Promise.all(cases.map(({ slug }) => fs.readFile(`showcase/${slug}/preview/main.tsx`, 'utf8')))
const findings = []
const legacyPreviewFindings = []
for (const [index, { slug, files }] of cases.entries()) {
  const source = files['/src/create-demo.ts']
  for (const match of (source ?? '').matchAll(/\b(?:api|univerAPI)\??\.dispose\(\)/g)) {
    findings.push({
      slug,
      file: `showcase/${slug}/code/create-demo.ts`,
      line: source.slice(0, match.index).split('\n').length,
      call: match[0],
    })
  }
  const preview = previews[index]
  for (const match of preview.matchAll(/\b(?:api|univerAPI)\??\.dispose\(\)/g)) {
    legacyPreviewFindings.push({
      slug,
      file: `showcase/${slug}/preview/main.tsx`,
      line: preview.slice(0, match.index).split('\n').length,
      call: match[0],
    })
  }
}
const directory = path.resolve('test-results/showcase-disposal')
await fs.mkdir(directory, { recursive: true })
await fs.writeFile(
  path.join(directory, 'report.json'),
  JSON.stringify(
    {
      cases: cases.length,
      ownerContractVerified: true,
      facadeDisposedWithOwner,
      findings,
      legacyPreviewFindings,
      scope:
        'Named api/univerAPI disposal calls (including optional chaining and member properties) in exported create-demo.ts and actual Preview files. Arbitrary aliases and pending asynchronous callbacks require separate review and browser tests.',
    },
    null,
    2,
  ),
)
console.log(
  JSON.stringify(
    {
      cases: cases.length,
      findings: findings.length,
      legacyPreviewFindings: legacyPreviewFindings.length,
      routes: [...findings, ...legacyPreviewFindings].map((item) => item.slug),
    },
    null,
    2,
  ),
)
assert.equal(findings.length, 0, 'Demo teardown must release the owning Univer, not only its Facade')
assert.equal(legacyPreviewFindings.length, 0, 'Legacy Previews must release their owning Univer too')
