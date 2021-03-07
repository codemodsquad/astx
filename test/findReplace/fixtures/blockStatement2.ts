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

export const expectedFind = [
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

export const replace = `if ($a) {
  const $d = 1
  $c
  $_b
}`

export const expectedReplace = `
if (foo) {
  const x = 1;
  const baz = 3
  const bar = foo
}
`
