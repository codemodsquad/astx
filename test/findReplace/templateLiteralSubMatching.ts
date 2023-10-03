export const input = `
const x = \`foo \${1 + 2} bar\`
`

export const find = `
\`foo \${$a + $b} bar\`
`

export const expectedFind = [
  {
    node: '`foo ${1 + 2} bar`',
    captures: {
      $a: '1',
      $b: '2',
    },
  },
]

export const replace = `
\`foo \${$a} bar \${$b}\`
`

export const expectedReplace = `
const x = \`foo \${1} bar \${2}\`
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
  replace,
  expectedReplace,
})
