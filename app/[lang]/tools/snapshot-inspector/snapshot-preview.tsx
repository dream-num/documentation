'use client'

import type { ReactNode } from 'react'
import { defaultTheme } from '@univerjs/themes'
import { useTranslations } from 'next-intl'
import { Component } from 'react'

import { RealUniverPreview } from '../theme-customizer/real-univer-preview'

class PreviewBoundary extends Component<{ children: ReactNode; message: string }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? (
      <p role="alert" className="text-destructive rounded-lg border p-4 text-sm">
        {this.props.message}
      </p>
    ) : (
      this.props.children
    )
  }
}

export function SnapshotPreview({ snapshot, kind }: { snapshot: Record<string, unknown>; kind: 'sheets' | 'docs' }) {
  const t = useTranslations('tools')
  return (
    <PreviewBoundary message={t('preview-error')}>
      <RealUniverPreview theme={defaultTheme} darkMode={false} kind={kind} snapshot={snapshot} />
    </PreviewBoundary>
  )
}
