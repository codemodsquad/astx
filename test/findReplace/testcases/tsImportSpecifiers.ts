export const parsers = ['recast/tsx', 'babel/tsx', 'recast/tsx-babel-generator']

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
import {$$b, $C as Q, B, $$a, $_$d} from 'foo'
`

export const expectedReplace = `
import A, { D, E, C as Q, B, $$d } from 'foo'
`
