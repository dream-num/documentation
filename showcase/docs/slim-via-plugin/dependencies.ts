import pkg from '@/package.json'

export const dependencies = {
  rxjs: 'latest',
  react: 'latest',
  'react-dom': 'latest',
  '@univerjs/core': pkg.version,
  '@univerjs/design': pkg.version,
  '@univerjs/docs': pkg.version,
  '@univerjs/docs-ui': pkg.version,
  '@univerjs/engine-formula': pkg.version,
  '@univerjs/engine-render': pkg.version,
  '@univerjs/ui': pkg.version,
}
