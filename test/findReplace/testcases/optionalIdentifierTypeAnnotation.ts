export const input = `
const foo = 1
const bar: number = 1
`

export const find = `
const $a: $Optional<$type> = $init
`

export const expectedFind = [
  {
    captures: {
      $a: 'foo',
      $init: '1',
    },
    node: 'const foo = 1',
  },
  {
    captures: {
      $a: 'bar: number',
      $type: 'number',
      $init: '1',
    },
    node: 'const bar: number = 1',
  },
]
