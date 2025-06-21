import pkg from '@/package.json'

export const dependencies = {
  rxjs: 'latest',
  react: 'latest',
  'react-dom': 'latest',
  '@univerjs/presets': pkg.version,
  '@univerjs/preset-docs-core': pkg.version,
}
