import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { runInNewContext, Script } from 'node:vm'

test('Office Lab invitation prototype keeps membership and invitation counts consistent', async () => {
  const html = await readFile(new URL('../invite-prototype.univer.html', import.meta.url), 'utf8')
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1]
  assert.ok(script)
  assert.doesNotThrow(() => new Script(script))
  const viewBoundary = script.indexOf('const ui =')
  assert.ok(viewBoundary > 0)
  const { state, createInvitation, cancelInvitation, matchingMembers, resetDemo } = runInNewContext(
    `${script.slice(0, viewBoundary)}\n;({ state, createInvitation, cancelInvitation, matchingMembers, resetDemo })`,
  )
  assert.equal(state.members.length, 10)
  assert.equal(matchingMembers('', 'Active').length, 8)
  assert.equal(matchingMembers('', 'Pending').length, 2)
  assert.equal(createInvitation('  JORDAN@EXAMPLE.COM  ', 'Editor').ok, false)
  assert.equal(createInvitation('maya@example.com', 'Editor').ok, false)
  assert.equal(createInvitation('not-an-email', 'Editor').ok, false)
  assert.equal(createInvitation('new@example.com', 'Owner').ok, false)
  assert.equal(state.members.length, 10)
  assert.equal(createInvitation('Avery.Stone@example.com', 'Viewer').ok, true)
  assert.equal(state.members[0].name, 'Avery Stone')
  assert.equal(state.members[0].role, 'Viewer')
  assert.equal(matchingMembers('avery', 'Pending').length, 1)
  assert.equal(matchingMembers('avery', 'Active').length, 0)
  assert.equal(createInvitation('avery.stone@example.com', 'Viewer').ok, false)
  assert.equal(cancelInvitation('maya@example.com'), false)
  assert.equal(cancelInvitation('avery.stone@example.com'), true)
  assert.equal(matchingMembers('', 'Pending').length, 2)
  assert.equal(createInvitation('avery.stone@example.com', 'Editor').ok, true)
  resetDemo()
  assert.equal(state.members.length, 10)
  assert.equal(state.sent, 0)
  assert.equal(state.blocked, 0)
  assert.ok(!/fetch\(|XMLHttpRequest|localStorage|sessionStorage/.test(script))
})
