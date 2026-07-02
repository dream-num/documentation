'use client'

import { clsx } from '@univerjs/design'
import { defaultTheme } from '@univerjs/themes'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useThemeCustomizerState } from './hooks/use-theme-customizer-state'
import { SidebarHeader } from './sidebar-header'
import { JsonEditorPanel } from './theme-sections'
import { cloneTheme, formatTheme } from './theme-utils'
import { TokenEditorPanel } from './token-editor-panel'
import { UniverPreview } from './univer-preview'

export function ThemeCustomizerApp() {
  const t = useTranslations()
  const {
    copyLabel,
    darkMode,
    editorMode,
    jsonDraft,
    jsonError,
    theme,
    tokenDensity,
    visibleScaleKeys,
    setDarkMode,
    setEditorMode,
    setJsonDraft,
    setTokenDensity,
    handleCopyTheme,
    handleJsonChange,
    handleLoopColorChange,
    handlePresetApply,
    handleRootColorChange,
    handleScaleColorChange,
  } = useThemeCustomizerState()

  // 控制实时预览在小屏幕下的展开/收起
  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <main
      className={`
        box-border h-180 overflow-hidden p-2.5 text-slate-900
        lg:p-3
      `}
    >
      <div className="mx-auto h-full max-w-420">
        <section
          className="
            relative grid h-full gap-3
            md:grid-cols-[360px_minmax(0,1fr)]
            xl:grid-cols-[minmax(280px,400px)_minmax(0,1fr)]
          "
        >
          {/* 左侧控制面板 */}
          <aside
            className={clsx(`
              flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] bg-white
              shadow-[0_16px_48px_rgba(15,23,42,0.08)] transition-all duration-300
              dark:bg-gray-900!
            `, previewOpen && `
              hidden
              md:flex
            `)}
          >
            <SidebarHeader
              darkMode={darkMode}
              editorMode={editorMode}
              tokenDensity={tokenDensity}
              onDarkModeChange={setDarkMode}
              onEditorModeChange={setEditorMode}
              onPresetApply={handlePresetApply}
              onTokenDensityChange={setTokenDensity}
            />

            <div className="flex-1 overflow-y-auto p-4">
              {editorMode === 'tokens'
                ? (
                    <TokenEditorPanel
                      copyLabel={copyLabel}
                      theme={theme}
                      visibleScaleKeys={visibleScaleKeys}
                      onCopy={handleCopyTheme}
                      onLoopColorChange={handleLoopColorChange}
                      onRootColorChange={handleRootColorChange}
                      onScaleColorChange={handleScaleColorChange}
                    />
                  )
                : (
                    <div className="flex h-full flex-col gap-4">
                      <JsonEditorPanel
                        copyLabel={copyLabel}
                        jsonDraft={jsonDraft}
                        jsonError={jsonError}
                        onCopy={handleCopyTheme}
                        onFormatCurrent={() => setJsonDraft(formatTheme(theme))}
                        onJsonChange={handleJsonChange}
                        onSyncCurrent={() => setJsonDraft(formatTheme(theme))}
                        onViewDefault={() => setJsonDraft(formatTheme(cloneTheme(defaultTheme)))}
                      />
                    </div>
                  )}
            </div>
          </aside>

          {/* 右侧实时预览 */}
          <section
            className={clsx(`
              flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] bg-white
              shadow-[0_18px_56px_rgba(15,23,42,0.16)] transition-all duration-300
              dark:bg-gray-900!
            `, !previewOpen && `
              hidden
              md:flex
            `)}
          >
            {/* 小屏幕下的返回按钮 */}
            <div
              className="
                flex items-center justify-between border-b border-gray-200 bg-white p-3
                md:hidden
                dark:border-gray-700 dark:bg-gray-900
              "
            >
              <h2
                className="
                  m-0 text-base font-semibold text-slate-950
                  dark:text-white!
                "
              >
                {t('theme-customizer.live-preview')}
              </h2>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="
                  rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700
                  hover:bg-slate-200
                  dark:bg-slate-800 dark:text-slate-200
                  dark:hover:bg-slate-700
                "
              >
                {t('theme-customizer.back-to-editor')}
              </button>
            </div>

            {/* md 及以上的标题 */}
            <div
              className="
                hidden bg-white p-4
                md:block
                dark:bg-gray-900!
              "
            >
              <h2
                className="
                  m-0 text-base font-semibold text-slate-950
                  dark:text-white!
                "
              >
                {t('theme-customizer.live-preview')}
              </h2>
            </div>

            <div className="min-h-160 flex-1 overflow-hidden">
              <UniverPreview theme={theme} darkMode={darkMode} />
            </div>
          </section>

          {/* 小屏幕下的预览按钮 */}
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className={clsx(`
              absolute right-4 bottom-4 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg
              hover:bg-blue-700
              md:hidden
              dark:bg-blue-500
              dark:hover:bg-blue-600
            `, previewOpen && 'hidden')}
          >
            {t('theme-customizer.preview-action')}
          </button>
        </section>
      </div>
    </main>
  )
}
