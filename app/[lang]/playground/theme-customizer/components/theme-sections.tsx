'use client'

import type { Theme } from '@univerjs/themes'
import type { ReactNode } from 'react'
import { Button, clsx, FormLayout, Input, Select, Textarea } from '@univerjs/design'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { ColorPickerPopover } from '@/components/color-picker-popover'

import type { LoopColorKey, ThemeScaleKey, ThemeShadeKey } from './types'
import { COLOR_SHADE_KEYS, LOOP_COLOR_KEYS, LOOP_COLOR_OPTIONS } from './constants'
import { normalizeHexColor } from './theme-utils'

export function ThemeCodeBlock({ children }: { children: ReactNode }) {
  return (
    <pre className={clsx(`m-0 overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-xs/6 text-slate-100`)}>
      {children}
    </pre>
  )
}

export function ThemeColorField(props: { label: string; value: string; onChange: (value: string) => void }) {
  const { label, value, onChange } = props
  const t = useTranslations()
  const [draftValue, setDraftValue] = useState(value)

  useEffect(() => {
    setDraftValue(value)
  }, [value])

  const error =
    draftValue.trim().length > 0 && !normalizeHexColor(draftValue) ? t('theme-customizer.invalid-hex') : undefined

  function handleInputChange(nextValue: string) {
    setDraftValue(nextValue)

    const normalizedValue = normalizeHexColor(nextValue)

    if (normalizedValue) {
      onChange(normalizedValue)
    }
  }

  function handleBlur() {
    const normalizedValue = normalizeHexColor(draftValue)
    setDraftValue(normalizedValue ?? value)
  }

  return (
    <FormLayout label={label} error={error} className="mb-0">
      <Input
        value={draftValue}
        onBlur={handleBlur}
        onChange={handleInputChange}
        placeholder="#000000"
        slot={
          <ColorPickerPopover
            ariaLabel={t('theme-customizer.choose-color', { label })}
            value={value}
            onValueChange={(nextValue) => {
              const normalizedValue = normalizeHexColor(nextValue)

              if (normalizedValue) {
                setDraftValue(normalizedValue)
                onChange(normalizedValue)
              }
            }}
          />
        }
      />
    </FormLayout>
  )
}

