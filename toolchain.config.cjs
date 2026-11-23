const execa = require('@jcoreio/toolchain/util/execa.cjs')

module.exports = {
  cjsBabelEnv: { targets: { node: 20 } },
  esmBabelEnv: { targets: { node: 24 } },
  // outputEsm: false, // disables ESM output (default: true)
  // esWrapper: true, // outputs ES module wrappers for CJS modules (default: false)
  scripts: {
    'test:esm': {
      description: `no-op because mocha's module loading is crap`,
      run: async () => {},
    },
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
          await execa(process.execPath, [
            `dist/cli/index.${ext}`,
            '-t',
            'smoke-test/findScript.cts',
            '--parserOptions',
            '{"preserveFormat": "generatorHack"}',
            'src/Astx.ts',
          ])
          await execa(process.execPath, [
            `dist/cli/index.${ext}`,
            '-t',
            'smoke-test/findScript.mts',
            '--parserOptions',
            '{"preserveFormat": "generatorHack"}',
            'src/Astx.ts',
          ])
        }
      },
    },
  },
}
