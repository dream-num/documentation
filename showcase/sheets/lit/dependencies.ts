import pkg from '@/package.json'

export const dependencies = {
  rxjs: 'latest',
  react: 'latest',
  'react-dom': 'latest',
  lit: 'latest',
  '@univerjs/presets': pkg.version,
  '@univerjs/preset-sheets-core': pkg.version,
}
