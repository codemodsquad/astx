export const input = `
let a: number
let b: {foo: number}
let c: {foo: string}
`

export const find = `
let $a: $And<$type, {foo: $fooType}>
`

export const expectedFind = [
  {
    captures: {
      $a: 'b',
      $fooType: 'number',
      $type: 'let a: /**/ {foo: number}',
    },
    node: 'let b: {foo: number}',
  },
  {
    captures: {
      $a: 'c',
      $fooType: 'string',
      $type: 'let a: /**/ {foo: string}',
    },
    node: 'let c: {foo: string}',
  },
]
