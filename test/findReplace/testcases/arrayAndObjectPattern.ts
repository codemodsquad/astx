export const input = `
const [a, b, {c, d: [e], h}, f] = foo
`

export const find = `const [a, $$b, {c, $$d}, $$e] = $f`

export const expectedFind = [
  {
    node: `const [a, b, {c, d: [e], h}, f] = foo`,
    arrayCaptures: {
      $$b: ['b'],
      $$d: ['x = {/**/ d: [e]}', 'h'],
      $$e: ['f'],
    },
    captures: {
      $f: 'foo',
    },
  },
]

export const replace = `const [$$e, a, {c: {$$d}, i}, $$b, $f] = c`

export const expectedReplace = `
const [
  f,
  a,
  {
    c: {
      d: [e],
      h
    },
    i},
  b,
  foo,
] = c
`
