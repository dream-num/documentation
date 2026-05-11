import os from 'node:os'
import antfu from '@antfu/eslint-config'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'
import * as mdx from 'eslint-plugin-mdx'

const isWindows = os.platform() === 'win32'
const lineBreakStyle = isWindows ? 'windows' : 'unix'

export default antfu({
  ignores: ['**/.angular/**', '**/.astro/**'],
  formatters: true,
  react: true,
  astro: true,
  vue: true,
}, {
  ignores: ['**/*.mdx'],
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
    'react-hooks/set-state-in-effect': 'off',
    'react-hooks/purity': 'off',
    'react-hooks/refs': 'off',
    'react-refresh/only-export-components': 'off',
    'react/static-components': 'off',
  },
}, {
  files: ['**/*.mdx'],
  ignores: [
    'content/blog/univer-doc-architecture.mdx',
    'content/blog/univer-doc-architecture.zh-CN.mdx',
    'content/blog/this-is-univer.mdx',
    'content/blog/this-is-univer.zh-CN.mdx',
    'content/reference/facade/**/*.mdx',
  ],
  ...mdx.flat,
  // optional, if you want to lint code blocks at the same
  processor: mdx.createRemarkProcessor({
    lintCodeBlocks: true,
    // optional, if you want to disable language mapper, set it to `false`
    // if you want to override the default language mapper inside, you can provide your own
    languageMapper: {},
  }),
  rules: {
    'style/indent': 'off',
    'style/jsx-closing-bracket-location': 'off',
    'ts/no-redeclare': 'off',
    'unused-imports/no-unused-imports': 'off',
    'unused-imports/no-unused-vars': 'off',
    'style/jsx-one-expression-per-line': 'off',
    'style/jsx-tag-spacing': 'off',
    'no-unused-vars': 'off',
    'react/component-hook-factories': 'off',
    'react/rules-of-hooks': 'off',
    'eslint-comments/no-unlimited-disable': 'off',
    'style/max-statements-per-line': 'off',
    'no-undef': 'off',
  },
}, {
  files: ['**/*.mdx'],
  ignores: ['content/reference/facade/**/*.mdx'],
  ...mdx.flatCodeBlocks,
  rules: {
    ...mdx.flatCodeBlocks.rules,
    // if you want to override some rules for code blocks
    'prefer-const': 'error',
    'ts/no-redeclare': 'off',
    'unused-imports/no-unused-imports': 'off',
    'unused-imports/no-unused-vars': 'off',
    'style/jsx-tag-spacing': 'off',
    'no-console': 'off',
    'no-var': 'error',
    'no-restricted-syntax': 'off',
    'no-new': 'off',
    'node/prefer-global/process': 'off',
    'prefer-rest-params': 'off',
    'antfu/no-top-level-await': 'off',
    'ts/prefer-literal-enum-member': 'off',
    'no-useless-return': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'react-dom/no-render': 'off',
    'react/component-hook-factories': 'off',
    'react/rules-of-hooks': 'off',
    'react-refresh/only-export-components': 'off',
    'import/no-duplicates': 'off',
    'react/dom-no-render': 'off',
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
      entryPoint: 'app/[lang]/global.css',
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
    'better-tailwindcss/no-unknown-classes': 'warn',
  },
})
