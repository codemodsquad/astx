export const input = `
const a = {
  foo: 'bar',
  baz: 'qux',
  glorm: {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    ...qlom,
  }
}

const b = {
  foo: 'bar',
  baz: 'qux',
  glorm: {
    a: 1,
    c: 3,
  }
}
`

export const find = `{foo: 'bar', glorm: {a: 1, b: 2, ...$_inner}, ...$_outer}`

export const expectedFind = [
  {
    node: `{
  foo: 'bar',
  baz: 'qux',
  glorm: {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    ...qlom,
  }
}`,
    arrayCaptures: {
      $_inner: ['c: 3', 'd: 4', '...qlom'],
      $_outer: ["baz: 'qux'"],
    },
  },
]

export const replace = `{foo: 'bar', ...$_outer, glorm: {a: 5, ...$_inner}}`

export const expectedReplace = `
const a = {
  foo: "bar",
  baz: 'qux',

  glorm: {
    a: 5,
    c: 3,
    d: 4,
    ...qlom,
  }
}

const b = {
  foo: 'bar',
  baz: 'qux',
  glorm: {
    a: 1,
    c: 3,
  }
}
`
