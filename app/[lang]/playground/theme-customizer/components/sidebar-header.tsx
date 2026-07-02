import type { EditorMode, TokenDensity } from './types'
import { Button } from '@univerjs/design'
import { useTranslations } from 'next-intl'
import { ToolbarField, ToolbarToggleGroup } from './toolbar-controls'

export function SidebarHeader(props: {
  darkMode: boolean
  editorMode: EditorMode
  tokenDensity: TokenDensity
  onDarkModeChange: (darkMode: boolean) => void
  onEditorModeChange: (mode: EditorMode) => void
  onPresetApply: (presetKey: 'default' | 'green') => void
  onTokenDensityChange: (density: TokenDensity) => void
}) {
  const t = useTranslations()
  const {
    darkMode,
    editorMode,
    tokenDensity,
    onDarkModeChange,
    onEditorModeChange,
    onPresetApply,
    onTokenDensityChange,
  } = props

  return (
    <div className="p-3">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <h2
          className="
            m-0 text-lg font-semibold text-slate-950
            dark:text-white!
          "
        >
          {t('theme-customizer.title')}
        </h2>

        <div className="flex flex-wrap gap-2">
          <Button size="small" onClick={() => onPresetApply('default')}>
            {t('theme-customizer.reset-default')}
          </Button>
          <Button size="small" onClick={() => onPresetApply('green')}>
            {t('theme-customizer.apply-green')}
          </Button>
        </div>
      </div>

      <div className="mt-2.5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <ToolbarField label={t('theme-customizer.appearance')}>
            <ToolbarToggleGroup
              items={[
                { label: t('theme-customizer.light'), value: 'light' },
                { label: t('theme-customizer.dark'), value: 'dark' },
              ]}
              value={darkMode ? 'dark' : 'light'}
              onChange={value => onDarkModeChange(value === 'dark')}
            />
          </ToolbarField>

          <ToolbarField label={t('theme-customizer.mode')}>
            <ToolbarToggleGroup
              items={[
                { label: t('theme-customizer.token'), value: 'tokens' },
                { label: t('theme-customizer.json'), value: 'json' },
              ]}
              value={editorMode}
              onChange={value => onEditorModeChange(value as EditorMode)}
            />
          </ToolbarField>

          {editorMode === 'tokens' && (
            <ToolbarField label={t('theme-customizer.scope')}>
              <ToolbarToggleGroup
                items={[
                  { label: t('theme-customizer.core-palette'), value: 'core' },
                  { label: t('theme-customizer.full-schema'), value: 'full' },
                ]}
                value={tokenDensity}
                onChange={value => onTokenDensityChange(value as TokenDensity)}
              />
            </ToolbarField>
          )}
        </div>
      </div>
    </div>
  )
}
