export const input = `
x()
let y: number

z()
let z: number
`

export const find = `
$a()
let $a: number
`

export const expectedFind = [
  { nodes: ['z()', 'let z: number'], captures: { $a: 'z' } },
]
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
