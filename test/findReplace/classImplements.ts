export const input = `
class Foo implements A, B, C, D { }
`

export const find = `
class Foo implements $$a, C, $d { }
`

export const expectedFind = [
  {
    node: `class Foo implements A, B, C, D { }`,
    captures: {
      $d: 'D',
    },
    arrayCaptures: {
      $$a: ['A', 'B'],
    },
  },
]

export const replace = `
class Bar implements C, $$a, E, $d { }
`

export const expectedReplace = `
class Bar implements C, A, B, E, D { }
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
