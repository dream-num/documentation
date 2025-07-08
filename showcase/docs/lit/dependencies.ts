import pkg from '@/package.json'

export const dependencies = {
  rxjs: 'latest',
  react: 'latest',
  'react-dom': 'latest',
  lit: 'latest',
  '@univerjs/presets': pkg.version,
  '@univerjs/preset-docs-core': pkg.version,
}
