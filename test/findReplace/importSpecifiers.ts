export const input = `
import A, {B, C, D, E} from 'foo'
`

export const find = `import {$$a, B, $C, $$b} from 'foo'`

export const expectedFind = [
  {
    node: `import A, {B, C, D, E} from 'foo'`,
    arrayCaptures: {
      $$a: ['A'],
      $$b: ['D', 'E'],
    },
    captures: {
      $C: 'C',
    },
  },
]

export const replace = `
import {$$b, $C as Q, B, $$a, type $c, $_$d} from 'foo'
`

export const expectedReplace = `
import A, { D, E, C as Q, B, type $c, $$d } from 'foo'
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
