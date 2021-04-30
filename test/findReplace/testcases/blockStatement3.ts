export const input = `
if (foo) {
  const bar = foo
  const baz = 3
  const x = 1
  console.log(x)
  console.log(baz)
}
`

export const find = `if ($a) {
  $$b
  $c
  const $d = 1
  $$d
}`

export const expectedFind = [
  {
    node: `if (foo) {
  const bar = foo
  const baz = 3
  const x = 1
  console.log(x)
  console.log(baz)
}`,
    captures: { $a: 'foo', $c: 'const baz = 3', $d: 'x' },
    arrayCaptures: {
      $$b: ['const bar = foo'],
      $$d: ['console.log(x)', 'console.log(baz)'],
    },
  },
]
