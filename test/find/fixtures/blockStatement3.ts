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
  $_b
  $c
  const $d = 1
  $_d
}`

export const expected = [
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
      $_b: ['const bar = foo'],
      $_d: ['console.log(x)', 'console.log(baz)'],
    },
  },
]
