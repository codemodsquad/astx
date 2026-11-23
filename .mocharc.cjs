const base = require('@jcoreio/toolchain-mocha/.mocharc.cjs')
const { getSpecs } = require('@jcoreio/toolchain-mocha')
module.exports = {
  ...base,
  spec: getSpecs(['test']),
  require: [...base.require, 'test/configure.ts'],
}
