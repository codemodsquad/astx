/* eslint-env node, es2018 */
module.exports = {
  extends: [require.resolve('@jcoreio/toolchain/eslint.config.cjs')],
  rules: {
    '@typescript-eslint/no-explicit-any': 0,
  },
}
