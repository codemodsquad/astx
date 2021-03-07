export const input = `
function foo(w, x, y, z) {}
function bar(a, b, c) {}
`

export const find = `function foo($a, $_b, z) {}`

export const expectedFind = [
  {
    node: 'function foo(w, x, y, z) {}',
    captures: {
      $a: 'w',
    },
    arrayCaptures: {
      $_b: ['x', 'y'],
    },
  },
]
