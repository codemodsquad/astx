const { defineConfig } = require('eslint/config')
const globals = require('globals')

module.exports = defineConfig([
  ...require('@jcoreio/toolchain/eslintConfig.cjs'),
  {
    files: ['src/node/**'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['test/**'],
    languageOptions: {
      globals: {
        ...globals.mocha,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-expressions': 0,
    },
  },
  {
    files: [
      'src/node/minimatch.js',
      'src/node/AstxWorkerFile.js',
      'src/node/AstxWorkerFile.d.ts',
    ],
    languageOptions: {
      globals: globals.commonjs,
    },
  },
])
