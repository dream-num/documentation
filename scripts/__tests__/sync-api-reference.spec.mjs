import assert from 'node:assert/strict'
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { API } from 'typescript/unstable/sync'
import { eventFieldType } from '../sync-api-reference.mjs'

test('event fields expose string union values while retaining enum and object types', (t) => {
  const directory = realpathSync(mkdtempSync(join(tmpdir(), 'reference-event-types-')))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const source = join(directory, 'events.ts')
  const config = join(directory, 'tsconfig.json')
  writeFileSync(
    source,
    `
    type Reason = 'ack_timeout' | 'request_failed' | 'license_editing_connections_exceeded';
    enum Action { Apply = 'apply', Revert = 'revert' }
    interface IEntry { id: string }
    interface IEvent { reason: Reason; action: Action; entry: IEntry; attempt: number }
  `,
  )
  writeFileSync(config, JSON.stringify({ files: [source], compilerOptions: { types: [] } }))
  const api = new API()
  t.after(() => api.close())
  const project = api.updateSnapshot({ openProjects: [config] }).getProject(config)
  const payload = project.program.getSourceFile(source).statements.find((node) => node.name?.getText() === 'IEvent')
  const fields = Object.fromEntries(
    payload.members.map((field) => [
      field.name.getText(),
      eventFieldType(project.checker, project.checker.getTypeAtLocation(field.type)),
    ]),
  )

  assert.deepEqual(
    new Set(fields.reason.split(' | ')),
    new Set(['"ack_timeout"', '"request_failed"', '"license_editing_connections_exceeded"']),
  )
  assert.equal(fields.action, 'Action')
  assert.equal(fields.entry, 'IEntry')
  assert.equal(fields.attempt, 'number')
})
