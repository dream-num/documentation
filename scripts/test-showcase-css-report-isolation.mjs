import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'univer-css-report-isolation-'))
const runtimeReport = JSON.stringify({ passed: false, evidence: 'Native runtime failure must not be overwritten' })
fs.writeFileSync(path.join(directory, 'report.json'), runtimeReport)
execFileSync(process.execPath, ['scripts/test-showcase-css.mjs'], {
  env: { ...process.env, SHOWCASE_RESULTS_DIR: directory },
  stdio: 'pipe',
})
assert.equal(fs.readFileSync(path.join(directory, 'report.json'), 'utf8'), runtimeReport)
const css = JSON.parse(fs.readFileSync(path.join(directory, 'css-report.json'), 'utf8'))
assert.ok(css.cases.length > 0)
assert.deepEqual(css.issues, [])
console.log('PASS CSS audit preserves existing runtime reports: ' + directory)
