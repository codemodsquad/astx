/* eslint-env node, es2018 */
const execa = require('@jcoreio/toolchain/util/execa.cjs')

module.exports = {
  cjsBabelEnv: { forceAllTransforms: true },
  esmBabelEnv: { targets: { node: 16 } },
  // outputEsm: false, // disables ESM output (default: true)
  // esWrapper: true, // outputs ES module wrappers for CJS modules (default: false)
  scripts: {
    'build:smoke-test': {
      description: 'smoke test build output',
      run: async () => {
        for (const ext of ['js', 'mjs']) {
          await execa(process.execPath, [
            `dist/cli/index.${ext}`,
            '-f',
            'export type TransformOptions = $T',
            'src/**/*.ts',
          ])
        }
      },
    },
  },
}
