module.exports = function (api) {
  const plugins = []
  api.cache.using(() => process.env.OUTPUT_ESM)
  const presets = [
    [
      '@babel/preset-env',
      api.env('es5')
        ? { forceAllTransforms: true }
        : {
            modules: process.env.OUTPUT_ESM ? false : undefined,
            targets: { node: '12' },
          },
    ],
    ['@babel/preset-typescript', { allowDeclareFields: true }],
  ]

  if (api.env(['test', 'coverage', 'es5'])) {
    plugins.push('@babel/plugin-transform-runtime')
  }
  if (api.env('coverage')) {
    plugins.push('babel-plugin-istanbul')
  }

  const result = { plugins, presets }
  if (api.env('development')) {
    result.sourceMaps = 'inline'
    result.retainLines = true
  }
  return result
}
