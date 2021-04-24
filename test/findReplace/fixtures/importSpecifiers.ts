export const input = `
import A, {B, C, D, E} from 'foo'
`

export const find = `import {$$a, B, $$b} from 'foo'`

export const expectedFind = [
  {
    node: `import A, {B, C, D, E} from 'foo'`,
    arrayCaptures: {
      $$a: ['A'],
      $$b: ['C', 'D', 'E'],
    },
  },
]

export const replace = `
import {$$b, B, $$a} from 'foo'
`

export const expectedReplace = `
import A, { C, D, E, B } from 'foo'
`
