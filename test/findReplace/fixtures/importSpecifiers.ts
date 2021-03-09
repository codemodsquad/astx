export const input = `
import A, {B, C, D, E} from 'foo'
`

export const find = `import {$_a, B, $_b} from 'foo'`

export const expectedFind = [
  {
    node: `import A, {B, C, D, E} from 'foo'`,
    arrayCaptures: {
      $_a: ['A'],
      $_b: ['C', 'D', 'E'],
    },
  },
]

export const replace = `
import {$_b, B, $_a} from 'foo'
`

export const expectedReplace = `
import A, { C, D, E, B } from 'foo'
`
