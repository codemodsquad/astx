export const input = `
const x = \`foo\`
const y = \`bar\`
`

export const find = '`foo`'

export const expectedFind = [
  {
    node: '`foo`',
  },
]
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
