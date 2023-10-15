export const input = `
const a = 1
const b = a + 3

const c = 5

function foo() {
  const c = 5
  const d = 6
  const e = c + 4
}

const f = 1
const g = f + 3
`

export const find = `
const $a = $b
$$c
const $d = $a + $e
`

export const expectedFind = [
  {
    nodes: ['const c = 5', 'const d = 6', 'const e = c + 4'],
    captures: { $a: 'c', $b: '5', $d: 'e', $e: '4' },
    arrayCaptures: { $$c: ['const d = 6'] },
  },
  {
    nodes: ['const a = 1', 'const b = a + 3'],
    captures: { $a: 'a', $b: '1', $d: 'b', $e: '3' },
    arrayCaptures: { $$c: [] },
  },
  {
    nodes: ['const f = 1', 'const g = f + 3'],
    captures: { $a: 'f', $b: '1', $d: 'g', $e: '3' },
    arrayCaptures: { $$c: [] },
  },
]
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
