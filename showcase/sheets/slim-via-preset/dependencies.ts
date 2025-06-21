import pkg from '@/package.json'

export const dependencies = {
  rxjs: 'latest',
  react: 'latest',
  'react-dom': 'latest',
  '@univerjs/presets': pkg.version,
  '@univerjs/preset-sheets-core': pkg.version,
}
