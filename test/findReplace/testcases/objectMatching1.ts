export const input = `
const a = {
  foo: 'bar',
  'baz-age': 'qux',
  [1 + 2]: {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    ...qlom,
  },
  ...$qux,
}

const a1 = {
  foo: 'bar',
  'baz-age': 'qux',
  [1 + 2]: {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    ...qlom,
  }
}


const b = {
  foo: 'bar',
  'baz-age': 'qux',
  [parseInt('3')]: {
    a: 1,
    c: 3,
  },
  [String(17)]: 3,
}

const c = {
  foo: 'bar',
  'baz-age': 'qux',
  [1 + 2]: {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    ...qlom,
  },
  [3 + 4]: 5,
}
`

export const find = `{foo: 'bar', 'baz-age': $baz, ...$_qux, [$a + $b]: {a: 1, b: 2, ...$$inner}}`

export const expectedFind = [
  {
    node: `x = /**/{
  foo: 'bar',
  'baz-age': 'qux',
  [1 + 2]: {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    ...qlom,
  },
  ...$qux,
}`,
    captures: { $baz: "'qux'", $a: '1', $b: '2' },
    arrayCaptures: {
      $$inner: ['x = {/**/c: 3}', 'x = {/**/d: 4}', 'x = {/**/...qlom}'],
    },
  },
]
