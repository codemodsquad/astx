export const input = `
class Foo {
  a: number;
  b: string;
}
`

export const find = `
class X { /**/ $a: $T }
`

export const replace = `
class X { /**/ declare $a: $T }
`

export const expectedReplace = `
class Foo {
  declare a: number;
  declare b: string;
}
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  replace,
  expectedReplace,
})
