import os from 'node:os'
import antfu from '@antfu/eslint-config'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'

const isWindows = os.platform() === 'win32'
const lineBreakStyle = isWindows ? 'windows' : 'unix'

export default antfu({
  formatters: true,
  react: true,
}, {
  files: ['**/*.ts', '**/*.tsx'],
  rules: {
    curly: ['error', 'multi-line'],
    'antfu/if-newline': 'off',
    'style/quote-props': ['error', 'as-needed'],
    'style/brace-style': ['warn', '1tbs', { allowSingleLine: true }],
    'style/jsx-first-prop-new-line': ['error', 'multiline'],
    'style/jsx-self-closing-comp': ['error', {
      component: true,
      html: true,
    }],
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
      // tailwindcss 4: the path to the entry file of the css based tailwind config (eg: `src/global.css`)
      entryPoint: 'app/global.css',
    },
  },
  rules: {
    // enable all recommended rules to warn
    ...eslintPluginBetterTailwindcss.configs['recommended-warn'].rules,
    // enable all recommended rules to error
    ...eslintPluginBetterTailwindcss.configs['recommended-error'].rules,

    // or configure rules individually
    'better-tailwindcss/enforce-consistent-line-wrapping': ['error', {
      printWidth: 120,
      group: 'newLine',
      lineBreakStyle,
    }],
    'better-tailwindcss/no-unregistered-classes': 'warn',
  },
})
