export const input = `
const a: number = 1
const b: {foo: number} = {foo: 3}
const c: string = 'hello'
`

export const find = `
const $a: $Or<number, {foo: $value}> = $b
`

export const expectedFind = [
  {
    captures: {
      $a: 'a',
      $b: '1',
    },
    node: 'const a: number = 1',
  },
  {
    captures: {
      $a: 'b',
      $b: '{foo: 3}',
      $value: 'number',
    },
    node: 'const b: {foo: number} = {foo: 3}',
  },
]
