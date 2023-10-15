export const parsers = [
  'babel',
  'babel/tsx',
  'recast/babel',
  'recast/babel/tsx',
]

export const input = `
type Foo = <A, B, C, D, E, F>() => any
`

export const find = `
type $1 = <$$a, C, $d, $$e>() => any
`

export const expectedFind = [
  {
    node: `type Foo = <A, B, C, D, E, F>() => any`,
    captures: {
      $1: 'Foo',
      $d: 'D',
    },
    arrayCaptures: {
      $$a: ['A', 'B'],
      $$e: ['E', 'F'],
    },
  },
]

export const replace = `
type $1 = <C, $$e, $d, $$a>() => any
`

export const expectedReplace = `
type Foo = <C, E, F, D, A, B>() => any;
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  parsers,
  input,
  find,
  expectedFind,
  replace,
  expectedReplace,
})
