export const input = `
if (foo) {
  const bar = foo
  const baz = 3
  const x = 1
}
`

export const find = `if ($a) {
  $$b
  const $c = 1
}`

export const expectedFind = [
  {
    node: `if (foo) {
  const bar = foo
  const baz = 3
  const x = 1
}`,
    captures: { $a: 'foo', $c: 'x' },
    arrayCaptures: {
      $$b: ['const bar = foo', 'const baz = 3'],
    },
  },
]