export function ThemeScaleSection(props: {
  title: string
  scale: ThemeScaleKey
  theme: Theme
  defaultExpanded?: boolean
  onChange: (scale: ThemeScaleKey, shade: ThemeShadeKey, value: string) => void
}) {
  const { title, scale, theme, defaultExpanded = false, onChange } = props
  const t = useTranslations()
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <section className={clsx(`rounded-2xl bg-white dark:bg-gray-800!`)}>
      <button
        type="button"
        className={clsx(`flex w-full items-center justify-between border-none bg-transparent px-4 py-3 text-left`)}
        onClick={() => setExpanded((value) => !value)}
      >
        <div>
          <div
            className="text-sm font-semibold text-slate-900 dark:text-white!"
          >
            {title}
          </div>
          <div
            className="mt-1 text-xs text-slate-500 dark:text-gray-300!"
          >
            {scale}
            .500
            {' = '}
            {theme[scale][500]}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex size-6 rounded-full border border-solid border-slate-200"
            style={{ backgroundColor: theme[scale][500] }}
          />
          <span
            className="text-xs text-slate-500 dark:text-gray-300!"
          >
            {expanded ? t('theme-customizer.collapse') : t('theme-customizer.expand')}
          </span>
        </div>
      </button>

      {expanded && (
        <div
          className="grid gap-3 p-4 sm:grid-cols-2"
        >
          {COLOR_SHADE_KEYS.map((shade) => (
            <ThemeColorField
              key={shade}
              label={shade}
              value={theme[scale][shade]}
              onChange={(value) => onChange(scale, shade, value)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export function ThemeRootColorsSection(props: {
  theme: Theme
  onChange: (key: 'white' | 'black', value: string) => void
}) {
  const { theme, onChange } = props
  const t = useTranslations()

  return (
    <section className={clsx(`rounded-2xl bg-white p-4 dark:bg-gray-800!`)}>
      <div
        className="mb-3 text-sm font-semibold text-slate-900 dark:text-white!"
      >
        {t('theme-customizer.base-tokens')}
      </div>
      <div
        className="grid gap-3 sm:grid-cols-2"
      >
        <ThemeColorField label="gray.0" value={theme.gray[0]} onChange={(value) => onChange('white', value)} />
        <ThemeColorField label="gray.1000" value={theme.gray[1000]} onChange={(value) => onChange('black', value)} />
      </div>
    </section>
  )
}

export function ThemeLoopColorSection(props: { theme: Theme; onChange: (key: LoopColorKey, value: string) => void }) {
  const { theme, onChange } = props
  const t = useTranslations()

  return (
    <section className={clsx(`rounded-2xl bg-white p-4 dark:bg-gray-800!`)}>
      <div
        className="mb-3 text-sm font-semibold text-slate-900 dark:text-white!"
      >
        {t('theme-customizer.loop-colors')}
      </div>
      <div
        className="grid gap-3 sm:grid-cols-2"
      >
        {LOOP_COLOR_KEYS.map((key) => (
          <FormLayout key={key} label={key} className="mb-0">
            <Select
              value={(theme['loop-color'] as Record<string, string>)[key]}
              options={LOOP_COLOR_OPTIONS}
              onChange={(value) => onChange(key, value)}
            />
          </FormLayout>
        ))}
      </div>
    </section>
  )
}

export function IntegrationExampleSection(props: { copyLabel: string; onCopy: () => void }) {
  const { copyLabel, onCopy } = props
  const t = useTranslations()

  return (
    <section className={clsx(`rounded-2xl bg-slate-50 p-4 dark:bg-gray-800!`)}>
      <div className="mb-3 flex items-center justify-between">
        <div
          className="text-sm font-semibold text-slate-900 dark:text-white!"
        >
          {t('theme-customizer.integration-example')}
        </div>
        <Button size="middle" onClick={onCopy}>
          {copyLabel}
        </Button>
      </div>

      <ThemeCodeBlock>
        {`import { Univer } from '@univerjs/core';
import { customTheme } from './custom-theme';

const univer = new Univer({
    theme: customTheme,
    locale: LocaleType.EN_US,
});`}
      </ThemeCodeBlock>
    </section>
  )
}

export function JsonEditorPanel(props: {
  copyLabel: string
  jsonDraft: string
  jsonError: string | null
  onCopy: () => void
  onFormatCurrent: () => void
  onJsonChange: (value: string) => void
  onSyncCurrent: () => void
  onViewDefault: () => void
}) {
  const { copyLabel, jsonDraft, jsonError, onCopy, onFormatCurrent, onJsonChange, onSyncCurrent, onViewDefault } = props
  const t = useTranslations()

  return (
    <section className={clsx(`rounded-2xl bg-slate-50 p-4 dark:bg-gray-800!`)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div
            className="text-sm font-semibold text-slate-900 dark:text-white!"
          >
            {t('theme-customizer.theme-json')}
          </div>
          <p
            className="m-0 mt-1 text-xs/5 text-slate-500 dark:text-gray-300!"
          >
            {t('theme-customizer.theme-json-description')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="middle" onClick={onSyncCurrent}>
            {t('theme-customizer.sync-current-theme')}
          </Button>
          <Button size="middle" onClick={onViewDefault}>
            {t('theme-customizer.view-default')}
          </Button>
          <Button size="middle" onClick={onCopy}>
            {copyLabel}
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <Textarea
          value={jsonDraft}
          spellCheck={false}
          className={clsx(
            `h-160 rounded-2xl bg-slate-950 p-4 font-mono text-sm/6 text-slate-100`,
            jsonError ? `border-red-500` : `border-slate-700`,
          )}
          style={{
            color: '#E2E8F0',
            backgroundColor: '#020617',
            caretColor: '#F8FAFC',
          }}
          onValueChange={onJsonChange}
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className={clsx('text-xs/5', jsonError ? 'text-red-500' : `text-slate-500 dark:text-gray-300!`)}>
            {jsonError}
          </div>
          <Button size="middle" variant="primary" onClick={onFormatCurrent}>
            {t('theme-customizer.format-current-result')}
          </Button>
        </div>
      </div>
    </section>
  )
}
