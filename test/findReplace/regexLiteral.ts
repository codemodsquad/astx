export const input = `
const a = /bar/ig
const b = /bar/gi
const c = /bar/g
const d = /baz/gi
`

export const find = `/bar/ig`

export const expectedFind = [
  {
    node: '/bar/ig',
  },
  {
    node: '/bar/gi',
  },
]
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
