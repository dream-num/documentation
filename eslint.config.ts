import os from 'node:os'
import antfu from '@antfu/eslint-config'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'

const isWindows = os.platform() === 'win32'
const lineBreakStyle = isWindows ? 'windows' : 'unix'

export default antfu({
  ignores: [
    '**/*.js',
    '**/.next/**/*',
  ],
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
    'react-hooks/rules-of-hooks': 'off',
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: 'directive', next: '*' },
    ],
  },
}, {
  files: ['**/*.tsx'],
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  plugins: {
    'better-tailwindcss': eslintPluginBetterTailwindcss,
  },
  settings: {
    'better-tailwindcss': {
      entryPoint: 'styles/globals.css',
    },
  },
  rules: {
    // enable all recommended rules to warn
    ...eslintPluginBetterTailwindcss.configs['recommended-warn'].rules,
    // enable all recommended rules to error
    ...eslintPluginBetterTailwindcss.configs['recommended-error'].rules,

    // or configure rules individually
    'better-tailwindcss/multiline': ['warn', {
      printWidth: 120,
      group: 'newLine',
      lineBreakStyle,
    }],
    'better-tailwindcss/no-conflicting-classes': 'off',
  },
})
