export const input = `
const a = {
  foo: 'bar',
  baz: 'qux',
  glorm: {
    a: 1,
    b: 2,
    c: 3,
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

export const find = `{foo: 'bar', glorm: {a: 1, b: 2, ...$inner}, ...$outer}`

export const replace = `{foo: 'bar', ...$outer, glorm: {a: 5, ...$inner}}`

export const expected = `
const a = {
  foo: "bar",
  baz: 'qux',

  glorm: {
    a: 5,
    c: 3
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
