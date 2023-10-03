export const input = `
const a = (
  <div>
    foo  bar

    {bar}
    baz
    {qux}
  </div>
)

const b = <div>  foo bar {bar} </div>
const c = <div>foo bar{bar}</div>
`

export const find = `
<div>foo bar{$$c}</div>
`

export const expectedFind = [
  {
    arrayCaptures: {
      $$c: ['{bar}', '\n    baz\n    ', '{qux}', '\n  '],
    },
    node: `<div>
    foo  bar

    {bar}
    baz
    {qux}
  </div>`,
  },
  {
    arrayCaptures: {
      $$c: ['{bar}'],
    },
    node: `<div>foo bar{bar}</div>`,
  },
]
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
