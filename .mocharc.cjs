/* eslint-env node, es2018 */
const base = require('@jcoreio/toolchain-mocha/.mocharc.cjs')
module.exports = {
  ...base,
  recursive: true,
  require: [...base.require, 'test/configure.ts'],
}
