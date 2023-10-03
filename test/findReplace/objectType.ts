export const input = `
type Foo = { a: number, b: string, c: [number, string], d: any, $e: any, 'hello-world': any }
`
export const find = `
type $1 = { $$a: $, c: [number, $$b], $d: $, $_e: any, 'hello-world': any }
`

export const expectedFind = [
  {
    node: `type Foo = { a: number, b: string, c: [number, string], d: any, $e: any, 'hello-world': any }`,
    captures: {
      $1: 'Foo',
      $d: 'd: any',
    },
    arrayCaptures: {
      $$a: ['a: number', 'b: string'],
      $$b: ['string'],
    },
  },
]

export const replace = `
type $1 = { c: [$$b, number], $d: $, foo: string, $$a: $, $_e: any, 'hello-world': any }
`

export const expectedReplace = `
type Foo = { c: [string, number], d: any, foo: string, a: number, b: string, $e: any, 'hello-world': any }
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
