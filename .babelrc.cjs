/* eslint-env node, es2018 */

const filenamePlugin = ({ types: t }) => ({
  visitor: {
    Identifier(path) {
      if (path.node.name === '__filename') {
        path.replaceWith(
          t.memberExpression(
            t.metaProperty(t.identifier('import'), t.identifier('meta')),
            t.identifier('url')
          )
        )
      }
    },
  },
})

module.exports = function (api) {
  const base = require('@jcoreio/toolchain-esnext/.babelrc.cjs')(api)
  return {
    ...base,
    plugins: [
      ...base.plugins,
      ...(process.env.JCOREIO_TOOLCHAIN_ESM ? [filenamePlugin] : []),
    ],
  }
}
