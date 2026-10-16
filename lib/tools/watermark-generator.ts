import type { IImageWatermarkConfig, ITextWatermarkConfig, IUserInfoWatermarkConfig } from '@univerjs/engine-render'

export interface IWatermarkSettings {
  text: ITextWatermarkConfig
  image: IImageWatermarkConfig
  userInfo: IUserInfoWatermarkConfig
}

export type WatermarkKind = keyof IWatermarkSettings
export type WatermarkOutput = 'plugin' | 'preset' | 'facade' | 'json'

// Defaults follow packages/watermark/src/common/const.ts; text starts with visible sample content.
const layout = { x: 60, y: 36, repeat: true, spacingX: 200, spacingY: 100, rotate: 0, opacity: 0.15 }
const font = { fontSize: 16, color: 'rgb(0,0,0)', bold: false, italic: false, direction: 'ltr' as const }

export const DEFAULT_WATERMARK_SETTINGS: IWatermarkSettings = {
  text: { content: 'Univer', ...font, ...layout },
  image: { url: '', width: 100, height: 100, maintainAspectRatio: true, originRatio: 1, ...layout },
  userInfo: { name: true, email: false, phone: false, uid: false, ...font, ...layout, y: 60, rotate: -30 },
}

export function generateWatermarkCode(kind: WatermarkKind, settings: IWatermarkSettings, output: WatermarkOutput) {
  if (output === 'facade') {
    if (kind === 'userInfo') throw new Error('User information watermarks require plugin configuration.')
    return `import { IWatermarkTypeEnum } from '@univerjs/engine-render'\nimport '@univerjs/watermark/facade'\n\nuniverAPI.addWatermark(IWatermarkTypeEnum.${kind === 'text' ? 'Text' : 'Image'}, ${JSON.stringify(settings[kind], null, 2)})\n`
  }

  const key = kind === 'userInfo' ? 'userWatermarkSettings' : `${kind}WatermarkSettings`
  const config = JSON.stringify({ [key]: settings[kind] }, null, 2)
  if (output === 'json') return `${config}\n`

  const imports = "import { UniverWatermarkPlugin } from '@univerjs/watermark'"
  if (output === 'preset') {
    return `import type { IPresetPlugin } from '@univerjs/presets'\n${imports}\n\nconst plugins: IPresetPlugin[] = [\n  [UniverWatermarkPlugin, ${config.replaceAll('\n', '\n  ')}],\n]\n`
  }
  return `${imports}\n\nuniver.registerPlugin(UniverWatermarkPlugin, ${config})\n`
}
