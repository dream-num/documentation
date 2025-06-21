import pkg from '@/package.json'

export const dependencies = {
  rxjs: 'latest',
  react: 'latest',
  'react-dom': 'latest',
  '@univerjs/presets': pkg.version,
  '@univerjs/preset-sheets-core': pkg.version,
  '@univerjs/preset-sheets-conditional-formatting': pkg.version,
  '@univerjs/preset-sheets-data-validation': pkg.version,
  '@univerjs/preset-sheets-thread-comment': pkg.version,
  '@univerjs/preset-sheets-drawing': pkg.version,
  '@univerjs/preset-sheets-filter': pkg.version,
  '@univerjs/preset-sheets-sort': pkg.version,
  '@univerjs/preset-sheets-hyper-link': pkg.version,
  '@univerjs/preset-sheets-find-replace': pkg.version,
  '@univerjs/watermark': pkg.version,
  '@univerjs/sheets-crosshair-highlight': pkg.version,
  '@univerjs/sheets-zen-editor': pkg.version,
}
