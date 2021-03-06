export const input = `
foo(1, 1, {foo: 1}, {foo: 1})
foo(1, 2, {foo: 1}, {foo: 1})
foo(1, 1, {foo: 1}, {bar: 1})
`

export const find = `foo($a, $a, $b, $b)`

export const expected = [
  {
    node: 'foo(1, 1, {foo: 1}, {foo: 1})',
    captures: { $a: '1', $b: '{foo: 1}' },
  },
]
