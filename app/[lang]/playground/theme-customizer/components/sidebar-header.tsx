import type { EditorMode, TokenDensity } from './types'
import { Button } from '@univerjs/design'
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
          Theme Customizer
        </h2>

        <div className="flex flex-wrap gap-2">
          <Button size="small" onClick={() => onPresetApply('default')}>
            Reset Default
          </Button>
          <Button size="small" onClick={() => onPresetApply('green')}>
            Apply Green
          </Button>
        </div>
      </div>

      <div className="mt-2.5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <ToolbarField label="Appearance">
            <ToolbarToggleGroup
              items={[
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
              ]}
              value={darkMode ? 'dark' : 'light'}
              onChange={value => onDarkModeChange(value === 'dark')}
            />
          </ToolbarField>

          <ToolbarField label="Mode">
            <ToolbarToggleGroup
              items={[
                { label: 'Token', value: 'tokens' },
                { label: 'JSON', value: 'json' },
              ]}
              value={editorMode}
              onChange={value => onEditorModeChange(value as EditorMode)}
            />
          </ToolbarField>

          {editorMode === 'tokens' && (
            <ToolbarField label="Scope">
              <ToolbarToggleGroup
                items={[
                  { label: 'Core Palette', value: 'core' },
                  { label: 'Full Schema', value: 'full' },
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
