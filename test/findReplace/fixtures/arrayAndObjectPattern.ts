export const input = `
const [a, b, {c, d: [e], h}, f] = foo
`

export const find = `const [a, $_b, {c, $_d}, $_e] = $f`

export const expectedFind = [
  {
    node: `const [a, b, {c, d: [e], h}, f] = foo`,
    arrayCaptures: {
      $_b: ['b'],
      $_d: ['d: [e]', 'h'],
      $_e: ['f'],
    },
    captures: {
      $f: 'foo',
    },
  },
]

export const replace = `const [$_e, a, {c: {$_d}, h}, $_b, $f] = c`

export const expectedReplace = `
const [
  f,
  a,
  {
    c: {
      d: [e],
      h
    },

    h},
  b,
  foo,
] = c
`
