export const input = `
const a = 1
const b = 2
const c = {foo: 3}
`

export const find = `
$Or(1, {foo: $value})
`

export const expectedFind = [
  {
    node: '1',
  },
  {
    captures: {
      $value: '3',
    },
    node: '{foo: 3}',
  },
]
