import amamo from '@amamo/oxlint-config'

export default amamo({
  ignores: ['**/.angular/**', '**/.astro/**', '.amamo-mdx/**', '.next/**', 'out/**'],
  jsxA11y: false,
  nextjs: true,
  node: true,
  promise: false,
  rules: {
    'eslint/no-underscore-dangle': 'off',
    'import/no-unassigned-import': 'off',
    'nextjs/no-img-element': 'off',
    'react/react-in-jsx-scope': 'off',
    'tailwindcss/no-unnecessary-whitespace': 'off',
    'tailwindcss/no-unknown-classes': 'warn',
  },
  tailwindcss: {
    callees: ['clsx'],
    entryPoint: [
      {
        files: 'examples/univer-nextjs/**',
        use: 'examples/univer-nextjs/app/globals.css',
      },
      {
        files: '**',
        use: 'app/global.css',
      },
    ],
  },
  vue: true,
})
