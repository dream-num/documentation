'use client'

import { ChevronDownIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { useRef, useState } from 'react'

import type { ISnapshotReport } from '@/lib/tools/snapshot-inspector'
import { FileActions } from '@/components/tools/file-actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { inspectSnapshot, isSnapshotObject, SNAPSHOT_MAX_BYTES, SNAPSHOT_SAMPLES } from '@/lib/tools/snapshot-inspector'

const SnapshotPreview = dynamic(() => import('./snapshot-preview').then((module) => module.SnapshotPreview), {
  ssr: false,
})

export function SnapshotInspectorTool() {
  const t = useTranslations('tools')
  const [source, setSource] = useState('')
  const [result, setResult] = useState<{ value: Record<string, unknown>; report: ISnapshotReport } | null>(null)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const revision = useRef(0)
  const update = (text: string) => {
    revision.current++
    setSource(text)
    setResult(null)
    setError('')
    setPreview(false)
  }
  const inspect = (text = source) => {
    setPreview(false)
    if (new TextEncoder().encode(text).length > SNAPSHOT_MAX_BYTES) {
      setError(t('too-large'))
      setResult(null)
      return
    }
    try {
      const value: unknown = JSON.parse(text)
      if (!isSnapshotObject(value)) throw new Error('object')
      setResult({ value, report: inspectSnapshot(value) })
      setError('')
    } catch {
      setResult(null)
      setError(t('invalid-json'))
    }
  }
  const upload = async (file?: File) => {
    if (!file) return
    const request = ++revision.current
    setPreview(false)
    setResult(null)
    setSource('')
    setError('')
    if (file.size > SNAPSHOT_MAX_BYTES) {
      setError(t('too-large'))
      return
    }
    try {
      const text = await file.text()
      if (request === revision.current) {
        setSource(text)
        inspect(text)
      }
    } catch {
      if (request === revision.current) setError(t('invalid-json'))
    }
  }
  const loadSample = (kind: keyof typeof SNAPSHOT_SAMPLES) => {
    const text = JSON.stringify(SNAPSHOT_SAMPLES[kind], null, 2)
    update(text)
    inspect(text)
  }
  const canPreview =
    result &&
    ['sheets', 'docs'].includes(result.report.kind) &&
    result.report.counts.cells <= 20000 &&
    !result.report.issues.some((issue) => issue.severity === 'error')
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t('snapshot-inspector')}</h1>
      <div className="grid items-start gap-3 @min-[48rem]/tools:grid-cols-2">
        <section className="min-w-0 overflow-hidden rounded-md border">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b p-2">
            <label htmlFor="snapshot-source" className="text-xs font-medium">
              {t('input')}
            </label>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" title={t('too-large')} onClick={() => inputRef.current?.click()}>
                {t('upload')}
              </Button>
              <Input
                ref={inputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                aria-label={t('upload')}
                onChange={(event) => {
                  upload(event.target.files?.[0]).catch(() => setError(t('invalid-json')))
                  event.target.value = ''
                }}
              />
              <Button size="sm" variant="ghost" onClick={() => loadSample('sheets')}>
                {t('sample')} · Sheets
              </Button>
              <Button size="sm" variant="ghost" onClick={() => loadSample('docs')}>
                Docs
              </Button>
            </div>
          </div>
          <Textarea
            id="snapshot-source"
            spellCheck={false}
            value={source}
            onChange={(event) => update(event.target.value)}
            placeholder={'{\n  "id": "workbook-1",\n  "sheetOrder": [],\n  "sheets": {}\n}'}
            className="block field-sizing-fixed h-88 resize-y rounded-none border-0 p-3 font-mono text-xs leading-5 shadow-none focus-visible:ring-inset"
          />
          <div className="flex flex-wrap items-center gap-1 border-t p-2">
            <Button size="sm" onClick={() => inspect()} disabled={!source.trim()}>
              {t('inspect')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={!result}
              onClick={() => {
                if (result) setSource(JSON.stringify(result.value, null, 2))
              }}
            >
              {t('format')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => update('')}>
              {t('clear')}
            </Button>
            <span className="text-muted-foreground ml-auto text-xs">{t('local-only')}</span>
          </div>
        </section>
        <section className="min-w-0 space-y-3 rounded-md border p-3" aria-live="polite">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">{t('issues')}</h2>
            {result && (
              <Badge variant="secondary" className="font-mono">
                {result.report.kind}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-xs leading-5">{t('checks-note')}</p>
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
          {result && (
            <>
              <dl className="flex flex-wrap gap-x-5 gap-y-2 border-y py-3">
                {Object.entries(result.report.counts).map(([key, count]) => (
                  <div key={key}>
                    <dt className="text-muted-foreground text-xs">
                      {t(key === 'resources' ? 'resource-count' : (key as keyof ISnapshotReport['counts']))}
                    </dt>
                    <dd className="text-sm font-semibold tabular-nums">{count.toLocaleString()}</dd>
                  </div>
                ))}
              </dl>
              {!result.report.issues.length ? (
                <p className="text-xs">{t('no-issues')}</p>
              ) : (
                <ul className="max-h-64 space-y-2 overflow-auto">
                  {result.report.issues.map((issue) => (
                    <li
                      key={`${issue.code}-${issue.path}`}
                      className="border-l-2 pl-2 text-xs"
                      style={{
                        borderColor: issue.severity === 'error' ? 'var(--destructive)' : 'var(--muted-foreground)',
                      }}
                    >
                      <span>{t(`diagnostics.${issue.code}`)}</span>
                      <code className="text-muted-foreground mt-0.5 block break-all">{issue.path}</code>
                    </li>
                  ))}
                </ul>
              )}
              <Collapsible className="border-t pt-2">
                <CollapsibleTrigger
                  render={<Button variant="ghost" size="sm" className="w-full justify-between px-0" />}
                >
                  {t('resources')}
                  <ChevronDownIcon className="size-3" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <dl className="max-h-48 space-y-1 overflow-auto py-2">
                    {result.report.sections.map((section) => (
                      <div key={section.name} className="flex justify-between gap-3 text-xs">
                        <dt className="truncate font-mono">{section.name}</dt>
                        <dd className="text-muted-foreground shrink-0 tabular-nums">
                          {section.bytes.toLocaleString()} B
                        </dd>
                      </div>
                    ))}
                  </dl>
                </CollapsibleContent>
              </Collapsible>
              <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!canPreview}
                  onClick={() => setPreview(!preview)}
                  aria-pressed={preview}
                >
                  {t('preview')}
                </Button>
                <FileActions
                  key={source}
                  content={JSON.stringify(result.value, null, 2)}
                  name="snapshot.json"
                  downloadLabel={t('download')}
                />
              </div>
              <p className="text-muted-foreground text-xs leading-5">{t('preview-note')}</p>
            </>
          )}
        </section>
      </div>
      {preview && canPreview && result && (
        <SnapshotPreview snapshot={result.value} kind={result.report.kind as 'sheets' | 'docs'} />
      )}
    </div>
  )
}
