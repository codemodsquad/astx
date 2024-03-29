export const input = `
function foo(bar: number): string {

}
`

export const find = `
function $fn($arg: $type): $ret {

}
`

export const expectedFind = [
  {
    captures: {
      $arg: 'bar',
      $fn: 'foo',
      $ret: 'string',
      $type: 'number',
    },
    node: `function foo(bar: number): string {

}`,
  },
]

export const replace = `
function $arg($fn: $ret): $type {
  const $arg = 2
}
`

export const expectedReplace = `
function bar(foo: string): number {
  const bar = 2
}
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
