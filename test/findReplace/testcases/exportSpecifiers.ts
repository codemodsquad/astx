export const input = `
export A, {B, C, D, E} from 'foo'
`

export const find = `export {$$a, B, $C, $$b} from 'foo'`

export const expectedFind = [
  {
    node: `export A, {B, C, D, E} from 'foo'`,
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
export {$$b, $C as Q, B, $$a, $c, $_$d} from 'foo'
`

export const expectedReplace = `
export A, { D, E, C as Q, B, $c, $$d } from 'foo'
`
