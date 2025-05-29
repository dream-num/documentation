import antfu from '@antfu/eslint-config'
import eslintPluginReadableTailwind from 'eslint-plugin-readable-tailwind'

export default antfu({
  ignores: [
    '**/*.js',
    '**/.next/**/*',
    'packages/api/pages/**/*',
    'packages/api/dts/**/*.js',
    'packages/api/content/**/*',
    'packages/api/public/**/*',
    'packages/showcase/src/*/demo/data.ts',
  ],
  typescript: true,
  formatters: true,
  markdown: true,
  react: true,
  rules: {
    'curly': ['error', 'multi-line'],
    'antfu/if-newline': 'off',
    'node/prefer-global/process': 'warn',
    'style/quote-props': ['error', 'consistent-as-needed'],
    'style/brace-style': ['warn', '1tbs', { allowSingleLine: true }],
    'style/jsx-first-prop-new-line': ['error', 'multiline'],
    'style/jsx-self-closing-comp': ['error', {
      component: true,
      html: true,
    }],
    'ts/ban-ts-comment': 'warn',
    'unused-imports/no-unused-imports': 'error',
    'react-refresh/only-export-components': 'off',
    'unicorn/filename-case': [
      'error',
      {
        case: 'kebabCase',
        ignore: [
          '^README(\.(zh|en))?\\.md$',
          '^CONTRIBUTING\\.md$',
          '^STRUCTURE\\.md$',
          'zh-CN',
          'en-US',
        ],
      },
    ],
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: 'directive', next: '*' },
    ],
  },
}, {
  files: ['**/*.{jsx,tsx}'],
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  plugins: {
    'readable-tailwind': eslintPluginReadableTailwind,
  },
  rules: {
    // enable all recommended rules to warn
    ...eslintPluginReadableTailwind.configs.warning.rules,
    // enable all recommended rules to error
    ...eslintPluginReadableTailwind.configs.error.rules,
    'jsonc/sort-keys': ['warn'],

    // or configure rules individually
    'readable-tailwind/multiline': ['warn', { printWidth: 120 }],

    'react-hooks/rules-of-hooks': 'off',
  },
})
