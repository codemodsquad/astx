export const input = `
if (foo) {
  const bar = foo
  const baz = 3
  const x = 1
}
`

export const find = `if ($a) {
  $_b
  $c
  const $d = 1
}`

export const expected = [
  {
    node: `if (foo) {
  const bar = foo
  const baz = 3
  const x = 1
}`,
    captures: { $a: 'foo', $c: 'const baz = 3', $d: 'x' },
    arrayCaptures: {
      $_b: ['const bar = foo'],
    },
  },
]
