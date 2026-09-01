import assert from 'node:assert/strict'
import test from 'node:test'

import { buildInstallCommand } from '../install-command.ts'

test('builds default, appended, replaced, and development install commands', () => {
  assert.equal(buildInstallCommand('pnpm', '@univerjs/core', false), 'pnpm add @univerjs/core')
  assert.equal(
    buildInstallCommand('yarn', '@univerjs/core', false, { append: 'react react-dom rxjs' }),
    'yarn add @univerjs/core react react-dom rxjs',
  )
  assert.equal(buildInstallCommand('npm', '@univerjs/core', false, { replace: 'npm ci' }), 'npm ci')
  assert.equal(buildInstallCommand('bun', 'typescript', true), 'bun add -d typescript')
  assert.equal(
    buildInstallCommand('pnpm', ['@univerjs-pro/bases@alpha', '@univerjs-pro/bases@beta'], false),
    'pnpm add @univerjs-pro/bases@alpha\npnpm add @univerjs-pro/bases@beta',
  )
})
